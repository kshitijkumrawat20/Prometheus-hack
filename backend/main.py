import os
import uuid
import logging
from contextlib import asynccontextmanager
from typing import List, Optional

from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, Depends, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import delete

from db import engine, Base, get_db
from models import User, Concept, ConceptEdge, MasteryState, Question, Attempt
from bkt import update_mastery, get_mastery_level, BKTParams
from selector import select_next_concept, next_action, MASTERED_THRESHOLD
from question_gen import generate_question, evaluate_answer
from lesson_gen import generate_lesson
from notes_gen import generate_lesson_notes, generate_level_notes
from graph_builder import build_concept_graph
from auth import hash_password, verify_password, generate_session_token

logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    await engine.dispose()

app = FastAPI(title="MasteryMap Backend", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request Models
class RegisterReq(BaseModel):
    username: str
    email: str
    password: str

class LoginReq(BaseModel):
    username: str
    password: str

class SyllabusUploadReq(BaseModel):
    text: str
    student_id: Optional[str] = "default"

class AnswerReq(BaseModel):
    question_id: str
    student_id: str
    answer: str

class StageAdvanceReq(BaseModel):
    student_id: str
    concept_id: str

# Helper to resolve user session
async def get_current_user_from_token(authorization: Optional[str] = Header(None), db: AsyncSession = Depends(get_db)) -> Optional[User]:
    if not authorization:
        return None
    token = authorization.replace("Bearer ", "").strip()
    result = await db.execute(select(User).where(User.session_token == token))
    return result.scalars().first()

# --- AUTH ENDPOINTS ---

@app.post("/api/auth/register")
async def register_user(req: RegisterReq, db: AsyncSession = Depends(get_db)):
    """Registers a new student user."""
    if len(req.username) < 3:
        raise HTTPException(status_code=400, detail="Username must be at least 3 characters")
    if len(req.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
        
    # Check existing username/email
    existing_user = await db.execute(select(User).where((User.username == req.username) | (User.email == req.email)))
    if existing_user.scalars().first():
        raise HTTPException(status_code=400, detail="Username or email already exists")
        
    token = generate_session_token()
    user = User(
        username=req.username,
        email=req.email,
        hashed_password=hash_password(req.password),
        session_token=token
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    
    return {
        "user_id": user.id,
        "username": user.username,
        "email": user.email,
        "token": token
    }

@app.post("/api/auth/login")
async def login_user(req: LoginReq, db: AsyncSession = Depends(get_db)):
    """Authenticates a user and returns session token."""
    result = await db.execute(select(User).where((User.username == req.username) | (User.email == req.username)))
    user = result.scalars().first()
    
    if not user or not verify_password(user.hashed_password, req.password):
        raise HTTPException(status_code=401, detail="Invalid username/email or password")
        
    token = generate_session_token()
    user.session_token = token
    db.add(user)
    await db.commit()
    
    return {
        "user_id": user.id,
        "username": user.username,
        "email": user.email,
        "token": token
    }

@app.get("/api/auth/me")
async def get_me(user: Optional[User] = Depends(get_current_user_from_token)):
    """Returns profile info for currently logged-in session user."""
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return {
        "user_id": user.id,
        "username": user.username,
        "email": user.email
    }

@app.post("/api/auth/logout")
async def logout_user(user: Optional[User] = Depends(get_current_user_from_token), db: AsyncSession = Depends(get_db)):
    """Logs out session user."""
    if user:
        user.session_token = None
        db.add(user)
        await db.commit()
    return {"message": "Logged out successfully"}

# --- APPLICATION ENDPOINTS ---

@app.post("/api/syllabus/upload")
async def upload_syllabus(req: SyllabusUploadReq, db: AsyncSession = Depends(get_db)):
    """Upload a syllabus to generate a concept graph."""
    if not req.text or not req.text.strip():
        raise HTTPException(status_code=400, detail="No syllabus text provided")
        
    graph_id = str(uuid.uuid4())
    student_id = req.student_id or "default"
    
    try:
        graph = build_concept_graph(req.text, graph_id)
    except Exception as e:
        logger.error(f"Error building graph: {e}")
        raise HTTPException(status_code=500, detail="Failed to build concept graph")
        
    # Clear existing session data for clean syllabus replacement
    await db.execute(delete(Attempt).where(Attempt.student_id == student_id))
    await db.execute(delete(MasteryState).where(MasteryState.student_id == student_id))
    await db.execute(delete(Question))
    await db.execute(delete(ConceptEdge))
    await db.execute(delete(Concept))
    await db.commit()

    # Save concepts and edges
    for c in graph["concepts"]:
        concept = Concept(
            id=c["id"],
            label=c["label"],
            description=c.get("description", ""),
            graph_id=graph_id
        )
        db.add(concept)
        
    for e in graph["edges"]:
        edge = ConceptEdge(
            source_id=e["source"],
            target_id=e["target"],
            graph_id=graph_id
        )
        db.add(edge)
        
    await db.commit()
    
    # Initialize mastery states for student for these concepts
    for c in graph["concepts"]:
        mastery = MasteryState(
            concept_id=c["id"],
            student_id=student_id,
            p_mastery=0.3,
            stage="UNSEEN"
        )
        db.add(mastery)
        
    await db.commit()
    
    return {"graph_id": graph_id, "graph": graph}

@app.get("/api/graph/{student_id}")
async def get_graph(student_id: str, db: AsyncSession = Depends(get_db)):
    """Get the full concept graph and mastery states + stages for a student."""
    concepts_result = await db.execute(select(Concept))
    concepts = concepts_result.scalars().all()
    
    if not concepts:
        return {"concepts": [], "edges": [], "mastery": {}, "stages": {}}
        
    edges_result = await db.execute(select(ConceptEdge))
    edges = edges_result.scalars().all()
    
    mastery_result = await db.execute(select(MasteryState).where(MasteryState.student_id == student_id))
    mastery_states = mastery_result.scalars().all()
    
    concept_list = [{"id": c.id, "label": c.label, "description": c.description} for c in concepts]
    edge_list = [{"source": e.source_id, "target": e.target_id} for e in edges]
    mastery_dict = {m.concept_id: m.p_mastery for m in mastery_states}
    stage_dict = {m.concept_id: m.stage for m in mastery_states}
    
    return {
        "concepts": concept_list,
        "edges": edge_list,
        "mastery": mastery_dict,
        "stages": stage_dict
    }

@app.get("/api/next-action/{student_id}")
async def get_next_action(student_id: str, db: AsyncSession = Depends(get_db)):
    """Determines the next learning action (TEACH, GUIDED_QUESTION, or QUESTION)."""
    concepts_result = await db.execute(select(Concept))
    concepts = [{"id": c.id, "label": c.label, "description": c.description} for c in concepts_result.scalars().all()]
    
    edges_result = await db.execute(select(ConceptEdge))
    edges = [{"source": e.source_id, "target": e.target_id} for e in edges_result.scalars().all()]
    
    mastery_result = await db.execute(select(MasteryState).where(MasteryState.student_id == student_id))
    mastery_states = {
        m.concept_id: {
            "p_mastery": m.p_mastery,
            "stage": m.stage,
            "attempts": m.attempts,
            "incorrect_streak": m.incorrect_streak or 0,
            "last_error_type": m.last_error_type
        }
        for m in mastery_result.scalars().all()
    }
    
    action_info = next_action(concepts, edges, mastery_states)
    if action_info.get("complete"):
        return action_info

    cid = action_info["concept_id"]
    target_concept = next(c for c in concepts if c["id"] == cid)
    
    if action_info["action"] == "TEACH":
        m_state = await db.execute(select(MasteryState).where(
            MasteryState.concept_id == cid,
            MasteryState.student_id == student_id
        ))
        ms = m_state.scalars().first()
        if ms and ms.stage == "UNSEEN":
            ms.stage = "LEARNING"
            db.add(ms)
            await db.commit()
            
    if action_info["action"] == "TEACH":
        prereqs = [e["source"] for e in edges if e["target"] == cid]
        prereq_labels = [c["label"] for c in concepts if c["id"] in prereqs]
        lesson_data = generate_lesson(target_concept, prereq_labels, action_info.get("last_error_type"))
        return {
            "action": "TEACH",
            "concept_id": cid,
            "concept_label": target_concept["label"],
            "lesson": lesson_data
        }
    else:
        is_guided = (action_info["action"] == "GUIDED_QUESTION")
        mastery_prob = mastery_states.get(cid, {}).get("p_mastery", 0.3)
        mastery_lvl = get_mastery_level(mastery_prob)
        related = [e["source"] for e in edges if e["target"] == cid] + [e["target"] for e in edges if e["source"] == cid]
        
        q_data = generate_question(target_concept, mastery_lvl, related, guided=is_guided)
        q = Question(
            concept_id=cid,
            prompt=q_data["question"],
            correct_answer=q_data["correct_answer"],
            explanation=q_data.get("explanation", ""),
            hint=q_data.get("hint", "")
        )
        db.add(q)
        await db.commit()
        await db.refresh(q)
        
        return {
            "action": action_info["action"],
            "question_id": q.id,
            "concept_id": cid,
            "concept_label": target_concept["label"],
            "prompt": q.prompt,
            "hint": q.hint,
            "guided": is_guided
        }

@app.post("/api/lesson/advance")
async def advance_lesson_stage(req: StageAdvanceReq, db: AsyncSession = Depends(get_db)):
    """Advances stage from LEARNING -> GUIDED_PRACTICE after student finishes viewing lesson."""
    m_result = await db.execute(select(MasteryState).where(
        MasteryState.concept_id == req.concept_id,
        MasteryState.student_id == req.student_id
    ))
    ms = m_result.scalars().first()
    if ms:
        ms.stage = "GUIDED_PRACTICE"
        db.add(ms)
        await db.commit()
        return {"status": "success", "new_stage": ms.stage}
    raise HTTPException(status_code=404, detail="Mastery state not found")

class LevelNotesReq(BaseModel):
    level_name: str
    concept_ids: List[str]

@app.get("/api/notes/{concept_id}")
async def get_concept_notes(concept_id: str, db: AsyncSession = Depends(get_db)):
    """Generates slide-by-slide study notes with Imagen AI illustrations for a concept."""
    concept_result = await db.execute(select(Concept).where(Concept.id == concept_id))
    concept = concept_result.scalars().first()
    if not concept:
        raise HTTPException(status_code=404, detail="Concept not found")
        
    edges_result = await db.execute(select(ConceptEdge).where(ConceptEdge.target_id == concept_id))
    prereq_ids = [e.source_id for e in edges_result.scalars().all()]
    
    prereq_labels = []
    if prereq_ids:
        p_result = await db.execute(select(Concept).where(Concept.id.in_(prereq_ids)))
        prereq_labels = [p.label for p in p_result.scalars().all()]
        
    concept_dict = {"id": concept.id, "label": concept.label, "description": concept.description}
    try:
        notes = generate_lesson_notes(concept_dict, prereq_labels)
        return notes
    except Exception as e:
        logger.error(f"Error generating notes: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate slide notes")

@app.post("/api/notes/level")
async def get_level_notes(req: LevelNotesReq, db: AsyncSession = Depends(get_db)):
    """Generates level-by-level study slide deck covering all concepts in a tier."""
    if not req.concept_ids:
        raise HTTPException(status_code=400, detail="No concept IDs provided for level")
        
    concepts_result = await db.execute(select(Concept).where(Concept.id.in_(req.concept_ids)))
    concepts = concepts_result.scalars().all()
    if not concepts:
        raise HTTPException(status_code=404, detail="No matching concepts found")
        
    concept_dicts = [{"id": c.id, "label": c.label, "description": c.description} for c in concepts]
    try:
        notes = generate_level_notes(req.level_name, concept_dicts)
        return notes
    except Exception as e:
        logger.error(f"Error generating level notes: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate level slide notes")



@app.post("/api/answer")
async def submit_answer(req: AnswerReq, db: AsyncSession = Depends(get_db)):
    """Evaluate answer, update BKT, classify misconceptions, and transition stage."""
    q_result = await db.execute(select(Question).where(Question.id == req.question_id))
    q = q_result.scalars().first()
    if not q:
        raise HTTPException(status_code=404, detail="Question not found")
        
    try:
        eval_res = evaluate_answer(q.prompt, q.correct_answer, req.answer)
    except Exception as e:
        logger.error(f"Error evaluating answer: {e}")
        raise HTTPException(status_code=500, detail="Failed to evaluate answer")
        
    is_correct = eval_res.get("correct", False)
    error_type = eval_res.get("error_type") if not is_correct else None
    
    m_result = await db.execute(select(MasteryState).where(
        MasteryState.concept_id == q.concept_id,
        MasteryState.student_id == req.student_id
    ))
    ms = m_result.scalars().first()
    
    if not ms:
        ms = MasteryState(concept_id=q.concept_id, student_id=req.student_id, p_mastery=0.3, stage="GUIDED_PRACTICE")
        db.add(ms)
        
    new_mastery = update_mastery(ms.p_mastery, is_correct)
    ms.p_mastery = new_mastery
    ms.attempts += 1
    
    if is_correct:
        ms.correct_count += 1
        ms.incorrect_streak = 0
        ms.last_error_type = None
        
        if ms.stage == "GUIDED_PRACTICE":
            ms.stage = "INDEPENDENT_PRACTICE"
        elif new_mastery >= MASTERED_THRESHOLD:
            ms.stage = "MASTERED"
    else:
        ms.incorrect_streak = (ms.incorrect_streak or 0) + 1
        ms.last_error_type = error_type
        
        if ms.stage == "INDEPENDENT_PRACTICE" and ms.incorrect_streak >= 2 and error_type == "conceptual_gap":
            ms.stage = "LEARNING"
        elif ms.stage == "GUIDED_PRACTICE" and ms.attempts >= 2:
            ms.stage = "INDEPENDENT_PRACTICE"
            
    db.add(ms)
    
    attempt = Attempt(
        question_id=req.question_id,
        student_id=req.student_id,
        correct=is_correct,
        error_type=error_type
    )
    db.add(attempt)
    await db.commit()
    
    return {
        "correct": is_correct,
        "explanation": eval_res.get("explanation", ""),
        "feedback": eval_res.get("feedback", ""),
        "error_type": error_type,
        "new_mastery": new_mastery,
        "new_stage": ms.stage,
        "concept_id": q.concept_id
    }

@app.get("/api/student/{student_id}/summary")
async def student_summary(student_id: str, db: AsyncSession = Depends(get_db)):
    """Provide summary of student's mastery and learning stages."""
    mastery_result = await db.execute(select(MasteryState).where(MasteryState.student_id == student_id))
    mastery_states = mastery_result.scalars().all()
    
    if not mastery_states:
        return {"total_concepts": 0, "mastered_count": 0, "average_mastery": 0.0}
        
    total = len(mastery_states)
    mastered = sum(1 for m in mastery_states if m.stage == "MASTERED" or m.p_mastery >= MASTERED_THRESHOLD)
    avg = sum(m.p_mastery for m in mastery_states) / total
    
    weakest = sorted(mastery_states, key=lambda m: m.p_mastery)[:3]
    weakest_ids = [m.concept_id for m in weakest]
    
    return {
        "total_concepts": total,
        "mastered_count": mastered,
        "average_mastery": avg,
        "weakest_concepts": weakest_ids
    }

# MasteryMap Patch — The Teaching Layer
### Turning the practice engine into an actual tutor

## 1. The Problem, Stated Plainly

Current loop: `weakest node → question → answer → BKT update → next question`.

That's a diagnostic engine. A student encountering a brand-new concept gets **quizzed on it before ever being taught it** — the explanation only appears *after* they get it wrong. That's remediation, not instruction. A judge scoring "Educational Impact" will notice this within 30 seconds of using it.

**Fix:** insert a real teach step before assessment, per concept, and make the graph visually reflect *where a student is in the learning process* — not just how much they know.

---

## 2. New Per-Concept Learning Loop

Replace the single "mastery %" state with a **stage**, one of:

```
UNSEEN → LEARNING → GUIDED_PRACTICE → INDEPENDENT_PRACTICE → MASTERED
```

| Stage | What happens | Who's in control |
|---|---|---|
| `UNSEEN` | Node exists in the graph but hasn't been introduced yet | — |
| `LEARNING` | Claude delivers a short micro-lesson: plain explanation + one worked example | System teaches |
| `GUIDED_PRACTICE` | Student attempts a question **with a hint/scaffold visible** (e.g. the worked example stays on screen, or the question is broken into sub-steps) | Shared |
| `INDEPENDENT_PRACTICE` | Student attempts questions cold, no scaffold — this is where BKT starts accumulating real evidence | Student |
| `MASTERED` | BKT crosses mastery threshold (e.g. p ≥ 0.8) after enough independent attempts | — |

**Transition rules:**
- `UNSEEN → LEARNING`: automatic, the first time the selector picks this node
- `LEARNING → GUIDED_PRACTICE`: automatic, right after the lesson is shown (no gate — everyone gets at least one scaffolded rep)
- `GUIDED_PRACTICE → INDEPENDENT_PRACTICE`: after 1–2 guided attempts, regardless of correctness (the scaffold's job is exposure, not gatekeeping)
- `INDEPENDENT_PRACTICE → back to LEARNING`: if the student gets 2 independent attempts wrong in a row **and** the misconception classifier (see Section 4) flags a conceptual gap, not a slip — this is the "re-teach" branch that makes the loop feel adaptive rather than punitive
- `INDEPENDENT_PRACTICE → MASTERED`: when BKT p_mastery crosses threshold

This is a small state machine, not a new subsystem — cheap to add on top of what you have.

---

## 3. What Changes in Each Layer

### Data model — add one field
```python
class MasteryState(Base):
    concept_id: str
    student_id: str
    p_mastery: float
    attempts: int
    stage: str   # NEW: one of UNSEEN | LEARNING | GUIDED_PRACTICE | INDEPENDENT_PRACTICE | MASTERED
```

### New Claude call: `lesson_gen.py`
Given a concept + its prerequisites' mastery levels, generate:
```json
{
  "explanation": "plain-language explanation, 2-4 sentences",
  "worked_example": "one fully solved example with reasoning shown step by step",
  "analogy": "optional — a relatable comparison, especially useful if prerequisites show weak mastery"
}
```
Keep this short. A wall of text defeats the purpose — this is a micro-lesson, not a chapter.

### Updated `selector.py`
Instead of always returning "next question," it now returns an **action**:
```python
def next_action(student_id):
    concept = weakest_unlocked_concept(student_id)
    stage = get_stage(student_id, concept)
    if stage == "UNSEEN":
        return {"action": "TEACH", "concept": concept}
    elif stage in ("LEARNING", "GUIDED_PRACTICE"):
        return {"action": "GUIDED_QUESTION", "concept": concept}
    else:
        return {"action": "QUESTION", "concept": concept}
```

### New/updated API endpoints
| Method | Path | Purpose |
|---|---|---|
| GET | `/lesson/{student_id}` | Returns the micro-lesson for the next concept if stage is `UNSEEN` |
| GET | `/next-action/{student_id}` | Replaces `/next-question` — returns either a lesson or a question depending on stage |
| POST | `/answer` | Now also updates `stage`, not just `p_mastery` |

### Frontend — new `LessonPanel.jsx`
Shows the micro-lesson before the question panel appears. Simple: explanation text, worked example in a highlighted box, a "Got it, let's practice" button that triggers the transition to `GUIDED_PRACTICE`.

### Graph visualization — upgrade node color from binary to 5-stage
This is a free demo upgrade: instead of nodes just going from dim to bright, they now visibly move through a color progression (e.g. grey → blue → yellow → orange → green) as a student learns. This is a **much better visual story** for the 2-minute video than a single mastery-percentage gradient — judges can literally watch a concept get taught, practiced, then mastered.

---

## 4. Optional but High-Value Add-On: Misconception-Aware Re-teaching

This is what makes the `INDEPENDENT_PRACTICE → LEARNING` branch meaningful instead of arbitrary. When a student gets an independent question wrong, have Claude classify the error:

```json
{
  "error_type": "careless_slip" | "conceptual_gap" | "wrong_prerequisite",
  "reasoning": "one sentence on what went wrong"
}
```

- `careless_slip` → stay in `INDEPENDENT_PRACTICE`, just show the explanation
- `conceptual_gap` → drop back to `LEARNING`, and the next micro-lesson explicitly references *this specific* mistake ("Last time you mixed up X and Y — here's the distinction again")
- `wrong_prerequisite` → this is a graph signal: flag that the *prerequisite* node's mastery might be miscalibrated, not the current one

This single addition is what turns your BKT model from "off-the-shelf algorithm" into "algorithm that's actually responding to what the LLM understood about the student's mistake" — it's the single strongest technical-depth upgrade available to you for the effort involved.

---

## 5. Build Plan (scoped as a patch, not a rebuild)

You already have the hard parts (BKT, graph builder, question gen, viz). This is additive.

**Step 1 — Data + state machine (half day)**
- [ ] Add `stage` field to `MasteryState`, migrate existing data (default everything to `INDEPENDENT_PRACTICE` so old data doesn't break)
- [ ] Write `selector.py`'s `next_action()` function with unit tests for every stage transition

**Step 2 — Teaching content (half day)**
- [ ] `lesson_gen.py` — Claude call for micro-lessons, test on 3-4 concepts from your existing demo syllabus
- [ ] Misconception classifier call (Section 4) added to the `/answer` flow

**Step 3 — Frontend (half day)**
- [ ] `LessonPanel.jsx` component
- [ ] Update `GraphView.jsx` color scheme to 5 stages
- [ ] Wire `/next-action` to switch between showing `LessonPanel` vs `QuestionPanel`

**Step 4 — Re-test the full loop end to end (half day)**
- [ ] Fresh student, walk a concept through all 5 stages manually, confirm the graph visibly progresses through colors
- [ ] Confirm the re-teach branch actually triggers on a deliberately-wrong-twice test run

---

## 6. Updated Demo Script Beat (replaces 0:30–1:15 from the original script)

| Time | Content |
|---|---|
| 0:15–0:30 | Upload syllabus → graph appears, all nodes grey (unseen) |
| 0:30–0:45 | Click into a concept → micro-lesson appears (explanation + worked example) → node turns blue |
| 0:45–1:05 | Guided practice question with scaffold visible → node turns yellow |
| 1:05–1:25 | Independent question, answered wrong → **misconception classifier catches a real conceptual gap** → drops back to a targeted re-teach, not just "wrong, try again" |
| 1:25–1:40 | Same concept re-attempted, correct → node turns green (mastered) |
| 1:40–2:00 | Zoom out on full graph mid-progression, closing beat |

This sequence directly demonstrates "teaches, practices, re-teaches, assesses" in under 90 seconds — which is the strongest possible answer to a judge silently wondering "does this actually teach anything?"

---

## 7. One-Sentence Pitch Update

Old: *"MasteryMap tracks real mastery per concept and generates targeted practice."*
New: *"MasteryMap teaches each concept with a worked example, scaffolds practice, and re-teaches with a targeted explanation the moment it detects a real conceptual gap — not just a wrong answer."*

That one sentence is the difference between "quiz app with a nice graph" and "adaptive tutor" in a judge's mind.
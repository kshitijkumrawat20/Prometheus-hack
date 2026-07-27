from uuid import uuid4
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, Boolean, ForeignKey, DateTime
from db import Base

class User(Base):
    __tablename__ = 'users'
    id = Column(String, primary_key=True, default=lambda: str(uuid4()))
    username = Column(String, unique=True, nullable=False)
    email = Column(String, unique=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    session_token = Column(String, unique=True, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Concept(Base):
    __tablename__ = 'concepts'
    id = Column(String, primary_key=True)          # e.g. "algebra.linear_equations"
    label = Column(String, nullable=False)          # "Linear Equations"
    description = Column(String, default='')        # Brief description of the concept
    graph_id = Column(String, nullable=False)       # Which graph this belongs to

class ConceptEdge(Base):
    __tablename__ = 'concept_edges'
    id = Column(Integer, primary_key=True, autoincrement=True)
    source_id = Column(String, ForeignKey('concepts.id'))  # prerequisite
    target_id = Column(String, ForeignKey('concepts.id'))  # dependent concept
    graph_id = Column(String, nullable=False)

class MasteryState(Base):
    __tablename__ = 'mastery_states'
    id = Column(Integer, primary_key=True, autoincrement=True)
    concept_id = Column(String, ForeignKey('concepts.id'))
    student_id = Column(String, default='default')
    p_mastery = Column(Float, default=0.3)       # BKT probability of mastery
    attempts = Column(Integer, default=0)
    correct_count = Column(Integer, default=0)
    incorrect_streak = Column(Integer, default=0) # Consecutive wrong attempts
    # Stage: UNSEEN | LEARNING | GUIDED_PRACTICE | INDEPENDENT_PRACTICE | MASTERED
    stage = Column(String, default='UNSEEN')
    last_error_type = Column(String, nullable=True)

class Question(Base):
    __tablename__ = 'questions'
    id = Column(String, primary_key=True, default=lambda: str(uuid4()))
    concept_id = Column(String, ForeignKey('concepts.id'))
    prompt = Column(String, nullable=False)
    correct_answer = Column(String, nullable=False)
    explanation = Column(String, default='')
    hint = Column(String, default='')
    difficulty = Column(Float, default=0.5)

class Attempt(Base):
    __tablename__ = 'attempts'
    id = Column(String, primary_key=True, default=lambda: str(uuid4()))
    question_id = Column(String, ForeignKey('questions.id'))
    student_id = Column(String, default='default')
    correct = Column(Boolean)
    error_type = Column(String, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

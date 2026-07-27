# MasteryMap — Architecture

## System Overview

MasteryMap is an adaptive learning platform that combines two AI components:

1. **Bayesian Knowledge Tracing (BKT)** — A real statistical model (not a prompt) that tracks the probability of student mastery per concept using Bayesian inference.
2. **Claude LLM** — Used for syllabus parsing, question generation, and answer evaluation.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Frontend (React + Vite)                      │
│                                                                       │
│  ┌──────────────┐  ┌──────────────────┐  ┌────────────────────┐      │
│  │ SyllabusUpload│  │   GraphView      │  │  QuestionPanel     │      │
│  │ (landing)     │  │ (force-directed) │  │  (Q&A interaction) │      │
│  └──────┬───────┘  └──────┬───────────┘  └──────┬─────────────┘      │
│         │                  │                      │                    │
│         └──────────────────┴──────────────────────┘                    │
│                            │ API calls                                 │
└────────────────────────────┼───────────────────────────────────────────┘
                             │
┌────────────────────────────┼───────────────────────────────────────────┐
│                    Backend (FastAPI)           │                        │
│                            │                                           │
│  ┌─────────────────────────▼──────────────────────────┐               │
│  │              API Endpoints (main.py)                │               │
│  │  POST /syllabus/upload  GET /graph/{id}             │               │
│  │  GET /next-question/{id}  POST /answer              │               │
│  │  GET /student/{id}/summary                          │               │
│  └───────┬───────────┬──────────────┬─────────────────┘               │
│          │           │              │                                  │
│  ┌───────▼──────┐ ┌──▼──────────┐ ┌▼────────────────┐                │
│  │graph_builder │ │ selector.py │ │ question_gen.py  │                │
│  │  (Claude)    │ │ (algorithm) │ │   (Claude)       │                │
│  └──────────────┘ └──────┬──────┘ └─────────────────┘                │
│                          │                                            │
│                   ┌──────▼──────┐                                     │
│                   │   bkt.py    │                                      │
│                   │  (Bayesian  │                                      │
│                   │  Knowledge  │                                      │
│                   │  Tracing)   │                                      │
│                   └──────┬──────┘                                     │
│                          │                                            │
│                   ┌──────▼──────┐                                     │
│                   │  SQLite DB  │                                      │
│                   │ (SQLAlchemy)│                                      │
│                   └─────────────┘                                     │
└───────────────────────────────────────────────────────────────────────┘
```

## Bayesian Knowledge Tracing (BKT)

The BKT model is the algorithmic heart of MasteryMap. It's a Hidden Markov Model with 4 parameters per concept:

- **p_init (0.3)**: Prior probability the student already knows the concept
- **p_transit (0.15)**: Probability of learning after one practice attempt
- **p_slip (0.1)**: Probability a knowledgeable student answers wrong (careless error)
- **p_guess (0.2)**: Probability an unknowing student answers correctly (lucky guess)

### Update Rule

On observing whether answer is correct (`c`):

```
P(correct | knows) = 1 - p_slip
P(correct | ¬knows) = p_guess

If correct:
  P(knows | correct) = P(knows) × P(correct|knows) / P(correct)

If incorrect:  
  P(knows | incorrect) = P(knows) × p_slip / P(incorrect)

Then apply learning transition:
  P(knows_new) = P(knows_post) + (1 - P(knows_post)) × p_transit
```

This gives us a **real probability of mastery** per concept that updates after every student interaction — fundamentally different from just asking an LLM "how well does this student know X?"

## Weakest-Node Selection

The selector algorithm ensures optimal learning progression:

1. A concept is **unlocked** if all its prerequisites have mastery ≥ 0.6
2. A concept is **mastered** if its mastery ≥ 0.85
3. Among unlocked, unmastered concepts, select the one with **lowest mastery**
4. If all concepts are mastered, the student is done!

This creates a natural curriculum: fundamentals before advanced topics, always targeting the weakest accessible area.

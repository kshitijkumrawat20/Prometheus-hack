# MasteryMap — API Reference

## Base URL

```
http://localhost:8000/api
```

## Endpoints

### POST `/syllabus/upload`

Upload a syllabus to generate a concept knowledge graph.

**Request Body:**
```json
{
  "text": "Module 1: Linear Equations\n- Variables and expressions\n- Solving one-step equations\n..."
}
```

**Response (200):**
```json
{
  "graph_id": "550e8400-e29b-41d4-a716-446655440000",
  "graph": {
    "concepts": [
      {
        "id": "algebra.variables_expressions",
        "label": "Variables and Expressions",
        "description": "Understanding algebraic variables and how to form expressions"
      }
    ],
    "edges": [
      {
        "source": "algebra.variables_expressions",
        "target": "algebra.one_step_equations"
      }
    ]
  }
}
```

---

### GET `/graph/{student_id}`

Get the full concept graph with current mastery states.

**Parameters:**
- `student_id` (path) — Student identifier (use `"default"` for demo)

**Response (200):**
```json
{
  "concepts": [
    {"id": "algebra.variables_expressions", "label": "Variables and Expressions", "description": "..."}
  ],
  "edges": [
    {"source": "algebra.variables_expressions", "target": "algebra.one_step_equations"}
  ],
  "mastery": {
    "algebra.variables_expressions": 0.72,
    "algebra.one_step_equations": 0.45
  }
}
```

---

### GET `/next-question/{student_id}`

Select the weakest unlocked concept and generate a question.

**Parameters:**
- `student_id` (path) — Student identifier

**Response (200) — Question available:**
```json
{
  "question_id": "q-abc123",
  "concept_id": "algebra.one_step_equations",
  "concept_label": "One-Step Equations",
  "prompt": "Solve for x: 3x + 7 = 22"
}
```

**Response (200) — All mastered:**
```json
{
  "complete": true,
  "message": "All concepts have been mastered!"
}
```

---

### POST `/answer`

Submit an answer, get evaluation and updated mastery.

**Request Body:**
```json
{
  "question_id": "q-abc123",
  "student_id": "default",
  "answer": "x = 5"
}
```

**Response (200):**
```json
{
  "correct": true,
  "explanation": "Correct! Subtracting 7 from both sides gives 3x = 15, then dividing by 3 gives x = 5.",
  "feedback": "Great work! You're getting the hang of solving linear equations.",
  "new_mastery": 0.68,
  "concept_id": "algebra.one_step_equations"
}
```

---

### GET `/student/{student_id}/summary`

Get overall mastery summary for a student.

**Parameters:**
- `student_id` (path) — Student identifier

**Response (200):**
```json
{
  "total_concepts": 15,
  "mastered_count": 8,
  "average_mastery": 0.62,
  "weakest_concepts": [
    "algebra.quadratic_formula",
    "algebra.factoring_quadratics",
    "algebra.systems_elimination"
  ]
}
```

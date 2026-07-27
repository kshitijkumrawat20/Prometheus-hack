# MasteryMap — Adaptive Knowledge-Graph Tutor

**MasteryMap** turns any syllabus or textbook chapter into a living knowledge graph. As a student answers questions, a Bayesian Knowledge Tracing model updates real mastery estimates per concept — not vibes — and Claude generates the next question targeted at the weakest prerequisite node. The student watches their own understanding light up the graph in real time.

## 🚀 Quick Start

### Prerequisites
- **Python 3.12+** and [UV](https://docs.astral.sh/uv/) (Python package manager)
- **Node.js 18+** and npm
- **Gemini API Key** ([Get one here](https://aistudio.google.com/apikey))

### Setup

```bash
# Clone the repo
git clone https://github.com/your-team/masterymap.git
cd masterymap
```

#### Backend
```bash
cd backend

# Copy env file and add your API key
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY

# Install dependencies with UV
uv sync

# Run the server
uv run uvicorn main:app --reload --port 8000
```

#### Frontend
```bash
cd frontend

# Install dependencies
npm install

# Start dev server (proxies /api to backend)
npm run dev
```

Open **http://localhost:5173** in your browser.

## 🎯 How It Works

1. **Upload a syllabus** — paste any topic outline or course syllabus
2. **Graph generated** — Claude parses concepts and prerequisite relationships into a knowledge graph
3. **Answer questions** — Claude generates targeted questions for your weakest unlocked concept
4. **Watch mastery grow** — BKT updates mastery probabilities in real-time, and the graph lights up as you learn
5. **Adaptive progression** — prerequisites must be mastered before advanced topics unlock

## 🧠 Tech Stack

| Layer | Technology |
|---|---|
| Backend | FastAPI (Python) |
| Mastery Model | Bayesian Knowledge Tracing (numpy) |
| LLM | Gemini API (gemini-2.5-flash) |
| Frontend | React + Vite + Tailwind CSS v4 |
| Graph Viz | react-force-graph-2d |
| Database | SQLite (via SQLAlchemy async) |
| Package Mgr | UV (Python), npm (JS) |

## 📐 Architecture

```
Syllabus Upload → Gemini parses → Concept Graph (DB)
                                       ↓
Student Answer → BKT Update → Weakest Node Selector → Gemini generates Question
                                       ↓
                              Graph Visualization (real-time mastery colors)
```

## 📁 Project Structure

```
masterymap/
├── backend/
│   ├── main.py              # FastAPI app + endpoints
│   ├── models.py            # SQLAlchemy models
│   ├── bkt.py               # Bayesian Knowledge Tracing engine
│   ├── graph_builder.py     # Gemini: syllabus → concept graph
│   ├── question_gen.py      # Gemini: concept → question + evaluation
│   ├── selector.py          # Weakest-unlocked-node selector
│   ├── db.py                # Async SQLAlchemy config
│   └── tests/               # Unit tests for BKT and selector
├── frontend/
│   ├── src/
│   │   ├── App.jsx          # Main app with state management
│   │   ├── api.js           # Backend API client
│   │   └── components/
│   │       ├── GraphView.jsx      # Force-directed graph visualization
│   │       ├── QuestionPanel.jsx  # Question display + answer input
│   │       ├── MasteryBar.jsx     # Overall progress bar
│   │       ├── SyllabusUpload.jsx # Landing page + syllabus input
│   │       └── StudentSummary.jsx # Detailed mastery report
│   └── package.json
├── docs/
│   ├── ARCHITECTURE.md
│   └── API.md
└── README.md
```

## 🧪 Running Tests

```bash
cd backend
uv run pytest tests/ -v
```

## 📄 License

MIT

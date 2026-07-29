# MasteryMap — Adaptive AI Knowledge-Graph & Visual Learning Deck Platform 🚀

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg?style=flat&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.12%2B-3776AB.svg?style=flat&logo=python)](https://www.python.org/)
[![React](https://img.shields.io/badge/Frontend-React%2019-61DAFB.svg?style=flat&logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Bundler-Vite%208-646CFF.svg?style=flat&logo=vite)](https://vitejs.dev/)
[![Gemini 3.1](https://img.shields.io/badge/AI%20Model-Gemini%203.1%20Flash-4285F4.svg?style=flat&logo=google)](https://ai.google.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**MasteryMap** transforms any course syllabus or textbook outline into a living, interactive AI knowledge graph and visual presentation deck platform. Powered by **Bayesian Knowledge Tracing (BKT)**, direct **Gemini 3.1 Flash REST APIs**, and custom 16:9 presentation slide generators, MasteryMap guides students through a 5-stage mastery pipeline tailored to their unique pace.

---

## 🔥 Key Features

### 1. 🖼️ Visual 16:9 AI Presentation Decks & PDF Exports
- **Slide Deck Generation**: Synthesizes 16:9 visual presentation slide cards for any concept or level using direct REST endpoints (`models/gemini-3.1-flash-lite-image` and `models/gemini-3.1-flash-image`).
- **1-Slide-per-Page Landscape PDF Export**: Dedicated `@media print` layout engine rendering **EXACTLY 1 16:9 slide per page in landscape mode** with zero UI clutter.
- **⚡ SQLite Database Persistence**: Caches synthesized slide decks in `masterymap.db` (`GeneratedNote` model) for instant sub-millisecond return without redundant Gemini API calls.

### 2. 🎴 Interactive 3D Flashcard Mode
- **3-Way View Switcher**: Toggle between `🖥️ Widescreen Slideshow`, `🎴 3D Flashcards`, and `📊 Storyboard Grid`.
- **CSS 3D Card Flip**: Self-test prompt on the front (`perspective-1000`) smoothly flips (`rotateY(180deg)`) to reveal key definitions, formulas, and derivations on the back.

### 3. 🧠 Interactive Mind Map Graph Switcher
- **Dual Roadmap Views**: Switch seamlessly between:
  - `📋 Sequential Level List`: Topological tier-grouped list view.
  - `🗺️ Mind Map Canvas`: Interactive D3 force-directed radial tree with glowing mastery halos, edge links, recenter zoom controls, and active node focus drawer.

### 4. 🔍 Zoomable Image Lightbox Inspector
- Pop-up inspector modal with scale controls (`-`, `+`, `Reset 100%`) and **1-click individual slide image downloads**.

### 5. 🎯 Adaptive 5-Stage Learning Engine
- **Prerequisite DAG Roadmap**: Orders concepts topologically so prerequisites must be mastered before advanced topics unlock.
- **5-Stage Pedagogy**: `Unseen` → `Teach` → `Guided Practice` → `Independent Practice` → `Mastered`.
- **Bayesian Knowledge Tracing (BKT)**: Updates real-time student mastery probability \(P(L)\) based on slip/guess factors.

### 6. 📱 Responsive & Robust UI
- **React `createPortal` Architecture**: Mounts modal overlays directly to `document.body` above all header bars and navigation layers.
- **Dynamic Header Layout**: Auto-truncating email pill and responsive study streak header for perfect presentation across all Chrome zoom levels.

---

## 🛠️ Quick Start

### Prerequisites
- **Python 3.12+** and [uv](https://docs.astral.sh/uv/) (Fast Python package runner)
- **Node.js 18+** and `npm`
- **Gemini API Key** ([Get one from Google AI Studio](https://aistudio.google.com/apikey))

---

### Installation & Local Setup

```bash
# 1. Clone the Monorepo
git clone https://github.com/kshitijkumrawat20/Prometheus-hack.git
cd Prometheus-hack
```

#### Backend Setup

```bash
cd backend

# Create .env and add your Gemini API key
echo GEMINI_API_KEY=your_gemini_api_key_here > .env

# Install dependencies using uv
uv sync

# Start FastAPI dev server on port 8000
uv run uvicorn main:app --reload --port 8000
```

#### Frontend Setup

```bash
cd ../frontend

# Install Node dependencies
npm install

# Launch Vite development server
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## 🧠 Tech Stack

| Layer | Technology / Library |
|---|---|
| **Backend Framework** | FastAPI (Python 3.12 / 3.14) |
| **Package Manager** | `uv` (Fast Python dependency manager) |
| **AI Models** | Gemini 3.1 (`models/gemini-3.1-flash-lite-image`, `models/gemini-3.1-flash-image`, `gemini-2.5-flash`) |
| **Database** | SQLite via SQLAlchemy async (`aiosqlite`) |
| **Mastery Engine** | Bayesian Knowledge Tracing (BKT algorithm in NumPy/Python) |
| **Frontend Framework** | React 19 + Vite 8 |
| **Styling & UI** | Tailwind CSS v4 + Vanilla CSS 3D Transforms |
| **Modal Stacking** | React `createPortal` to `document.body` |
| **Graph Visualization**| D3.js Force Simulation Canvas |

---

## 📐 System Architecture

```
                                  +------------------------------------+
                                  |     Syllabus Input / Demo Course   |
                                  +------------------------------------+
                                                    |
                                                    v
                                  +------------------------------------+
                                  |   Gemini 3.1 Prerequisite DAG      |
                                  |   Concept Parsing & Level Builder  |
                                  +------------------------------------+
                                                    |
                                                    v
                                  +------------------------------------+
                                  |  SQLite DB (masterymap.db)         |
                                  |  - Concept Graphs & BKT Mastery    |
                                  |  - Cached AI Slide Notes (JSON)    |
                                  +------------------------------------+
                                         /                      \
                                        v                        v
                    +-----------------------+        +-----------------------+
                    | 5-Stage Adaptive AI   |        | 16:9 AI Presentation  |
                    | Tutor (BKT Engine)    |        | Decks & 3D Flashcards |
                    +-----------------------+        +-----------------------+
                                        \                        /
                                         v                      v
                                  +------------------------------------+
                                  | React 19 UI & D3 Mind Map Canvas   |
                                  | + Landscape PDF 1-Slide Export     |
                                  +------------------------------------+
```

---

## 📁 Project Structure

```
Prometheus/
├── backend/
│   ├── main.py              # FastAPI endpoints & route handlers
│   ├── models.py            # SQLAlchemy async DB models (Student, Graph, Note)
│   ├── bkt.py               # Bayesian Knowledge Tracing engine
│   ├── graph_builder.py     # Gemini syllabus DAG parser
│   ├── question_gen.py      # Gemini targeted question generation & evaluation
│   ├── notes_gen.py         # Direct REST call to Gemini 3.1 Flash image models
│   ├── selector.py          # Weakest unlocked prerequisite node selector
│   ├── auth.py              # Password hashing & session token authentication
│   ├── db.py                # Async SQLAlchemy database engine setup
│   └── tests/               # Pytest suite (16/16 unit tests)
├── frontend/
│   ├── src/
│   │   ├── App.jsx          # Main application router & header state
│   │   ├── api.js           # Axios backend API client
│   │   ├── components/
│   │   │   ├── NotesView.jsx            # 16:9 Slideshow, 3D Flashcards & PDF Export
│   │   │   ├── ImageLightboxModal.jsx   # Zoomable slide diagram inspector
│   │   │   ├── GraphView.jsx            # D3.js force radial mind map canvas
│   │   │   ├── QuestionPanel.jsx        # AI Tutor 5-stage lesson & question UI
│   │   │   ├── StreakHeaderBadge.jsx    # Gamified daily streak & mastery header
│   │   │   ├── SyllabusUpload.jsx       # Syllabus library & demo course presets
│   │   │   └── StudentSummary.jsx       # Comprehensive analytics dashboard
│   │   └── pages/
│   │       ├── LaunchPage.jsx           # Landing page & hero feature showcase
│   │       ├── RoadmapPage.jsx          # Dual-view course roadmap (List / Mind Map)
│   │       ├── TutorPage.jsx            # AI Tutor session page
│   │       └── AnalyticsPage.jsx        # BKT mastery analytics page
│   └── package.json
└── README.md
```

---

## 🧪 Running Tests

To run the complete backend test suite:

```bash
cd backend
uv run pytest tests/ -v
```

---

## 📄 License

This project is licensed under the **MIT License**.

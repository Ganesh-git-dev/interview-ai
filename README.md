# InterviewAI Pro

**PWNDORA InterviewAI — Voice-Enabled AI Mock Interview Agent**

[![Track](https://img.shields.io/badge/Track-T--02%20AICR-blue)]()
[![PS](https://img.shields.io/badge/PS-BSCDS26--AICR--01-green)]()
[![Status](https://img.shields.io/badge/Status-Submitted-brightgreen)]()

**Track:** T-02 AICR — AI Career Readiness & Mock Interview Hub  
**Problem Statement:** BSCDS26-AICR-01  
**Event:** BrewingSec CyberDev Summit 2026

---

## Overview

InterviewAI Pro is a voice-enabled AI mock interview agent that helps cybersecurity professionals prepare for technical interviews. It parses job descriptions, generates tailored interview questions, captures spoken answers, and provides detailed AI-powered feedback with personalized PWNDORA lab recommendations.

### Why InterviewAI Pro?

- **70%** of security professionals report interview anxiety as their biggest barrier
- Generic prep doesn't work for specialized roles (SOC, Pentest, DFIR)
- PWNDORA ecosystem lacked career preparation tools
- Text-only platforms can't simulate real interview pressure

---

## Features

- **JD Parser**: AI extracts role requirements, skills, certifications from any job description
- **AI Question Generator**: Generates 6-10 tailored questions (technical, scenario, behavioural, lab)
- **Voice Interview**: Answer using browser speech-to-text (Web Speech API)
- **Multi-Agent AI Evaluation**: Three specialized evaluators — Technical, Communication, STAR Coach
- **Analytics Dashboard**: Confidence meter, keyword coverage, domain scores, role readiness
- **PWNDORA Labs**: Personalized lab recommendations based on performance gaps
- **PDF Reports**: Professional downloadable feedback reports

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, Vite 5, Tailwind CSS 3, Framer Motion, Recharts, Zustand |
| **Backend** | Python 3.11+, FastAPI, SQLAlchemy, Pydantic |
| **AI** | Groq API (LLaMA 3.3 70B Versatile via llama-3.3-70b-versatile) |
| **Voice** | Web Speech API (browser-based, no external services) |
| **PDF** | ReportLab |
| **Database** | SQLite (development), PostgreSQL-ready |
| **Deployment** | Docker Compose |

---

## Quick Start

### Prerequisites

- Git
- Docker & Docker Compose (recommended)
- OR Node.js 18+ & Python 3.11+
- Groq API key ([get one free](https://console.groq.com/))

### With Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/Ganesh-git-dev/interview-ai.git
cd interview-ai

# Configure environment
cp .env.example .env
# Edit .env and add your GROQ_API_KEY

# Build and run
docker-compose up --build
```

Open [http://localhost:5173](http://localhost:5173)

### Without Docker

**Backend Setup:**
```bash
cd backend
python -m venv venv

# Windows:
venv\Scripts\activate
# Mac/Linux:
# source venv/bin/activate

pip install -r requirements.txt
cp ../.env.example .env  # Add your GROQ_API_KEY
uvicorn main:app --reload
```

**Frontend Setup:**
```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## Project Structure

```
interview-ai/
├── frontend/                  # React application
│   ├── src/
│   │   ├── pages/            # Route pages (6 pages)
│   │   ├── stores/           # Zustand state management
│   │   └── services/         # Axios API client
│   ├── Dockerfile
│   └── package.json
├── backend/                   # FastAPI application
│   ├── app/
│   │   ├── api/              # API routes (6 routers)
│   │   ├── models/           # SQLAlchemy models (6 tables)
│   │   ├── schemas/          # Pydantic schemas
│   │   ├── services/         # Business logic (6 services)
│   │   ├── prompts/          # AI prompt templates (7 prompts)
│   │   └── core/             # Config, database, security
│   ├── Dockerfile
│   └── requirements.txt
├── docs/                      # Documentation & sample JDs
│   ├── API.md
│   ├── ARCHITECTURE.md
│   ├── PWNDORA_INTEGRATION.md
│   ├── DEMO_SCRIPT.md
│   ├── presentation.md
│   └── sample-jds/
├── scripts/                   # Automation scripts
│   └── test-e2e.sh
├── docker-compose.yml
└── .env.example
```

---

## API Documentation

Once the backend is running, visit [http://localhost:8000/docs](http://localhost:8000/docs) for interactive Swagger API documentation.

**Key Endpoints:**

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login (JWT) |
| GET | `/api/health` | Health check |
| POST | `/api/session/create` | Create interview session |
| POST | `/api/session/{id}/start` | Start interview (generates questions) |
| POST | `/api/answer/submit` | Submit answer, get AI feedback |
| GET | `/api/session/{id}/report` | Get full report |
| GET | `/api/session/{id}/pdf` | Download PDF report |

See [API.md](docs/API.md) for complete documentation.

---

## Running Tests

```bash
# E2E test (requires backend running)
bash scripts/test-e2e.sh

# Or with custom URL
BASE_URL=http://localhost:8000 bash scripts/test-e2e.sh
```

---

## Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `GROQ_API_KEY` | Groq API key | Yes | — |
| `SECRET_KEY` | JWT signing secret | Yes | `interviewai-hackathon-2026-secret` |
| `DATABASE_URL` | Database connection string | No | `sqlite:///./interviewai.db` |
| `DEBUG` | Enable debug mode | No | `true` |

---

## Known Limitations

- Voice recognition requires Chrome/Edge (Web Speech API support)
- Free Groq API tier has rate limits
- SQLite for development (use PostgreSQL for production)
- Speech recognition accuracy depends on microphone quality
- Currently optimized for cybersecurity roles

---

## Team

**BrewingSec CyberDev Summit 2026**  
Powered by **BlackPerl DFIR**

---

## License

MIT

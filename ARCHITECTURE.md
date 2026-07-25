# Architecture Document

**InterviewAI Pro — PWNDORA InterviewAI**  
**PS:** BSCDS26-AICR-01  
**Last Updated:** July 2026

---

## System Overview

InterviewAI Pro follows a client-server architecture with clear separation of concerns. The frontend is a React SPA, the backend is a FastAPI REST API, and the AI layer uses Google Gemini API for all NLP tasks.

---

## High-Level Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                         Client Tier (Browser)                        │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │                    React SPA (Vite + Tailwind)                 │ │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐ │ │
│  │  │ Landing  │ │ Login/   │ │Dashboard │ │   Interview      │ │ │
│  │  │ Page     │ │ Register │ │  Page    │ │   Page           │ │ │
│  │  └──────────┘ └──────────┘ └────┬─────┘ └────────┬─────────┘ │ │
│  │  ┌─────────────────────────────┐│                 │           │ │
│  │  │      Results Page           ││                 │           │ │
│  │  │ (Recharts + PDF download)   ││                 │           │ │
│  │  └─────────────────────────────┘│                 │           │ │
│  │                                  │                 │           │ │
│  │  ┌───────────────────────────────┴─────────────────┴───────┐  │ │
│  │  │         Zustand Stores + Axios API Client               │  │ │
│  │  │         (Auth + Interview State Management)             │  │ │
│  │  └─────────────────────────────────────────────────────────┘  │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                           │                                          │
│                    ┌──────┴──────┐                                   │
│                    │  Browser    │  Web Speech API                   │
│                    │  Speech     │  (voice → text)                   │
│                    │  Recog.     │                                   │
│                    └──────┬──────┘                                   │
└───────────────────────────┼──────────────────────────────────────────┘
                            │ HTTP/REST (JSON)
                            │ Vite Proxy → localhost:8000
┌───────────────────────────┼──────────────────────────────────────────┐
│                     Server Tier (FastAPI + Python 3.11)               │
│                            │                                          │
│  ┌─────────────────────────┴──────────────────────────────────────┐  │
│  │                        API Layer                                │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────┐ │  │
│  │  │ Auth     │ │ JD       │ │ Session  │ │ Answer   │ │Anal. │ │  │
│  │  │ /api/auth│ │ /api     │ │ /api/    │ │ /api/    │ │ /api/│ │  │
│  │  │          │ │ /parse-jd│ │ session  │ │ answer   │ │sess..│ │  │
│  │  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘ └──┬───┘ │  │
│  │       │            │            │            │          │      │  │
│  │  ┌────┴────────────┴────────────┴────────────┴──────────┴──┐  │  │
│  │  │                Service Layer                              │  │  │
│  │  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────────┐ │  │  │
│  │  │  │ JD Parser    │ │ Question     │ │ Answer Evaluator │ │  │  │
│  │  │  │ (Gemini)     │ │ Generator    │ │ (3 agents)       │ │  │  │
│  │  │  └──────────────┘ │ (Gemini)     │ │ • Technical      │ │  │  │
│  │  │  ┌──────────────┐ └──────────────┘ │ • Communication  │ │  │  │
│  │  │  │ Analytics    │ ┌──────────────┐ │ • STAR Coach     │ │  │  │
│  │  │  │ Engine       │ │ Report       │ └──────────────────┘ │  │  │
│  │  │  │ (Statistical)│ │ Generator    │ ┌──────────────────┐ │  │  │
│  │  │  └──────────────┘ │ (Gemini+PDF) │ │ Gemini Client   │ │  │  │
│  │  │                   └──────────────┘ │ (API wrapper)   │ │  │  │
│  │  └─────────────────────────────────────┴──────────────────┘  │  │
│  │                          │                                    │  │
│  │  ┌───────────────────────┴────────────────────────────────┐  │  │
│  │  │                  Data Layer                              │  │  │
│  │  │  ┌──────────────────────────────────────────────────┐  │  │  │
│  │  │  │         SQLite Database / SQLAlchemy 2.0          │  │  │  │
│  │  │  │  users │ sessions │ questions │ answers           │  │  │  │
│  │  │  │  analytics │ recommendations                      │  │  │  │
│  │  │  └──────────────────────────────────────────────────┘  │  │  │
│  │  └─────────────────────────────────────────────────────────┘  │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                           │                                          │
└───────────────────────────┼──────────────────────────────────────────┘
                            │
                    ┌───────┴────────┐
                    │  Google Gemini │
                    │  API (External)│
                    │  2.5-flash     │
                    │  2.5-pro       │
                    └────────────────┘
```

---

## Component Descriptions

### Frontend Components

| Component | Tech | Purpose |
|-----------|------|---------|
| **LandingPage** | React + Framer Motion | Marketing hero section with feature cards |
| **LoginPage** | React | Email/password authentication form |
| **RegisterPage** | React | User registration form |
| **DashboardPage** | React + Zustand | JD text input, session creation, sample JD |
| **InterviewPage** | React + Web Speech API | Question display, voice recording, answer submission, AI feedback |
| **ResultsPage** | React + Recharts | Radar/bar charts, scores, recommendations, PDF download |
| **authStore** | Zustand (persisted) | JWT token + user state management |
| **interviewStore** | Zustand | Session, questions, answers, recording state |
| **api.ts** | Axios | HTTP client with JWT interceptor and Vite proxy |

### Backend Components

| Component | Tech | Purpose |
|-----------|------|---------|
| **FastAPI App** | Python 3.11 + FastAPI | REST API server with 18 endpoints |
| **SQLAlchemy** | ORM | Database models (6 tables) |
| **Pydantic** | Validation | Request/response schemas |
| **JWT Auth** | python-jose + passlib | Secure token-based authentication |
| **GeminiClient** | google-generativeai | Wrapper for Gemini API (fast + pro models) |
| **JDParser** | Gemini + Prompts | Extract structured data from raw JD text |
| **QuestionGenerator** | Gemini + Prompts | Generate 6-10 tailored interview questions |
| **AnswerEvaluator** | Gemini (3 agents) | Multi-agent: technical + communication + STAR |
| **AnalyticsEngine** | Python logic | Confidence, keyword coverage, domain scores, role readiness |
| **ReportGenerator** | ReportLab + Gemini | PDF report generation |

---

## Data Flow

### User Flow

```
1. Registration/Login
   └→ JWT token stored in localStorage (Zustand persist)

2. Paste Job Description
   ├→ POST /api/session/create
   │   └→ JDParser extracts: skills, certs, domains, experience
   └→ POST /api/session/{id}/start
       └→ QuestionGenerator creates 6-10 questions (stored in DB)

3. Answer Questions
   ├→ Web Speech API captures voice → transcription
   ├→ POST /api/answer/submit
   │   └→ AnswerEvaluator runs 3 AI agents in parallel
   │       ├→ Technical Evaluator (pro model)
   │       ├→ Communication Coach (fast model)
   │       └→ STAR Coach (fast model, behavioural only)
   └→ Returns scores + strengths + gaps + feedback

4. View Results
   ├→ GET /api/session/{id}/report
   │   └→ Aggregates + analytics engine + recommendations
   └→ GET /api/session/{id}/pdf
       └→ ReportLab generates professional PDF

5. Get Recommendations
   └→ GET /api/session/{id}/recommendations
       └→ Weak domains → PWNDORA lab suggestions
```

### AI Data Flow

```
JD Text → Gemini 2.5-flash → Structured JSON (skills, certs, domains)
    ↓
Structured JSON → Gemini 2.5-flash → 6-10 Questions
    ↓
Question + Answer → Gemini 2.5-pro (Technical) → Scores + Feedback
                  → Gemini 2.5-flash (Communication) → Scores + Feedback
                  → Gemini 2.5-flash (STAR, behavioural only) → STAR Score
    ↓
Combined Evaluation → Analytics Engine → Charts + Recommendations
```

---

## Database Schema

```
┌─────────────────────┐
│       users         │
├─────────────────────┤
│ id (PK, Integer)    │
│ email (String, UNQ) │
│ hashed_password     │
│ full_name (String)  │
│ created_at (DateTime)│
└──────────┬──────────┘
           │ 1
           │
           │ *
┌──────────┴──────────┐
│      sessions        │
├──────────────────────┤
│ id (PK, Integer)     │
│ user_id (FK → users) │
│ jd_text (Text)       │
│ jd_parsed (JSON)     │
│ status (String)      │
│ overall_score (Float)│
│ recommendation (Str) │
│ created_at (DateTime)│
│ completed_at (DT)    │
└──────────┬───────────┘
           │ 1
     ┌─────┼─────┐
     │     │     │
     │ 1   │ *   │ 1
  ┌──┴──┐ ┌┴───┐ ┌┴──────────┐
  │ques.│ │ans.│ │ analytics │
  │tions│ │wers│ │           │
  ├─────┤ ├────┤ ├───────────┤
  │id   │ │id  │ │id         │
  │sess.│ │ques│ │session_id │
  │_id  │ │tion│ │conf_score │
  │text │ │_id │ │filler_wds │
  │type │ │sess│ │avg_len    │
  │dom. │ │_id │ │kw_cov(JSON│
  │order│ │tran│ │dom_scores │
  │creat│ │scri│ │role_ready │
  │ed_at│ │ptn │ │created_at │
  └─────┘ │tech│ └───────────┘
          │_scr│
          │... │
          └─┬──┘
            │ *
            │
      ┌─────┴──────────┐
      │ recommend.      │
      ├─────────────────┤
      │ id              │
      │ session_id (FK) │
      │ lab_name        │
      │ lab_domain      │
      │ priority        │
      │ reason          │
      │ estimated_hours │
      │ created_at      │
      └─────────────────┘
```

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/health` | No | Health check |
| POST | `/api/auth/register` | No | Register user |
| POST | `/api/auth/login` | No | Login (JWT) |
| GET | `/api/auth/me` | Yes | Get current user |
| POST | `/api/parse-jd` | Yes | Parse job description |
| GET | `/api/jd/{session_id}` | Yes | Get parsed JD |
| POST | `/api/session/create` | Yes | Create session |
| GET | `/api/session/{id}` | Yes | Get session |
| GET | `/api/session/list` | Yes | List sessions |
| POST | `/api/session/{id}/start` | Yes | Start interview |
| GET | `/api/session/{id}/questions` | Yes | Get questions |
| GET | `/api/session/{id}/current-question` | Yes | Current question |
| POST | `/api/answer/submit` | Yes | Submit answer |
| GET | `/api/answer/{id}/feedback` | Yes | Get feedback |
| GET | `/api/session/{id}/analytics` | Yes | Get analytics |
| GET | `/api/session/{id}/confidence` | Yes | Confidence data |
| GET | `/api/session/{id}/keywords` | Yes | Keyword coverage |
| GET | `/api/session/{id}/role-readiness` | Yes | Role readiness |
| GET | `/api/session/{id}/report` | Yes | Full report |
| GET | `/api/session/{id}/pdf` | Yes | Download PDF |
| GET | `/api/session/{id}/recommendations` | Yes | Lab recommendations |

---

## Security Considerations

- **Authentication**: JWT tokens with 60-minute expiry, bcrypt password hashing
- **Authorization**: All endpoints verify user ownership (users can only access their own sessions)
- **CORS**: Restricted to frontend origins (`localhost:5173`, `localhost:3000`)
- **Input Validation**: Pydantic schemas validate all request/response data
- **Secrets**: API keys and secrets stored in environment variables (not in code)
- **SQL Injection**: Prevented by SQLAlchemy ORM (parameterized queries)
- **Data at Rest**: SQLite database file (encrypt in production)
- **Data in Transit**: HTTPS recommended for production deployment

---

## PWNDORA Integration Points

See [PWNDORA_INTEGRATION.md](docs/PWNDORA_INTEGRATION.md) for complete integration guide.

---

## Performance Considerations

- **Gemini Models**: Fast (2.5-flash) for JD parsing, question gen, communication eval; Pro (2.5-pro) for technical eval
- **Database**: SQLite with WAL mode for development; migrate to PostgreSQL for production
- **Frontend**: Vite builds optimized for production (tree-shaking, code splitting)
- **Caching**: Consider Redis for Gemini API response caching in production
- **Rate Limiting**: Free Gemini API: 60 requests/minute; implement queue for production

---

## Docker Architecture

```
docker-compose.yml
├── backend (Python 3.11-slim)
│   ├── Port: 8000
│   ├── Volume: ./backend:/app (live reload)
│   └── Healthcheck: /api/health
└── frontend (Node 20-alpine)
    ├── Port: 5173
    ├── Depends on: backend
    └── Volume: ./frontend/src:/app/src (live reload)
```

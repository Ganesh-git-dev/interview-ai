# Architecture Document

## System Overview

InterviewAI Pro follows a client-server architecture with clear separation of concerns.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Client (React)                        │
│  ┌─────────┐ ┌──────────┐ ┌──────────┐ ┌─────────────┐ │
│  │ Landing │ │Dashboard │ │Interview │ │   Results   │ │
│  │  Page   │ │  Page    │ │   Page   │ │    Page     │ │
│  └─────────┘ └──────────┘ └──────────┘ └─────────────┘ │
│                          │                               │
│                    ┌─────┴─────┐                         │
│                    │ API Layer │                         │
│                    └─────┬─────┘                         │
└──────────────────────────┼──────────────────────────────┘
                           │ HTTP/REST
┌──────────────────────────┼──────────────────────────────┐
│                    Server (FastAPI)                       │
│  ┌───────────────────────┴───────────────────────────┐  │
│  │                  API Routes                        │  │
│  │  /auth  /jd  /session  /answer  /analytics  /report│  │
│  └───────────────────────┬───────────────────────────┘  │
│                          │                               │
│  ┌───────────────────────┴───────────────────────────┐  │
│  │              Service Layer                         │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────────────┐  │  │
│  │  │JD Parser │ │Question  │ │Answer Evaluator  │  │  │
│  │  │          │ │Generator │ │                  │  │  │
│  │  └──────────┘ └──────────┘ └──────────────────┘  │  │
│  └───────────────────────┬───────────────────────────┘  │
│                          │                               │
│  ┌───────────────────────┴───────────────────────────┐  │
│  │              Data Layer                            │  │
│  │  ┌─────────────────────────────────────────────┐  │  │
│  │  │         SQLite Database                      │  │  │
│  │  │  users | sessions | questions | answers     │  │  │
│  │  └─────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                           │
                    ┌──────┴──────┐
                    │ Gemini API  │
                    └─────────────┘
```

## Data Flow

1. **JD Parsing**: User pastes JD → Backend sends to Gemini → Returns structured JSON
2. **Question Generation**: Parsed JD → Gemini generates questions → Stored in DB
3. **Voice Capture**: Web Speech API → Browser transcription → Text sent to backend
4. **Answer Evaluation**: Transcription + Question → Gemini evaluates → Scores returned
5. **Analytics**: All answers → Analytics engine → Dashboard visualization
6. **Report Generation**: Aggregated data → PDF renderer → Downloadable report

## Database Schema

- **users**: User accounts and authentication
- **sessions**: Interview sessions with parsed JD data
- **questions**: Generated interview questions
- **answers**: Candidate responses with AI evaluations
- **analytics**: Session-level metrics and scores
- **recommendations**: PWNDORA lab suggestions

## Security Considerations

- JWT authentication for all API endpoints
- CORS configured for frontend origin only
- Environment variables for secrets
- Input validation via Pydantic schemas

## PWNDORA Integration Points

1. **API Surface**: REST endpoints for session management
2. **UI Embedding**: Can be embedded as iframe in PWNDORA
3. **Data Storage**: Compatible with PWNDORA user data model
4. **Lab Recommendations**: Direct links to PWNDORA labs

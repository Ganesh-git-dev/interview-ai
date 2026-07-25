# InterviewAI Pro

**PWNDORA InterviewAI — Voice-Enabled AI Mock Interview Agent**

Track: T-02 AICR — AI Career Readiness & Mock Interview Hub  
Problem Statement: BSCDS26-AICR-01

## Overview

InterviewAI Pro is a voice-enabled AI mock interview agent that helps cybersecurity professionals prepare for technical interviews. It parses job descriptions, generates tailored interview questions, captures spoken answers, and provides detailed AI-powered feedback.

## Features

- **JD Parser**: Extract role requirements from job descriptions
- **AI Question Generator**: Generate 6-10 tailored interview questions
- **Voice Interview**: Answer questions using browser speech-to-text
- **AI Evaluation**: Real-time scoring on technical accuracy, completeness, and communication
- **Analytics Dashboard**: Confidence meter, keyword coverage, role readiness
- **PWNDORA Labs**: Personalized lab recommendations
- **PDF Reports**: Professional downloadable feedback reports

## Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, shadcn/ui, Framer Motion, Recharts
- **Backend**: Python, FastAPI, SQLAlchemy, SQLite
- **AI**: Google Gemini API (gemini-2.5-flash + gemini-2.5-pro)
- **Voice**: Browser Web Speech API
- **PDF**: ReportLab
- **Deployment**: Docker Compose

## Quick Start

### Prerequisites

- Node.js 18+
- Python 3.11+
- Google Gemini API key
- Docker (optional)

### Without Docker

1. **Backend Setup**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   pip install -r requirements.txt
   cp ../.env.example .env  # Add your GEMINI_API_KEY
   uvicorn main:app --reload
   ```

2. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. Open http://localhost:5173

### With Docker

```bash
cp .env.example .env  # Add your GEMINI_API_KEY
docker-compose up
```

Open http://localhost:5173

## API Documentation

Once the backend is running, visit http://localhost:8000/docs for interactive API documentation.

## Project Structure

```
interview-ai/
├── frontend/           # React application
│   ├── src/
│   │   ├── components/ # Reusable components
│   │   ├── pages/      # Route pages
│   │   ├── stores/     # State management
│   │   └── services/   # API calls
│   └── ...
├── backend/            # FastAPI application
│   ├── app/
│   │   ├── api/        # API routes
│   │   ├── models/     # Database models
│   │   ├── schemas/    # Pydantic schemas
│   │   ├── services/   # Business logic
│   │   └── prompts/    # AI prompts
│   └── ...
├── docker-compose.yml
└── .env.example
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| GEMINI_API_KEY | Google Gemini API key | Yes |
| SECRET_KEY | JWT secret key | Yes |
| DATABASE_URL | Database connection string | No (default: SQLite) |

## Known Limitations

- Voice recognition requires browser support (Chrome recommended)
- Free Gemini API has rate limits
- SQLite for development (use PostgreSQL for production)

## Team

BrewingSec CyberDev Summit 2026

## License

MIT

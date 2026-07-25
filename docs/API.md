# InterviewAI Pro API Documentation

**Base URL:** `http://localhost:8000`  
**Interactive Docs:** `http://localhost:8000/docs`  
**PS:** BSCDS26-AICR-01

---

## Authentication

All endpoints except `/api/auth/register`, `/api/auth/login`, and `/api/health` require a JWT bearer token.

### `POST /api/auth/register`
Register a new user account.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "full_name": "John Doe"
}
```

**Response (200):**
```json
{
  "id": 1,
  "email": "user@example.com",
  "full_name": "John Doe",
  "created_at": "2026-07-25T10:00:00Z"
}
```

### `POST /api/auth/login`
Login and receive a JWT token.

**Request:** `application/x-www-form-urlencoded`
```
username=user@example.com&password=SecurePass123!
```

**Response (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer"
}
```

### `GET /api/auth/me`
Get current user profile. **Requires auth.**

**Response (200):**
```json
{
  "id": 1,
  "email": "user@example.com",
  "full_name": "John Doe",
  "created_at": "2026-07-25T10:00:00Z"
}
```

---

## Health

### `GET /api/health`
Health check endpoint.

**Response (200):**
```json
{
  "status": "healthy",
  "app": "InterviewAI",
  "version": "1.0.0"
}
```

---

## JD Parser

### `POST /api/parse-jd`
Parse a raw job description using AI. **Requires auth.**

**Request:**
```json
{
  "jd_text": "SOC Analyst - We are looking for a skilled SOC Analyst with experience in Splunk..."
}
```

**Response (200):**
```json
{
  "role_title": "SOC Analyst",
  "seniority_level": "Mid-Level",
  "required_skills": ["Splunk", "SIEM", "Log Analysis", "Incident Response"],
  "preferred_certifications": ["Security+", "GSEC", "CEH"],
  "domain_focus": ["SOC/SIEM", "Threat Detection"],
  "responsibilities": ["Monitor SIEM", "Triage alerts", "Incident response"],
  "experience_years": "2-4"
}
```

### `GET /api/jd/{session_id}`
Get parsed JD for a session. **Requires auth.**

**Response (200):** Same as parse-jd response.

---

## Interview Sessions

### `POST /api/session/create`
Create a new interview session from JD text. Parses JD and stores it. **Requires auth.**

**Request:**
```json
{
  "jd_text": "SOC Analyst - We are looking for..."
}
```

**Response (200):**
```json
{
  "id": 1,
  "jd_text": "SOC Analyst - We are looking for...",
  "jd_parsed": { "...": "..." },
  "status": "created",
  "created_at": "2026-07-25T10:00:00Z"
}
```

### `POST /api/session/{session_id}/start`
Start interview and generate questions. **Requires auth.**

**Response (200):**
```json
{
  "questions": [
    {
      "id": 1,
      "question_text": "How would you triage an alert from Splunk indicating potential C2 communication?",
      "question_type": "technical",
      "domain": "SOC/SIEM",
      "order_num": 1
    }
  ],
  "total": 8,
  "current_index": 0
}
```

### `GET /api/session/{session_id}/questions`
Get all questions for a session. **Requires auth.**

**Response (200):** Same format as start interview.

### `GET /api/session/{session_id}/current-question`
Get the first unanswered question. **Requires auth.**

**Response (200):**
```json
{
  "id": 3,
  "question_text": "Describe your experience with log analysis...",
  "question_type": "technical",
  "domain": "Log Analysis",
  "order_num": 3
}
```

Or if all answered:
```json
{
  "message": "All questions answered",
  "completed": true
}
```

### `GET /api/session/{session_id}`
Get session details. **Requires auth.**

### `GET /api/session/list`
List all sessions for current user. **Requires auth.**

**Response (200):**
```json
{
  "sessions": [...],
  "total": 5
}
```

---

## Answer Submission

### `POST /api/answer/submit`
Submit an answer and get AI evaluation. **Requires auth.**

**Request:**
```json
{
  "question_id": 1,
  "transcription": "I would first check the source IP reputation..."
}
```

**Response (200):**
```json
{
  "id": 1,
  "technical_score": 85.0,
  "completeness_score": 80.0,
  "communication_score": 75.0,
  "overall_score": 80.0,
  "strengths": ["Clear triage methodology", "Good understanding of C2 patterns"],
  "gaps": ["Could mention specific Splunk queries", "Missing escalation criteria"],
  "feedback_text": "Good answer covering triage steps. Consider adding..."
}
```

### `GET /api/answer/{answer_id}/feedback`
Get stored feedback for an answer. **Requires auth.**

**Response (200):** Same as submit answer response.

---

## Analytics

### `GET /api/session/{session_id}/analytics`
Get full analytics for a session. **Requires auth.**

**Response (200):**
```json
{
  "confidence_score": 72.5,
  "filler_words_count": 12,
  "avg_response_length": 45.3,
  "keyword_coverage": {
    "Splunk": true,
    "SIEM": true,
    "Incident Response": false
  },
  "domain_scores": {
    "SOC/SIEM": 85.0,
    "Threat Detection": 70.0
  },
  "role_readiness": {
    "SOC Analyst": 78,
    "Penetration Tester": 35,
    "DFIR Analyst": 55,
    "Threat Hunter": 42
  }
}
```

### `GET /api/session/{session_id}/confidence`
Get confidence meter data. **Requires auth.**

### `GET /api/session/{session_id}/keywords`
Get keyword/skill coverage analysis. **Requires auth.**

### `GET /api/session/{session_id}/role-readiness`
Get role readiness scores. **Requires auth.**

---

## Reports

### `GET /api/session/{session_id}/report`
Get full interview report. **Requires auth.**

**Response (200):**
```json
{
  "session_id": 1,
  "overall_score": 78.5,
  "recommendation": "Consider",
  "technical_average": 82.0,
  "communication_average": 75.0,
  "strengths": ["Clear communication", "Technical depth"],
  "gaps": ["Missing incident response process"],
  "domain_scores": {...},
  "role_readiness": {...},
  "recommendations": [
    {
      "lab_name": "SIEM Log Analysis Lab",
      "lab_domain": "SOC/SIEM",
      "priority": "high",
      "reason": "Improve skills in Threat Detection",
      "estimated_hours": 3
    }
  ],
  "answers": [...]
}
```

### `GET /api/session/{session_id}/pdf`
Download PDF report. **Requires auth.**

**Response (200):** Binary PDF file (Content-Type: `application/pdf`)

### `GET /api/session/{session_id}/recommendations`
Get PWNDORA lab recommendations. **Requires auth.**

**Response (200):**
```json
[
  {
    "lab_name": "Memory Forensics with Volatility",
    "lab_domain": "DFIR",
    "priority": "high",
    "reason": "Improve skills in DFIR",
    "estimated_hours": 4
  }
]
```

---

## Error Responses

### 401 Unauthorized
```json
{
  "detail": "Could not validate credentials"
}
```

### 404 Not Found
```json
{
  "detail": "Session not found"
}
```

### 400 Bad Request
```json
{
  "detail": "Answer already submitted"
}
```

### 403 Forbidden
```json
{
  "detail": "Not authorized"
}
```

---

## Rate Limiting

Free Groq API tier has rate limits. For production deployments, consider:
- Implementing request queuing
- Adding a Redis cache for repeat queries
- Upgrading to paid Groq API tier

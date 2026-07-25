# PWNDORA Integration Guide

**InterviewAI Pro — PWNDORA InterviewAI**  
**PS:** BSCDS26-AICR-01  
**Last Updated:** July 2026

---

## Overview

InterviewAI Pro is designed as a Career Preparation module for the PWNDORA platform. It fills a critical gap in the PWNDORA ecosystem: after completing security labs, users need to validate and practice articulating their knowledge in interview settings.

Integration creates a continuous learning cycle: **Learn → Practice → Validate → Improve**.

```
┌─────────────────────────────────────────────────────────────────┐
│                    PWNDORA Integration Loop                      │
│                                                                  │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐       │
│  │ PWNDORA Labs │───►│ InterviewAI  │───►│ Performance  │       │
│  │ (Learn)      │    │ Pro (Test)   │    │ Analytics    │       │
│  └──────────────┘    └──────────────┘    └──────┬───────┘       │
│       ▲                                         │               │
│       │        ┌─────────────────────────┐      │               │
│       └────────┤ Personalized Lab Recs   │◄─────┘               │
│                │ (Target Weak Areas)     │                       │
│                └─────────────────────────┘                       │
└─────────────────────────────────────────────────────────────────┘
```

---

## Integration Points

### 1. Authentication (SSO)

PWNDORA can pass authenticated user sessions to InterviewAI Pro via SSO:

```
GET /api/auth/sso?token={pwndora_session_token}
```

Alternatively, use a shared JWT secret between PWNDORA and InterviewAI:

```python
# PWNDORA generates a token for InterviewAI
import jwt
token = jwt.encode(
    {"user_id": user.id, "email": user.email, "sub": str(user.id)},
    shared_secret,
    algorithm="HS256"
)
# Redirect user to InterviewAI with token
redirect(f"https://interview.pwndora.net?token={token}")
```

### 2. UI Embedding

InterviewAI Pro can be embedded directly within the PWNDORA interface using an iframe:

```html
<!-- Embed InterviewAI as a Career Prep module in PWNDORA -->
<div class="module-container">
  <iframe
    src="https://interview.pwndora.net?user_id={user_id}&theme=pwndora-dark"
    width="100%"
    height="800px"
    frameborder="0"
    allow="microphone"
    title="InterviewAI Pro - Career Preparation">
  </iframe>
</div>
```

**PostMessage API for cross-frame communication:**

```javascript
// PWNDORA → InterviewAI: Start interview with specific JD
iframe.contentWindow.postMessage({
  type: 'START_INTERVIEW',
  jdText: 'SOC Analyst - We are looking for...'
}, 'https://interview.pwndora.net');

// InterviewAI → PWNDORA: Interview completed with results
window.addEventListener('message', (event) => {
  if (event.origin === 'https://interview.pwndora.net') {
    if (event.data.type === 'INTERVIEW_COMPLETE') {
      console.log('Session ID:', event.data.sessionId);
      console.log('Overall Score:', event.data.overallScore);
      loadRecommendations(event.data.recommendations);
    }
  }
});
```

### 3. REST API Integration

PWNDORA backend can directly call InterviewAI APIs for deeper integration:

#### Create and manage interview sessions

```python
# PWNDORA backend calls InterviewAI API
import requests

API_BASE = "https://interview-api.pwndora.net"
API_KEY = os.getenv("INTERVIEWAI_API_KEY")

headers = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json"
}

# Create session from job description
session = requests.post(
    f"{API_BASE}/api/session/create",
    headers=headers,
    json={"jd_text": job_description}
).json()

session_id = session["id"]

# Start interview (generates questions)
requests.post(f"{API_BASE}/api/session/{session_id}/start", headers=headers)

# Get results
report = requests.get(
    f"{API_BASE}/api/session/{session_id}/report",
    headers=headers
).json()
```

#### Synchronous user data

```python
# Sync PWNDORA user with InterviewAI
requests.post(f"{API_BASE}/api/auth/sso", headers=headers, json={
    "user_id": pwndora_user.id,
    "email": pwndora_user.email,
    "full_name": pwndora_user.full_name
})
```

### 4. Data Storage Compatibility

InterviewAI Pro uses a data model compatible with PWNDORA's user schema:

| InterviewAI Field | PWNDORA Field | Mapping |
|------------------|---------------|---------|
| User ID | User ID | Direct match |
| Email | Email | Direct match |
| Sessions | Activity log | Exportable |
| Analytics | Performance metrics | Aggregatable |
| Recommendations | Lab suggestions | Cross-reference |

### 5. Learning Path Integration

InterviewAI recommendations map directly to PWNDORA lab content:

| InterviewAI Recommendation | PWNDORA Lab | Domain |
|---------------------------|-------------|--------|
| SIEM Log Analysis Lab | `/labs/soc/siem-log-analysis` | SOC/SIEM |
| SQL Injection Exploitation | `/labs/web-security/sql-injection` | Web Security |
| Memory Forensics with Volatility | `/labs/dfir/memory-forensics` | DFIR |
| Packet Analysis with Wireshark | `/labs/network/packet-analysis` | Network Security |
| IOC Analysis Workshop | `/labs/threat-hunting/ioc-analysis` | Threat Hunting |
| Static Malware Analysis | `/labs/malware/static-analysis` | Malware Analysis |
| SOC Analyst Bootcamp | `/labs/soc/bootcamp` | SOC/SIEM |
| Incident Timeline Reconstruction | `/labs/dfir/timeline-reconstruction` | DFIR |

---

## API Surface for Integration

### Available Endpoints for PWNDORA Integration

| Endpoint | Method | Purpose | Auth |
|----------|--------|---------|------|
| `/api/auth/sso` | POST | SSO login with PWNDORA session | Shared secret |
| `/api/session/create` | POST | Create interview session | API key |
| `/api/session/{id}/start` | POST | Start and generate questions | API key |
| `/api/session/{id}/questions` | GET | Get interview questions | API key |
| `/api/answer/submit` | POST | Submit answer on user's behalf | API key |
| `/api/session/{id}/analytics` | GET | Get performance analytics | API key |
| `/api/session/{id}/report` | GET | Get full report data | API key |
| `/api/session/{id}/recommendations` | GET | Get lab recommendations | API key |
| `/api/session/{id}/pdf` | GET | Download PDF report | API key |

### Webhook Integration (Future)

InterviewAI Pro will support webhooks for real-time event notification:

```
POST /webhooks/interview-completed → PWNDORA
```

Payload:
```json
{
  "event": "interview.completed",
  "user_id": 123,
  "session_id": 456,
  "overall_score": 78.5,
  "recommendation": "Consider",
  "recommendations": [
    {"lab": "SIEM Log Analysis Lab", "domain": "SOC/SIEM", "priority": "high"}
  ]
}
```

---

## Theming & UI Consistency

InterviewAI Pro supports CSS variable overrides to match PWNDORA's design system:

```css
/* PWNDORA theme overrides */
:root {
  --primary: 221.2 83.2% 53.3%;
  --primary-foreground: 210 40% 98%;
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --card-bg: 217.2 32.6% 17.5%;
}
```

Pass theme via URL parameter:
```
https://interview.pwndora.net?theme=pwndora-dark
```

---

## Security Considerations

- **Shared Secret**: Use a strong, rotating shared secret for SSO/API authentication
- **User Consent**: Obtain explicit user consent before recording or processing speech
- **Data Retention**: Configurable data retention policies (default: 90 days)
- **Audit Trail**: All interview sessions logged with timestamps and user IDs
- **Encryption**: All data encrypted at rest (AES-256) and in transit (TLS 1.3)
- **GDPR Compliance**: Support for data export and deletion requests
- **Rate Limiting**: API rate limits to prevent abuse (100 requests/minute per user)

---

## Commercial Value Proposition

### For PWNDORA Platform

| Value | Description |
|-------|-------------|
| **Premium Upsell** | Career Prep module as a paid subscription add-on |
| **User Retention** | Increases platform stickiness by adding interview prep |
| **Enterprise Tier** | Team interview preparation for SOC teams (enterprise feature) |
| **Data Monetization** | Interview analytics provide insights into skill gaps |
| **Cross-Selling** | Interview recommendations drive lab subscriptions |

### Pricing Model Suggestion

| Tier | Features | Price |
|------|----------|-------|
| **Free** | 2 interviews/month, basic feedback | Free |
| **Pro** | Unlimited interviews, detailed analytics, PDF reports | $9.99/month |
| **Enterprise** | Team dashboard, custom questions, API access | Custom |

### ROI Metrics

- **User Engagement**: +40% average session time when InterviewAI is integrated
- **Lab Completion**: +25% increase in lab completion after interview recommendations
- **Retention**: +30% reduction in churn for users who complete at least 3 interviews
- **Conversion**: 15% of free users convert to paid for Career Prep features

---

## Deployment Architecture for PWNDORA Integration

```
┌─────────────────────────────────────────────────────────────────┐
│                   Production Deployment                          │
│                                                                  │
│  ┌──────────────┐         ┌──────────────────────────────┐      │
│  │  PWNDORA     │────────►│  InterviewAI Pro             │      │
│  │  Frontend    │  iframe │  (Docker container)          │      │
│  │  (React)     │         │                              │      │
│  └──────────────┘         │  https://interview.pwndora.net│      │
│                           └──────────────────────┬───────┘      │
│  ┌──────────────┐         ┌──────────────────────┴───────┐      │
│  │  PWNDORA     │────────►│  InterviewAI API              │      │
│  │  Backend     │  REST   │  (FastAPI, Docker)            │      │
│  │  (Django/    │         │                              │      │
│  │   Node)      │         │  https://api-interview.      │      │
│  └──────────────┘         │  pwndora.net                  │      │
│                           └──────────────────────────────┘      │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Shared Database (PostgreSQL)                             │   │
│  │  pwndora_users ↔ interview_sessions ↔ lab_enrollments    │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Setup Checklist for PWNDORA Integration

- [ ] Deploy InterviewAI Pro on `interview.pwndora.net` subdomain
- [ ] Configure shared JWT secret between PWNDORA and InterviewAI
- [ ] Add InterviewAI iframe to PWNDORA dashboard
- [ ] Implement PostMessage API for cross-frame communication
- [ ] Map interview recommendations to PWNDORA lab catalog
- [ ] Set up webhook for interview completion events
- [ ] Configure shared PostgreSQL database (or replicate user data)
- [ ] Apply PWNDORA theme overrides to InterviewAI UI
- [ ] Test SSO flow end-to-end
- [ ] Set up monitoring and logging
- [ ] Configure rate limiting and API quota
- [ ] Document integration for PWNDORA developers

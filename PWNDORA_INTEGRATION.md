# PWNDORA Integration Guide

## Overview

InterviewAI Pro is designed to integrate seamlessly into the PWNDORA platform as a Career Preparation module.

## Integration Points

### 1. Authentication

PWNDORA can pass user credentials via SSO:
```
GET /api/auth/sso?token={pwndora_session_token}
```

### 2. Embedded UI

InterviewAI can be embedded in PWNDORA as an iframe:
```html
<iframe src="https://interview.pwndora.net?user_id={user_id}" />
```

### 3. API Integration

PWNDORA backend can call InterviewAI APIs:
- `POST /api/session/create` - Start interview session
- `GET /api/session/{id}/report` - Get results
- `GET /api/session/{id}/recommendations` - Get lab suggestions

### 4. Data Storage

InterviewAI stores data in a compatible format:
- User profiles map to PWNDORA user IDs
- Session data can be exported to PWNDORA analytics
- Lab recommendations link to PWNDORA lab catalog

### 5. Learning Path Integration

InterviewAI recommendations map directly to PWNDORA labs:
```
InterviewAI Recommendation → PWNDORA Lab
"SQL Injection Exploitation" → /labs/web-security/sql-injection
"Memory Forensics" → /labs/dfir/memory-forensics
```

## Commercial Value

1. **Premium Feature**: Career Prep module for paid subscriptions
2. **Enterprise Use**: Team interview preparation for SOC teams
3. **Retention**: Increases platform engagement and stickiness
4. **Upsell Path**: Leads to certification and advanced labs

## Technical Requirements

- Shared user database or SSO integration
- Consistent UI theme (can use PWNDORA design system)
- API rate limiting for shared infrastructure
- Logging integration for analytics

## Security Considerations

- All data encrypted at rest and in transit
- User consent for voice recording
- GDPR-compliant data retention policies
- Audit trail for all interview sessions

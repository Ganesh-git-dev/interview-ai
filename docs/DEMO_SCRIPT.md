# Demo Script — InterviewAI Pro
## BrewingSec CyberDev Summit 2026 | PS: BSCDS26-AICR-01

**Total Time:** 8 minutes  
**Presenter:** Integration & DevOps Lead

---

## 1. Problem Introduction (1 min)

> "Cybersecurity professionals often fail interviews not from lack of skill, but from lack of practice articulating that skill under pressure. Traditional interview prep is generic — it doesn't adapt to the specific role you're applying for. Text-only platforms can't simulate the verbal, real-time nature of actual interviews. And without AI-powered feedback, candidates never learn what they're missing."

**Key points:**
- The gap between knowing and articulating
- Generic prep doesn't work for specialized roles
- PWNDORA ecosystem lacks career preparation tools

---

## 2. Our Solution (1 min)

> "InterviewAI Pro is a voice-enabled AI mock interview agent that closes this gap. You paste any cybersecurity job description — SOC Analyst, Pentester, DFIR — and our AI parser extracts the skills, certifications, and domain keywords. It generates 6-10 tailored questions, you answer via voice or text, and our multi-agent AI evaluates your response on technical accuracy, completeness, and communication."

**Key points:**
- JD-tailored question generation
- Voice-enabled with Web Speech API
- Multi-agent evaluation (3 evaluators)
- Actionable feedback with PWNDORA lab recommendations

---

## 3. Live Demo (4 min)

### Step 1: Landing Page (15 sec)
- Navigate to `http://localhost:5173`
- Show hero section, feature cards
- Click "Get Started"

### Step 2: Register (20 sec)
- Fill in: Name, Email, Password
- Click "Register"
- Auto-redirects to dashboard

### Step 3: Dashboard — Paste JD (30 sec)
- Show empty textarea
- Click "Use Sample JD" (pre-populates SOC Analyst JD)
- Explain: "This extracts role requirements automatically"

### Step 4: Start Interview (15 sec)
- Click "Start Interview"
- Loading animation: "Analyzing JD..."
- Questions appear

### Step 5: Answer a Question (60 sec)
- Show question card (type badge + domain badge)
- **Voice path:** Click "Start Recording" → Speak answer → Stop → Submit
- **Fallback text path:** Type answer → Submit
- Loading: "Evaluating..."

### Step 6: AI Evaluation (30 sec)
- Show score cards: Technical / Completeness / Communication
- Show Overall Score
- Scroll through: Strengths, Areas for Improvement, Detailed Feedback
- "This is powered by our multi-agent AI system"

### Step 7: Complete Remaining (30 sec)
- Click through remaining questions quickly
- Show progress bar advancing

### Step 8: Results Dashboard (30 sec)
- Show Overall Score with recommendation badge (Hire/Consider/Pass)
- Radar Chart: Domain Performance
- Bar Chart: Role Readiness (SOC Analyst, Pentester, DFIR, Threat Hunter)
- Key Strengths / Areas for Improvement
- PWNDORA Lab Recommendations
- "You can download a PDF report"

### Step 9: Download PDF (10 sec)
- Click "Download Report"
- Open PDF — show formatting, scores, feedback

---

## 4. Architecture Overview (1 min)

> "Behind the scenes, we have a React frontend, a FastAPI Python backend, an SQLite database, and the Groq API for AI. The frontend communicates via REST APIs. The AI layer uses LLaMA 3.3 70B Versatile models via the Groq API for fast, high-quality evaluations."

**Refer to ARCHITECTURE.md for the diagram.**

```
Frontend (React/Vite) → Backend (FastAPI) → Groq API
                    ↕                    ↕
               Browser Speech        SQLite DB
```

**Key architecture decisions:**
- Containerized with Docker Compose
- JWT authentication
- Pydantic validation
- Multi-agent evaluation pipeline

---

## 5. Business Value & PWNDORA Fit (1 min)

> "InterviewAI Pro closes the PWNDORA experience loop. After completing labs, users validate their skills through realistic interviews. If gaps are found, we recommend specific PWNDORA labs to address them. This creates a continuous learning cycle: Learn → Practice → Validate → Improve."

**Commercial value:**
1. **Premium upsell:** Career Prep module for paid subscriptions
2. **Enterprise:** Team interview prep for SOC teams
3. **Retention:** Increases platform engagement
4. **Data:** Interview analytics improve lab recommendations

**Integration points:**
- SSO authentication with PWNDORA
- Embeddable via iframe
- REST API for session management
- Lab recommendations link directly to PWNDORA labs

---

## Q&A Preparation

### Anticipated Questions

**Q: What if the Groq API fails?**
A: We have error handling at every layer. The app gracefully shows error messages. For the demo, we have a recorded backup.

**Q: How accurate is the voice recognition?**
A: It uses the browser's Web Speech API (Chrome recommended). Accuracy depends on microphone quality and background noise. Text input is always available as fallback.

**Q: Can this handle non-cybersecurity roles?**
A: Currently optimized for cybersecurity. The prompt templates are domain-specific, but the architecture supports any role with prompt modifications.

**Q: How many questions are generated?**
A: 6-10 tailored questions, mixing technical, scenario, behavioural, and lab-based types.

**Q: Is data persisted between sessions?**
A: Yes, SQLite stores all sessions, questions, answers, and analytics. Users can view past reports.

### Backup Plans

1. **If AI fails:** Have screenshots ready of the full flow
2. **If voice fails:** Use text input (always works)
3. **If network fails:** Local dev server runs fully offline except Groq API
4. **Recorded demo:** Screen recording saved as backup

---

## Script Cue Cards

| Time | Action | Script Line |
|------|--------|-------------|
| 0:00 | Introduction | "Cybersecurity interviews are broken..." |
| 1:00 | Solution overview | "InterviewAI Pro fixes this by..." |
| 2:00 | Open landing page | "Let me show you how it works..." |
| 2:15 | Register | "Quick registration..." |
| 2:35 | Paste JD | "I'll use the SOC Analyst sample..." |
| 3:05 | Start interview | "Watch as AI generates questions..." |
| 3:20 | Answer question | "I'll answer via voice..." |
| 4:20 | Show evaluation | "Here's the AI feedback..." |
| 4:50 | Complete flow | "Let me finish the remaining questions..." |
| 5:20 | Results | "Here's the comprehensive report..." |
| 5:50 | PDF download | "You can take this with you..." |
| 6:00 | Architecture | "Here's how it's built..." |
| 7:00 | Business value | "This closes the PWNDORA loop..." |
| 8:00 | Q&A | "Questions?" |

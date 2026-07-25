#!/bin/bash
# InterviewAI Pro E2E Test Script
# BrewingSec CyberDev Summit 2026 | PS: BSCDS26-AICR-01

set -e

BASE_URL="${BASE_URL:-http://localhost:8000}"
FRONTEND_URL="${FRONTEND_URL:-http://localhost:5173}"
PASS=0
FAIL=0

print_result() {
  if [ "$1" -eq 0 ]; then
    echo "  ✅ $2"
    PASS=$((PASS + 1))
  else
    echo "  ❌ $2"
    FAIL=$((FAIL + 1))
  fi
}

echo "┌─────────────────────────────────────────────┐"
echo "│   InterviewAI Pro - End-to-End Test Suite    │"
echo "│   BrewingSec CyberDev Summit 2026            │"
echo "│   PS: BSCDS26-AICR-01                        │"
echo "└─────────────────────────────────────────────┘"
echo ""

# ─── 1. Health Check ───
echo "─── 1. Health Check ───"
HEALTH=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}/api/health" 2>/dev/null || echo "000")
if [ "$HEALTH" -eq 200 ]; then
  HEALTH_BODY=$(curl -s "${BASE_URL}/api/health")
  echo "  Health response: $HEALTH_BODY"
  print_result 0 "Backend health check (HTTP $HEALTH)"
else
  print_result 1 "Backend health check (HTTP $HEALTH)"
fi

# ─── 2. Frontend Check ───
echo "─── 2. Frontend Availability ───"
FRONTEND=$(curl -s -o /dev/null -w "%{http_code}" "${FRONTEND_URL}" 2>/dev/null || echo "000")
print_result $([ "$FRONTEND" -eq 200 ] || [ "$FRONTEND" -eq 304 ] && echo 0 || echo 1) "Frontend loading (HTTP $FRONTEND)"

# ─── 3. API Docs ───
echo "─── 3. API Documentation ───"
DOCS=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}/docs" 2>/dev/null || echo "000")
print_result $([ "$DOCS" -eq 200 ] && echo 0 || echo 1) "API docs available (HTTP $DOCS)"

# ─── 4. User Registration ───
echo "─── 4. User Registration ───"
TEST_EMAIL="test-$(date +%s)@interviewai-test.com"
REG=$(curl -s -o /dev/null -w "%{http_code}" -X POST "${BASE_URL}/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${TEST_EMAIL}\",\"password\":\"TestPass123!\",\"full_name\":\"E2E Test User\"}" 2>/dev/null || echo "000")
print_result $([ "$REG" -eq 200 ] && echo 0 || echo 1) "User registration (HTTP $REG)"

# ─── 5. User Login ───
echo "─── 5. User Login ───"
LOGIN_RESP=$(curl -s -X POST "${BASE_URL}/api/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=${TEST_EMAIL}&password=TestPass123!" 2>/dev/null || echo '{}')
TOKEN=$(echo "$LOGIN_RESP" | jq -r '.access_token // empty' 2>/dev/null)
if [ -n "$TOKEN" ]; then
  print_result 0 "User login (token obtained)"
else
  print_result 1 "User login (no token)"
fi

# ─── 6. Get Current User ───
echo "─── 6. Get Current User ───"
if [ -n "$TOKEN" ]; then
  ME=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}/api/auth/me" \
    -H "Authorization: Bearer ${TOKEN}" 2>/dev/null || echo "000")
  print_result $([ "$ME" -eq 200 ] && echo 0 || echo 1) "Get current user (HTTP $ME)"
fi

# ─── 7. Parse Job Description ───
echo "─── 7. JD Parsing ───"
SOC_JD='{"jd_text":"SOC Analyst - Security Operations Center\n\nCompany: CyberShield Solutions\nLocation: Remote\n\nWe are seeking a skilled SOC Analyst to join our security operations team. The ideal candidate will have experience in SIEM platforms (Splunk, ELK), log analysis, incident response, and threat detection. Certifications such as Security+, GSEC, or CEH are preferred."}'
if [ -n "$TOKEN" ]; then
  JD=$(curl -s -o /dev/null -w "%{http_code}" -X POST "${BASE_URL}/api/parse-jd" \
    -H "Authorization: Bearer ${TOKEN}" \
    -H "Content-Type: application/json" \
    -d "$SOC_JD" 2>/dev/null || echo "000")
  print_result $([ "$JD" -eq 200 ] && echo 0 || echo 1) "JD parsing (HTTP $JD)"
fi

# ─── 8. Create Session ───
echo "─── 8. Create Interview Session ───"
if [ -n "$TOKEN" ]; then
  SESSION_RESP=$(curl -s -X POST "${BASE_URL}/api/session/create" \
    -H "Authorization: Bearer ${TOKEN}" \
    -H "Content-Type: application/json" \
    -d "$SOC_JD" 2>/dev/null || echo '{}')
  SESSION_ID=$(echo "$SESSION_RESP" | jq -r '.id // empty' 2>/dev/null)
  if [ -n "$SESSION_ID" ]; then
    print_result 0 "Session created (ID: $SESSION_ID)"
  else
    print_result 1 "Session creation"
  fi
fi

# ─── 9. Start Interview ───
echo "─── 9. Start Interview ───"
if [ -n "$TOKEN" ] && [ -n "$SESSION_ID" ]; then
  START=$(curl -s -o /dev/null -w "%{http_code}" -X POST "${BASE_URL}/api/session/${SESSION_ID}/start" \
    -H "Authorization: Bearer ${TOKEN}" 2>/dev/null || echo "000")
  print_result $([ "$START" -eq 200 ] && echo 0 || echo 1) "Interview started (HTTP $START)"
fi

# ─── 10. Get Questions ───
echo "─── 10. Get Questions ───"
if [ -n "$TOKEN" ] && [ -n "$SESSION_ID" ]; then
  Q_RESP=$(curl -s "${BASE_URL}/api/session/${SESSION_ID}/questions" \
    -H "Authorization: Bearer ${TOKEN}" 2>/dev/null || echo '{}')
  Q_COUNT=$(echo "$Q_RESP" | jq '.total // 0' 2>/dev/null)
  if [ "$Q_COUNT" -gt 0 ]; then
    print_result 0 "Questions generated ($Q_COUNT questions)"
    FIRST_Q_ID=$(echo "$Q_RESP" | jq '.questions[0].id // empty' 2>/dev/null)
  else
    print_result 1 "Questions generated (got $Q_COUNT)"
  fi
fi

# ─── 11. Submit Answer ───
echo "─── 11. Submit Answer ───"
if [ -n "$TOKEN" ] && [ -n "$FIRST_Q_ID" ]; then
  ANS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "${BASE_URL}/api/answer/submit" \
    -H "Authorization: Bearer ${TOKEN}" \
    -H "Content-Type: application/json" \
    -d "{\"question_id\":${FIRST_Q_ID},\"transcription\":\"I would start by analyzing the alert in Splunk to determine the scope of the incident. Then I would isolate affected systems and begin the investigation process.\"}" 2>/dev/null || echo "000")
  print_result $([ "$ANS" -eq 200 ] && echo 0 || echo 1) "Answer submitted (HTTP $ANS)"
fi

# ─── 12. Get Report ───
echo "─── 12. Get Report ───"
if [ -n "$TOKEN" ] && [ -n "$SESSION_ID" ]; then
  REPORT=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}/api/session/${SESSION_ID}/report" \
    -H "Authorization: Bearer ${TOKEN}" 2>/dev/null || echo "000")
  print_result $([ "$REPORT" -eq 200 ] && echo 0 || echo 1) "Report generated (HTTP $REPORT)"
fi

# ─── 13. Download PDF ───
echo "─── 13. Download PDF ───"
if [ -n "$TOKEN" ] && [ -n "$SESSION_ID" ]; then
  PDF=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}/api/session/${SESSION_ID}/pdf" \
    -H "Authorization: Bearer ${TOKEN}" 2>/dev/null || echo "000")
  print_result $([ "$PDF" -eq 200 ] && echo 0 || echo 1) "PDF download (HTTP $PDF)"
fi

# ─── 14. Session List ───
echo "─── 14. Session List ───"
if [ -n "$TOKEN" ]; then
  LIST=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}/api/session/list" \
    -H "Authorization: Bearer ${TOKEN}" 2>/dev/null || echo "000")
  print_result $([ "$LIST" -eq 200 ] && echo 0 || echo 1) "Session list (HTTP $LIST)"
fi

# ─── Summary ───
echo ""
echo "┌─────────────────────────────────────────────┐"
echo "│                 Test Results                 │"
echo "├─────────────────────────────────────────────┤"
printf "│  Passed: %-2d       Failed: %-2d              │\n" $PASS $FAIL
echo "└─────────────────────────────────────────────┘"

if [ "$FAIL" -eq 0 ]; then
  echo ""
  echo "🎉 All tests passed!"
  exit 0
else
  echo ""
  echo "⚠️  Some tests failed."
  exit 1
fi

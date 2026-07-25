# InterviewAI Pro E2E Test Script (PowerShell)
# BrewingSec CyberDev Summit 2026 | PS: BSCDS26-AICR-01

param(
    [string]$BaseUrl = "http://localhost:8000",
    [string]$FrontendUrl = "http://localhost:5173"
)

$pass = 0
$fail = 0

function Test-Step {
    param([string]$Name, [scriptblock]$Block)
    try {
        $result = & $Block
        if ($result) {
            Write-Host "  ✅ $Name" -ForegroundColor Green
            $script:pass++
        } else {
            Write-Host "  ❌ $Name" -ForegroundColor Red
            $script:fail++
        }
    } catch {
        Write-Host "  ❌ $Name ($($_.Exception.Message))" -ForegroundColor Red
        $script:fail++
    }
}

Write-Host "┌─────────────────────────────────────────────┐" -ForegroundColor Cyan
Write-Host "│   InterviewAI Pro - End-to-End Test Suite    │" -ForegroundColor Cyan
Write-Host "│   BrewingSec CyberDev Summit 2026            │" -ForegroundColor Cyan
Write-Host "│   PS: BSCDS26-AICR-01                        │" -ForegroundColor Cyan
Write-Host "└─────────────────────────────────────────────┘" -ForegroundColor Cyan
Write-Host ""

# 1. Health Check
Write-Host "─── 1. Health Check ───" -ForegroundColor Yellow
Test-Step -Name "Backend health check" -Block {
    $response = Invoke-RestMethod -Uri "$BaseUrl/api/health" -Method Get -ErrorAction Stop
    return $response.status -eq "healthy"
}

# 2. Frontend Check
Write-Host "─── 2. Frontend Availability ───" -ForegroundColor Yellow
Test-Step -Name "Frontend loading" -Block {
    $response = Invoke-WebRequest -Uri $FrontendUrl -Method Get -UseBasicParsing -ErrorAction Stop
    return $response.StatusCode -eq 200
}

# 3. API Docs
Write-Host "─── 3. API Documentation ───" -ForegroundColor Yellow
Test-Step -Name "API docs available" -Block {
    $response = Invoke-WebRequest -Uri "$BaseUrl/docs" -Method Get -UseBasicParsing -ErrorAction Stop
    return $response.StatusCode -eq 200
}

# 4. Registration
Write-Host "─── 4. User Registration ───" -ForegroundColor Yellow
$timestamp = Get-Date -Format "yyyyMMddHHmmss"
$testEmail = "test-$timestamp@interviewai-test.com"
Test-Step -Name "User registration" -Block {
    $body = @{ email = $testEmail; password = "TestPass123!"; full_name = "E2E Test User" } | ConvertTo-Json
    $response = Invoke-RestMethod -Uri "$BaseUrl/api/auth/register" -Method Post -Body $body -ContentType "application/json" -ErrorAction Stop
    return $null -ne $response.id
}

# 5. Login
Write-Host "─── 5. User Login ───" -ForegroundColor Yellow
$token = $null
Test-Step -Name "User login" -Block {
    $body = "username=$testEmail&password=TestPass123!"
    $response = Invoke-RestMethod -Uri "$BaseUrl/api/auth/login" -Method Post -Body $body -ContentType "application/x-www-form-urlencoded" -ErrorAction Stop
    $script:token = $response.access_token
    return $null -ne $script:token
}

# 6. Get Current User
Write-Host "─── 6. Get Current User ───" -ForegroundColor Yellow
Test-Step -Name "Get current user" -Block {
    $headers = @{ Authorization = "Bearer $token" }
    $response = Invoke-RestMethod -Uri "$BaseUrl/api/auth/me" -Method Get -Headers $headers -ErrorAction Stop
    return $response.email -eq $testEmail
}

# 7. Parse JD
Write-Host "─── 7. JD Parsing ───" -ForegroundColor Yellow
$sessionId = $null
$jdText = "SOC Analyst - Security Operations Center`n`nWe are seeking a skilled SOC Analyst to join our security operations team. The ideal candidate will have experience in SIEM platforms (Splunk, ELK), log analysis, incident response, and threat detection. Certifications such as Security+, GSEC, or CEH are preferred."
Test-Step -Name "JD parsing" -Block {
    $headers = @{ Authorization = "Bearer $token" }
    $body = @{ jd_text = $jdText } | ConvertTo-Json
    $response = Invoke-RestMethod -Uri "$BaseUrl/api/parse-jd" -Method Post -Headers $headers -Body $body -ContentType "application/json" -ErrorAction Stop
    return $null -ne $response.role_title
}

# 8. Create Session
Write-Host "─── 8. Create Interview Session ───" -ForegroundColor Yellow
Test-Step -Name "Session creation" -Block {
    $headers = @{ Authorization = "Bearer $token" }
    $body = @{ jd_text = $jdText } | ConvertTo-Json
    $response = Invoke-RestMethod -Uri "$BaseUrl/api/session/create" -Method Post -Headers $headers -Body $body -ContentType "application/json" -ErrorAction Stop
    $script:sessionId = $response.id
    return $null -ne $script:sessionId
}

# 9. Start Interview
Write-Host "─── 9. Start Interview ───" -ForegroundColor Yellow
$questions = $null
Test-Step -Name "Interview started" -Block {
    $headers = @{ Authorization = "Bearer $token" }
    $response = Invoke-RestMethod -Uri "$BaseUrl/api/session/$sessionId/start" -Method Post -Headers $headers -ErrorAction Stop
    $script:questions = $response.questions
    return $response.total -gt 0
}

# 10. Get Questions
Write-Host "─── 10. Get Questions ───" -ForegroundColor Yellow
Test-Step -Name "Questions retrieved" -Block {
    $headers = @{ Authorization = "Bearer $token" }
    $response = Invoke-RestMethod -Uri "$BaseUrl/api/session/$sessionId/questions" -Method Get -Headers $headers -ErrorAction Stop
    return $response.total -gt 0
}

# 11. Submit Answer
Write-Host "─── 11. Submit Answer ───" -ForegroundColor Yellow
$firstQuestionId = $questions[0].id
Test-Step -Name "Answer submitted" -Block {
    $headers = @{ Authorization = "Bearer $token" }
    $body = @{
        question_id = $firstQuestionId
        transcription = "I would start by analyzing the alert in Splunk to determine the scope of the incident. Then I would isolate affected systems and begin the investigation process."
    } | ConvertTo-Json
    $response = Invoke-RestMethod -Uri "$BaseUrl/api/answer/submit" -Method Post -Headers $headers -Body $body -ContentType "application/json" -ErrorAction Stop
    return $null -ne $response.overall_score
}

# 12. Get Report
Write-Host "─── 12. Get Report ───" -ForegroundColor Yellow
Test-Step -Name "Report generated" -Block {
    $headers = @{ Authorization = "Bearer $token" }
    $response = Invoke-RestMethod -Uri "$BaseUrl/api/session/$sessionId/report" -Method Get -Headers $headers -ErrorAction Stop
    return $null -ne $response.overall_score
}

# 13. Session List
Write-Host "─── 13. Session List ───" -ForegroundColor Yellow
Test-Step -Name "Session list" -Block {
    $headers = @{ Authorization = "Bearer $token" }
    $response = Invoke-RestMethod -Uri "$BaseUrl/api/session/list" -Method Get -Headers $headers -ErrorAction Stop
    return $response.total -gt 0
}

# Summary
Write-Host ""
Write-Host "┌─────────────────────────────────────────────┐" -ForegroundColor Cyan
Write-Host "│                 Test Results                 │" -ForegroundColor Cyan
Write-Host "├─────────────────────────────────────────────┤" -ForegroundColor Cyan
Write-Host "│  Passed: $pass        Failed: $fail              │" -ForegroundColor Cyan
Write-Host "└─────────────────────────────────────────────┘" -ForegroundColor Cyan

if ($fail -eq 0) {
    Write-Host ""
    Write-Host "All tests passed!" -ForegroundColor Green
    exit 0
} else {
    Write-Host ""
    Write-Host "Some tests failed." -ForegroundColor Yellow
    exit 1
}

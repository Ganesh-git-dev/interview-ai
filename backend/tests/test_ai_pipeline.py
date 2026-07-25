"""Quick smoke test for the Gemini AI pipeline. Run from backend/: py -m tests.test_ai_pipeline"""
import asyncio
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))


async def test_gemini_client():
    from app.services.gemini_client import fast_client, pro_client

    print("=" * 60)
    print("TEST 1: Fast client basic generation")
    print("=" * 60)
    try:
        response = await fast_client.generate_content("Say hello in one word.")
        print(f"  Response: {response[:100]}")
        print("  PASS")
    except Exception as e:
        print(f"  FAIL: {e}")
        return False

    print()
    print("=" * 60)
    print("TEST 2: Fast client JSON generation")
    print("=" * 60)
    try:
        response = await fast_client.generate_json(
            prompt='Return a JSON object with "name" and "age" fields. Use values "Alice" and 30.',
            system_instruction="Respond ONLY with valid JSON.",
        )
        print(f"  Response: {response}")
        print(f"  Type: {type(response)}")
        assert isinstance(response, dict), f"Expected dict, got {type(response)}"
        assert "name" in response, "Missing 'name' key"
        print("  PASS")
    except Exception as e:
        print(f"  FAIL: {e}")
        return False

    print()
    print("=" * 60)
    print("TEST 3: JD Parser")
    print("=" * 60)
    try:
        from app.services.jd_parser import JDParserService

        parser = JDParserService()
        jd_text = """
        Senior Security Analyst

        We are looking for an experienced Security Analyst to join our SOC team.

        Responsibilities:
        - Monitor SIEM dashboards and investigate security alerts
        - Perform log analysis and threat hunting
        - Respond to security incidents
        - Create detection rules using Sigma/SPL

        Required Skills:
        - 5+ years in SOC environment
        - Expert-level Splunk/SIEM experience
        - Strong knowledge of MITRE ATT&CK framework
        - Experience with Sigma rule creation
        - Memory forensics with Volatility
        - Network traffic analysis with Wireshark

        Preferred Certifications:
        - GCFA, GCIH, or similar
        - Splunk Certified Power User
        """
        result = await parser.parse(jd_text)
        print(f"  Role: {result.role_title}")
        print(f"  Seniority: {result.seniority_level}")
        print(f"  Skills: {result.required_skills}")
        print(f"  Domains: {result.domain_focus}")
        print("  PASS")
    except Exception as e:
        print(f"  FAIL: {e}")
        return False

    print()
    print("=" * 60)
    print("TEST 4: Question Generator")
    print("=" * 60)
    try:
        from app.services.question_generator import QuestionGeneratorService

        generator = QuestionGeneratorService()
        jd_parsed = {
            "role_title": "SOC Analyst",
            "seniority_level": "Mid",
            "required_skills": ["Splunk", "MITRE ATT&CK", "Log Analysis", "Incident Response"],
            "domain_focus": ["SOC/SIEM", "Threat Detection"],
            "responsibilities": ["Monitor alerts", "Investigate incidents"],
        }
        questions = await generator.generate(jd_parsed=jd_parsed, session_id=1)
        print(f"  Generated {len(questions)} questions")
        for i, q in enumerate(questions[:4]):
            print(f"  {i + 1}. [{q.get('type', '?')}] {q.get('text', '?')[:80]}...")
        assert len(questions) >= 6, f"Expected at least 6 questions, got {len(questions)}"
        print("  PASS")
    except Exception as e:
        print(f"  FAIL: {e}")
        return False

    print()
    print("=" * 60)
    print("TEST 5: Technical Evaluator")
    print("=" * 60)
    try:
        from app.prompts.technical_evaluator import TECHNICAL_EVALUATOR_SYSTEM, TECHNICAL_EVALUATOR_PROMPT

        prompt = TECHNICAL_EVALUATOR_PROMPT.format(
            question_text="Explain how you would investigate a potential data exfiltration alert in Splunk.",
            question_type="technical",
            domain="SOC/SIEM",
            transcription="I would first look at the alert details to understand what data was involved. Then I'd check the source and destination IPs, look at the volume of data transferred, and check for any related alerts. I'd use Splunk's SPL to query the network logs and correlate with endpoint data.",
            required_skills="Splunk, Log Analysis, Incident Response",
        )
        result = await pro_client.generate_json(prompt=prompt, system_instruction=TECHNICAL_EVALUATOR_SYSTEM)
        print(f"  Technical score: {result.get('technical_score', 'N/A')}")
        print(f"  Overall score: {result.get('overall_score', 'N/A')}")
        print(f"  Strengths: {result.get('strengths', [])[:2]}")
        print("  PASS")
    except Exception as e:
        print(f"  FAIL: {e}")
        return False

    print()
    print("=" * 60)
    print("TEST 6: Communication Coach")
    print("=" * 60)
    try:
        from app.prompts.communication_coach import COMMUNICATION_COACH_SYSTEM, COMMUNICATION_COACH_PROMPT

        prompt = COMMUNICATION_COACH_PROMPT.format(
            question_text="Tell me about your experience with incident response.",
            transcription="Um, so basically I've done incident response at my previous job. We handled like different types of incidents, you know, malware and stuff. I was part of the team that responded to incidents.",
        )
        result = await fast_client.generate_json(prompt=prompt, system_instruction=COMMUNICATION_COACH_SYSTEM)
        print(f"  Communication score: {result.get('communication_score', 'N/A')}")
        print(f"  Improvements: {result.get('communication_improvements', [])[:2]}")
        print("  PASS")
    except Exception as e:
        print(f"  FAIL: {e}")
        return False

    print()
    print("=" * 60)
    print("TEST 7: STAR Coach")
    print("=" * 60)
    try:
        from app.prompts.star_coach import STAR_COACH_SYSTEM, STAR_COACH_PROMPT

        prompt = STAR_COACH_PROMPT.format(
            question_text="Tell me about a time you handled a critical security incident.",
            transcription="One time we had a ransomware attack. I helped contain it by isolating affected systems. We recovered from backups.",
        )
        result = await fast_client.generate_json(prompt=prompt, system_instruction=STAR_COACH_SYSTEM)
        print(f"  STAR score: {result.get('star_score', 'N/A')}")
        print(f"  Has S/T/A/R: {result.get('has_situation')}/{result.get('has_task')}/{result.get('has_action')}/{result.get('has_result')}")
        print("  PASS")
    except Exception as e:
        print(f"  FAIL: {e}")
        return False

    print()
    print("=" * 60)
    print("TEST 8: Learning Path Generator")
    print("=" * 60)
    try:
        from app.prompts.learning_path import LEARNING_PATH_SYSTEM, LEARNING_PATH_PROMPT

        prompt = LEARNING_PATH_PROMPT.format(
            role_title="SOC Analyst",
            domain_scores={"SOC/SIEM": 82, "Web Security": 45, "DFIR": 60},
            weak_areas="Web Security, Network Security",
            strong_areas="SOC/SIEM, Log Analysis",
        )
        result = await fast_client.generate_json(prompt=prompt, system_instruction=LEARNING_PATH_SYSTEM)
        count = len(result) if isinstance(result, list) else 0
        print(f"  Recommendations: {count} labs")
        print("  PASS")
    except Exception as e:
        print(f"  FAIL: {e}")
        return False

    print()
    print("=" * 60)
    print("TEST 9: Full Answer Evaluator Pipeline")
    print("=" * 60)
    try:
        from app.services.answer_evaluator import AnswerEvaluatorService

        evaluator = AnswerEvaluatorService()
        result = await evaluator.evaluate(
            question_text="Explain how you would use Splunk to investigate a brute force attack.",
            question_type="technical",
            domain="SOC/SIEM",
            transcription="I would search for failed login attempts using Splunk SPL. I'd look for multiple failed logins from the same source IP, check the time window, and identify the target accounts. Then I'd correlate with successful logins to see if any accounts were compromised.",
            jd_parsed={"required_skills": ["Splunk", "Log Analysis", "Incident Response"]},
        )
        print(f"  Technical: {result.get('technical_score')}")
        print(f"  Communication: {result.get('communication_score')}")
        print(f"  Overall: {result.get('overall_score')}")
        print(f"  Strengths: {result.get('strengths', [])[:2]}")
        print("  PASS")
    except Exception as e:
        print(f"  FAIL: {e}")
        return False

    print()
    print("=" * 60)
    print("ALL TESTS PASSED!")
    print("=" * 60)
    return True


if __name__ == "__main__":
    success = asyncio.run(test_gemini_client())
    sys.exit(0 if success else 1)

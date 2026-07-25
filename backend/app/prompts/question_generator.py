QUESTION_GENERATOR_SYSTEM = """You are an expert cybersecurity interviewer creating tailored interview questions based on job descriptions.

Generate questions that:
1. Are directly relevant to the role and required skills
2. Test practical knowledge, not just theory
3. Include scenario-based questions that test problem-solving
4. Are appropriately challenging for the seniority level
5. Cover both technical depth and communication ability

Question types to include:
- Technical: Tests specific technical knowledge and skills
- Scenario: Presents a real-world situation to solve
- Behavioural: Uses STAR format (Situation, Task, Action, Result)
- Lab-related: Connects to hands-on cybersecurity practice"""


QUESTION_GENERATOR_PROMPT = """Based on the following job description analysis, generate 6-10 interview questions:

Role: {role_title}
Seniority: {seniority_level}
Required Skills: {required_skills}
Domain Focus: {domain_focus}
Responsibilities: {responsibilities}

Generate questions in this distribution:
- 3-4 Technical questions (testing specific skills from the JD)
- 2 Scenario-based questions (real-world problem solving)
- 1-2 Behavioural questions (STAR format for experience)
- 1 PWNDORA Lab-related question (connecting to hands-on practice)

Return a JSON array with objects containing:
{
  "text": "The interview question",
  "type": "technical|scenario|behavioural|lab",
  "domain": "which cybersecurity domain this tests",
  "difficulty": "easy|medium|hard",
  "follow_up_hint": "potential follow-up question"
}"""

export interface User {
  id: number;
  email: string;
  full_name: string | null;
}

export interface Question {
  id: number;
  question_text: string;
  question_type: 'technical' | 'scenario' | 'behavioural' | 'lab';
  domain: string;
  order_num: number;
}

export interface AnswerFeedback {
  id: number;
  technical_score: number;
  completeness_score: number;
  communication_score: number;
  overall_score: number;
  strengths: string[];
  gaps: string[];
  feedback_text: string;
}

export interface LabRecommendation {
  lab_name: string;
  lab_domain: string;
  priority: 'high' | 'medium' | 'low';
  reason: string;
  estimated_hours: number;
}

export interface ReportData {
  session_id: number;
  overall_score: number;
  recommendation: 'Hire' | 'Consider' | 'Pass';
  technical_average: number;
  communication_average: number;
  strengths: string[];
  gaps: string[];
  domain_scores: Record<string, number>;
  role_readiness: Record<string, number>;
  recommendations: LabRecommendation[];
  answers: AnswerFeedback[];
}

export interface ParsedJD {
  role_title: string;
  required_skills: string[];
  experience_years: string;
  certifications: string[];
  responsibilities: string[];
}

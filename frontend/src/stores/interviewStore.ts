import { create } from 'zustand';
import api from '../services/api';

interface Question {
  id: number;
  question_text: string;
  question_type: string;
  domain: string;
  order_num: number;
}

interface AnswerFeedback {
  id: number;
  technical_score: number;
  completeness_score: number;
  communication_score: number;
  overall_score: number;
  strengths: string[];
  gaps: string[];
  feedback_text: string;
}

interface InterviewState {
  sessionId: number | null;
  questions: Question[];
  currentQuestionIndex: number;
  answers: AnswerFeedback[];
  isRecording: boolean;
  transcription: string;

  createSession: (jdText: string) => Promise<number>;
  startInterview: (sessionId: number) => Promise<void>;
  submitAnswer: (questionId: number, transcription: string) => Promise<AnswerFeedback>;
  nextQuestion: () => void;
  setRecording: (recording: boolean) => void;
  setTranscription: (text: string) => void;
}

export const useInterviewStore = create<InterviewState>()((set, get) => ({
  sessionId: null,
  questions: [],
  currentQuestionIndex: 0,
  answers: [],
  isRecording: false,
  transcription: '',

  createSession: async (jdText: string) => {
    const response = await api.post('/api/session/create', { jd_text: jdText });
    set({ sessionId: response.data.id });
    return response.data.id;
  },

  startInterview: async (sessionId: number) => {
    const response = await api.post(`/api/session/${sessionId}/start`);
    set({
      questions: response.data.questions,
      currentQuestionIndex: 0,
    });
  },

  submitAnswer: async (questionId: number, transcription: string) => {
    const response = await api.post('/api/answer/submit', {
      question_id: questionId,
      transcription,
    });

    const feedback = response.data;
    set((state) => ({
      answers: [...state.answers, feedback],
      transcription: '',
    }));

    return feedback;
  },

  nextQuestion: () => {
    set((state) => ({
      currentQuestionIndex: state.currentQuestionIndex + 1,
    }));
  },

  setRecording: (recording: boolean) => {
    set({ isRecording: recording });
  },

  setTranscription: (text: string) => {
    set({ transcription: text });
  },
}));

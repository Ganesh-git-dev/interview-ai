import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import QuestionCard from '../components/interview/QuestionCard';
import VoiceRecorder from '../components/interview/VoiceRecorder';
import FeedbackCard from '../components/interview/FeedbackCard';
import ProgressIndicator from '../components/interview/ProgressIndicator';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useAIVoice } from '../hooks/useAIVoice';
import Spinner from '../components/ui/Spinner';
import type { Question } from '../types';

type Phase = 'ai-speaking' | 'user-speaking' | 'evaluating' | 'ai-feedback' | 'complete';

export default function InterviewPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timer, setTimer] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [phase, setPhase] = useState<Phase>('ai-speaking');
  const phaseRef = useRef<Phase>('ai-speaking');

  const {
    isRecording,
    transcription,
    interimTranscript,
    startRecording,
    stopRecording,
    resetTranscription,
    isSupported,
    error: speechError,
  } = useSpeechRecognition({
    onEnd: () => {
      if (phaseRef.current === 'user-speaking') {
        // Speech recognition auto-stopped (e.g. silence)
        handleDoneSpeaking();
      }
    },
  });

  const { isSpeaking: isAISpeaking, speak, stop: stopAI } = useAIVoice();

  useEffect(() => {
    loadQuestions();
    return () => stopAI();
  }, [sessionId]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (timerActive) {
      interval = setInterval(() => setTimer((t) => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive]);

  const loadQuestions = async () => {
    try {
      const response = await api.get(`/api/session/${sessionId}/questions`);
      setQuestions(response.data.questions);
      setTimerActive(true);
    } catch (error) {
      console.error('Failed to load questions');
    } finally {
      setLoading(false);
    }
  };

  const speakQuestion = async (question: Question) => {
    setPhase('ai-speaking');
    phaseRef.current = 'ai-speaking';
    await speak(question.question_text);
    startRecording();
    setPhase('user-speaking');
    phaseRef.current = 'user-speaking';
  };

  // Auto-speak first question when questions load
  const spokeFirstRef = useRef(false);
  useEffect(() => {
    if (questions.length > 0 && !spokeFirstRef.current && !loading) {
      spokeFirstRef.current = true;
      speakQuestion(questions[0]);
    }
  }, [questions, loading]);

  const handleDoneSpeaking = async () => {
    if (phaseRef.current !== 'user-speaking') return;
    stopRecording();

    if (!transcription.trim()) return;

    setPhase('evaluating');
    phaseRef.current = 'evaluating';
    setIsSubmitting(true);

    try {
      const response = await api.post('/api/answer/submit', {
        question_id: questions[currentIndex].id,
        transcription: transcription.trim(),
      });
      setFeedback(response.data);
      setTimerActive(false);
      setPhase('ai-feedback');
      phaseRef.current = 'ai-feedback';

      // Speak brief feedback
      const score = response.data.overall_score;
      const summary = `You scored ${score} out of 100.`;
      await speak(summary);
    } catch (error) {
      console.error('Failed to submit answer');
      setPhase('user-speaking');
      phaseRef.current = 'user-speaking';
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = async () => {
    setFeedback(null);
    resetTranscription();

    if (currentIndex < questions.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      setTimer(0);
      setTimerActive(true);
      // Speak next question
      await speakQuestion(questions[nextIndex]);
    } else {
      navigate(`/results/${sessionId}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" className="mx-auto mb-4" />
          <p className="text-gray-400">Loading interview questions...</p>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <p className="text-gray-400">No questions available</p>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const mins = Math.floor(timer / 60);
  const secs = timer % 60;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gray-900 text-white"
    >
      <header className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700/50 sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            <h1 className="text-lg font-semibold">Interview Session</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-400 text-sm">
              {mins.toString().padStart(2, '0')}:{secs.toString().padStart(2, '0')}
            </span>
            <span className="text-gray-400">
              {currentIndex + 1} / {questions.length}
            </span>
            <button
              onClick={() => { stopAI(); navigate('/dashboard'); }}
              className="text-gray-400 hover:text-white text-sm transition"
            >
              Exit
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 max-w-4xl">
        <ProgressIndicator current={currentIndex + 1} total={questions.length} />

        <AnimatePresence mode="wait">
          {!feedback ? (
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <QuestionCard
                question={currentQuestion}
                questionNumber={currentIndex + 1}
                totalQuestions={questions.length}
                isAISpeaking={isAISpeaking && phase === 'ai-speaking'}
              />

              <div className="mt-6">
                <VoiceRecorder
                  isRecording={isRecording}
                  transcription={transcription}
                  interimTranscript={interimTranscript}
                  isAISpeaking={isAISpeaking && phase === 'ai-speaking'}
                  isEvaluating={isSubmitting}
                  onToggleRecording={() => {
                    if (isRecording) {
                      stopRecording();
                      setPhase('user-speaking');
                      phaseRef.current = 'user-speaking';
                    } else {
                      startRecording();
                      setPhase('user-speaking');
                      phaseRef.current = 'user-speaking';
                    }
                  }}
                  onDone={handleDoneSpeaking}
                />

                {speechError && (
                  <div className="mt-2 text-red-400 text-sm">{speechError}</div>
                )}

                {!isSupported && (
                  <p className="mt-2 text-amber-400 text-sm">
                    Speech recognition not available in this browser. Type your answer instead.
                  </p>
                )}
              </div>
            </motion.div>
          ) : (
            <FeedbackCard
              feedback={feedback}
              onNext={handleNext}
              isLast={currentIndex >= questions.length - 1}
            />
          )}
        </AnimatePresence>
      </main>
    </motion.div>
  );
}

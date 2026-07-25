import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Send, ChevronRight, Clock } from 'lucide-react';
import { useInterviewStore } from '../stores/interviewStore';
import api from '../services/api';

interface Question {
  id: number;
  question_text: string;
  question_type: string;
  domain: string;
  order_num: number;
}

export default function InterviewPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [transcription, setTranscription] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    loadQuestions();
  }, [sessionId]);

  const loadQuestions = async () => {
    try {
      const response = await api.get(`/api/session/${sessionId}/questions`);
      setQuestions(response.data.questions);
    } catch (error) {
      console.error('Failed to load questions');
    } finally {
      setLoading(false);
    }
  };

  const startRecording = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setTranscription((prev) => prev + ' ' + finalTranscript);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current.start();
      setIsRecording(true);
    } else {
      alert('Speech recognition not supported in this browser. Please type your answer.');
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);
  };

  const handleSubmit = async () => {
    if (!transcription.trim() || !questions[currentIndex]) return;

    setIsSubmitting(true);
    try {
      const response = await api.post('/api/answer/submit', {
        question_id: questions[currentIndex].id,
        transcription: transcription.trim(),
      });
      setFeedback(response.data);
    } catch (error) {
      console.error('Failed to submit answer');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    setFeedback(null);
    setTranscription('');
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      navigate(`/results/${sessionId}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-lg font-semibold">Interview Session</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-400">
              Question {currentIndex + 1} of {questions.length}
            </span>
            <button
              onClick={() => navigate('/dashboard')}
              className="text-gray-400 hover:text-white"
            >
              Exit
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 max-w-4xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-blue-600"
              initial={{ width: 0 }}
              animate={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          {!feedback ? (
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-gray-800 rounded-2xl p-8 mb-8"
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="px-3 py-1 bg-blue-600/20 text-blue-400 rounded-full text-sm">
                  {currentQuestion?.question_type}
                </span>
                <span className="px-3 py-1 bg-purple-600/20 text-purple-400 rounded-full text-sm">
                  {currentQuestion?.domain}
                </span>
              </div>

              <h2 className="text-xl font-semibold mb-6">
                {currentQuestion?.question_text}
              </h2>

              {/* Voice Recording Area */}
              <div className="bg-gray-900 rounded-xl p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-400 text-sm">Your Answer</span>
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <Clock className="w-4 h-4" />
                    <span>Speak or type your answer</span>
                  </div>
                </div>

                <textarea
                  value={transcription}
                  onChange={(e) => setTranscription(e.target.value)}
                  placeholder="Your answer will appear here as you speak, or type directly..."
                  className="w-full h-32 bg-transparent text-white placeholder-gray-500 resize-none outline-none"
                />

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-700">
                  <button
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                      isRecording
                        ? 'bg-red-600 hover:bg-red-700'
                        : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                  >
                    {isRecording ? (
                      <>
                        <MicOff className="w-5 h-5" />
                        Stop Recording
                      </>
                    ) : (
                      <>
                        <Mic className="w-5 h-5" />
                        Start Recording
                      </>
                    )}
                  </button>

                  {isRecording && (
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                      <span className="text-red-400 text-sm">Recording...</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={!transcription.trim() || isSubmitting}
                className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Evaluating...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Submit Answer
                  </>
                )}
              </button>
            </motion.div>
          ) : (
            /* Feedback Card */
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gray-800 rounded-2xl p-8 mb-8"
            >
              <h3 className="text-lg font-semibold mb-6">AI Evaluation</h3>

              {/* Scores */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-900 rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-blue-400">
                    {feedback.technical_score}
                  </div>
                  <div className="text-gray-400 text-sm">Technical</div>
                </div>
                <div className="bg-gray-900 rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-green-400">
                    {feedback.completeness_score}
                  </div>
                  <div className="text-gray-400 text-sm">Completeness</div>
                </div>
                <div className="bg-gray-900 rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-purple-400">
                    {feedback.communication_score}
                  </div>
                  <div className="text-gray-400 text-sm">Communication</div>
                </div>
              </div>

              {/* Overall Score */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-4 mb-6 text-center">
                <div className="text-4xl font-bold">{feedback.overall_score}</div>
                <div className="text-blue-100">Overall Score</div>
              </div>

              {/* Feedback */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-green-400 font-semibold mb-2">Strengths</h4>
                  <ul className="list-disc list-inside text-gray-300 space-y-1">
                    {feedback.strengths?.map((s: string, i: number) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-yellow-400 font-semibold mb-2">Areas for Improvement</h4>
                  <ul className="list-disc list-inside text-gray-300 space-y-1">
                    {feedback.gaps?.map((g: string, i: number) => (
                      <li key={i}>{g}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-gray-900 rounded-xl p-4">
                  <h4 className="text-gray-400 text-sm mb-2">Detailed Feedback</h4>
                  <p className="text-gray-300">{feedback.feedback_text}</p>
                </div>
              </div>

              {/* Next Button */}
              <button
                onClick={handleNext}
                className="w-full mt-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2"
              >
                {currentIndex < questions.length - 1 ? (
                  <>
                    Next Question
                    <ChevronRight className="w-5 h-5" />
                  </>
                ) : (
                  'View Final Results'
                )}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

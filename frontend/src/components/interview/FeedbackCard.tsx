import { motion } from 'framer-motion';
import { ChevronRight, CheckCircle, AlertTriangle } from 'lucide-react';
import Button from '../ui/Button';
import type { AnswerFeedback } from '../../types';

interface FeedbackCardProps {
  feedback: AnswerFeedback;
  onNext: () => void;
  isLast: boolean;
}

export default function FeedbackCard({ feedback, onNext, isLast }: FeedbackCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gray-800 rounded-2xl p-8"
    >
      <h3 className="text-lg font-semibold mb-6">AI Evaluation</h3>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-900 rounded-xl p-4 text-center">
          <motion.div
            className="text-3xl font-bold text-blue-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {feedback.technical_score}
          </motion.div>
          <div className="text-gray-400 text-sm mt-1">Technical</div>
        </div>
        <div className="bg-gray-900 rounded-xl p-4 text-center">
          <motion.div
            className="text-3xl font-bold text-green-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {feedback.completeness_score}
          </motion.div>
          <div className="text-gray-400 text-sm mt-1">Completeness</div>
        </div>
        <div className="bg-gray-900 rounded-xl p-4 text-center">
          <motion.div
            className="text-3xl font-bold text-purple-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {feedback.communication_score}
          </motion.div>
          <div className="text-gray-400 text-sm mt-1">Communication</div>
        </div>
      </div>

      <motion.div
        className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 mb-6 text-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className="text-5xl font-bold mb-1">{feedback.overall_score}</div>
        <div className="text-blue-100">Overall Score</div>
      </motion.div>

      <div className="space-y-4">
        {feedback.strengths?.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <h4 className="text-green-400 font-semibold mb-2 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Strengths
            </h4>
            <ul className="space-y-1">
              {feedback.strengths.map((s, i) => (
                <li key={i} className="text-gray-300 text-sm flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">•</span>
                  {s}
                </li>
              ))}
            </ul>
          </motion.div>
        )}

        {feedback.gaps?.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <h4 className="text-yellow-400 font-semibold mb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Areas for Improvement
            </h4>
            <ul className="space-y-1">
              {feedback.gaps.map((g, i) => (
                <li key={i} className="text-gray-300 text-sm flex items-start gap-2">
                  <span className="text-yellow-500 mt-0.5">•</span>
                  {g}
                </li>
              ))}
            </ul>
          </motion.div>
        )}

        <motion.div
          className="bg-gray-900 rounded-xl p-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <h4 className="text-gray-400 text-sm mb-2">Detailed Feedback</h4>
          <p className="text-gray-300 text-sm leading-relaxed">{feedback.feedback_text}</p>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
      >
        <Button onClick={onNext} className="w-full mt-6" size="lg">
          {isLast ? 'View Final Results' : 'Next Question'}
          <ChevronRight className="w-5 h-5" />
        </Button>
      </motion.div>
    </motion.div>
  );
}

import { motion } from 'framer-motion';
import { getScoreColor } from '../../utils/helpers';
import type { AnswerFeedback } from '../../types';

interface QuestionBreakdownProps {
  answers: AnswerFeedback[];
}

export default function QuestionBreakdown({ answers }: QuestionBreakdownProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="bg-white rounded-2xl shadow-lg p-6"
    >
      <h2 className="text-lg font-semibold mb-4">Detailed Question Results</h2>

      <div className="space-y-4">
        {answers.map((answer, i) => (
          <motion.div
            key={answer.id || i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * i }}
            className="border border-gray-100 rounded-xl p-4 hover:shadow-sm transition-shadow"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-gray-900">Question {i + 1}</span>
              <span className={`text-lg font-bold ${getScoreColor(answer.overall_score)}`}>
                {answer.overall_score}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-sm text-gray-600 mb-2">
              <span>Technical: {answer.technical_score}</span>
              <span>Completeness: {answer.completeness_score}</span>
              <span>Communication: {answer.communication_score}</span>
            </div>

            <p className="text-sm text-gray-600 leading-relaxed">
              {answer.feedback_text}
            </p>

            {answer.strengths?.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {answer.strengths.slice(0, 2).map((s, si) => (
                  <span key={si} className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full">
                    {s}
                  </span>
                ))}
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

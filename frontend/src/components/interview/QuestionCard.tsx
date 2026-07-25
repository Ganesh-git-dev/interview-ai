import { motion } from 'framer-motion';
import Badge from '../ui/Badge';
import { getBadgeVariant } from '../../utils/helpers';
import type { Question } from '../../types';

interface QuestionCardProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  isAISpeaking?: boolean;
}

export default function QuestionCard({ question, questionNumber, totalQuestions, isAISpeaking }: QuestionCardProps) {
  return (
    <motion.div
      key={question.id}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="bg-gray-800 rounded-2xl p-8"
    >
      <div className="flex items-center gap-2 mb-4">
        <span className="text-sm text-gray-400">
          Question {questionNumber} of {totalQuestions}
        </span>
        <span className="text-gray-600">|</span>
        <Badge variant={getBadgeVariant(question.question_type)}>
          {question.question_type}
        </Badge>
        <Badge variant="default">{question.domain}</Badge>
      </div>

      <h2 className="text-xl font-semibold mb-6 leading-relaxed">
        {question.question_text}
      </h2>

      {isAISpeaking && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-purple-400 text-sm"
        >
          <motion.div
            className="flex gap-0.5"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.2, repeat: Infinity }}
          >
            <span className="w-1 h-3 bg-purple-400 rounded-full" />
            <span className="w-1 h-4 bg-purple-400 rounded-full" />
            <span className="w-1 h-2 bg-purple-400 rounded-full" />
          </motion.div>
          AI is reading this question...
        </motion.div>
      )}
    </motion.div>
  );
}

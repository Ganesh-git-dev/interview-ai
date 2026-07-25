import { motion } from 'framer-motion';
import Badge from '../ui/Badge';
import { getBadgeVariant } from '../../utils/helpers';
import type { Question } from '../../types';

interface QuestionCardProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
}

export default function QuestionCard({ question, questionNumber, totalQuestions }: QuestionCardProps) {
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
    </motion.div>
  );
}

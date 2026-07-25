import { motion } from 'framer-motion';
import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

interface ScoreCardProps {
  overallScore: number;
  recommendation: string;
}

export default function ScoreCard({ overallScore, recommendation }: ScoreCardProps) {
  const getIcon = () => {
    switch (recommendation) {
      case 'Hire':
        return <CheckCircle className="w-8 h-8 text-green-500" />;
      case 'Consider':
        return <AlertTriangle className="w-8 h-8 text-yellow-500" />;
      default:
        return <XCircle className="w-8 h-8 text-red-500" />;
    }
  };

  const getMessage = () => {
    switch (recommendation) {
      case 'Hire':
        return 'Strong candidate! You demonstrated excellent skills.';
      case 'Consider':
        return 'Good potential with some areas for improvement.';
      default:
        return 'Keep practicing! Focus on the recommended labs below.';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-lg p-8 text-center"
    >
      <h1 className="text-2xl font-bold mb-6">Interview Results</h1>

      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        className="inline-flex items-center justify-center w-36 h-36 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white mb-4"
      >
        <span className="text-5xl font-bold">{overallScore.toFixed(0)}</span>
      </motion.div>

      <div className="flex items-center justify-center gap-2 mb-2">
        {getIcon()}
        <span className="text-xl font-semibold">{recommendation}</span>
      </div>

      <p className="text-gray-600">{getMessage()}</p>
    </motion.div>
  );
}

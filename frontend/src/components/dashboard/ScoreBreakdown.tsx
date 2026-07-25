import { motion } from 'framer-motion';

interface ScoreBreakdownProps {
  technical: number;
  completeness: number;
  communication: number;
  overall: number;
}

export default function ScoreBreakdown({
  technical,
  completeness,
  communication,
  overall,
}: ScoreBreakdownProps) {
  const scores = [
    { label: 'Technical', value: technical, color: 'text-blue-400' },
    { label: 'Completeness', value: completeness, color: 'text-green-400' },
    { label: 'Communication', value: communication, color: 'text-purple-400' },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        {scores.map((score, i) => (
          <motion.div
            key={score.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-gray-900 rounded-xl p-4 text-center"
          >
            <div className={`text-3xl font-bold ${score.color}`}>
              {score.value}
            </div>
            <div className="text-gray-400 text-sm mt-1">{score.label}</div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
        className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-center"
      >
        <div className="text-5xl font-bold mb-1">{overall}</div>
        <div className="text-blue-100">Overall Score</div>
      </motion.div>
    </div>
  );
}

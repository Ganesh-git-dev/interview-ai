import { motion } from 'framer-motion';
import Badge from '../ui/Badge';
import type { LabRecommendation } from '../../types';

interface LabRecommendationsProps {
  recommendations: LabRecommendation[];
}

const priorityBadge = (priority: string) => {
  switch (priority) {
    case 'high':
      return <Badge variant="technical">High Priority</Badge>;
    case 'medium':
      return <Badge variant="behavioural">Medium</Badge>;
    default:
      return <Badge variant="lab">Low</Badge>;
  }
};

export default function LabRecommendations({ recommendations }: LabRecommendationsProps) {
  if (recommendations.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg p-8 text-white"
    >
      <h2 className="text-xl font-semibold mb-4">Recommended PWNDORA Labs</h2>
      <div className="grid md:grid-cols-2 gap-4">
        {recommendations.map((rec, i) => (
          <motion.div
            key={rec.lab_name}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 * i }}
            className="bg-white/10 rounded-xl p-4 backdrop-blur-sm"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-sm">{rec.lab_name}</h3>
              {priorityBadge(rec.priority)}
            </div>
            <p className="text-blue-100 text-sm mb-2">{rec.reason}</p>
            <div className="flex items-center justify-between text-xs text-blue-200">
              <span>{rec.lab_domain}</span>
              <span>{rec.estimated_hours}h estimated</span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

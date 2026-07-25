import { motion } from 'framer-motion';
import DomainRadarChart from '../dashboard/DomainRadarChart';

interface DomainPerformanceProps {
  data: Record<string, number>;
}

export default function DomainPerformance({ data }: DomainPerformanceProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-white rounded-2xl shadow-lg p-6"
    >
      <h2 className="text-lg font-semibold mb-4">Domain Performance</h2>
      <DomainRadarChart data={data} />
    </motion.div>
  );
}

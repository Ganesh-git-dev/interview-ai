import { motion } from 'framer-motion';
import RoleReadinessChart from '../dashboard/RoleReadinessChart';

interface RoleReadinessProps {
  data: Record<string, number>;
}

export default function RoleReadiness({ data }: RoleReadinessProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-white rounded-2xl shadow-lg p-6"
    >
      <h2 className="text-lg font-semibold mb-4">Role Readiness</h2>
      <RoleReadinessChart data={data} />
    </motion.div>
  );
}

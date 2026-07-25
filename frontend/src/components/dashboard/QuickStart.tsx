import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';

interface QuickStartProps {
  onUseSample: () => void;
}

export default function QuickStart({ onUseSample }: QuickStartProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg p-8 text-white"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
          <Zap className="w-5 h-5" />
        </div>
        <h3 className="text-lg font-semibold">Quick Start</h3>
      </div>
      <p className="text-blue-100 mb-4">
        Don't have a JD handy? Try our sample SOC Analyst position to see how it works.
      </p>
      <button
        onClick={onUseSample}
        className="px-4 py-2 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition"
      >
        Use Sample JD
      </button>
    </motion.div>
  );
}

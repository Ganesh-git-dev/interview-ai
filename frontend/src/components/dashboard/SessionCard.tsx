import { motion } from 'framer-motion';
import { Calendar, ArrowRight, BarChart3 } from 'lucide-react';
import Button from '../ui/Button';
import Badge from '../ui/Badge';

interface SessionCardProps {
  session: {
    id: number;
    role_title?: string;
    score?: number;
    date: string;
    status: string;
  };
  onView: (id: number) => void;
  index: number;
}

export default function SessionCard({ session, onView, index }: SessionCardProps) {
  const dateStr = new Date(session.date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-gray-900 truncate">
              {session.role_title || `Session #${session.id}`}
            </h3>
            <Badge variant={session.status === 'completed' ? 'default' : 'behavioural'}>
              {session.status}
            </Badge>
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {dateStr}
            </span>
            {session.score !== undefined && (
              <span className="flex items-center gap-1">
                <BarChart3 className="w-3.5 h-3.5" />
                Score: {session.score}
              </span>
            )}
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onView(session.id)}
        >
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
}

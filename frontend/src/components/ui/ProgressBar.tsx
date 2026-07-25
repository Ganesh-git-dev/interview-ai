import { motion } from 'framer-motion';
import { cn } from '../../utils/helpers';

interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  showLabel?: boolean;
  variant?: 'blue' | 'gradient';
}

export default function ProgressBar({
  value,
  max = 100,
  className,
  showLabel = false,
  variant = 'blue',
}: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <div className={cn('space-y-1', className)}>
      {showLabel && (
        <div className="flex justify-between text-sm text-gray-500">
          <span>{value}/{max}</span>
          <span>{Math.round(percentage)}%</span>
        </div>
      )}
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          className={cn(
            'h-full rounded-full',
            variant === 'gradient'
              ? 'bg-gradient-to-r from-blue-500 to-purple-600'
              : 'bg-blue-600'
          )}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

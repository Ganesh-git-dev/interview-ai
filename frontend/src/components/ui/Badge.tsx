import { cn } from '../../utils/helpers';

interface BadgeProps {
  variant?: 'technical' | 'scenario' | 'behavioural' | 'lab' | 'default';
  children: React.ReactNode;
  className?: string;
}

const variantStyles = {
  technical: 'bg-blue-100 text-blue-700',
  scenario: 'bg-amber-100 text-amber-700',
  behavioural: 'bg-purple-100 text-purple-700',
  lab: 'bg-emerald-100 text-emerald-700',
  default: 'bg-gray-100 text-gray-700',
};

export default function Badge({ variant = 'default', children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium',
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

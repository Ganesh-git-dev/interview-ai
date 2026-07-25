import ProgressBar from '../ui/ProgressBar';

interface ProgressIndicatorProps {
  current: number;
  total: number;
}

export default function ProgressIndicator({ current, total }: ProgressIndicatorProps) {
  return (
    <div className="mb-8">
      <ProgressBar value={current} max={total} showLabel variant="gradient" />
    </div>
  );
}

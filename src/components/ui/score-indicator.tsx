import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface ScoreIndicatorProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

function getScoreLevel(score: number): 'high' | 'medium' | 'low' {
  if (score >= 70) return 'high';
  if (score >= 40) return 'medium';
  return 'low';
}

const levelConfig = {
  high: { icon: TrendingUp, className: 'score-high' },
  medium: { icon: Minus, className: 'score-medium' },
  low: { icon: TrendingDown, className: 'score-low' },
};

const sizeConfig = {
  sm: { badge: 'px-2 py-0.5 text-xs gap-1', icon: 'h-3 w-3' },
  md: { badge: 'px-2.5 py-1 text-sm gap-1.5', icon: 'h-4 w-4' },
  lg: { badge: 'px-3 py-1.5 text-base gap-2', icon: 'h-5 w-5' },
};

export function ScoreIndicator({ 
  score, 
  size = 'md', 
  showIcon = true,
  className 
}: ScoreIndicatorProps) {
  const level = getScoreLevel(score);
  const config = levelConfig[level];
  const sizes = sizeConfig[size];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border font-semibold tabular-nums',
        config.className,
        sizes.badge,
        className
      )}
    >
      {showIcon && <Icon className={sizes.icon} />}
      <span>{score}</span>
    </span>
  );
}

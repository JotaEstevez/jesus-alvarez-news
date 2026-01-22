import { cn } from '@/lib/utils';
import { PostStatus } from '@/types/newsroom';
import { Clock, Eye, CheckCircle2, Send } from 'lucide-react';

interface StatusBadgeProps {
  status: PostStatus;
  size?: 'sm' | 'md';
  className?: string;
}

const statusConfig: Record<PostStatus, { 
  icon: typeof Clock; 
  label: string; 
  className: string;
}> = {
  pending: {
    icon: Clock,
    label: 'Pendiente',
    className: 'bg-warning/10 text-warning border-warning/20',
  },
  reviewed: {
    icon: Eye,
    label: 'Revisado',
    className: 'bg-info/10 text-info border-info/20',
  },
  approved: {
    icon: CheckCircle2,
    label: 'Aprobado',
    className: 'bg-success/10 text-success border-success/20',
  },
  published: {
    icon: Send,
    label: 'Publicado',
    className: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
  },
};

const sizeConfig = {
  sm: { badge: 'px-2 py-0.5 text-xs gap-1', icon: 'h-3 w-3' },
  md: { badge: 'px-2.5 py-1 text-sm gap-1.5', icon: 'h-4 w-4' },
};

export function StatusBadge({ status, size = 'md', className }: StatusBadgeProps) {
  const config = statusConfig[status];
  const sizes = sizeConfig[size];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border font-medium',
        config.className,
        sizes.badge,
        className
      )}
    >
      <Icon className={sizes.icon} />
      <span>{config.label}</span>
    </span>
  );
}

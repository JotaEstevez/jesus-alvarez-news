import { cn } from '@/lib/utils';
import { Platform } from '@/types/newsroom';
import { Linkedin, Twitter, Instagram, Facebook } from 'lucide-react';

interface PlatformBadgeProps {
  platform: Platform;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

const platformConfig = {
  linkedin: {
    icon: Linkedin,
    label: 'LinkedIn',
    className: 'platform-linkedin',
  },
  twitter: {
    icon: Twitter,
    label: 'X',
    className: 'platform-twitter',
  },
  instagram: {
    icon: Instagram,
    label: 'Instagram',
    className: 'platform-instagram',
  },
  facebook: {
    icon: Facebook,
    label: 'Facebook',
    className: 'platform-facebook',
  },
};

const sizeConfig = {
  sm: { badge: 'px-2 py-0.5 text-xs gap-1', icon: 'h-3 w-3' },
  md: { badge: 'px-2.5 py-1 text-sm gap-1.5', icon: 'h-4 w-4' },
  lg: { badge: 'px-3 py-1.5 text-sm gap-2', icon: 'h-5 w-5' },
};

export function PlatformBadge({ 
  platform, 
  size = 'md', 
  showLabel = true,
  className 
}: PlatformBadgeProps) {
  const config = platformConfig[platform];
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
      {showLabel && <span>{config.label}</span>}
    </span>
  );
}

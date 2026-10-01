import * as React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Users, CircleDot } from 'lucide-react';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--bg-raised))] text-[hsl(var(--text-main))] shadow-sm", className)} {...props} />
  )
);
Card.displayName = "Card";

export const GlassCard = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("rounded-xl border border-white/10 bg-black/40 backdrop-blur-md text-[hsl(var(--text-main))] shadow-float", className)} {...props} />
  )
);
GlassCard.displayName = "GlassCard";

export const ClickableCard = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--bg-raised))] text-[hsl(var(--text-main))] shadow-sm cursor-pointer transition-all hover:-translate-y-1 hover:shadow-float hover:border-[hsl(var(--brand-500))]/50", className)} {...props} />
  )
);
ClickableCard.displayName = "ClickableCard";

export interface Community {
  id: string;
  name: string;
  description: string;
  icon: string;
  memberCount: number;
  onlineCount: number;
  category: string;
  tags?: string[];
}

export interface CommunityCardProps extends React.HTMLAttributes<HTMLDivElement> {
  community: Community;
  onJoin?: () => void;
  isJoined?: boolean;
}

export const CommunityCard = React.forwardRef<HTMLDivElement, CommunityCardProps>(
  ({ className, community, onJoin, isJoined, ...props }, ref) => (
    <Card ref={ref} className={cn("p-5 flex flex-col gap-4", className)} {...props}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[hsl(var(--bg-overlay))] text-2xl">
            {community.icon}
          </div>
          <div>
            <h3 className="font-semibold text-lg">{community.name}</h3>
            <span className="inline-flex items-center rounded-full bg-[hsl(var(--bg-overlay))] px-2.5 py-0.5 text-xs font-medium text-[hsl(var(--brand-500))]">
              {community.category}
            </span>
          </div>
        </div>
        {onJoin && (
          <button
            onClick={onJoin}
            className={cn(
              "px-4 py-1.5 rounded-full text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[hsl(var(--brand-500))] focus:ring-offset-2 focus:ring-offset-[hsl(var(--bg-raised))]",
              isJoined 
                ? "bg-[hsl(var(--bg-overlay))] text-[hsl(var(--text-muted))] hover:text-white" 
                : "bg-[hsl(var(--brand-500))] text-white hover:bg-[hsl(var(--brand-600))]"
            )}
          >
            {isJoined ? 'Joined' : 'Join'}
          </button>
        )}
      </div>
      
      <p className="text-sm text-[hsl(var(--text-muted))] line-clamp-2">
        {community.description}
      </p>
      
      <div className="flex items-center gap-4 text-xs text-[hsl(var(--text-muted))] mt-auto pt-2">
        <div className="flex items-center gap-1.5">
          <Users className="h-4 w-4" />
          <span>{community.memberCount.toLocaleString()} members</span>
        </div>
        <div className="flex items-center gap-1.5">
          <CircleDot className="h-4 w-4 text-green-500" />
          <span>{community.onlineCount.toLocaleString()} online</span>
        </div>
      </div>
      
      {community.tags && community.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {community.tags.map(tag => (
            <span key={tag} className="text-xs bg-[hsl(var(--bg-overlay))] text-[hsl(var(--text-muted))] px-2 py-0.5 rounded-md">
              #{tag}
            </span>
          ))}
        </div>
      )}
    </Card>
  )
);
CommunityCard.displayName = "CommunityCard";

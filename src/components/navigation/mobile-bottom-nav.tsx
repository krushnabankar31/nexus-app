'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Compass, MessageCircle, Bell, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth-store';
import { getInitials } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/discover', label: 'Discover', icon: Compass },
  { href: '/messages', label: 'Messages', icon: MessageCircle },
  { href: '/', label: 'Home', icon: Home, isCenter: true },
  { href: '/notifications', label: 'Alerts', icon: Bell },
  { href: '/profile/me', label: 'Profile', icon: User },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const { user } = useAuthStore();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t border-white/8 bg-[hsl(var(--bg-raised))/90] backdrop-blur-xl md:hidden">
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
        const Icon = item.icon;

        if (item.isCenter) {
          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative -top-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-violet-500 shadow-glow transition-transform active:scale-95"
            >
              <Icon className="h-6 w-6 text-white" />
            </Link>
          );
        }

        if (item.label === 'Profile' && user) {
          return (
            <Link
              key={item.href}
              href={`/profile/${user.id}`}
              className="flex flex-col items-center gap-1 px-4 py-2"
            >
              <div className={cn(
                'h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold ring-2 transition-all',
                isActive ? 'ring-brand-500' : 'ring-transparent'
              )}
                style={{ background: `url(${user.avatar}) center/cover, linear-gradient(135deg, #6366f1, #8b5cf6)` }}
              >
                {!user.avatar && <span className="text-white">{getInitials(user.displayName)}</span>}
              </div>
              <span className={cn('text-[10px] font-medium', isActive ? 'text-brand-400' : 'text-gray-500')}>
                Profile
              </span>
            </Link>
          );
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center gap-1 px-4 py-2"
          >
            <div className="relative">
              <Icon className={cn('h-6 w-6 transition-colors', isActive ? 'text-brand-400' : 'text-gray-500')} />
              {isActive && (
                <span className="absolute -bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-brand-500" />
              )}
            </div>
            <span className={cn('text-[10px] font-medium transition-colors', isActive ? 'text-brand-400' : 'text-gray-500')}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

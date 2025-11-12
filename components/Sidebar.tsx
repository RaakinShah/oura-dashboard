'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Brain,
  Moon,
  Activity,
  Heart,
  BarChart3,
  Target,
  Settings,
  Crown,
  Clock,
  TrendingDown,
  Shield,
  Coffee,
  Star,
} from 'lucide-react';
import ThemeToggle from './ThemeToggle';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'AI Insights', href: '/insights', icon: Brain, luxury: true },
  { name: 'Sleep', href: '/sleep', icon: Moon },
  { name: 'Activity', href: '/activity', icon: Activity },
  { name: 'Readiness', href: '/readiness', icon: Heart },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Goals', href: '/goals', icon: Target },
  { name: 'Chronotype', href: '/chronotype', icon: Clock },
  { name: 'Sleep Debt', href: '/sleep-debt', icon: TrendingDown },
  { name: 'Illness Detection', href: '/illness-detection', icon: Shield },
  { name: 'Lifestyle', href: '/lifestyle', icon: Coffee },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-screen w-80 flex-col bg-gradient-to-b from-charcoal via-deep-purple to-charcoal border-r border-gold border-opacity-20">
      {/* Luxury Logo */}
      <div className="flex h-28 items-center px-10 border-b border-gold border-opacity-20">
        <div className="flex items-center gap-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-gold shadow-dramatic animate-glow-pulse">
            <Crown className="h-8 w-8 text-charcoal" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gold animate-shimmer-gold">Oura</h1>
            <p className="text-xs text-platinum uppercase tracking-widest">Luxury Edition</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-6 py-10 overflow-y-auto space-y-2">
        {navigation.map((item, index) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                group relative flex items-center gap-4 rounded-2xl px-5 py-4 text-base font-medium
                transition-all duration-300 animate-slide-elegant
                ${isActive
                  ? 'bg-gradient-to-r from-gold/20 to-gold/10 text-gold shadow-luxury'
                  : 'text-platinum hover:bg-smoke hover:text-gold'
                }
              `}
              style={{ animationDelay: `${index * 0.03}s` }}
            >
              {/* Active indicator - gold accent */}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-10 bg-gradient-to-b from-gold-light to-gold-dark rounded-r-full shadow-luxury" />
              )}

              {/* Icon */}
              <div className={`${isActive ? 'text-gold' : ''} transition-all group-hover:scale-110`}>
                <Icon className="h-6 w-6" strokeWidth={2.5} />
              </div>

              {/* Label */}
              <span className="flex-1">{item.name}</span>

              {/* Luxury Badge */}
              {item.luxury && (
                <span className="px-2.5 py-1 text-[9px] font-bold bg-gradient-gold text-charcoal rounded-full shadow-sm uppercase tracking-wider">
                  Premium
                </span>
              )}

              {/* Hover glow effect */}
              {isActive && (
                <div className="absolute inset-0 rounded-2xl bg-gold opacity-0 group-hover:opacity-5 transition-opacity pointer-events-none" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Luxury Footer */}
      <div className="border-t border-gold border-opacity-20 p-8 space-y-6">
        {/* Premium Status */}
        <div className="rounded-2xl bg-gradient-to-br from-gold/10 to-bronze/10 p-5 border border-gold border-opacity-30">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-gold uppercase tracking-widest">Elite Status</span>
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="h-2.5 w-2.5 rounded-full bg-gold"></div>
                <div className="absolute inset-0 h-2.5 w-2.5 rounded-full bg-gold animate-ping opacity-75"></div>
              </div>
              <span className="text-xs font-bold text-gold-light">Active</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-platinum">
            <Star className="h-3 w-3 text-gold" />
            <span>All premium features enabled</span>
          </div>
        </div>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Footer Branding */}
        <div className="text-center pt-3 border-t border-gold border-opacity-10">
          <p className="text-[10px] text-platinum uppercase tracking-widest">
            Powered by{' '}
            <span className="font-bold text-gold">Elite AI</span>
          </p>
        </div>
      </div>
    </div>
  );
}

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
  Sparkles,
  Clock,
  TrendingDown,
  Shield,
  Coffee,
} from 'lucide-react';
import ThemeToggle from './ThemeToggle';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'AI Insights', href: '/insights', icon: Brain, badge: 'AI' },
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
    <div className="flex h-screen w-72 flex-col bg-card border-r border-border">
      {/* Premium Logo */}
      <div className="flex h-24 items-center px-8 border-b border-border">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-pink-500 shadow-lg animate-glow">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Oura</h1>
            <p className="text-xs text-muted-foreground">Health Dashboard</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-8 overflow-y-auto space-y-1.5">
        {navigation.map((item, index) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                group relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium
                transition-all duration-200 animate-fade-up
                ${isActive
                  ? 'bg-gradient-to-r from-violet-50 to-pink-50 dark:from-violet-900/20 dark:to-pink-900/20 text-violet-700 dark:text-violet-300 shadow-sm'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }
              `}
              style={{ animationDelay: `${index * 0.02}s` }}
            >
              {/* Active indicator - gradient bar */}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-violet-500 to-pink-500 rounded-r-full" />
              )}

              {/* Icon with gradient on active */}
              <div className={`${isActive ? 'text-violet-600 dark:text-violet-400' : ''} transition-transform group-hover:scale-110`}>
                <Icon className="h-5 w-5" strokeWidth={2.5} />
              </div>

              {/* Label */}
              <span className="flex-1">{item.name}</span>

              {/* Badge */}
              {item.badge && (
                <span className="px-2 py-0.5 text-[10px] font-bold bg-gradient-to-r from-violet-500 to-pink-500 text-white rounded-full shadow-sm">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Premium Footer */}
      <div className="border-t border-border p-6 space-y-4">
        {/* Status Indicator */}
        <div className="rounded-xl bg-gradient-to-br from-emerald-50 to-cyan-50 dark:from-emerald-900/10 dark:to-cyan-900/10 p-4 border border-emerald-200/50 dark:border-emerald-800/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-emerald-900 dark:text-emerald-100">System Status</span>
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                <div className="absolute inset-0 h-2 w-2 rounded-full bg-emerald-500 animate-ping opacity-75"></div>
              </div>
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">Live</span>
            </div>
          </div>
          <div className="text-[10px] text-emerald-700/70 dark:text-emerald-300/70">
            All services operational
          </div>
        </div>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Footer Text */}
        <div className="text-center pt-2">
          <p className="text-[10px] text-muted-foreground">
            Powered by{' '}
            <span className="font-semibold bg-gradient-to-r from-violet-600 to-pink-600 bg-clip-text text-transparent">
              AI
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

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
  { name: 'Dashboard', href: '/', icon: LayoutDashboard, color: 'text-purple-400' },
  { name: 'AI Insights', href: '/insights', icon: Brain, color: 'text-pink-400' },
  { name: 'Sleep', href: '/sleep', icon: Moon, color: 'text-indigo-400' },
  { name: 'Activity', href: '/activity', icon: Activity, color: 'text-green-400' },
  { name: 'Readiness', href: '/readiness', icon: Heart, color: 'text-red-400' },
  { name: 'Analytics', href: '/analytics', icon: BarChart3, color: 'text-blue-400' },
  { name: 'Goals', href: '/goals', icon: Target, color: 'text-yellow-400' },
  { name: 'Chronotype', href: '/chronotype', icon: Clock, color: 'text-amber-400' },
  { name: 'Sleep Debt', href: '/sleep-debt', icon: TrendingDown, color: 'text-orange-400' },
  { name: 'Illness Detection', href: '/illness-detection', icon: Shield, color: 'text-teal-400' },
  { name: 'Lifestyle', href: '/lifestyle', icon: Coffee, color: 'text-cyan-400' },
  { name: 'Settings', href: '/settings', icon: Settings, color: 'text-gray-400' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-screen w-72 flex-col bg-gradient-to-b from-emerald-950 via-teal-950 to-slate-950 dark:from-slate-950 dark:via-emerald-950 dark:to-black text-white shadow-2xl border-r border-emerald-900/30 dark:border-emerald-900/20">
      {/* Logo - Nature-Inspired */}
      <div className="flex h-20 items-center justify-center border-b border-emerald-800/30 dark:border-emerald-900/20 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg animate-glow-nature">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-300 via-teal-300 to-emerald-300 bg-clip-text text-transparent">
              Oura Dashboard
            </h1>
            <p className="text-[10px] text-emerald-200/40">Personal Health Insights</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2 px-4 py-6 overflow-y-auto">
        {navigation.map((item, index) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`group relative flex items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-semibold transition-all duration-500 ease-out animate-slide-in-right ${
                isActive
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/20 scale-105'
                  : 'text-emerald-200/60 hover:bg-emerald-900/30 hover:text-white hover:scale-102 active:scale-98'
              }`}
              style={{
                animationDelay: `${index * 50}ms`,
              }}
            >
              {/* Active indicator */}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full animate-scale-in" />
              )}

              {/* Icon with color */}
              <div className={`${isActive ? 'text-white' : item.color} transition-all duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                <Icon className="h-5 w-5" strokeWidth={2.5} />
              </div>

              {/* Label */}
              <span className="flex-1">{item.name}</span>

              {/* Hover effect */}
              {!isActive && (
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-600/0 to-teal-600/0 group-hover:from-emerald-600/10 group-hover:to-teal-600/10 transition-all duration-500" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer - Nature Theme */}
      <div className="border-t border-emerald-800/30 dark:border-emerald-900/20 p-5 space-y-3 backdrop-blur-sm">
        <div className="glass-peaceful rounded-2xl p-3 bg-gradient-to-br from-emerald-900/30 to-teal-900/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-emerald-200/50 font-medium">Today</span>
            <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse-gentle" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold bg-gradient-to-r from-emerald-300 to-teal-300 bg-clip-text text-transparent">
              Active
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-[10px] text-emerald-200/30 font-medium">
            Powered by Oura
          </p>
          <div className="flex items-center gap-1">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse-gentle" />
            <span className="text-[10px] text-emerald-400 font-semibold">Live</span>
          </div>
        </div>

        {/* Dark Mode Toggle */}
        <ThemeToggle />
      </div>
    </div>
  );
}

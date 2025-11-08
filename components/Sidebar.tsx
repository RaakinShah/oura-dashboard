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
    <div className="flex h-screen w-72 flex-col bg-gradient-to-b from-gray-900 via-gray-900 to-gray-950 text-white shadow-2xl">
      {/* Logo */}
      <div className="flex h-20 items-center justify-center border-b border-gray-800/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg animate-glow">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              Oura Dashboard
            </h1>
            <p className="text-[10px] text-gray-500">AI-Powered Health Insights</p>
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
              className={`group relative flex items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-semibold transition-all duration-300 ease-out animate-slide-in-right ${
                isActive
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30 scale-105'
                  : 'text-gray-400 hover:bg-gray-800/50 hover:text-white hover:scale-102 active:scale-98'
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
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-600/0 to-pink-600/0 group-hover:from-purple-600/10 group-hover:to-pink-600/10 transition-all duration-300" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer with stats */}
      <div className="border-t border-gray-800/50 p-5 space-y-3 backdrop-blur-sm">
        <div className="glass rounded-2xl p-3 bg-gradient-to-br from-gray-800/40 to-gray-900/40">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-400 font-medium">Today's Status</span>
            <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              Good
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-[10px] text-gray-500 font-medium">
            Powered by Oura Ring
          </p>
          <div className="flex items-center gap-1">
            <div className="h-1.5 w-1.5 rounded-full bg-purple-500 animate-pulse" />
            <span className="text-[10px] text-purple-400 font-semibold">Live</span>
          </div>
        </div>

        {/* Dark Mode Toggle */}
        <ThemeToggle />
      </div>
    </div>
  );
}

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
  { name: 'Dashboard', href: '/', icon: LayoutDashboard, color: 'text-blue-500' },
  { name: 'AI Insights', href: '/insights', icon: Brain, color: 'text-purple-500' },
  { name: 'Sleep', href: '/sleep', icon: Moon, color: 'text-indigo-500' },
  { name: 'Activity', href: '/activity', icon: Activity, color: 'text-green-500' },
  { name: 'Readiness', href: '/readiness', icon: Heart, color: 'text-red-500' },
  { name: 'Analytics', href: '/analytics', icon: BarChart3, color: 'text-blue-600' },
  { name: 'Goals', href: '/goals', icon: Target, color: 'text-amber-500' },
  { name: 'Chronotype', href: '/chronotype', icon: Clock, color: 'text-orange-500' },
  { name: 'Sleep Debt', href: '/sleep-debt', icon: TrendingDown, color: 'text-pink-500' },
  { name: 'Illness Detection', href: '/illness-detection', icon: Shield, color: 'text-teal-500' },
  { name: 'Lifestyle', href: '/lifestyle', icon: Coffee, color: 'text-cyan-500' },
  { name: 'Settings', href: '/settings', icon: Settings, color: 'text-gray-500' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-screen w-72 flex-col bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800">
      {/* Professional Logo */}
      <div className="flex h-20 items-center px-6 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-md">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold">Oura Dashboard</h1>
            <p className="text-[10px] text-gray-500 dark:text-gray-400">Health Insights</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 overflow-y-auto space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                isActive
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50'
              }`}
            >
              {/* Active indicator */}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-600 dark:bg-blue-400 rounded-r-full" />
              )}

              {/* Icon */}
              <div className={`${isActive ? 'text-blue-600 dark:text-blue-400' : item.color + ' opacity-75 group-hover:opacity-100'} transition-opacity`}>
                <Icon className="h-5 w-5" strokeWidth={2} />
              </div>

              {/* Label */}
              <span className="flex-1">{item.name}</span>

              {/* Badge (if needed) */}
              {item.name === 'AI Insights' && (
                <span className="px-2 py-0.5 text-[10px] font-bold bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full">
                  NEW
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Professional Footer */}
      <div className="border-t border-gray-200 dark:border-gray-800 p-4 space-y-3">
        {/* Status Card */}
        <div className="rounded-lg bg-gray-50 dark:bg-gray-800/50 p-3 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">System Status</span>
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse-ring" />
              <span className="text-xs text-green-600 dark:text-green-400 font-semibold">Active</span>
            </div>
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            All services operational
          </div>
        </div>

        {/* Dark Mode Toggle */}
        <ThemeToggle />

        {/* Footer Text */}
        <div className="text-center">
          <p className="text-[10px] text-gray-400 dark:text-gray-600">
            Powered by Oura API
          </p>
        </div>
      </div>
    </div>
  );
}

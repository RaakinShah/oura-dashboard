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
  Clock,
  TrendingDown,
  Shield,
  Coffee,
  LineChart,
} from 'lucide-react';
import ThemeToggle from './ThemeToggle';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'AI Insights', href: '/insights', icon: Brain },
  { name: 'Sleep', href: '/sleep', icon: Moon },
  { name: 'Activity', href: '/activity', icon: Activity },
  { name: 'Readiness', href: '/readiness', icon: Heart },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Statistics Lab', href: '/statistics', icon: LineChart },
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
    <div className="flex h-screen w-80 flex-col bg-white border-r border-stone-200">
      {/* Logo */}
      <div className="flex h-20 items-center px-8 border-b border-stone-200">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-sage-800 to-sage-900 shadow-sm">
            <div className="h-5 w-5 rounded-full border-2 border-sage-100"></div>
          </div>
          <div>
            <h1 className="text-xl font-light tracking-tight text-stone-900">Oura</h1>
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
              className={`
                group flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium
                transition-all duration-200 ease-out
                ${isActive
                  ? 'bg-gradient-to-r from-sage-100/80 to-sage-50/50 text-sage-900 border border-sage-200/50'
                  : 'text-stone-600 hover:bg-sage-50/30 hover:text-sage-800 border border-transparent'
                }
              `}
            >
              {/* Icon */}
              <div className={`${isActive ? 'text-sage-700' : 'text-stone-400 group-hover:text-sage-600'} transition-colors duration-200`}>
                <Icon className="h-5 w-5" strokeWidth={1.5} />
              </div>

              {/* Label */}
              <span className="flex-1">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-stone-200 p-6 space-y-4">
        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Footer Text */}
        <div className="text-center pt-2">
          <p className="text-xs text-stone-400">
            Powered by AI
          </p>
        </div>
      </div>
    </div>
  );
}

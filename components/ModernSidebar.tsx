'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
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
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useState } from 'react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard, color: 'from-blue-500 to-cyan-500' },
  { name: 'AI Insights', href: '/insights', icon: Brain, color: 'from-purple-500 to-pink-500' },
  { name: 'Sleep', href: '/sleep', icon: Moon, color: 'from-indigo-500 to-purple-500' },
  { name: 'Activity', href: '/activity', icon: Activity, color: 'from-green-500 to-emerald-500' },
  { name: 'Readiness', href: '/readiness', icon: Heart, color: 'from-red-500 to-rose-500' },
  { name: 'Analytics', href: '/analytics', icon: BarChart3, color: 'from-orange-500 to-amber-500' },
  { name: 'Statistics Lab', href: '/statistics', icon: LineChart, color: 'from-violet-500 to-purple-500' },
  { name: 'Goals', href: '/goals', icon: Target, color: 'from-teal-500 to-cyan-500' },
  { name: 'Chronotype', href: '/chronotype', icon: Clock, color: 'from-sky-500 to-blue-500' },
  { name: 'Sleep Debt', href: '/sleep-debt', icon: TrendingDown, color: 'from-rose-500 to-red-500' },
  { name: 'Illness Detection', href: '/illness-detection', icon: Shield, color: 'from-emerald-500 to-teal-500' },
  { name: 'Lifestyle', href: '/lifestyle', icon: Coffee, color: 'from-amber-500 to-orange-500' },
];

export default function ModernSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <motion.div
      initial={false}
      animate={{ width: collapsed ? 80 : 280 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="relative flex h-screen flex-col bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border-r border-slate-700/50 shadow-2xl"
    >
      {/* Logo */}
      <div className="flex h-20 items-center justify-between px-6 border-b border-slate-700/50">
        <motion.div
          initial={false}
          animate={{ opacity: collapsed ? 0 : 1 }}
          transition={{ duration: 0.2 }}
          className="flex items-center gap-3"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 shadow-lg shadow-cyan-500/50">
            <div className="h-5 w-5 rounded-full border-2 border-white"></div>
          </div>
          {!collapsed && (
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                Oura
              </h1>
              <p className="text-xs text-slate-400">Health Dashboard</p>
            </div>
          )}
        </motion.div>

        {/* Collapse Button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-lg hover:bg-slate-700/50 transition-colors text-slate-400 hover:text-white"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
        <div className="space-y-1">
          {navigation.map((item, index) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link key={item.name} href={item.href}>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03, duration: 0.3 }}
                  className="relative group"
                >
                  <div
                    className={`
                      flex items-center gap-4 rounded-xl px-4 py-3 text-sm font-medium
                      transition-all duration-200 relative overflow-hidden
                      ${isActive
                        ? 'bg-gradient-to-r ' + item.color + ' text-white shadow-lg'
                        : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
                      }
                    `}
                  >
                    {/* Active Indicator */}
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-white/10 rounded-xl"
                        transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                      />
                    )}

                    {/* Icon Container */}
                    <div className={`relative z-10 ${collapsed ? 'mx-auto' : ''}`}>
                      <div className={`
                        p-2 rounded-lg transition-all duration-200
                        ${isActive
                          ? 'bg-white/20 shadow-lg'
                          : 'bg-slate-800/50 group-hover:bg-slate-700/50'
                        }
                      `}>
                        <Icon className="h-5 w-5" strokeWidth={2} />
                      </div>
                    </div>

                    {/* Label */}
                    {!collapsed && (
                      <span className="relative z-10 flex-1">{item.name}</span>
                    )}

                    {/* Hover Effect */}
                    {!isActive && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    )}
                  </div>

                  {/* Tooltip for collapsed state */}
                  {collapsed && (
                    <div className="absolute left-full ml-6 px-3 py-2 bg-slate-800 text-white text-sm rounded-lg shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap z-50 border border-slate-700">
                      {item.name}
                      <div className="absolute right-full top-1/2 -translate-y-1/2 border-8 border-transparent border-r-slate-800" />
                    </div>
                  )}
                </motion.div>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Settings at Bottom */}
      <div className="border-t border-slate-700/50 p-3">
        <Link href="/settings">
          <div
            className={`
              flex items-center gap-4 rounded-xl px-4 py-3 text-sm font-medium
              transition-all duration-200
              ${pathname === '/settings'
                ? 'bg-gradient-to-r from-slate-700 to-slate-600 text-white'
                : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
              }
            `}
          >
            <div className={`relative ${collapsed ? 'mx-auto' : ''}`}>
              <div className={`p-2 rounded-lg ${pathname === '/settings' ? 'bg-white/20' : 'bg-slate-800/50'}`}>
                <Settings className="h-5 w-5" strokeWidth={2} />
              </div>
            </div>
            {!collapsed && <span>Settings</span>}
          </div>
        </Link>

        {/* Footer Info */}
        {!collapsed && (
          <div className="mt-4 px-4 py-3 bg-slate-800/30 rounded-lg border border-slate-700/30">
            <div className="flex items-center gap-2 mb-1">
              <div className="h-2 w-2 rounded-full bg-green-400 shadow-lg shadow-green-400/50 animate-pulse"></div>
              <span className="text-xs font-medium text-slate-300">All Systems Online</span>
            </div>
            <p className="text-xs text-slate-500">Powered by AI & ML</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

'use client';

import { useState } from 'react';
import { Search, Bell, User, Settings, LogOut, Moon, Sun, Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ThemeToggle from './ThemeToggle';

export default function TopNavbar() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  const notifications = [
    { id: 1, title: 'Sleep Score Available', message: 'Your sleep score for last night is ready', time: '5m ago', unread: true },
    { id: 2, title: 'Weekly Report', message: 'Your weekly health report is ready to view', time: '2h ago', unread: true },
    { id: 3, title: 'Goal Achieved', message: 'You reached your activity goal!', time: '1d ago', unread: false },
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-stone-200/50 shadow-sm">
      <div className="flex items-center justify-between h-16 px-6">
        {/* Search Bar */}
        <div className="flex-1 max-w-2xl">
          <div className={`
            relative transition-all duration-300
            ${searchFocused ? 'scale-105' : 'scale-100'}
          `}>
            <Search className={`
              absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors duration-200
              ${searchFocused ? 'text-blue-500' : 'text-stone-400'}
            `} />
            <input
              type="text"
              placeholder="Search health data, insights, or navigate..."
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              className={`
                w-full pl-11 pr-4 py-2.5 rounded-xl border-2 bg-stone-50/50
                transition-all duration-200 focus:outline-none
                ${searchFocused
                  ? 'border-blue-500 bg-white shadow-lg shadow-blue-500/10'
                  : 'border-transparent hover:border-stone-300 hover:bg-white'
                }
              `}
            />
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-1 text-xs font-semibold text-stone-500 bg-white border border-stone-200 rounded shadow-sm">
              ⌘K
            </kbd>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 ml-6">
          {/* Quick Actions */}
          <div className="hidden md:flex items-center gap-1 mr-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-3 py-2 text-sm font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
            >
              Today
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-3 py-2 text-sm font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
            >
              Trends
            </motion.button>
          </div>

          {/* Theme Toggle */}
          <div className="hidden md:block">
            <ThemeToggle />
          </div>

          {/* Notifications */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2.5 rounded-xl hover:bg-stone-100 transition-colors"
            >
              <Bell className="h-5 w-5 text-stone-600" />
              {unreadCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-1 right-1 h-4 w-4 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg"
                >
                  {unreadCount}
                </motion.span>
              )}
            </motion.button>

            {/* Notifications Dropdown */}
            <AnimatePresence>
              {showNotifications && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowNotifications(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-96 bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden z-50"
                  >
                    <div className="p-4 border-b border-stone-200 bg-gradient-to-r from-blue-50 to-purple-50">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-stone-900">Notifications</h3>
                        <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                          Mark all read
                        </button>
                      </div>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className={`p-4 border-b border-stone-100 hover:bg-stone-50 transition-colors cursor-pointer ${notif.unread ? 'bg-blue-50/30' : ''}`}
                        >
                          <div className="flex items-start gap-3">
                            {notif.unread && (
                              <div className="h-2 w-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-stone-900 truncate">
                                {notif.title}
                              </p>
                              <p className="text-sm text-stone-600 mt-1">
                                {notif.message}
                              </p>
                              <p className="text-xs text-stone-500 mt-1">
                                {notif.time}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="p-3 bg-stone-50 border-t border-stone-200">
                      <button className="text-sm text-blue-600 hover:text-blue-700 font-medium w-full text-center">
                        View all notifications
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Profile */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowProfile(!showProfile)}
              className="flex items-center gap-3 p-2 rounded-xl hover:bg-stone-100 transition-colors"
            >
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold shadow-lg">
                OU
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-stone-900">Oura User</p>
                <p className="text-xs text-stone-500">Premium</p>
              </div>
            </motion.button>

            {/* Profile Dropdown */}
            <AnimatePresence>
              {showProfile && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowProfile(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden z-50"
                  >
                    <div className="p-4 border-b border-stone-200 bg-gradient-to-r from-blue-50 to-purple-50">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-lg shadow-lg">
                          OU
                        </div>
                        <div>
                          <p className="font-semibold text-stone-900">Oura User</p>
                          <p className="text-sm text-stone-600">oura@example.com</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-2">
                      <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-stone-100 transition-colors text-sm">
                        <User className="h-4 w-4 text-stone-600" />
                        <span>View Profile</span>
                      </button>
                      <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-stone-100 transition-colors text-sm">
                        <Settings className="h-4 w-4 text-stone-600" />
                        <span>Settings</span>
                      </button>
                      <div className="my-2 border-t border-stone-200" />
                      <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors text-sm text-red-600">
                        <LogOut className="h-4 w-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

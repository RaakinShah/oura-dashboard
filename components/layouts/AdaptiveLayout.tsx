import { ReactNode, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';

export interface Panel {
  id: string;
  title: string;
  content: ReactNode;
  icon?: ReactNode;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  priority?: number; // Higher priority shown first on mobile
}

export interface AdaptiveLayoutProps {
  panels: Panel[];
  variant?: 'sidebar' | 'tabs' | 'accordion' | 'auto';
  sidebarPosition?: 'left' | 'right';
  sidebarWidth?: number;
  className?: string;
}

export function AdaptiveLayout({
  panels,
  variant = 'auto',
  sidebarPosition = 'left',
  sidebarWidth = 280,
  className = '',
}: AdaptiveLayoutProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(panels[0]?.id);
  const [collapsedPanels, setCollapsedPanels] = useState<Set<string>>(
    new Set(panels.filter(p => p.defaultCollapsed).map(p => p.id))
  );

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const effectiveVariant = variant === 'auto'
    ? isMobile
      ? 'tabs'
      : 'sidebar'
    : variant;

  const togglePanel = (id: string) => {
    setCollapsedPanels(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Sort panels by priority
  const sortedPanels = [...panels].sort((a, b) =>
    (b.priority || 0) - (a.priority || 0)
  );

  // Sidebar variant
  if (effectiveVariant === 'sidebar') {
    return (
      <div className={`flex h-full ${className}`}>
        {/* Mobile menu button */}
        {isMobile && (
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg"
          >
            {sidebarOpen ? <X /> : <Menu />}
          </button>
        )}

        {/* Sidebar */}
        <AnimatePresence>
          {(!isMobile || sidebarOpen) && (
            <motion.aside
              className={`${
                isMobile
                  ? 'fixed inset-y-0 z-40 bg-white shadow-xl'
                  : 'relative bg-stone-50'
              } ${sidebarPosition === 'left' ? 'left-0' : 'right-0'} overflow-y-auto`}
              style={{ width: sidebarWidth }}
              initial={isMobile ? { x: sidebarPosition === 'left' ? -sidebarWidth : sidebarWidth } : undefined}
              animate={{ x: 0 }}
              exit={{ x: sidebarPosition === 'left' ? -sidebarWidth : sidebarWidth }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <div className="p-4 space-y-2">
                {sortedPanels.map(panel => (
                  <div key={panel.id}>
                    <button
                      onClick={() => panel.collapsible && togglePanel(panel.id)}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white transition-colors text-left"
                    >
                      {panel.icon}
                      <span className="font-medium text-stone-900">{panel.title}</span>
                      {panel.collapsible && (
                        <span className="ml-auto text-stone-500">
                          {collapsedPanels.has(panel.id) ? '▶' : '▼'}
                        </span>
                      )}
                    </button>

                    <AnimatePresence>
                      {!collapsedPanels.has(panel.id) && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="p-4">{panel.content}</div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Backdrop */}
        {isMobile && sidebarOpen && (
          <motion.div
            className="fixed inset-0 bg-black/50 z-30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            {panels.map(panel => (
              <div key={panel.id} className="mb-8">
                <h2 className="text-xl font-semibold mb-4">{panel.title}</h2>
                {panel.content}
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  // Tabs variant
  if (effectiveVariant === 'tabs') {
    const activePanel = panels.find(p => p.id === activeTab);

    return (
      <div className={`flex flex-col h-full ${className}`}>
        {/* Tab headers */}
        <div className="flex overflow-x-auto border-b border-stone-200 bg-white">
          {sortedPanels.map(panel => (
            <button
              key={panel.id}
              onClick={() => setActiveTab(panel.id)}
              className={`flex items-center gap-2 px-6 py-4 whitespace-nowrap border-b-2 transition-colors ${
                activeTab === panel.id
                  ? 'border-indigo-600 text-indigo-600 font-semibold'
                  : 'border-transparent text-stone-600 hover:text-stone-900'
              }`}
            >
              {panel.icon}
              <span>{panel.title}</span>
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-auto p-6">
          <AnimatePresence mode="wait">
            {activePanel && (
              <motion.div
                key={activePanel.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                {activePanel.content}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  // Accordion variant
  if (effectiveVariant === 'accordion') {
    return (
      <div className={`space-y-2 ${className}`}>
        {sortedPanels.map(panel => (
          <div key={panel.id} className="border border-stone-200 rounded-lg overflow-hidden">
            <button
              onClick={() => togglePanel(panel.id)}
              className="w-full flex items-center justify-between px-6 py-4 bg-white hover:bg-stone-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                {panel.icon}
                <span className="font-semibold text-stone-900">{panel.title}</span>
              </div>
              <span className="text-stone-500">
                {collapsedPanels.has(panel.id) ? '▶' : '▼'}
              </span>
            </button>

            <AnimatePresence>
              {!collapsedPanels.has(panel.id) && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: 'auto' }}
                  exit={{ height: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <div className="p-6 bg-stone-50 border-t border-stone-200">
                    {panel.content}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    );
  }

  return null;
}

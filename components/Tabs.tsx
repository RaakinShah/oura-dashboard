'use client';

import { ReactNode, useState } from 'react';

export interface Tab {
  id: string;
  label: string;
  content: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
}

export interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  onChange?: (tabId: string) => void;
  variant?: 'line' | 'pills' | 'enclosed';
  className?: string;
}

/**
 * Tabs component with multiple variants
 */
export function Tabs({
  tabs,
  defaultTab,
  onChange,
  variant = 'line',
  className = '',
}: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    onChange?.(tabId);
  };

  const activeContent = tabs.find((tab) => tab.id === activeTab)?.content;

  const variantStyles = {
    line: {
      container: 'border-b border-stone-200',
      tab: 'px-4 py-3 border-b-2 transition-all',
      active: 'border-sage-600 text-sage-900 font-medium',
      inactive: 'border-transparent text-stone-600 hover:text-stone-900 hover:border-stone-300',
    },
    pills: {
      container: 'bg-stone-100 p-1 rounded-lg inline-flex gap-1',
      tab: 'px-4 py-2 rounded-md transition-all',
      active: 'bg-white text-sage-900 font-medium shadow-sm',
      inactive: 'text-stone-600 hover:text-stone-900',
    },
    enclosed: {
      container: 'border-b border-stone-200',
      tab: 'px-4 py-3 border border-b-0 rounded-t-lg transition-all',
      active: 'bg-white text-sage-900 font-medium border-stone-200 border-b-white',
      inactive: 'bg-stone-50 text-stone-600 border-transparent hover:border-stone-200',
    },
  };

  const styles = variantStyles[variant];

  return (
    <div className={className}>
      {/* Tab List */}
      <div className={styles.container} role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`panel-${tab.id}`}
            disabled={tab.disabled}
            onClick={() => !tab.disabled && handleTabChange(tab.id)}
            className={`
              ${styles.tab}
              ${activeTab === tab.id ? styles.active : styles.inactive}
              ${tab.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              inline-flex items-center gap-2
            `}
          >
            {tab.icon && <span>{tab.icon}</span>}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Panel */}
      <div
        role="tabpanel"
        id={`panel-${activeTab}`}
        aria-labelledby={activeTab}
        className="py-4"
      >
        {activeContent}
      </div>
    </div>
  );
}

import { ReactNode, useState } from 'react';
import { motion } from 'framer-motion';

export interface Tab {
  id: string;
  label: string;
  icon?: ReactNode;
  content: ReactNode;
  disabled?: boolean;
}

export interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  variant?: 'default' | 'pills' | 'underline';
  orientation?: 'horizontal' | 'vertical';
  onChange?: (tabId: string) => void;
  className?: string;
}

export function Tabs({
  tabs,
  defaultTab,
  variant = 'default',
  orientation = 'horizontal',
  onChange,
  className = '',
}: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    onChange?.(tabId);
  };

  const activeContent = tabs.find((tab) => tab.id === activeTab)?.content;

  const baseTabClass = 'flex items-center gap-2 px-4 py-2 font-medium transition-colors';

  const variantClasses = {
    default: {
      container: 'border-b border-stone-200',
      tab: 'border-b-2 border-transparent hover:border-stone-300',
      active: 'border-indigo-600 text-indigo-600',
      inactive: 'text-stone-600',
    },
    pills: {
      container: 'bg-stone-100 p-1 rounded-lg',
      tab: 'rounded-md hover:bg-white/50',
      active: 'bg-white text-stone-900 shadow-sm',
      inactive: 'text-stone-600',
    },
    underline: {
      container: '',
      tab: 'relative hover:text-stone-900',
      active: 'text-indigo-600',
      inactive: 'text-stone-600',
    },
  };

  const config = variantClasses[variant];

  return (
    <div className={className}>
      <div
        className={`flex ${orientation === 'vertical' ? 'flex-col' : 'flex-row'} ${config.container}`}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => !tab.disabled && handleTabChange(tab.id)}
            disabled={tab.disabled}
            className={`${baseTabClass} ${config.tab} ${
              activeTab === tab.id ? config.active : config.inactive
            } ${tab.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} relative`}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {variant === 'underline' && activeTab === tab.id && (
              <motion.div
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"
                layoutId="underline"
              />
            )}
          </button>
        ))}
      </div>
      <div className="mt-4">{activeContent}</div>
    </div>
  );
}

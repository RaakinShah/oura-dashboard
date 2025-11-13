import { ReactNode, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

export interface AccordionItem {
  id: string;
  title: string;
  content: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
}

export interface AccordionProps {
  items: AccordionItem[];
  multiple?: boolean;
  defaultExpanded?: string[];
  variant?: 'default' | 'separated' | 'bordered';
  className?: string;
}

export function Accordion({
  items,
  multiple = false,
  defaultExpanded = [],
  variant = 'default',
  className = '',
}: AccordionProps) {
  const [expanded, setExpanded] = useState<string[]>(defaultExpanded);

  const toggleItem = (id: string) => {
    if (multiple) {
      setExpanded((prev) =>
        prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
      );
    } else {
      setExpanded((prev) => (prev.includes(id) ? [] : [id]));
    }
  };

  const variants = {
    default: 'divide-y divide-stone-200',
    separated: 'space-y-2',
    bordered: 'border border-stone-200 rounded-lg divide-y divide-stone-200',
  };

  return (
    <div className={`${variants[variant]} ${className}`}>
      {items.map((item) => {
        const isExpanded = expanded.includes(item.id);

        return (
          <div
            key={item.id}
            className={variant === 'separated' ? 'border border-stone-200 rounded-lg' : ''}
          >
            <button
              onClick={() => !item.disabled && toggleItem(item.id)}
              disabled={item.disabled}
              className={`w-full flex items-center justify-between p-4 text-left hover:bg-stone-50 transition-colors ${
                item.disabled ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                {item.icon && <div className="text-stone-600">{item.icon}</div>}
                <span className="font-medium text-stone-900">{item.title}</span>
              </div>
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="h-5 w-5 text-stone-600" />
              </motion.div>
            </button>

            <AnimatePresence initial={false}>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <div className="p-4 pt-0 text-stone-600">{item.content}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

'use client';

import { useState, ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';

export interface AccordionItem {
  id: string;
  title: string;
  content: ReactNode;
  icon?: ReactNode;
}

export interface AccordionProps {
  items: AccordionItem[];
  allowMultiple?: boolean;
  defaultOpen?: string[];
  className?: string;
}

/**
 * Accordion component with single/multiple expansion support
 */
export function Accordion({
  items,
  allowMultiple = false,
  defaultOpen = [],
  className = '',
}: AccordionProps) {
  const [openItems, setOpenItems] = useState<string[]>(defaultOpen);

  const toggleItem = (id: string) => {
    if (allowMultiple) {
      setOpenItems((prev) =>
        prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
      );
    } else {
      setOpenItems((prev) => (prev.includes(id) ? [] : [id]));
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {items.map((item) => {
        const isOpen = openItems.includes(item.id);

        return (
          <div
            key={item.id}
            className="border border-stone-200 rounded-lg overflow-hidden bg-white"
          >
            <button
              onClick={() => toggleItem(item.id)}
              className="w-full px-4 py-3 flex items-center justify-between gap-3 hover:bg-stone-50 transition-colors text-left"
              aria-expanded={isOpen}
              aria-controls={`accordion-content-${item.id}`}
            >
              <div className="flex items-center gap-3 flex-1">
                {item.icon && <span className="text-stone-500">{item.icon}</span>}
                <span className="font-medium text-stone-900">{item.title}</span>
              </div>
              <ChevronDown
                className={`h-5 w-5 text-stone-400 transition-transform flex-shrink-0 ${
                  isOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {isOpen && (
              <div
                id={`accordion-content-${item.id}`}
                className="px-4 py-3 border-t border-stone-200 bg-stone-50 animate-fade-in"
              >
                {item.content}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

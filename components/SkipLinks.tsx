'use client';

import { useState } from 'react';

export interface SkipLink {
  id: string;
  label: string;
  target: string;
}

export interface SkipLinksProps {
  links?: SkipLink[];
}

const defaultLinks: SkipLink[] = [
  { id: 'skip-main', label: 'Skip to main content', target: '#main-content' },
  { id: 'skip-nav', label: 'Skip to navigation', target: '#navigation' },
  { id: 'skip-footer', label: 'Skip to footer', target: '#footer' },
];

/**
 * Skip links component for keyboard accessibility
 */
export function SkipLinks({ links = defaultLinks }: SkipLinksProps) {
  const [isFocused, setIsFocused] = useState(false);

  const handleClick = (target: string) => {
    const element = document.querySelector(target);
    if (element) {
      (element as HTMLElement).focus();
      (element as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <nav
      aria-label="Skip links"
      className={`
        fixed top-0 left-0 z-[9999]
        ${isFocused ? 'block' : 'sr-only'}
      `}
    >
      <ul className="flex flex-col gap-2 p-4 bg-white shadow-xl rounded-br-lg">
        {links.map((link) => (
          <li key={link.id}>
            <a
              href={link.target}
              onClick={(e) => {
                e.preventDefault();
                handleClick(link.target);
              }}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              className="
                block px-4 py-2 bg-sage-600 text-white rounded-lg
                font-medium focus:outline-none focus:ring-2 focus:ring-sage-700
                hover:bg-sage-700 transition-colors
              "
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

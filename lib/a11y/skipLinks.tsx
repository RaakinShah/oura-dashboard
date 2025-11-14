import { ReactNode } from 'react';

export interface SkipLink {
  id: string;
  label: string;
}

export interface SkipLinksProps {
  links: SkipLink[];
  className?: string;
}

export function SkipLinks({ links, className = '' }: SkipLinksProps) {
  const handleClick = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.focus();
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <nav
      className={`sr-only focus-within:not-sr-only focus-within:absolute focus-within:top-0 focus-within:left-0 focus-within:z-50 focus-within:bg-white focus-within:p-4 focus-within:shadow-lg ${className}`}
      aria-label="Skip links"
    >
      <ul className="flex flex-col gap-2">
        {links.map((link) => (
          <li key={link.id}>
            <a
              href={`#${link.id}`}
              onClick={(e) => {
                e.preventDefault();
                handleClick(link.id);
              }}
              className="text-sage-600 underline hover:text-sage-700 focus:outline-none focus:ring-2 focus:ring-sage-600"
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

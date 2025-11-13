import { LucideIcon } from 'lucide-react';
import Link from 'next/link';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    href: string;
  };
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex items-center justify-center p-12 sm:p-16">
      <div className="max-w-md text-center animate-scale-in">
        <div className="w-20 h-20 mx-auto mb-8 rounded-2xl bg-gradient-to-br from-stone-100 to-stone-50 flex items-center justify-center border border-stone-200">
          <Icon className="w-10 h-10 text-stone-400" strokeWidth={1.5} />
        </div>

        <h3 className="text-2xl font-light mb-4 text-stone-900">{title}</h3>
        <p className="text-stone-600 leading-relaxed mb-8">{description}</p>

        {action && (
          <Link
            href={action.href}
            className="btn-refined btn-primary inline-flex"
          >
            {action.label}
          </Link>
        )}
      </div>
    </div>
  );
}

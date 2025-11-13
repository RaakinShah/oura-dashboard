'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Tooltip } from './Tooltip';

interface CopyButtonProps {
  text: string;
  label?: string;
  className?: string;
}

export function CopyButton({ text, label = 'Copy', className = '' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <Tooltip content={copied ? 'Copied!' : label}>
      <button
        onClick={handleCopy}
        className={`inline-flex items-center gap-2 transition-colors ${className}`}
        aria-label={label}
      >
        {copied ? (
          <Check className="h-4 w-4 text-emerald-600" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
      </button>
    </Tooltip>
  );
}

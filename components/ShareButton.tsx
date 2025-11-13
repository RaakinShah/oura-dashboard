'use client';

import { Share2 } from 'lucide-react';
import { useToast } from './Toast';
import { formatForSharing } from '@/lib/utils/dataExport';

interface ShareButtonProps {
  sleep: any[];
  activity: any[];
  readiness: any[];
  className?: string;
}

export function ShareButton({ sleep, activity, readiness, className = '' }: ShareButtonProps) {
  const { success, error: showError } = useToast();

  const handleShare = async () => {
    const text = formatForSharing(sleep, activity, readiness);

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Oura Stats',
          text,
        });
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error('Share failed:', err);
        }
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(text);
        success('Stats copied to clipboard!');
      } catch (err) {
        showError('Failed to copy stats');
      }
    }
  };

  return (
    <button
      onClick={handleShare}
      className={`btn-refined btn-secondary inline-flex ${className}`}
      aria-label="Share stats"
    >
      <Share2 className="h-4 w-4" />
      <span className="hidden sm:inline">Share</span>
    </button>
  );
}

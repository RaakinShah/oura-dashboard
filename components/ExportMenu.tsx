'use client';

import { useState } from 'react';
import { Download, FileJson, FileSpreadsheet, Printer, ChevronDown } from 'lucide-react';
import { exportOuraData } from '@/lib/utils/dataExport';
import { useToast } from './Toast';

interface ExportMenuProps {
  sleep: any[];
  activity: any[];
  readiness: any[];
}

export function ExportMenu({ sleep, activity, readiness }: ExportMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { success } = useToast();

  const handleExportJSON = () => {
    exportOuraData(sleep, activity, readiness, 'json');
    success('Data exported as JSON');
    setIsOpen(false);
  };

  const handleExportCSV = () => {
    exportOuraData(sleep, activity, readiness, 'csv');
    success('Data exported as CSV');
    setIsOpen(false);
  };

  const handlePrint = () => {
    window.print();
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn-refined btn-secondary inline-flex"
        aria-label="Export data menu"
      >
        <Download className="h-4 w-4" />
        <span className="hidden sm:inline">Export</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-2 z-50 bg-white border border-stone-200 rounded-lg shadow-xl min-w-[200px] animate-scale-in overflow-hidden">
            <button
              onClick={handleExportJSON}
              className="w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-stone-50 transition-colors text-sm font-medium text-stone-700"
            >
              <FileJson className="h-4 w-4 text-stone-400" />
              Export as JSON
            </button>

            <button
              onClick={handleExportCSV}
              className="w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-stone-50 transition-colors text-sm font-medium text-stone-700 border-t border-stone-100"
            >
              <FileSpreadsheet className="h-4 w-4 text-stone-400" />
              Export as CSV
            </button>

            <button
              onClick={handlePrint}
              className="w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-stone-50 transition-colors text-sm font-medium text-stone-700 border-t border-stone-100"
            >
              <Printer className="h-4 w-4 text-stone-400" />
              Print
            </button>
          </div>
        </>
      )}
    </div>
  );
}

import { useState } from 'react';
import { Info } from 'lucide-react';

export default function InfoTooltip({ text }) {
  const [open, setOpen] = useState(false);
  return (
    <span className="relative inline-flex items-center">
      <button
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className="text-slate-400 dark:text-slate-500 hover:text-blue-500 dark:hover:text-blue-400 transition-colors ml-1 focus:outline-none"
        aria-label="Maklumat lanjut"
      >
        <Info size={12} />
      </button>
      {open && (
        <span className="absolute bottom-full left-0 mb-2 w-64 text-xs bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl px-3 py-2.5 shadow-2xl border border-slate-200 dark:border-slate-600 z-50 leading-relaxed pointer-events-none">
          {text}
        </span>
      )}
    </span>
  );
}

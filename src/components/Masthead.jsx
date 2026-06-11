import { useState } from 'react';
import { ChevronDown, Landmark, ShieldCheck, Lock } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

// MYDS masthead — the official Malaysia Government website banner.
// https://design.digital.gov.my/en/docs/develop/masthead
export default function Masthead() {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-xs sm:text-sm">
      <div className="max-w-7xl mx-auto px-4.5 md:px-6">
        <button
          onClick={() => setOpen(o => !o)}
          className="w-full py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
          aria-expanded={open}
        >
          <div className="flex flex-wrap items-center gap-1.5 text-blue-600 dark:text-blue-400 max-sm:justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-base leading-none" aria-hidden>🇲🇾</span>
              <span className="text-slate-600 dark:text-slate-300">{t('masthead.official')}</span>
            </div>
            <div className="flex items-center gap-0.5">
              <span className="hidden sm:block">{t('masthead.identify')}</span>
              <ChevronDown size={16} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
            </div>
          </div>
        </button>

        {/* Smooth collapse via grid-rows 0fr→1fr (no height measuring needed) */}
        <div className={`grid transition-all duration-300 ${open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
          <div className="overflow-hidden">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 pt-4 pb-6">
              <span className="text-blue-600 dark:text-blue-400 sm:hidden">{t('masthead.identify')}</span>

              <div className="flex gap-3">
                <Landmark size={22} className="text-slate-500 dark:text-slate-400 shrink-0 mt-0.5" />
                <div className="space-y-1.5">
                  <p className="font-medium text-slate-900 dark:text-white">{t('masthead.gov.title')}</p>
                  <p className="text-slate-600 dark:text-slate-400 max-w-prose">
                    {t('masthead.gov.pre')}
                    <span className="font-semibold">.gov.my</span>
                    {t('masthead.gov.post')}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <ShieldCheck size={22} className="text-slate-500 dark:text-slate-400 shrink-0 mt-0.5" />
                <div className="space-y-1.5">
                  <p className="font-medium text-slate-900 dark:text-white">{t('masthead.secure.title')}</p>
                  <p className="text-slate-600 dark:text-slate-400 max-w-prose">
                    {t('masthead.secure.pre')}
                    <Lock size={14} className="inline -mt-0.5 mx-px" />
                    {t('masthead.secure.mid')}
                    <span className="font-semibold">https://</span>
                    {t('masthead.secure.post')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { Shield, AlertTriangle } from 'lucide-react';
import { GOVT_ACTIONS } from '../data/constants';
import { useLanguage } from '../context/LanguageContext';
import Card from './Card';

const TRIGGER_STYLE = {
  critical: 'border-rose-200 bg-rose-50 dark:border-rose-700/60 dark:bg-rose-950/30',
  warning:  'border-amber-200 bg-amber-50 dark:border-amber-700/50 dark:bg-amber-950/25',
  medium:   'border-blue-200 bg-blue-50 dark:border-blue-800/50 dark:bg-blue-950/25',
};

export default function GovernmentActionTicker({ limit }) {
  const { t } = useLanguage();
  const actions = limit ? GOVT_ACTIONS.slice(0, limit) : GOVT_ACTIONS;
  const activeCount = GOVT_ACTIONS.filter(a => a.actionStatus === 'Aktif').length;

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-yellow-950 rounded-xl shrink-0">
            <Shield size={18} className="text-yellow-400" />
          </div>
          <div>
            <h2 className="text-slate-900 dark:text-white font-semibold text-base leading-tight">{t('govt.title')}</h2>
            <p className="text-slate-400 dark:text-slate-500 text-xs mt-0.5">{t('govt.sub')}</p>
          </div>
        </div>
        <span className="text-xs bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-700/50 shrink-0">
          {t('govt.activeCount', { n: activeCount })}
        </span>
      </div>

      <div className="relative space-y-3">
        {actions.map((item, idx) => (
          <div key={item.id} className="relative flex gap-3">
            {idx < actions.length - 1 && (
              <div className="absolute left-5 top-10 bottom-0 w-0.5 bg-slate-200 dark:bg-slate-700 -mb-3" />
            )}
            <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-lg shrink-0 z-10">
              {item.emoji}
            </div>
            <div className={`flex-1 rounded-xl border p-4 ${TRIGGER_STYLE[item.triggerLevel] || TRIGGER_STYLE.medium}`}>
              <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-200">{item.ministry}</span>
                  <span className="text-slate-300 dark:text-slate-600">·</span>
                  <span className="text-slate-500">{item.date}</span>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${
                  item.actionStatus === 'Aktif'
                    ? 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/60 dark:text-emerald-300 dark:border-emerald-700/50'
                    : 'bg-slate-200 text-slate-500 border-slate-300 dark:bg-slate-700 dark:text-slate-400 dark:border-slate-600'
                }`}>
                  {item.actionStatus === 'Aktif' ? t('govt.active') : item.actionStatus}
                </span>
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1">
                <AlertTriangle size={10} className="text-amber-500 dark:text-amber-400 shrink-0" />
                {t('govt.trigger')}{' '}
                <span className="text-amber-600 dark:text-amber-300 font-medium ml-0.5">{item.trigger}</span>
              </div>
              <p className="text-sm text-slate-800 dark:text-white leading-relaxed">{item.action}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

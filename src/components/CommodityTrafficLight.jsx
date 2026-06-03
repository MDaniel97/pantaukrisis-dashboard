import { useState, useContext } from 'react';
import { ShoppingBasket, AlertTriangle, MapPin } from 'lucide-react';
import { DataContext } from '../context/DataContext';
import { useLanguage } from '../context/LanguageContext';
import Card from './Card';
import SectionTitle from './SectionTitle';
import TrendChip from './TrendChip';
import SourceTag from './SourceTag';

const STATUS_STYLE = {
  stable: {
    card:     'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800/30',
    dot:      'bg-emerald-400',
    labelCls: 'text-emerald-600 dark:text-emerald-400',
    key:      'commodity.stable',
  },
  warning: {
    card:     'bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800/30',
    dot:      'bg-amber-400 animate-pulse',
    labelCls: 'text-amber-600 dark:text-amber-400',
    key:      'commodity.warning',
  },
  critical: {
    card:     'bg-rose-50 border-rose-200 dark:bg-rose-950/40 dark:border-rose-700/50',
    dot:      'bg-rose-500 animate-pulse',
    labelCls: 'text-rose-600 dark:text-rose-400',
    key:      'commodity.critical',
  },
};

export default function CommodityTrafficLight() {
  const { commodities } = useContext(DataContext);
  const { t } = useLanguage();
  const [expanded, setExpanded] = useState(null);
  const criticalCount = commodities.filter(c => c.status === 'critical').length;
  const warningCount  = commodities.filter(c => c.status === 'warning').length;

  return (
    <Card>
      <SectionTitle
        icon={ShoppingBasket}
        iconBg="bg-amber-950"
        iconColor="text-amber-400"
        title={t('commodity.title')}
        sub={t('commodity.sub')}
      />

      {(criticalCount > 0 || warningCount > 0) && (
        <div
          role="button"
          tabIndex={0}
          onClick={() => document.getElementById('govt-action')?.scrollIntoView({ behavior: 'smooth' })}
          onKeyDown={e => e.key === 'Enter' && document.getElementById('govt-action')?.scrollIntoView({ behavior: 'smooth' })}
          className={`mb-4 rounded-xl px-4 py-3 flex items-start gap-2.5 text-sm border cursor-pointer transition-colors ${
            criticalCount > 0
              ? 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/40 dark:border-rose-800/50 dark:text-rose-300 dark:hover:bg-rose-950/60 dark:hover:border-rose-700/70'
              : 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100 dark:bg-amber-950/40 dark:border-amber-800/50 dark:text-amber-300 dark:hover:bg-amber-950/60 dark:hover:border-amber-700/70'
          }`}
        >
          <AlertTriangle size={15} className="shrink-0 mt-0.5" />
          <span>
            {criticalCount > 0
              ? t('commodity.critical.banner', { n: criticalCount })
              : t('commodity.warning.banner',  { n: warningCount })}
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {commodities.map(item => {
          const s = STATUS_STYLE[item.status];
          const isOpen = expanded === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setExpanded(isOpen ? null : item.id)}
              className={`${s.card} border rounded-xl p-3.5 text-left transition-all hover:brightness-105 focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl leading-none">{item.emoji}</span>
                  <div>
                    <div className="text-sm font-semibold text-slate-900 dark:text-white leading-tight">{item.name}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-mono">{item.retailPrice}</div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${s.dot}`} />
                    <span className={`text-xs font-semibold ${s.labelCls}`}>{t(s.key)}</span>
                  </div>
                  <TrendChip change={item.change} trend={item.trend} />
                </div>
              </div>

              {isOpen && (
                <div className="mt-3 pt-3 border-t border-slate-200/80 dark:border-white/10 space-y-1.5">
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{item.note}</p>
                  {item.affectedArea && (
                    <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
                      <MapPin size={10} />
                      {t('commodity.affected')} <span className="font-medium">{item.affectedArea}</span>
                    </div>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 dark:text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
            {t('commodity.legend.stable')}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
            {t('commodity.legend.warning')}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
            {t('commodity.legend.critical')}
          </span>
        </div>
        <SourceTag label="DOSM PriceCatcher" href="https://data.gov.my/data-catalogue/pricecatcher" />
      </div>
    </Card>
  );
}

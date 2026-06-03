import { useContext } from 'react';
import { Fuel, Shield, RefreshCw } from 'lucide-react';
import { DataContext } from '../context/DataContext';
import { useLanguage } from '../context/LanguageContext';
import Card from './Card';
import SectionTitle from './SectionTitle';
import InfoTooltip from './InfoTooltip';
import SourceTag from './SourceTag';

export default function FuelComparisonWidget() {
  const { fuel } = useContext(DataContext);
  const { t } = useLanguage();
  const savingsPerLitre = (fuel.marketRON95 - fuel.budi95Retail).toFixed(2);
  const savingsPct = Math.round(((fuel.marketRON95 - fuel.budi95Retail) / fuel.marketRON95) * 100);

  return (
    <Card className="w-fit max-w-2xl">
      <SectionTitle
        icon={Fuel}
        title={t('fuel.title')}
        sub={t('fuel.sub')}
      />

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-emerald-50 border border-emerald-200 dark:bg-emerald-950/50 dark:border-emerald-800/40 rounded-xl p-4">
          <div className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold uppercase tracking-wide mb-2">
            {t('fuel.subsidised')}
          </div>
          <div className="text-3xl font-bold text-emerald-700 dark:text-emerald-300 whitespace-nowrap">
            RM {fuel.budi95Retail.toFixed(2)}
          </div>
          <div className="text-xs text-emerald-500 dark:text-emerald-600 mt-1">{t('fuel.perLitre')}</div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-500">
            <Shield size={11} className="shrink-0" />
            <span>{t('fuel.govtRate')}</span>
          </div>
        </div>

        <div className="bg-rose-50 border border-rose-200 dark:bg-rose-950/30 dark:border-rose-800/30 rounded-xl p-4">
          <div className="flex items-center gap-1 text-xs text-rose-600 dark:text-rose-400 font-semibold uppercase tracking-wide mb-2">
            {t('fuel.marketPrice')}
            <InfoTooltip text="Harga yang akan dikenakan jika subsidi dihapuskan. Dikira berdasarkan Brent Crude + kos penapisan + margin pengedar Petronas." />
          </div>
          <div className="text-3xl font-bold text-rose-700 dark:text-rose-300 whitespace-nowrap">
            RM {fuel.marketRON95.toFixed(2)}
          </div>
          <div className="text-xs text-rose-500 dark:text-rose-600 mt-1">{t('fuel.perLitre')}</div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border border-blue-200 dark:border-blue-800/40 rounded-xl p-4 flex items-center justify-between gap-4">
        <div>
          <div className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1">{t('fuel.subsidyValue')}</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            RM {savingsPerLitre}
            <span className="text-sm text-blue-500 dark:text-blue-300 font-normal ml-1">{t('fuel.perLitreUnit')}</span>
          </div>
          <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
            {t('fuel.savings', { pct: savingsPct })}
          </div>
        </div>
      </div>

      <div className="mt-4 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
        <table className="text-sm w-full">
          <thead>
            <tr className="bg-slate-100 dark:bg-slate-700/50">
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{t('fuel.col.category')}</th>
              <th className="text-right px-4 py-2.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{t('fuel.col.price')}</th>
              <th className="text-right px-4 py-2.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide hidden sm:table-cell">{t('fuel.col.type')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700/60">
            {[
              { label: 'RON95 BUDI',               price: fuel.budi95Retail,   badge: t('fuel.badge.subsidy'),    badgeCls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300' },
              { label: 'RON95 SKPS',               price: fuel.skpsRetail,     badge: t('fuel.badge.subsidy'),    badgeCls: 'bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300' },
              { label: 'RON95',                    price: fuel.marketRON95,    badge: t('fuel.badge.market'),     badgeCls: 'bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300' },
              { label: 'RON97',                    price: fuel.marketRON97,    badge: t('fuel.badge.market'),     badgeCls: 'bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300' },
              { label: 'Diesel (Semenanjung)',      price: fuel.diesel,         badge: t('fuel.badge.market'),     badgeCls: 'bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300' },
              { label: 'Diesel (Sabah & Sarawak)', price: fuel.dieselEastMsia, badge: t('fuel.badge.controlled'), badgeCls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300' },
            ].map(row => (
              <tr key={row.label} className="hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors">
                <td className="px-4 py-3 text-slate-700 dark:text-slate-200 font-medium">{row.label}</td>
                <td className="px-4 py-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                  RM {row.price != null ? row.price.toFixed(2) : '—'}
                </td>
                <td className="px-4 py-3 text-right hidden sm:table-cell">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${row.badgeCls}`}>
                    {row.badge}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5">
        {[
          { badgeCls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300', label: 'BUDI95', desc: t('fuel.legend.budi95.desc') },
          { badgeCls: 'bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300',             label: 'SKPS',   desc: t('fuel.legend.skps.desc') },
          { badgeCls: 'bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300',             label: t('fuel.badge.market'),      desc: t('fuel.legend.market.desc') },
          { badgeCls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300',         label: t('fuel.badge.controlled'),   desc: t('fuel.legend.controlled.desc') },
        ].map(item => (
          <div key={item.label} className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
            <span className={`px-1.5 py-0.5 rounded-full font-medium text-xs shrink-0 ${item.badgeCls}`}>{item.label}</span>
            <span>{item.desc}</span>
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
          <RefreshCw size={10} />
          {t('fuel.updatedNote')}
        </div>
        <SourceTag label="DOSM Fuel Price" href="https://data.gov.my/data-catalogue/fuelprice" />
      </div>
    </Card>
  );
}

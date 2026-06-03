import { Database, RefreshCw, GitBranch, Globe, Clock } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

function getSources(t) {
  return [
    {
      name: 'DOSM — Fuel Prices',
      org: t('method.src.dosm.org'),
      urlLabel: 'storage.data.gov.my',
      fields: ['RON95', 'RON97', 'Diesel', 'Diesel East Malaysia', 'RON95-SKPS', 'RON95-BUDI95'],
      format: 'Parquet',
      cadence: t('method.cadence.weekly'),
      note: t('method.src.fuel.note'),
    },
    {
      name: 'DOSM — Pricecatcher',
      org: t('method.src.dosm.org'),
      urlLabel: 'storage.data.gov.my (bulanan)',
      fields: ['Beras', 'Minyak masak', 'Ayam', 'Bawang merah', 'Telur', 'Gula'],
      format: 'Parquet',
      cadence: t('method.cadence.monthly'),
      note: t('method.src.pricecatcher.note'),
    },
    {
      name: 'DOSM — CPI, PPI & Perdagangan',
      org: t('method.src.dosm.org'),
      urlLabel: 'api.data.gov.my/data-catalogue',
      fields: ['CPI Keseluruhan', 'CPI Makanan', 'PPI (YoY)', 'Eksport', 'Import', 'Imbangan Dagangan'],
      format: 'JSON (REST API)',
      cadence: t('method.cadence.monthly'),
      note: t('method.src.dosm3.note'),
    },
    {
      name: 'Bank Negara Malaysia — Kadar Tukaran',
      org: 'BNM',
      urlLabel: 'api.bnm.gov.my',
      fields: ['MYR/USD (kadar tengah)'],
      format: 'JSON (REST API)',
      cadence: t('method.cadence.daily'),
      note: t('method.src.bnm.note'),
    },
    {
      name: 'FRED — DEXMAUS',
      org: t('method.src.fed.org'),
      urlLabel: 'fred.stlouisfed.org',
      fields: ['MYR/USD harian (22 hari lepas → perubahan MoM)'],
      format: 'CSV',
      cadence: t('method.cadence.daily'),
      note: t('method.src.fred.note'),
    },
    {
      name: 'EIA — Brent & WTI Spot',
      org: t('method.src.eia.org'),
      urlLabel: 'api.eia.gov',
      fields: ['Brent Crude (RBRTE)', 'WTI Crude (RWTC)', 'Tinggi/Rendah 52 minggu'],
      format: 'JSON (REST API)',
      cadence: t('method.cadence.daily'),
      note: t('method.src.eia.note'),
    },
  ];
}

function getFallbackSteps(t) {
  return [
    {
      step: 1,
      label: '/api/fuel/latest',
      desc: t('method.fb1.desc'),
      badge: t('method.fb1.badge'),
      color: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-400',
    },
    {
      step: 2,
      label: 'api.data.gov.my (langsung)',
      desc: t('method.fb2.desc'),
      badge: t('method.fb2.badge'),
      color: 'bg-amber-500/15 border-amber-500/30 text-amber-600 dark:text-amber-400',
    },
    {
      step: 3,
      label: '/fuel-snapshot.json',
      desc: t('method.fb3.desc'),
      badge: t('method.fb3.badge'),
      color: 'bg-orange-500/15 border-orange-500/30 text-orange-600 dark:text-orange-400',
    },
    {
      step: 4,
      label: t('method.fb4.label'),
      desc: t('method.fb4.desc'),
      badge: t('method.fb4.badge'),
      color: 'bg-red-500/15 border-red-500/30 text-red-600 dark:text-red-400',
    },
  ];
}

function SectionHeader({ icon: Icon, title }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <Icon size={16} className="text-blue-500 dark:text-blue-400" />
      <h2 className="text-sm font-semibold text-slate-700 dark:text-white uppercase tracking-wider">{title}</h2>
    </div>
  );
}

export default function MethodologyPage() {
  const { t } = useLanguage();
  const SOURCES = getSources(t);
  const FALLBACK_STEPS = getFallbackSteps(t);

  return (
    <div className="space-y-8 pb-4">

      <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl p-5">
        <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
          {t('method.intro.body')}
        </p>
      </div>

      <div>
        <SectionHeader icon={Database} title={t('method.intro')} />
        <div className="grid gap-3">
          {SOURCES.map(src => (
            <div key={src.name} className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                <div>
                  <div className="text-slate-900 dark:text-white font-medium text-sm">{src.name}</div>
                  <div className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">{src.org}</div>
                </div>
                <div className="flex flex-wrap gap-1.5 shrink-0">
                  <span className="bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300 text-xs px-2 py-0.5 rounded-full">{src.format}</span>
                  <span className="bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-600/20 dark:text-blue-300 dark:border-blue-600/30 text-xs px-2 py-0.5 rounded-full">{src.cadence}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-3">
                {src.fields.map(f => (
                  <span key={f} className="bg-slate-200/80 text-slate-600 dark:bg-slate-700/60 dark:text-slate-300 text-xs px-2 py-0.5 rounded">{f}</span>
                ))}
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500 mb-2">
                <Globe size={11} />
                <span className="font-mono">{src.urlLabel}</span>
              </div>

              {src.note && (
                <div className="text-xs text-amber-600 dark:text-amber-400/80 bg-amber-50 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/20 rounded-lg px-3 py-2 mt-1">
                  {src.note}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div>
        <SectionHeader icon={GitBranch} title={t('method.fallback')} />
        <div className="space-y-2">
          {FALLBACK_STEPS.map((s, i) => (
            <div key={s.step} className="flex gap-3 items-start">
              <div className="flex flex-col items-center">
                <div className="w-6 h-6 rounded-full bg-slate-200 border border-slate-300 dark:bg-slate-700 dark:border-slate-600 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300 shrink-0">
                  {s.step}
                </div>
                {i < FALLBACK_STEPS.length - 1 && (
                  <div className="w-px flex-1 bg-slate-200 dark:bg-slate-700 my-1" style={{ minHeight: 12 }} />
                )}
              </div>
              <div className={`flex-1 border rounded-xl px-4 py-3 mb-1 ${s.color}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono font-semibold">{s.label}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded border ${s.color}`}>{s.badge}</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <SectionHeader icon={Clock} title={t('method.cache')} />
        <div className="grid sm:grid-cols-3 gap-3">
          {[
            { label: t('method.cache.ttl.label'),     desc: t('method.cache.ttl.desc')     },
            { label: t('method.cache.time.label'),    desc: t('method.cache.time.desc')    },
            { label: t('method.cache.startup.label'), desc: t('method.cache.startup.desc') },
          ].map(item => (
            <div key={item.label} className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
              <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{item.label}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">{item.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-start gap-2 text-xs text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700/50 rounded-xl px-4 py-3">
        <RefreshCw size={12} className="mt-0.5 shrink-0" />
        <span>{t('method.footer.note')}</span>
      </div>

    </div>
  );
}

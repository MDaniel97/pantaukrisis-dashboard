import { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import { TrendingUp, RefreshCw } from 'lucide-react';
import Card from './Card';
import SectionTitle from './SectionTitle';
import SourceTag from './SourceTag';
import { fetchFuelHistory } from '../api';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

const PERIODS = [
  { label: '4M',  weeks: 4  },
  { label: '8M',  weeks: 8  },
  { label: '12M', weeks: 12 },
  { label: '24M', weeks: 24 },
];

const CATEGORY_DEFS = (t) => [
  {
    id: 'all',
    label: t('chart.all'),
    hasComparison: true,
    series: [
      { key: 'ron95',           label: 'RON95 Pasaran',      color: '#f87171', dashed: false },
      { key: 'ron95_budi95',    label: 'BUDI95',             color: '#34d399', dashed: false },
      { key: 'ron95_skps',      label: 'SKPS',               color: '#60a5fa', dashed: true  },
      { key: 'ron97',           label: 'RON97',              color: '#fb923c', dashed: false },
      { key: 'diesel',          label: 'Diesel Semenanjung', color: '#facc15', dashed: false },
      { key: 'diesel_eastmsia', label: 'Diesel Sabah & Sarawak', color: '#a78bfa', dashed: true },
    ],
  },
  {
    id: 'ron95',
    label: 'RON95',
    hasComparison: true,
    series: [
      { key: 'ron95',        label: 'Pasaran',             color: '#f87171', dashed: false },
      { key: 'ron95_budi95', label: 'BUDI95 (Bersubsidi)', color: '#34d399', dashed: false },
      { key: 'ron95_skps',   label: 'SKPS',                color: '#60a5fa', dashed: true  },
    ],
  },
  {
    id: 'ron97',
    label: 'RON97',
    hasComparison: false,
    series: [
      { key: 'ron97', label: 'RON97', color: '#fb923c', dashed: false },
    ],
  },
  {
    id: 'diesel',
    label: 'Diesel',
    hasComparison: true,
    series: [
      { key: 'diesel',          label: 'Semenanjung',     color: '#facc15', dashed: false },
      { key: 'diesel_eastmsia', label: 'Sabah & Sarawak', color: '#a78bfa', dashed: true  },
    ],
  },
];

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('ms-MY', { day: 'numeric', month: 'short' });
}

function CustomTooltip({ active, payload, label, series }) {
  const { isDark } = useTheme();
  if (!active || !payload?.length) return null;
  return (
    <div className={`${isDark ? 'bg-slate-800 border-slate-600 text-slate-400' : 'bg-white border-slate-200 text-slate-500'} border rounded-xl px-4 py-3 shadow-2xl text-xs min-w-[180px]`}>
      <div className="mb-2 font-medium">{formatDate(label)}</div>
      {series.map(s => {
        const entry = payload.find(p => p.dataKey === s.key);
        const val = entry?.value;
        return (
          <div key={s.key} className="flex items-center justify-between gap-6 mb-1">
            <span className="flex items-center gap-1.5" style={{ color: s.color }}>
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: s.color }} />
              {s.label}
            </span>
            <span className={`font-mono font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {val != null ? `RM ${Number(val).toFixed(2)}` : '—'}
            </span>
          </div>
        );
      })}
      {(() => {
        const ron95Market = payload.find(p => p.dataKey === 'ron95')?.value;
        const ron95Budi   = payload.find(p => p.dataKey === 'ron95_budi95')?.value;
        const diesel      = payload.find(p => p.dataKey === 'diesel')?.value;
        const dieselEast  = payload.find(p => p.dataKey === 'diesel_eastmsia')?.value;
        const gaps = [];
        if (ron95Market != null && ron95Budi != null)
          gaps.push({ label: 'Jimat RON95 (BUDI95)', diff: ron95Market - ron95Budi });
        if (diesel != null && dieselEast != null)
          gaps.push({ label: 'Beza Diesel kawasan', diff: diesel - dieselEast });
        if (!gaps.length) return null;
        return (
          <div className={`mt-2 pt-2 border-t ${isDark ? 'border-slate-700' : 'border-slate-200'} space-y-1`}>
            {gaps.map(g => (
              <div key={g.label} className="flex items-center justify-between gap-6">
                <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>{g.label}</span>
                <span className="font-mono font-bold text-yellow-500 dark:text-yellow-300">
                  RM {g.diff.toFixed(2)}/L
                </span>
              </div>
            ))}
          </div>
        );
      })()}
    </div>
  );
}

export default function FuelPriceChart() {
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const [weeks, setWeeks]           = useState(12);
  const [categoryId, setCategoryId] = useState('all');
  const [data, setData]             = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(false);

  const CATEGORIES = CATEGORY_DEFS(t);
  const category = CATEGORIES.find(c => c.id === categoryId);

  const chartGrid = isDark ? '#334155' : '#e2e8f0';
  const chartTick = isDark ? '#94a3b8' : '#64748b';

  useEffect(() => {
    setLoading(true);
    setError(false);
    fetchFuelHistory(weeks)
      .then(setData)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [weeks]);

  const allValues = data.flatMap(d =>
    category.series.map(s => d[s.key]).filter(v => v != null && !Number.isNaN(v))
  );
  const yMin = allValues.length ? Math.floor(Math.min(...allValues) * 10) / 10 - 0.1 : 1.5;
  const yMax = allValues.length ? Math.ceil(Math.max(...allValues) * 10) / 10 + 0.1 : 6;

  return (
    <Card>
      <div className="flex items-start justify-between gap-4 mb-4">
        <SectionTitle
          icon={TrendingUp}
          iconBg="bg-blue-950"
          iconColor="text-blue-400"
          title={t('chart.title')}
          sub={t('chart.sub')}
        />
        <div className="flex items-center gap-1.5 shrink-0">
          {PERIODS.map(p => (
            <button
              key={p.weeks}
              onClick={() => setWeeks(p.weeks)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                weeks === p.weeks
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-600'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setCategoryId(cat.id)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
              categoryId === cat.id
                ? 'bg-slate-200 border-slate-300 text-slate-900 dark:bg-slate-700 dark:border-slate-500 dark:text-white'
                : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-900 hover:border-slate-300 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400 dark:hover:text-white dark:hover:border-slate-600'
            }`}
          >
            <span className="flex gap-0.5">
              {cat.series.map(s => (
                <span key={s.key} className="w-2 h-2 rounded-full" style={{ background: s.color }} />
              ))}
            </span>
            {cat.label}
            {cat.hasComparison && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-600 border border-blue-200 dark:bg-blue-900/60 dark:text-blue-300 dark:border-blue-700/50">
                {t('chart.comparison')}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        {category.series.map(s => (
          <span key={s.key} className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <span className="w-4 h-0.5 rounded inline-block" style={{
              background: s.color,
              borderTop: s.dashed ? `2px dashed ${s.color}` : undefined,
            }} />
            <span style={{ color: s.color }}>{s.label}</span>
          </span>
        ))}
      </div>

      <div className="h-64 w-full">
        {loading ? (
          <div className="h-full flex items-center justify-center gap-2 text-slate-400 dark:text-slate-500 text-sm">
            <RefreshCw size={14} className="animate-spin" />
            {t('chart.loading')}
          </div>
        ) : error ? (
          <div className="h-full flex items-center justify-center text-slate-400 dark:text-slate-500 text-sm">
            {t('chart.error')}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartGrid} vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                tick={{ fill: chartTick, fontSize: 10 }}
                axisLine={{ stroke: chartGrid }}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                domain={[yMin, yMax]}
                tickFormatter={v => `RM${v.toFixed(2)}`}
                tick={{ fill: chartTick, fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                width={56}
              />
              <Tooltip content={<CustomTooltip series={category.series} />} />
              {category.series.map(s => (
                <Line
                  key={s.key}
                  type="monotone"
                  dataKey={s.key}
                  name={s.label}
                  stroke={s.color}
                  strokeWidth={2}
                  strokeDasharray={s.dashed ? '5 3' : undefined}
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 0 }}
                  connectNulls
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between flex-wrap gap-2">
        <p className="text-xs text-slate-400 dark:text-slate-500">{t('chart.updatedNote')}</p>
        <SourceTag label="DOSM fuelprice" href="https://data.gov.my/data-catalogue/fuelprice" />
      </div>
    </Card>
  );
}

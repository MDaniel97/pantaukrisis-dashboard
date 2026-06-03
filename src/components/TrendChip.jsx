import { TrendingUp, TrendingDown, Activity } from 'lucide-react';

export default function TrendChip({ change, trend }) {
  const isUp = trend === 'up';
  const isDown = trend === 'down';
  const cls = isUp
    ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
    : isDown
    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
    : 'bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400';
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-semibold px-1.5 py-0.5 rounded-md ${cls}`}>
      {isUp ? <TrendingUp size={10} /> : isDown ? <TrendingDown size={10} /> : <Activity size={10} />}
      {change ?? '—'}
    </span>
  );
}

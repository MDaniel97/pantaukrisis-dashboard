export default function StatusLight({ status }) {
  const cls = {
    stable:   'bg-emerald-400',
    warning:  'bg-amber-400 animate-pulse',
    critical: 'bg-rose-500 animate-pulse',
  }[status];
  return <span className={`inline-block w-2.5 h-2.5 rounded-full ${cls}`} />;
}

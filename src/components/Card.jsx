export default function Card({ children, className = '' }) {
  return (
    <div className={`bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-card ${className}`}>
      {children}
    </div>
  );
}

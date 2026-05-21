export default function Card({ children, className = '' }) {
  return (
    <div className={`bg-slate-800 rounded-2xl p-5 border border-slate-700 ${className}`}>
      {children}
    </div>
  );
}

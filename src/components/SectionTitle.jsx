export default function SectionTitle({ icon: Icon, iconBg = 'bg-blue-950', iconColor = 'text-blue-400', title, sub }) {
  return (
    <div className="flex items-start gap-3 mb-4">
      <div className={`p-2 ${iconBg} rounded-xl shrink-0`}>
        <Icon size={18} className={iconColor} />
      </div>
      <div>
        <h2 className="text-white font-semibold text-base leading-tight">{title}</h2>
        {sub && <p className="text-slate-500 text-xs mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

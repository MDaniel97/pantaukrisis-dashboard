import { useState, useContext } from 'react';
import { ShoppingBasket, AlertTriangle, MapPin } from 'lucide-react';
import { DataContext } from '../context/DataContext';
import Card from './Card';
import SectionTitle from './SectionTitle';
import TrendChip from './TrendChip';
import SourceTag from './SourceTag';

const STATUS_MAP = {
  stable: {
    card:     'bg-emerald-950/30 border-emerald-800/30',
    dot:      'bg-emerald-400',
    label:    'Stabil',
    labelCls: 'text-emerald-400',
  },
  warning: {
    card:     'bg-amber-950/30 border-amber-800/30',
    dot:      'bg-amber-400 animate-pulse',
    label:    'Amaran',
    labelCls: 'text-amber-400',
  },
  critical: {
    card:     'bg-rose-950/40 border-rose-700/50',
    dot:      'bg-rose-500 animate-pulse',
    label:    'Kritikal',
    labelCls: 'text-rose-400',
  },
};

export default function CommodityTrafficLight() {
  const { commodities } = useContext(DataContext);
  const [expanded, setExpanded] = useState(null);
  const criticalCount = commodities.filter(c => c.status === 'critical').length;
  const warningCount  = commodities.filter(c => c.status === 'warning').length;

  return (
    <Card>
      <SectionTitle
        icon={ShoppingBasket}
        iconBg="bg-amber-950"
        iconColor="text-amber-400"
        title="Penunjuk Bekalan Barangan Asas"
        sub="Status bekalan dan agihan barangan penting — klik untuk butiran"
      />

      {(criticalCount > 0 || warningCount > 0) && (
        <div
          role="button"
          tabIndex={0}
          onClick={() => document.getElementById('govt-action')?.scrollIntoView({ behavior: 'smooth' })}
          onKeyDown={e => e.key === 'Enter' && document.getElementById('govt-action')?.scrollIntoView({ behavior: 'smooth' })}
          className={`mb-4 rounded-xl px-4 py-3 flex items-start gap-2.5 text-sm border cursor-pointer transition-colors ${
            criticalCount > 0
              ? 'bg-rose-950/40 border-rose-800/50 text-rose-300 hover:bg-rose-950/60 hover:border-rose-700/70'
              : 'bg-amber-950/40 border-amber-800/50 text-amber-300 hover:bg-amber-950/60 hover:border-amber-700/70'
          }`}
        >
          <AlertTriangle size={15} className="shrink-0 mt-0.5" />
          <span>
            {criticalCount > 0
              ? `${criticalCount} barangan dalam status KRITIKAL. Lihat di bawah untuk tindakan kerajaan terkini.`
              : `${warningCount} barangan mengalami gangguan penghantaran tempatan.`}
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {commodities.map(item => {
          const s = STATUS_MAP[item.status];
          const isOpen = expanded === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setExpanded(isOpen ? null : item.id)}
              className={`${s.card} border rounded-xl p-3.5 text-left transition-all hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl leading-none">{item.emoji}</span>
                  <div>
                    <div className="text-sm font-semibold text-white leading-tight">{item.name}</div>
                    <div className="text-xs text-slate-400 mt-0.5 font-mono">{item.retailPrice}</div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${s.dot}`} />
                    <span className={`text-xs font-semibold ${s.labelCls}`}>{s.label}</span>
                  </div>
                  <TrendChip change={item.change} trend={item.trend} />
                </div>
              </div>

              {isOpen && (
                <div className="mt-3 pt-3 border-t border-white/10 space-y-1.5">
                  <p className="text-xs text-slate-300 leading-relaxed">{item.note}</p>
                  {item.affectedArea && (
                    <div className="flex items-center gap-1.5 text-xs text-amber-400">
                      <MapPin size={10} />
                      Kawasan terjejas: <span className="font-medium">{item.affectedArea}</span>
                    </div>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
            Bekalan Stabil
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
            Gangguan Penghantaran
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
            Kekurangan Tempatan
          </span>
        </div>
        <div className="flex items-center gap-3">
          <SourceTag label="DOSM PriceCatcher" href="https://data.gov.my/data-catalogue/pricecatcher" />
          <SourceTag label="KPDNHEP" href="https://www.kpdn.gov.my" />
        </div>
      </div>
    </Card>
  );
}

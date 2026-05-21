import { Shield, AlertTriangle, ExternalLink } from 'lucide-react';
import { GOVT_ACTIONS } from '../data/constants';
import Card from './Card';

const TRIGGER_STYLE = {
  critical: 'border-rose-700/60 bg-rose-950/30',
  warning:  'border-amber-700/50 bg-amber-950/25',
  medium:   'border-blue-800/50 bg-blue-950/25',
};

export default function GovernmentActionTicker({ limit }) {
  const actions = limit ? GOVT_ACTIONS.slice(0, limit) : GOVT_ACTIONS;
  const activeCount = GOVT_ACTIONS.filter(a => a.actionStatus === 'Aktif').length;

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-yellow-950 rounded-xl shrink-0">
            <Shield size={18} className="text-yellow-400" />
          </div>
          <div>
            <h2 className="text-white font-semibold text-base leading-tight">Kerajaan Bertindak</h2>
            <p className="text-slate-500 text-xs mt-0.5">
              Respons dasar semasa terhadap perubahan bekalan kritikal
            </p>
          </div>
        </div>
        <span className="text-xs bg-emerald-900/60 text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-700/50 shrink-0">
          {activeCount} Tindakan Aktif
        </span>
      </div>

      <div className="relative space-y-3">
        {actions.map((item, idx) => (
          <div key={item.id} className="relative flex gap-3">
            {idx < actions.length - 1 && (
              <div className="absolute left-5 top-10 bottom-0 w-0.5 bg-slate-700 -mb-3" />
            )}

            <div className="w-10 h-10 rounded-xl bg-slate-700 flex items-center justify-center text-lg shrink-0 z-10">
              {item.emoji}
            </div>

            <div className={`flex-1 rounded-xl border p-4 ${TRIGGER_STYLE[item.triggerLevel] || TRIGGER_STYLE.medium}`}>
              <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
                <div className="flex items-center gap-2 text-xs">
                  <a
                    href={item.ministryUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-slate-200 hover:text-blue-400 transition-colors inline-flex items-center gap-0.5"
                  >
                    {item.ministry}<ExternalLink size={9} className="opacity-60" />
                  </a>
                  <span className="text-slate-600">·</span>
                  <span className="text-slate-500">{item.date}</span>
                </div>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium border ${
                    item.actionStatus === 'Aktif'
                      ? 'bg-emerald-900/60 text-emerald-300 border-emerald-700/50'
                      : 'bg-slate-700 text-slate-400 border-slate-600'
                  }`}
                >
                  {item.actionStatus}
                </span>
              </div>
              <div className="text-xs text-slate-400 mb-1.5 flex items-center gap-1">
                <AlertTriangle size={10} className="text-amber-400 shrink-0" />
                Pencetus:{' '}
                <span className="text-amber-300 font-medium ml-0.5">{item.trigger}</span>
              </div>
              <p className="text-sm text-white leading-relaxed">{item.action}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

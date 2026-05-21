import { useContext } from 'react';
import { BarChart3, Activity } from 'lucide-react';
import { SME } from '../data/constants';
import { DataContext } from '../context/DataContext';
import Card from '../components/Card';
import SectionTitle from '../components/SectionTitle';
import TrendChip from '../components/TrendChip';
import InfoTooltip from '../components/InfoTooltip';
import SourceTag from '../components/SourceTag';
import GovernmentActionTicker from '../components/GovernmentActionTicker';

function pct(v) {
  if (v == null) return null;
  return `${v > 0 ? '+' : ''}${Number(v).toFixed(1)}%`;
}
function trend(v) {
  return v == null ? 'flat' : v > 0 ? 'up' : v < 0 ? 'down' : 'flat';
}

export default function SMEPage() {
  const { macro } = useContext(DataContext);
  const t = macro?.trade;
  const monthLabel = t?.month_label ?? 'terkini';

  const tradeMetrics = [
    {
      label:  `Eksport (${monthLabel})`,
      value:  t?.exports != null ? `RM ${t.exports}B` : `RM ${SME.exportApr.value}B`,
      change: pct(t?.exports_yoy) ?? SME.exportApr.change,
      trend:  trend(t?.exports_yoy) ?? SME.exportApr.trend,
    },
    {
      label:  `Import (${monthLabel})`,
      value:  t?.imports != null ? `RM ${t.imports}B` : `RM ${SME.importApr.value}B`,
      change: pct(t?.imports_yoy) ?? SME.importApr.change,
      trend:  trend(t?.imports_yoy) ?? SME.importApr.trend,
    },
    {
      label:  'Imbangan Dagangan',
      value:  t?.balance != null ? `+RM ${t.balance}B` : `+RM ${SME.tradeBalance.value}B`,
      change: pct(t?.balance_yoy) ?? SME.tradeBalance.change,
      trend:  trend(t?.balance_yoy) ?? SME.tradeBalance.trend,
    },
    {
      label:  'Diesel Industri',
      value:  `RM ${SME.dieselIndustrial.value}/L`,
      change: SME.dieselIndustrial.change,
      trend:  SME.dieselIndustrial.trend,
    },
    {
      label:  'Harga CPO',
      value:  `RM ${SME.cpo.value}/MT`,
      change: SME.cpo.change,
      trend:  SME.cpo.trend,
    },
    {
      label:   'Indeks Fret (Drewry WCI)',
      value:   SME.freightWCI.value.toLocaleString(),
      tooltip: 'Drewry World Container Index (WCI) mengukur kos penghantaran kontena global. Nilai lebih tinggi bermakna kos logistik yang lebih mahal untuk pengimport dan pengeksport Malaysia.',
      change:  SME.freightWCI.change,
      trend:   SME.freightWCI.trend,
    },
  ];

  const riskPct = SME.supplyRiskScore.value;
  const riskBarColor = riskPct < 40 ? 'bg-emerald-500' : riskPct < 70 ? 'bg-amber-400' : 'bg-rose-500';

  return (
    <div className="space-y-5">
      <Card>
        <SectionTitle
          icon={BarChart3}
          title="Metrik Perdagangan & Logistik"
          sub={`Data terkini DOSM & Drewry — ${monthLabel}`}
        />
        <div className="flex gap-3 mb-4">
          <SourceTag label="DOSM" href="https://data.gov.my" />
          <SourceTag label="Drewry WCI" href="https://www.drewry.co.uk/supply-chain-advisors/supply-chain-expertise/world-container-index-assessed-by-drewry" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {tradeMetrics.map(m => (
            <div key={m.label} className="bg-slate-700/50 rounded-xl p-3.5">
              <div className="flex items-center text-xs text-slate-400 mb-1.5 font-medium">
                {m.label}
                {m.tooltip && <InfoTooltip text={m.tooltip} />}
              </div>
              <div className="text-xl font-bold text-white">{m.value}</div>
              <div className="mt-2">
                <TrendChip change={m.change} trend={m.trend} />
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <SectionTitle
          icon={Activity}
          iconBg="bg-rose-950"
          iconColor="text-rose-400"
          title="Skor Risiko Rantaian Bekalan"
          sub="Agregat berdasarkan fret global, inventori domestik, dan ketergantungan import"
        />
        <div className="flex items-center gap-6 mb-5">
          <div className="flex-1">
            <div className="flex justify-between text-xs text-slate-500 mb-2">
              <span>Rendah</span>
              <span>Sederhana</span>
              <span>Kritikal</span>
            </div>
            <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`h-full ${riskBarColor} rounded-full transition-all duration-700`}
                style={{ width: `${riskPct}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-slate-600 mt-1">
              <span>0</span>
              <span>50</span>
              <span>100</span>
            </div>
          </div>
          <div className="text-center shrink-0">
            <div className="text-4xl font-bold text-amber-300">{riskPct}</div>
            <div className="text-xs text-amber-400 font-semibold mt-0.5">{SME.supplyRiskScore.rating}</div>
            <div className="text-xs text-slate-600">/ 100</div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {SME.riskFactors.map(f => (
            <div key={f.factor} className="bg-slate-700/50 rounded-xl p-3 text-center">
              <div className={`text-2xl font-bold ${f.color}`}>{f.score}</div>
              <div className="text-xs text-slate-500 leading-snug mt-1">{f.factor}</div>
            </div>
          ))}
        </div>
      </Card>

      <GovernmentActionTicker />
    </div>
  );
}

import { useContext } from 'react';
import { BarChart3, Globe, Package } from 'lucide-react';
import { ANALYST } from '../data/constants';
import { DataContext } from '../context/DataContext';
import Card from '../components/Card';
import SectionTitle from '../components/SectionTitle';
import TrendChip from '../components/TrendChip';
import InfoTooltip from '../components/InfoTooltip';
import SourceTag from '../components/SourceTag';
import StatusLight from '../components/StatusLight';
import GovernmentActionTicker from '../components/GovernmentActionTicker';

function pct(v, d = 1) {
  if (v == null) return null;
  return `${v > 0 ? '+' : ''}${Number(v).toFixed(d)}%`;
}
function pp(v) {
  if (v == null) return null;
  return `${v > 0 ? '+' : ''}${Number(v).toFixed(1)}pp`;
}
function trend(v) {
  return v == null ? 'flat' : v > 0 ? 'up' : v < 0 ? 'down' : 'flat';
}

export default function AnalystPage() {
  const { commodities, macro } = useContext(DataContext);

  const t = macro?.trade;
  const monthLabel = t?.month_label ?? 'terkini';

  const myrUsd = {
    label:   'Kadar MYR/USD',
    value:   macro?.myr_usd?.value ?? ANALYST.myrUsd.value,
    unit:    '',
    sub:     `Kadar tengah BNM · ${macro?.myr_usd?.date ?? '—'}`,
    tooltip: 'Ringgit yang lebih lemah meningkatkan kos import barangan dan komoditi, menekan harga runcit domestik.',
    change:  pct(macro?.myr_usd?.change_pct) ?? ANALYST.myrUsd.change,
    trend:   macro?.myr_usd?.trend ?? ANALYST.myrUsd.trend,
  };

  const cpiFood = {
    label:   'CPI Makanan',
    value:   macro?.cpi?.food?.value != null ? `${macro.cpi.food.value}%` : `${ANALYST.cpiFood.value}%`,
    unit:    '',
    sub:     `Inflasi Makanan ${macro?.cpi?.food?.date?.slice(0, 7) ?? ''} (DOSM)`,
    tooltip: 'Indeks Harga Pengguna (CPI) untuk kategori makanan — petunjuk langsung tekanan sara hidup isi rumah.',
    change:  pp(macro?.cpi?.food?.change_pp) ?? ANALYST.cpiFood.change,
    trend:   macro?.cpi?.food?.trend ?? ANALYST.cpiFood.trend,
  };

  const cpiAll = {
    label:  'CPI Keseluruhan',
    value:  macro?.cpi?.overall?.value != null ? `${macro.cpi.overall.value}%` : `${ANALYST.cpiAll.value}%`,
    unit:   '',
    sub:    `${macro?.cpi?.overall?.date?.slice(0, 7) ?? ''} · DOSM`,
    change: pp(macro?.cpi?.overall?.change_pp) ?? ANALYST.cpiAll.change,
    trend:  macro?.cpi?.overall?.trend ?? ANALYST.cpiAll.trend,
  };

  const ppi = {
    label:   'PPI Pembuatan',
    value:   macro?.ppi?.value != null ? `${macro.ppi.value}%` : `${ANALYST.ppiManufacturing.value}%`,
    unit:    '',
    sub:     `Pengeluaran ${macro?.ppi?.date?.slice(0, 7) ?? ''} · DOSM`,
    tooltip: 'Indeks Harga Pengeluar (PPI) mencerminkan tekanan inflasi di peringkat pengeluar — petanda awal kenaikan harga runcit dalam 1–3 bulan akan datang.',
    change:  pp(macro?.ppi?.change_pp) ?? ANALYST.ppiManufacturing.change,
    trend:   macro?.ppi?.trend ?? ANALYST.ppiManufacturing.trend,
  };

  const b = macro?.brent;
  const w = macro?.wti;

  const MACRO_GRID = [
    {
      label:   'Brent Crude',
      value:   b ? `USD ${b.value}` : `USD ${ANALYST.brent.value}`,
      unit:    '/bbl',
      sub:     b
        ? `Julat 52M: ${b.wk_low}–${b.wk_high} · ${b.date}`
        : `Julat 52M: ${ANALYST.brent.wkLow}–${ANALYST.brent.wkHigh}`,
      tooltip: 'Brent Crude ialah penanda aras harga minyak mentah antarabangsa. Harga minyak Malaysia (RON95, diesel) dikira secara langsung berdasarkan Brent + kos penapisan tempatan.',
      change:  pct(b?.change_pct) ?? ANALYST.brent.change,
      trend:   b?.trend ?? ANALYST.brent.trend,
    },
    {
      label:   'WTI Crude',
      value:   w ? `USD ${w.value}` : `USD ${ANALYST.wti.value}`,
      unit:    '/bbl',
      sub:     w ? `West Texas Intermediate · ${w.date}` : 'West Texas Intermediate',
      tooltip: 'WTI ialah penanda aras minyak mentah Amerika Syarikat, biasanya USD 2–5 lebih murah dari Brent kerana kos pengangkutan yang berbeza.',
      change:  pct(w?.change_pct) ?? ANALYST.wti.change,
      trend:   w?.trend ?? ANALYST.wti.trend,
    },
    {
      label: 'Import LNG',
      value: `${ANALYST.lngImport.value}`,
      unit:  'juta MT',
      sub:   'Apr 2026 · Petronas LNG',
      ...ANALYST.lngImport,
    },
    {
      label: 'Eksport LNG',
      value: `${ANALYST.lngExport.value}`,
      unit:  'juta MT',
      sub:   'Apr 2026 · Net eksporter',
      ...ANALYST.lngExport,
    },
    myrUsd,
    cpiFood,
    cpiAll,
    ppi,
  ];

  const exportYTD = {
    label: 'Jumlah Eksport YTD',
    value: t?.ytd_exports != null ? `RM ${t.ytd_exports}B` : `RM ${ANALYST.exportYTD.value}B`,
    style: 'bg-emerald-950/30 border-emerald-800/30 text-emerald-300',
    change: pct(t?.ytd_exp_yoy) ?? ANALYST.exportYTD.change,
    trend:  trend(t?.ytd_exp_yoy) ?? ANALYST.exportYTD.trend,
  };

  const importYTD = {
    label: 'Jumlah Import YTD',
    value: t?.ytd_imports != null ? `RM ${t.ytd_imports}B` : `RM ${ANALYST.importYTD.value}B`,
    style: 'bg-rose-950/30 border-rose-800/30 text-rose-300',
    change: pct(t?.ytd_imp_yoy) ?? ANALYST.importYTD.change,
    trend:  trend(t?.ytd_imp_yoy) ?? ANALYST.importYTD.trend,
  };

  const tradeBalYTD = {
    label: 'Lebihan Dagangan YTD',
    value: t?.ytd_balance != null ? `+RM ${t.ytd_balance}B` : `+RM ${ANALYST.tradeBalanceYTD.value}B`,
    style: 'bg-blue-950/30 border-blue-800/30 text-blue-300',
    change: ANALYST.tradeBalanceYTD.change,
    trend:  ANALYST.tradeBalanceYTD.trend,
  };

  return (
    <div className="space-y-5">
      <Card>
        <SectionTitle
          icon={BarChart3}
          title="Papan Pemuka Makroekonomi Penuh"
          sub={`Apr–Mei 2026`}
        />
        <div className="flex flex-wrap gap-3 mb-4">
          <SourceTag label="Petronas" href="https://www.petronas.com" />
          <SourceTag label="Bank Negara Malaysia" href="https://www.bnm.gov.my" />
          <SourceTag label="DOSM" href="https://data.gov.my" />
          <SourceTag label="Drewry WCI" href="https://www.drewry.co.uk/supply-chain-advisors/supply-chain-expertise/world-container-index-assessed-by-drewry" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {MACRO_GRID.map(item => (
            <div key={item.label} className="bg-slate-700/50 rounded-xl p-3.5 hover:bg-slate-700/80 transition-colors">
              <div className="flex items-center text-xs text-slate-400 font-medium mb-1.5">
                {item.label}
                {item.tooltip && <InfoTooltip text={item.tooltip} />}
              </div>
              <div className="text-2xl font-bold text-white leading-tight">
                {item.value}
                {item.unit && <span className="text-xs text-slate-400 font-normal ml-1">{item.unit}</span>}
              </div>
              <div className="mt-2">
                <TrendChip change={item.change} trend={item.trend} />
              </div>
              <div className="text-xs text-slate-500 mt-1.5 leading-snug">{item.sub}</div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <SectionTitle
          icon={Globe}
          title="Imbangan Dagangan Terperinci"
          sub={`Kumulatif Jan–${monthLabel}`}
        />
        <div className="flex gap-3 mb-4">
          <SourceTag label="DOSM" href="https://data.gov.my" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[exportYTD, importYTD, tradeBalYTD].map(item => (
            <div key={item.label} className={`border rounded-xl p-4 text-center ${item.style}`}>
              <div className="text-xs text-slate-400 mb-2">{item.label}</div>
              <div className="text-xl font-bold">{item.value}</div>
              <div className="mt-2 flex justify-center">
                <TrendChip change={item.change} trend={item.trend} />
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <SectionTitle
          icon={Package}
          iconBg="bg-slate-700"
          iconColor="text-slate-300"
          title="Data Barangan Asas — Lengkap"
          sub="Harga runcit & status bekalan semasa"
        />
        <div className="overflow-x-auto -mx-1">
          <table className="w-full text-sm min-w-[560px]">
            <thead>
              <tr className="text-xs text-slate-500 border-b border-slate-700">
                <th className="text-left pb-2.5 font-medium">Barangan</th>
                <th className="text-right pb-2.5 font-medium">Harga Runcit</th>
                <th className="text-right pb-2.5 font-medium">MoM</th>
                <th className="text-right pb-2.5 font-medium pr-4">Status</th>
                <th className="text-left pb-2.5 font-medium pl-4">Nota Bekalan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {commodities.map(item => (
                <tr key={item.id} className="hover:bg-slate-700/20 transition-colors">
                  <td className="py-3">
                    <span className="mr-2 text-base">{item.emoji}</span>
                    <span className="text-white font-medium">{item.name}</span>
                  </td>
                  <td className="py-3 text-right text-white font-mono">{item.retailPrice}</td>
                  <td className="py-3 text-right">
                    <TrendChip change={item.change} trend={item.trend} />
                  </td>
                  <td className="py-3 pr-4">
                    <div className="flex items-center justify-end gap-1.5">
                      <StatusLight status={item.status} />
                      <span
                        className={`text-xs font-medium ${
                          item.status === 'stable'
                            ? 'text-emerald-400'
                            : item.status === 'warning'
                            ? 'text-amber-400'
                            : 'text-rose-400'
                        }`}
                      >
                        {item.status === 'stable' ? 'Stabil' : item.status === 'warning' ? 'Amaran' : 'Kritikal'}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 pl-4 text-xs text-slate-400 max-w-[220px] leading-relaxed">
                    {item.note}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <GovernmentActionTicker />
    </div>
  );
}

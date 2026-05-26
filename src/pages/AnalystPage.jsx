import { useContext, useState, useEffect } from 'react';
import { BarChart3, Globe, Package, X, RefreshCw } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import { ANALYST } from '../data/constants';
import { DataContext } from '../context/DataContext';
import Card from '../components/Card';
import SectionTitle from '../components/SectionTitle';
import TrendChip from '../components/TrendChip';
import InfoTooltip from '../components/InfoTooltip';
import SourceTag from '../components/SourceTag';
import StatusLight from '../components/StatusLight';
import GovernmentActionTicker from '../components/GovernmentActionTicker';
import { fetchMyrHistory } from '../api';
import { pct, pp, trend } from '../utils/formatters';

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
    source:  { label: 'Bank Negara Malaysia', href: 'https://www.bnm.gov.my/exchange-rates' },
  };

  const cpiFood = {
    label:   'CPI Makanan',
    value:   macro?.cpi?.food?.value != null ? `${macro.cpi.food.value}%` : `${ANALYST.cpiFood.value}%`,
    unit:    '',
    sub:     `Inflasi Makanan ${macro?.cpi?.food?.date?.slice(0, 7) ?? ''} (DOSM)`,
    tooltip: 'Indeks Harga Pengguna (CPI) untuk kategori makanan — petunjuk langsung tekanan sara hidup isi rumah.',
    change:  pp(macro?.cpi?.food?.change_pp) ?? ANALYST.cpiFood.change,
    trend:   macro?.cpi?.food?.trend ?? ANALYST.cpiFood.trend,
    source:  { label: 'DOSM CPI', href: 'https://data.gov.my/data-catalogue/cpi_headline' },
  };

  const cpiAll = {
    label:  'CPI Keseluruhan',
    value:  macro?.cpi?.overall?.value != null ? `${macro.cpi.overall.value}%` : `${ANALYST.cpiAll.value}%`,
    unit:   '',
    sub:    `${macro?.cpi?.overall?.date?.slice(0, 7) ?? ''} · DOSM`,
    change: pp(macro?.cpi?.overall?.change_pp) ?? ANALYST.cpiAll.change,
    trend:  macro?.cpi?.overall?.trend ?? ANALYST.cpiAll.trend,
    source: { label: 'DOSM CPI', href: 'https://data.gov.my/data-catalogue/cpi_headline' },
  };

  const ppi = {
    label:   'PPI Pembuatan',
    value:   macro?.ppi?.value != null ? `${macro.ppi.value}%` : `${ANALYST.ppiManufacturing.value}%`,
    unit:    '',
    sub:     `Pengeluaran ${macro?.ppi?.date?.slice(0, 7) ?? ''} · DOSM`,
    tooltip: 'Indeks Harga Pengeluar (PPI) mencerminkan tekanan inflasi di peringkat pengeluar — petanda awal kenaikan harga runcit dalam 1–3 bulan akan datang.',
    change:  pp(macro?.ppi?.change_pp) ?? ANALYST.ppiManufacturing.change,
    trend:   macro?.ppi?.trend ?? ANALYST.ppiManufacturing.trend,
    source:  { label: 'DOSM PPI', href: 'https://data.gov.my/data-catalogue/ppi' },
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
      source:  { label: 'EIA', href: 'https://www.eia.gov/petroleum/' },
    },
    {
      label:   'WTI Crude',
      value:   w ? `USD ${w.value}` : `USD ${ANALYST.wti.value}`,
      unit:    '/bbl',
      sub:     w ? `West Texas Intermediate · ${w.date}` : 'West Texas Intermediate',
      tooltip: 'WTI ialah penanda aras minyak mentah Amerika Syarikat, biasanya USD 2–5 lebih murah dari Brent kerana kos pengangkutan yang berbeza.',
      change:  pct(w?.change_pct) ?? ANALYST.wti.change,
      trend:   w?.trend ?? ANALYST.wti.trend,
      source:  { label: 'EIA', href: 'https://www.eia.gov/petroleum/' },
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
    label:  'Jumlah Eksport YTD',
    value:  t?.ytd_exports != null ? `RM ${t.ytd_exports}B` : `RM ${ANALYST.exportYTD.value}B`,
    style:  'bg-emerald-950/30 border-emerald-800/30 text-emerald-300',
    change: pct(t?.ytd_exp_yoy) ?? ANALYST.exportYTD.change,
    trend:  trend(t?.ytd_exp_yoy) ?? ANALYST.exportYTD.trend,
    source: { label: 'DOSM', href: 'https://data.gov.my/data-catalogue/trade_headline' },
  };

  const importYTD = {
    label:  'Jumlah Import YTD',
    value:  t?.ytd_imports != null ? `RM ${t.ytd_imports}B` : `RM ${ANALYST.importYTD.value}B`,
    style:  'bg-rose-950/30 border-rose-800/30 text-rose-300',
    change: pct(t?.ytd_imp_yoy) ?? ANALYST.importYTD.change,
    trend:  trend(t?.ytd_imp_yoy) ?? ANALYST.importYTD.trend,
    source: { label: 'DOSM', href: 'https://data.gov.my/data-catalogue/trade_headline' },
  };

  const tradeBalYTD = {
    label:  'Lebihan Dagangan YTD',
    value:  t?.ytd_balance != null ? `+RM ${t.ytd_balance}B` : `+RM ${ANALYST.tradeBalanceYTD.value}B`,
    style:  'bg-blue-950/30 border-blue-800/30 text-blue-300',
    change: ANALYST.tradeBalanceYTD.change,
    trend:  ANALYST.tradeBalanceYTD.trend,
    source: { label: 'DOSM', href: 'https://data.gov.my/data-catalogue/trade_headline' },
  };

  const [myrHistory, setMyrHistory]     = useState([]);
  const [myrDays, setMyrDays]           = useState(90);
  const [myrExpanded, setMyrExpanded]   = useState(false);
  const [myrLoading, setMyrLoading]     = useState(false);

  useEffect(() => {
    if (!myrExpanded) return;
    setMyrLoading(true);
    fetchMyrHistory(myrDays)
      .then(setMyrHistory)
      .catch(() => setMyrHistory([]))
      .finally(() => setMyrLoading(false));
  }, [myrExpanded, myrDays]);

  function MyrTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-slate-800 border border-slate-600 rounded-xl px-3 py-2 text-xs shadow-2xl">
        <div className="text-slate-400 mb-1">{label}</div>
        <div className="font-mono font-bold text-blue-300">{payload[0].value?.toFixed(4)}</div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <Card>
        <SectionTitle
          icon={BarChart3}
          title="Papan Pemuka Makroekonomi Penuh"
          sub={`Apr–Mei 2026`}
        />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {MACRO_GRID.map(item => {
            const isMyr = item.label === 'Kadar MYR/USD';
            const active = isMyr && myrExpanded;
            return (
              <div
                key={item.label}
                onClick={isMyr ? () => setMyrExpanded(v => !v) : undefined}
                className={`rounded-xl p-3.5 transition-colors ${
                  isMyr
                    ? `cursor-pointer ${active ? 'bg-blue-900/40 ring-1 ring-blue-500/50' : 'bg-slate-700/50 hover:bg-slate-700/80'}`
                    : 'bg-slate-700/50 hover:bg-slate-700/80'
                }`}
              >
                <div className="flex items-center text-xs text-slate-400 font-medium mb-1.5">
                  {item.label}
                  {item.tooltip && <InfoTooltip text={item.tooltip} />}
                  {isMyr && (
                    <span className="ml-auto text-[10px] text-blue-400 font-normal">
                      {active ? 'tutup ▲' : 'graf ▼'}
                    </span>
                  )}
                </div>
                <div className="text-2xl font-bold text-white leading-tight">
                  {item.value}
                  {item.unit && <span className="text-xs text-slate-400 font-normal ml-1">{item.unit}</span>}
                </div>
                <div className="mt-2">
                  <TrendChip change={item.change} trend={item.trend} />
                </div>
                <div className="text-xs text-slate-500 mt-1.5 leading-snug">{item.sub}</div>
                {item.source && (
                  <div className="mt-2">
                    <SourceTag label={item.source.label} href={item.source.href} />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {myrExpanded && (
          <div className="mt-4 bg-slate-800/60 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-sm font-semibold text-white">Trend MYR/USD</div>
                <div className="text-xs text-slate-500 mt-0.5">Kadar harian · FRED DEXMAUS</div>
              </div>
              <div className="flex items-center gap-2">
                {[30, 90, 180, 365].map(d => (
                  <button
                    key={d}
                    onClick={() => setMyrDays(d)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                      myrDays === d
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-700 text-slate-400 hover:text-white hover:bg-slate-600'
                    }`}
                  >
                    {d === 365 ? '1T' : `${d}H`}
                  </button>
                ))}
                <button
                  onClick={() => setMyrExpanded(false)}
                  className="ml-1 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {myrLoading ? (
              <div className="h-48 flex items-center justify-center gap-2 text-slate-500 text-sm">
                <RefreshCw size={14} className="animate-spin" />
                Memuatkan...
              </div>
            ) : myrHistory.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-slate-500 text-sm">
                Gagal memuatkan data.
              </div>
            ) : (
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={myrHistory} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                    <XAxis
                      dataKey="date"
                      tick={{ fill: '#94a3b8', fontSize: 10 }}
                      axisLine={{ stroke: '#334155' }}
                      tickLine={false}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      domain={['auto', 'auto']}
                      tickFormatter={v => v.toFixed(2)}
                      tick={{ fill: '#94a3b8', fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                      width={44}
                    />
                    <Tooltip content={<MyrTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#60a5fa"
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 4, strokeWidth: 0 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}
      </Card>

      <Card>
        <SectionTitle
          icon={Globe}
          title="Imbangan Dagangan Terperinci"
          sub={`Kumulatif Jan–${monthLabel}`}
        />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[exportYTD, importYTD, tradeBalYTD].map(item => (
            <div key={item.label} className={`border rounded-xl p-4 text-center ${item.style}`}>
              <div className="text-xs text-slate-400 mb-2">{item.label}</div>
              <div className="text-xl font-bold">{item.value}</div>
              <div className="mt-2 flex justify-center">
                <TrendChip change={item.change} trend={item.trend} />
              </div>
              {item.source && (
                <div className="mt-2 flex justify-center">
                  <SourceTag label={item.source.label} href={item.source.href} />
                </div>
              )}
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
        <div className="mb-3">
          <SourceTag label="DOSM PriceCatcher" href="https://data.gov.my/data-catalogue/pricecatcher" />
        </div>
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

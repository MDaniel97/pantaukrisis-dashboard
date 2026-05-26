import { useContext } from 'react';
import { Fuel, Shield, RefreshCw } from 'lucide-react';
import { DataContext } from '../context/DataContext';
import Card from './Card';
import SectionTitle from './SectionTitle';
import InfoTooltip from './InfoTooltip';
import SourceTag from './SourceTag';

export default function FuelComparisonWidget() {
  const { fuel } = useContext(DataContext);
  const savingsPerLitre = (fuel.marketRON95 - fuel.budi95Retail).toFixed(2);
  const savingsPct = Math.round(((fuel.marketRON95 - fuel.budi95Retail) / fuel.marketRON95) * 100);

  return (
    <Card className="w-fit max-w-2xl">
      <SectionTitle
        icon={Fuel}
        title="Perbandingan Harga Bahan Api"
        sub="Harga bersubsidi vs. harga pasaran semasa"
      />

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-emerald-950/50 border border-emerald-800/40 rounded-xl p-4">
          <div className="text-xs text-emerald-400 font-semibold uppercase tracking-wide mb-2">
            BUDI95 (Bersubsidi)
          </div>
          <div className="text-3xl font-bold text-emerald-300 whitespace-nowrap">
            RM {fuel.budi95Retail.toFixed(2)}
          </div>
          <div className="text-xs text-emerald-600 mt-1">per liter</div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-500">
            <Shield size={11} className="shrink-0" />
            <span>Kadar kawalan kerajaan</span>
          </div>
        </div>

        <div className="bg-rose-950/30 border border-rose-800/30 rounded-xl p-4">
          <div className="flex items-center gap-1 text-xs text-rose-400 font-semibold uppercase tracking-wide mb-2">
            Harga Pasaran
            <InfoTooltip text="Harga yang akan dikenakan jika subsidi dihapuskan. Dikira berdasarkan Brent Crude + kos penapisan + margin pengedar Petronas." />
          </div>
          <div className="text-3xl font-bold text-rose-300 whitespace-nowrap">
            RM {fuel.marketRON95.toFixed(2)}
          </div>
          <div className="text-xs text-rose-600 mt-1">per liter</div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-950 to-indigo-950 border border-blue-800/40 rounded-xl p-4 flex items-center justify-between gap-4">
        <div>
          <div className="text-xs text-blue-400 font-medium mb-1">Nilai Subsidi Per Liter</div>
          <div className="text-2xl font-bold text-white">
            RM {savingsPerLitre}
            <span className="text-sm text-blue-300 font-normal ml-1">/ liter</span>
          </div>
          <div className="text-xs text-blue-400 mt-1">
            Anda berjimat <strong>{savingsPct}%</strong> berbanding harga pasaran
          </div>
        </div>
      </div>

      <div className="mt-4 border border-slate-700 rounded-xl overflow-hidden">
        <table className="text-sm w-full">
          <thead>
            <tr className="bg-slate-700/50">
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-400 uppercase tracking-wide">Kategori</th>
              <th className="text-right px-4 py-2.5 text-xs font-semibold text-slate-400 uppercase tracking-wide">Harga / liter</th>
              <th className="text-right px-4 py-2.5 text-xs font-semibold text-slate-400 uppercase tracking-wide hidden sm:table-cell">Jenis</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/60">
            {[
              { label: 'RON95 BUDI',               price: fuel.budi95Retail,   badge: 'Subsidi', badgeCls: 'bg-emerald-900/60 text-emerald-300' },
              { label: 'RON95 SKPS',               price: fuel.skpsRetail,     badge: 'Subsidi', badgeCls: 'bg-blue-900/60 text-blue-300' },
              { label: 'RON95',                    price: fuel.marketRON95,    badge: 'Pasaran', badgeCls: 'bg-rose-900/60 text-rose-300' },
              { label: 'RON97',                    price: fuel.marketRON97,    badge: 'Pasaran', badgeCls: 'bg-rose-900/60 text-rose-300' },
              { label: 'Diesel (Semenanjung)',      price: fuel.diesel,         badge: 'Pasaran', badgeCls: 'bg-rose-900/60 text-rose-300' },
              { label: 'Diesel (Sabah & Sarawak)', price: fuel.dieselEastMsia, badge: 'Kawalan', badgeCls: 'bg-amber-900/60 text-amber-300' },
            ].map(row => (
              <tr key={row.label} className="hover:bg-slate-700/20 transition-colors">
                <td className="px-4 py-3 text-slate-200 font-medium">{row.label}</td>
                <td className="px-4 py-3 text-right font-mono font-bold text-white">
                  RM {row.price != null ? row.price.toFixed(2) : '—'}
                </td>
                <td className="px-4 py-3 text-right hidden sm:table-cell">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${row.badgeCls}`}>
                    {row.badge}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5">
        {[
          { badgeCls: 'bg-emerald-900/60 text-emerald-300', label: 'Subsidi BUDI95', desc: 'Warganegara Malaysia 16+, MyKad sah & lesen memandu aktif' },
          { badgeCls: 'bg-blue-900/60 text-blue-300',       label: 'Subsidi SKPS',  desc: 'Kadar subsidi untuk kenderaan berdaftar layak (SKPS)' },
          { badgeCls: 'bg-rose-900/60 text-rose-300',       label: 'Pasaran',       desc: 'Harga pump tanpa subsidi — berdasarkan harga minyak global' },
          { badgeCls: 'bg-amber-900/60 text-amber-300',     label: 'Kawalan',       desc: 'Harga tetap ditetapkan kerajaan untuk Sabah & Sarawak' },
        ].map(item => (
          <div key={item.label} className="flex items-center gap-1.5 text-xs text-slate-400 whitespace-nowrap">
            <span className={`px-1.5 py-0.5 rounded-full font-medium text-xs shrink-0 ${item.badgeCls}`}>{item.label}</span>
            <span>{item.desc}</span>
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <RefreshCw size={10} />
          Dikemas kini setiap Rabu
        </div>
        <SourceTag label="DOSM Fuel Price" href="https://data.gov.my/data-catalogue/fuelprice" />
      </div>
    </Card>
  );
}

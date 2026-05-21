import { useContext } from 'react';
import { AlertTriangle } from 'lucide-react';
import { DataContext } from '../context/DataContext';
import FuelComparisonWidget from '../components/FuelComparisonWidget';
import SavingCalculator from '../components/SavingCalculator';
import FuelPriceChart from '../components/FuelPriceChart';
import CommodityTrafficLight from '../components/CommodityTrafficLight';
import GovernmentActionTicker from '../components/GovernmentActionTicker';

export default function RakyatPage() {
  const { commodities } = useContext(DataContext);
  const criticalItems = commodities.filter(c => c.status === 'critical');

  return (
    <div className="space-y-5">
      {criticalItems.length > 0 && (
        <div
          role="button"
          tabIndex={0}
          onClick={() => document.getElementById('govt-action')?.scrollIntoView({ behavior: 'smooth' })}
          onKeyDown={e => e.key === 'Enter' && document.getElementById('govt-action')?.scrollIntoView({ behavior: 'smooth' })}
          className="bg-rose-950/50 border border-rose-700/60 rounded-2xl px-5 py-4 flex items-start gap-3 cursor-pointer hover:bg-rose-950/70 hover:border-rose-600/70 transition-colors"
        >
          <AlertTriangle size={20} className="text-rose-400 shrink-0 mt-0.5" />
          <div>
            <div className="text-rose-200 font-semibold text-sm">
              Amaran Bekalan Aktif — {criticalItems[0].name}
            </div>
            <div className="text-rose-400/80 text-xs mt-1 leading-relaxed">
              {criticalItems[0].note} Kerajaan sedang mengambil tindakan segera — lihat &ldquo;Kerajaan
              Bertindak&rdquo; di bawah.
            </div>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-5">
        <FuelComparisonWidget />
        <SavingCalculator />
      </div>

      <FuelPriceChart />

      <CommodityTrafficLight />
      <div id="govt-action">
        <GovernmentActionTicker limit={3} />
      </div>
    </div>
  );
}

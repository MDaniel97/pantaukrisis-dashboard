import { useState, useEffect } from 'react';
import { Activity, RefreshCw, User, Building2, BarChart3, BookOpen } from 'lucide-react';
import { DataContext } from './context/DataContext';
import { FUEL, COMMODITIES, mapFuelResponse, mapCommoditiesResponse } from './data/constants';
import RakyatPage from './pages/RakyatPage';
import SMEPage from './pages/SMEPage';
import AnalystPage from './pages/AnalystPage';
import MethodologyPage from './pages/MethodologyPage';
import SourceTag from './components/SourceTag';

const PERSONAS = [
  {
    id:       'rakyat',
    label:    'Rakyat',
    sublabel: 'Isi Rumah',
    icon:     User,
    desc:     'Harga bahan api, kos sara hidup, kalkulator jimat subsidi, & status barangan asas',
  },
  {
    id:       'sme',
    label:    'Perniagaan',
    sublabel: 'PKS & Korporat',
    icon:     Building2,
    desc:     'Kos logistik, data perdagangan import/eksport, harga borong komoditi, & skor risiko',
  },
  {
    id:       'analyst',
    label:    'Penganalisis',
    sublabel: 'Pelabur & Media',
    icon:     BarChart3,
    desc:     'Makroekonomi penuh: Brent/WTI, LNG, imbangan dagangan, CPI, & MYR/USD',
  },
  {
    id:       'methodology',
    label:    'Metodologi',
    sublabel: 'Sumber & Kaedah',
    icon:     BookOpen,
    desc:     'Sumber data, kaedah pengambilan, rantaian sandaran, cache, & endpoint API backend',
  },
];

export default function PantauKrisisDashboard() {
  const [activePersona, setActivePersona] = useState('rakyat');
  const [fuel, setFuel] = useState(FUEL);
  const [commodities, setCommodities] = useState(COMMODITIES);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [macro, setMacro] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const tryInOrder = (...fetchers) =>
      fetchers.reduce((p, fn) => p.catch(fn), Promise.reject());

    const fetchFuel = () => tryInOrder(
      () => fetch('/api/fuel/latest')
              .then(r => r.ok ? r.json() : Promise.reject()),
      () => fetch('https://api.data.gov.my/data-catalogue?id=fuelprice&limit=1&sort=-date')
              .then(r => r.ok ? r.json() : Promise.reject())
              .then(rows => rows[0]),
      () => fetch('/fuel-snapshot.json')
              .then(r => r.ok ? r.json() : Promise.reject()),
    );

    Promise.all([
      fetchFuel(),
      fetch('/api/commodities').then(r => r.ok ? r.json() : Promise.reject(r.status)),
    ])
      .then(([fuelData, commodityData]) => {
        setFuel(mapFuelResponse(fuelData));
        if (commodityData.length > 0) setCommodities(mapCommoditiesResponse(commodityData));
        setLastUpdated(fuelData.fetched_at ?? fuelData.snapshot_at ?? fuelData.date);
      })
      .catch(err => console.warn('API unavailable, using mock data:', err))
      .finally(() => setLoading(false));

    fetch('/api/macro')
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setMacro(data); })
      .catch(() => {});
  }, []);

  const persona = PERSONAS.find(p => p.id === activePersona);

  return (
    <DataContext.Provider value={{ fuel, commodities, lastUpdated, macro }}>
      <div className="min-h-screen bg-slate-900 text-white font-sans antialiased">

        <header className="bg-slate-900 border-b border-slate-800 px-4 py-4">
          <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-xl">
                <Activity size={20} className="text-white" />
              </div>
              <div>
                <div className="font-bold text-white text-lg leading-none">PantauKrisis</div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Pemantauan Bekalan &amp; Harga Semasa Malaysia
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 shrink-0">
              <RefreshCw size={11} className={loading ? 'animate-spin text-slate-500' : 'text-emerald-400'} />
              <span className="text-slate-500">Dikemaskini pada:</span>
              <span className="text-slate-300">
                {lastUpdated ? (() => {
                  const d = new Date(lastUpdated);
                  return Number.isNaN(d.getTime()) ? lastUpdated : d.toLocaleString('ms-MY', {
                    day: 'numeric', month: 'short', year: 'numeric',
                    hour: '2-digit', minute: '2-digit',
                  });
                })() : '—'}
              </span>
            </div>
          </div>
        </header>

        <div className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 py-3">
          <div className="max-w-5xl mx-auto">
            <div className="flex gap-2">
              {PERSONAS.map(p => {
                const Icon = p.icon;
                const active = activePersona === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => setActivePersona(p.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      active
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <Icon size={16} />
                    <div className="text-left hidden sm:block">
                      <div className="leading-none">{p.label}</div>
                      <div className={`text-xs mt-0.5 ${active ? 'text-blue-200' : 'text-slate-500'}`}>
                        {p.sublabel}
                      </div>
                    </div>
                    <span className="sm:hidden">{p.label}</span>
                  </button>
                );
              })}
            </div>
            {persona && (
              <p className="text-xs text-slate-500 mt-2 hidden sm:block">{persona.desc}</p>
            )}
          </div>
        </div>

        <main className="max-w-5xl mx-auto px-4 py-6">
          {activePersona === 'rakyat'       && <RakyatPage />}
          {activePersona === 'sme'          && <SMEPage />}
          {activePersona === 'analyst'      && <AnalystPage />}
          {activePersona === 'methodology'  && <MethodologyPage />}
        </main>

        <footer className="border-t border-slate-800 px-4 py-6 mt-4">
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span>Sumber data:</span>
              <SourceTag label="Petronas" href="https://www.petronas.com" />
              <SourceTag label="Bank Negara" href="https://www.bnm.gov.my" />
              <SourceTag label="DOSM" href="https://data.gov.my" />
              <SourceTag label="KPDNHEP" href="https://www.kpdn.gov.my" />
              <SourceTag label="Drewry WCI" href="https://www.drewry.co.uk/supply-chain-advisors/supply-chain-expertise/world-container-index-assessed-by-drewry" />
            </div>
            <div className="flex items-center gap-3">
              <span>© 2026 Kementerian Digital</span>
              <span className="text-slate-700">|</span>
              <span className="hover:text-blue-400 cursor-pointer transition-colors">Tentang PantauKrisis</span>
              <span className="text-slate-700">|</span>
              <span className="hover:text-blue-400 cursor-pointer transition-colors">API Awam</span>
            </div>
          </div>
        </footer>

      </div>
    </DataContext.Provider>
  );
}

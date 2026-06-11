import { useState, useEffect } from 'react';
import { Activity, RefreshCw, User, Building2, BarChart3, BookOpen, Sun, Moon } from 'lucide-react';
import { DataContext } from './context/DataContext';
import { useTheme } from './context/ThemeContext';
import { useLanguage } from './context/LanguageContext';
import { FUEL, COMMODITIES, mapFuelResponse, mapCommoditiesResponse } from './data/constants';
import { fetchFuelLatest, fetchCommodities, fetchMacro } from './api';
import RakyatPage from './pages/RakyatPage';
import SMEPage from './pages/SMEPage';
import AnalystPage from './pages/AnalystPage';
import MethodologyPage from './pages/MethodologyPage';
import Masthead from './components/Masthead';
import Footer from './components/Footer';

const PERSONA_KEYS = [
  { id: 'rakyat',      icon: User      },
  { id: 'perniagaan',  icon: Building2 },
  { id: 'penganalisis',icon: BarChart3 },
  { id: 'metodologi',  icon: BookOpen  },
];

export default function PantauKrisisDashboard() {
  const { isDark, toggle: toggleTheme } = useTheme();
  const { lang, toggle: toggleLang, t } = useLanguage();
  const [activePersona, setActivePersona] = useState('rakyat');
  const [fuel, setFuel] = useState(FUEL);
  const [commodities, setCommodities] = useState(COMMODITIES);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [macro, setMacro] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fuelSource, setFuelSource] = useState('mock');

  useEffect(() => {
    const tryInOrder = (...fetchers) =>
      fetchers.reduce((p, fn) => p.catch(fn), Promise.reject());

    // Priority: DOSM live → latest snapshot → backend (down) → hardcoded mock.
    const fetchFuel = () => tryInOrder(
      () => fetch('https://api.data.gov.my/data-catalogue?id=fuelprice&limit=1&sort=-date')
              .then(r => r.ok ? r.json() : Promise.reject())
              .then(rows => ({ ...rows[0], _source: 'dosm' })),
      () => fetch('/fuel-snapshot.json')
              .then(r => r.ok ? r.json() : Promise.reject())
              .then(d => ({ ...d, _source: 'snapshot' })),
      () => fetchFuelLatest()
              .then(d => ({ ...d, _source: 'backend' })),
    );

    // Fuel and commodities are fetched independently — a commodities failure
    // must never discard a good fuel result (and vice versa).
    fetchFuel()
      .then(fuelData => {
        setFuel(mapFuelResponse(fuelData));
        setFuelSource(fuelData._source);
        // Show when the data was last refreshed (its recency), not the weekly
        // price's effective date. DOSM live rows carry no timestamp, so a fresh
        // live fetch is stamped with "now".
        setLastUpdated(fuelData.fetched_at ?? fuelData.snapshot_at ?? new Date().toISOString());
      })
      .catch(err => console.warn('Fuel unavailable, using mock data:', err))
      .finally(() => setLoading(false));

    fetchCommodities()
      .then(data => { if (data.length > 0) setCommodities(mapCommoditiesResponse(data)); })
      .catch(err => console.warn('Commodities unavailable, using mock data:', err));

    fetchMacro()
      .then(data => { if (data) setMacro(data); })
      .catch(() => {});
  }, []);

  return (
    <DataContext.Provider value={{ fuel, commodities, lastUpdated, macro }}>
      <div className="min-h-screen overflow-x-hidden bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-sans antialiased">

        <Masthead />

        <header className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4.5 md:px-6 py-4">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-xl shrink-0">
                <Activity size={20} className="text-white" />
              </div>
              <div>
                <div className="font-bold text-slate-900 dark:text-white text-lg leading-none">PantauKrisis</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {t('app.tagline')}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <div className="flex flex-col items-end gap-0.5 text-xs shrink-0">
                <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                  <RefreshCw size={11} className={loading ? 'animate-spin text-slate-400 dark:text-slate-500' : 'text-emerald-500 dark:text-emerald-400'} />
                  <span className="text-slate-500 dark:text-slate-300">
                    {lastUpdated ? (() => {
                      const d = new Date(lastUpdated);
                      return Number.isNaN(d.getTime()) ? lastUpdated : d.toLocaleString('ms-MY', {
                        day: 'numeric', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      });
                    })() : '—'}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 dark:text-slate-500">
                  {t(`status.source.${fuelSource}`)}
                </span>
              </div>
              {/* Language toggle */}
              <button
                onClick={toggleLang}
                className="flex items-center gap-0.5 px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800"
                aria-label="Toggle language"
              >
                <span className={lang === 'bm' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}>BM</span>
                <span className="text-slate-300 dark:text-slate-600 mx-0.5">/</span>
                <span className={lang === 'en' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}>EN</span>
              </button>
              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label={isDark ? t('nav.rakyat') : t('nav.rakyat')}
              >
                {isDark ? <Sun size={16} /> : <Moon size={16} />}
              </button>
            </div>
          </div>
        </header>

        <div className="sticky top-0 z-40 bg-slate-50/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4.5 md:px-6 py-3">
          <div className="max-w-7xl mx-auto">
            <div className="flex gap-2 overflow-x-auto -mx-4.5 px-4.5 sm:mx-0 sm:px-0">
              {PERSONA_KEYS.map(p => {
                const Icon = p.icon;
                const active = activePersona === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => setActivePersona(p.id)}
                    className={`flex items-center gap-2 shrink-0 px-3 sm:px-4 py-2.5 rounded-xl text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      active
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Icon size={16} />
                    <div className="text-left hidden sm:block">
                      <div className="leading-none">{t(`nav.${p.id}`)}</div>
                      <div className={`text-xs mt-0.5 ${active ? 'text-blue-200' : 'text-slate-400 dark:text-slate-500'}`}>
                        {t(`nav.${p.id}.sub`)}
                      </div>
                    </div>
                    <span className="sm:hidden">{t(`nav.${p.id}`)}</span>
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 hidden sm:block">
              {t(`nav.${activePersona}.desc`)}
            </p>
          </div>
        </div>

        <main className="max-w-7xl mx-auto px-4.5 md:px-6 py-6">
          {activePersona === 'rakyat'       && <RakyatPage />}
          {activePersona === 'perniagaan'   && <SMEPage />}
          {activePersona === 'penganalisis' && <AnalystPage />}
          {activePersona === 'metodologi'   && <MethodologyPage />}
        </main>

        <Footer />

      </div>
    </DataContext.Provider>
  );
}

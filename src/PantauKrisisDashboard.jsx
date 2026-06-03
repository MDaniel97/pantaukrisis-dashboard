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
import SourceTag from './components/SourceTag';

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

  useEffect(() => {
    const tryInOrder = (...fetchers) =>
      fetchers.reduce((p, fn) => p.catch(fn), Promise.reject());

    const fetchFuel = () => tryInOrder(
      () => fetchFuelLatest(),
      () => fetch('https://api.data.gov.my/data-catalogue?id=fuelprice&limit=1&sort=-date')
              .then(r => r.ok ? r.json() : Promise.reject())
              .then(rows => rows[0]),
      () => fetch('/fuel-snapshot.json')
              .then(r => r.ok ? r.json() : Promise.reject()),
    );

    Promise.all([
      fetchFuel(),
      fetchCommodities(),
    ])
      .then(([fuelData, commodityData]) => {
        setFuel(mapFuelResponse(fuelData));
        if (commodityData.length > 0) setCommodities(mapCommoditiesResponse(commodityData));
        setLastUpdated(fuelData.fetched_at ?? fuelData.snapshot_at ?? fuelData.date);
      })
      .catch(err => console.warn('API unavailable, using mock data:', err))
      .finally(() => setLoading(false));

    fetchMacro()
      .then(data => { if (data) setMacro(data); })
      .catch(() => {});
  }, []);

  return (
    <DataContext.Provider value={{ fuel, commodities, lastUpdated, macro }}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-sans antialiased">

        <header className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-4">
          <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-xl">
                <Activity size={20} className="text-white" />
              </div>
              <div>
                <div className="font-bold text-slate-900 dark:text-white text-lg leading-none">PantauKrisis</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {t('app.tagline')}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 shrink-0">
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

        <div className="sticky top-0 z-40 bg-slate-50/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-3">
          <div className="max-w-5xl mx-auto">
            <div className="flex gap-2">
              {PERSONA_KEYS.map(p => {
                const Icon = p.icon;
                const active = activePersona === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => setActivePersona(p.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
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

        <main className="max-w-5xl mx-auto px-4 py-6">
          {activePersona === 'rakyat'       && <RakyatPage />}
          {activePersona === 'perniagaan'   && <SMEPage />}
          {activePersona === 'penganalisis' && <AnalystPage />}
          {activePersona === 'metodologi'   && <MethodologyPage />}
        </main>

        <footer className="border-t border-slate-200 dark:border-slate-800 px-4 py-6 mt-4">
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 dark:text-slate-500">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span>{t('footer.sources')}</span>
              <SourceTag label="Petronas" href="https://www.petronas.com" />
              <SourceTag label="Bank Negara" href="https://www.bnm.gov.my" />
              <SourceTag label="DOSM" href="https://data.gov.my" />
              <SourceTag label="KPDNHEP" href="https://www.kpdn.gov.my" />
              <SourceTag label="Drewry WCI" href="https://www.drewry.co.uk/supply-chain-advisors/supply-chain-expertise/world-container-index-assessed-by-drewry" />
            </div>
            <div className="flex items-center gap-3">
              <span>{t('footer.copyright')}</span>
              <span className="text-slate-300 dark:text-slate-700">|</span>
              <span className="hover:text-blue-500 dark:hover:text-blue-400 cursor-pointer transition-colors">{t('footer.about')}</span>
              <span className="text-slate-300 dark:text-slate-700">|</span>
              <span className="hover:text-blue-500 dark:hover:text-blue-400 cursor-pointer transition-colors">{t('footer.api')}</span>
            </div>
          </div>
        </footer>

      </div>
    </DataContext.Provider>
  );
}

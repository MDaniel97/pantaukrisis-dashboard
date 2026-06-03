import { useState, useContext } from 'react';
import { Calculator } from 'lucide-react';
import { DataContext } from '../context/DataContext';
import { useLanguage } from '../context/LanguageContext';
import { CALC_CATEGORIES } from '../data/constants';
import Card from './Card';
import SectionTitle from './SectionTitle';
import SourceTag from './SourceTag';

const FILL_MONTH = 4;
const DEFAULT_RM = 50;

const CAT_KEYS = {
  budi95:       { label: 'calc.cat.budi95.label', desc: 'calc.cat.budi95.desc' },
  skps:         { label: 'calc.cat.skps.label',   desc: 'calc.cat.skps.desc'   },
  'diesel-east':{ label: 'calc.cat.diesel.label', desc: 'calc.cat.diesel.desc' },
};

export default function SavingCalculator() {
  const { fuel } = useContext(DataContext);
  const { t } = useLanguage();
  const [categoryId, setCategoryId] = useState('budi95');
  const [rmInput, setRmInput]       = useState('');

  const category = CALC_CATEGORIES.find(c => c.id === categoryId);

  const subsidisedRate = category.getSubsidised(fuel);
  const marketRate     = category.getMarket(fuel);

  const parsedRm             = Number.parseFloat(rmInput);
  const budget               = rmInput && !Number.isNaN(parsedRm) && parsedRm > 0 ? parsedRm : DEFAULT_RM;
  const litresFromBudget     = budget / subsidisedRate;
  const marketCostSameLitres = litresFromBudget * marketRate;
  const pumpSavings          = marketCostSameLitres - budget;

  const monthlySavings = pumpSavings * FILL_MONTH;
  const annualSavings  = monthlySavings * 12;

  return (
    <Card>
      <SectionTitle
        icon={Calculator}
        iconBg="bg-purple-950"
        iconColor="text-purple-400"
        title={t('calc.title')}
        sub={t('calc.sub')}
      />

      <div className="mb-4">
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-2">{t('calc.category')}</p>
        <div className="flex flex-col gap-2">
          {CALC_CATEGORIES.map(cat => {
            const keys = CAT_KEYS[cat.id] ?? { label: cat.id, desc: '' };
            return (
              <button
                key={cat.id}
                onClick={() => { setCategoryId(cat.id); setRmInput(''); }}
                className={`px-3 py-2.5 rounded-xl text-xs font-medium transition-all border text-left flex items-center justify-between ${
                  categoryId === cat.id
                    ? 'bg-purple-700 border-purple-500 text-white'
                    : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200 dark:bg-slate-700/60 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700'
                }`}
              >
                <span className="font-semibold">{t(keys.label)}</span>
                <span className={`text-xs ${categoryId === cat.id ? 'text-purple-200' : 'text-slate-400 dark:text-slate-500'}`}>
                  {t(keys.desc)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mb-4">
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-2">{t('calc.inputLabel')}</p>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 text-sm font-bold">RM</span>
          <input
            type="number"
            min="0.01"
            max="5000"
            step="0.01"
            placeholder={DEFAULT_RM}
            value={rmInput}
            onChange={e => setRmInput(e.target.value)}
            className="w-full bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white rounded-xl pl-10 pr-4 py-2.5 text-sm placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5">
          {t('calc.defaultNote', { amount: DEFAULT_RM })}
        </p>
      </div>

      <div className="bg-slate-100 dark:bg-slate-900 rounded-xl p-4 space-y-3">
        <div className="flex justify-between items-center text-sm">
          <span className="text-slate-500 dark:text-slate-400">{t('calc.litres')}</span>
          <span className="font-bold text-slate-900 dark:text-white">{litresFromBudget.toFixed(5)} L</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-slate-500 dark:text-slate-400">{t('calc.marketCost')}</span>
          <span className="font-bold text-rose-600 dark:text-rose-300">RM {marketCostSameLitres.toFixed(2)}</span>
        </div>

        <div className="border-t border-slate-200 dark:border-slate-700/60 pt-3 space-y-2.5">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-slate-900 dark:text-white font-semibold text-sm">{t('calc.yourSavings')}</div>
              <div className="text-xs text-slate-400 dark:text-slate-500">{t('calc.perFill')}</div>
            </div>
            <span className="text-2xl font-bold text-yellow-500 dark:text-yellow-300">RM {pumpSavings.toFixed(2)}</span>
          </div>

          <div className="flex justify-between items-center bg-slate-200/60 dark:bg-slate-800/60 rounded-xl px-3 py-2.5">
            <div>
              <div className="text-slate-700 dark:text-slate-300 font-medium text-xs">{t('calc.monthly')}</div>
              <div className="text-xs text-slate-400 dark:text-slate-500">{t('calc.monthlyNote', { n: FILL_MONTH })}</div>
            </div>
            <span className="text-lg font-bold text-yellow-500 dark:text-yellow-400">RM {monthlySavings.toFixed(2)}</span>
          </div>

          <div className="flex justify-between items-center bg-slate-200/60 dark:bg-slate-800/60 rounded-xl px-3 py-2.5">
            <div>
              <div className="text-slate-700 dark:text-slate-300 font-medium text-xs">{t('calc.annual')}</div>
              <div className="text-xs text-slate-400 dark:text-slate-500">{t('calc.annualNote')}</div>
            </div>
            <span className="text-lg font-bold text-yellow-500 dark:text-yellow-400">≈ RM {annualSavings.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="mt-3 flex justify-end">
        <SourceTag label="DOSM Fuel Price" href="https://data.gov.my/data-catalogue/fuelprice" />
      </div>
    </Card>
  );
}

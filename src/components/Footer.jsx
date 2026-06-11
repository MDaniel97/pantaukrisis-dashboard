import { useLanguage } from '../context/LanguageContext';
import SourceTag from './SourceTag';

const SOURCES = [
  { label: 'Petronas',    href: 'https://www.petronas.com' },
  { label: 'Bank Negara', href: 'https://www.bnm.gov.my' },
  { label: 'DOSM',        href: 'https://data.gov.my' },
  { label: 'KPDNHEP',     href: 'https://www.kpdn.gov.my' },
  { label: 'Drewry WCI',  href: 'https://www.drewry.co.uk/supply-chain-advisors/supply-chain-expertise/world-container-index-assessed-by-drewry' },
];

// MYDS footer — ministry block + link columns, a divider, then the bottom bar.
// https://design.digital.gov.my/en/docs/develop/footer
export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4.5 md:px-6 py-10 divide-y divide-slate-200 dark:divide-slate-800">

        {/* Top: ministry identity + link columns */}
        <div className="flex flex-col lg:flex-row lg:justify-between gap-8 pb-8">
          <div className="flex flex-col gap-4 max-w-sm">
            <div className="flex items-center gap-2.5">
              <img
                src="/assets/jata-negara.png"
                alt="Jata Negara"
                className="h-9 w-auto shrink-0"
                width={204}
                height={159}
              />
              <div>
                <h6 className="font-semibold text-slate-900 dark:text-white leading-none">{t('footer.ministry')}</h6>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">GovTech Malaysia</p>
              </div>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 whitespace-pre-line leading-relaxed">
              {t('footer.address')}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-8">
            <div className="space-y-3">
              <p className="font-semibold text-sm text-slate-900 dark:text-white">{t('footer.links.title')}</p>
              <div className="flex flex-col gap-2 text-sm">
                <span className="text-slate-500 dark:text-slate-400">{t('footer.about')}</span>
                <span className="text-slate-500 dark:text-slate-400">{t('footer.api')}</span>
              </div>
            </div>

            <div className="space-y-3">
              <p className="font-semibold text-sm text-slate-900 dark:text-white">{t('footer.sources')}</p>
              <div className="flex flex-wrap gap-x-3 gap-y-2 max-w-xs">
                {SOURCES.map(s => <SourceTag key={s.label} label={s.label} href={s.href} />)}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom: copyright */}
        <div className="pt-6 text-xs text-slate-400 dark:text-slate-500">
          {t('footer.copyright')}
        </div>
      </div>
    </footer>
  );
}

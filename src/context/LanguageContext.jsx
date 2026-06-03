import { createContext, useContext, useState } from 'react';
import { translations } from '../data/translations';

const LanguageContext = createContext({ lang: 'bm', toggle: () => {}, t: k => k });

export const useLanguage = () => useContext(LanguageContext);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('lang') ?? 'bm');

  const toggle = () => setLang(v => {
    const next = v === 'bm' ? 'en' : 'bm';
    localStorage.setItem('lang', next);
    return next;
  });

  const t = (key, vars = {}) => {
    const str = translations[lang]?.[key] ?? key;
    return Object.entries(vars).reduce((s, [k, v]) => s.replace(`{${k}}`, v), str);
  };

  return (
    <LanguageContext.Provider value={{ lang, toggle, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

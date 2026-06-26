import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'nl' | 'en';

const translations = {
  nl: {
    menu_dashboard: "Dashboard",
    menu_defi: "DeFi Hub",
    menu_academy: "OTT Academy",
    menu_intel: "Ledger Intel",
    menu_logout: "Verbinding Verbreken",
  },
  en: {
    menu_dashboard: "Dashboard",
    menu_defi: "DeFi Hub",
    menu_academy: "OTT Academy",
    menu_intel: "Ledger Intel",
    menu_logout: "Disconnect Wallet",
  }
};

type TranslationKey = keyof typeof translations.nl;

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLang] = useState<Language>('nl');

  const t = (key: TranslationKey) => {
    return translations[lang][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage moet binnen een LanguageProvider gebruikt worden");
  }
  return context;
};

import { useEffect, useMemo, useState } from "react";
import {
  getTerminalCopy,
  getTerminalLanguage,
  type TerminalLanguage,
} from "./terminalCopy";

const LANGUAGE_STORAGE_KEY = "ott-terminal-language-v2";

function getInitialLanguage(): TerminalLanguage {
  const saved =
    typeof window !== "undefined"
      ? window.localStorage.getItem(LANGUAGE_STORAGE_KEY)
      : null;

  if (saved === "en" || saved === "nl") {
    return saved;
  }

  return "en";
}

export function useTerminalLanguage() {
  const [language, setLanguageState] = useState<TerminalLanguage>(() =>
    getInitialLanguage(),
  );

  useEffect(() => {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    document.documentElement.lang = language;
    window.dispatchEvent(
      new CustomEvent("ott-terminal-language-change", {
        detail: { language },
      }),
    );
  }, [language]);

  useEffect(() => {
    function handleLanguageChange(event: Event) {
      const customEvent = event as CustomEvent<{ language?: string }>;
      const nextLanguage = getTerminalLanguage(customEvent.detail?.language);

      setLanguageState(nextLanguage);
    }

    window.addEventListener(
      "ott-terminal-language-change",
      handleLanguageChange,
    );

    return () => {
      window.removeEventListener(
        "ott-terminal-language-change",
        handleLanguageChange,
      );
    };
  }, []);

  const copy = useMemo(() => getTerminalCopy(language), [language]);

  function setLanguage(nextLanguage: TerminalLanguage) {
    setLanguageState(nextLanguage);
  }

  function toggleLanguage() {
    setLanguageState((current) => (current === "nl" ? "en" : "nl"));
  }

  return {
    language,
    copy,
    setLanguage,
    toggleLanguage,
    isEnglish: language === "en",
    isDutch: language === "nl",
  };
}

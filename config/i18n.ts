
import LanguageDetector from "i18next-browser-languagedetector"
import i18n from "i18next"
import { initReactI18next } from "react-i18next"

// Import your translation files
import enTranslations from "../locales/en.json"
import frTranslations from "../locales/fr.json"

const resources = {
  en: {
    translation: enTranslations,
  },
  fr: {
    translation: frTranslations,
  },
}

// Only initialize on client side
if (typeof window !== "undefined") {
  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources,
      fallbackLng: "en",
      debug: process.env.NODE_ENV === "development",

      detection: {
        order: ["localStorage", "navigator", "htmlTag"],
        caches: ["localStorage"],
        lookupLocalStorage: "language",
      },

      interpolation: {
        escapeValue: false, // not needed for react as it escapes by default
      },

      react: {
        useSuspense: false,
      },
    })
}

export default i18n

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import en from "./locales/en.json";
import ta from "./locales/ta.json";
import te from "./locales/te.json";
import ml from "./locales/ml.json";
import hi from "./locales/hi.json";

export const SUPPORTED_LANGUAGES = [
  { code: "en", label: "English",    nativeLabel: "English" },
  { code: "ta", label: "Tamil",      nativeLabel: "தமிழ்" },
  { code: "te", label: "Telugu",     nativeLabel: "తెలుగు" },
  { code: "ml", label: "Malayalam",  nativeLabel: "മലയാളം" },
  { code: "hi", label: "Hindi",      nativeLabel: "हिंदी" },
];

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: { en: { translation: en }, ta: { translation: ta }, te: { translation: te }, ml: { translation: ml }, hi: { translation: hi } },
    fallbackLng: "en",
    supportedLngs: SUPPORTED_LANGUAGES.map((l) => l.code),
    interpolation: { escapeValue: false }, // React already escapes
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
      lookupLocalStorage: "repair_language",
    },
  });

export default i18n;

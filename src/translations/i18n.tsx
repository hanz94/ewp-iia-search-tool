import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./en.json";
import pl from "./pl.json";
import tr from "./tr.json";

const currentLanguage = localStorage.getItem("currentAppLanguage") || "pl"; 

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      pl: { translation: pl },
      tr: { translation: tr },
    },
    lng: currentLanguage,
    fallbackLng: "pl",
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;

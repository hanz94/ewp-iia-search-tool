import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const currentLanguage = localStorage.getItem("currentAppLanguage") || "pl"; 

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: {
          CSV_ERASMUS_CODE: "Erasmus+ Code",
          CSV_INSTITUTION_NAME: "Institution Name",
        },
      },
      pl: {
        translation: {
          CSV_ERASMUS_CODE: "Kod Erasmus+",
          CSV_INSTITUTION_NAME: "Nazwa instytucji",
        },
      },
    },
    lng: currentLanguage,
    fallbackLng: "pl",
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;

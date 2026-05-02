import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import commonFr from "./__i18n__/fr";
import commonEn from "./__i18n__/en";
import sidebarFr from "../components/Sidebar/__i18n__/fr";
import sidebarEn from "../components/Sidebar/__i18n__/en";
import installFr from "../pages/Install/__i18n__/fr";
import installEn from "../pages/Install/__i18n__/en";
import dashboardFr from "../games/palworld/pages/Dashboard/__i18n__/fr";
import dashboardEn from "../games/palworld/pages/Dashboard/__i18n__/en";
import configFr from "../games/palworld/pages/Config/__i18n__/fr";
import configEn from "../games/palworld/pages/Config/__i18n__/en";
import logsFr from "../games/palworld/pages/Logs/__i18n__/fr";
import logsEn from "../games/palworld/pages/Logs/__i18n__/en";
import networkFr from "../games/palworld/pages/Network/__i18n__/fr";
import networkEn from "../games/palworld/pages/Network/__i18n__/en";
import backupFr from "../games/palworld/pages/Backup/__i18n__/fr";
import backupEn from "../games/palworld/pages/Backup/__i18n__/en";
import scheduleFr from "../games/palworld/pages/Schedule/__i18n__/fr";
import scheduleEn from "../games/palworld/pages/Schedule/__i18n__/en";
import playersFr from "../games/palworld/pages/Players/__i18n__/fr";
import playersEn from "../games/palworld/pages/Players/__i18n__/en";
import updaterFr from "../components/UpdateBanner/__i18n__/fr";
import updaterEn from "../components/UpdateBanner/__i18n__/en";

const fr = {
  ...commonFr,
  ...sidebarFr,
  ...installFr,
  ...dashboardFr,
  ...configFr,
  ...logsFr,
  ...networkFr,
  ...backupFr,
  ...scheduleFr,
  ...playersFr,
  ...updaterFr,
};

const en = {
  ...commonEn,
  ...sidebarEn,
  ...installEn,
  ...dashboardEn,
  ...configEn,
  ...logsEn,
  ...networkEn,
  ...backupEn,
  ...scheduleEn,
  ...playersEn,
  ...updaterEn,
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      fr: { translation: fr },
      en: { translation: en },
    },
    fallbackLng: "fr",
    supportedLngs: ["fr", "en"],
    interpolation: { escapeValue: false },
    detection: {
      order: ["localStorage", "navigator"],
      lookupLocalStorage: "locale",
      caches: ["localStorage"],
    },
  });

export default i18n;

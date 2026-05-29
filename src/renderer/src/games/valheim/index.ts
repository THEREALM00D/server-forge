import type { GamePlugin } from "../types";
import Dashboard from "./pages/Dashboard/Dashboard";
import Config from "./pages/Config/Config";
import Network from "./pages/Network/Network";
import dashboardFr from "./pages/Dashboard/__i18n__/fr";
import dashboardEn from "./pages/Dashboard/__i18n__/en";
import configFr from "./pages/Config/__i18n__/fr";
import configEn from "./pages/Config/__i18n__/en";
import networkFr from "./pages/Network/__i18n__/fr";
import networkEn from "./pages/Network/__i18n__/en";

export const valheimPlugin: GamePlugin = {
  id: "valheim",
  supportedPages: ["dashboard", "install", "config", "network"],
  pages: {
    dashboard: Dashboard,
    config: Config,
    network: Network,
  },
  i18n: {
    fr: { ...dashboardFr, ...configFr, ...networkFr },
    en: { ...dashboardEn, ...configEn, ...networkEn },
  },
};

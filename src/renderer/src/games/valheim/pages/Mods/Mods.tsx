import { useState } from "react";
import {
  Badge,
  Box,
  CircularProgress,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { useValheimMods } from "./hooks/useValheimMods";
import ApiKeySetup from "./components/ApiKeySetup";
import BepInExBanner from "./components/BepInExBanner";
import InstalledModsList from "./components/InstalledModsList";
import ModBrowser from "./components/ModBrowser";

type MainTab = "installed" | "browse";

export default function ValheimMods() {
  const { t } = useTranslation();
  const [mainTab, setMainTab] = useState<MainTab>("installed");
  const {
    apiKey,
    bepInEx,
    installedMods,
    browseTab,
    browseMods,
    browseLoading,
    browseError,
    installing,
    locale,
    handleValidateKey,
    handleTabChange,
    handleRemoveMod,
    handleToggleMod,
  } = useValheimMods();

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h6">{t("valheimMods.title")}</Typography>
        <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
          {t("valheimMods.subtitle")}
        </Typography>
      </Box>

      <ApiKeySetup apiKey={apiKey} onValidate={handleValidateKey} />

      <BepInExBanner detected={bepInEx} />

      {installing && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <CircularProgress size={16} />
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {t("valheimMods.nxm.installing")}
          </Typography>
        </Box>
      )}

      <Box>
        <Tabs
          value={mainTab}
          onChange={(_, v) => setMainTab(v as MainTab)}
          textColor="primary"
          indicatorColor="primary"
          sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}
        >
          <Tab
            value="installed"
            label={
              <Badge
                badgeContent={installedMods.length}
                color="primary"
                max={99}
              >
                <Box sx={{ pr: installedMods.length > 0 ? 1.5 : 0 }}>
                  {t("valheimMods.tabs.installed")}
                </Box>
              </Badge>
            }
          />
          <Tab value="browse" label={t("valheimMods.tabs.browse")} />
        </Tabs>

        {mainTab === "installed" && (
          <InstalledModsList
            mods={installedMods}
            locale={locale}
            onRemove={handleRemoveMod}
            onToggle={handleToggleMod}
          />
        )}

        {mainTab === "browse" && (
          <ModBrowser
            hasApiKey={!!apiKey.username}
            tab={browseTab}
            mods={browseMods}
            loading={browseLoading}
            error={browseError}
            onTabChange={handleTabChange}
          />
        )}
      </Box>
    </Stack>
  );
}

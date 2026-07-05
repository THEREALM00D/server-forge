import { useState } from "react";
import {
  Badge,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import RefreshIcon from "@mui/icons-material/Refresh";
import SettingsIcon from "@mui/icons-material/Settings";
import { useTranslation } from "react-i18next";
import { useValheimMods } from "./hooks/useValheimMods";
import BepInExBanner from "./components/BepInExBanner";
import InstalledModsList from "./components/InstalledModsList";
import ModBrowser from "./components/ModBrowser";
import DepsDialog from "./components/DepsDialog";

type MainTab = "installed" | "browse";

export default function ValheimMods() {
  const { t } = useTranslation();
  const [mainTab, setMainTab] = useState<MainTab>("installed");
  const [thunderstoreDialog, setThunderstoreDialog] = useState(false);
  const [thunderstoreCode, setThunderstoreCode] = useState("");
  const [profileDialog, setProfileDialog] = useState(false);
  const [profileCode, setProfileCode] = useState("");

  const {
    bepInEx,
    installedMods,
    browseTab,
    browseMods,
    browseLoading,
    browseError,
    installing,
    installingBepInEx,
    locale,
    pendingDeps,
    updates,
    handleTabChange,
    handleSearch,
    handleRemoveMod,
    handleToggleMod,
    handleInstallBepInEx,
    handleInstallFromThunderstore,
    handleImportProfile,
    handleRefreshUpdates,
    handleInstallAllDeps,
    handleDismissDeps,
  } = useValheimMods();

  const submitThunderstore = async () => {
    if (!thunderstoreCode.trim()) return;
    setThunderstoreDialog(false);
    await handleInstallFromThunderstore(thunderstoreCode.trim());
    setThunderstoreCode("");
  };

  const submitProfile = async () => {
    if (!profileCode.trim()) return;
    setProfileDialog(false);
    await handleImportProfile(profileCode.trim());
    setProfileCode("");
  };

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h6">{t("valheimMods.title")}</Typography>
        <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
          {t("valheimMods.subtitle")}
        </Typography>
      </Box>

      <BepInExBanner
        detected={bepInEx}
        installing={installingBepInEx}
        onInstall={handleInstallBepInEx}
      />

      {/* Boutons Thunderstore */}
      <Stack
        direction="row"
        spacing={1}
        sx={{ alignItems: "flex-start", flexWrap: "wrap" }}
      >
        <Button
          variant="outlined"
          size="small"
          startIcon={<DownloadIcon />}
          onClick={() => setThunderstoreDialog(true)}
          disabled={installing}
        >
          {t("valheimMods.thunderstore.title")}
        </Button>
        <Button
          variant="outlined"
          size="small"
          startIcon={<DownloadIcon />}
          onClick={() => setProfileDialog(true)}
          disabled={installing}
        >
          {t("valheimMods.thunderstore.importProfile")}
        </Button>
        <Button
          variant="outlined"
          size="small"
          startIcon={<FolderOpenIcon />}
          onClick={() => window.api.valheim.mods.openPluginsFolder()}
        >
          {t("valheimMods.folders.plugins")}
        </Button>
        <Button
          variant="outlined"
          size="small"
          startIcon={<SettingsIcon />}
          onClick={() => window.api.valheim.mods.openConfigFolder()}
        >
          {t("valheimMods.folders.config")}
        </Button>
        <Button
          variant="outlined"
          size="small"
          startIcon={<RefreshIcon />}
          onClick={handleRefreshUpdates}
          disabled={installing}
        >
          {t("valheimMods.updates.refresh")}
        </Button>
      </Stack>

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
            updates={updates}
            onRemove={handleRemoveMod}
            onToggle={handleToggleMod}
            onUpdate={handleInstallFromThunderstore}
          />
        )}

        {mainTab === "browse" && (
          <ModBrowser
            tab={browseTab}
            mods={browseMods}
            loading={browseLoading}
            error={browseError}
            onTabChange={handleTabChange}
            onSearch={handleSearch}
            onInstallVersion={handleInstallFromThunderstore}
          />
        )}
      </Box>

      {/* Dialog import package Thunderstore individuel */}
      <Dialog
        open={thunderstoreDialog}
        onClose={() => setThunderstoreDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>{t("valheimMods.thunderstore.title")}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            size="small"
            label={t("valheimMods.thunderstore.label")}
            helperText={t("valheimMods.thunderstore.helper")}
            placeholder="denikson-BepInExPack_Valheim-5.4.2202"
            value={thunderstoreCode}
            onChange={(e) => setThunderstoreCode(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submitThunderstore()}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setThunderstoreDialog(false)}>
            {t("valheimMods.browse.filesDialog.close")}
          </Button>
          <Button
            variant="contained"
            disabled={!thunderstoreCode.trim()}
            onClick={submitThunderstore}
          >
            {t("valheimMods.thunderstore.install")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog import profil Thunderstore */}
      <Dialog
        open={profileDialog}
        onClose={() => setProfileDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{t("valheimMods.thunderstore.importProfile")}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            multiline
            rows={4}
            size="small"
            label={t("valheimMods.thunderstore.profileLabel")}
            helperText={t("valheimMods.thunderstore.profileHelper")}
            value={profileCode}
            onChange={(e) => setProfileCode(e.target.value)}
            sx={{ mt: 1, fontFamily: "monospace" }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProfileDialog(false)}>
            {t("valheimMods.browse.filesDialog.close")}
          </Button>
          <Button
            variant="contained"
            disabled={!profileCode.trim()}
            onClick={submitProfile}
          >
            {t("valheimMods.thunderstore.install")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog dépendances manquantes */}
      {pendingDeps && (
        <DepsDialog
          modName={pendingDeps.modName}
          deps={pendingDeps.deps}
          onInstallAll={handleInstallAllDeps}
          onDismiss={handleDismissDeps}
        />
      )}
    </Stack>
  );
}

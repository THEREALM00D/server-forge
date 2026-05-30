import { useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Paper,
  Stack,
  Tab,
  Tabs,
  Tooltip,
  Typography,
} from "@mui/material";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import { useTranslation } from "react-i18next";
import type { NexusModInfo, NexusModFile } from "@shared/types";

type BrowseTab = "trending" | "latest" | "updated";

interface Props {
  hasApiKey: boolean;
  tab: BrowseTab;
  mods: NexusModInfo[];
  loading: boolean;
  error: boolean;
  onTabChange: (tab: BrowseTab) => void;
}

// Les onglets Latest/Updated nécessitent une clé API (v1 seulement)
const TAB_REQUIRES_KEY: Record<BrowseTab, boolean> = {
  trending: false,
  latest: true,
  updated: true,
};

export default function ModBrowser({
  hasApiKey,
  tab,
  mods,
  loading,
  error,
  onTabChange,
}: Props) {
  const { t } = useTranslation();
  const [filesDialog, setFilesDialog] = useState<{
    mod: NexusModInfo;
    files: NexusModFile[] | null;
  } | null>(null);
  const [loadingFiles, setLoadingFiles] = useState(false);

  const openFiles = async (mod: NexusModInfo) => {
    setFilesDialog({ mod, files: null });
    setLoadingFiles(true);
    try {
      const files = await window.api.valheim.mods.getModFiles(mod.mod_id);
      setFilesDialog({ mod, files });
    } catch {
      setFilesDialog({ mod, files: [] });
    } finally {
      setLoadingFiles(false);
    }
  };

  return (
    <Stack spacing={2}>
      <Tabs
        value={tab}
        onChange={(_, v) => onTabChange(v as BrowseTab)}
        textColor="primary"
        indicatorColor="primary"
      >
        <Tab value="trending" label={t("valheimMods.browse.tabs.trending")} />
        <Tab
          value="latest"
          label={t("valheimMods.browse.tabs.latest")}
          disabled={TAB_REQUIRES_KEY["latest"] && !hasApiKey}
        />
        <Tab
          value="updated"
          label={t("valheimMods.browse.tabs.updated")}
          disabled={TAB_REQUIRES_KEY["updated"] && !hasApiKey}
        />
      </Tabs>
      {!hasApiKey && (
        <Typography variant="caption" sx={{ color: "text.secondary" }}>
          {t("valheimMods.browse.publicMode")}
        </Typography>
      )}

      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress size={32} />
        </Box>
      )}

      {error && !loading && (
        <Typography variant="body2" sx={{ color: "error.main", py: 2 }}>
          {t("valheimMods.browse.error")}
        </Typography>
      )}

      {!loading && !error && (
        <Stack spacing={1}>
          {mods.map((mod) => (
            <Paper key={mod.mod_id} sx={{ p: 1.5 }}>
              <Stack
                direction="row"
                spacing={1.5}
                sx={{ alignItems: "center" }}
              >
                {mod.picture_url && (
                  <Box
                    component="img"
                    src={mod.picture_url}
                    alt={mod.name}
                    sx={{
                      width: 80,
                      height: 45,
                      objectFit: "cover",
                      borderRadius: 1,
                      flexShrink: 0,
                    }}
                  />
                )}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2" sx={{ fontWeight: 500 }} noWrap>
                    {mod.name}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: "text.secondary" }}
                    noWrap
                  >
                    {mod.author}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "text.disabled",
                      display: "block",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {mod.summary}
                  </Typography>
                </Box>
                <Stack
                  direction="row"
                  spacing={0.5}
                  sx={{ alignItems: "center", flexShrink: 0 }}
                >
                  <ThumbUpIcon sx={{ fontSize: 12, color: "text.disabled" }} />
                  <Typography
                    variant="caption"
                    sx={{ color: "text.disabled", mr: 1 }}
                  >
                    {mod.endorsement_count.toLocaleString()}
                  </Typography>
                  <Tooltip title={t("valheimMods.browse.viewFiles")}>
                    <IconButton size="small" onClick={() => openFiles(mod)}>
                      <FolderOpenIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={t("valheimMods.browse.openTooltip")}>
                    <IconButton
                      size="small"
                      onClick={() =>
                        window.api.shell.openExternal(
                          `https://www.nexusmods.com/valheim/mods/${mod.mod_id}`,
                        )
                      }
                    >
                      <OpenInNewIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Stack>
            </Paper>
          ))}
        </Stack>
      )}

      {/* Dialog fichiers */}
      {filesDialog && (
        <Dialog
          open
          onClose={() => setFilesDialog(null)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            {t("valheimMods.browse.filesDialog.title", {
              name: filesDialog.mod.name,
            })}
          </DialogTitle>
          <DialogContent dividers>
            {loadingFiles ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
                <CircularProgress size={28} />
              </Box>
            ) : !filesDialog.files?.length ? (
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                {t("valheimMods.browse.filesDialog.noFiles")}
              </Typography>
            ) : (
              <Stack divider={<Divider />} spacing={0}>
                {filesDialog.files.map((f) => (
                  <Box key={f.file_id} sx={{ py: 1.5 }}>
                    <Stack
                      direction="row"
                      sx={{ justifyContent: "space-between" }}
                    >
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {f.file_name}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ color: "text.secondary" }}
                        >
                          v{f.version} — {f.category_name} —{" "}
                          {t("valheimMods.browse.filesDialog.size", {
                            size: f.size_kb.toLocaleString(),
                          })}
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>
                ))}
              </Stack>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setFilesDialog(null)}>
              {t("valheimMods.browse.filesDialog.close")}
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Stack>
  );
}

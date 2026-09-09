import { Box, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import { useTranslation } from "react-i18next";
import { useBackup } from "../../../../hooks/useBackup";
import BackupConfigPanel from "../../../../components/backup/BackupConfig";
import BackupList from "../../../../components/backup/BackupList";
import { useValheimConfig } from "../Config/hooks/useValheimConfig";

export default function ValheimBackup() {
  const { t } = useTranslation();
  const {
    backups,
    config,
    creating,
    restoring,
    serverPath,
    status,
    handleCreate,
    handleRestore,
    handleDelete,
    handleSelectDir,
    handleConfigChange,
  } = useBackup();
  const { config: valheimConfig } = useValheimConfig();

  return (
    <Stack spacing={3}>
      <div>
        <Typography variant="h6">{t("backup.title")}</Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.5 }}>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {t("valheimBackup.subtitle")}
          </Typography>
          <Tooltip title={t("valheimBackup.openWorldFolder")}>
            <IconButton
              size="small"
              onClick={() =>
                window.api.valheim.openSaveFolder(valheimConfig.savedir)
              }
            >
              <FolderOpenIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        </Box>
      </div>

      <BackupConfigPanel
        config={config}
        onSelectDir={handleSelectDir}
        onConfigChange={handleConfigChange}
      />

      <BackupList
        backups={backups}
        creating={creating}
        restoring={restoring}
        serverPath={serverPath}
        status={status}
        onCreate={handleCreate}
        onRestore={handleRestore}
        onDelete={handleDelete}
      />
    </Stack>
  );
}

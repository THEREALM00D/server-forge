import { Stack, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useBackup } from "../../../../hooks/useBackup";
import BackupConfigPanel from "../../../../components/backup/BackupConfig";
import BackupList from "../../../../components/backup/BackupList";

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

  return (
    <Stack spacing={3}>
      <div>
        <Typography variant="h6">{t("backup.title")}</Typography>
        <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
          {t("valheimBackup.subtitle")}
        </Typography>
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

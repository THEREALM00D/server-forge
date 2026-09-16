import {
  Box,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import { useTranslation } from "react-i18next";
import type { ValheimModConfigFile } from "@shared/types";
import { formatDate, formatSize } from "../../../../../utils/format";

interface Props {
  files: ValheimModConfigFile[];
  locale: string;
  onOpen: (fileName: string) => void;
}

export default function ConfigFilesList({ files, locale, onOpen }: Props) {
  const { t } = useTranslation();

  if (files.length === 0) {
    return (
      <Typography variant="body2" sx={{ color: "text.secondary", py: 2 }}>
        {t("valheimMods.configs.empty")}
      </Typography>
    );
  }

  return (
    <Paper sx={{ p: 2 }}>
      <Stack spacing={0.5}>
        {files.map((file) => (
          <Box
            key={file.name}
            onClick={() => onOpen(file.name)}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              py: 1,
              px: 1,
              borderRadius: 1,
              cursor: "pointer",
              "&:hover": { bgcolor: "action.hover" },
            }}
          >
            <Typography
              variant="body2"
              sx={{ flex: 1, fontFamily: "monospace" }}
              noWrap
            >
              {file.name}
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              {formatSize(file.size)}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: "text.secondary",
                minWidth: 120,
                textAlign: "right",
              }}
            >
              {formatDate(file.mtime, locale)}
            </Typography>
            <Tooltip title={t("valheimMods.configs.edit")}>
              <IconButton size="small" onClick={() => onOpen(file.name)}>
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        ))}
      </Stack>
    </Paper>
  );
}

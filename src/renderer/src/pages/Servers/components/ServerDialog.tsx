import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from "@mui/material";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import { useTranslation } from "react-i18next";
import type { GameType, Server } from "@shared/types";

const DEFAULT_COLORS = [
  "#3b82f6",
  "#22c55e",
  "#f59e0b",
  "#ef4444",
  "#a855f7",
  "#06b6d4",
  "#ec4899",
];

export interface ServerFormValues {
  name: string;
  path: string;
  gameType: GameType;
  color: string | null;
}

interface Props {
  open: boolean;
  initial: Server | null;
  onClose: () => void;
  onSubmit: (values: ServerFormValues) => Promise<void>;
}

export default function ServerDialog({
  open,
  initial,
  onClose,
  onSubmit,
}: Props) {
  const { t } = useTranslation();
  const [values, setValues] = useState<ServerFormValues>({
    name: "",
    path: "",
    gameType: "palworld",
    color: DEFAULT_COLORS[0],
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setValues({
        name: initial?.name ?? "",
        path: initial?.path ?? "",
        gameType: initial?.gameType ?? "palworld",
        color: initial?.color ?? DEFAULT_COLORS[0],
      });
    }
  }, [open, initial]);

  const handleBrowse = async () => {
    const folder = await window.api.dialog.selectFolder();
    if (folder) setValues((v) => ({ ...v, path: folder }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await onSubmit(values);
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmit = values.name.trim() && values.path.trim() && !submitting;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {initial ? t("servers.dialog.editTitle") : t("servers.dialog.addTitle")}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ mt: 1 }}>
          <TextField
            label={t("servers.dialog.name")}
            size="small"
            value={values.name}
            onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
            helperText={t("servers.dialog.nameHelper")}
            fullWidth
            autoFocus
          />

          <Stack direction="row" spacing={1} sx={{ alignItems: "flex-start" }}>
            <TextField
              label={t("servers.dialog.path")}
              size="small"
              value={values.path}
              onChange={(e) =>
                setValues((v) => ({ ...v, path: e.target.value }))
              }
              helperText={t("servers.dialog.pathHelper")}
              fullWidth
            />
            <IconButton
              onClick={handleBrowse}
              sx={{ mt: 0.5 }}
              title={t("servers.dialog.pathBrowse")}
            >
              <FolderOpenIcon />
            </IconButton>
          </Stack>

          <FormControl size="small" fullWidth>
            <InputLabel>{t("servers.dialog.gameType")}</InputLabel>
            <Select
              label={t("servers.dialog.gameType")}
              value={values.gameType}
              onChange={(e) =>
                setValues((v) => ({
                  ...v,
                  gameType: e.target.value as GameType,
                }))
              }
            >
              <MenuItem value="palworld">
                {t("servers.games.palworld")}
              </MenuItem>
              <MenuItem value="valheim">{t("servers.games.valheim")}</MenuItem>
              <MenuItem value="astroneer">
                {t("servers.games.astroneer")}
              </MenuItem>
            </Select>
          </FormControl>

          <Box>
            <Box
              sx={{ fontSize: 12, color: "text.secondary", mb: 1 }}
              component="div"
            >
              {t("servers.dialog.color")}
            </Box>
            <Stack direction="row" spacing={1}>
              {DEFAULT_COLORS.map((c) => (
                <Box
                  key={c}
                  onClick={() => setValues((v) => ({ ...v, color: c }))}
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    bgcolor: c,
                    cursor: "pointer",
                    border: "2px solid",
                    borderColor: values.color === c ? "white" : "transparent",
                    transition: "transform 0.1s",
                    "&:hover": { transform: "scale(1.1)" },
                  }}
                />
              ))}
            </Stack>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>
          {t("servers.dialog.cancel")}
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!canSubmit}
          variant="contained"
        >
          {t("servers.dialog.save")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

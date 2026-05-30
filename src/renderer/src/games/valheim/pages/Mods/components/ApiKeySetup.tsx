import { useState } from "react";
import {
  Box,
  Button,
  Chip,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useTranslation } from "react-i18next";

interface Props {
  apiKey: {
    value: string;
    username: string | null;
    isPremium: boolean;
    validating: boolean;
  };
  onValidate: (key: string) => void;
}

export default function ApiKeySetup({ apiKey, onValidate }: Props) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState(apiKey.value);

  return (
    <Paper sx={{ p: 2.5 }}>
      <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
        {t("valheimMods.apiKey.title")}
      </Typography>

      {apiKey.username ? (
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          <CheckCircleIcon sx={{ color: "success.main", fontSize: 18 }} />
          <Typography variant="body2">
            {t("valheimMods.apiKey.connected", { username: apiKey.username })}
          </Typography>
          <Chip
            label={
              apiKey.isPremium
                ? t("valheimMods.apiKey.premium")
                : t("valheimMods.apiKey.free")
            }
            size="small"
            color={apiKey.isPremium ? "primary" : "default"}
          />
          <Button
            size="small"
            variant="text"
            sx={{ ml: "auto" }}
            onClick={() => setDraft("")}
          >
            {t("common.change")}
          </Button>
        </Stack>
      ) : (
        <Stack direction="row" spacing={1} sx={{ alignItems: "flex-start" }}>
          <TextField
            size="small"
            label={t("valheimMods.apiKey.label")}
            placeholder={t("valheimMods.apiKey.placeholder")}
            helperText={t("valheimMods.apiKey.helper")}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            type="password"
            sx={{ flex: 1 }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && draft.trim()) onValidate(draft.trim());
            }}
          />
          <Box sx={{ pt: 1 }}>
            <Button
              variant="contained"
              size="small"
              disabled={!draft.trim() || apiKey.validating}
              onClick={() => onValidate(draft.trim())}
            >
              {apiKey.validating
                ? t("valheimMods.apiKey.validating")
                : t("valheimMods.apiKey.validate")}
            </Button>
          </Box>
        </Stack>
      )}
    </Paper>
  );
}

import { Stack, Typography } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import { useTranslation } from "react-i18next";

export default function RuleStatus({ active }: { active: boolean }) {
  const { t } = useTranslation();
  if (active) {
    return (
      <Stack
        direction="row"
        spacing={0.5}
        sx={{ alignItems: "center", color: "success.main" }}
      >
        <CheckCircleIcon sx={{ fontSize: 16 }} />
        <Typography variant="caption">
          {t("network.standard.active")}
        </Typography>
      </Stack>
    );
  }
  return (
    <Stack
      direction="row"
      spacing={0.5}
      sx={{ alignItems: "center", color: "text.disabled" }}
    >
      <CancelIcon sx={{ fontSize: 16 }} />
      <Typography variant="caption">
        {t("network.standard.inactive")}
      </Typography>
    </Stack>
  );
}

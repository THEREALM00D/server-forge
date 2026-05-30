import { Alert } from "@mui/material";
import { useTranslation } from "react-i18next";

interface Props {
  detected: boolean | null;
}

export default function BepInExBanner({ detected }: Props) {
  const { t } = useTranslation();
  if (detected === null || detected === true) return null;
  return (
    <Alert severity="warning" sx={{ fontSize: 13 }}>
      {t("valheimMods.bepinex.warning")}
    </Alert>
  );
}

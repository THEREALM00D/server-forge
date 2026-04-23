import { Box, Stack, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useServer } from "../../../../context/ServerContext";
import { useFirewall } from "./hooks/useFirewall";
import AdminBanner from "./components/AdminBanner";
import StandardRules from "./components/StandardRules";
import CustomRules from "./components/CustomRules";

export default function Network() {
  const { t } = useTranslation();
  const { state } = useServer();
  const { isAdmin, rules, customRules, loading, refresh, getPorts } =
    useFirewall(state.serverPath);

  return (
    <Stack spacing={3} sx={{ maxWidth: 680 }}>
      <Box>
        <Typography variant="h6">{t("network.title")}</Typography>
        <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
          {t("network.subtitle")}
        </Typography>
      </Box>

      <AdminBanner isAdmin={isAdmin} />

      <StandardRules
        rules={rules}
        loading={loading}
        isAdmin={isAdmin}
        onRefresh={refresh}
        getPorts={getPorts}
      />

      <CustomRules rules={customRules} isAdmin={isAdmin} onRefresh={refresh} />
    </Stack>
  );
}

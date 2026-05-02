import { useEffect, useState } from "react";
import { Alert, Box, Button, LinearProgress, Stack } from "@mui/material";
import { useTranslation } from "react-i18next";
import type { UpdaterState } from "@shared/types";

export default function UpdateBanner() {
  const { t } = useTranslation();
  const [state, setState] = useState<UpdaterState | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    window.api.updater.getState().then(setState);
    return window.api.updater.onState((s) => {
      setState(s);
      setDismissed(false);
    });
  }, []);

  if (!state || dismissed) return null;
  if (
    state.status === "idle" ||
    state.status === "checking" ||
    state.status === "not-available"
  )
    return null;

  if (state.status === "error") {
    return (
      <Alert
        severity="warning"
        onClose={() => setDismissed(true)}
        sx={{ borderRadius: 0 }}
      >
        {t("updater.error", { message: state.message ?? "" })}
      </Alert>
    );
  }

  if (state.status === "available") {
    return (
      <Alert
        severity="info"
        sx={{ borderRadius: 0 }}
        action={
          <Stack direction="row" spacing={1}>
            <Button
              size="small"
              variant="contained"
              onClick={() => window.api.updater.download()}
            >
              {t("updater.download")}
            </Button>
            <Button
              size="small"
              color="inherit"
              onClick={() => setDismissed(true)}
            >
              {t("updater.dismiss")}
            </Button>
          </Stack>
        }
      >
        {t("updater.available", {
          version: state.version,
          current: state.currentVersion,
        })}
      </Alert>
    );
  }

  if (state.status === "downloading") {
    return (
      <Box>
        <Alert severity="info" sx={{ borderRadius: 0 }} icon={false}>
          {t("updater.downloading", { progress: state.progress })}
        </Alert>
        <LinearProgress variant="determinate" value={state.progress} />
      </Box>
    );
  }

  if (state.status === "ready") {
    return (
      <Alert
        severity="success"
        sx={{ borderRadius: 0 }}
        action={
          <Stack direction="row" spacing={1}>
            <Button
              size="small"
              variant="contained"
              color="success"
              onClick={() => window.api.updater.install()}
            >
              {t("updater.install")}
            </Button>
            <Button
              size="small"
              color="inherit"
              onClick={() => setDismissed(true)}
            >
              {t("updater.dismiss")}
            </Button>
          </Stack>
        }
      >
        {t("updater.ready", { version: state.version })}
      </Alert>
    );
  }

  return null;
}

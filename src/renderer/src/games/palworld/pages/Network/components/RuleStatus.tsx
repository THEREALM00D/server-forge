import { Stack, Typography } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";

export default function RuleStatus({ active }: { active: boolean }) {
  if (active) {
    return (
      <Stack
        direction="row"
        spacing={0.5}
        sx={{ alignItems: "center", color: "success.main" }}
      >
        <CheckCircleIcon sx={{ fontSize: 16 }} />
        <Typography variant="caption">Active</Typography>
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
      <Typography variant="caption">Inactive</Typography>
    </Stack>
  );
}

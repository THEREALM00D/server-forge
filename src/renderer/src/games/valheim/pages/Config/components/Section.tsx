import { Paper, Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";

export default function Section({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <Paper sx={{ p: 2.5 }}>
      <Typography
        variant="subtitle2"
        sx={{
          mb: 2,
          color: "text.secondary",
          textTransform: "uppercase",
          fontSize: 11,
          letterSpacing: 0.5,
        }}
      >
        {label}
      </Typography>
      <Stack spacing={2}>{children}</Stack>
    </Paper>
  );
}

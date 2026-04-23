import { Divider, Paper, Stack, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import type { ReactNode } from "react";
import type { FieldGroup, FieldDef } from "../fields";

interface Props {
  group: FieldGroup;
  renderField: (field: FieldDef) => ReactNode;
}

export default function ConfigGroup({ group, renderField }: Props) {
  const { t } = useTranslation();
  return (
    <Paper sx={{ p: 2.5 }}>
      <Typography
        variant="subtitle2"
        sx={{
          textTransform: "uppercase",
          letterSpacing: 0.8,
          color: "text.secondary",
          mb: 2,
        }}
      >
        {t(group.labelKey)}
      </Typography>
      <Stack spacing={1.5}>
        {group.fields.map((field, idx) => (
          <div key={field.key}>
            {idx > 0 && <Divider />}
            {renderField(field)}
          </div>
        ))}
      </Stack>
    </Paper>
  );
}

import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useTranslation } from "react-i18next";
import type { ReactNode } from "react";
import type { FieldGroup, FieldDef } from "../fields";

interface Props {
  group: FieldGroup;
  renderField: (field: FieldDef) => ReactNode;
  expanded: boolean;
  onToggle: () => void;
}

export default function ConfigGroup({
  group,
  renderField,
  expanded,
  onToggle,
}: Props) {
  const { t } = useTranslation();
  return (
    <Accordion expanded={expanded} onChange={onToggle} disableGutters>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography
          variant="subtitle2"
          sx={{
            textTransform: "uppercase",
            letterSpacing: 0.8,
            color: "text.secondary",
          }}
        >
          {t(group.labelKey)}
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Stack spacing={1.5}>
          {group.fields.map((field, idx) => (
            <div key={field.key}>
              {idx > 0 && <Divider />}
              {renderField(field)}
            </div>
          ))}
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
}

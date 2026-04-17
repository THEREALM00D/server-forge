import {
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import type { FieldDef } from "../fields";

interface Props {
  field: FieldDef;
  value: string | number | boolean;
  onChange: (value: string | number | boolean) => void;
}

export default function ConfigField({ field, value, onChange }: Props) {
  const { label, type, options } = field;

  if (type === "boolean") {
    return (
      <FormControlLabel
        control={
          <Switch
            size="small"
            checked={!!value}
            onChange={(e) => onChange(e.target.checked)}
          />
        }
        label={<Typography variant="body2">{label}</Typography>}
        sx={{
          justifyContent: "space-between",
          ml: 0,
          flexDirection: "row-reverse",
        }}
      />
    );
  }

  if (type === "select") {
    return (
      <Stack direction="row" sx={{ alignItems: "center", gap: 2 }}>
        <Typography variant="body2" sx={{ minWidth: 200 }}>
          {label}
        </Typography>
        <FormControl size="small" sx={{ flex: 1 }}>
          <InputLabel>{label}</InputLabel>
          <Select
            label={label}
            value={String(value ?? "")}
            onChange={(e) => onChange(e.target.value)}
          >
            {options?.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>
    );
  }

  return (
    <Stack direction="row" sx={{ alignItems: "center", gap: 2 }}>
      <Typography variant="body2" sx={{ minWidth: 200 }}>
        {label}
      </Typography>
      <TextField
        size="small"
        type={type === "number" ? "number" : "text"}
        slotProps={{
          htmlInput: { step: type === "number" ? "any" : undefined },
        }}
        value={String(value ?? "")}
        onChange={(e) =>
          onChange(type === "number" ? Number(e.target.value) : e.target.value)
        }
        sx={{ flex: 1 }}
      />
    </Stack>
  );
}

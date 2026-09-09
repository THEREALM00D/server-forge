import { Button, Stack, TextField } from "@mui/material";

export default function AdminListField({
  label,
  helper,
  value,
  saved,
  onChange,
  onSave,
  saveLabel,
  savedLabel,
}: {
  label: string;
  helper: string;
  value: string;
  saved: boolean;
  onChange: (v: string) => void;
  onSave: () => void;
  saveLabel: string;
  savedLabel: string;
}) {
  return (
    <Stack spacing={1}>
      <TextField
        label={label}
        helperText={helper}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        size="small"
        fullWidth
        multiline
        rows={3}
      />
      <Button
        variant="outlined"
        size="small"
        color={saved ? "success" : "primary"}
        onClick={onSave}
        sx={{ alignSelf: "flex-start" }}
      >
        {saved ? savedLabel : saveLabel}
      </Button>
    </Stack>
  );
}

import {
  Box,
  Button,
  ButtonGroup,
  Checkbox,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import { useTranslation } from "react-i18next";
import { useServer } from "../../../../context/ServerContext";
import { useValheimConfig } from "./hooks/useValheimConfig";
import { useValheimAdminLists } from "./hooks/useValheimAdminLists";
import type { ValheimModifiers } from "@shared/types";

const PRESETS: Record<string, ValheimModifiers> = {
  casual: {
    combat: "easy",
    deathpenalty: "casual",
    resources: "more",
    raids: "none",
    portals: "casual",
  },
  normal: {
    combat: "",
    deathpenalty: "",
    resources: "",
    raids: "",
    portals: "",
  },
  hard: {
    combat: "hard",
    deathpenalty: "hard",
    resources: "less",
    raids: "more",
    portals: "hard",
  },
  hardcore: {
    combat: "veryhard",
    deathpenalty: "hard",
    resources: "muchless",
    raids: "more",
    portals: "veryhard",
  },
};

export default function ValheimConfig() {
  const { t } = useTranslation();
  const { state } = useServer();
  const { config, loading, saved, handleChange, handleSave } =
    useValheimConfig();
  const { adminList, bannedList, permittedList } = useValheimAdminLists();

  if (!state.serverPath) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "60%",
        }}
      >
        <Typography sx={{ color: "text.secondary" }}>
          {t("valheimConfig.noServerPath")}
        </Typography>
      </Box>
    );
  }

  if (loading) {
    return (
      <Typography sx={{ color: "text.secondary" }}>
        {t("common.loading")}
      </Typography>
    );
  }

  const modifiers = config.modifiers ?? {
    combat: "",
    deathpenalty: "",
    resources: "",
    raids: "",
    portals: "",
  };

  return (
    <Stack spacing={3} sx={{ maxWidth: 680 }}>
      <Box>
        <Typography variant="h6">{t("valheimConfig.title")}</Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.5 }}>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {t("valheimConfig.subtitle")}
          </Typography>
          <Tooltip title={t("valheimConfig.openSaves")}>
            <IconButton
              size="small"
              onClick={() => window.api.valheim.openSaveFolder(config.savedir)}
            >
              <FolderOpenIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Section label={t("valheimConfig.sections.general")}>
        <TextField
          label={t("valheimConfig.fields.name.label")}
          helperText={t("valheimConfig.fields.name.description")}
          value={config.name}
          onChange={(e) => handleChange({ name: e.target.value })}
          size="small"
          fullWidth
        />
        <TextField
          label={t("valheimConfig.fields.password.label")}
          helperText={t("valheimConfig.fields.password.description")}
          value={config.password}
          onChange={(e) => handleChange({ password: e.target.value })}
          size="small"
          fullWidth
          type="password"
        />
      </Section>

      <Section label={t("valheimConfig.sections.world")}>
        <TextField
          label={t("valheimConfig.fields.world.label")}
          helperText={t("valheimConfig.fields.world.description")}
          value={config.world}
          onChange={(e) => handleChange({ world: e.target.value })}
          size="small"
          fullWidth
        />
        <TextField
          label={t("valheimConfig.fields.savedir.label")}
          helperText={t("valheimConfig.fields.savedir.description")}
          value={config.savedir}
          onChange={(e) => handleChange({ savedir: e.target.value })}
          size="small"
          fullWidth
          placeholder="%LOCALAPPDATA%\..\LocalLow\IronGate\Valheim"
        />
        <TextField
          label={t("valheimConfig.fields.worldSeed.label")}
          helperText={t("valheimConfig.fields.worldSeed.description")}
          value={config.worldSeed}
          onChange={(e) => handleChange({ worldSeed: e.target.value })}
          size="small"
          fullWidth
        />
        <FormControl size="small" sx={{ maxWidth: 280 }}>
          <InputLabel>{t("valheimConfig.fields.worldSize.label")}</InputLabel>
          <Select
            label={t("valheimConfig.fields.worldSize.label")}
            value={config.worldSize}
            onChange={(e) =>
              handleChange({
                worldSize: e.target.value as typeof config.worldSize,
              })
            }
          >
            <MenuItem value="">
              {t("valheimConfig.fields.worldSize.default")}
            </MenuItem>
            <MenuItem value="small">
              {t("valheimConfig.fields.worldSize.small")}
            </MenuItem>
            <MenuItem value="medium">
              {t("valheimConfig.fields.worldSize.medium")}
            </MenuItem>
            <MenuItem value="large">
              {t("valheimConfig.fields.worldSize.large")}
            </MenuItem>
            <MenuItem value="yolo">
              {t("valheimConfig.fields.worldSize.yolo")}
            </MenuItem>
          </Select>
        </FormControl>
      </Section>

      <Section label={t("valheimConfig.sections.modifiers")}>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          {t("valheimConfig.modifiers.description")}
        </Typography>

        {/* Boutons presets */}
        <ButtonGroup size="small" variant="outlined">
          {(["casual", "normal", "hard", "hardcore"] as const).map((key) => (
            <Button
              key={key}
              onClick={() => handleChange({ modifiers: PRESETS[key] })}
            >
              {t(`valheimConfig.modifiers.presets.${key}`)}
            </Button>
          ))}
        </ButtonGroup>

        {/* Selects par modificateur */}
        <Stack
          direction="row"
          spacing={1.5}
          sx={{ flexWrap: "wrap", gap: 1.5 }}
        >
          <ModifierSelect
            label={t("valheimConfig.modifiers.combat.label")}
            value={modifiers.combat}
            options={["veryeasy", "easy", "normal", "hard", "veryhard"]}
            labelPrefix="valheimConfig.modifiers.combat"
            onChange={(v) =>
              handleChange({
                modifiers: {
                  ...modifiers,
                  combat: v as ValheimModifiers["combat"],
                },
              })
            }
          />
          <ModifierSelect
            label={t("valheimConfig.modifiers.deathpenalty.label")}
            value={modifiers.deathpenalty}
            options={["casual", "veryeasy", "easy", "normal", "hard"]}
            labelPrefix="valheimConfig.modifiers.deathpenalty"
            onChange={(v) =>
              handleChange({
                modifiers: {
                  ...modifiers,
                  deathpenalty: v as ValheimModifiers["deathpenalty"],
                },
              })
            }
          />
          <ModifierSelect
            label={t("valheimConfig.modifiers.resources.label")}
            value={modifiers.resources}
            options={["muchless", "less", "normal", "more", "mostmore"]}
            labelPrefix="valheimConfig.modifiers.resources"
            onChange={(v) =>
              handleChange({
                modifiers: {
                  ...modifiers,
                  resources: v as ValheimModifiers["resources"],
                },
              })
            }
          />
          <ModifierSelect
            label={t("valheimConfig.modifiers.raids.label")}
            value={modifiers.raids}
            options={["none", "muchless", "less", "normal", "more"]}
            labelPrefix="valheimConfig.modifiers.raids"
            onChange={(v) =>
              handleChange({
                modifiers: {
                  ...modifiers,
                  raids: v as ValheimModifiers["raids"],
                },
              })
            }
          />
          <ModifierSelect
            label={t("valheimConfig.modifiers.portals.label")}
            value={modifiers.portals}
            options={["casual", "hard", "veryhard"]}
            labelPrefix="valheimConfig.modifiers.portals"
            onChange={(v) =>
              handleChange({
                modifiers: {
                  ...modifiers,
                  portals: v as ValheimModifiers["portals"],
                },
              })
            }
          />
        </Stack>
      </Section>

      <Section label={t("valheimConfig.sections.network")}>
        <TextField
          label={t("valheimConfig.fields.port.label")}
          helperText={t("valheimConfig.fields.port.description")}
          value={config.port}
          onChange={(e) =>
            handleChange({ port: Number(e.target.value) || 2456 })
          }
          size="small"
          type="number"
          sx={{ width: 160 }}
          slotProps={{ htmlInput: { min: 1024, max: 65534 } }}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={config.public}
              onChange={(e) => handleChange({ public: e.target.checked })}
              size="small"
            />
          }
          label={
            <Box>
              <Typography variant="body2">
                {t("valheimConfig.fields.public.label")}
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                {t("valheimConfig.fields.public.description")}
              </Typography>
            </Box>
          }
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={config.crossplay}
              onChange={(e) => handleChange({ crossplay: e.target.checked })}
              size="small"
            />
          }
          label={
            <Box>
              <Typography variant="body2">
                {t("valheimConfig.fields.crossplay.label")}
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                {t("valheimConfig.fields.crossplay.description")}
              </Typography>
            </Box>
          }
        />
      </Section>

      <Section label={t("valheimConfig.sections.advanced")}>
        <TextField
          label={t("valheimConfig.fields.logFile.label")}
          helperText={t("valheimConfig.fields.logFile.description")}
          value={config.logFile}
          onChange={(e) => handleChange({ logFile: e.target.value })}
          size="small"
          fullWidth
        />
        <TextField
          label={t("valheimConfig.fields.customArgs.label")}
          helperText={t("valheimConfig.fields.customArgs.description")}
          value={config.customArgs}
          onChange={(e) => handleChange({ customArgs: e.target.value })}
          size="small"
          fullWidth
          multiline
          rows={2}
        />
      </Section>

      <Button
        variant="contained"
        size="large"
        startIcon={<SaveIcon />}
        color={saved ? "success" : "primary"}
        onClick={handleSave}
        sx={{ alignSelf: "flex-start" }}
      >
        {saved ? t("valheimConfig.saved") : t("valheimConfig.save")}
      </Button>

      <Section label={t("valheimConfig.sections.administration")}>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          {t("valheimConfig.administration.description")}
        </Typography>
        <AdminListField
          label={t("valheimConfig.administration.adminList")}
          helper={t("valheimConfig.administration.adminListHelper")}
          value={adminList.value}
          saved={adminList.saved}
          onChange={adminList.handleChange}
          onSave={adminList.handleSave}
          saveLabel={t("valheimConfig.administration.save")}
          savedLabel={t("valheimConfig.administration.saved")}
        />
        <AdminListField
          label={t("valheimConfig.administration.bannedList")}
          helper={t("valheimConfig.administration.bannedListHelper")}
          value={bannedList.value}
          saved={bannedList.saved}
          onChange={bannedList.handleChange}
          onSave={bannedList.handleSave}
          saveLabel={t("valheimConfig.administration.save")}
          savedLabel={t("valheimConfig.administration.saved")}
        />
        <AdminListField
          label={t("valheimConfig.administration.permittedList")}
          helper={t("valheimConfig.administration.permittedListHelper")}
          value={permittedList.value}
          saved={permittedList.saved}
          onChange={permittedList.handleChange}
          onSave={permittedList.handleSave}
          saveLabel={t("valheimConfig.administration.save")}
          savedLabel={t("valheimConfig.administration.saved")}
        />
      </Section>
    </Stack>
  );
}

function Section({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
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

function ModifierSelect({
  label,
  value,
  options,
  labelPrefix,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  labelPrefix: string;
  onChange: (v: string) => void;
}) {
  const { t } = useTranslation();
  return (
    <FormControl size="small" sx={{ minWidth: 160 }}>
      <InputLabel>{label}</InputLabel>
      <Select
        label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <MenuItem value="">{t("valheimConfig.modifiers.default")}</MenuItem>
        {options.map((opt) => (
          <MenuItem key={opt} value={opt}>
            {t(`${labelPrefix}.${opt}`)}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

function AdminListField({
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

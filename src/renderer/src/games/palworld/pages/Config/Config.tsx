import ConfigPage from "../../../../components/config/ConfigPage";
import { configService } from "../../services/configService";
import { DIFFICULTY_PRESETS } from "./presets";
import { FIELD_GROUPS } from "./fields";

export default function Config() {
  return (
    <ConfigPage
      titleKey="config.title"
      subtitleKey="config.subtitle"
      folderPath={(serverPath) =>
        `${serverPath}/Pal/Saved/Config/WindowsServer`
      }
      fieldGroups={FIELD_GROUPS}
      i18nFieldsPrefix="config.fields"
      readConfig={configService.readPalConfig}
      writeConfig={configService.writePalConfig}
      onFieldChange={(key, value, setFieldValue) => {
        if (key !== "Difficulty") return;
        const preset = DIFFICULTY_PRESETS[String(value)];
        if (!preset) return;
        Object.entries(preset).forEach(([k, v]) => {
          if (v !== undefined) setFieldValue(k, v);
        });
      }}
    />
  );
}

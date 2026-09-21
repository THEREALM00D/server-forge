import { useDeferredValue, useEffect, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import type { CfgEntry } from "../utils/cfgParser";
import SearchField from "../../../../../components/common/SearchField";
import CfgStructuredEditor from "./CfgStructuredEditor";

interface Props {
  fileName: string | null;
  entries: CfgEntry[];
  saving: boolean;
  onChange: (lineIndex: number, value: string) => void;
  onClose: () => void;
  onSave: () => void;
}

export default function ConfigFileEditorDialog({
  fileName,
  entries,
  saving,
  onChange,
  onClose,
  onSave,
}: Props) {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  // La saisie reste fluide : le filtrage (lourd sur un gros fichier) est différé.
  const deferredSearch = useDeferredValue(search);

  useEffect(() => {
    setSearch("");
  }, [fileName]);

  return (
    <Dialog open={fileName !== null} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontFamily: "monospace" }}>{fileName}</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 1 }}>
          <SearchField
            value={search}
            onChange={setSearch}
            placeholder={t("valheimMods.configs.searchSettings")}
            sx={{ mb: 2, width: "100%" }}
          />
          <CfgStructuredEditor
            entries={entries}
            search={deferredSearch}
            onChange={onChange}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t("valheimMods.configs.close")}</Button>
        <Button variant="contained" disabled={saving} onClick={onSave}>
          {t("valheimMods.configs.save")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

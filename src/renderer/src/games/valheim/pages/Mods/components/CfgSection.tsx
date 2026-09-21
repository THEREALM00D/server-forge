import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Stack,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import type { CfgEntry } from "../utils/cfgParser";
import CfgEntryRow from "./CfgEntryRow";

interface Props {
  section: string;
  entries: CfgEntry[];
  expanded: boolean;
  onToggle: (section: string) => void;
  onChange: (lineIndex: number, value: string) => void;
}

// Le contenu n'est monté qu'à l'ouverture (`unmountOnExit`) : un fichier de
// plusieurs centaines de paramètres (ex : Valheim Plus) ne crée des champs MUI
// que pour les sections réellement consultées.
export default function CfgSection({
  section,
  entries,
  expanded,
  onToggle,
  onChange,
}: Props) {
  return (
    <Accordion
      disableGutters
      variant="outlined"
      expanded={expanded}
      onChange={() => onToggle(section)}
      slotProps={{ transition: { unmountOnExit: true } }}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="subtitle2" sx={{ color: "primary.main" }}>
          {section || "—"}
        </Typography>
        <Typography variant="caption" sx={{ color: "text.secondary", ml: 1 }}>
          ({entries.length})
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Stack spacing={1.5}>
          {entries.map((entry) => (
            <CfgEntryRow
              key={entry.lineIndex}
              entry={entry}
              onChange={onChange}
            />
          ))}
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
}

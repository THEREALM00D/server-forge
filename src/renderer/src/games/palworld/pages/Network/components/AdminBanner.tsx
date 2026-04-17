import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import ShieldIcon from "@mui/icons-material/Shield";

export default function AdminBanner({ isAdmin }: { isAdmin: boolean | null }) {
  return (
    <Paper sx={{ p: 2.5 }}>
      <Stack
        direction="row"
        sx={{ alignItems: "center", justifyContent: "space-between" }}
      >
        <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
          <ShieldIcon
            sx={{ color: isAdmin ? "success.main" : "warning.main" }}
          />
          <Box>
            <Typography variant="subtitle2">
              Privilèges administrateur
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              Requis pour modifier les règles de pare-feu
            </Typography>
          </Box>
        </Stack>
        {isAdmin === null ? (
          <CircularProgress size={20} />
        ) : (
          <Chip
            label={isAdmin ? "Administrateur" : "Non-administrateur"}
            color={isAdmin ? "success" : "warning"}
            size="small"
            variant="outlined"
          />
        )}
      </Stack>
      {isAdmin === false && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          Relancez l'application en tant qu'administrateur pour modifier les
          règles de pare-feu.
        </Alert>
      )}
    </Paper>
  );
}

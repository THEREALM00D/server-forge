import { useState } from "react";
import { ThemeProvider, createTheme, CssBaseline, Box } from "@mui/material";
import { ServerProvider, useServer } from "./context/ServerContext";
import { NotificationProvider } from "./context/NotificationContext";
import Install from "./pages/Install/Install";
import Servers from "./pages/Servers/Servers";
import Titlebar from "./components/Titlebar/Titlebar";
import Sidebar from "./components/Sidebar/Sidebar";
import { getGamePlugin } from "./games/registry";

export type Page =
  | "dashboard"
  | "install"
  | "config"
  | "logs"
  | "network"
  | "backup"
  | "schedule"
  | "players"
  | "servers";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#3b82f6" },
    success: { main: "#22c55e" },
    error: { main: "#ef4444" },
    warning: { main: "#f59e0b" },
    background: {
      default: "#0f172a",
      paper: "#1e293b",
    },
    text: {
      primary: "#f1f5f9",
      secondary: "#94a3b8",
    },
    divider: "#334155",
  },
  shape: { borderRadius: 10 },
  typography: {
    fontFamily: '"Roboto", sans-serif',
    h6: { fontWeight: 600 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: "none", fontWeight: 500 },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: "none" },
      },
    },
  },
});

function AppShell() {
  const [page, setPage] = useState<Page>("dashboard");
  const { state } = useServer();

  const gameType = state.activeServer?.gameType ?? "palworld";

  const renderPage = () => {
    if (page === "install") return <Install />;
    if (page === "servers") return <Servers />;
    const Component = getGamePlugin(gameType)?.pages[page];
    return Component ? <Component /> : null;
  };

  // Clé composée : changement de page OU de serveur actif → re-mount complet,
  // donc tous les useEffect/state des pages se réinitialisent avec les bonnes
  // données du nouveau serveur. Sauf pour la page "servers" qui est globale.
  const pageKey =
    page === "servers"
      ? "servers"
      : `${page}:${state.activeServerId ?? "none"}`;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        bgcolor: "background.default",
      }}
    >
      <Titlebar />
      <Box sx={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <Sidebar currentPage={page} onNavigate={setPage} />
        <Box component="main" sx={{ flex: 1, overflow: "auto", p: 3 }}>
          <Box key={pageKey}>{renderPage()}</Box>
        </Box>
      </Box>
    </Box>
  );
}

export default function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <NotificationProvider>
        <ServerProvider>
          <AppShell />
        </ServerProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
}

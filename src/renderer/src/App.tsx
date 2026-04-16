import { useState } from "react";
import { ThemeProvider, createTheme, CssBaseline, Box } from "@mui/material";
import { ServerProvider } from "./context/ServerContext";
import { NotificationProvider } from "./context/NotificationContext";
import Dashboard from "./games/palworld/pages/Dashboard/Dashboard";
import Install from "./pages/Install/Install";
import Config from "./games/palworld/pages/Config/Config";
import Logs from "./games/palworld/pages/Logs/Logs";
import Network from "./games/palworld/pages/Network/Network";
import Backup from "./games/palworld/pages/Backup/Backup";
import Titlebar from "./components/Titlebar/Titlebar";
import Sidebar from "./components/Sidebar/Sidebar";

export type Page =
  | "dashboard"
  | "install"
  | "config"
  | "logs"
  | "network"
  | "backup";

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

export default function App() {
  const [page, setPage] = useState<Page>("dashboard");

  const renderPage = () => {
    switch (page) {
      case "dashboard":
        return <Dashboard />;
      case "install":
        return <Install />;
      case "config":
        return <Config />;
      case "logs":
        return <Logs />;
      case "network":
        return <Network />;
      case "backup":
        return <Backup />;
    }
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <NotificationProvider>
        <ServerProvider>
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
                {renderPage()}
              </Box>
            </Box>
          </Box>
        </ServerProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
}

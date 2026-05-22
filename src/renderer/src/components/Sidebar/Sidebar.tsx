import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Chip,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import DownloadIcon from "@mui/icons-material/Download";
import SettingsIcon from "@mui/icons-material/Settings";
import ArticleIcon from "@mui/icons-material/Article";
import RouterIcon from "@mui/icons-material/Router";
import BackupIcon from "@mui/icons-material/Backup";
import ScheduleIcon from "@mui/icons-material/Schedule";
import PeopleIcon from "@mui/icons-material/People";
import StorageIcon from "@mui/icons-material/Storage";
import { useTranslation } from "react-i18next";
import { Page } from "../../App";
import { useServer } from "../../context/ServerContext";
import { STATUS_COLOR } from "../../utils/status";
import ServerSwitcher from "./ServerSwitcher";

const navItems: { id: Page; labelKey: string; icon: React.ReactNode }[] = [
  {
    id: "dashboard",
    labelKey: "sidebar.dashboard",
    icon: <DashboardIcon fontSize="small" />,
  },
  {
    id: "install",
    labelKey: "sidebar.install",
    icon: <DownloadIcon fontSize="small" />,
  },
  {
    id: "config",
    labelKey: "sidebar.config",
    icon: <SettingsIcon fontSize="small" />,
  },
  {
    id: "logs",
    labelKey: "sidebar.logs",
    icon: <ArticleIcon fontSize="small" />,
  },
  {
    id: "network",
    labelKey: "sidebar.network",
    icon: <RouterIcon fontSize="small" />,
  },
  {
    id: "backup",
    labelKey: "sidebar.backup",
    icon: <BackupIcon fontSize="small" />,
  },
  {
    id: "schedule",
    labelKey: "sidebar.schedule",
    icon: <ScheduleIcon fontSize="small" />,
  },
  {
    id: "players",
    labelKey: "sidebar.players",
    icon: <PeopleIcon fontSize="small" />,
  },
  {
    id: "servers",
    labelKey: "sidebar.servers",
    icon: <StorageIcon fontSize="small" />,
  },
];

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

export default function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  const { state } = useServer();
  const { t, i18n } = useTranslation();

  const handleLanguageChange = (
    _: React.MouseEvent<HTMLElement>,
    newLang: string | null,
  ) => {
    if (newLang) i18n.changeLanguage(newLang);
  };

  return (
    <Box
      sx={{
        width: 220,
        flexShrink: 0,
        bgcolor: "#020617",
        display: "flex",
        flexDirection: "column",
        borderRight: "1px solid",
        borderColor: "divider",
      }}
    >
      <ServerSwitcher onManage={onNavigate} />
      <Divider sx={{ mx: 1.5, mb: 1 }} />
      <List dense sx={{ py: 1, px: 1 }}>
        {navItems.map(({ id, labelKey, icon }) => (
          <ListItemButton
            key={id}
            selected={currentPage === id}
            onClick={() => onNavigate(id)}
            sx={{
              borderRadius: 2,
              mb: 0.5,
              "&.Mui-selected": {
                bgcolor: "action.selected",
                "&:hover": { bgcolor: "action.selected" },
              },
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 36,
                color: currentPage === id ? "primary.main" : "text.secondary",
              }}
            >
              {icon}
            </ListItemIcon>
            <ListItemText
              primary={t(labelKey)}
              slotProps={{
                primary: {
                  sx: {
                    fontSize: 13,
                    fontWeight: currentPage === id ? 600 : 400,
                  },
                },
              }}
            />
          </ListItemButton>
        ))}
      </List>

      <Box sx={{ mt: "auto", p: 2 }}>
        <ToggleButtonGroup
          value={i18n.resolvedLanguage ?? "fr"}
          exclusive
          onChange={handleLanguageChange}
          size="small"
          fullWidth
          sx={{ mb: 1.5 }}
        >
          <ToggleButton value="fr" sx={{ fontSize: 11, py: 0.25 }}>
            FR
          </ToggleButton>
          <ToggleButton value="en" sx={{ fontSize: 11, py: 0.25 }}>
            EN
          </ToggleButton>
        </ToggleButtonGroup>
        <Divider sx={{ mb: 1.5 }} />
        <Chip
          label={t(`status.${state.status}`, { defaultValue: state.status })}
          color={STATUS_COLOR[state.status] ?? "default"}
          size="small"
          variant="outlined"
          sx={{ width: "100%", fontSize: 11 }}
        />
      </Box>
    </Box>
  );
}

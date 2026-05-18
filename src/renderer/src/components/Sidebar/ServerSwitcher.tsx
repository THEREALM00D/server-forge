import { useState } from "react";
import {
  Box,
  Button,
  Menu,
  MenuItem,
  Typography,
  Divider,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CheckIcon from "@mui/icons-material/Check";
import StorageIcon from "@mui/icons-material/Storage";
import SettingsIcon from "@mui/icons-material/Settings";
import { useTranslation } from "react-i18next";
import { useServer } from "../../context/ServerContext";
import type { Page } from "../../App";

interface Props {
  onManage: (page: Page) => void;
}

export default function ServerSwitcher({ onManage }: Props) {
  const { state, switchActive } = useServer();
  const { t } = useTranslation();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);

  const open = Boolean(anchor);
  const handleOpen = (e: React.MouseEvent<HTMLElement>) =>
    setAnchor(e.currentTarget);
  const handleClose = () => setAnchor(null);

  const handleSelect = async (id: string) => {
    handleClose();
    if (id === state.activeServerId) return;
    await switchActive(id);
  };

  const handleManage = () => {
    handleClose();
    onManage("servers");
  };

  const activeName = state.activeServer?.name ?? t("sidebar.noServer");
  const activeColor = state.activeServer?.color ?? "#64748b";

  return (
    <Box sx={{ p: 1.5 }}>
      <Button
        onClick={handleOpen}
        fullWidth
        endIcon={<ExpandMoreIcon fontSize="small" />}
        sx={{
          justifyContent: "space-between",
          textTransform: "none",
          bgcolor: "rgba(255,255,255,0.05)",
          color: "text.primary",
          py: 1,
          px: 1.5,
          borderRadius: 2,
          "&:hover": { bgcolor: "rgba(255,255,255,0.08)" },
        }}
      >
        <Box
          sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}
        >
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              bgcolor: activeColor,
              flexShrink: 0,
            }}
          />
          <Typography
            variant="body2"
            sx={{
              fontWeight: 500,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {activeName}
          </Typography>
        </Box>
      </Button>

      <Menu
        anchorEl={anchor}
        open={open}
        onClose={handleClose}
        slotProps={{ paper: { sx: { minWidth: 200 } } }}
      >
        {state.servers.length === 0 && (
          <MenuItem disabled>
            <ListItemText primary={t("sidebar.noServers")} />
          </MenuItem>
        )}
        {state.servers.map((srv) => (
          <MenuItem
            key={srv.id}
            selected={srv.id === state.activeServerId}
            onClick={() => handleSelect(srv.id)}
          >
            <ListItemIcon>
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  bgcolor: srv.color ?? "#64748b",
                }}
              />
            </ListItemIcon>
            <ListItemText primary={srv.name} />
            {srv.id === state.activeServerId && (
              <CheckIcon
                fontSize="small"
                sx={{ ml: 1, color: "primary.main" }}
              />
            )}
          </MenuItem>
        ))}
        <Divider />
        <MenuItem onClick={handleManage}>
          <ListItemIcon>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary={t("sidebar.manageServers")} />
        </MenuItem>
      </Menu>
      {state.servers.length === 0 && (
        <Box sx={{ mt: 1, display: "flex", justifyContent: "center" }}>
          <StorageIcon
            sx={{ fontSize: 14, color: "text.secondary", opacity: 0.5 }}
          />
        </Box>
      )}
    </Box>
  );
}

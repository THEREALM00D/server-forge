import { Box, List, ListItemButton, ListItemIcon, ListItemText, Divider, Chip } from '@mui/material'
import DashboardIcon from '@mui/icons-material/Dashboard'
import DownloadIcon from '@mui/icons-material/Download'
import SettingsIcon from '@mui/icons-material/Settings'
import ArticleIcon from '@mui/icons-material/Article'
import RouterIcon from '@mui/icons-material/Router'
import { Page } from '../App'
import { useServer } from '../context/ServerContext'

const STATUS_COLOR: Record<string, 'success' | 'warning' | 'error' | 'default'> = {
  running: 'success',
  starting: 'warning',
  stopping: 'warning',
  crashed: 'error',
  stopped: 'default',
}

const STATUS_LABEL: Record<string, string> = {
  running: 'En ligne',
  starting: 'Démarrage...',
  stopping: 'Arrêt...',
  crashed: 'Planté',
  stopped: 'Arrêté',
}

const navItems: { id: Page; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon fontSize="small" /> },
  { id: 'install', label: 'Installation', icon: <DownloadIcon fontSize="small" /> },
  { id: 'config', label: 'Configuration', icon: <SettingsIcon fontSize="small" /> },
  { id: 'logs', label: 'Logs', icon: <ArticleIcon fontSize="small" /> },
  { id: 'network', label: 'Réseau', icon: <RouterIcon fontSize="small" /> },
]

interface SidebarProps {
  currentPage: Page
  onNavigate: (page: Page) => void
}

export default function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  const { state } = useServer()

  return (
    <Box
      sx={{
        width: 220,
        flexShrink: 0,
        bgcolor: '#020617',
        display: 'flex',
        flexDirection: 'column',
        borderRight: '1px solid',
        borderColor: 'divider',
      }}
    >
      <List dense sx={{ py: 1, px: 1 }}>
        {navItems.map(({ id, label, icon }) => (
          <ListItemButton
            key={id}
            selected={currentPage === id}
            onClick={() => onNavigate(id)}
            sx={{
              borderRadius: 2,
              mb: 0.5,
              '&.Mui-selected': {
                bgcolor: 'action.selected',
                '&:hover': { bgcolor: 'action.selected' },
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 36, color: currentPage === id ? 'primary.main' : 'text.secondary' }}>
              {icon}
            </ListItemIcon>
            <ListItemText
              primary={label}
              slotProps={{
                primary: {
                  sx: { fontSize: 13, fontWeight: currentPage === id ? 600 : 400 },
                },
              }}
            />
          </ListItemButton>
        ))}
      </List>

      <Box sx={{ mt: 'auto', p: 2 }}>
        <Divider sx={{ mb: 1.5 }} />
        <Chip
          label={STATUS_LABEL[state.status] ?? state.status}
          color={STATUS_COLOR[state.status] ?? 'default'}
          size="small"
          variant="outlined"
          sx={{ width: '100%', fontSize: 11 }}
        />
      </Box>
    </Box>
  )
}

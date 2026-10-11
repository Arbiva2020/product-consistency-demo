import {
  Box,
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material'

import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined'
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined'
import RateReviewOutlinedIcon from '@mui/icons-material/RateReviewOutlined'
import GridViewIcon from '@mui/icons-material/GridView';

import { Outlet, useLocation, useNavigate } from 'react-router-dom'

const drawerWidth = 240

const navigation = [
  {
    label: 'Explore',
    path: '/explore',
    icon: <SearchOutlinedIcon />,
  },
  {
    label: 'Check',
    path: '/check',
    icon: <FactCheckOutlinedIcon />,
  },
  {
    label: 'Review',
    path: '/review',
    icon: <RateReviewOutlinedIcon />,
  },
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: <GridViewIcon />,
  },
]

export default function AppShell() {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f7f8fa' }}>
      <Box
        component="aside"
        sx={{
          width: drawerWidth,
          bgcolor: '#ffffff',
          borderRight: '1px solid #e5e7eb',
          p: 2,
          flexShrink: 0,
        }}
      >
        <Box sx={{ px: 1, py: 2 }}>
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 700, letterSpacing: 0.5 }}
          >
            PRODUCT CONSISTENCY
          </Typography>

          <Typography variant="caption" color="text.secondary">
            Product intelligence workspace
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        <List>
          {navigation.map((item) => (
            <ListItemButton
              key={item.path}
              selected={location.pathname === item.path}
              onClick={() => navigate(item.path)}
              sx={{
                borderRadius: 2,
                mb: 0.5,
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>

              <ListItemText primary={item.label} />
            </ListItemButton>
          ))}
        </List>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 5,
          maxWidth: 1200,
        }}
      >
        <Outlet />
      </Box>
    </Box>
  )
}
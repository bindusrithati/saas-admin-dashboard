import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  IconButton,
  Typography,
  Divider,
  Tooltip,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  School as SchoolIcon,
  SupervisorAccount as MentorIcon,
  MenuBook as SyllabusIcon,
  Groups as BatchesIcon,
  Schedule as ScheduleIcon,
  Chat as ChatIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const DRAWER_WIDTH = 260;
const COLLAPSED_WIDTH = 72;

interface MenuItem {
  title: string;
  path: string;
  icon: React.ReactNode;
}

const menuItems: MenuItem[] = [
  { title: 'Dashboard', path: '/dashboard', icon: <DashboardIcon /> },
  { title: 'Students', path: '/students', icon: <SchoolIcon /> },
  { title: 'Mentors', path: '/mentors', icon: <MentorIcon /> },
  { title: 'Syllabus', path: '/syllabus', icon: <SyllabusIcon /> },
  { title: 'Batches', path: '/batches', icon: <BatchesIcon /> },
  { title: 'Class Schedule', path: '/schedule', icon: <ScheduleIcon /> },
  { title: 'Chat', path: '/chat', icon: <ChatIcon /> },
  { title: 'Settings', path: '/settings', icon: <SettingsIcon /> },
  { title: 'Users', path: '/users', icon: <PeopleIcon /> },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: collapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: collapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH,
          boxSizing: 'border-box',
          backgroundColor: '#1a1a2e',
          color: '#ffffff',
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          overflowX: 'hidden',
        },
      }}
    >
      {/* Logo Area */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          py: 2,
          px: collapsed ? 1 : 2,
          minHeight: 64,
        }}
      >
        {!collapsed && (
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            LMS Admin
          </Typography>
        )}
        <IconButton
          onClick={onToggle}
          sx={{
            color: 'rgba(255, 255, 255, 0.7)',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
            },
          }}
        >
          {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
        </IconButton>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.08)' }} />

      {/* Menu Items */}
      <Box sx={{ flex: 1, py: 2 }}>
        <List>
          {menuItems.map((item) => (
            <Tooltip
              key={item.path}
              title={collapsed ? item.title : ''}
              placement="right"
              arrow
            >
              <ListItemButton
                onClick={() => navigate(item.path)}
                selected={isActive(item.path)}
                sx={{
                  borderRadius: 2,
                  mx: 1,
                  mb: 0.5,
                  color: 'rgba(255, 255, 255, 0.7)',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    color: '#ffffff',
                  },
                  '&.Mui-selected': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.2),
                    color: '#ffffff',
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.3),
                    },
                    '& .MuiListItemIcon-root': {
                      color: theme.palette.primary.light,
                    },
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: 'inherit',
                    minWidth: collapsed ? 0 : 40,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                {!collapsed && <ListItemText primary={item.title} />}
              </ListItemButton>
            </Tooltip>
          ))}
        </List>
      </Box>

      {/* Logout Button */}
      <Box sx={{ py: 2 }}>
        <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.08)', mb: 2 }} />
        <Tooltip title={collapsed ? 'Logout' : ''} placement="right" arrow>
          <ListItemButton
            onClick={handleLogout}
            sx={{
              borderRadius: 2,
              mx: 1,
              color: 'rgba(255, 255, 255, 0.7)',
              '&:hover': {
                backgroundColor: alpha(theme.palette.error.main, 0.15),
                color: theme.palette.error.light,
                '& .MuiListItemIcon-root': {
                  color: theme.palette.error.light,
                },
              },
            }}
          >
            <ListItemIcon
              sx={{
                color: 'inherit',
                minWidth: collapsed ? 0 : 40,
              }}
            >
              <LogoutIcon />
            </ListItemIcon>
            {!collapsed && <ListItemText primary="Logout" />}
          </ListItemButton>
        </Tooltip>
      </Box>
    </Drawer>
  );
};

export default Sidebar;

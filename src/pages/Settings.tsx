import React, { useState } from 'react';
import {
  Box,
  Card,
  Typography,
  TextField,
  Button,
  Divider,
  Switch,
  FormControlLabel,
  Alert,
  Avatar,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';

const Settings: React.FC = () => {
  const { user } = useAuth();
  const [success, setSuccess] = useState('');
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    darkMode: false,
  });

  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });

  const handleSaveProfile = () => {
    // In a real app, this would call an API
    setSuccess('Profile updated successfully!');
    setTimeout(() => setSuccess(''), 3000);
  };

  const getInitials = (name: string) => {
    return name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || '?';
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} sx={{ mb: 3 }}>
        Settings
      </Typography>

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      {/* Profile Settings */}
      <Card sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 3 }}>
          Profile Settings
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
          <Avatar
            sx={{
              width: 80,
              height: 80,
              fontSize: 28,
              bgcolor: 'primary.main',
            }}
          >
            {getInitials(profile.name)}
          </Avatar>
          <Box>
            <Typography variant="h6">{profile.name}</Typography>
            <Typography variant="body2" color="text.secondary">
              {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'User'}
            </Typography>
          </Box>
        </Box>

        <TextField
          fullWidth
          label="Full Name"
          value={profile.name}
          onChange={(e) => setProfile({ ...profile, name: e.target.value })}
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          label="Email Address"
          value={profile.email}
          onChange={(e) => setProfile({ ...profile, email: e.target.value })}
          sx={{ mb: 3 }}
          disabled
        />
        <Button variant="contained" onClick={handleSaveProfile}>
          Save Changes
        </Button>
      </Card>

      {/* Notification Settings */}
      <Card sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 3 }}>
          Notification Settings
        </Typography>

        <FormControlLabel
          control={
            <Switch
              checked={settings.emailNotifications}
              onChange={(e) =>
                setSettings({ ...settings, emailNotifications: e.target.checked })
              }
            />
          }
          label="Email Notifications"
        />
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, ml: 6 }}>
          Receive email notifications for important updates
        </Typography>

        <FormControlLabel
          control={
            <Switch
              checked={settings.pushNotifications}
              onChange={(e) =>
                setSettings({ ...settings, pushNotifications: e.target.checked })
              }
            />
          }
          label="Push Notifications"
        />
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, ml: 6 }}>
          Receive push notifications in your browser
        </Typography>
      </Card>

      {/* Appearance Settings */}
      <Card sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 3 }}>
          Appearance
        </Typography>

        <FormControlLabel
          control={
            <Switch
              checked={settings.darkMode}
              onChange={(e) =>
                setSettings({ ...settings, darkMode: e.target.checked })
              }
            />
          }
          label="Dark Mode"
        />
        <Typography variant="body2" color="text.secondary" sx={{ ml: 6 }}>
          Switch between light and dark theme (coming soon)
        </Typography>
      </Card>
    </Box>
  );
};

export default Settings;

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Chip,
  SelectChangeEvent,
} from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';
import { adminAPI } from '../services/api';

const Admin: React.FC = () => {
  const [receiverType, setReceiverType] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const receiverTypes = [
    { value: 'all', label: 'All Users', color: 'primary' },
    { value: 'admin', label: 'Admins Only', color: 'error' },
    { value: 'mentor', label: 'Mentors Only', color: 'info' },
    { value: 'student', label: 'Students Only', color: 'success' },
  ];

  const handleReceiverChange = (event: SelectChangeEvent) => {
    setReceiverType(event.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!receiverType || !subject || !message) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      await adminAPI.sendEmail({
        receiver_type: receiverType,
        subject,
        message,
      });
      setSuccess('Email sent successfully!');
      setSubject('');
      setMessage('');
      setReceiverType('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight={600} sx={{ mb: 3 }}>
        Admin - Send Email
      </Typography>

      <Card sx={{ maxWidth: 700, borderRadius: 2 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h6" sx={{ mb: 3 }}>
            Compose Email
          </Typography>

          {success && (
            <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
              {success}
            </Alert>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Receiver Type</InputLabel>
              <Select
                value={receiverType}
                label="Receiver Type"
                onChange={handleReceiverChange}
              >
                {receiverTypes.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip
                        label={type.label}
                        size="small"
                        color={type.color as any}
                        variant="outlined"
                      />
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              sx={{ mb: 3 }}
              required
            />

            <TextField
              fullWidth
              label="Message"
              multiline
              rows={6}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              sx={{ mb: 3 }}
              required
              placeholder="Enter your email message here..."
            />

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button
                variant="outlined"
                onClick={() => {
                  setSubject('');
                  setMessage('');
                  setReceiverType('');
                }}
              >
                Clear
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                disabled={loading}
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5a6fd6 0%, #6a4190 100%)',
                  },
                }}
              >
                {loading ? 'Sending...' : 'Send Email'}
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card sx={{ maxWidth: 700, mt: 3, borderRadius: 2 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Quick Templates
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip
              label="Welcome Message"
              onClick={() => {
                setSubject('Welcome to LMS!');
                setMessage('Dear User,\n\nWelcome to our Learning Management System. We are excited to have you on board!\n\nBest regards,\nLMS Team');
              }}
              sx={{ cursor: 'pointer' }}
            />
            <Chip
              label="System Maintenance"
              onClick={() => {
                setSubject('Scheduled System Maintenance');
                setMessage('Dear User,\n\nWe will be performing scheduled maintenance on our system. During this time, the platform may be temporarily unavailable.\n\nWe apologize for any inconvenience.\n\nBest regards,\nLMS Team');
              }}
              sx={{ cursor: 'pointer' }}
            />
            <Chip
              label="New Feature Announcement"
              onClick={() => {
                setSubject('Exciting New Feature!');
                setMessage('Dear User,\n\nWe are excited to announce a new feature on our platform!\n\nCheck it out and let us know what you think.\n\nBest regards,\nLMS Team');
              }}
              sx={{ cursor: 'pointer' }}
            />
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Admin;

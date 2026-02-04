import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { batchesAPI } from '../services/api';
import { ClassSchedule } from '../types';

interface BatchScheduleProps {
  batchId: number;
}

const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

const BatchSchedule: React.FC<BatchScheduleProps> = ({ batchId }) => {
  const [schedules, setSchedules] = useState<ClassSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<ClassSchedule | null>(null);

  const [formData, setFormData] = useState({
    day_of_week: '',
    start_time: '',
    end_time: '',
    topic: '',
  });
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const fetchSchedules = useCallback(async () => {
    setLoading(true);
    try {
      const response = await batchesAPI.getSchedules(batchId);
      setSchedules(response.data.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch schedules');
    } finally {
      setLoading(false);
    }
  }, [batchId]);

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  const handleCreateOrUpdate = async () => {
    setFormError('');
    setFormLoading(true);
    try {
      if (editMode && selectedSchedule) {
        await batchesAPI.updateSchedule(batchId, selectedSchedule.id, formData);
      } else {
        await batchesAPI.createSchedule(batchId, formData);
      }
      setOpenDialog(false);
      resetForm();
      fetchSchedules();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to save schedule');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (scheduleId: number) => {
    if (!window.confirm('Are you sure you want to delete this schedule?')) return;
    try {
      await batchesAPI.deleteSchedule(batchId, scheduleId);
      fetchSchedules();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete schedule');
    }
  };

  const handleEdit = (schedule: ClassSchedule) => {
    setSelectedSchedule(schedule);
    setFormData({
      day_of_week: schedule.day_of_week,
      start_time: schedule.start_time,
      end_time: schedule.end_time,
      topic: schedule.topic || '',
    });
    setEditMode(true);
    setOpenDialog(true);
  };

  const resetForm = () => {
    setFormData({ day_of_week: '', start_time: '', end_time: '', topic: '' });
    setEditMode(false);
    setSelectedSchedule(null);
  };

  const getDayColor = (day: string) => {
    const colors: Record<string, 'primary' | 'secondary' | 'success' | 'warning' | 'info'> = {
      Monday: 'primary',
      Tuesday: 'secondary',
      Wednesday: 'success',
      Thursday: 'warning',
      Friday: 'info',
      Saturday: 'primary',
      Sunday: 'secondary',
    };
    return colors[day] || 'primary';
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Group schedules by day
  const schedulesByDay = DAYS_OF_WEEK.reduce((acc, day) => {
    acc[day] = schedules.filter((s) => s.day_of_week === day);
    return acc;
  }, {} as Record<string, ClassSchedule[]>);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">Class Schedule</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            resetForm();
            setOpenDialog(true);
          }}
          size="small"
        >
          Add Class
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {schedules.length === 0 ? (
        <Typography color="text.secondary">
          No class schedules created yet.
        </Typography>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Day</TableCell>
                <TableCell>Time</TableCell>
                <TableCell>Topic</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {schedules.map((schedule) => (
                <TableRow key={schedule.id} hover>
                  <TableCell>
                    <Chip
                      label={schedule.day_of_week}
                      color={getDayColor(schedule.day_of_week)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {schedule.start_time} - {schedule.end_time}
                  </TableCell>
                  <TableCell>{schedule.topic || '-'}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleEdit(schedule)}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(schedule.id)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Create/Edit Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{editMode ? 'Edit Class Schedule' : 'Add Class Schedule'}</DialogTitle>
        <DialogContent>
          {formError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {formError}
            </Alert>
          )}
          <FormControl fullWidth sx={{ mt: 2, mb: 2 }}>
            <InputLabel>Day of Week</InputLabel>
            <Select
              value={formData.day_of_week}
              label="Day of Week"
              onChange={(e) => setFormData({ ...formData, day_of_week: e.target.value })}
            >
              {DAYS_OF_WEEK.map((day) => (
                <MenuItem key={day} value={day}>
                  {day}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Start Time"
            type="time"
            value={formData.start_time}
            onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
            sx={{ mb: 2 }}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            fullWidth
            label="End Time"
            type="time"
            value={formData.end_time}
            onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
            sx={{ mb: 2 }}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            fullWidth
            label="Topic (Optional)"
            value={formData.topic}
            onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCreateOrUpdate}
            disabled={formLoading || !formData.day_of_week || !formData.start_time || !formData.end_time}
          >
            {formLoading ? <CircularProgress size={24} /> : editMode ? 'Save' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BatchSchedule;

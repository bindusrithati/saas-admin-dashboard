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
  InputAdornment,
  CircularProgress,
  Alert,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
} from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { batchesAPI, mentorsAPI, syllabusAPI, usersAPI } from '../services/api';
import { Batch, User, Syllabus } from '../types';

const Batches: React.FC = () => {
  const navigate = useNavigate();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [mentors, setMentors] = useState<User[]>([]);
  const [syllabusList, setSyllabusList] = useState<Syllabus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    mentor_id: 0,
    syllabus_id: 0,
    start_date: '',
    end_date: '',
  });
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const fetchBatches = useCallback(async () => {
    setLoading(true);
    try {
      const response = await batchesAPI.getAll();
      setBatches(response.data.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch batches');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMentors = async () => {
    try {
      const response = await usersAPI.getAll({ filter_by: 'role', filter_values: 'mentor' });
      setMentors(response.data.data || []);
    } catch (err) {
      console.error('Failed to fetch mentors:', err);
    }
  };

  const fetchSyllabus = async () => {
    try {
      const response = await syllabusAPI.getAll();
      setSyllabusList(response.data.data || []);
    } catch (err) {
      console.error('Failed to fetch syllabus:', err);
    }
  };

  useEffect(() => {
    fetchBatches();
    fetchMentors();
    fetchSyllabus();
  }, [fetchBatches]);

  const handleCreateOrUpdate = async () => {
    setFormError('');
    setFormLoading(true);
    try {
      if (editMode && selectedBatch) {
        await batchesAPI.update(selectedBatch.id, formData);
      } else {
        await batchesAPI.create(formData);
      }
      setOpenCreateDialog(false);
      setFormData({ name: '', mentor_id: 0, syllabus_id: 0, start_date: '', end_date: '' });
      setEditMode(false);
      setSelectedBatch(null);
      fetchBatches();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to save batch');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this batch?')) return;
    try {
      await batchesAPI.delete(id);
      fetchBatches();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete batch');
    }
  };

  const handleEdit = (batch: Batch) => {
    setSelectedBatch(batch);
    setFormData({
      name: batch.name,
      mentor_id: batch.mentor_id,
      syllabus_id: batch.syllabus_id,
      start_date: batch.start_date?.split('T')[0] || '',
      end_date: batch.end_date?.split('T')[0] || '',
    });
    setEditMode(true);
    setOpenCreateDialog(true);
  };

  const filteredBatches = batches.filter((b) =>
    b.name?.toLowerCase().includes(search.toLowerCase())
  );

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 80 },
    { field: 'name', headerName: 'Batch Name', flex: 1, minWidth: 150 },
    { field: 'mentor_name', headerName: 'Mentor', width: 150 },
    { field: 'syllabus_name', headerName: 'Syllabus', width: 150 },
    {
      field: 'start_date',
      headerName: 'Start Date',
      width: 120,
      renderCell: (params: GridRenderCellParams) =>
        params.value ? new Date(params.value).toLocaleDateString() : '-',
    },
    {
      field: 'end_date',
      headerName: 'End Date',
      width: 120,
      renderCell: (params: GridRenderCellParams) =>
        params.value ? new Date(params.value).toLocaleDateString() : '-',
    },
    {
      field: 'is_active',
      headerName: 'Status',
      width: 100,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.value ? 'Active' : 'Inactive'}
          color={params.value ? 'success' : 'default'}
          size="small"
          variant="outlined"
        />
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Box>
          <IconButton
            size="small"
            color="primary"
            onClick={() => navigate(`/batches/${params.row.id}`)}
            title="View Details"
          >
            <ViewIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            color="primary"
            onClick={() => handleEdit(params.row)}
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            color="error"
            onClick={() => handleDelete(params.row.id)}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight={700}>
          Batches
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setEditMode(false);
            setFormData({ name: '', mentor_id: 0, syllabus_id: 0, start_date: '', end_date: '' });
            setOpenCreateDialog(true);
          }}
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          }}
        >
          Create Batch
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Card sx={{ p: 2 }}>
        <TextField
          size="small"
          placeholder="Search batches..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ mb: 2, width: 300 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
        />

        <DataGrid
          rows={filteredBatches}
          columns={columns}
          loading={loading}
          pageSizeOptions={[10, 25, 50]}
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } },
          }}
          disableRowSelectionOnClick
          sx={{
            border: 'none',
            minHeight: 400,
            '& .MuiDataGrid-cell:focus': { outline: 'none' },
          }}
        />
      </Card>

      {/* Create/Edit Batch Dialog */}
      <Dialog
        open={openCreateDialog}
        onClose={() => setOpenCreateDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{editMode ? 'Edit Batch' : 'Create Batch'}</DialogTitle>
        <DialogContent>
          {formError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {formError}
            </Alert>
          )}
          <TextField
            fullWidth
            label="Batch Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            sx={{ mt: 2, mb: 2 }}
            required
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Mentor</InputLabel>
            <Select
              value={formData.mentor_id || ''}
              label="Mentor"
              onChange={(e) => setFormData({ ...formData, mentor_id: Number(e.target.value) })}
            >
              {mentors.map((mentor) => (
                <MenuItem key={mentor.id} value={mentor.id}>
                  {mentor.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Syllabus</InputLabel>
            <Select
              value={formData.syllabus_id || ''}
              label="Syllabus"
              onChange={(e) => setFormData({ ...formData, syllabus_id: Number(e.target.value) })}
            >
              {syllabusList.map((syllabus) => (
                <MenuItem key={syllabus.id} value={syllabus.id}>
                  {syllabus.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Start Date"
            type="date"
            value={formData.start_date}
            onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
            sx={{ mb: 2 }}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            fullWidth
            label="End Date"
            type="date"
            value={formData.end_date}
            onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenCreateDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCreateOrUpdate}
            disabled={formLoading || !formData.name}
          >
            {formLoading ? <CircularProgress size={24} /> : editMode ? 'Save' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Batches;

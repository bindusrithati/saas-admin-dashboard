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
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { syllabusAPI } from '../services/api';
import { Syllabus } from '../types';

const SyllabusPage: React.FC = () => {
  const [syllabusList, setSyllabusList] = useState<Syllabus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [selectedSyllabus, setSelectedSyllabus] = useState<Syllabus | null>(null);
  const [editMode, setEditMode] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    topics: [] as string[],
  });
  const [topicInput, setTopicInput] = useState('');
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const fetchSyllabus = useCallback(async () => {
    setLoading(true);
    try {
      const response = await syllabusAPI.getAll();
      setSyllabusList(response.data.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch syllabus');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSyllabus();
  }, [fetchSyllabus]);

  const handleCreateOrUpdate = async () => {
    setFormError('');
    setFormLoading(true);
    try {
      if (editMode && selectedSyllabus) {
        await syllabusAPI.update(selectedSyllabus.id, formData);
      } else {
        await syllabusAPI.create(formData);
      }
      setOpenCreateDialog(false);
      setFormData({ name: '', topics: [] });
      setEditMode(false);
      setSelectedSyllabus(null);
      fetchSyllabus();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to save syllabus');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this syllabus?')) return;
    try {
      await syllabusAPI.delete(id);
      fetchSyllabus();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete syllabus');
    }
  };

  const handleEdit = (syllabus: Syllabus) => {
    setSelectedSyllabus(syllabus);
    setFormData({ name: syllabus.name, topics: syllabus.topics });
    setEditMode(true);
    setOpenCreateDialog(true);
  };

  const handleView = (syllabus: Syllabus) => {
    setSelectedSyllabus(syllabus);
    setOpenViewDialog(true);
  };

  const handleAddTopic = () => {
    if (topicInput.trim()) {
      setFormData({
        ...formData,
        topics: [...formData.topics, topicInput.trim()],
      });
      setTopicInput('');
    }
  };

  const handleRemoveTopic = (index: number) => {
    setFormData({
      ...formData,
      topics: formData.topics.filter((_, i) => i !== index),
    });
  };

  const filteredSyllabus = syllabusList.filter((s) =>
    s.name?.toLowerCase().includes(search.toLowerCase())
  );

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 80 },
    { field: 'name', headerName: 'Syllabus Name', flex: 1, minWidth: 200 },
    {
      field: 'topics',
      headerName: 'Topics',
      flex: 1,
      minWidth: 300,
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          {(params.value || []).slice(0, 3).map((topic: string, i: number) => (
            <Chip key={i} label={topic} size="small" variant="outlined" />
          ))}
          {(params.value || []).length > 3 && (
            <Chip label={`+${params.value.length - 3}`} size="small" />
          )}
        </Box>
      ),
    },
    {
      field: 'created_at',
      headerName: 'Created',
      width: 120,
      renderCell: (params: GridRenderCellParams) =>
        new Date(params.value).toLocaleDateString(),
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
            onClick={() => handleView(params.row)}
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
          Syllabus
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setEditMode(false);
            setFormData({ name: '', topics: [] });
            setOpenCreateDialog(true);
          }}
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          }}
        >
          Create Syllabus
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
          placeholder="Search syllabus..."
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
          rows={filteredSyllabus}
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

      {/* Create/Edit Syllabus Dialog */}
      <Dialog
        open={openCreateDialog}
        onClose={() => setOpenCreateDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{editMode ? 'Edit Syllabus' : 'Create Syllabus'}</DialogTitle>
        <DialogContent>
          {formError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {formError}
            </Alert>
          )}
          <TextField
            fullWidth
            label="Syllabus Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            sx={{ mt: 2, mb: 2 }}
            required
          />
          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              label="Add Topic"
              value={topicInput}
              onChange={(e) => setTopicInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddTopic()}
              InputProps={{
                endAdornment: (
                  <Button onClick={handleAddTopic}>Add</Button>
                ),
              }}
            />
            <List dense>
              {formData.topics.map((topic, i) => (
                <ListItem key={i}>
                  <ListItemText primary={`${i + 1}. ${topic}`} />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      size="small"
                      onClick={() => handleRemoveTopic(i)}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </Box>
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

      {/* View Syllabus Dialog */}
      <Dialog
        open={openViewDialog}
        onClose={() => setOpenViewDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Syllabus Details</DialogTitle>
        <DialogContent>
          {selectedSyllabus && (
            <Box sx={{ pt: 2 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                {selectedSyllabus.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Topics ({selectedSyllabus.topics?.length || 0})
              </Typography>
              <List>
                {selectedSyllabus.topics?.map((topic, i) => (
                  <ListItem key={i} sx={{ py: 0.5 }}>
                    <Chip label={`${i + 1}`} size="small" sx={{ mr: 1 }} />
                    <ListItemText primary={topic} />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenViewDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SyllabusPage;

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
  Avatar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { mentorsAPI, usersAPI } from '../services/api';
import { Mentor, User } from '../types';

const Mentors: React.FC = () => {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);

  const [formData, setFormData] = useState({
    user_id: 0,
    bio: '',
    expertise: [] as string[],
  });
  const [expertiseInput, setExpertiseInput] = useState('');
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const fetchMentors = useCallback(async () => {
    setLoading(true);
    try {
      // Get users with mentor role
      const response = await usersAPI.getAll({ filter_by: 'role', filter_values: 'mentor' });
      const mentorUsers = response.data.data || [];
      
      // Fetch mentor profiles for each user
      const mentorProfiles = await Promise.all(
        mentorUsers.map(async (user: User) => {
          try {
            const profileRes = await mentorsAPI.getProfile(user.id);
            return { ...user, ...profileRes.data.data };
          } catch {
            return { ...user, bio: '', expertise: [] };
          }
        })
      );
      
      setMentors(mentorProfiles);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch mentors');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await usersAPI.getAll({ filter_by: 'role', filter_values: 'mentor' });
      setUsers(response.data.data || []);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  };

  useEffect(() => {
    fetchMentors();
    fetchUsers();
  }, [fetchMentors]);

  const handleCreateMentor = async () => {
    setFormError('');
    setFormLoading(true);
    try {
      await mentorsAPI.createProfile(formData);
      setOpenCreateDialog(false);
      setFormData({ user_id: 0, bio: '', expertise: [] });
      fetchMentors();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to create mentor profile');
    } finally {
      setFormLoading(false);
    }
  };

  const handleAddExpertise = () => {
    if (expertiseInput.trim()) {
      setFormData({
        ...formData,
        expertise: [...formData.expertise, expertiseInput.trim()],
      });
      setExpertiseInput('');
    }
  };

  const handleRemoveExpertise = (index: number) => {
    setFormData({
      ...formData,
      expertise: formData.expertise.filter((_, i) => i !== index),
    });
  };

  const handleViewMentor = (mentor: Mentor) => {
    setSelectedMentor(mentor);
    setOpenViewDialog(true);
  };

  const filteredMentors = mentors.filter(
    (m) =>
      m.name?.toLowerCase().includes(search.toLowerCase()) ||
      m.email?.toLowerCase().includes(search.toLowerCase())
  );

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 80 },
    {
      field: 'name',
      headerName: 'Name',
      flex: 1,
      minWidth: 150,
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar sx={{ width: 32, height: 32, fontSize: 14 }}>
            {params.value?.[0]?.toUpperCase()}
          </Avatar>
          {params.value}
        </Box>
      ),
    },
    { field: 'email', headerName: 'Email', flex: 1, minWidth: 200 },
    {
      field: 'expertise',
      headerName: 'Expertise',
      flex: 1,
      minWidth: 200,
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          {(params.value || []).slice(0, 2).map((exp: string, i: number) => (
            <Chip key={i} label={exp} size="small" variant="outlined" />
          ))}
          {(params.value || []).length > 2 && (
            <Chip label={`+${params.value.length - 2}`} size="small" />
          )}
        </Box>
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Box>
          <IconButton
            size="small"
            color="primary"
            onClick={() => handleViewMentor(params.row)}
          >
            <ViewIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" color="primary">
            <EditIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight={700}>
          Mentors
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenCreateDialog(true)}
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          }}
        >
          Add Mentor Profile
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
          placeholder="Search mentors..."
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
          rows={filteredMentors}
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

      {/* Create Mentor Dialog */}
      <Dialog
        open={openCreateDialog}
        onClose={() => setOpenCreateDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create Mentor Profile</DialogTitle>
        <DialogContent>
          {formError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {formError}
            </Alert>
          )}
          <FormControl fullWidth sx={{ mt: 2, mb: 2 }}>
            <InputLabel>Select User</InputLabel>
            <Select
              value={formData.user_id || ''}
              label="Select User"
              onChange={(e) =>
                setFormData({ ...formData, user_id: Number(e.target.value) })
              }
            >
              {users.map((user) => (
                <MenuItem key={user.id} value={user.id}>
                  {user.name} ({user.email})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Bio"
            multiline
            rows={3}
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            sx={{ mb: 2 }}
          />
          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              label="Add Expertise"
              value={expertiseInput}
              onChange={(e) => setExpertiseInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddExpertise()}
              InputProps={{
                endAdornment: (
                  <Button onClick={handleAddExpertise}>Add</Button>
                ),
              }}
            />
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
              {formData.expertise.map((exp, i) => (
                <Chip
                  key={i}
                  label={exp}
                  onDelete={() => handleRemoveExpertise(i)}
                />
              ))}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenCreateDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCreateMentor}
            disabled={formLoading}
          >
            {formLoading ? <CircularProgress size={24} /> : 'Create Profile'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Mentor Dialog */}
      <Dialog
        open={openViewDialog}
        onClose={() => setOpenViewDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Mentor Profile</DialogTitle>
        <DialogContent>
          {selectedMentor && (
            <Box sx={{ pt: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Avatar sx={{ width: 64, height: 64, fontSize: 24 }}>
                  {selectedMentor.name?.[0]?.toUpperCase()}
                </Avatar>
                <Box>
                  <Typography variant="h6">{selectedMentor.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedMentor.email}
                  </Typography>
                </Box>
              </Box>

              {selectedMentor.bio && (
                <>
                  <Typography variant="body2" color="text.secondary">
                    Bio
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {selectedMentor.bio}
                  </Typography>
                </>
              )}

              {selectedMentor.expertise && selectedMentor.expertise.length > 0 && (
                <>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Expertise
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {selectedMentor.expertise.map((exp, i) => (
                      <Chip key={i} label={exp} color="primary" variant="outlined" />
                    ))}
                  </Box>
                </>
              )}
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

export default Mentors;

import React, { useState, useEffect } from 'react';
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
  Chip,
  Alert,
  CircularProgress,
} from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { guestsAPI } from '../services/api';

interface Guest {
  id: number;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  purpose?: string;
  visit_date?: string;
  status?: string;
}

const Guests: React.FC = () => {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    purpose: '',
  });

  useEffect(() => {
    fetchGuests();
  }, []);

  const fetchGuests = async () => {
    try {
      setLoading(true);
      const response = await guestsAPI.getAll();
      setGuests(response.data?.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch guests');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (guest?: Guest) => {
    if (guest) {
      setSelectedGuest(guest);
      setFormData({
        name: guest.name,
        email: guest.email,
        phone: guest.phone || '',
        company: guest.company || '',
        purpose: guest.purpose || '',
      });
    } else {
      setSelectedGuest(null);
      setFormData({ name: '', email: '', phone: '', company: '', purpose: '' });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedGuest(null);
  };

  const handleSubmit = async () => {
    try {
      if (selectedGuest) {
        await guestsAPI.update(selectedGuest.id, formData);
      } else {
        await guestsAPI.create(formData);
      }
      handleCloseDialog();
      fetchGuests();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save guest');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this guest?')) {
      try {
        await guestsAPI.delete(id);
        fetchGuests();
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to delete guest');
      }
    }
  };

  const handleView = (guest: Guest) => {
    setSelectedGuest(guest);
    setOpenViewDialog(true);
  };

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'name', headerName: 'Name', flex: 1, minWidth: 150 },
    { field: 'email', headerName: 'Email', flex: 1, minWidth: 180 },
    { field: 'phone', headerName: 'Phone', width: 130 },
    { field: 'company', headerName: 'Company', width: 150 },
    { field: 'purpose', headerName: 'Purpose', flex: 1, minWidth: 150 },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.value || 'Active'}
          size="small"
          color={params.value === 'inactive' ? 'default' : 'success'}
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
          <IconButton size="small" onClick={() => handleView(params.row)} color="info">
            <ViewIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={() => handleOpenDialog(params.row)} color="primary">
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={() => handleDelete(params.row.id)} color="error">
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight={600}>
          Guests
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          }}
        >
          Add Guest
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Card sx={{ borderRadius: 2 }}>
        <DataGrid
          rows={guests}
          columns={columns}
          loading={loading}
          pageSizeOptions={[10, 25, 50]}
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } },
          }}
          autoHeight
          disableRowSelectionOnClick
          sx={{
            border: 'none',
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: '#f5f5f5',
            },
          }}
        />
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{selectedGuest ? 'Edit Guest' : 'Add New Guest'}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
            <TextField
              fullWidth
              label="Phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
            <TextField
              fullWidth
              label="Company"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            />
            <TextField
              fullWidth
              label="Purpose of Visit"
              multiline
              rows={2}
              value={formData.purpose}
              onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>
            {selectedGuest ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={openViewDialog} onClose={() => setOpenViewDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Guest Details</DialogTitle>
        <DialogContent>
          {selectedGuest && (
            <Box sx={{ pt: 2 }}>
              <Typography variant="body1" gutterBottom>
                <strong>Name:</strong> {selectedGuest.name}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Email:</strong> {selectedGuest.email}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Phone:</strong> {selectedGuest.phone || 'N/A'}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Company:</strong> {selectedGuest.company || 'N/A'}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Purpose:</strong> {selectedGuest.purpose || 'N/A'}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Visit Date:</strong> {selectedGuest.visit_date || 'N/A'}
              </Typography>
              <Typography variant="body1">
                <strong>Status:</strong> {selectedGuest.status || 'Active'}
              </Typography>
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

export default Guests;

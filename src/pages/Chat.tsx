import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Chip,
} from '@mui/material';
import { batchesAPI } from '../services/api';
import { Batch } from '../types';
import BatchChat from '../components/BatchChat';

const ChatPage: React.FC = () => {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchBatches = useCallback(async () => {
    setLoading(true);
    try {
      const response = await batchesAPI.getAll();
      const batchList = response.data.data || [];
      setBatches(batchList);
      if (batchList.length > 0) {
        setSelectedBatch(batchList[0].id);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch batches');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBatches();
  }, [fetchBatches]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} sx={{ mb: 3 }}>
        Batch Chat
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Card sx={{ p: 3 }}>
        <FormControl sx={{ minWidth: 300, mb: 3 }}>
          <InputLabel>Select Batch</InputLabel>
          <Select
            value={selectedBatch || ''}
            label="Select Batch"
            onChange={(e) => setSelectedBatch(Number(e.target.value))}
          >
            {batches.map((batch) => (
              <MenuItem key={batch.id} value={batch.id}>
                {batch.name}
                {batch.is_active && (
                  <Chip
                    label="Active"
                    size="small"
                    color="success"
                    sx={{ ml: 1 }}
                  />
                )}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {selectedBatch ? (
          <BatchChat key={selectedBatch} batchId={selectedBatch} />
        ) : (
          <Typography color="text.secondary">
            Please select a batch to join its chat room.
          </Typography>
        )}
      </Card>
    </Box>
  );
};

export default ChatPage;

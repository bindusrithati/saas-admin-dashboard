import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  Typography,
  Button,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { batchesAPI, studentsAPI, syllabusAPI } from '../services/api';
import { Batch, MappedBatchStudent, Syllabus, ClassSchedule } from '../types';
import BatchChat from '../components/BatchChat';
import BatchSchedule from '../components/BatchSchedule';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const BatchDetails: React.FC = () => {
  const { batchId } = useParams<{ batchId: string }>();
  const navigate = useNavigate();
  const [batch, setBatch] = useState<Batch | null>(null);
  const [students, setStudents] = useState<MappedBatchStudent[]>([]);
  const [syllabus, setSyllabus] = useState<Syllabus | null>(null);
  const [schedules, setSchedules] = useState<ClassSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      if (!batchId) return;
      setLoading(true);
      try {
        // Fetch batch details
        const batchRes = await batchesAPI.getById(Number(batchId));
        setBatch(batchRes.data.data);

        // Fetch students in batch
        try {
          const studentsRes = await studentsAPI.getByBatch(Number(batchId));
          setStudents(studentsRes.data.data || []);
        } catch {
          setStudents([]);
        }

        // Fetch syllabus
        if (batchRes.data.data.syllabus_id) {
          try {
            const syllabusRes = await syllabusAPI.getById(batchRes.data.data.syllabus_id);
            setSyllabus(syllabusRes.data.data);
          } catch {
            setSyllabus(null);
          }
        }

        // Fetch schedules
        try {
          const schedulesRes = await batchesAPI.getSchedules(Number(batchId));
          setSchedules(schedulesRes.data.data || []);
        } catch {
          setSchedules([]);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch batch details');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [batchId]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!batch) {
    return <Alert severity="warning">Batch not found</Alert>;
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <IconButton onClick={() => navigate('/batches')}>
          <ArrowBackIcon />
        </IconButton>
        <Box>
          <Typography variant="h4" fontWeight={700}>
            {batch.name}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
            <Chip
              label={batch.is_active ? 'Active' : 'Inactive'}
              color={batch.is_active ? 'success' : 'default'}
              size="small"
            />
            {batch.mentor_name && (
              <Chip label={`Mentor: ${batch.mentor_name}`} size="small" variant="outlined" />
            )}
          </Box>
        </Box>
      </Box>

      {/* Tabs */}
      <Card>
        <Tabs
          value={tabValue}
          onChange={(_, newValue) => setTabValue(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}
        >
          <Tab label="Students" />
          <Tab label="Syllabus" />
          <Tab label="Schedule" />
          <Tab label="Chat" />
        </Tabs>

        {/* Students Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ px: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Students ({students.length})
            </Typography>
            {students.length === 0 ? (
              <Typography color="text.secondary">
                No students assigned to this batch yet.
              </Typography>
            ) : (
              <List>
                {students.map((student, index) => (
                  <React.Fragment key={student.mapping_id}>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar>
                          <PersonIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={student.student_name}
                        secondary={student.student_email}
                      />
                      <Typography variant="caption" color="text.secondary">
                        Joined: {new Date(student.joined_at).toLocaleDateString()}
                      </Typography>
                    </ListItem>
                    {index < students.length - 1 && <Divider variant="inset" component="li" />}
                  </React.Fragment>
                ))}
              </List>
            )}
          </Box>
        </TabPanel>

        {/* Syllabus Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ px: 3 }}>
            {syllabus ? (
              <>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  {syllabus.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Topics ({syllabus.topics?.length || 0})
                </Typography>
                <List>
                  {syllabus.topics?.map((topic, i) => (
                    <ListItem key={i} sx={{ py: 1 }}>
                      <Chip label={`${i + 1}`} size="small" sx={{ mr: 2 }} />
                      <ListItemText primary={topic} />
                    </ListItem>
                  ))}
                </List>
              </>
            ) : (
              <Typography color="text.secondary">
                No syllabus assigned to this batch.
              </Typography>
            )}
          </Box>
        </TabPanel>

        {/* Schedule Tab */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ px: 3 }}>
            <BatchSchedule batchId={Number(batchId)} />
          </Box>
        </TabPanel>

        {/* Chat Tab */}
        <TabPanel value={tabValue} index={3}>
          <Box sx={{ px: 3 }}>
            <BatchChat batchId={Number(batchId)} />
          </Box>
        </TabPanel>
      </Card>
    </Box>
  );
};

export default BatchDetails;

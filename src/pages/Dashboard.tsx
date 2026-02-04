import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  alpha,
} from '@mui/material';
import {
  People as PeopleIcon,
  School as SchoolIcon,
  SupervisorAccount as MentorIcon,
  Groups as BatchesIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const enrollmentData = [
  { month: 'Jan', students: 65 },
  { month: 'Feb', students: 78 },
  { month: 'Mar', students: 90 },
  { month: 'Apr', students: 85 },
  { month: 'May', students: 120 },
  { month: 'Jun', students: 145 },
];

const batchPerformanceData = [
  { name: 'Batch A', completed: 85, ongoing: 15 },
  { name: 'Batch B', completed: 72, ongoing: 28 },
  { name: 'Batch C', completed: 60, ongoing: 40 },
  { name: 'Batch D', completed: 45, ongoing: 55 },
];

const roleDistribution = [
  { name: 'Students', value: 450, color: '#667eea' },
  { name: 'Mentors', value: 35, color: '#764ba2' },
  { name: 'Admins', value: 8, color: '#1976d2' },
];

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  trend?: number;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, trend }) => (
  <Card
    sx={{
      height: '100%',
      background: `linear-gradient(135deg, ${color} 0%, ${alpha(color, 0.8)} 100%)`,
      color: '#ffffff',
      position: 'relative',
      overflow: 'hidden',
    }}
  >
    <CardContent sx={{ position: 'relative', zIndex: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>{title}</Typography>
          <Typography variant="h4" fontWeight={700}>{value.toLocaleString()}</Typography>
          {trend !== undefined && (
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <TrendingUpIcon sx={{ fontSize: 16, mr: 0.5 }} />
              <Typography variant="caption">+{trend}% this month</Typography>
            </Box>
          )}
        </Box>
        <Box sx={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', borderRadius: 2, p: 1.5 }}>
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [stats] = useState({
    total_users: 493, total_students: 450, total_mentors: 35, total_batches: 12, active_batches: 8,
  });

  useEffect(() => { setTimeout(() => setLoading(false), 500); }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  const statCards = [
    { title: 'Total Users', value: stats.total_users, icon: <PeopleIcon sx={{ fontSize: 28 }} />, color: '#667eea', trend: 12 },
    { title: 'Total Students', value: stats.total_students, icon: <SchoolIcon sx={{ fontSize: 28 }} />, color: '#764ba2', trend: 8 },
    { title: 'Total Mentors', value: stats.total_mentors, icon: <MentorIcon sx={{ fontSize: 28 }} />, color: '#1976d2', trend: 5 },
    { title: 'Active Batches', value: stats.active_batches, icon: <BatchesIcon sx={{ fontSize: 28 }} />, color: '#2e7d32', trend: 15 },
  ];

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} sx={{ mb: 3 }}>Dashboard</Typography>

      {/* Stats Cards */}
      <Box sx={{ display: 'flex', gap: 3, mb: 4, flexWrap: 'wrap' }}>
        {statCards.map((card) => (
          <Box key={card.title} sx={{ flex: '1 1 200px', minWidth: 200 }}>
            <StatCard {...card} />
          </Box>
        ))}
      </Box>

      {/* Charts Row */}
      <Box sx={{ display: 'flex', gap: 3, mb: 3, flexWrap: 'wrap' }}>
        <Box sx={{ flex: '2 1 500px', minWidth: 300 }}>
          <Card sx={{ p: 3, height: 380 }}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Student Enrollment Trend</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={enrollmentData}>
                <defs>
                  <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#667eea" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#667eea" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip />
                <Area type="monotone" dataKey="students" stroke="#667eea" strokeWidth={2} fill="url(#colorStudents)" />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </Box>
        <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
          <Card sx={{ p: 3, height: 380 }}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>User Distribution</Typography>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={roleDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {roleDistribution.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Box>
      </Box>

      {/* Batch Performance */}
      <Card sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Batch Performance</Typography>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={batchPerformanceData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="name" stroke="#64748b" />
            <YAxis stroke="#64748b" />
            <Tooltip />
            <Bar dataKey="completed" stackId="a" fill="#667eea" name="Completed %" />
            <Bar dataKey="ongoing" stackId="a" fill="#e2e8f0" name="Ongoing %" />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </Box>
  );
};

export default Dashboard;

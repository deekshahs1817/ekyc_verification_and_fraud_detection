import React, { useEffect, useState } from 'react';
import {
  Container,
  Paper,
  Box,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  TextField,
  MenuItem,
  InputAdornment,
  CircularProgress,
  Stack,
  Chip,
} from '@mui/material';
import {
  Assignment as QueueIcon,
  CheckCircle as ApprovedIcon,
  Cancel as RejectedIcon,
  Warning as AlertIcon,
  Search as SearchIcon,
  Visibility as InspectIcon,
  Refresh as RefreshIcon,
  Person as PersonIcon,
  LocalFireDepartment as FireIcon,
  CalendarMonth as CalendarIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { StatCard } from '../components/common/StatCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { adminApi, DashboardStats } from '../api/adminApi';
import { KYCRecord } from '../api/kycApi';
import { getDeveloperStreak } from '../services/streakService';

export const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [queue, setQueue] = useState<KYCRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [riskFilter, setRiskFilter] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsData, queueData] = await Promise.all([
        adminApi.getStats(),
        adminApi.getQueue({
          status_filter: statusFilter || undefined,
          risk_filter: riskFilter || undefined,
          search: search || undefined,
        }),
      ]);
      setStats(statsData);
      setQueue(queueData);
    } catch (err) {
      console.error('Failed to load compliance admin data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, riskFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData();
  };

  return (
    <Container maxWidth="xl" sx={{ py: 5 }}>
      {/* Title */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#F8FAFC' }}>
            Compliance & Fraud Command Center
          </Typography>
          <Typography variant="body2" sx={{ color: '#94A3B8' }}>
            Real-time multi-agent verification queue, fraud anomaly detection & AML screening
          </Typography>
        </Box>
        <Button variant="outlined" color="inherit" startIcon={<RefreshIcon />} onClick={fetchData}>
          Refresh Queue
        </Button>
      </Box>

      {/* KPI Stats */}
      {stats && (
        <Grid container spacing={2.5} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={2.4}>
            <StatCard
              title="Total Submissions"
              value={stats.total_records}
              subtitle="All lifetime applicant records"
              icon={<QueueIcon />}
              color="#3B82F6"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <StatCard
              title="Pending Review"
              value={stats.pending_count + stats.under_review_count}
              subtitle="Requires compliance sign-off"
              icon={<AlertIcon />}
              color="#F59E0B"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <StatCard
              title="Approved KYCs"
              value={stats.approved_count}
              subtitle="Verified authentic users"
              icon={<ApprovedIcon />}
              color="#10B981"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <StatCard
              title="Rejected / Fraud"
              value={stats.rejected_count}
              subtitle="Tamper / Mismatch / Checksum fail"
              icon={<RejectedIcon />}
              color="#EF4444"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <StatCard
              title="AML Policy Alerts"
              value={stats.recent_aml_alerts}
              subtitle="Minor / Duplicate identity hits"
              icon={<AlertIcon />}
              color="#EC4899"
            />
          </Grid>
        </Grid>
      )}

      {/* Developer & Compliance Activity Streak Card */}
      {(() => {
        const streakData = getDeveloperStreak();
        return (
          <Paper
            sx={{
              p: 3,
              mb: 4,
              borderRadius: 3,
              bgcolor: 'background.paper',
              border: '1.5px solid',
              borderColor: 'rgba(249, 115, 22, 0.3)',
              boxShadow: '0 4px 20px rgba(249, 115, 22, 0.08)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 4,
                bgcolor: 'linear-gradient(90deg, #F97316 0%, #EAB308 50%, #10B981 100%)',
              }}
            />

            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={4}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: 3,
                      bgcolor: 'rgba(249, 115, 22, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px solid rgba(249, 115, 22, 0.4)',
                    }}
                  >
                    <FireIcon sx={{ color: '#F97316', fontSize: 36 }} />
                  </Box>
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary' }}>
                        {streakData.currentStreak}-Day Active Streak
                      </Typography>
                      <Chip
                        label="100% ON TRACK"
                        size="small"
                        sx={{
                          bgcolor: 'rgba(16, 185, 129, 0.15)',
                          color: '#10B981',
                          fontWeight: 800,
                          fontSize: '0.68rem',
                          border: '1px solid rgba(16, 185, 129, 0.3)',
                        }}
                      />
                    </Box>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.3 }}>
                      Continuous daily development, AI model integration & compliance audits
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12} md={8}>
                <Grid container spacing={2}>
                  {streakData.history.map((day) => (
                    <Grid item xs={12} sm={6} key={day.date}>
                      <Paper
                        variant="outlined"
                        sx={{
                          p: 2,
                          borderRadius: 2.5,
                          bgcolor: day.status === 'ACTIVE_TODAY' ? 'rgba(59, 130, 246, 0.05)' : 'rgba(16, 185, 129, 0.05)',
                          borderColor: day.status === 'ACTIVE_TODAY' ? 'rgba(59, 130, 246, 0.4)' : 'rgba(16, 185, 129, 0.4)',
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 0.8 }}>
                            <CalendarIcon sx={{ fontSize: 18, color: day.status === 'ACTIVE_TODAY' ? '#3B82F6' : '#10B981' }} />
                            {day.label}
                          </Typography>
                          <Chip
                            size="small"
                            label={day.status === 'ACTIVE_TODAY' ? 'Day 2 • Active Today' : 'Day 1 • Completed'}
                            sx={{
                              fontWeight: 800,
                              fontSize: '0.68rem',
                              bgcolor: day.status === 'ACTIVE_TODAY' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                              color: day.status === 'ACTIVE_TODAY' ? '#3B82F6' : '#10B981',
                            }}
                          />
                        </Box>
                        <Stack spacing={0.6}>
                          {day.milestones.slice(0, 2).map((m, idx) => (
                            <Typography key={idx} variant="caption" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.6 }}>
                              <Box component="span" sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: 'primary.main' }} />
                              {m}
                            </Typography>
                          ))}
                        </Stack>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </Grid>
            </Grid>
          </Paper>
        );
      })()}

      {/* Filters & Search */}
      <Paper sx={{ p: 2.5, mb: 3, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
        <form onSubmit={handleSearchSubmit}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={5}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search by Name, Phone, Aadhaar, or PAN..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                select
                fullWidth
                size="small"
                label="Filter by Status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="">All Statuses</MenuItem>
                <MenuItem value="SUBMITTED">SUBMITTED</MenuItem>
                <MenuItem value="UNDER_REVIEW">UNDER_REVIEW</MenuItem>
                <MenuItem value="APPROVED">APPROVED</MenuItem>
                <MenuItem value="REJECTED">REJECTED</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                select
                fullWidth
                size="small"
                label="Filter by Risk Tier"
                value={riskFilter}
                onChange={(e) => setRiskFilter(e.target.value)}
              >
                <MenuItem value="">All Risk Tiers</MenuItem>
                <MenuItem value="LOW">LOW RISK (0-30%)</MenuItem>
                <MenuItem value="MEDIUM">MEDIUM RISK (31-70%)</MenuItem>
                <MenuItem value="HIGH">HIGH RISK (71-100%)</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={1}>
              <Button type="submit" variant="contained" color="primary" fullWidth size="medium">
                Search
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>

      {/* Queue Table */}
      {loading ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <CircularProgress color="primary" />
        </Box>
      ) : queue.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center', bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
          <Typography variant="h6" sx={{ color: 'text.primary' }}>
            No KYC records match your criteria
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper} sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
          <Table>
            <TableHead sx={{ bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#0F172A' : '#F8FAFC') }}>
              <TableRow>
                <TableCell sx={{ color: 'text.secondary', fontWeight: 700 }}>Applicant</TableCell>
                <TableCell sx={{ color: 'text.secondary', fontWeight: 700 }}>Aadhaar / PAN</TableCell>
                <TableCell sx={{ color: 'text.secondary', fontWeight: 700 }}>Consistency</TableCell>
                <TableCell sx={{ color: 'text.secondary', fontWeight: 700 }}>Face Match</TableCell>
                <TableCell sx={{ color: 'text.secondary', fontWeight: 700 }}>Tamper</TableCell>
                <TableCell sx={{ color: 'text.secondary', fontWeight: 700 }}>Fraud Prob</TableCell>
                <TableCell sx={{ color: 'text.secondary', fontWeight: 700 }}>Risk Tier</TableCell>
                <TableCell sx={{ color: 'text.secondary', fontWeight: 700 }}>Status</TableCell>
                <TableCell sx={{ color: 'text.secondary', fontWeight: 700, textAlign: 'right' }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {queue.map((row) => (
                <TableRow key={row.id} sx={{ '&:hover': { bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#1E293B' : '#F1F5F9') } }}>
                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 700,
                        color: 'primary.main',
                        cursor: 'pointer',
                        display: 'inline-block',
                        '&:hover': { textDecoration: 'underline' },
                      }}
                      onClick={() => navigate(`/admin/applicant/${row.id}`)}
                    >
                      {row.entered_name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                      Account: <strong style={{ color: '#3B82F6' }}>{row.user_email || row.entered_email}</strong>
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: 'monospace', fontSize: '0.7rem' }}>
                      ID: {row.id.substring(0, 8)}...
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" sx={{ display: 'block', fontFamily: 'monospace', color: 'text.primary' }}>
                      Aadhaar: {row.entered_aadhaar}
                    </Typography>
                    <Typography variant="caption" sx={{ display: 'block', fontFamily: 'monospace', color: 'text.secondary' }}>
                      PAN: {row.entered_pan || 'None'}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: row.consistency_score >= 75 ? '#10B981' : '#F59E0B' }}>
                    {row.consistency_score.toFixed(1)}%
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: row.face_score >= 70 ? '#10B981' : '#EF4444' }}>
                    {row.face_score.toFixed(1)}%
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: row.tamper_score < 40 ? '#10B981' : '#EF4444' }}>
                    {row.tamper_score.toFixed(1)}%
                  </TableCell>
                  <TableCell sx={{ fontWeight: 800, color: row.fraud_score > 70 ? '#EF4444' : row.fraud_score > 30 ? '#F59E0B' : '#10B981' }}>
                    {row.fraud_score.toFixed(1)}%
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 700,
                        px: 1,
                        py: 0.3,
                        borderRadius: 1,
                        bgcolor: row.risk_level === 'LOW' ? 'rgba(16, 185, 129, 0.1)' : row.risk_level === 'HIGH' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                        color: row.risk_level === 'LOW' ? '#10B981' : row.risk_level === 'HIGH' ? '#EF4444' : '#F59E0B',
                      }}
                    >
                      {row.risk_level}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={row.status} />
                  </TableCell>
                  <TableCell sx={{ textAlign: 'right' }}>
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Button
                        size="small"
                        variant="outlined"
                        color="inherit"
                        startIcon={<PersonIcon sx={{ fontSize: 16 }} />}
                        onClick={() => navigate(`/admin/applicant/${row.id}`)}
                        sx={{ fontWeight: 600 }}
                      >
                        Profile
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        color="primary"
                        startIcon={<InspectIcon sx={{ fontSize: 16 }} />}
                        onClick={() => navigate(`/admin/review/${row.id}`)}
                        sx={{ fontWeight: 700 }}
                      >
                        Inspect AI
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
};

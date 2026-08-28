import React, { useEffect, useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Box,
  CircularProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
} from '@mui/material';
import {
  PictureAsPdf as PdfIcon,
  Refresh as RefreshIcon,
  Visibility as ViewIcon,
  AdminPanelSettings as AdminIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { StatusBadge } from '../components/common/StatusBadge';
import { kycApi, KYCRecord } from '../api/kycApi';
import { API_BASE_URL } from '../api/client';

export const KYCStatusPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'COMPLIANCE_OFFICER';

  const [records, setRecords] = useState<KYCRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState<KYCRecord | null>(null);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const data = await kycApi.getMyRecords();
      setRecords(data);
    } catch (err) {
      console.error('Failed to load user records', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const downloadReport = (id: string) => {
    const token = localStorage.getItem('ekyc_token') || '';
    window.open(`${API_BASE_URL}/reports/download/${id}?token=${encodeURIComponent(token)}`, '_blank');
  };

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary' }}>
            My Verification History & Application Status
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Track your digital identity verification requests and compliance audit status
          </Typography>
        </Box>
        <Button
          variant="outlined"
          color="inherit"
          startIcon={<RefreshIcon />}
          onClick={fetchRecords}
        >
          Refresh
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <CircularProgress color="primary" />
        </Box>
      ) : records.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center', bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
          <Typography variant="h6" sx={{ color: 'text.primary', mb: 1 }}>
            No KYC Submissions Found
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
            You have not submitted any identity verification requests yet.
          </Typography>
          <Button variant="contained" color="primary" onClick={() => navigate('/kyc/submit')}>
            Start Verification
          </Button>
        </Paper>
      ) : (
        <TableContainer component={Paper} sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
          <Table>
            <TableHead sx={{ bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#0F172A' : '#F8FAFC') }}>
              <TableRow>
                <TableCell sx={{ color: 'text.secondary', fontWeight: 700 }}>Record ID</TableCell>
                <TableCell sx={{ color: 'text.secondary', fontWeight: 700 }}>Applicant Name</TableCell>
                <TableCell sx={{ color: 'text.secondary', fontWeight: 700 }}>
                  {isAdmin ? 'AI Fraud Risk (Admin Only)' : 'Verification Stage'}
                </TableCell>
                <TableCell sx={{ color: 'text.secondary', fontWeight: 700 }}>Review Status</TableCell>
                <TableCell sx={{ color: 'text.secondary', fontWeight: 700 }}>Submitted On</TableCell>
                <TableCell sx={{ color: 'text.secondary', fontWeight: 700, textAlign: 'right' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {records.map((r) => (
                <TableRow key={r.id} sx={{ '&:hover': { bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#1E293B' : '#F1F5F9') } }}>
                  <TableCell sx={{ color: 'text.secondary', fontFamily: 'monospace' }}>
                    {r.id.substring(0, 8)}...
                  </TableCell>
                  <TableCell sx={{ color: 'text.primary', fontWeight: 600 }}>{r.entered_name}</TableCell>
                  <TableCell>
                    {isAdmin ? (
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 700,
                          color: r.fraud_score <= 30 ? '#10B981' : r.fraud_score > 70 ? '#EF4444' : '#F59E0B',
                        }}
                      >
                        {r.fraud_score.toFixed(1)}% ({r.risk_level})
                      </Typography>
                    ) : (
                      <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                        {r.status === 'UNDER_REVIEW' ? 'Under Compliance Audit' : r.status === 'APPROVED' ? 'Verification Passed' : 'Audit Concluded'}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={r.status} />
                  </TableCell>
                  <TableCell sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>
                    {new Date(r.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell sx={{ textAlign: 'right' }}>
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Button
                        size="small"
                        variant="outlined"
                        color="inherit"
                        startIcon={<ViewIcon />}
                        onClick={() => setSelectedRecord(r)}
                      >
                        Details
                      </Button>
                      {isAdmin && (
                        <Button
                          size="small"
                          variant="outlined"
                          color="secondary"
                          startIcon={<AdminIcon />}
                          onClick={() => navigate(`/admin/review/${r.id}`)}
                        >
                          Audit
                        </Button>
                      )}
                      <Button
                        size="small"
                        variant="contained"
                        color="secondary"
                        startIcon={<PdfIcon />}
                        onClick={() => downloadReport(r.id)}
                      >
                        PDF
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Review Details Dialog */}
      {selectedRecord && (
        <Dialog
          open={Boolean(selectedRecord)}
          onClose={() => setSelectedRecord(null)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: { bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', color: 'text.primary' },
          }}
        >
          <DialogTitle sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                {isAdmin ? 'Verification & Compliance Audit Summary' : 'Application Status Details'}
              </Typography>
              <StatusBadge status={selectedRecord.status} />
            </Box>
          </DialogTitle>
          <DialogContent sx={{ py: 3 }}>
            <Stack spacing={3}>
              {/* Section 1: Admin-Only Deep-Dive AI Model Review */}
              {isAdmin ? (
                <Paper sx={{ p: 2.5, bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#0F172A' : '#F8FAFC'), border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                  <Typography variant="subtitle2" sx={{ color: '#0284C7', fontWeight: 700, mb: 1.5 }}>
                    🤖 1. Automated AI Model Review (Admin / Reviewer Only)
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 2 }}>
                    <Box>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>Fraud Probability</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: selectedRecord.fraud_score <= 30 ? '#10B981' : '#EF4444' }}>
                        {selectedRecord.fraud_score.toFixed(1)}%
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>Trust & Authenticity</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#10B981' }}>
                        {selectedRecord.trust_score.toFixed(1)}%
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>Face Match</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                        {selectedRecord.face_score.toFixed(1)}%
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>Data Consistency</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                        {selectedRecord.consistency_score.toFixed(1)}%
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              ) : (
                <Paper sx={{ p: 2.5, bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#0F172A' : '#F8FAFC'), border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                  <Typography variant="subtitle2" sx={{ color: 'primary.main', fontWeight: 700, mb: 1.5 }}>
                    📋 1. Submission Overview
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 2 }}>
                    <Box>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>KYC Reference ID</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: 'monospace' }}>
                        {selectedRecord.id}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>Applicant Full Name</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {selectedRecord.entered_name}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>Submitted On</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {new Date(selectedRecord.created_at).toLocaleString()}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              )}

              {/* Section 2: Compliance Officer Decision */}
              <Paper sx={{ p: 2.5, bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#0F172A' : '#F8FAFC'), border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                <Typography variant="subtitle2" sx={{ color: '#8B5CF6', fontWeight: 700, mb: 1.5 }}>
                  🛡️ 2. Official Compliance Status
                </Typography>
                <Stack spacing={1.5}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>Decision:</Typography>
                    <Chip
                      label={selectedRecord.status}
                      size="small"
                      color={
                        selectedRecord.status === 'APPROVED'
                          ? 'success'
                          : selectedRecord.status === 'REJECTED'
                          ? 'error'
                          : 'warning'
                      }
                      sx={{ fontWeight: 700 }}
                    />
                  </Box>
                  {selectedRecord.reviewer_name && (
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Audited By: <strong style={{ color: 'inherit' }}>{selectedRecord.reviewer_name}</strong>
                    </Typography>
                  )}
                  {selectedRecord.reviewed_at && (
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Decision Date: <strong style={{ color: 'inherit' }}>{new Date(selectedRecord.reviewed_at).toLocaleString()}</strong>
                    </Typography>
                  )}
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>
                      Review Notes & Instructions:
                    </Typography>
                    <Paper sx={{ p: 1.5, bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#1E293B' : '#EDF2F7'), borderRadius: 1 }}>
                      <Typography variant="body2" sx={{ color: 'text.primary', fontStyle: selectedRecord.review_notes ? 'normal' : 'italic' }}>
                        {selectedRecord.review_notes || 'Your application is currently in the compliance review queue. No action required.'}
                      </Typography>
                    </Paper>
                  </Box>
                </Stack>
              </Paper>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2.5, borderTop: '1px solid', borderColor: 'divider' }}>
            {isAdmin && (
              <Button
                variant="outlined"
                color="secondary"
                startIcon={<AdminIcon />}
                onClick={() => navigate(`/admin/review/${selectedRecord.id}`)}
              >
                Open Admin Audit Console
              </Button>
            )}
            <Button onClick={() => setSelectedRecord(null)} color="inherit">
              Close
            </Button>
            <Button
              variant="contained"
              color="secondary"
              startIcon={<PdfIcon />}
              onClick={() => downloadReport(selectedRecord.id)}
            >
              Download PDF Slip
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Container>
  );
};

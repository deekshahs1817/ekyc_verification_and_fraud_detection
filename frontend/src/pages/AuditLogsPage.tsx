import React, { useEffect, useState } from 'react';
import {
  Container,
  Paper,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  CircularProgress,
} from '@mui/material';
import { Refresh as RefreshIcon, History as HistoryIcon } from '@mui/icons-material';
import { adminApi, AuditLog } from '../api/adminApi';

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getAuditLogs(100);
      setLogs(data);
    } catch (err) {
      console.error('Failed to load audit logs', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <Container maxWidth="xl" sx={{ py: 5 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <HistoryIcon sx={{ color: '#3B82F6', fontSize: 36 }} />
            Regulatory Compliance Audit Trail
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Immutable records of all logins, submissions, AI pipeline scores, and officer decisions
          </Typography>
        </Box>
        <Button variant="outlined" color="inherit" startIcon={<RefreshIcon />} onClick={fetchLogs}>
          Refresh Trail
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <CircularProgress color="primary" />
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
          <Table size="small">
            <TableHead sx={{ bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#0F172A' : '#F8FAFC') }}>
              <TableRow>
                <TableCell sx={{ color: 'text.secondary', fontWeight: 700 }}>Timestamp</TableCell>
                <TableCell sx={{ color: 'text.secondary', fontWeight: 700 }}>Action Event</TableCell>
                <TableCell sx={{ color: 'text.secondary', fontWeight: 700 }}>User / Officer Email</TableCell>
                <TableCell sx={{ color: 'text.secondary', fontWeight: 700 }}>IP Address</TableCell>
                <TableCell sx={{ color: 'text.secondary', fontWeight: 700 }}>Payload Metadata</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id} sx={{ '&:hover': { bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#1E293B' : '#F1F5F9') } }}>
                  <TableCell sx={{ color: 'text.secondary', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                    {new Date(log.timestamp).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={log.action}
                      size="small"
                      color={
                        log.action.includes('APPROVED')
                          ? 'success'
                          : log.action.includes('REJECTED')
                          ? 'error'
                          : log.action.includes('SUBMITTED')
                          ? 'info'
                          : 'default'
                      }
                      sx={{ fontWeight: 700, fontSize: '0.7rem' }}
                    />
                  </TableCell>
                  <TableCell sx={{ color: 'text.primary', fontWeight: 600 }}>
                    {log.user_email || log.user_id || 'System Engine'}
                  </TableCell>
                  <TableCell sx={{ color: 'text.secondary', fontFamily: 'monospace' }}>
                    {log.ip_address || '127.0.0.1'}
                  </TableCell>
                  <TableCell sx={{ color: 'text.secondary', fontFamily: 'monospace', fontSize: '0.75rem' }}>
                    {JSON.stringify(log.payload)}
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

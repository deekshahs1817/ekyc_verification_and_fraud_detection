import React from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
  Box,
} from '@mui/material';
import { CheckCircle as CheckIcon, Cancel as CrossIcon, InfoOutlined as InfoIcon } from '@mui/icons-material';
import { KYCRecord } from '../../api/kycApi';

interface SideBySideInspectorProps {
  record: KYCRecord;
}

export const SideBySideInspector: React.FC<SideBySideInspectorProps> = ({ record }) => {
  // Normalize comparisons
  const cleanEnteredAadhaar = (record.entered_aadhaar || '').replace(/[\s-]/g, '');
  const cleanOcrAadhaar = (record.ocr_aadhaar || '').replace(/[\s-]/g, '');
  const isAadhaarMatching = cleanEnteredAadhaar && cleanOcrAadhaar && cleanEnteredAadhaar === cleanOcrAadhaar;

  const cleanEnteredPan = (record.entered_pan || '').trim().toUpperCase();
  const cleanOcrPan = (record.ocr_pan || '').trim().toUpperCase();
  const isPanMatching = cleanEnteredPan && cleanOcrPan && cleanEnteredPan === cleanOcrPan;

  const hasOcrPhone = !!record.ocr_phone && record.ocr_phone !== 'N/A';

  const comparisonRows = [
    {
      field: 'Full Name',
      entered: record.entered_name || 'N/A',
      ocr: record.ocr_name || 'N/A',
      status: record.name_similarity >= 80 ? (
        <Chip
          icon={<CheckIcon />}
          label={`MATCH (${record.name_similarity.toFixed(1)}% Sim)`}
          color="success"
          size="small"
        />
      ) : (
        <Chip
          icon={<CrossIcon />}
          label={`MISMATCH (${record.name_similarity.toFixed(1)}% Sim)`}
          color="error"
          size="small"
        />
      ),
    },
    {
      field: 'Date of Birth / Year',
      entered: record.entered_dob || 'N/A',
      ocr: record.ocr_dob || 'N/A',
      status: record.dob_match ? (
        <Chip icon={<CheckIcon />} label="MATCH" color="success" size="small" />
      ) : (
        <Chip icon={<CrossIcon />} label="MISMATCH" color="error" size="small" />
      ),
    },
    {
      field: 'Aadhaar Number',
      entered: record.entered_aadhaar || 'N/A',
      ocr: record.ocr_aadhaar || 'N/A',
      status: isAadhaarMatching ? (
        <Chip
          icon={<CheckIcon />}
          label={record.aadhaar_checksum_valid ? 'MATCH (VERHOEFF VALID)' : 'MATCH (CHECKSUM FAIL)'}
          color={record.aadhaar_checksum_valid ? 'success' : 'error'}
          size="small"
        />
      ) : (
        <Chip
          icon={<CrossIcon />}
          label="MISMATCH"
          color="error"
          size="small"
        />
      ),
    },
    {
      field: 'PAN Number (Optional)',
      entered: record.entered_pan || 'Not Provided',
      ocr: record.ocr_pan || 'Not on ID',
      status: !record.entered_pan ? (
        <Chip icon={<InfoIcon />} label="NOT PROVIDED" color="default" size="small" />
      ) : !record.ocr_pan ? (
        <Chip icon={<InfoIcon />} label="NOT ON ID CARD" color="default" size="small" />
      ) : isPanMatching ? (
        <Chip
          icon={<CheckIcon />}
          label={record.pan_format_valid ? 'MATCH (SYNTAX VALID)' : 'MATCH (INVALID SYNTAX)'}
          color={record.pan_format_valid ? 'success' : 'error'}
          size="small"
        />
      ) : (
        <Chip
          icon={<CrossIcon />}
          label="MISMATCH"
          color="error"
          size="small"
        />
      ),
    },
    {
      field: 'Phone Number (Optional)',
      entered: record.entered_phone || 'Not Provided',
      ocr: record.ocr_phone || 'Not on ID',
      status: !record.entered_phone ? (
        <Chip icon={<InfoIcon />} label="NOT PROVIDED" color="default" size="small" />
      ) : !hasOcrPhone ? (
        <Chip icon={<InfoIcon />} label="NOT ON ID CARD" color="default" size="small" />
      ) : record.phone_match ? (
        <Chip icon={<CheckIcon />} label="MATCH" color="success" size="small" />
      ) : (
        <Chip icon={<CrossIcon />} label="MISMATCH" color="error" size="small" />
      ),
    },
    {
      field: 'Residential Address (Optional)',
      entered: record.entered_address || 'Not Provided',
      ocr: record.ocr_address || 'Not on ID',
      status: !record.entered_address ? (
        <Chip icon={<InfoIcon />} label="NOT PROVIDED" color="default" size="small" />
      ) : !record.ocr_address ? (
        <Chip icon={<InfoIcon />} label="NOT ON ID CARD" color="default" size="small" />
      ) : record.address_similarity >= 70 ? (
        <Chip
          icon={<CheckIcon />}
          label={`MATCH (${record.address_similarity.toFixed(1)}% Sim)`}
          color="success"
          size="small"
        />
      ) : (
        <Chip
          icon={<CrossIcon />}
          label={`MISMATCH (${record.address_similarity.toFixed(1)}% Sim)`}
          color="error"
          size="small"
        />
      ),
    },
  ];

  return (
    <TableContainer component={Paper} sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
      <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary' }}>
          Form Ground Truth vs OCR Cross-Verification
        </Typography>
        <Chip
          label={`Overall Consistency: ${record.consistency_score.toFixed(1)}%`}
          color={record.consistency_score >= 75 ? 'success' : record.consistency_score >= 50 ? 'warning' : 'error'}
          sx={{ fontWeight: 700 }}
        />
      </Box>
      <Table size="small">
        <TableHead sx={{ bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#0F172A' : '#F8FAFC') }}>
          <TableRow>
            <TableCell sx={{ color: 'text.secondary', fontWeight: 700, width: '20%' }}>Identity Field</TableCell>
            <TableCell sx={{ color: 'text.secondary', fontWeight: 700, width: '35%' }}>Applicant Form Entry</TableCell>
            <TableCell sx={{ color: 'text.secondary', fontWeight: 700, width: '30%' }}>OCR Extracted Value</TableCell>
            <TableCell sx={{ color: 'text.secondary', fontWeight: 700, width: '15%' }}>Cross-Match Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {comparisonRows.map((row) => (
            <TableRow key={row.field} sx={{ '&:hover': { bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#1E293B' : '#F1F5F9') } }}>
              <TableCell sx={{ color: 'text.primary', fontWeight: 600 }}>{row.field}</TableCell>
              <TableCell sx={{ color: 'text.primary' }}>{row.entered}</TableCell>
              <TableCell sx={{ color: 'text.secondary', fontFamily: 'monospace' }}>{row.ocr}</TableCell>
              <TableCell>{row.status}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

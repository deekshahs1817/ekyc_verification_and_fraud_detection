import React, { useState } from 'react';
import {
  Paper,
  Box,
  Typography,
  Grid,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stack,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Badge as AadhaarIcon,
  CreditCard as PanIcon,
  ReceiptLong as UtilityIcon,
  CheckCircle as CheckIcon,
  InfoOutlined as InfoIcon,
} from '@mui/icons-material';
import { KYCRecord } from '../../api/kycApi';

interface OCRExtractionPanelsProps {
  record: KYCRecord;
}

export const OCRExtractionPanels: React.FC<OCRExtractionPanelsProps> = ({ record }) => {
  const [expandedDoc, setExpandedDoc] = useState<string | false>(false);

  const handleAccordionChange = (panel: string) => (_: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedDoc(isExpanded ? panel : false);
  };

  // Helper to extract specific OCR details from record.ocr_details or fallback to raw_text
  const aadhaarDetails = record.ocr_details?.aadhaar;
  const panDetails = record.ocr_details?.pan;
  const utilityDetails = record.ocr_details?.utility;

  // Fallbacks from main record if ocr_details not yet populated
  const hasAadhaar = !!record.aadhaar_path || !!record.ocr_aadhaar || !!aadhaarDetails?.uploaded;
  const hasPan = !!record.pan_path || !!record.ocr_pan || !!panDetails?.uploaded;
  const hasUtility = !!record.utility_path || !!utilityDetails?.uploaded;

  // Parse raw text sections if ocr_details was not populated in legacy records
  const rawText = record.ocr_raw_text || '';
  const aadhaarRaw = aadhaarDetails?.raw_text || (rawText.includes('--- AADHAAR OCR ---') ? rawText.split('--- AADHAAR OCR ---')[1]?.split('---')[0]?.trim() : (hasAadhaar ? rawText : ''));
  const panRaw = panDetails?.raw_text || (rawText.includes('--- PAN OCR ---') ? rawText.split('--- PAN OCR ---')[1]?.split('---')[0]?.trim() : (hasPan && !hasAadhaar ? rawText : ''));
  const utilityRaw = utilityDetails?.raw_text || (rawText.includes('--- UTILITY') ? rawText.split('--- UTILITY')[1]?.split('---')[0]?.trim() : '');

  const formatAadhaar = (val?: string) => {
    if (!val) return 'Not Extracted';
    const clean = val.replace(/\s/g, '');
    if (clean.length === 12) {
      return `${clean.slice(0, 4)} ${clean.slice(4, 8)} ${clean.slice(8, 12)}`;
    }
    return val;
  };

  return (
    <Paper sx={{ p: 3, mb: 4, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5, flexWrap: 'wrap', gap: 1 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary', display: 'flex', alignItems: 'center', gap: 1 }}>
            Multi-Document OCR Extraction Feeds
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Raw OCR parsing & entity extraction segregated by document type before AI verification scoring
          </Typography>
        </Box>
        <Chip
          label="Pre-Verification Raw OCR Feed"
          size="small"
          sx={{ bgcolor: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6', border: '1px solid #3B82F6', fontWeight: 700 }}
        />
      </Box>

      <Grid container spacing={2.5}>
        {/* 1. AADHAAR OCR PANEL */}
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 2.5,
              height: '100%',
              bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#0F172A' : '#F8FAFC'),
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AadhaarIcon sx={{ color: '#0284C7', fontSize: 24 }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary' }}>
                    Aadhaar Card OCR
                  </Typography>
                </Box>
                <Chip
                  icon={hasAadhaar ? <CheckIcon /> : <InfoIcon />}
                  label={hasAadhaar ? 'Extracted' : 'Not Uploaded'}
                  color={hasAadhaar ? 'success' : 'default'}
                  size="small"
                />
              </Box>

              {hasAadhaar ? (
                <Stack spacing={1.5}>
                  <Box>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontWeight: 600 }}>
                      AADHAAR NUMBER
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 700, letterSpacing: 1 }}>
                      {formatAadhaar(aadhaarDetails?.fields?.aadhaar || record.ocr_aadhaar)}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontWeight: 600 }}>
                      NAME ON AADHAAR
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 600 }}>
                      {aadhaarDetails?.fields?.name || record.ocr_name || 'Not Extracted'}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontWeight: 600 }}>
                      DOB / YEAR OF BIRTH
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.primary' }}>
                      {aadhaarDetails?.fields?.dob || record.ocr_dob || 'Not Extracted'}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontWeight: 600 }}>
                      EXTRACTED ADDRESS
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.82rem', maxHeight: 60, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {aadhaarDetails?.fields?.address || record.ocr_address || 'Not present on front face'}
                    </Typography>
                  </Box>
                </Stack>
              ) : (
                <Typography variant="body2" sx={{ color: 'text.secondary', py: 4, textAlign: 'center' }}>
                  No Aadhaar card document provided in this verification.
                </Typography>
              )}
            </Box>

            {hasAadhaar && (
              <Accordion
                expanded={expandedDoc === 'aadhaar'}
                onChange={handleAccordionChange('aadhaar')}
                sx={{
                  mt: 2,
                  bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#1E293B' : '#EDF2F7'),
                  '&:before': { display: 'none' },
                  borderRadius: 1,
                }}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: 'text.secondary' }} />}>
                  <Typography variant="caption" sx={{ color: 'text.primary', fontWeight: 700 }}>
                    View Raw Aadhaar OCR Text
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ pt: 0 }}>
                  <Box
                    component="pre"
                    sx={{
                      p: 1.5,
                      bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#0B0F19' : '#FFFFFF'),
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                      color: (theme) => (theme.palette.mode === 'dark' ? '#A5B4FC' : '#1E293B'),
                      fontSize: '0.75rem',
                      fontFamily: 'monospace',
                      maxHeight: 180,
                      overflowY: 'auto',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      m: 0,
                    }}
                  >
                    {aadhaarRaw || 'No raw lines recorded'}
                  </Box>
                </AccordionDetails>
              </Accordion>
            )}
          </Paper>
        </Grid>

        {/* 2. PAN CARD OCR PANEL */}
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 2.5,
              height: '100%',
              bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#0F172A' : '#F8FAFC'),
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PanIcon sx={{ color: '#D97706', fontSize: 24 }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary' }}>
                    PAN Card OCR
                  </Typography>
                </Box>
                <Chip
                  icon={hasPan ? <CheckIcon /> : <InfoIcon />}
                  label={hasPan ? 'Extracted' : 'Not Uploaded'}
                  color={hasPan ? 'success' : 'default'}
                  size="small"
                />
              </Box>

              {hasPan ? (
                <Stack spacing={1.5}>
                  <Box>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontWeight: 600 }}>
                      PAN NUMBER
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 700, letterSpacing: 1 }}>
                        {panDetails?.fields?.pan || record.ocr_pan || 'Not Extracted'}
                      </Typography>
                      {record.pan_format_valid && (
                        <Chip label="Syntax Valid" size="small" color="success" sx={{ height: 18, fontSize: '0.65rem' }} />
                      )}
                    </Box>
                  </Box>

                  <Box>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontWeight: 600 }}>
                      NAME ON PAN
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 600 }}>
                      {panDetails?.fields?.name || record.ocr_name || 'Not Extracted'}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontWeight: 600 }}>
                      DATE OF BIRTH
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.primary' }}>
                      {panDetails?.fields?.dob || record.ocr_dob || 'Not Extracted'}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontWeight: 600 }}>
                      ENTITY TYPE & DEPARTMENT
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.82rem' }}>
                      Individual [P] • Income Tax Department Govt. of India
                    </Typography>
                  </Box>
                </Stack>
              ) : (
                <Typography variant="body2" sx={{ color: 'text.secondary', py: 4, textAlign: 'center' }}>
                  No PAN card document provided in this verification.
                </Typography>
              )}
            </Box>

            {hasPan && (
              <Accordion
                expanded={expandedDoc === 'pan'}
                onChange={handleAccordionChange('pan')}
                sx={{
                  mt: 2,
                  bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#1E293B' : '#EDF2F7'),
                  '&:before': { display: 'none' },
                  borderRadius: 1,
                }}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: 'text.secondary' }} />}>
                  <Typography variant="caption" sx={{ color: 'text.primary', fontWeight: 700 }}>
                    View Raw PAN OCR Text
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ pt: 0 }}>
                  <Box
                    component="pre"
                    sx={{
                      p: 1.5,
                      bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#0B0F19' : '#FFFFFF'),
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                      color: (theme) => (theme.palette.mode === 'dark' ? '#FDE68A' : '#92400E'),
                      fontSize: '0.75rem',
                      fontFamily: 'monospace',
                      maxHeight: 180,
                      overflowY: 'auto',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      m: 0,
                    }}
                  >
                    {panRaw || 'No raw lines recorded'}
                  </Box>
                </AccordionDetails>
              </Accordion>
            )}
          </Paper>
        </Grid>

        {/* 3. UTILITY / OTHER DOCUMENT OCR PANEL */}
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 2.5,
              height: '100%',
              bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#0F172A' : '#F8FAFC'),
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <UtilityIcon sx={{ color: '#059669', fontSize: 24 }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary' }}>
                    Utility / Other OCR
                  </Typography>
                </Box>
                <Chip
                  icon={hasUtility ? <CheckIcon /> : <InfoIcon />}
                  label={hasUtility ? 'Extracted' : 'Not Uploaded'}
                  color={hasUtility ? 'success' : 'default'}
                  size="small"
                />
              </Box>

              {hasUtility ? (
                <Stack spacing={1.5}>
                  <Box>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontWeight: 600 }}>
                      DOCUMENT TYPE
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 600 }}>
                      Electricity / Utility Proof
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontWeight: 600 }}>
                      CONSUMER / HOLDER NAME
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 600 }}>
                      {utilityDetails?.fields?.name || record.ocr_name || 'Not Extracted'}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontWeight: 600 }}>
                      SERVICE ADDRESS PROOF
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.82rem' }}>
                      {utilityDetails?.fields?.address || record.ocr_address || 'Address line extracted from utility proof'}
                    </Typography>
                  </Box>
                </Stack>
              ) : (
                <Typography variant="body2" sx={{ color: 'text.secondary', py: 4, textAlign: 'center' }}>
                  No secondary utility bill or address document uploaded.
                </Typography>
              )}
            </Box>

            {hasUtility && (
              <Accordion
                expanded={expandedDoc === 'utility'}
                onChange={handleAccordionChange('utility')}
                sx={{
                  mt: 2,
                  bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#1E293B' : '#EDF2F7'),
                  '&:before': { display: 'none' },
                  borderRadius: 1,
                }}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: 'text.secondary' }} />}>
                  <Typography variant="caption" sx={{ color: 'text.primary', fontWeight: 700 }}>
                    View Raw Utility OCR Text
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ pt: 0 }}>
                  <Box
                    component="pre"
                    sx={{
                      p: 1.5,
                      bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#0B0F19' : '#FFFFFF'),
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                      color: (theme) => (theme.palette.mode === 'dark' ? '#86EFAC' : '#166534'),
                      fontSize: '0.75rem',
                      fontFamily: 'monospace',
                      maxHeight: 180,
                      overflowY: 'auto',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      m: 0,
                    }}
                  >
                    {utilityRaw || 'No raw lines recorded'}
                  </Box>
                </AccordionDetails>
              </Accordion>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Paper>
  );
};

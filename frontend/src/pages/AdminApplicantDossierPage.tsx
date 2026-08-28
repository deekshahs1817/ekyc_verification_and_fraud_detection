import React, { useEffect, useState } from 'react';
import {
  Container,
  Paper,
  Box,
  Typography,
  Grid,
  Button,
  Divider,
  CircularProgress,
  Stack,
  Card,
  CardMedia,
  CardContent,
  Tabs,
  Tab,
  Dialog,
  IconButton,
  Alert,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Psychology as InspectIcon,
  PictureAsPdf as PdfIcon,
  Person as PersonIcon,
  Fingerprint as AadhaarIcon,
  CreditCard as PanIcon,
  Face as FaceIcon,
  Receipt as UtilityIcon,
  Close as CloseIcon,
  ZoomIn as ZoomIcon,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { kycApi, KYCRecord } from '../api/kycApi';
import { StatusBadge } from '../components/common/StatusBadge';
import { RiskScoreGauge } from '../components/common/RiskScoreGauge';
import { SideBySideInspector } from '../components/admin/SideBySideInspector';
import { XAIRiskBreakdown } from '../components/admin/XAIRiskBreakdown';
import { API_BASE_URL, STATIC_BASE_URL } from '../api/client';

export const AdminApplicantDossierPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [record, setRecord] = useState<KYCRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeDocTab, setActiveDocTab] = useState(0);
  const [zoomImage, setZoomImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecord = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const data = await kycApi.getRecordById(id);
        setRecord(data);
      } catch (err) {
        console.error('Failed to load applicant dossier', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecord();
  }, [id]);

  const getMediaUrl = (filePath?: string) => {
    if (!filePath) return undefined;
    const normalized = filePath.replace(/\\/g, '/');
    const idx = normalized.indexOf('uploads/');
    if (idx !== -1) {
      return `${STATIC_BASE_URL}/${normalized.substring(idx)}`;
    }
    return undefined;
  };

  const downloadPdfReport = () => {
    if (record) {
      const token = localStorage.getItem('ekyc_token') || '';
      window.open(`${API_BASE_URL}/reports/download/${record.id}?token=${encodeURIComponent(token)}`, '_blank');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  if (!record) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <Paper sx={{ p: 6, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
            Applicant Record Not Found
          </Typography>
          <Button variant="contained" startIcon={<BackIcon />} onClick={() => navigate('/admin')}>
            Return to Dashboard
          </Button>
        </Paper>
      </Container>
    );
  }

  const aadhaarUrl = getMediaUrl(record.aadhaar_path);
  const panUrl = getMediaUrl(record.pan_path);
  const selfieUrl = getMediaUrl(record.selfie_path);
  const utilityUrl = getMediaUrl(record.utility_path);

  const docList = [
    { label: 'Aadhaar Card', icon: <AadhaarIcon sx={{ fontSize: 18 }} />, url: aadhaarUrl, desc: 'Official Aadhaar Identification Document' },
    { label: 'PAN Card', icon: <PanIcon sx={{ fontSize: 18 }} />, url: panUrl, desc: 'Income Tax Department PAN Card' },
    { label: 'Live Selfie', icon: <FaceIcon sx={{ fontSize: 18 }} />, url: selfieUrl, desc: 'Live Biometric Capture via Device Camera' },
    ...(utilityUrl ? [{ label: 'Utility Bill', icon: <UtilityIcon sx={{ fontSize: 18 }} />, url: utilityUrl, desc: 'Address Verification Proof' }] : []),
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Top Breadcrumb & Actions Bar */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Button
          variant="outlined"
          color="inherit"
          startIcon={<BackIcon />}
          onClick={() => navigate('/admin')}
          sx={{ fontWeight: 600 }}
        >
          Back to Admin Queue
        </Button>

        <Stack direction="row" spacing={1.5}>
          <Button
            variant="outlined"
            color="secondary"
            startIcon={<PdfIcon />}
            onClick={downloadPdfReport}
            sx={{ fontWeight: 700 }}
          >
            Download Audit PDF
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<InspectIcon />}
            onClick={() => navigate(`/admin/review/${record.id}`)}
            sx={{ fontWeight: 800, px: 3, boxShadow: '0 4px 14px rgba(59, 130, 246, 0.4)' }}
          >
            Launch Interactive AI Forensic Inspector
          </Button>
        </Stack>
      </Box>

      {/* Main Stack of Exact Requested Info */}
      <Stack spacing={3.5}>
        {/* 1. Executive Verdict Card */}
        <Paper
          elevation={0}
          sx={{
            p: 4,
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 3.5,
            boxShadow: (theme) =>
              theme.palette.mode === 'dark'
                ? '0 8px 30px rgba(0, 0, 0, 0.4)'
                : '0 8px 24px rgba(0, 0, 0, 0.04)',
          }}
        >
          {/* Submission Info Alert Banner */}
          <Alert
            severity="info"
            sx={{
              mb: 3,
              bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(59, 130, 246, 0.15)' : '#EFF6FF'),
              color: (theme) => (theme.palette.mode === 'dark' ? '#93C5FD' : '#1D4ED8'),
              border: '1px solid',
              borderColor: 'divider',
              fontSize: '0.95rem',
            }}
          >
            <strong>Application Submitted Successfully:</strong> Your identity documents and information have been analyzed by the AI pipeline and forwarded to the Compliance Admin for final review.
          </Alert>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2, mb: 3 }}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
                <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary' }}>
                  Application Status: Under Review
                </Typography>
                <StatusBadge status={record.status} size="medium" />
              </Box>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                KYC Reference ID: <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{record.id}</span> | Awaiting Officer Decision
              </Typography>
            </Box>

            <Stack direction="row" spacing={1.5}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<InspectIcon />}
                onClick={() => navigate(`/admin/review/${record.id}`)}
                sx={{ fontWeight: 700 }}
              >
                Inspect & Decide
              </Button>
            </Stack>
          </Box>

          {/* The 4 Exact Risk Gauges */}
          <Grid container spacing={3} sx={{ my: 1 }}>
            <Grid item xs={12} sm={6} md={3}>
              <RiskScoreGauge score={record.fraud_score} title="Fraud Probability" type="fraud" />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <RiskScoreGauge score={record.trust_score} title="Trust & Authenticity" type="trust" />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <RiskScoreGauge score={record.face_score} title="Biometric Face Match" type="trust" />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <RiskScoreGauge score={record.tamper_score} title="Tamper / Manipulation" type="fraud" />
            </Grid>
          </Grid>
        </Paper>

        {/* 2. Side-by-Side Form Ground Truth vs OCR Cross-Verification */}
        <SideBySideInspector record={record} />

        {/* 3. Explainable AI (XAI) Risk Factors & Attribution */}
        <XAIRiskBreakdown
          factors={record.xai_risk_factors}
          amlFlag={record.aml_flag}
          amlReasons={record.aml_reasons}
        />

        {/* 4. Applicant Identity & Submitted Document Dossier */}
        <Grid container spacing={3}>
          {/* Identity & Demographics Box */}
          <Grid item xs={12} lg={6}>
            <Paper sx={{ p: 3.5, height: '100%', bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <PersonIcon sx={{ color: 'primary.main', fontSize: 24 }} />
                <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary' }}>
                  Applicant Profile & Ground Truth
                </Typography>
              </Box>
              <Divider sx={{ mb: 2.5 }} />

              <Grid container spacing={2.5}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                    Official Legal Name
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 700, color: 'text.primary', mt: 0.3 }}>
                    {record.entered_name}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                    Verified Email
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, color: 'text.primary', mt: 0.3 }}>
                    {record.entered_email}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                    Date of Birth
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, color: 'text.primary', mt: 0.3 }}>
                    {record.entered_dob || 'Not Provided'}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                    Gender
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, color: 'text.primary', mt: 0.3 }}>
                    {record.entered_gender || 'Not Specified'}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                    Aadhaar Number
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 700, fontFamily: 'monospace', color: 'primary.main', mt: 0.3 }}>
                    {record.entered_aadhaar}
                  </Typography>
                  <Typography variant="caption" sx={{ color: record.aadhaar_checksum_valid ? 'success.main' : 'error.main', fontWeight: 700 }}>
                    {record.aadhaar_checksum_valid ? '✓ Verhoeff Valid' : '✗ Verhoeff Failed'}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                    PAN Number
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 700, fontFamily: 'monospace', color: 'text.primary', mt: 0.3 }}>
                    {record.entered_pan || 'None Provided'}
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                    Residential Address
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, color: 'text.primary', mt: 0.3 }}>
                    {record.entered_address || 'No Address Provided'}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                    Occupation
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, color: 'text.primary', mt: 0.3 }}>
                    {record.entered_occupation || 'Employed'}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                    Annual Income Bracket
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, color: 'text.primary', mt: 0.3 }}>
                    {record.entered_annual_income || 'Not Stated'}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Submitted Document Previews */}
          <Grid item xs={12} lg={6}>
            <Paper sx={{ p: 3.5, height: '100%', bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary' }}>
                  Submitted Identity Documents
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Click image to expand
                </Typography>
              </Box>

              <Tabs
                value={activeDocTab}
                onChange={(_, v) => setActiveDocTab(v)}
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                  mb: 2.5,
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  '& .MuiTab-root': { fontWeight: 700, fontSize: '0.85rem' },
                }}
              >
                {docList.map((doc, idx) => (
                  <Tab key={idx} icon={doc.icon} iconPosition="start" label={doc.label} />
                ))}
              </Tabs>

              {docList[activeDocTab] && (
                <Card
                  elevation={0}
                  sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2.5,
                    bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#0B0F19' : '#F8FAFC'),
                    overflow: 'hidden',
                  }}
                >
                  <Box sx={{ position: 'relative', bgcolor: '#000', minHeight: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {docList[activeDocTab].url ? (
                      <CardMedia
                        component="img"
                        image={docList[activeDocTab].url}
                        alt={docList[activeDocTab].label}
                        sx={{
                          maxHeight: 360,
                          width: 'auto',
                          maxWidth: '100%',
                          objectFit: 'contain',
                          cursor: 'pointer',
                        }}
                        onClick={() => setZoomImage(docList[activeDocTab].url || null)}
                      />
                    ) : (
                      <Box sx={{ p: 4, textAlign: 'center', color: '#64748B' }}>
                        <Typography variant="body2">No file uploaded for this document type.</Typography>
                      </Box>
                    )}

                    {docList[activeDocTab].url && (
                      <IconButton
                        onClick={() => setZoomImage(docList[activeDocTab].url || null)}
                        sx={{
                          position: 'absolute',
                          top: 10,
                          right: 10,
                          bgcolor: 'rgba(0,0,0,0.6)',
                          color: '#fff',
                          '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' },
                        }}
                      >
                        <ZoomIcon />
                      </IconButton>
                    )}
                  </Box>

                  <CardContent sx={{ p: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.primary' }}>
                      {docList[activeDocTab].label}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                      {docList[activeDocTab].desc}
                    </Typography>
                  </CardContent>
                </Card>
              )}
            </Paper>
          </Grid>
        </Grid>

        {/* Bottom CTA Bar */}
        <Box
          sx={{
            p: 3,
            bgcolor: (theme) =>
              theme.palette.mode === 'dark' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)',
            border: '1px solid',
            borderColor: 'primary.main',
            borderRadius: 3,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'text.primary' }}>
              Conduct Interactive Forensic Inspection & Submit Audit Decision
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              View CNN Error Level Analysis tamper heatmaps, bounding boxes, and execute official approval or rejection.
            </Typography>
          </Box>

          <Button
            variant="contained"
            color="primary"
            size="large"
            startIcon={<InspectIcon />}
            onClick={() => navigate(`/admin/review/${record.id}`)}
            sx={{ px: 4, py: 1.3, fontWeight: 800, borderRadius: 2.5 }}
          >
            Open Decision Workbench
          </Button>
        </Box>
      </Stack>

      {/* Image Zoom Modal */}
      <Dialog
        open={Boolean(zoomImage)}
        onClose={() => setZoomImage(null)}
        maxWidth="lg"
        fullWidth
        PaperProps={{ sx: { bgcolor: '#000', overflow: 'hidden' } }}
      >
        <Box sx={{ position: 'relative', p: 1, textAlign: 'center' }}>
          <IconButton
            onClick={() => setZoomImage(null)}
            sx={{ position: 'absolute', top: 12, right: 12, color: '#fff', bgcolor: 'rgba(0,0,0,0.5)' }}
          >
            <CloseIcon />
          </IconButton>
          {zoomImage && (
            <Box
              component="img"
              src={zoomImage}
              alt="Zoomed ID Document"
              sx={{ width: 'auto', maxWidth: '100%', maxHeight: '85vh', objectFit: 'contain' }}
            />
          )}
        </Box>
      </Dialog>
    </Container>
  );
};

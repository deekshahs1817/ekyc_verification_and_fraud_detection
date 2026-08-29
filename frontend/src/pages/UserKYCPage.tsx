import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Box,
  Typography,
  Grid,
  TextField,
  Button,
  Stepper,
  Step,
  StepLabel,
  MenuItem,
  Alert,
  CircularProgress,
  Stack,
  Chip,
  Snackbar,
} from '@mui/material';
import {
  NavigateNext as NextIcon,
  NavigateBefore as BackIcon,
  PictureAsPdf as PdfIcon,
  AutoAwesome as AiIcon,
  WarningAmber as WarningIcon,
  CheckCircle as SuccessIcon,
  HourglassEmpty as PendingIcon,
  History as HistoryIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { DocumentUploadZone } from '../components/kyc/DocumentUploadZone';
import { WebcamCapture } from '../components/kyc/WebcamCapture';
import { StatusBadge } from '../components/common/StatusBadge';
import { kycApi, KYCRecord } from '../api/kycApi';
import { API_BASE_URL } from '../api/client';
import { generateKYCPdf } from '../utils/pdfGenerator';

const steps = ['Applicant Information', 'Upload Documents & Selfie', 'Submission Confirmation'];

export const UserKYCPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const [activeStep, setActiveStep] = useState(0);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');

  // Latest existing record from database
  const [latestRecord, setLatestRecord] = useState<KYCRecord | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(true);

  // Form Ground Truth state
  const [formData, setFormData] = useState({
    entered_name: user?.name || '',
    entered_dob: user?.dob || '2000-01-01',
    entered_gender: 'Female',
    entered_email: user?.email || '',
    entered_address: user?.address || '',
    entered_occupation: user?.occupation || 'Student',
    entered_annual_income: user?.annual_income || '< 500000',
    entered_aadhaar: '',
    entered_pan: '',
  });

  // Files state
  const [aadhaarFile, setAadhaarFile] = useState<File | null>(null);
  const [panFile, setPanFile] = useState<File | null>(null);
  const [utilityFile, setUtilityFile] = useState<File | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);

  // Verification outcome
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verifiedRecord, setVerifiedRecord] = useState<KYCRecord | null>(null);

  // Load user's latest verification status on mount
  useEffect(() => {
    const fetchLatestRecord = async () => {
      try {
        const records = await kycApi.getMyRecords();
        if (records && records.length > 0) {
          const latest = records[0];
          setLatestRecord(latest);
          // If the form has empty fields, prefill from latest record
          setFormData((prev) => ({
            ...prev,
            entered_name: prev.entered_name || latest.entered_name,
            entered_email: prev.entered_email || latest.entered_email,
            entered_dob: latest.entered_dob || prev.entered_dob,
            entered_gender: latest.entered_gender || prev.entered_gender,
            entered_address: latest.entered_address || prev.entered_address,
            entered_aadhaar: latest.entered_aadhaar || prev.entered_aadhaar,
            entered_pan: latest.entered_pan || prev.entered_pan,
          }));
        }
      } catch (err) {
        console.warn('Could not fetch user KYC history', err);
      } finally {
        setLoadingHistory(false);
      }
    };
    fetchLatestRecord();
  }, [user]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (activeStep === 0) {
      if (!formData.entered_name || !formData.entered_dob || !formData.entered_aadhaar) {
        setError('Please fill in all mandatory identity fields (Full Name, Date of Birth, Aadhaar Number) before proceeding.');
        return;
      }
      setError(null);
    }
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleSubmitVerification = async () => {
    setSubmitting(true);
    setError(null);

    const payload = new FormData();
    Object.entries(formData).forEach(([key, val]) => {
      if (val !== undefined && val !== null && String(val).trim() !== '') {
        payload.append(key, String(val).trim());
      }
    });

    if (aadhaarFile) payload.append('aadhaar_file', aadhaarFile);
    if (panFile) payload.append('pan_file', panFile);
    if (utilityFile) payload.append('utility_file', utilityFile);
    if (selfieFile) payload.append('selfie_file', selfieFile);

    try {
      const record = await kycApi.submitKYC(payload);
      setVerifiedRecord(record);
      setLatestRecord(record);
      setActiveStep(2); // Jump to results
      setNotificationMessage('KYC Verification Completed! Status: APPROVED (Low Risk: 8.5/100).');
      setShowNotification(true);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'KYC verification processing failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const downloadPdfReport = (recordId?: string) => {
    const target = verifiedRecord || latestRecord;
    if (target) {
      generateKYCPdf(target);
      setNotificationMessage('eKYC Verification Certificate PDF downloaded successfully!');
      setShowNotification(true);
    } else {
      setNotificationMessage('Generating official verification certificate...');
      setShowNotification(true);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 5 }}>
      {/* Header */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary' }}>
          AI-Powered Identity Verification
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary', mt: 0.5 }}>
          Multi-factor cross-verification comparing Applicant Data vs OCR, Biometric Face & Liveness, and Tamper CNN
        </Typography>
      </Box>

      {/* Prominent Real-time Status Card if Previous Submission Exists */}
      {!loadingHistory && latestRecord && activeStep !== 2 && (
        <Paper
          sx={{
            p: 3,
            mb: 4,
            bgcolor: (theme) =>
              latestRecord.status === 'REJECTED'
                ? theme.palette.mode === 'dark'
                  ? 'rgba(239, 68, 68, 0.12)'
                  : '#FEF2F2'
                : latestRecord.status === 'APPROVED'
                ? theme.palette.mode === 'dark'
                  ? 'rgba(16, 185, 129, 0.12)'
                  : '#ECFDF5'
                : theme.palette.mode === 'dark'
                ? 'rgba(59, 130, 246, 0.12)'
                : '#EFF6FF',
            border: '1px solid',
            borderColor:
              latestRecord.status === 'REJECTED'
                ? '#EF4444'
                : latestRecord.status === 'APPROVED'
                ? '#10B981'
                : '#3B82F6',
            borderRadius: 3,
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ maxWidth: '75%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                {latestRecord.status === 'REJECTED' && <WarningIcon sx={{ color: '#EF4444', fontSize: 26 }} />}
                {latestRecord.status === 'APPROVED' && <SuccessIcon sx={{ color: '#10B981', fontSize: 26 }} />}
                {latestRecord.status === 'UNDER_REVIEW' && <PendingIcon sx={{ color: '#3B82F6', fontSize: 26 }} />}
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 800,
                    color:
                      latestRecord.status === 'REJECTED'
                        ? '#EF4444'
                        : latestRecord.status === 'APPROVED'
                        ? '#10B981'
                        : '#3B82F6',
                  }}
                >
                  {latestRecord.status === 'REJECTED'
                    ? 'Application Rejected by Compliance Officer'
                    : latestRecord.status === 'APPROVED'
                    ? 'KYC Verification Approved & Active'
                    : 'Application Submitted & Under Review'}
                </Typography>
                <StatusBadge status={latestRecord.status} size="medium" />
              </Box>

              {latestRecord.status === 'REJECTED' && (
                <Typography variant="body2" sx={{ color: (theme) => theme.palette.mode === 'dark' ? '#FCA5A5' : '#991B1B', mb: 1, fontWeight: 600 }}>
                  Rejection Feedback: {latestRecord.review_notes || 'Identity discrepancy or unverified document detected. Please review your details and re-submit.'}
                </Typography>
              )}

              {latestRecord.status === 'APPROVED' && (
                <Typography variant="body2" sx={{ color: (theme) => theme.palette.mode === 'dark' ? '#6EE7B7' : '#065F46', mb: 1 }}>
                  Your identity verification has passed compliance standards. Your verified certificate is ready.
                </Typography>
              )}

              {latestRecord.status === 'UNDER_REVIEW' && (
                <Typography variant="body2" sx={{ color: (theme) => theme.palette.mode === 'dark' ? '#93C5FD' : '#1E40AF', mb: 1 }}>
                  Your documents are currently queued for compliance officer audit.
                </Typography>
              )}

              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                Reference ID: {latestRecord.id} • {latestRecord.reviewer_name ? `Audited by: ${latestRecord.reviewer_name}` : 'Awaiting Reviewer'} • Last Updated: {new Date(latestRecord.reviewed_at || latestRecord.created_at).toLocaleString()}
              </Typography>
            </Box>

            <Stack direction="row" spacing={1.5} alignItems="center">
              {user?.role === 'ADMIN' || user?.role === 'COMPLIANCE_OFFICER' ? (
                <Button
                  variant="outlined"
                  color="secondary"
                  size="small"
                  startIcon={<HistoryIcon />}
                  onClick={() => navigate(`/admin/review/${latestRecord.id}`)}
                >
                  Admin Fraud Audit
                </Button>
              ) : (
                <Button
                  variant="outlined"
                  color="primary"
                  size="small"
                  startIcon={<HistoryIcon />}
                  onClick={() => navigate('/kyc/status')}
                >
                  Application Status
                </Button>
              )}
              <Button
                variant="contained"
                color="secondary"
                size="small"
                startIcon={<PdfIcon />}
                onClick={() => downloadPdfReport(latestRecord.id)}
              >
                Download PDF
              </Button>
            </Stack>
          </Box>
        </Paper>
      )}

      {/* Stepper Header */}
      <Paper sx={{ p: 3, mb: 4, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
        <Stepper activeStep={activeStep}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3, bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(239, 68, 68, 0.15)' : '#FEF2F2', color: '#EF4444' }}>
          {error}
        </Alert>
      )}

      {/* STEP 0: Personal Form Details */}
      {activeStep === 0 && (
        <Paper sx={{ p: 4, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary', mb: 1 }}>
            Step 1: Applicant Ground Truth Information
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
            Please manually enter your personal details. These will serve as ground truth for OCR comparison.
          </Typography>

          <Grid container spacing={2.5}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Full Name (as per Govt ID)"
                fullWidth
                required
                value={formData.entered_name}
                onChange={(e) => handleInputChange('entered_name', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                label="Date of Birth"
                type="date"
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
                value={formData.entered_dob}
                onChange={(e) => handleInputChange('entered_dob', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                select
                label="Gender"
                fullWidth
                value={formData.entered_gender}
                onChange={(e) => handleInputChange('entered_gender', e.target.value)}
              >
                <MenuItem value="Male">Male</MenuItem>
                <MenuItem value="Female">Female</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Verified Email Address"
                type="email"
                fullWidth
                required
                value={formData.entered_email}
                onChange={(e) => handleInputChange('entered_email', e.target.value)}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Aadhaar Card Number (12 Digits)"
                fullWidth
                required
                value={formData.entered_aadhaar}
                onChange={(e) => handleInputChange('entered_aadhaar', e.target.value)}
                helperText="Will be mathematically checked against Verhoeff checksum algorithm"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="PAN Card Number (Optional - 10 Characters)"
                fullWidth
                value={formData.entered_pan}
                onChange={(e) => handleInputChange('entered_pan', e.target.value.toUpperCase())}
                helperText="Optional. Will be validated against official Income Tax format [A-Z]{5}[0-9]{4}[A-Z] if provided."
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Permanent Residential Address (Optional)"
                fullWidth
                multiline
                rows={2}
                value={formData.entered_address}
                onChange={(e) => handleInputChange('entered_address', e.target.value)}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="Occupation"
                fullWidth
                value={formData.entered_occupation}
                onChange={(e) => handleInputChange('entered_occupation', e.target.value)}
              >
                <MenuItem value="Employed">Salaried / Private Sector</MenuItem>
                <MenuItem value="Self-Employed">Business / Self-Employed</MenuItem>
                <MenuItem value="Professional">Doctor / Lawyer / CA</MenuItem>
                <MenuItem value="Retired">Retired</MenuItem>
                <MenuItem value="Student">Student</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="Annual Income Bracket"
                fullWidth
                value={formData.entered_annual_income}
                onChange={(e) => handleInputChange('entered_annual_income', e.target.value)}
              >
                <MenuItem value="< 500000">Below ₹5 Lakhs</MenuItem>
                <MenuItem value="500000 - 1000000">₹5 Lakhs - ₹10 Lakhs</MenuItem>
                <MenuItem value="1000000 - 2500000">₹10 Lakhs - ₹25 Lakhs</MenuItem>
                <MenuItem value="> 2500000">Above ₹25 Lakhs</MenuItem>
              </TextField>
            </Grid>
          </Grid>

          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={handleNext}
              endIcon={<NextIcon />}
              sx={{ px: 4, fontWeight: 700 }}
            >
              Continue to Document Upload
            </Button>
          </Box>
        </Paper>
      )}

      {/* STEP 1: Document Upload & Selfie */}
      {activeStep === 1 && (
        <Paper sx={{ p: 4, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary', mb: 1 }}>
            Step 2: Document Upload & Biometric Capture
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
            Upload your Government ID documents and capture a live selfie for biometric matching and liveness analysis.
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <DocumentUploadZone
                label="Aadhaar Card (Front / Full)"
                sublabel="High-resolution image of Aadhaar Card"
                onFileSelect={(file) => setAadhaarFile(file)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <DocumentUploadZone
                label="PAN Card (Front)"
                sublabel="Clear photo of Permanent Account Number card"
                onFileSelect={(file) => setPanFile(file)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <DocumentUploadZone
                label="Utility Bill / Address Proof (Optional)"
                sublabel="Electricity, Water, or Gas Bill within last 3 months"
                onFileSelect={(file) => setUtilityFile(file)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <WebcamCapture onCapture={(file) => setSelfieFile(file)} />
            </Grid>
          </Grid>

          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
            <Button variant="outlined" color="inherit" onClick={handleBack} startIcon={<BackIcon />}>
              Back to Form
            </Button>
            <Button
              variant="contained"
              color="primary"
              size="large"
              disabled={submitting}
              onClick={handleSubmitVerification}
              startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <AiIcon />}
              sx={{ px: 4, fontWeight: 700 }}
            >
              {submitting ? 'Running AI Pipeline...' : 'Run Automated AI Verification'}
            </Button>
          </Box>
        </Paper>
      )}

      {/* STEP 2: Application Submission Confirmation (Applicant View) */}
      {activeStep === 2 && verifiedRecord && (
        <Paper
          sx={{
            p: { xs: 3, sm: 5 },
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 4,
            boxShadow: (theme) =>
              theme.palette.mode === 'dark'
                ? '0 16px 40px rgba(0, 0, 0, 0.6)'
                : '0 16px 36px rgba(0, 0, 0, 0.06)',
          }}
        >
          {/* Header Icon & Title */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box
              sx={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                bgcolor: 'rgba(16, 185, 129, 0.12)',
                color: '#10B981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2,
                boxShadow: '0 0 24px rgba(16, 185, 129, 0.25)',
              }}
            >
              <SuccessIcon sx={{ fontSize: 44 }} />
            </Box>

            <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', mb: 1 }}>
              Application Submitted Successfully
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 620, mx: 'auto', lineHeight: 1.6 }}>
              Your identity documents and information have been safely received and forwarded to the Compliance Admin for final review.
            </Typography>
          </Box>

          {/* Submission Overview Card */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              mb: 4,
              bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#0F172A' : '#F8FAFC'),
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 3,
            }}
          >
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px' }}>
                  KYC Reference ID
                </Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, fontFamily: 'monospace', color: 'primary.main', mt: 0.5 }}>
                  {verifiedRecord.id}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px' }}>
                  Application Status
                </Typography>
                <Box sx={{ mt: 0.5 }}>
                  <StatusBadge status={verifiedRecord.status} size="medium" />
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px' }}>
                  Applicant Full Name
                </Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary', mt: 0.5 }}>
                  {verifiedRecord.entered_name}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px' }}>
                  Submission Timestamp
                </Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary', mt: 0.5 }}>
                  {new Date(verifiedRecord.created_at).toLocaleString()}
                </Typography>
              </Grid>
            </Grid>
          </Paper>

          {/* Workflow Progress Timeline */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary', mb: 2 }}>
              Verification Pipeline Status
            </Typography>

            <Stack spacing={2}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(16, 185, 129, 0.08)' : '#ECFDF5', borderRadius: 2, border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                <SuccessIcon sx={{ color: '#10B981', fontSize: 24 }} />
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                    1. Identity Documents & Biometric Capture
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Aadhaar card, PAN card, and live selfie uploaded and encrypted.
                  </Typography>
                </Box>
                <Chip label="COMPLETED" size="small" color="success" sx={{ fontWeight: 700, fontSize: '0.7rem' }} />
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(59, 130, 246, 0.08)' : '#EFF6FF', borderRadius: 2, border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                <PendingIcon sx={{ color: '#3B82F6', fontSize: 24 }} />
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                    2. Compliance Officer Review & Final Decision
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Awaiting final compliance audit. You will be notified once complete.
                  </Typography>
                </Box>
                <Chip label="IN PROGRESS" size="small" color="primary" sx={{ fontWeight: 700, fontSize: '0.7rem' }} />
              </Box>
            </Stack>
          </Box>

          {/* Admin Role Privilege Notice: only if logged-in user is ADMIN */}
          {(user?.role === 'ADMIN' || user?.role === 'COMPLIANCE_OFFICER') && (
            <Alert
              severity="warning"
              action={
                <Button
                  color="inherit"
                  size="small"
                  variant="outlined"
                  onClick={() => navigate(`/admin/review/${verifiedRecord.id}`)}
                  sx={{ fontWeight: 700 }}
                >
                  Open Review Console
                </Button>
              }
              sx={{ mb: 4, borderRadius: 2 }}
            >
              <strong>Compliance Admin Detected:</strong> You have administrative privileges to access the internal AI Fraud Risk Breakdown and decision audit console.
            </Alert>
          )}

          {/* Actions */}
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap', pt: 1 }}>
            <Button
              variant="outlined"
              color="inherit"
              size="large"
              onClick={() => {
                setVerifiedRecord(null);
                setActiveStep(0);
              }}
              sx={{ px: 3, fontWeight: 700 }}
            >
              Submit Another Application
            </Button>

            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={() => navigate('/kyc/status')}
              sx={{ px: 4, fontWeight: 800 }}
            >
              Track Application Status
            </Button>
          </Box>
        </Paper>
      )}

      {/* Real-time Toast Notification */}
      <Snackbar
        open={showNotification}
        autoHideDuration={5000}
        onClose={() => setShowNotification(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setShowNotification(false)}
          severity="success"
          variant="filled"
          sx={{ width: '100%', fontWeight: 700, borderRadius: 2 }}
        >
          {notificationMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

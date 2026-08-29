import React from 'react';
import {
  Container,
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  Chip,
  Stack,
} from '@mui/material';
import {
  DocumentScanner as OcrIcon,
  Face as FaceIcon,
  Visibility as LivenessIcon,
  ImageSearch as ForensicsIcon,
  ContentCopy as DuplicateIcon,
  Rule as AmlIcon,
  TrendingUp as FraudEngineIcon,
  Psychology as XaiIcon,
  AdminPanelSettings as AdminIcon,
  HowToReg as RegisterIcon,
  Login as LoginIcon,
  Code as CodeIcon,
  Storage as DatabaseIcon,
  Memory as AiIcon,
  Lock as AuthIcon,
  VerifiedUser as VerifyIcon,
  CompareArrows as MatchingIcon,
  Layers as FullStackIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

// 12 Core Features
const coreFeatures = [
  {
    icon: <AuthIcon sx={{ fontSize: 32, color: '#3B82F6' }} />,
    title: 'User Authentication',
    category: 'Security & Access',
    items: [
      'Email Registration',
      'Email Login',
      'Google Sign-In',
      'JWT Authentication',
      'Role-Based Access Control',
    ],
  },
  {
    icon: <VerifyIcon sx={{ fontSize: 32, color: '#10B981' }} />,
    title: 'KYC Submission',
    category: 'Data Ingestion',
    items: [
      'User Information Form',
      'Aadhaar Upload',
      'PAN Upload',
      'Utility Bill Upload',
      'Selfie Upload',
    ],
  },
  {
    icon: <OcrIcon sx={{ fontSize: 32, color: '#F59E0B' }} />,
    title: 'OCR Extraction',
    category: 'Computer Vision',
    items: [
      'Aadhaar OCR Extraction',
      'PAN OCR Extraction',
      'Utility Bill OCR Extraction',
      'OCR Confidence Scores',
    ],
  },
  {
    icon: <MatchingIcon sx={{ fontSize: 32, color: '#8B5CF6' }} />,
    title: 'Form vs OCR Verification',
    category: 'NLP & Fuzzy Matching',
    items: [
      'Name Matching',
      'DOB Matching',
      'Address Matching',
      'PAN Matching',
      'Aadhaar Matching',
      'Consistency Score Calculation',
    ],
  },
  {
    icon: <FaceIcon sx={{ fontSize: 32, color: '#EC4899' }} />,
    title: 'Face Verification',
    category: 'Biometrics',
    items: [
      'Document Face Extraction',
      'Selfie Verification',
      'Face Match Score',
    ],
  },
  {
    icon: <LivenessIcon sx={{ fontSize: 32, color: '#06B6D4' }} />,
    title: 'Liveness Detection',
    category: 'Anti-Spoofing',
    items: [
      'Anti-Spoof Detection',
      'Screen Attack Detection',
      'Printed Photo Detection',
    ],
  },
  {
    icon: <ForensicsIcon sx={{ fontSize: 32, color: '#EF4444' }} />,
    title: 'Document Forensics',
    category: 'Deep Learning',
    items: [
      'Tamper Detection',
      'Tamper Heatmap',
      'Blur Detection',
    ],
  },
  {
    icon: <DuplicateIcon sx={{ fontSize: 32, color: '#6366F1' }} />,
    title: 'Duplicate Detection',
    category: 'Deduplication',
    items: [
      'Duplicate Aadhaar Detection',
      'Duplicate PAN Detection',
      'Duplicate Phone Detection',
      'Duplicate Face Detection',
    ],
  },
  {
    icon: <AmlIcon sx={{ fontSize: 32, color: '#14B8A6' }} />,
    title: 'AML Rule Engine',
    category: 'Compliance Rules',
    items: [
      'Suspicious Activity Detection',
      'Multiple Account Detection',
      'Risk Rule Evaluation',
    ],
  },
  {
    icon: <FraudEngineIcon sx={{ fontSize: 32, color: '#F97316' }} />,
    title: 'Fraud Detection Engine',
    category: 'Machine Learning',
    items: [
      'XGBoost Fraud Prediction',
      'Fraud Probability Score',
      'Trust Score',
      'Risk Classification',
    ],
  },
  {
    icon: <XaiIcon sx={{ fontSize: 32, color: '#A855F7' }} />,
    title: 'Explainable AI',
    category: 'Model Interpretability',
    items: [
      'SHAP-Based Explanations',
      'Fraud Reason Breakdown',
      'Verification Transparency',
    ],
  },
  {
    icon: <AdminIcon sx={{ fontSize: 32, color: '#3B82F6' }} />,
    title: 'Admin Dashboard',
    category: 'Review Workflow',
    items: [
      'Pending KYC Requests',
      'Approved Requests',
      'Rejected Requests',
      'Fraud Analytics',
      'Audit Logs',
    ],
  },
];

// Tech Stack Categories
const techStack = [
  {
    category: 'Frontend',
    icon: <CodeIcon sx={{ color: '#38BDF8' }} />,
    technologies: ['React.js', 'TypeScript', 'Material UI (MUI)', 'Redux Toolkit', 'React Router'],
  },
  {
    category: 'Backend',
    icon: <FullStackIcon sx={{ color: '#10B981' }} />,
    technologies: ['FastAPI (Asynchronous)', 'Python 3.10+', 'Pydantic v2', 'Uvicorn ASGI'],
  },
  {
    category: 'Database & Storage',
    icon: <DatabaseIcon sx={{ color: '#F59E0B' }} />,
    technologies: ['PostgreSQL', 'SQLite Fallback', 'SQLAlchemy ORM', 'Local Upload Storage'],
  },
  {
    category: 'AI, Computer Vision & ML',
    icon: <AiIcon sx={{ color: '#EC4899' }} />,
    technologies: [
      'PaddleOCR (Document Text & Field Extraction)',
      'InsightFace (ArcFace Deep Biometric Vectors)',
      'OpenCV (Image Preprocessing & Liveness Cues)',
      'CNN Error Level Analysis (Tamper Heatmaps)',
      'XGBoost Ensemble Classifier (Fraud Prediction)',
      'Sentence Transformers (Semantic Address Matching)',
      'SHAP (Explainable AI Feature Attributions)',
      'Verhoeff Algorithm (Aadhaar Checksum Validation)',
    ],
  },
  {
    category: 'Authentication & Security',
    icon: <AuthIcon sx={{ color: '#8B5CF6' }} />,
    technologies: ['JSON Web Tokens (JWT)', 'OAuth2 Password Flow', 'Google OAuth Sign-In', 'PBKDF2 Password Hashing'],
  },
];

export const EnterprisePage: React.FC = () => {
  const navigate = useNavigate();

  const handleGoogleSignInDemo = () => {
    // Interactive Google OAuth simulation for demo/evaluation
    navigate('/login?provider=google');
  };

  return (
    <Box sx={{ minHeight: '100vh', pb: 10 }}>
      {/* Hero Section */}
      <Box
        sx={{
          pt: { xs: 8, md: 12 },
          pb: { xs: 8, md: 10 },
          background: (theme) =>
            theme.palette.mode === 'dark'
              ? 'radial-gradient(ellipse at 50% 20%, rgba(59, 130, 246, 0.15), transparent 70%), #0B0F19'
              : 'radial-gradient(ellipse at 50% 20%, rgba(59, 130, 246, 0.08), transparent 70%), #F8FAFC',
          borderBottom: '1px solid',
          borderColor: 'divider',
          textAlign: 'center',
        }}
      >
        <Container maxWidth="lg">
          <Typography
            variant="h2"
            sx={{
              fontWeight: 900,
              fontSize: { xs: '2.2rem', sm: '3rem', md: '3.6rem' },
              lineHeight: 1.15,
              color: 'text.primary',
              maxWidth: 1000,
              mx: 'auto',
            }}
          >
            AI-Powered eKYC Verification and Fraud Detection System
          </Typography>

          <Typography
            variant="h6"
            sx={{
              color: 'primary.main',
              fontWeight: 600,
              maxWidth: 900,
              mx: 'auto',
              mt: 2.5,
              fontSize: { xs: '1rem', md: '1.25rem' },
              lineHeight: 1.5,
            }}
          >
            A Full Stack AI-powered platform that automates digital KYC verification using OCR,
            Computer Vision, Biometric Authentication, Document Forensics, and Machine Learning-based Fraud Detection.
          </Typography>

          <Typography
            variant="body1"
            sx={{
              color: 'text.secondary',
              fontWeight: 400,
              maxWidth: 820,
              mx: 'auto',
              mt: 2,
              lineHeight: 1.7,
              fontSize: '1rem',
            }}
          >
            The system verifies user identity through Aadhaar, PAN, Utility Bill, and Selfie verification
            while detecting fraud attempts such as document tampering, spoofed identities, duplicate accounts,
            and mismatched information.
          </Typography>

          {/* CTA Buttons */}
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            justifyContent="center"
            alignItems="center"
            sx={{ mt: 5 }}
          >
            <Button
              variant="contained"
              color="primary"
              size="large"
              startIcon={<RegisterIcon />}
              onClick={() => navigate('/register')}
              sx={{ px: 4, py: 1.5, fontWeight: 700, fontSize: '0.95rem', borderRadius: 2 }}
            >
              Register
            </Button>
            <Button
              variant="outlined"
              color="inherit"
              size="large"
              startIcon={<LoginIcon />}
              onClick={() => navigate('/login')}
              sx={{ px: 4, py: 1.5, fontWeight: 700, fontSize: '0.95rem', borderRadius: 2 }}
            >
              Login
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              size="large"
              onClick={handleGoogleSignInDemo}
              startIcon={
                <Box
                  component="img"
                  src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                  alt="Google"
                  sx={{ width: 18, height: 18 }}
                />
              }
              sx={{ px: 3, py: 1.5, fontWeight: 700, fontSize: '0.95rem', borderRadius: 2 }}
            >
              Continue with Google
            </Button>
          </Stack>
        </Container>
      </Box>

      {/* Core Features Section */}
      <Container maxWidth="lg" sx={{ py: 10 }}>
        <Box sx={{ textAlign: 'center', mb: 7 }}>
          <Chip label="END-TO-END ARCHITECTURE" color="primary" size="small" sx={{ fontWeight: 800, mb: 1.5 }} />
          <Typography variant="h3" sx={{ fontWeight: 800, color: 'text.primary' }}>
            Core System Features
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 700, mx: 'auto', mt: 1 }}>
            Comprehensive breakdown of functional modules implemented across user authentication,
            computer vision, deep learning forensics, and admin workflows.
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {coreFeatures.map((feat, idx) => (
            <Grid item xs={12} sm={6} md={4} key={idx}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  height: '100%',
                  bgcolor: 'background.paper',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    borderColor: 'primary.main',
                    boxShadow: (theme) =>
                      theme.palette.mode === 'dark'
                        ? '0 12px 28px rgba(0, 0, 0, 0.5)'
                        : '0 12px 28px rgba(0, 0, 0, 0.08)',
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: 2,
                      bgcolor: (theme) =>
                        theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
                    }}
                  >
                    {feat.icon}
                  </Box>
                  <Chip label={feat.category} size="small" variant="outlined" sx={{ fontSize: '0.7rem', fontWeight: 600 }} />
                </Box>

                <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary', mb: 1.5 }}>
                  {feat.title}
                </Typography>

                <Stack spacing={1} sx={{ flexGrow: 1 }}>
                  {feat.items.map((item, i) => (
                    <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box
                        sx={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          bgcolor: 'primary.main',
                          flexShrink: 0,
                        }}
                      />
                      <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>
                        {item}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Technology Stack Section */}
      <Box
        sx={{
          py: 10,
          bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#0F172A' : '#F1F5F9'),
          borderTop: '1px solid',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 7 }}>
            <Chip label="SYSTEM SPECIFICATION" color="secondary" size="small" sx={{ fontWeight: 800, mb: 1.5 }} />
            <Typography variant="h3" sx={{ fontWeight: 800, color: 'text.primary' }}>
              Technology Stack
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 700, mx: 'auto', mt: 1 }}>
              Complete technical specification of libraries, frameworks, and machine learning models integrated in the project.
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {techStack.map((tech, idx) => (
              <Grid item xs={12} md={idx === 3 ? 12 : 6} key={idx}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3.5,
                    height: '100%',
                    bgcolor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 3,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
                    <Box sx={{ p: 1, borderRadius: 2, bgcolor: (theme) => theme.palette.mode === 'dark' ? '#1E293B' : '#E2E8F0' }}>
                      {tech.icon}
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary' }}>
                      {tech.category}
                    </Typography>
                  </Box>

                  <Grid container spacing={1.5}>
                    {tech.technologies.map((item, i) => (
                      <Grid item xs={12} sm={idx === 3 ? 6 : 12} key={i}>
                        <Box
                          sx={{
                            p: 1.2,
                            borderRadius: 1.5,
                            bgcolor: (theme) =>
                              theme.palette.mode === 'dark' ? '#111827' : '#F8FAFC',
                            border: '1px solid',
                            borderColor: 'divider',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.2,
                          }}
                        >
                          <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'secondary.main', flexShrink: 0 }} />
                          <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary', fontSize: '0.85rem' }}>
                            {item}
                          </Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Admin Verification Workflow Overview */}
      <Container maxWidth="lg" sx={{ py: 10 }}>
        <Box sx={{ textAlign: 'center', mb: 7 }}>
          <Chip label="10-PANEL VERIFICATION PIPELINE" color="primary" size="small" sx={{ fontWeight: 800, mb: 1.5 }} />
          <Typography variant="h3" sx={{ fontWeight: 800, color: 'text.primary' }}>
            Structured Admin Verification Workflow
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 750, mx: 'auto', mt: 1 }}>
            The compliance officer inspects applicant submissions across 10 segregated panels before rendering an auditable decision.
          </Typography>
        </Box>

        <Grid container spacing={2}>
          {[
            { step: '01', title: 'User Submitted Information', desc: 'Ground truth identity: Full Name, DOB, Phone, Address, Aadhaar, PAN, Occupation, and Income.' },
            { step: '02', title: 'Aadhaar OCR Extraction', desc: 'PaddleOCR parsing of Aadhaar card front & back with Verhoeff mathematical checksum check.' },
            { step: '03', title: 'PAN OCR Extraction', desc: 'High-precision regex and OCR parsing of Income Tax Department PAN format.' },
            { step: '04', title: 'Utility Bill OCR Extraction', desc: 'Electricity/Water bill extraction for secondary residential address cross-referencing.' },
            { step: '05', title: 'Face Verification', desc: 'InsightFace cosine similarity comparison between ID document portrait photo and live selfie.' },
            { step: '06', title: 'Document Forensics', desc: 'Error Level Analysis (ELA) and blur detection to flag Photoshop or digital tampering heatmaps.' },
            { step: '07', title: 'Data Consistency Analysis', desc: 'Semantic name, DOB, phone, address, and ID similarity producing an ensemble Consistency Score.' },
            { step: '08', title: 'Fraud Analysis', desc: 'XGBoost fraud probability calculation, trust score, AML watchlist rules, and duplicate identity flags.' },
            { step: '09', title: 'Explainable AI (SHAP)', desc: 'Transparent waterfall of top risk factor contributions influencing the automated decision.' },
            { step: '10', title: 'Final Verification Decision', desc: 'Officer actions: Approve, Reject, Request Reupload, or Flag for Manual Review.' },
          ].map((panel, idx) => (
            <Grid item xs={12} sm={6} md={2.4} key={idx}>
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  height: '100%',
                  bgcolor: 'background.paper',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2.5,
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <Typography variant="h4" sx={{ fontWeight: 900, color: 'primary.main', opacity: 0.7, mb: 1 }}>
                  {panel.step}
                </Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.primary', mb: 1 }}>
                  {panel.title}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', lineHeight: 1.4, flexGrow: 1 }}>
                  {panel.desc}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ textAlign: 'center', mt: 6 }}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={() => navigate('/login')}
            startIcon={<AdminIcon />}
            sx={{ px: 4, py: 1.5, fontWeight: 700 }}
          >
            Access Admin Verification Portal
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

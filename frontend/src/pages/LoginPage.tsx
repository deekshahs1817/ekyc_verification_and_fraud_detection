import React, { useState } from 'react';
import {
  Container,
  Paper,
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  Stack,
  Divider,
  InputAdornment,
  IconButton,
  CircularProgress,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Security as SecurityIcon,
  EmailOutlined as EmailIcon,
  LockOutlined as LockIcon,
  PersonOutline as PersonIcon,
  Visibility,
  VisibilityOff,
  AdminPanelSettings as AdminIcon,
  Person as UserIcon,
  VerifiedUser as ShieldIcon,
  Login as LoginIcon,
  PersonAdd as RegisterIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { useTheme } from '@mui/material/styles';
import { authApi } from '../api/authApi';
import { setCredentials } from '../store/authSlice';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const theme = useTheme();

  // Tab: 0 = Sign In, 1 = Register / Create Account
  const [tabIndex, setTabIndex] = useState(0);

  // Form Fields
  const [name, setName] = useState('');
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // UI Status
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleLoginSuccess = (data: any) => {
    dispatch(setCredentials(data));
    if (data.user.role === 'ADMIN' || data.user.role === 'COMPLIANCE_OFFICER') {
      navigate('/admin');
    } else if (!data.user.profile_completed) {
      navigate('/complete-profile');
    } else {
      navigate('/kyc/submit');
    }
  };

  // Sign In Handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const identifier = usernameOrEmail.trim();
    if (!identifier) {
      setError('Please enter your username or email address.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);
    try {
      const response = await authApi.login(identifier, password);
      handleLoginSuccess(response);
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.response?.data?.detail || err.message || 'Invalid username/email or password.');
    } finally {
      setLoading(false);
    }
  };

  // Register Handler
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const fullName = name.trim();
    const identifier = usernameOrEmail.trim();

    if (!fullName) {
      setError('Please enter your official full name.');
      return;
    }
    if (!identifier) {
      setError('Please enter an email or username.');
      return;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const response = await authApi.register(fullName, identifier, password);
      handleLoginSuccess(response);
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.response?.data?.detail || err.message || 'Registration failed. Please try a different email.');
    } finally {
      setLoading(false);
    }
  };

  // Google OAuth Success Handler
  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    if (credentialResponse.credential) {
      setError(null);
      setLoading(true);
      try {
        const response = await authApi.googleLogin(credentialResponse.credential);
        handleLoginSuccess(response);
      } catch (err: any) {
        console.error('Google Sign-In error:', err);
        setError(
          err.response?.data?.detail ||
          err.message ||
          'Google authentication failed.'
        );
      } finally {
        setLoading(false);
      }
    }
  };

  const handleGoogleError = () => {
    setError('Google authentication was cancelled or encountered an issue. Please try again.');
  };

  // One-Click Demo Mode for Evaluators
  const handleDemoLogin = async (role: 'ADMIN' | 'USER') => {
    setError(null);
    setLoading(true);
    try {
      const response = await authApi.demoLogin(role);
      handleLoginSuccess(response);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Demo login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: { xs: 6, md: 10 } }}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, sm: 5 },
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 4,
          boxShadow: (theme) =>
            theme.palette.mode === 'dark'
              ? '0 20px 45px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255,255,255,0.05)'
              : '0 20px 40px rgba(0, 0, 0, 0.08)',
        }}
      >
        {/* Brand Header */}
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Box
            sx={{
              width: 58,
              height: 58,
              borderRadius: 3,
              bgcolor: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2,
              boxShadow: '0 0 24px rgba(59, 130, 246, 0.4)',
            }}
          >
            <SecurityIcon sx={{ color: '#fff', fontSize: 32 }} />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary', letterSpacing: '-0.5px' }}>
            AI-Powered eKYC Verification
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5, fontWeight: 500 }}>
            Biometric Identity Authentication & Fraud Detection Platform
          </Typography>
        </Box>

        {/* Tab Switcher: Sign In vs Register */}
        <Tabs
          value={tabIndex}
          onChange={(_, val) => {
            setTabIndex(val);
            setError(null);
            setSuccessMsg(null);
          }}
          variant="fullWidth"
          sx={{
            mb: 3.5,
            bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.03)'),
            borderRadius: 2.5,
            p: 0.5,
            minHeight: 44,
            '& .MuiTab-root': {
              minHeight: 40,
              fontWeight: 700,
              fontSize: '0.85rem',
              borderRadius: 2,
            },
          }}
        >
          <Tab icon={<LoginIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Sign In" />
          <Tab icon={<RegisterIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Create Account" />
        </Tabs>

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {successMsg && (
          <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
            {successMsg}
          </Alert>
        )}

        {/* Tab 0: Sign In */}
        {tabIndex === 0 && (
          <form onSubmit={handleLogin}>
            <Stack spacing={2.5}>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary', mb: 1 }}>
                  Username or Email
                </Typography>
                <TextField
                  fullWidth
                  type="text"
                  required
                  value={usernameOrEmail}
                  onChange={(e) => setUsernameOrEmail(e.target.value)}
                  placeholder="name@example.com or username"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon color="primary" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }}
                />
              </Box>

              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary', mb: 1 }}>
                  Password
                </Typography>
                <TextField
                  fullWidth
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon color="primary" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">
                          {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }}
                />
              </Box>

              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                fullWidth
                disabled={loading || !usernameOrEmail.trim() || !password}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <LoginIcon />}
                sx={{ py: 1.4, fontWeight: 800, borderRadius: 2.5 }}
              >
                {loading ? 'Authenticating...' : 'Sign In'}
              </Button>
            </Stack>
          </form>
        )}

        {/* Tab 1: Create Account */}
        {tabIndex === 1 && (
          <form onSubmit={handleRegister}>
            <Stack spacing={2.5}>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary', mb: 1 }}>
                  Full Name (as per Govt ID)
                </Typography>
                <TextField
                  fullWidth
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sadhu Pranavi"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon color="primary" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }}
                />
              </Box>

              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary', mb: 1 }}>
                  Email Address or Username
                </Typography>
                <TextField
                  fullWidth
                  type="text"
                  required
                  value={usernameOrEmail}
                  onChange={(e) => setUsernameOrEmail(e.target.value)}
                  placeholder="name@example.com"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon color="primary" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }}
                />
              </Box>

              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary', mb: 1 }}>
                  Password
                </Typography>
                <TextField
                  fullWidth
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create secure password (min 6 characters)"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon color="primary" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">
                          {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }}
                />
              </Box>

              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                fullWidth
                disabled={loading || !name.trim() || !usernameOrEmail.trim() || password.length < 6}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <RegisterIcon />}
                sx={{ py: 1.4, fontWeight: 800, borderRadius: 2.5 }}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </Stack>
          </form>
        )}

        {/* Divider: OR */}
        <Divider sx={{ my: 3.5, borderColor: 'divider' }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', px: 1, fontWeight: 700, letterSpacing: '0.5px' }}>
            OR
          </Typography>
        </Divider>

        {/* Continue with Google */}
        <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            useOneTap={false}
            theme={theme.palette.mode === 'dark' ? 'filled_black' : 'outline'}
            shape="pill"
            size="large"
            text="continue_with"
            width="340"
          />
        </Box>

        {/* Quick Evaluation Demo Accounts */}
        <Divider sx={{ my: 3.5, borderColor: 'divider' }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', px: 1, fontWeight: 700, letterSpacing: '0.5px' }}>
            QUICK EVALUATION DEMO ACCESS
          </Typography>
        </Divider>

        <Stack direction="row" spacing={1.5}>
          <Button
            variant="outlined"
            color="secondary"
            fullWidth
            size="small"
            startIcon={<AdminIcon />}
            onClick={() => handleDemoLogin('ADMIN')}
            sx={{ fontWeight: 700, py: 1, borderRadius: 2, fontSize: '0.8rem' }}
          >
            Admin / Reviewer
          </Button>
          <Button
            variant="outlined"
            color="primary"
            fullWidth
            size="small"
            startIcon={<UserIcon />}
            onClick={() => handleDemoLogin('USER')}
            sx={{ fontWeight: 700, py: 1, borderRadius: 2, fontSize: '0.8rem' }}
          >
            Applicant / User
          </Button>
        </Stack>

        {/* Security & Regulatory Disclosures */}
        <Box
          sx={{
            mt: 4,
            pt: 2.5,
            borderTop: '1px solid',
            borderColor: 'divider',
            textAlign: 'center',
          }}
        >
          <Typography
            variant="caption"
            sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.8 }}
          >
            <ShieldIcon sx={{ fontSize: 14, color: 'success.main' }} />
            256-Bit Encrypted Session • DPDP Act & RBI Compliant Architecture
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: 'text.secondary', opacity: 0.8, display: 'block', mt: 0.5, fontSize: '0.7rem' }}
          >
            By signing in, you consent to digital identity authentication and anti-fraud AML risk evaluation.
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

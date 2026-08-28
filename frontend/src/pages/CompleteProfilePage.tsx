import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  Alert,
  Avatar,
  Stack,
  Divider,
  Chip,
  InputAdornment,
} from '@mui/material';
import {
  PersonOutline as PersonalIcon,
  HomeOutlined as AddressIcon,
  WorkOutline as WorkIcon,
  CheckCircleOutline as SaveIcon,
  Security as SecurityIcon,
  Email as EmailIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { authApi } from '../api/authApi';
import { setCredentials } from '../store/authSlice';

export const CompleteProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, token } = useSelector((state: RootState) => state.auth);

  // 1. Personal Information State
  const [fullName, setFullName] = useState(user?.full_name || user?.name || '');
  const [dob, setDob] = useState(user?.dob || '2000-01-01');
  const [gender, setGender] = useState(user?.gender || 'Female');

  // 2. Address Information State
  const [houseNumber, setHouseNumber] = useState(user?.house_number || '');
  const [street, setStreet] = useState(user?.street || '');
  const [city, setCity] = useState(user?.city || '');
  const [state, setState] = useState(user?.state || '');
  const [pincode, setPincode] = useState(user?.pincode || '');

  // 3. Professional Information State
  const [occupation, setOccupation] = useState(user?.occupation || 'Employed');
  const [annualIncome, setAnnualIncome] = useState(user?.annual_income || '500000 - 1000000');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync state if user loads late
  useEffect(() => {
    if (user) {
      if (!fullName) setFullName(user.full_name || user.name || '');
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!fullName.trim()) {
      setError('Please provide your official Full Name.');
      return;
    }
    if (!houseNumber.trim() || !street.trim() || !city.trim() || !state.trim() || !pincode.trim()) {
      setError('Please complete all Address fields (House No, Street, City, State, and Pincode).');
      return;
    }

    setLoading(true);
    try {
      const updatedUser = await authApi.completeProfile({
        full_name: fullName.trim(),
        dob,
        gender,
        house_number: houseNumber.trim(),
        street: street.trim(),
        city: city.trim(),
        state: state.trim(),
        pincode: pincode.trim(),
        occupation,
        annual_income: annualIncome,
      });

      if (token) {
        dispatch(setCredentials({ user: updatedUser, access_token: token }));
      }

      if (updatedUser.role === 'ADMIN' || updatedUser.role === 'COMPLIANCE_OFFICER') {
        navigate('/admin');
      } else {
        navigate('/kyc/submit');
      }
    } catch (err: any) {
      console.error('Profile save error:', err);
      setError(err.response?.data?.detail || 'Failed to save KYC profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
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
              ? '0 16px 40px rgba(0, 0, 0, 0.6)'
              : '0 16px 36px rgba(0, 0, 0, 0.06)',
        }}
      >
        {/* Page Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          {user?.profile_picture ? (
            <Avatar
              src={user.profile_picture}
              alt={user.full_name || 'User'}
              sx={{ width: 64, height: 64, mx: 'auto', mb: 2, border: '2px solid #3B82F6' }}
            />
          ) : (
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: 3,
                bgcolor: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2,
              }}
            >
              <SecurityIcon sx={{ color: '#fff', fontSize: 32 }} />
            </Box>
          )}

          <Chip
            label="MANDATORY ONBOARDING"
            color="primary"
            size="small"
            sx={{ fontWeight: 800, mb: 1.5, letterSpacing: '0.5px' }}
          />

          <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary' }}>
            Complete KYC Ground Truth Profile
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1, maxWidth: 600, mx: 'auto' }}>
            To comply with digital KYC and AML regulations, please provide your verified personal,
            residential address, and occupational information before uploading documents.
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 4, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Stack spacing={4}>
            {/* Section 1: Personal Information */}
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
                <PersonalIcon sx={{ color: 'primary.main', fontSize: 24 }} />
                <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary' }}>
                  1. Personal Information
                </Typography>
              </Box>

              <Grid container spacing={2.5}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Full Name (as per Govt ID)"
                    fullWidth
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Sadhu Pranavi"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Verified Email Address"
                    type="email"
                    fullWidth
                    disabled
                    value={user?.email || ''}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                        </InputAdornment>
                      ),
                    }}
                    helperText="Authenticated via Email OTP / Google"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Date of Birth"
                    type="date"
                    fullWidth
                    required
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    label="Gender"
                    fullWidth
                    required
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                  >
                    <MenuItem value="Female">Female</MenuItem>
                    <MenuItem value="Male">Male</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </TextField>
                </Grid>
              </Grid>
            </Box>

            <Divider />

            {/* Section 2: Address Information */}
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
                <AddressIcon sx={{ color: 'secondary.main', fontSize: 24 }} />
                <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary' }}>
                  2. Residential Address Information
                </Typography>
              </Box>

              <Grid container spacing={2.5}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="House / Flat / Block Number"
                    fullWidth
                    required
                    value={houseNumber}
                    onChange={(e) => setHouseNumber(e.target.value)}
                    placeholder="e.g. Flat 402, Block B"
                  />
                </Grid>

                <Grid item xs={12} sm={8}>
                  <TextField
                    label="Street / Road / Locality"
                    fullWidth
                    required
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    placeholder="e.g. MG Road, Near City Mall"
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <TextField
                    label="City / Town"
                    fullWidth
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Bengaluru"
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <TextField
                    label="State / Province"
                    fullWidth
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="e.g. Karnataka"
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <TextField
                    label="PIN / Postal Code"
                    fullWidth
                    required
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="e.g. 560001"
                    inputProps={{ maxLength: 6 }}
                  />
                </Grid>
              </Grid>
            </Box>

            <Divider />

            {/* Section 3: Professional Information */}
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
                <WorkIcon sx={{ color: '#10B981', fontSize: 24 }} />
                <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary' }}>
                  3. Professional Information
                </Typography>
              </Box>

              <Grid container spacing={2.5}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    label="Current Occupation"
                    fullWidth
                    required
                    value={occupation}
                    onChange={(e) => setOccupation(e.target.value)}
                  >
                    <MenuItem value="Employed">Salaried / Employed</MenuItem>
                    <MenuItem value="Self-Employed">Self-Employed / Business Owner</MenuItem>
                    <MenuItem value="Professional">Doctor / Lawyer / CA / Architect</MenuItem>
                    <MenuItem value="Student">Student</MenuItem>
                    <MenuItem value="Retired">Retired</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </TextField>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    label="Annual Income Bracket (INR)"
                    fullWidth
                    required
                    value={annualIncome}
                    onChange={(e) => setAnnualIncome(e.target.value)}
                  >
                    <MenuItem value="< 500000">&lt; ₹5,00,000</MenuItem>
                    <MenuItem value="500000 - 1000000">₹5,00,000 - ₹10,00,000</MenuItem>
                    <MenuItem value="1000000 - 2500000">₹10,00,000 - ₹25,00,000</MenuItem>
                    <MenuItem value="2500000+">₹25,00,000+</MenuItem>
                  </TextField>
                </Grid>
              </Grid>
            </Box>

            {/* Submit & Proceed */}
            <Box sx={{ pt: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                disabled={loading}
                startIcon={<SaveIcon />}
                sx={{ px: 5, py: 1.5, fontWeight: 800, borderRadius: 2.5 }}
              >
                {loading ? 'Saving Profile...' : 'Save Profile & Continue to Verification'}
              </Button>
            </Box>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
};

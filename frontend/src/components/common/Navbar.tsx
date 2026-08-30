import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Container,
} from '@mui/material';
import {
  Security as SecurityIcon,
  AccountCircle as AccountIcon,
  Dashboard as DashboardIcon,
  VerifiedUser as VerifiedIcon,
  Assessment as AssessmentIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  BusinessCenter as EnterpriseIcon,
} from '@mui/icons-material';
import { Tooltip } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { logout } from '../../store/authSlice';
import { useAppTheme } from '../../theme/ThemeContext';
import { NotificationBell } from './NotificationBell';
import { StreakBadge } from './StreakBadge';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { mode, toggleTheme } = useAppTheme();

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleClose();
    dispatch(logout());
    navigate('/login');
  };

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'COMPLIANCE_OFFICER';
  const isDark = mode === 'dark';

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        borderBottom: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        color: 'text.primary',
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
          {/* Logo & Platform Name */}
          <Box
            sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: 1.5 }}
            onClick={() => navigate(isAdmin ? '/admin' : '/kyc/submit')}
          >
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: 2,
                bgcolor: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 16px rgba(59, 130, 246, 0.4)',
              }}
            >
              <SecurityIcon sx={{ color: '#fff', fontSize: 24 }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: '-0.5px', lineHeight: 1.2, color: 'text.primary' }}>
                eKYC<span style={{ color: '#3B82F6' }}>.AI</span>
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem', display: 'block', fontWeight: 600 }}>
                Final Year / Internship Project
              </Typography>
            </Box>
          </Box>

          {/* Center / Right Links and Theme Toggle */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {/* Theme Toggle Button */}
            <Tooltip title={isDark ? 'Switch to Bright / Light Mode' : 'Switch to Dark Mode'}>
              <IconButton
                onClick={toggleTheme}
                sx={{
                  bgcolor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
                  border: '1px solid',
                  borderColor: 'divider',
                  color: isDark ? '#FBBF24' : '#0F172A',
                  p: 1,
                  '&:hover': {
                    bgcolor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
                  },
                }}
              >
                {isDark ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
              </IconButton>
            </Tooltip>

            {/* Project Architecture / Overview Link */}
            <Button
              startIcon={<EnterpriseIcon />}
              color={location.pathname === '/enterprise' ? 'primary' : 'inherit'}
              variant={location.pathname === '/enterprise' ? 'contained' : 'text'}
              onClick={() => navigate('/enterprise')}
              size="small"
              sx={{ fontWeight: 700 }}
            >
              Project Architecture
            </Button>

            {/* Navigation Links */}
            {isAuthenticated && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {!isAdmin && (
                  <>
                    <Button
                      startIcon={<VerifiedIcon />}
                      color={location.pathname === '/kyc/submit' ? 'primary' : 'inherit'}
                      variant={location.pathname === '/kyc/submit' ? 'contained' : 'text'}
                      onClick={() => navigate('/kyc/submit')}
                    >
                      Verify Identity
                    </Button>
                    <Button
                      startIcon={<AssessmentIcon />}
                      color={location.pathname === '/kyc/status' ? 'primary' : 'inherit'}
                      variant={location.pathname === '/kyc/status' ? 'contained' : 'text'}
                      onClick={() => navigate('/kyc/status')}
                    >
                      Verification History
                    </Button>
                  </>
                )}

                {isAdmin && (
                  <>
                    <Button
                      startIcon={<DashboardIcon />}
                      color={location.pathname === '/admin' ? 'primary' : 'inherit'}
                      variant={location.pathname === '/admin' ? 'contained' : 'text'}
                      onClick={() => navigate('/admin')}
                    >
                      Review Queue
                    </Button>
                    <Button
                      startIcon={<AssessmentIcon />}
                      color={location.pathname === '/admin/audit' ? 'primary' : 'inherit'}
                      variant={location.pathname === '/admin/audit' ? 'contained' : 'text'}
                      onClick={() => navigate('/admin/audit')}
                    >
                      Audit Logs
                    </Button>
                  </>
                )}

                {/* Persistent Daily Work Streak Badge */}
                <StreakBadge />

                {/* Real-time Activity Notification Bell */}
                <NotificationBell />

                {/* User Chip & Profile Menu */}
                <Box sx={{ ml: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip
                    label={isAdmin ? 'COMPLIANCE ADMIN' : 'APPLICANT'}
                    size="small"
                    color={isAdmin ? 'secondary' : 'default'}
                    sx={{ fontWeight: 700, fontSize: '0.65rem' }}
                  />
                  <IconButton onClick={handleMenu} sx={{ color: 'text.primary' }}>
                    <AccountIcon />
                  </IconButton>
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleClose}
                    PaperProps={{
                      sx: { bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', minWidth: 180 },
                    }}
                  >
                    <Box sx={{ px: 2, py: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                        {user?.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {user?.email}
                      </Typography>
                    </Box>
                    <MenuItem onClick={handleLogout} sx={{ color: '#EF4444' }}>
                      Logout
                    </MenuItem>
                  </Menu>
                </Box>
              </Box>
            )}

            {!isAuthenticated && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <StreakBadge />
                <Button variant="outlined" color="primary" onClick={() => navigate('/login')}>
                  Sign In
                </Button>
                <Button variant="contained" color="primary" onClick={() => navigate('/register')}>
                  Register
                </Button>
              </Box>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

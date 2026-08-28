import { createTheme } from '@mui/material/styles';

export const getAppTheme = (mode: 'light' | 'dark') => {
  const isDark = mode === 'dark';

  return createTheme({
    palette: {
      mode,
      background: {
        default: isDark ? '#0B0F19' : '#F1F5F9',
        paper: isDark ? '#111827' : '#FFFFFF',
      },
      primary: {
        main: '#3B82F6',
        light: '#60A5FA',
        dark: '#1D4ED8',
        contrastText: '#FFFFFF',
      },
      secondary: {
        main: '#8B5CF6',
        light: '#A78BFA',
        dark: '#6D28D9',
      },
      success: {
        main: '#10B981',
        light: '#34D399',
        dark: '#059669',
        contrastText: '#FFFFFF',
      },
      warning: {
        main: '#F59E0B',
        light: '#FBBF24',
        dark: '#D97706',
        contrastText: '#FFFFFF',
      },
      error: {
        main: '#EF4444',
        light: '#F87171',
        dark: '#DC2626',
        contrastText: '#FFFFFF',
      },
      text: {
        primary: isDark ? '#F8FAFC' : '#0F172A',
        secondary: isDark ? '#94A3B8' : '#475569',
      },
      divider: isDark ? '#1F2937' : '#E2E8F0',
    },
    typography: {
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      h1: { fontWeight: 800 },
      h2: { fontWeight: 800 },
      h3: { fontWeight: 700 },
      h4: { fontWeight: 700 },
      h5: { fontWeight: 700 },
      h6: { fontWeight: 600 },
      subtitle1: { fontWeight: 600 },
      subtitle2: { fontWeight: 600 },
      button: { textTransform: 'none', fontWeight: 600 },
    },
    shape: {
      borderRadius: 10,
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: isDark ? '#0B0F19' : '#F1F5F9',
            color: isDark ? '#F8FAFC' : '#0F172A',
            transition: 'background-color 0.25s ease, color 0.25s ease',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            boxShadow: 'none',
            padding: '8px 18px',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            borderColor: isDark ? '#1F2937' : '#E2E8F0',
            transition: 'background-color 0.25s ease, border-color 0.25s ease',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            borderColor: isDark ? '#1F2937' : '#E2E8F0',
            borderRadius: 12,
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderColor: isDark ? '#1F2937' : '#E2E8F0',
            color: isDark ? '#F8FAFC' : '#0F172A',
          },
          head: {
            fontWeight: 700,
            color: isDark ? '#94A3B8' : '#475569',
            backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              backgroundColor: isDark ? '#0B0F19' : '#FFFFFF',
              '& fieldset': {
                borderColor: isDark ? '#334155' : '#CBD5E1',
              },
              '&:hover fieldset': {
                borderColor: '#3B82F6',
              },
            },
          },
        },
      },
    },
  });
};

export const theme = getAppTheme('dark');

import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2563eb',
    },
    secondary: {
      main: '#7c3aed',
    },
    background: {
      default: '#f4f6f8',
      paper: '#ffffff',
    },
    text: {
      primary: '#111827',
      secondary: '#6b7280',
    },
  },

  shape: {
    borderRadius: 8,
  },

  typography: {
    fontFamily: 'Inter, Roboto, Arial, sans-serif',

    h4: {
      fontWeight: 700,
      fontSize: '1.75rem',
      letterSpacing: '-0.025em',
    },

    h5: {
      fontWeight: 700,
      fontSize: '1.25rem',
    },

    h6: {
      fontWeight: 600,
      fontSize: '1rem',
    },

    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },

  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#f4f6f8',
        },
      },
    },

    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: 'none',
        },
      },
    },

    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          boxShadow: 'none',
          border: '1px solid #e2e8f0',
        },
      },
    },

    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },

    MuiTextField: {
      defaultProps: {
        size: 'small',
      },
    },

    MuiSelect: {
      defaultProps: {
        size: 'small',
      },
    },
  },
});

// src/theme/ThemeSettings.js
import { createTheme } from '@mui/material/styles';
import { DefaultColors, DarkColors } from './DefaultColors';

const ThemeSettings = (customizer) => {
  const theme = createTheme({
    direction: customizer.activeDir,
    palette: {
      mode: customizer.activeMode,
      primary: {
        main: customizer.activeTheme === 'BLUE_THEME' ? DefaultColors.primary.main :
              customizer.activeTheme === 'GREEN_THEME' ? '#0C7040' :
              customizer.activeTheme === 'PURPLE_THEME' ? '#7C59D4' :
              customizer.activeTheme === 'RED_THEME' ? '#D32F2F' :
              customizer.activeTheme === 'ORANGE_THEME' ? '#FF9800' :
              customizer.activeTheme === 'TEAL_THEME' ? '#00695C' :
              DefaultColors.primary.main,
        light: customizer.activeTheme === 'BLUE_THEME' ? DefaultColors.primary.light :
               customizer.activeTheme === 'GREEN_THEME' ? '#F4F6F9' :
               customizer.activeTheme === 'PURPLE_THEME' ? '#F5F3FF' :
               customizer.activeTheme === 'RED_THEME' ? '#FFEBEE' :
               customizer.activeTheme === 'ORANGE_THEME' ? '#FFF3E0' :
               customizer.activeTheme === 'TEAL_THEME' ? '#E0F2F1' :
               DefaultColors.primary.light,
        dark: customizer.activeTheme === 'BLUE_THEME' ? DefaultColors.primary.dark :
              customizer.activeTheme === 'GREEN_THEME' ? '#06492C' :
              customizer.activeTheme === 'PURPLE_THEME' ? '#6C4AB6' :
              customizer.activeTheme === 'RED_THEME' ? '#C62828' :
              customizer.activeTheme === 'ORANGE_THEME' ? '#F57C00' :
              customizer.activeTheme === 'TEAL_THEME' ? '#004D40' :
              DefaultColors.primary.dark,
        contrastText: '#ffffff',
      },
      secondary: {
        main: customizer.activeTheme === 'BLUE_THEME' ? DefaultColors.secondary.main :
              customizer.activeTheme === 'GREEN_THEME' ? '#47D7BC' :
              customizer.activeTheme === 'PURPLE_THEME' ? '#FB9678' :
              customizer.activeTheme === 'RED_THEME' ? '#F48FB1' :
              customizer.activeTheme === 'ORANGE_THEME' ? '#66BB6A' :
              customizer.activeTheme === 'TEAL_THEME' ? '#4DB6AC' :
              DefaultColors.secondary.main,
        light: customizer.activeTheme === 'BLUE_THEME' ? DefaultColors.secondary.light :
               customizer.activeTheme === 'GREEN_THEME' ? '#EDFBF7' :
               customizer.activeTheme === 'PURPLE_THEME' ? '#FFF5F2' :
               customizer.activeTheme === 'RED_THEME' ? '#FCE4EC' :
               customizer.activeTheme === 'ORANGE_THEME' ? '#E8F5E8' :
               customizer.activeTheme === 'TEAL_THEME' ? '#B2DFDB' :
               DefaultColors.secondary.light,
        dark: customizer.activeTheme === 'BLUE_THEME' ? DefaultColors.secondary.dark :
              customizer.activeTheme === 'GREEN_THEME' ? '#39C7A6' :
              customizer.activeTheme === 'PURPLE_THEME' ? '#E07C5A' :
              customizer.activeTheme === 'RED_THEME' ? '#E91E63' :
              customizer.activeTheme === 'ORANGE_THEME' ? '#43A047' :
              customizer.activeTheme === 'TEAL_THEME' ? '#26A69A' :
              DefaultColors.secondary.dark,
        contrastText: '#ffffff',
      },
      success: customizer.activeMode === 'dark' ? DarkColors.success : DefaultColors.success,
      info: customizer.activeMode === 'dark' ? DarkColors.info : DefaultColors.info,
      error: customizer.activeMode === 'dark' ? DarkColors.error : DefaultColors.error,
      warning: customizer.activeMode === 'dark' ? DarkColors.warning : DefaultColors.warning,
      purple: customizer.activeMode === 'dark' ? DarkColors.purple : DefaultColors.purple,
      grey: customizer.activeMode === 'dark' ? DarkColors.grey : DefaultColors.grey,
      text: customizer.activeMode === 'dark' ? DarkColors.text : DefaultColors.text,
      action: customizer.activeMode === 'dark' ? DarkColors.action : DefaultColors.action,
      divider: customizer.activeMode === 'dark' ? DarkColors.divider : DefaultColors.divider,
      background: {
        default: customizer.activeMode === 'dark' ? '#2A3547' : '#fafbfb',
        paper: customizer.activeMode === 'dark' ? '#2A3547' : '#ffffff',
      },
    },
    typography: {
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      h1: {
        fontWeight: 600,
        fontSize: '2.25rem',
        lineHeight: '2.75rem',
      },
      h2: {
        fontWeight: 600,
        fontSize: '1.875rem',
        lineHeight: '2.25rem',
      },
      h3: {
        fontWeight: 600,
        fontSize: '1.5rem',
        lineHeight: '1.75rem',
      },
      h4: {
        fontWeight: 600,
        fontSize: '1.3125rem',
        lineHeight: '1.6rem',
      },
      h5: {
        fontWeight: 600,
        fontSize: '1.125rem',
        lineHeight: '1.6rem',
      },
      h6: {
        fontWeight: 600,
        fontSize: '1rem',
        lineHeight: '1.2rem',
      },
      button: {
        textTransform: 'capitalize',
        fontWeight: 400,
      },
      body1: {
        fontSize: '0.875rem',
        fontWeight: 400,
        lineHeight: '1.334rem',
      },
      body2: {
        fontSize: '0.75rem',
        letterSpacing: '0rem',
        fontWeight: 400,
        lineHeight: '1rem',
      },
      subtitle1: {
        fontSize: '0.875rem',
        fontWeight: 400,
      },
      subtitle2: {
        fontSize: '0.75rem',
        fontWeight: 400,
      },
    },
    components: {
      // Personalizaciones de componentes MUI
      MuiCssBaseline: {
        styleOverrides: {
          '*': {
            boxSizing: 'border-box',
          },
          html: {
            MozOsxFontSmoothing: 'grayscale',
            WebkitFontSmoothing: 'antialiased',
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100%',
            width: '100%',
          },
          body: {
            display: 'flex',
            flex: '1 1 auto',
            flexDirection: 'column',
            minHeight: '100%',
            width: '100%',
          },
          '#__next': {
            display: 'flex',
            flex: '1 1 auto',
            flexDirection: 'column',
            height: '100%',
            width: '100%',
          },
          '#root': {
            display: 'flex',
            flex: '1 1 auto',
            flexDirection: 'column',
            height: '100%',
            width: '100%',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            borderRadius: '7px',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: '7px',
            padding: '0',
            boxShadow: customizer.activeMode === 'dark' 
              ? '0px 7px 30px 0px rgba(90, 114, 123, 0.11)' 
              : '0px 7px 30px 0px rgba(90, 114, 123, 0.11)',
          },
        },
      },
      MuiCardHeader: {
        styleOverrides: {
          root: {
            padding: '30px 24px',
          },
          title: {
            fontSize: '1.125rem',
            fontWeight: '600',
          },
        },
      },
      MuiCardContent: {
        styleOverrides: {
          root: {
            padding: '30px 24px',
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderBottom: `1px solid ${customizer.activeMode === 'dark' ? '#333F55' : '#e5eaef'}`,
          },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: {
            '&:last-child td': {
              borderBottom: 0,
            },
          },
        },
      },
      MuiLinearProgress: {
        styleOverrides: {
          root: {
            backgroundColor: customizer.activeMode === 'dark' ? '#333F55' : '#e5eaef',
            borderRadius: '6px',
          },
        },
      },
      MuiDivider: {
        styleOverrides: {
          root: {
            borderColor: customizer.activeMode === 'dark' ? '#333F55' : '#e5eaef',
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: customizer.activeMode === 'dark' ? '#333F55' : '#e5eaef',
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: customizer.activeMode === 'dark' ? '#465670' : '#DFE5EF',
            },
          },
        },
      },
    },
    shadows: [
      'none',
      customizer.activeMode === 'dark' 
        ? '0px 1px 2px rgba(0, 0, 0, 0.12)' 
        : '0px 1px 2px rgba(90, 114, 123, 0.11)',
      customizer.activeMode === 'dark' 
        ? '0px 2px 4px rgba(0, 0, 0, 0.12)' 
        : '0px 2px 4px rgba(90, 114, 123, 0.11)',
      customizer.activeMode === 'dark' 
        ? '0px 3px 6px rgba(0, 0, 0, 0.12)' 
        : '0px 3px 6px rgba(90, 114, 123, 0.11)',
      customizer.activeMode === 'dark' 
        ? '0px 4px 8px rgba(0, 0, 0, 0.12)' 
        : '0px 4px 8px rgba(90, 114, 123, 0.11)',
      customizer.activeMode === 'dark' 
        ? '0px 5px 10px rgba(0, 0, 0, 0.12)' 
        : '0px 5px 10px rgba(90, 114, 123, 0.11)',
      customizer.activeMode === 'dark' 
        ? '0px 6px 12px rgba(0, 0, 0, 0.12)' 
        : '0px 6px 12px rgba(90, 114, 123, 0.11)',
      customizer.activeMode === 'dark' 
        ? '0px 7px 14px rgba(0, 0, 0, 0.12)' 
        : '0px 7px 14px rgba(90, 114, 123, 0.11)',
      customizer.activeMode === 'dark' 
        ? '0px 8px 16px rgba(0, 0, 0, 0.12)' 
        : '0px 8px 16px rgba(90, 114, 123, 0.11)',
      customizer.activeMode === 'dark' 
        ? '0px 9px 18px rgba(0, 0, 0, 0.12)' 
        : '0px 9px 18px rgba(90, 114, 123, 0.11)',
      customizer.activeMode === 'dark' 
        ? '0px 10px 20px rgba(0, 0, 0, 0.12)' 
        : '0px 10px 20px rgba(90, 114, 123, 0.11)',
      customizer.activeMode === 'dark' 
        ? '0px 11px 22px rgba(0, 0, 0, 0.12)' 
        : '0px 11px 22px rgba(90, 114, 123, 0.11)',
      customizer.activeMode === 'dark' 
        ? '0px 12px 24px rgba(0, 0, 0, 0.12)' 
        : '0px 12px 24px rgba(90, 114, 123, 0.11)',
      customizer.activeMode === 'dark' 
        ? '0px 13px 26px rgba(0, 0, 0, 0.12)' 
        : '0px 13px 26px rgba(90, 114, 123, 0.11)',
      customizer.activeMode === 'dark' 
        ? '0px 14px 28px rgba(0, 0, 0, 0.12)' 
        : '0px 14px 28px rgba(90, 114, 123, 0.11)',
      customizer.activeMode === 'dark' 
        ? '0px 15px 30px rgba(0, 0, 0, 0.12)' 
        : '0px 15px 30px rgba(90, 114, 123, 0.11)',
      customizer.activeMode === 'dark' 
        ? '0px 16px 32px rgba(0, 0, 0, 0.12)' 
        : '0px 16px 32px rgba(90, 114, 123, 0.11)',
      customizer.activeMode === 'dark' 
        ? '0px 17px 34px rgba(0, 0, 0, 0.12)' 
        : '0px 17px 34px rgba(90, 114, 123, 0.11)',
      customizer.activeMode === 'dark' 
        ? '0px 18px 36px rgba(0, 0, 0, 0.12)' 
        : '0px 18px 36px rgba(90, 114, 123, 0.11)',
      customizer.activeMode === 'dark' 
        ? '0px 19px 38px rgba(0, 0, 0, 0.12)' 
        : '0px 19px 38px rgba(90, 114, 123, 0.11)',
      customizer.activeMode === 'dark' 
        ? '0px 20px 40px rgba(0, 0, 0, 0.12)' 
        : '0px 20px 40px rgba(90, 114, 123, 0.11)',
      customizer.activeMode === 'dark' 
        ? '0px 21px 42px rgba(0, 0, 0, 0.12)' 
        : '0px 21px 42px rgba(90, 114, 123, 0.11)',
      customizer.activeMode === 'dark' 
        ? '0px 22px 44px rgba(0, 0, 0, 0.12)' 
        : '0px 22px 44px rgba(90, 114, 123, 0.11)',
      customizer.activeMode === 'dark' 
        ? '0px 23px 46px rgba(0, 0, 0, 0.12)' 
        : '0px 23px 46px rgba(90, 114, 123, 0.11)',
      customizer.activeMode === 'dark' 
        ? '0px 24px 48px rgba(0, 0, 0, 0.12)' 
        : '0px 24px 48px rgba(90, 114, 123, 0.11)',
    ],
  });

  return theme;
};

export default ThemeSettings;
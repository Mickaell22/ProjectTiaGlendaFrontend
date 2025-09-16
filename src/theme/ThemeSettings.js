// src/theme/ThemeSettings.js
import { createTheme } from '@mui/material/styles';
import { DefaultColors, DarkColors } from './DefaultColors';

const ThemeSettings = (customizer) => {
  const theme = createTheme({
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
        light: customizer.activeMode === 'dark' ?
               (customizer.activeTheme === 'BLUE_THEME' ? DarkColors.primary.light :
                customizer.activeTheme === 'GREEN_THEME' ? '#1B3B2F' :
                customizer.activeTheme === 'PURPLE_THEME' ? '#2D1F47' :
                customizer.activeTheme === 'RED_THEME' ? '#3D1A1A' :
                customizer.activeTheme === 'ORANGE_THEME' ? '#3D2C14' :
                customizer.activeTheme === 'TEAL_THEME' ? '#0F2F2C' :
                DarkColors.primary.light) :
               (customizer.activeTheme === 'BLUE_THEME' ? DefaultColors.primary.light :
                customizer.activeTheme === 'GREEN_THEME' ? '#F4F6F9' :
                customizer.activeTheme === 'PURPLE_THEME' ? '#F5F3FF' :
                customizer.activeTheme === 'RED_THEME' ? '#FFEBEE' :
                customizer.activeTheme === 'ORANGE_THEME' ? '#FFF3E0' :
                customizer.activeTheme === 'TEAL_THEME' ? '#E0F2F1' :
                DefaultColors.primary.light),
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
        light: customizer.activeMode === 'dark' ?
               (customizer.activeTheme === 'BLUE_THEME' ? DarkColors.secondary.light :
                customizer.activeTheme === 'GREEN_THEME' ? '#0F2F28' :
                customizer.activeTheme === 'PURPLE_THEME' ? '#2F1F29' :
                customizer.activeTheme === 'RED_THEME' ? '#2F1921' :
                customizer.activeTheme === 'ORANGE_THEME' ? '#1F2F1F' :
                customizer.activeTheme === 'TEAL_THEME' ? '#17302E' :
                DarkColors.secondary.light) :
               (customizer.activeTheme === 'BLUE_THEME' ? DefaultColors.secondary.light :
                customizer.activeTheme === 'GREEN_THEME' ? '#EDFBF7' :
                customizer.activeTheme === 'PURPLE_THEME' ? '#FFF5F2' :
                customizer.activeTheme === 'RED_THEME' ? '#FCE4EC' :
                customizer.activeTheme === 'ORANGE_THEME' ? '#E8F5E8' :
                customizer.activeTheme === 'TEAL_THEME' ? '#B2DFDB' :
                DefaultColors.secondary.light),
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
          containedPrimary: {
            backgroundColor: customizer.activeMode === 'dark' ? '#5D87FF' : undefined,
            color: '#ffffff',
            '&:hover': {
              backgroundColor: customizer.activeMode === 'dark'
                ? 'rgba(93, 135, 255, 0.8)'
                : 'rgba(93, 135, 255, 0.9)',
            },
            '&:disabled': {
              backgroundColor: customizer.activeMode === 'dark'
                ? 'rgba(93, 135, 255, 0.3)'
                : 'rgba(0, 0, 0, 0.12)',
              color: customizer.activeMode === 'dark'
                ? 'rgba(255, 255, 255, 0.3)'
                : 'rgba(0, 0, 0, 0.26)',
            },
          },
          containedSecondary: {
            backgroundColor: customizer.activeMode === 'dark' ? '#49BEFF' : undefined,
            color: '#ffffff',
            '&:hover': {
              backgroundColor: customizer.activeMode === 'dark'
                ? 'rgba(73, 190, 255, 0.8)'
                : 'rgba(73, 190, 255, 0.9)',
            },
          },
          outlined: {
            borderColor: customizer.activeMode === 'dark' ? '#465670' : '#e5eaef',
            color: customizer.activeMode === 'dark' ? '#EAEFF4' : '#2A3547',
            '&:hover': {
              borderColor: customizer.activeMode === 'dark' ? '#7C8FAC' : '#DFE5EF',
              backgroundColor: customizer.activeMode === 'dark'
                ? 'rgba(115, 143, 172, 0.08)'
                : 'rgba(223, 229, 239, 0.08)',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: '7px',
            padding: '0',
            boxShadow: customizer.activeMode === 'dark'
              ? '0px 4px 20px 0px rgba(0, 0, 0, 0.4), 0px 1px 10px 0px rgba(0, 0, 0, 0.2)'
              : '0px 7px 30px 0px rgba(90, 114, 123, 0.11)',
            backgroundColor: customizer.activeMode === 'dark' ? '#333F55' : '#ffffff',
            border: customizer.activeMode === 'dark' ? '1px solid #465670' : 'none',
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
            backgroundColor: customizer.activeMode === 'dark' ? '#2A3547' : '#ffffff',
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: customizer.activeMode === 'dark' ? '#465670' : '#e5eaef',
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: customizer.activeMode === 'dark' ? '#7C8FAC' : '#DFE5EF',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: customizer.activeMode === 'dark' ? '#5D87FF' : '#5D87FF',
              borderWidth: '2px',
            },
            '&.Mui-error .MuiOutlinedInput-notchedOutline': {
              borderColor: customizer.activeMode === 'dark' ? '#FA896B' : '#d32f2f',
            },
            '&.Mui-disabled': {
              backgroundColor: customizer.activeMode === 'dark' ? '#1C2235' : '#f5f5f5',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: customizer.activeMode === 'dark' ? '#333F55' : '#e0e0e0',
              },
            },
            '& .MuiInputBase-input': {
              color: customizer.activeMode === 'dark' ? '#EAEFF4' : '#2A3547',
              '&::placeholder': {
                color: customizer.activeMode === 'dark' ? '#7C8FAC' : '#5A6A85',
                opacity: 1,
              },
              '&.Mui-disabled': {
                color: customizer.activeMode === 'dark' ? '#465670' : '#bdbdbd',
              },
            },
          },
        },
      },
      MuiInputLabel: {
        styleOverrides: {
          root: {
            color: customizer.activeMode === 'dark' ? '#7C8FAC' : '#5A6A85',
            '&.Mui-focused': {
              color: customizer.activeMode === 'dark' ? '#5D87FF' : '#5D87FF',
            },
          },
        },
      },
      MuiFormHelperText: {
        styleOverrides: {
          root: {
            color: customizer.activeMode === 'dark' ? '#7C8FAC' : '#5A6A85',
          },
        },
      },
      MuiCheckbox: {
        styleOverrides: {
          root: {
            color: customizer.activeMode === 'dark' ? '#7C8FAC' : '#5A6A85',
            '&.Mui-checked': {
              color: customizer.activeMode === 'dark' ? '#5D87FF' : '#5D87FF',
            },
            '&.Mui-indeterminate': {
              color: customizer.activeMode === 'dark' ? '#5D87FF' : '#5D87FF',
            },
            '&:hover': {
              backgroundColor: customizer.activeMode === 'dark'
                ? 'rgba(93, 135, 255, 0.04)'
                : 'rgba(93, 135, 255, 0.04)',
            },
            '&.Mui-disabled': {
              color: customizer.activeMode === 'dark' ? '#465670' : '#bdbdbd',
            },
          },
        },
      },
      MuiRadio: {
        styleOverrides: {
          root: {
            color: customizer.activeMode === 'dark' ? '#7C8FAC' : '#5A6A85',
            '&.Mui-checked': {
              color: customizer.activeMode === 'dark' ? '#5D87FF' : '#5D87FF',
            },
            '&:hover': {
              backgroundColor: customizer.activeMode === 'dark'
                ? 'rgba(93, 135, 255, 0.04)'
                : 'rgba(93, 135, 255, 0.04)',
            },
            '&.Mui-disabled': {
              color: customizer.activeMode === 'dark' ? '#465670' : '#bdbdbd',
            },
          },
        },
      },
      MuiSwitch: {
        styleOverrides: {
          switchBase: {
            color: customizer.activeMode === 'dark' ? '#7C8FAC' : '#ffffff',
            '&.Mui-checked': {
              color: customizer.activeMode === 'dark' ? '#5D87FF' : '#5D87FF',
              '& + .MuiSwitch-track': {
                backgroundColor: customizer.activeMode === 'dark'
                  ? 'rgba(93, 135, 255, 0.5)'
                  : 'rgba(93, 135, 255, 0.5)',
              },
            },
            '&.Mui-disabled': {
              color: customizer.activeMode === 'dark' ? '#333F55' : '#bdbdbd',
              '& + .MuiSwitch-track': {
                backgroundColor: customizer.activeMode === 'dark' ? '#333F55' : '#f5f5f5',
              },
            },
          },
          track: {
            backgroundColor: customizer.activeMode === 'dark' ? '#465670' : '#e5eaef',
            opacity: 1,
          },
          thumb: {
            boxShadow: customizer.activeMode === 'dark'
              ? '0 2px 4px 0 rgba(0, 0, 0, 0.3)'
              : '0 2px 1px -1px rgba(0, 0, 0, 0.2), 0 1px 1px 0 rgba(0, 0, 0, 0.14), 0 1px 3px 0 rgba(0, 0, 0, 0.12)',
          },
        },
      },
      MuiSelect: {
        styleOverrides: {
          select: {
            backgroundColor: customizer.activeMode === 'dark' ? '#2A3547' : '#ffffff',
            color: customizer.activeMode === 'dark' ? '#EAEFF4' : '#2A3547',
            '&:focus': {
              backgroundColor: customizer.activeMode === 'dark' ? '#2A3547' : '#ffffff',
            },
            '&.Mui-disabled': {
              backgroundColor: customizer.activeMode === 'dark' ? '#1C2235' : '#f5f5f5',
              color: customizer.activeMode === 'dark' ? '#465670' : '#bdbdbd',
            },
          },
          icon: {
            color: customizer.activeMode === 'dark' ? '#7C8FAC' : '#5A6A85',
          },
        },
      },
      MuiMenuItem: {
        styleOverrides: {
          root: {
            backgroundColor: 'transparent',
            color: customizer.activeMode === 'dark' ? '#EAEFF4' : '#2A3547',
            '&:hover': {
              backgroundColor: customizer.activeMode === 'dark' ? 'rgba(115, 143, 172, 0.08)' : 'rgba(0, 0, 0, 0.04)',
            },
            '&.Mui-selected': {
              backgroundColor: customizer.activeMode === 'dark'
                ? 'rgba(93, 135, 255, 0.12)'
                : 'rgba(93, 135, 255, 0.08)',
              color: customizer.activeMode === 'dark' ? '#5D87FF' : '#5D87FF',
              '&:hover': {
                backgroundColor: customizer.activeMode === 'dark'
                  ? 'rgba(93, 135, 255, 0.16)'
                  : 'rgba(93, 135, 255, 0.12)',
              },
            },
            '&.Mui-focusVisible': {
              backgroundColor: customizer.activeMode === 'dark' ? 'rgba(115, 143, 172, 0.12)' : 'rgba(0, 0, 0, 0.06)',
            },
          },
        },
      },
      MuiMenu: {
        styleOverrides: {
          paper: {
            backgroundColor: customizer.activeMode === 'dark' ? '#333F55' : '#ffffff',
            border: customizer.activeMode === 'dark' ? '1px solid #465670' : 'none',
            boxShadow: customizer.activeMode === 'dark'
              ? '0px 8px 32px 0px rgba(0, 0, 0, 0.3)'
              : '0px 8px 32px 0px rgba(90, 114, 123, 0.11)',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundColor: customizer.activeMode === 'dark' ? '#333F55' : '#ffffff',
            color: customizer.activeMode === 'dark' ? '#EAEFF4' : '#2A3547',
            backgroundImage: 'none',
          },
          elevation1: {
            boxShadow: customizer.activeMode === 'dark'
              ? '0px 1px 3px rgba(0, 0, 0, 0.2), 0px 1px 1px rgba(0, 0, 0, 0.14), 0px 2px 1px rgba(0, 0, 0, 0.12)'
              : '0px 1px 2px rgba(90, 114, 123, 0.11)',
          },
          elevation2: {
            boxShadow: customizer.activeMode === 'dark'
              ? '0px 2px 4px rgba(0, 0, 0, 0.2), 0px 1px 1px rgba(0, 0, 0, 0.14), 0px 3px 1px rgba(0, 0, 0, 0.12)'
              : '0px 2px 4px rgba(90, 114, 123, 0.11)',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: customizer.activeMode === 'dark' ? '#333F55' : '#ffffff',
            color: customizer.activeMode === 'dark' ? '#EAEFF4' : '#2A3547',
            borderBottom: customizer.activeMode === 'dark' ? '1px solid #465670' : '1px solid #e5eaef',
            boxShadow: customizer.activeMode === 'dark'
              ? '0px 1px 8px rgba(0, 0, 0, 0.2)'
              : '0px 1px 8px rgba(90, 114, 123, 0.11)',
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: customizer.activeMode === 'dark' ? '#2A3547' : '#ffffff',
            color: customizer.activeMode === 'dark' ? '#EAEFF4' : '#2A3547',
            borderRight: customizer.activeMode === 'dark' ? '1px solid #465670' : '1px solid #e5eaef',
          },
        },
      },
      MuiToolbar: {
        styleOverrides: {
          root: {
            backgroundColor: 'transparent',
          },
        },
      },
      MuiListItem: {
        styleOverrides: {
          root: {
            '&:hover': {
              backgroundColor: customizer.activeMode === 'dark'
                ? 'rgba(115, 143, 172, 0.08)'
                : 'rgba(223, 229, 239, 0.08)',
            },
          },
        },
      },
      MuiListItemIcon: {
        styleOverrides: {
          root: {
            color: customizer.activeMode === 'dark' ? '#7C8FAC' : '#5A6A85',
          },
        },
      },
      MuiListItemText: {
        styleOverrides: {
          primary: {
            color: customizer.activeMode === 'dark' ? '#EAEFF4' : '#2A3547',
          },
          secondary: {
            color: customizer.activeMode === 'dark' ? '#7C8FAC' : '#5A6A85',
          },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            backgroundColor: customizer.activeMode === 'dark' ? '#465670' : '#2A3547',
            color: customizer.activeMode === 'dark' ? '#EAEFF4' : '#ffffff',
            fontSize: '0.75rem',
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            backgroundColor: customizer.activeMode === 'dark' ? '#333F55' : '#ffffff',
            color: customizer.activeMode === 'dark' ? '#EAEFF4' : '#2A3547',
          },
        },
      },
      MuiDialogTitle: {
        styleOverrides: {
          root: {
            color: customizer.activeMode === 'dark' ? '#EAEFF4' : '#2A3547',
            borderBottom: `1px solid ${customizer.activeMode === 'dark' ? '#465670' : '#e5eaef'}`,
          },
        },
      },
      MuiDialogContent: {
        styleOverrides: {
          root: {
            color: customizer.activeMode === 'dark' ? '#EAEFF4' : '#2A3547',
          },
        },
      },
      MuiDialogActions: {
        styleOverrides: {
          root: {
            borderTop: `1px solid ${customizer.activeMode === 'dark' ? '#465670' : '#e5eaef'}`,
          },
        },
      },
      MuiSnackbar: {
        styleOverrides: {
          root: {
            '& .MuiSnackbarContent-root': {
              backgroundColor: customizer.activeMode === 'dark' ? '#333F55' : '#2A3547',
              color: customizer.activeMode === 'dark' ? '#EAEFF4' : '#ffffff',
            },
          },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: {
            borderRadius: '7px',
          },
          standardSuccess: {
            backgroundColor: customizer.activeMode === 'dark'
              ? 'rgba(19, 222, 185, 0.1)'
              : 'rgba(19, 222, 185, 0.1)',
            color: customizer.activeMode === 'dark' ? '#13DEB9' : '#02b3a9',
            border: `1px solid ${customizer.activeMode === 'dark' ? '#13DEB9' : '#13DEB9'}`,
          },
          standardError: {
            backgroundColor: customizer.activeMode === 'dark'
              ? 'rgba(250, 137, 107, 0.1)'
              : 'rgba(250, 137, 107, 0.1)',
            color: customizer.activeMode === 'dark' ? '#FA896B' : '#f3704d',
            border: `1px solid ${customizer.activeMode === 'dark' ? '#FA896B' : '#FA896B'}`,
          },
          standardWarning: {
            backgroundColor: customizer.activeMode === 'dark'
              ? 'rgba(255, 174, 31, 0.1)'
              : 'rgba(255, 174, 31, 0.1)',
            color: customizer.activeMode === 'dark' ? '#FFAE1F' : '#ae8e59',
            border: `1px solid ${customizer.activeMode === 'dark' ? '#FFAE1F' : '#FFAE1F'}`,
          },
          standardInfo: {
            backgroundColor: customizer.activeMode === 'dark'
              ? 'rgba(83, 155, 255, 0.1)'
              : 'rgba(83, 155, 255, 0.1)',
            color: customizer.activeMode === 'dark' ? '#539BFF' : '#1682d4',
            border: `1px solid ${customizer.activeMode === 'dark' ? '#539BFF' : '#539BFF'}`,
          },
        },
      },
    },
    shadows: [
      'none',
      customizer.activeMode === 'dark'
        ? '0px 1px 3px rgba(0, 0, 0, 0.2), 0px 1px 1px rgba(0, 0, 0, 0.14), 0px 2px 1px rgba(0, 0, 0, 0.12)'
        : '0px 1px 2px rgba(90, 114, 123, 0.11)',
      customizer.activeMode === 'dark'
        ? '0px 1px 5px rgba(0, 0, 0, 0.2), 0px 2px 2px rgba(0, 0, 0, 0.14), 0px 3px 1px rgba(0, 0, 0, 0.12)'
        : '0px 2px 4px rgba(90, 114, 123, 0.11)',
      customizer.activeMode === 'dark'
        ? '0px 1px 8px rgba(0, 0, 0, 0.2), 0px 3px 4px rgba(0, 0, 0, 0.14), 0px 3px 3px rgba(0, 0, 0, 0.12)'
        : '0px 3px 6px rgba(90, 114, 123, 0.11)',
      customizer.activeMode === 'dark'
        ? '0px 2px 4px rgba(0, 0, 0, 0.2), 0px 4px 5px rgba(0, 0, 0, 0.14), 0px 1px 10px rgba(0, 0, 0, 0.12)'
        : '0px 4px 8px rgba(90, 114, 123, 0.11)',
      customizer.activeMode === 'dark'
        ? '0px 3px 5px rgba(0, 0, 0, 0.2), 0px 5px 8px rgba(0, 0, 0, 0.14), 0px 1px 14px rgba(0, 0, 0, 0.12)'
        : '0px 5px 10px rgba(90, 114, 123, 0.11)',
      customizer.activeMode === 'dark'
        ? '0px 3px 5px rgba(0, 0, 0, 0.2), 0px 6px 10px rgba(0, 0, 0, 0.14), 0px 1px 18px rgba(0, 0, 0, 0.12)'
        : '0px 6px 12px rgba(90, 114, 123, 0.11)',
      customizer.activeMode === 'dark'
        ? '0px 4px 5px rgba(0, 0, 0, 0.2), 0px 7px 10px rgba(0, 0, 0, 0.14), 0px 2px 16px rgba(0, 0, 0, 0.12)'
        : '0px 7px 14px rgba(90, 114, 123, 0.11)',
      customizer.activeMode === 'dark'
        ? '0px 5px 5px rgba(0, 0, 0, 0.2), 0px 8px 10px rgba(0, 0, 0, 0.14), 0px 3px 14px rgba(0, 0, 0, 0.12)'
        : '0px 8px 16px rgba(90, 114, 123, 0.11)',
      customizer.activeMode === 'dark'
        ? '0px 5px 6px rgba(0, 0, 0, 0.2), 0px 9px 12px rgba(0, 0, 0, 0.14), 0px 3px 16px rgba(0, 0, 0, 0.12)'
        : '0px 9px 18px rgba(90, 114, 123, 0.11)',
      customizer.activeMode === 'dark'
        ? '0px 6px 6px rgba(0, 0, 0, 0.2), 0px 10px 14px rgba(0, 0, 0, 0.14), 0px 4px 18px rgba(0, 0, 0, 0.12)'
        : '0px 10px 20px rgba(90, 114, 123, 0.11)',
      customizer.activeMode === 'dark'
        ? '0px 6px 7px rgba(0, 0, 0, 0.2), 0px 11px 15px rgba(0, 0, 0, 0.14), 0px 4px 20px rgba(0, 0, 0, 0.12)'
        : '0px 11px 22px rgba(90, 114, 123, 0.11)',
      customizer.activeMode === 'dark'
        ? '0px 7px 8px rgba(0, 0, 0, 0.2), 0px 12px 17px rgba(0, 0, 0, 0.14), 0px 5px 22px rgba(0, 0, 0, 0.12)'
        : '0px 12px 24px rgba(90, 114, 123, 0.11)',
      customizer.activeMode === 'dark'
        ? '0px 7px 8px rgba(0, 0, 0, 0.2), 0px 13px 19px rgba(0, 0, 0, 0.14), 0px 5px 24px rgba(0, 0, 0, 0.12)'
        : '0px 13px 26px rgba(90, 114, 123, 0.11)',
      customizer.activeMode === 'dark'
        ? '0px 7px 9px rgba(0, 0, 0, 0.2), 0px 14px 21px rgba(0, 0, 0, 0.14), 0px 5px 26px rgba(0, 0, 0, 0.12)'
        : '0px 14px 28px rgba(90, 114, 123, 0.11)',
      customizer.activeMode === 'dark'
        ? '0px 8px 9px rgba(0, 0, 0, 0.2), 0px 15px 22px rgba(0, 0, 0, 0.14), 0px 6px 28px rgba(0, 0, 0, 0.12)'
        : '0px 15px 30px rgba(90, 114, 123, 0.11)',
      customizer.activeMode === 'dark'
        ? '0px 8px 10px rgba(0, 0, 0, 0.2), 0px 16px 24px rgba(0, 0, 0, 0.14), 0px 6px 30px rgba(0, 0, 0, 0.12)'
        : '0px 16px 32px rgba(90, 114, 123, 0.11)',
      customizer.activeMode === 'dark'
        ? '0px 8px 11px rgba(0, 0, 0, 0.2), 0px 17px 26px rgba(0, 0, 0, 0.14), 0px 6px 32px rgba(0, 0, 0, 0.12)'
        : '0px 17px 34px rgba(90, 114, 123, 0.11)',
      customizer.activeMode === 'dark'
        ? '0px 9px 11px rgba(0, 0, 0, 0.2), 0px 18px 28px rgba(0, 0, 0, 0.14), 0px 7px 34px rgba(0, 0, 0, 0.12)'
        : '0px 18px 36px rgba(90, 114, 123, 0.11)',
      customizer.activeMode === 'dark'
        ? '0px 9px 12px rgba(0, 0, 0, 0.2), 0px 19px 29px rgba(0, 0, 0, 0.14), 0px 7px 36px rgba(0, 0, 0, 0.12)'
        : '0px 19px 38px rgba(90, 114, 123, 0.11)',
      customizer.activeMode === 'dark'
        ? '0px 10px 13px rgba(0, 0, 0, 0.2), 0px 20px 31px rgba(0, 0, 0, 0.14), 0px 8px 38px rgba(0, 0, 0, 0.12)'
        : '0px 20px 40px rgba(90, 114, 123, 0.11)',
      customizer.activeMode === 'dark'
        ? '0px 10px 13px rgba(0, 0, 0, 0.2), 0px 21px 33px rgba(0, 0, 0, 0.14), 0px 8px 40px rgba(0, 0, 0, 0.12)'
        : '0px 21px 42px rgba(90, 114, 123, 0.11)',
      customizer.activeMode === 'dark'
        ? '0px 10px 14px rgba(0, 0, 0, 0.2), 0px 22px 35px rgba(0, 0, 0, 0.14), 0px 8px 42px rgba(0, 0, 0, 0.12)'
        : '0px 22px 44px rgba(90, 114, 123, 0.11)',
      customizer.activeMode === 'dark'
        ? '0px 11px 14px rgba(0, 0, 0, 0.2), 0px 23px 36px rgba(0, 0, 0, 0.14), 0px 9px 44px rgba(0, 0, 0, 0.12)'
        : '0px 23px 46px rgba(90, 114, 123, 0.11)',
      customizer.activeMode === 'dark'
        ? '0px 11px 15px rgba(0, 0, 0, 0.2), 0px 24px 38px rgba(0, 0, 0, 0.14), 0px 9px 46px rgba(0, 0, 0, 0.12)'
        : '0px 24px 48px rgba(90, 114, 123, 0.11)',
    ],
  });

  return theme;
};

export default ThemeSettings;
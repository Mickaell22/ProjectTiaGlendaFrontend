// src/theme/DefaultColors.js
const DefaultColors = {
  // Colores primarios disponibles
  primary: {
    main: '#5D87FF',
    light: '#ECF2FF',
    dark: '#4570EA',
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#49BEFF',
    light: '#E8F7FF',
    dark: '#23afdb',
    contrastText: '#ffffff',
  },
  success: {
    main: '#13DEB9',
    light: '#E6FFFA',
    dark: '#02b3a9',
    contrastText: '#ffffff',
  },
  info: {
    main: '#539BFF',
    light: '#EBF3FE',
    dark: '#1682d4',
    contrastText: '#ffffff',
  },
  error: {
    main: '#FA896B',
    light: '#FDEDE8',
    dark: '#f3704d',
    contrastText: '#ffffff',
  },
  warning: {
    main: '#FFAE1F',
    light: '#FEF5E5',
    dark: '#ae8e59',
    contrastText: '#ffffff',
  },
  purple: {
    A50: '#EBF3FE',
    A100: '#6610f2',
    A200: '#557fb9',
  },
  grey: {
    100: '#F2F6FA',
    200: '#EAEFF4',
    300: '#DFE5EF',
    400: '#7C8FAC',
    500: '#5A6A85',
    600: '#2A3547',
  },
  text: {
    primary: '#2A3547',
    secondary: '#5A6A85',
  },
  action: {
    disabledBackground: 'rgba(73,82,88,0.12)',
    hoverOpacity: 0.02,
    hover: '#f6f9fc',
  },
  divider: '#e5eaef',
};

// Colores para modo oscuro
const DarkColors = {
  primary: {
    main: '#5D87FF',
    light: '#253662',
    dark: '#4570EA',
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#49BEFF',
    light: '#1C455D',
    dark: '#23afdb',
    contrastText: '#ffffff',
  },
  success: {
    main: '#13DEB9',
    light: '#1B3C48',
    dark: '#02b3a9',
    contrastText: '#ffffff',
  },
  info: {
    main: '#539BFF',
    light: '#223662',
    dark: '#1682d4',
    contrastText: '#ffffff',
  },
  error: {
    main: '#FA896B',
    light: '#4B313D',
    dark: '#f3704d',
    contrastText: '#ffffff',
  },
  warning: {
    main: '#FFAE1F',
    light: '#4D3A2A',
    dark: '#ae8e59',
    contrastText: '#ffffff',
  },
  purple: {
    A50: '#EBF3FE',
    A100: '#6610f2',
    A200: '#557fb9',
  },
  grey: {
    100: '#333F55',
    200: '#465670',
    300: '#7C8FAC',
    400: '#DFE5EF',
    500: '#EAEFF4',
    600: '#F2F6FA',
  },
  text: {
    primary: '#EAEFF4',
    secondary: '#7C8FAC',
  },
  action: {
    disabledBackground: 'rgba(73,82,88,0.12)',
    hoverOpacity: 0.02,
    hover: '#333F55',
  },
  divider: '#333F55',
  background: {
    default: '#2A3547',
    paper: '#2A3547',
  },
};

// Opciones de colores primarios para el customizer (modo claro)
const ColorOptions = [
  {
    name: 'BLUE_THEME',
    palette: {
      primary: {
        main: '#5D87FF',
        light: '#ECF2FF',
        dark: '#4570EA',
      },
      secondary: {
        main: '#49BEFF',
        light: '#E8F7FF',
        dark: '#23afdb',
      },
    },
  },
  {
    name: 'GREEN_THEME',
    palette: {
      primary: {
        main: '#0C7040',
        light: '#F4F6F9',
        dark: '#06492C',
      },
      secondary: {
        main: '#47D7BC',
        light: '#EDFBF7',
        dark: '#39C7A6',
      },
    },
  },
  {
    name: 'PURPLE_THEME',
    palette: {
      primary: {
        main: '#7C59D4',
        light: '#F5F3FF',
        dark: '#6C4AB6',
      },
      secondary: {
        main: '#FB9678',
        light: '#FFF5F2',
        dark: '#E07C5A',
      },
    },
  },
  {
    name: 'RED_THEME',
    palette: {
      primary: {
        main: '#D32F2F',
        light: '#FFEBEE',
        dark: '#C62828',
      },
      secondary: {
        main: '#F48FB1',
        light: '#FCE4EC',
        dark: '#E91E63',
      },
    },
  },
  {
    name: 'ORANGE_THEME',
    palette: {
      primary: {
        main: '#FF9800',
        light: '#FFF3E0',
        dark: '#F57C00',
      },
      secondary: {
        main: '#66BB6A',
        light: '#E8F5E8',
        dark: '#43A047',
      },
    },
  },
  {
    name: 'TEAL_THEME',
    palette: {
      primary: {
        main: '#00695C',
        light: '#E0F2F1',
        dark: '#004D40',
      },
      secondary: {
        main: '#4DB6AC',
        light: '#B2DFDB',
        dark: '#26A69A',
      },
    },
  },
];

// Opciones de colores para modo oscuro
const DarkColorOptions = [
  {
    name: 'BLUE_THEME',
    palette: {
      primary: {
        main: '#5D87FF',
        light: '#253662',
        dark: '#4570EA',
      },
      secondary: {
        main: '#49BEFF',
        light: '#1C455D',
        dark: '#23afdb',
      },
    },
  },
  {
    name: 'GREEN_THEME',
    palette: {
      primary: {
        main: '#0C7040',
        light: '#1B3B2F',
        dark: '#06492C',
      },
      secondary: {
        main: '#47D7BC',
        light: '#0F2F28',
        dark: '#39C7A6',
      },
    },
  },
  {
    name: 'PURPLE_THEME',
    palette: {
      primary: {
        main: '#7C59D4',
        light: '#2D1F47',
        dark: '#6C4AB6',
      },
      secondary: {
        main: '#FB9678',
        light: '#2F1F29',
        dark: '#E07C5A',
      },
    },
  },
  {
    name: 'RED_THEME',
    palette: {
      primary: {
        main: '#D32F2F',
        light: '#3D1A1A',
        dark: '#C62828',
      },
      secondary: {
        main: '#F48FB1',
        light: '#2F1921',
        dark: '#E91E63',
      },
    },
  },
  {
    name: 'ORANGE_THEME',
    palette: {
      primary: {
        main: '#FF9800',
        light: '#3D2C14',
        dark: '#F57C00',
      },
      secondary: {
        main: '#66BB6A',
        light: '#1F2F1F',
        dark: '#43A047',
      },
    },
  },
  {
    name: 'TEAL_THEME',
    palette: {
      primary: {
        main: '#00695C',
        light: '#0F2F2C',
        dark: '#004D40',
      },
      secondary: {
        main: '#4DB6AC',
        light: '#17302E',
        dark: '#26A69A',
      },
    },
  },
];

export { DefaultColors, DarkColors, ColorOptions, DarkColorOptions };
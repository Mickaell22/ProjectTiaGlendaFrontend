// src/store/customizer/CustomizerSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  activeMode: 'light', // light | dark
  activeTheme: 'BLUE_THEME', // BLUE_THEME, GREEN_THEME, PURPLE_THEME, RED_THEME, ORANGE_THEME, TEAL_THEME
  sidebarCollapse: false,
  isMobileSidebar: false,
  isSidebarHover: false,
  cardShadow: '0px 7px 30px 0px rgba(90, 114, 123, 0.11)',
  borderRadius: 7,
  customizer: false,
};

// Función para cargar configuración desde localStorage
const loadState = () => {
  try {
    const serializedState = localStorage.getItem('customizer');
    if (serializedState === null) {
      return initialState;
    }
    return { ...initialState, ...JSON.parse(serializedState) };
  } catch (err) {
    return initialState;
  }
};

// Función para guardar configuración en localStorage
const saveState = (state) => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem('customizer', serializedState);
  } catch (err) {
    console.error('Error saving customizer state:', err);
  }
};

export const CustomizerSlice = createSlice({
  name: 'customizer',
  initialState: loadState(),
  reducers: {
    setTheme: (state, action) => {
      state.activeTheme = action.payload;
      saveState(state);
    },
    setDarkMode: (state, action) => {
      state.activeMode = action.payload;
      saveState(state);
    },
    setCardShadow: (state, action) => {
      state.cardShadow = action.payload;
      saveState(state);
    },
    setBorderRadius: (state, action) => {
      state.borderRadius = action.payload;
      saveState(state);
    },
    setSidebarCollapse: (state, action) => {
      state.sidebarCollapse = action.payload;
      saveState(state);
    },
    toggleSidebar: (state) => {
      state.sidebarCollapse = !state.sidebarCollapse;
      saveState(state);
    },
    toggleMobileSidebar: (state) => {
      state.isMobileSidebar = !state.isMobileSidebar;
      saveState(state);
    },
    setSidebarHover: (state, action) => {
      state.isSidebarHover = action.payload;
      saveState(state);
    },
    toggleCustomizer: (state) => {
      state.customizer = !state.customizer;
      saveState(state);
    },
    setCustomizer: (state, action) => {
      state.customizer = action.payload;
      saveState(state);
    },
    // Acción para resetear a valores por defecto
    resetCustomizer: (state) => {
      Object.assign(state, initialState);
      localStorage.removeItem('customizer');
    },
    // Acción para importar configuración completa
    importCustomizer: (state, action) => {
      Object.assign(state, action.payload);
      saveState(state);
    },
  },
});

export const {
  setTheme,
  setDarkMode,
  setCardShadow,
  setBorderRadius,
  setSidebarCollapse,
  toggleSidebar,
  toggleMobileSidebar,
  setSidebarHover,
  toggleCustomizer,
  setCustomizer,
  resetCustomizer,
  importCustomizer,
} = CustomizerSlice.actions;

export default CustomizerSlice.reducer;
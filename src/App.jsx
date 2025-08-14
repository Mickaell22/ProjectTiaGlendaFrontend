// src/App.jsx
import React from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { useRoutes } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Router from './routes/Router';
import { ThemeSettings } from './theme';
import RTL from './layouts/full/shared/customizer/RTL';
import { AuthProvider } from './contexts/AuthContext';
import InactivityWrapper from './components/InactivityWrapper';

function App() {
  const routing = useRoutes(Router);
  const theme = ThemeSettings(useSelector((state) => state.customizer));

  return (
    <ThemeProvider theme={theme}>
      <RTL direction={theme.direction}>
        <CssBaseline />
        <AuthProvider>
          <InactivityWrapper>
            {routing}
          </InactivityWrapper>
        </AuthProvider>
      </RTL>
    </ThemeProvider>
  );
}

export default App;
// src/App.jsx
import React from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { useRoutes } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Router from './routes/Router';
import { ThemeSettings } from './theme';
import { AuthProvider } from './contexts/AuthContext';
import { ConfigProvider } from './contexts/ConfigContext';
import InactivityWrapper from './components/InactivityWrapper';

function App() {
  const routing = useRoutes(Router);
  const theme = ThemeSettings(useSelector((state) => state.customizer));

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <ConfigProvider>
          <InactivityWrapper>
            {routing}
          </InactivityWrapper>
        </ConfigProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
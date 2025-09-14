// src/layouts/full/FullLayout.jsx
import React, { useState } from 'react';
import { styled, Container, Box, useTheme } from '@mui/material';
import { useSelector } from 'react-redux';
import { Outlet } from 'react-router-dom';
import Header from './vertical/header/Header';
import Sidebar from './vertical/sidebar/Sidebar';
import Customizer from './shared/customizer/Customizer';

// Componentes de Chat y Notificaciones
import NotificationCenter from 'src/components/notifications/NotificationCenter';
// import ChatContainer from 'src/components/chat/ChatContainer'; // DESACTIVADO
import SimpleChatTest from 'src/components/chat/SimpleChatTest';

const MainWrapper = styled('div')(() => ({
  display: 'flex',
  minHeight: '100vh',
  width: '100%',
}));

const PageWrapper = styled('div')(() => ({
  display: 'flex',
  flexGrow: 1,
  paddingBottom: '60px',
  flexDirection: 'column',
  zIndex: 1,
  backgroundColor: 'transparent',
  width: '100%',
}));

const FullLayout = () => {
  const customizer = useSelector((state) => state.customizer);
  const theme = useTheme();
  
  // Estados para notificaciones
  // const [chatOpen, setChatOpen] = useState(false); // DESACTIVADO

  // Handler para toggle del chat - DESACTIVADO
  // const handleChatToggle = () => {
  //   setChatOpen(!chatOpen);
  // };

  return (
    <MainWrapper className="mainwrapper">
      {/* ------------------------------------------- */}
      {/* Sidebar */}
      {/* ------------------------------------------- */}
      <Sidebar />
      
      {/* ------------------------------------------- */}
      {/* Main Wrapper */}
      {/* ------------------------------------------- */}
      <PageWrapper
        className="page-wrapper"
        sx={{
          ...(customizer.sidebarCollapse && {
            [theme.breakpoints.up('lg')]: { 
              ml: `80px`, // Espacio para sidebar colapsado
            },
          }),
        }}
      >
        {/* ------------------------------------------- */}
        {/* Header */}
        {/* ------------------------------------------- */}
        <Header />
        
        {/* ------------------------------------------- */}
        {/* PageContent */}
        {/* ------------------------------------------- */}
        <Container
          sx={{
            maxWidth: '100%',
            paddingTop: '20px',
          }}
        >
          <Box sx={{ minHeight: 'calc(100vh - 170px)' }}>
            <Outlet />
          </Box>
        </Container>
      </PageWrapper>
      
      {/* ------------------------------------------- */}
      {/* Customizer */}
      {/* ------------------------------------------- */}
      <Customizer />
      
      {/* Chat Container - DESACTIVADO */}
      {/*
      <ChatContainer
        isOpen={chatOpen}
        onClose={setChatOpen}
        mode="modal"
      />
      */}
      
      {/* Componente de prueba (para debugging si es necesario) */}
      {/* <SimpleChatTest 
        open={false}
        onClose={() => setChatOpen(false)}
      /> */}
    </MainWrapper>
  );
};

export default FullLayout;


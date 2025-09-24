// src/layouts/full/FullLayout.jsx
import React from 'react';
import { styled, Container, Box, useTheme } from '@mui/material';
import { useSelector } from 'react-redux';
import { Outlet } from 'react-router-dom';
import Header from './vertical/header/Header';
import Sidebar from './vertical/sidebar/Sidebar';
import Customizer from './shared/customizer/Customizer';

// Componentes de Chat
import ChatContainer from 'src/components/chat/ChatContainer';

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
  const [chatOpen, setChatOpen] = React.useState(false);

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
        <Header onChatToggle={() => setChatOpen(!chatOpen)} />
        
        {/* ------------------------------------------- */}
        {/* PageContent */}
        {/* ------------------------------------------- */}
        <Container
          sx={{
            maxWidth: '100%',
            paddingTop: '20px',
            px: { xs: 1, sm: 2, md: 3 }, // Padding responsive
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
      
      {/* Chat Container */}
      <ChatContainer
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        mode="modal"
      />
      
    </MainWrapper>
  );
};

export default FullLayout;


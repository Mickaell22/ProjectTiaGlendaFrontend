// src/layouts/blank/BlankLayout.js
import React from 'react';
import { styled, Container, Box } from '@mui/material';
import { Outlet } from 'react-router-dom';

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
}));

const BlankLayout = () => {

  return (
    <MainWrapper className="mainwrapper">
      <PageWrapper className="page-wrapper">
        <Container
          sx={{
            maxWidth: '1200px',
            paddingTop: '0',
            position: 'relative',
          }}
        >
          <Box sx={{ minHeight: 'calc(100vh - 170px)' }}>
            <Outlet />
          </Box>
        </Container>
      </PageWrapper>
    </MainWrapper>
  );
};

export default BlankLayout;
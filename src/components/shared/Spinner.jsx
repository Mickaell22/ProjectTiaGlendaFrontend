// src/components/shared/Spinner.js
import React from 'react';
import { Box, CircularProgress, styled } from '@mui/material';

const SpinnerWrapper = styled(Box)(({ theme }) => ({
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: theme.palette.background.default,
  zIndex: 9999,
}));

const Spinner = () => {
  return (
    <SpinnerWrapper>
      <CircularProgress size={50} color="primary" />
    </SpinnerWrapper>
  );
};

export default Spinner;
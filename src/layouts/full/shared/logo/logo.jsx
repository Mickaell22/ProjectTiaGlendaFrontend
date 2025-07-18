// src/layouts/full/shared/logo/Logo.jsx
import { Link } from 'react-router-dom';
import { styled, useTheme } from '@mui/material/styles';
import { Box, Typography } from '@mui/material';

const Logo = () => {
  const theme = useTheme();
  
  const LinkStyled = styled(Link)(() => ({
    height: '70px',
    width: '180px',
    overflow: 'hidden',
    display: 'block',
    textDecoration: 'none',
  }));

  return (
    <LinkStyled to="/">
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        {/* Logo Icon */}
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2,
            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '1.5rem',
          }}
        >
          M
        </Box>
        
        {/* Logo Text */}
        <Box>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              color: theme.palette.text.primary,
              lineHeight: 1,
            }}
          >
            Mi App
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: theme.palette.text.secondary,
              fontSize: '0.65rem',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            Admin Panel
          </Typography>
        </Box>
      </Box>
    </LinkStyled>
  );
};

export default Logo;
import { Link } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import { Box } from '@mui/material';

const Logo = () => {
  const LinkStyled = styled(Link)(() => ({
    display: 'inline-block',
    textDecoration: 'none',
  }));

  return (
    <LinkStyled to="/">
      <Box
        component="img"
        src="/LOGO TÍA GLENDA-07.png"
        alt="Logo Tía Glenda"
        sx={{
          width: '220px',          // 🔼 Más ancho
          height: 'auto',          // Alto automático
          maxHeight: '120px',      // 🔼 Más alto
          objectFit: 'contain',
          display: 'block',
          
        }}
      />
    </LinkStyled>
  );
};

export default Logo;

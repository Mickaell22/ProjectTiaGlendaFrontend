import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  TextField,
  Avatar,
  IconButton,
  Divider,
  Stack,
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  Psychology,
  School,
  Groups,
  EmojiEvents,
  Facebook,
  Instagram,
  Twitter,
  CheckCircle,
  Phone,
  Email,
  LocationOn,
  WhatsApp,
} from '@mui/icons-material';

const MotionBox = motion(Box);
const MotionCard = motion(Card);

// Colores del logo Centro Tía Glenda
const colors = {
  primary: '#663399', // Morado principal
  secondary: '#1BA098', // Turquesa
  accent: '#FFD700', // Amarillo
  gradients: {
    purple: 'linear-gradient(135deg, #663399 0%, #8B4FAF 100%)',
    rainbow: 'linear-gradient(135deg, #FF6B6B 0%, #FFD93D 50%, #6BCB77 100%)',
    turquoise: 'linear-gradient(135deg, #1BA098 0%, #26D0C9 100%)',
    sunset: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)',
    ocean: 'linear-gradient(135deg, #4FACFE 0%, #00F2FE 100%)',
    warm: 'linear-gradient(135deg, #FA709A 0%, #FEE140 100%)',
  },
};

const LandingPage = () => {
  // Eliminar márgenes y padding del body cuando se monta el componente
  useEffect(() => {
    const originalBodyMargin = document.body.style.margin;
    const originalBodyPadding = document.body.style.padding;
    const originalRootPadding = document.getElementById('root')?.style.padding;

    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.overflow = 'auto';

    const root = document.getElementById('root');
    if (root) {
      root.style.padding = '0';
      root.style.margin = '0';
    }

    return () => {
      // Restaurar estilos al desmontar
      document.body.style.margin = originalBodyMargin;
      document.body.style.padding = originalBodyPadding;
      if (root) {
        root.style.padding = originalRootPadding;
      }
    };
  }, []);

  const [mensaje, setMensaje] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    // Número de WhatsApp del Centro Tía Glenda (sin espacios ni caracteres especiales)
    const whatsappNumber = '593969599646';

    // Crear URL de WhatsApp
    const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(mensaje)}`;

    // Abrir WhatsApp en una nueva pestaña
    window.open(whatsappURL, '_blank');

    // Limpiar el formulario
    setMensaje('');
  };

  // Datos de ejemplo
  const comoFunciona = [
    {
      icon: <Phone sx={{ fontSize: 50, color: colors.secondary }} />,
      titulo: 'Contacta',
      descripcion: 'Llámanos o escríbenos para agendar tu primera consulta',
    },
    {
      icon: <CheckCircle sx={{ fontSize: 50, color: colors.secondary }} />,
      titulo: 'Evalúa',
      descripcion: 'Realizamos una evaluación inicial personalizada',
    },
    {
      icon: <Psychology sx={{ fontSize: 50, color: colors.secondary }} />,
      titulo: 'Trata',
      descripcion: 'Iniciamos el tratamiento con nuestro equipo profesional',
    },
    {
      icon: <EmojiEvents sx={{ fontSize: 50, color: colors.secondary }} />,
      titulo: 'Avanza',
      descripcion: 'Seguimiento continuo y logro de objetivos terapéuticos',
    },
  ];

  const ultimosCasos = [
    {
      imagen: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400&h=300&fit=crop&q=80',
      usuario: 'María González',
      avatar: 'https://i.pravatar.cc/150?img=1',
      descripcion: 'Tratamiento de lenguaje con resultados excepcionales en 6 meses',
    },
    {
      imagen: 'https://images.unsplash.com/photo-1516534775068-ba3e7458af70?w=400&h=300&fit=crop&q=80',
      usuario: 'Carlos Pérez',
      avatar: 'https://i.pravatar.cc/150?img=12',
      descripcion: 'Terapia conductual que mejoró significativamente su desarrollo social',
    },
    {
      imagen: 'https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=400&h=300&fit=crop&q=80',
      usuario: 'Ana Rodríguez',
      avatar: 'https://i.pravatar.cc/150?img=5',
      descripcion: 'Programa pedagógico personalizado con avances notables',
    },
    {
      imagen: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&h=300&fit=crop&q=80',
      usuario: 'Luis Torres',
      avatar: 'https://i.pravatar.cc/150?img=8',
      descripcion: 'Apoyo psicológico familiar que transformó la dinámica del hogar',
    },
    {
      imagen: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=300&fit=crop&q=80',
      usuario: 'Patricia Silva',
      avatar: 'https://i.pravatar.cc/150?img=9',
      descripcion: 'Sesiones de terapia ocupacional con resultados extraordinarios',
    },
    {
      imagen: 'https://images.unsplash.com/photo-1577896851905-3a85fb0b08b3?w=400&h=300&fit=crop&q=80',
      usuario: 'Roberto Díaz',
      avatar: 'https://i.pravatar.cc/150?img=13',
      descripcion: 'Evaluación y tratamiento integral que superó todas las expectativas',
    },
  ];

  const beneficios = [
    {
      numero: '15+',
      titulo: 'Años de Experiencia',
      descripcion: 'Más de 15 años brindando atención especializada',
      color: colors.gradients.purple,
    },
    {
      numero: '500+',
      titulo: 'Familias Atendidas',
      descripcion: 'Más de 500 familias confían en nosotros',
      color: colors.gradients.sunset,
    },
    {
      numero: '10+',
      titulo: 'Especialidades',
      descripcion: 'Equipo multidisciplinario de profesionales',
      color: colors.gradients.ocean,
    },
  ];

  const mejoresTerapeutas = [
    {
      nombre: 'Dra. Glenda Torres',
      puesto: 'Directora y Psicóloga Clínica',
      descripcion: 'Especialista en psicología infantil con más de 20 años de experiencia',
      avatar: 'https://i.pravatar.cc/150?img=10',
    },
    {
      nombre: 'Lic. Patricia Silva',
      puesto: 'Coordinadora Pedagógica',
      descripcion: 'Experta en educación especial y programas personalizados',
      avatar: 'https://i.pravatar.cc/150?img=9',
    },
    {
      nombre: 'Dr. Roberto Méndez',
      puesto: 'Psicólogo Terapeuta',
      descripcion: 'Especializado en terapia familiar y conductual',
      avatar: 'https://i.pravatar.cc/150?img=13',
    },
    {
      nombre: 'Lic. Carmen López',
      puesto: 'Terapeuta de Lenguaje',
      descripcion: 'Logopeda certificada con enfoque en desarrollo comunicativo',
      avatar: 'https://i.pravatar.cc/150?img=20',
    },
    {
      nombre: 'Lic. Jorge Ramírez',
      puesto: 'Terapeuta Ocupacional',
      descripcion: 'Especialista en integración sensorial y desarrollo motor',
      avatar: 'https://i.pravatar.cc/150?img=14',
    },
  ];

  return (
    <Box sx={{
      bgcolor: '#FFFFFF',
      color: '#333',
      width: '100%',
      minHeight: '100vh',
      m: 0,
      p: 0,
      overflowX: 'hidden',
    }}>
      {/* Header/Navbar */}
      <Box
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          bgcolor: 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(0,0,0,0.08)',
          boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              py: 2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                component="img"
                src="/LOGO TÍA GLENDA-07.png"
                alt="Centro Tía Glenda"
                sx={{ height: { xs: 60, md: 80 } }}
              />
            </Box>
            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 3, alignItems: 'center' }}>
              <Button
                sx={{ color: '#333', fontWeight: 500, '&:hover': { color: colors.primary } }}
                onClick={() => document.getElementById('servicios')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Servicios
              </Button>
              <Button
                sx={{ color: '#333', fontWeight: 500, '&:hover': { color: colors.primary } }}
                onClick={() => document.getElementById('nosotros')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Nosotros
              </Button>
              <Button
                sx={{ color: '#333', fontWeight: 500, '&:hover': { color: colors.primary } }}
                onClick={() => document.getElementById('equipo')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Equipo
              </Button>
              <Button
                variant="contained"
                sx={{
                  background: colors.gradients.turquoise,
                  '&:hover': {
                    background: colors.gradients.turquoise,
                    opacity: 0.9,
                  },
                  borderRadius: 2,
                  px: 3,
                  boxShadow: '0 4px 12px rgba(27, 160, 152, 0.3)',
                }}
                onClick={() => document.getElementById('contacto')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Contáctanos
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Hero Section */}
      <Box
        sx={{
          position: 'relative',
          minHeight: '90vh',
          display: 'flex',
          alignItems: 'center',
          overflow: 'hidden',
          bgcolor: '#F8F9FA',
        }}
      >
        {/* Fondo con gradiente del arcoíris */}
        <Box
          sx={{
            position: 'absolute',
            top: '-10%',
            right: '-5%',
            width: '50%',
            height: '120%',
            background: colors.gradients.rainbow,
            opacity: 0.1,
            borderRadius: '50%',
            filter: 'blur(60px)',
          }}
        />

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, py: 8 }}>
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <MotionBox
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <Typography
                  variant="h1"
                  sx={{
                    fontSize: { xs: '2.5rem', md: '4rem' },
                    fontWeight: 'bold',
                    mb: 3,
                    lineHeight: 1.2,
                    color: colors.primary,
                  }}
                >
                  Transforma Vidas con{' '}
                  <Box component="span" sx={{
                    background: colors.gradients.rainbow,
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}>
                    Terapia Especializada
                  </Box>
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    mb: 4,
                    color: '#666',
                    fontSize: { xs: '1rem', md: '1.25rem' },
                    lineHeight: 1.6,
                  }}
                >
                  Brindamos atención integral con un equipo multidisciplinario de profesionales
                  comprometidos con el desarrollo y bienestar de niños y adolescentes.
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <Button
                    variant="contained"
                    size="large"
                    sx={{
                      background: colors.gradients.turquoise,
                      px: 4,
                      py: 1.5,
                      fontSize: '1.1rem',
                      borderRadius: 3,
                      boxShadow: '0 4px 14px rgba(27, 160, 152, 0.4)',
                      '&:hover': {
                        background: colors.gradients.turquoise,
                        opacity: 0.9,
                        transform: 'translateY(-2px)',
                        boxShadow: '0 6px 20px rgba(27, 160, 152, 0.5)',
                      },
                      transition: 'all 0.3s',
                    }}
                    onClick={() => document.getElementById('contacto')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    Agenda tu Consulta
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    sx={{
                      borderColor: colors.primary,
                      color: colors.primary,
                      px: 4,
                      py: 1.5,
                      fontSize: '1.1rem',
                      borderRadius: 3,
                      borderWidth: 2,
                      '&:hover': {
                        borderColor: colors.primary,
                        bgcolor: `${colors.primary}10`,
                        borderWidth: 2,
                      },
                    }}
                    onClick={() => document.getElementById('nosotros')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    Conoce Más
                  </Button>
                </Stack>
              </MotionBox>
            </Grid>
            <Grid item xs={12} md={6}>
              <MotionBox
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                sx={{ position: 'relative' }}
              >
                <Box
                  component="img"
                  src="https://images.unsplash.com/photo-1516534775068-ba3e7458af70?w=800&h=600&fit=crop&q=80"
                  alt="Centro Tía Glenda"
                  sx={{
                    width: '100%',
                    height: 'auto',
                    borderRadius: 4,
                    boxShadow: `0 20px 60px ${colors.primary}33`,
                  }}
                />
              </MotionBox>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Cómo Funciona */}
      <Box id="servicios" sx={{ py: 10, bgcolor: 'white' }}>
        <Container maxWidth="lg">
          <Typography
            variant="h2"
            align="center"
            sx={{
              mb: 2,
              fontWeight: 'bold',
              fontSize: { xs: '2rem', md: '3rem' },
              color: colors.primary,
            }}
          >
            Cómo Funciona
          </Typography>
          <Typography
            variant="h6"
            align="center"
            sx={{ mb: 8, color: '#666' }}
          >
            Nuestro proceso de atención personalizada
          </Typography>
          <Grid container spacing={4}>
            {comoFunciona.map((paso, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <MotionBox
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  sx={{ textAlign: 'center' }}
                >
                  <Box
                    sx={{
                      width: 100,
                      height: 100,
                      borderRadius: '50%',
                      background: `${colors.secondary}15`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 20px',
                      border: `3px solid ${colors.secondary}`,
                    }}
                  >
                    {paso.icon}
                  </Box>
                  <Typography variant="h5" fontWeight="bold" gutterBottom color={colors.primary}>
                    {paso.titulo}
                  </Typography>
                  <Typography variant="body1" color="#666">
                    {paso.descripcion}
                  </Typography>
                </MotionBox>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Últimos Casos de Éxito */}
      <Box sx={{ py: 10, bgcolor: '#F8F9FA' }}>
        <Container maxWidth="lg">
          <Typography
            variant="h2"
            align="center"
            sx={{
              mb: 2,
              fontWeight: 'bold',
              fontSize: { xs: '2rem', md: '3rem' },
              color: colors.primary,
            }}
          >
            Casos de Éxito Recientes
          </Typography>
          <Typography
            variant="h6"
            align="center"
            sx={{ mb: 8, color: '#666' }}
          >
            Historias que inspiran y motivan nuestro trabajo diario
          </Typography>
          <Grid container spacing={4}>
            {ultimosCasos.map((caso, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <MotionCard
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -10 }}
                  sx={{
                    bgcolor: 'white',
                    borderRadius: 3,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    border: '1px solid #E0E0E0',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    '&:hover': {
                      boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                      borderColor: colors.secondary,
                    },
                  }}
                >
                  <CardMedia
                    component="img"
                    height="220"
                    image={caso.imagen}
                    alt={caso.usuario}
                    sx={{ objectFit: 'cover' }}
                  />
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar src={caso.avatar} sx={{ mr: 2, width: 50, height: 50, border: `2px solid ${colors.secondary}` }} />
                      <Typography variant="h6" fontWeight="bold" color={colors.primary}>
                        {caso.usuario}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="#666" sx={{ lineHeight: 1.6 }}>
                      {caso.descripcion}
                    </Typography>
                  </CardContent>
                </MotionCard>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Beneficios/Estadísticas */}
      <Box sx={{ py: 10, bgcolor: 'white' }}>
        <Container maxWidth="lg">
          <Typography
            variant="h2"
            align="center"
            sx={{
              mb: 2,
              fontWeight: 'bold',
              fontSize: { xs: '2rem', md: '3rem' },
              color: colors.primary,
            }}
          >
            Nuestra Trayectoria
          </Typography>
          <Typography
            variant="h6"
            align="center"
            sx={{ mb: 8, color: '#666' }}
          >
            Números que reflejan nuestro compromiso
          </Typography>
          <Grid container spacing={4}>
            {beneficios.map((beneficio, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <MotionCard
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  sx={{
                    background: beneficio.color,
                    borderRadius: 4,
                    p: 4,
                    height: 280,
                    position: 'relative',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                    color: 'white',
                  }}
                >
                  <Typography
                    variant="h1"
                    fontWeight="bold"
                    sx={{ mb: 1, fontSize: '4rem' }}
                  >
                    {beneficio.numero}
                  </Typography>
                  <Typography variant="h5" fontWeight="bold" gutterBottom>
                    {beneficio.titulo}
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.95 }}>
                    {beneficio.descripcion}
                  </Typography>
                </MotionCard>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Mejor Equipo */}
      <Box id="equipo" sx={{ py: 10, bgcolor: '#F8F9FA' }}>
        <Container maxWidth="lg">
          <Typography
            variant="h2"
            align="center"
            sx={{
              mb: 2,
              fontWeight: 'bold',
              fontSize: { xs: '2rem', md: '3rem' },
              color: colors.primary,
            }}
          >
            Nuestro Equipo Profesional
          </Typography>
          <Typography
            variant="h6"
            align="center"
            sx={{ mb: 8, color: '#666' }}
          >
            Especialistas dedicados a tu bienestar
          </Typography>
          <Stack spacing={3}>
            {mejoresTerapeutas.map((terapeuta, index) => (
              <MotionBox
                key={index}
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card
                  sx={{
                    bgcolor: 'white',
                    borderRadius: 3,
                    p: 3,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 3,
                    border: '1px solid #E0E0E0',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    '&:hover': {
                      boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                      borderColor: colors.secondary,
                    },
                    transition: 'all 0.3s',
                  }}
                >
                  <Box
                    sx={{
                      minWidth: 70,
                      height: 70,
                      borderRadius: 2,
                      background: colors.gradients.turquoise,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '2rem',
                      fontWeight: 'bold',
                      color: 'white',
                    }}
                  >
                    {String(index + 1).padStart(2, '0')}
                  </Box>
                  <Avatar
                    src={terapeuta.avatar}
                    sx={{ width: 70, height: 70, border: `3px solid ${colors.primary}` }}
                  />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" fontWeight="bold" gutterBottom color={colors.primary}>
                      {terapeuta.nombre}
                    </Typography>
                    <Typography variant="body2" sx={{ color: colors.secondary, fontWeight: 600 }} gutterBottom>
                      {terapeuta.puesto}
                    </Typography>
                    <Typography variant="body2" color="#666">
                      {terapeuta.descripcion}
                    </Typography>
                  </Box>
                </Card>
              </MotionBox>
            ))}
          </Stack>
        </Container>
      </Box>

      {/* Sobre Nosotros */}
      <Box id="nosotros" sx={{ py: 10, bgcolor: 'white' }}>
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <MotionBox
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <Box
                  component="img"
                  src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&h=600&fit=crop&q=80"
                  alt="Sobre Nosotros"
                  sx={{
                    width: '100%',
                    height: 'auto',
                    borderRadius: 4,
                    boxShadow: `0 20px 60px ${colors.primary}22`,
                  }}
                />
              </MotionBox>
            </Grid>
            <Grid item xs={12} md={6}>
              <MotionBox
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <Typography
                  variant="h2"
                  sx={{
                    mb: 3,
                    fontWeight: 'bold',
                    fontSize: { xs: '2rem', md: '3rem' },
                    color: colors.primary,
                  }}
                >
                  Somos Centro Tía Glenda
                </Typography>
                <Typography variant="body1" sx={{ mb: 3, color: '#666', lineHeight: 1.8, fontSize: '1.1rem' }}>
                  Desde hace más de 15 años, nos dedicamos a brindar atención terapéutica y pedagógica
                  especializada. Nuestro equipo multidisciplinario está conformado por profesionales
                  altamente capacitados y comprometidos con el desarrollo integral de cada paciente.
                </Typography>
                <Typography variant="body1" sx={{ mb: 4, color: '#666', lineHeight: 1.8, fontSize: '1.1rem' }}>
                  Creemos en un enfoque personalizado que considera las necesidades únicas de cada
                  familia. Trabajamos en conjunto para lograr objetivos significativos y duraderos.
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  sx={{
                    background: colors.gradients.turquoise,
                    px: 4,
                    py: 1.5,
                    borderRadius: 3,
                    boxShadow: '0 4px 14px rgba(27, 160, 152, 0.4)',
                    '&:hover': {
                      background: colors.gradients.turquoise,
                      opacity: 0.9,
                    },
                  }}
                  onClick={() => document.getElementById('contacto')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Conoce Más Sobre Nosotros
                </Button>
              </MotionBox>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Formulario de Contacto */}
      <Box
        id="contacto"
        sx={{
          py: 10,
          background: colors.gradients.purple,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
          <MotionBox
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <Typography
              variant="h2"
              align="center"
              sx={{ mb: 2, fontWeight: 'bold', fontSize: { xs: '2rem', md: '3rem' }, color: 'white' }}
            >
              ¿Listo para Comenzar?
            </Typography>
            <Typography
              variant="h6"
              align="center"
              sx={{ mb: 6, color: 'white', opacity: 0.95 }}
            >
              Contáctanos hoy y da el primer paso hacia una vida mejor
            </Typography>

            <Box
              component="form"
              onSubmit={handleSubmit}
              sx={{
                bgcolor: 'white',
                borderRadius: 4,
                p: 4,
                boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
              }}
            >
              <Stack spacing={3}>
                <TextField
                  fullWidth
                  label="Escribe tu mensaje aquí"
                  name="mensaje"
                  multiline
                  rows={5}
                  value={mensaje}
                  onChange={(e) => setMensaje(e.target.value)}
                  required
                  placeholder="Hola, me gustaría obtener más información sobre..."
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&.Mui-focused fieldset': {
                        borderColor: colors.primary,
                      },
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: colors.primary,
                    },
                  }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  startIcon={<WhatsApp />}
                  sx={{
                    background: '#25D366',
                    color: 'white',
                    py: 2,
                    fontSize: '1.1rem',
                    borderRadius: 2,
                    boxShadow: '0 4px 14px rgba(37, 211, 102, 0.4)',
                    '&:hover': {
                      background: '#1da851',
                    },
                  }}
                >
                  Enviar por WhatsApp
                </Button>
              </Stack>
            </Box>
          </MotionBox>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ py: 8, bgcolor: '#2C2C2C', color: 'white' }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Box
                component="img"
                src="/LOGO TÍA GLENDA-07.png"
                alt="Centro Tía Glenda"
                sx={{ height: 80, mb: 2 }}
              />
              <Typography variant="body2" color="rgba(255,255,255,0.7)" sx={{ mb: 3 }}>
                Centro de Acompañamiento Pedagógico y Terapéutico
              </Typography>
              <Stack direction="row" spacing={1}>
                <IconButton sx={{ bgcolor: '#1877f2', color: 'white', '&:hover': { bgcolor: '#145dbf' } }}>
                  <Facebook />
                </IconButton>
                <IconButton sx={{ bgcolor: '#E4405F', color: 'white', '&:hover': { bgcolor: '#d62951' } }}>
                  <Instagram />
                </IconButton>
                <IconButton sx={{ bgcolor: colors.secondary, color: 'white', '&:hover': { bgcolor: colors.primary } }}>
                  <Twitter />
                </IconButton>
              </Stack>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Contacto
              </Typography>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Email sx={{ color: colors.secondary }} />
                  <Typography variant="body2" color="rgba(255,255,255,0.7)">
                    centrotiaglenda@gmail.com
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Phone sx={{ color: colors.secondary }} />
                  <Typography variant="body2" color="rgba(255,255,255,0.7)">
                    +593 096 959 9646
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocationOn sx={{ color: colors.secondary }} />
                  <Typography variant="body2" color="rgba(255,255,255,0.7)">
                    La Chala, Kennedy Norte, Guayaquil, Guayas 090101, Ecuador
                  </Typography>
                </Box>
              </Stack>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Enlaces Rápidos
              </Typography>
              <Stack spacing={1}>
                <Button
                  sx={{ color: 'rgba(255,255,255,0.7)', justifyContent: 'flex-start', textTransform: 'none' }}
                  onClick={() => document.getElementById('servicios')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Servicios
                </Button>
                <Button
                  sx={{ color: 'rgba(255,255,255,0.7)', justifyContent: 'flex-start', textTransform: 'none' }}
                  onClick={() => document.getElementById('nosotros')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Nosotros
                </Button>
                <Button
                  sx={{ color: 'rgba(255,255,255,0.7)', justifyContent: 'flex-start', textTransform: 'none' }}
                  onClick={() => document.getElementById('equipo')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Equipo
                </Button>
                <Button
                  sx={{ color: 'rgba(255,255,255,0.7)', justifyContent: 'flex-start', textTransform: 'none' }}
                  onClick={() => document.getElementById('contacto')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Contacto
                </Button>
              </Stack>
            </Grid>
          </Grid>
          <Divider sx={{ my: 4, bgcolor: 'rgba(255,255,255,0.1)' }} />
          <Typography variant="body2" align="center" color="rgba(255,255,255,0.5)">
            © 2025 Centro Tía Glenda. Todos los derechos reservados.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage;

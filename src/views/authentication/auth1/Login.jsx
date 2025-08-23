import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Stack,
  TextField,
  Alert,
  Card,
  CardContent,
} from '@mui/material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import PageContainer from 'src/components/container/PageContainer';
import useAuth from 'src/hooks/useAuth';
import ApiService from 'src/services/apiService';
import { API_ENDPOINTS } from 'src/config/api';

// Esquema de validación con Yup
const validationSchema = Yup.object({
  usuario: Yup.string().required('El usuario es requerido'),
  contrasenia: Yup.string().min(6, 'La contraseña debe tener al menos 6 caracteres').required('La contraseña es requerida'),
});

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [errorMsg, setErrorMsg] = useState('');
  const { login, isAuthenticated } = useAuth();

  // Si ya está autenticado, redirigir al dashboard o la página original
  React.useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  const formik = useFormik({
    initialValues: {
      usuario: '',
      contrasenia: '',
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      setErrorMsg('');
      try {
        const response = await ApiService.post(API_ENDPOINTS.AUTH.LOGIN, {
          usuario: values.usuario,
          contrasenia: values.contrasenia,
        });
        
        const data = response?.data || response;
        
        if (data.status === 'success' && data.data?.token) {
          const loginSuccess = login(data.data.token, data.data.user, data);
          if (loginSuccess) {
            console.log('Login data saved:', data);
            const from = location.state?.from?.pathname || '/dashboard';
            navigate(from, { replace: true });
          } else {
            setErrorMsg('Error al procesar el login');
          }
        } else {
          setErrorMsg(data.message || 'Credenciales incorrectas');
        }
      } catch (error) {
        console.error('Error en login:', error);
        setErrorMsg(
          error?.response?.data?.message ||
          error?.message ||
          'Error de conexión o credenciales incorrectas'
        );
      }
      setSubmitting(false);
    },
  });

  return (
    <PageContainer title="Login" description="Página de inicio de sesión">
      <Box
        sx={{
          minHeight: '100vh',
          // ⬇️ Imagen de fondo con overlay sutil
          backgroundImage: `linear-gradient(rgba(227,234,252,0.75), rgba(248,249,255,0.75)), url('/fondo-login1.jpg')`,
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: { md: 'fixed' },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Card
          elevation={10}
          sx={{
            width: '100%',
            maxWidth: 420,
            borderRadius: 4,
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(33, 150, 243, 0.12)',
            position: 'relative',
            backdropFilter: 'saturate(1.1) blur(0px)', // opcional
          }}
        >
          {/* Barra superior con título y logo alineados */}
          <Box
            sx={{
              bgcolor: '#6C4ACF',
              py: 2.5,
              px: 3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Typography
              variant="h6"
              fontWeight={600}
              color="white"
              sx={{ letterSpacing: 1 }}
            >
              Plataforma del Centro Tia Glenda
            </Typography>
            <img
              src="/logo.png"
              alt="Logo Tia Glenda"
              style={{ width: '74px', height: 'auto', marginLeft: 12 }}
            />
          </Box>

          <CardContent sx={{ px: 4, py: 5 }}>
            <Typography
              variant="subtitle1"
              textAlign="center"
              color="textSecondary"
              mb={2}
              fontWeight={500}
            >
              Bienvenido/a
            </Typography>
            <Typography
              variant="body2"
              textAlign="center"
              color="textSecondary"
              mb={3}
            >
              Inicia sesión para continuar
            </Typography>

            <form onSubmit={formik.handleSubmit}>
              <Stack spacing={3}>
                <Box>
                  <Typography
                    variant="subtitle2"
                    fontWeight={600}
                    component="label"
                    htmlFor="usuario"
                    mb="5px"
                  >
                    Usuario
                  </Typography>
                  <TextField
                    id="usuario"
                    name="usuario"
                    type="text"
                    variant="outlined"
                    fullWidth
                    value={formik.values.usuario}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.usuario && Boolean(formik.errors.usuario)}
                    helperText={formik.touched.usuario && formik.errors.usuario}
                    placeholder="admin"
                  />
                </Box>

                <Box>
                  <Typography
                    variant="subtitle2"
                    fontWeight={600}
                    component="label"
                    htmlFor="contrasenia"
                    mb="5px"
                  >
                    Contraseña
                  </Typography>
                  <TextField
                    id="contrasenia"
                    name="contrasenia"
                    type="password"
                    variant="outlined"
                    fullWidth
                    value={formik.values.contrasenia}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.contrasenia && Boolean(formik.errors.contrasenia)}
                    helperText={formik.touched.contrasenia && formik.errors.contrasenia}
                    placeholder="••••••••"
                  />
                </Box>

                <Box>
                  <Button
                    color="primary"
                    variant="contained"
                    size="large"
                    fullWidth
                    type="submit"
                    disabled={formik.isSubmitting}
                    sx={{
                      fontWeight: 'bold',
                      fontSize: '1rem',
                      letterSpacing: 1,
                      borderRadius: 3,
                      background: 'linear-gradient(90deg, #6C4ACF 0%, #8F6FE6 100%)',
                      boxShadow: '0 4px 15px rgba(108, 74, 207, 0.15)',
                      mb: 2,
                      mt: 1,
                      '&:hover': {
                        background: 'linear-gradient(90deg, #8F6FE6 0%, #6C4ACF 100%)',
                      },
                    }}
                  >
                    {formik.isSubmitting ? 'Iniciando sesión...' : 'INICIAR SESIÓN'}
                  </Button>
                </Box>

                {errorMsg && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    {errorMsg}
                  </Alert>
                )}
              </Stack>
            </form>
          </CardContent>

          {/* Barra inferior decorativa */}
          <Box
            sx={{
              width: '100%',
              height: 18,
              bgcolor: '#6C4ACF',
              position: 'absolute',
              left: 0,
              bottom: 0,
            }}
          >
            <Box sx={{ flex: 1, bgcolor: '#6C4ACF' }} />
            <Box sx={{ flex: 1, bgcolor: '#fff' }} />
            <Box sx={{ flex: 1, bgcolor: '#6C4ACF' }} />
            <Box sx={{ flex: 1, bgcolor: '#fff' }} />
            <Box sx={{ flex: 1, bgcolor: '#6C4ACF' }} />
          </Box>
        </Card>
      </Box>
    </PageContainer>
  );
};

export default Login;

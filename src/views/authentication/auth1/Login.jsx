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
  useTheme,
} from '@mui/material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import PageContainer from 'src/components/container/PageContainer';
import useAuth from 'src/hooks/useAuth';
import { useConfig } from 'src/contexts/ConfigContext';
import ApiService from 'src/services/apiService';
import { API_ENDPOINTS } from 'src/config/api';

// Esquema de validación con Yup
const validationSchema = Yup.object({
  usuario: Yup.string().required('El usuario es requerido'),
  contrasenia: Yup.string().min(6, 'La contraseña debe tener al menos 6 caracteres').required('La contraseña es requerida'),
});

const Login = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [errorMsg, setErrorMsg] = useState('');
  const { login, isAuthenticated } = useAuth();
  const { initConfig } = useConfig();

  // Si ya está autenticado, redirigir al dashboard o la página original
  React.useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/app/dashboard';
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
            // Inicializar configuracion despues del login exitoso
            initConfig();
            const from = location.state?.from?.pathname || '/app';
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
    <>
      {/* Reset global y estilos base */}
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        html, body {
          width: 100%;
          height: 100%;
          overflow-x: hidden;
        }
        
        #root {
          width: 100vw;
          min-height: 100vh;
        }
        
        .full-screen-login {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background-image: 
            radial-gradient(ellipse 1000px 700px at center, rgba(255,255,255,0.1) 20%, rgba(255,255,255,0.4) 60%, rgba(255,255,255,0.7) 90%),
            linear-gradient(to right, rgba(248,249,255,0.6) 0%, rgba(248,249,255,0.1) 30%, rgba(248,249,255,0.1) 70%, rgba(248,249,255,0.6) 100%),
            url('/fondo-login1.jpg');
          background-repeat: no-repeat;
          background-position: center center;
          background-size: cover;
          background-attachment: fixed;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        
        @media (min-width: 768px) {
          .full-screen-login {
            background-size: 120% auto;
          }
        }
        
        @media (min-width: 1024px) {
          .full-screen-login {
            background-size: 130% auto;
          }
        }
        
        @media (min-width: 1440px) {
          .full-screen-login {
            background-size: 140% auto;
          }
        }
        
        .login-card-container {
          width: 100%;
          max-width: 420px;
          margin: 0 20px;
          z-index: 1001;
        }
        
        @media (max-width: 480px) {
          .login-card-container {
            max-width: 360px;
            margin: 0 16px;
          }
        }
      `}</style>

      <div className="full-screen-login">
        <div className="login-card-container">
          <Card
            elevation={24}
            sx={{
              borderRadius: 4,
              overflow: 'hidden',
              boxShadow: '0 25px 50px rgba(108, 74, 207, 0.15), 0 12px 24px rgba(0, 0, 0, 0.1)',
              backgroundColor: 'rgba(255, 255, 255, 0.98)',
              backdropFilter: 'blur(20px) saturate(1.5)',
              border: '1px solid rgba(255, 255, 255, 0.6)',
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: -2,
                left: -2,
                right: -2,
                bottom: -2,
                background: 'linear-gradient(45deg, rgba(108, 74, 207, 0.1), rgba(143, 111, 230, 0.1))',
                borderRadius: 5,
                zIndex: -1,
              }
            }}
          >
            {/* Barra superior con título y logo */}
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
                style={{ width: '100px', height: 'auto', marginLeft: 12 }}
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
              <Box sx={{ flex: 1, bgcolor: 'background.paper' }} />
              <Box sx={{ flex: 1, bgcolor: '#6C4ACF' }} />
              <Box sx={{ flex: 1, bgcolor: 'background.paper' }} />
              <Box sx={{ flex: 1, bgcolor: '#6C4ACF' }} />
            </Box>
          </Card>
        </div>
      </div>
    </>
  );
};

export default Login;
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
import { Link, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import PageContainer from 'src/components/container/PageContainer';
import axios from 'axios';

// Esquema de validación con Yup
const validationSchema = Yup.object({
  usuario: Yup.string().required('El usuario es requerido'),
  contrasenia: Yup.string().min(6, 'La contraseña debe tener al menos 6 caracteres').required('La contraseña es requerida'),
});

const Login = () => {
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState('');

  const formik = useFormik({
    initialValues: {
      usuario: '',
      contrasenia: '',
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      setErrorMsg('');
      try {
        const res = await axios.post('http://localhost:5000/api/login', {
          usuario: values.usuario,
          contrasenia: values.contrasenia,
        });
        if (res.data.status === 'success' && res.data.data.token) {
          localStorage.setItem('jwt_token', res.data.data.token);
          localStorage.setItem('user', JSON.stringify(res.data.data.user));
          navigate('/dashboard');
        } else {
          setErrorMsg(res.data.message || 'Credenciales incorrectas');
        }
      } catch (error) {
        setErrorMsg(
          error.response?.data?.message ||
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
          background: 'linear-gradient(135deg, #e3eafc 0%, #f8f9ff 100%)',
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
          {/* Fin barra superior */}

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
import React, { useState } from 'react';
import {
  Box,
  Typography,
  FormGroup,
  FormControlLabel,
  Button,
  Stack,
  Checkbox,
  TextField,
  Alert,
  Card,
  CardContent,
  Grid,
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
      rememberMe: false,
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
          position: 'relative',
          '&:before': {
            content: '""',
            background: 'radial-gradient(#d2f1df, #d3d7fa, #bad8f4)',
            backgroundSize: '400% 400%',
            animation: 'gradient 15s ease infinite',
            position: 'absolute',
            height: '100%',
            width: '100%',
            opacity: '0.3',
          },
        }}
      >
        <Grid container spacing={0} justifyContent="center" sx={{ height: '100vh' }}>
          <Grid
            item
            xs={12}
            sm={12}
            lg={4}
            xl={3}
            display="flex"
            justifyContent="center"
            alignItems="center"
          >
            <Card elevation={9} sx={{ p: 4, zIndex: 1, width: '100%', maxWidth: '500px' }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="center" mb={3}>
                  <Typography variant="h2" fontWeight={700} color="primary">
                    Mi App
                  </Typography>
                </Box>

                <Typography
                  variant="subtitle1"
                  textAlign="center"
                  color="textSecondary"
                  mb={1}
                >
                  Bienvenido de vuelta
                </Typography>
                <Typography
                  variant="subtitle1"
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
                        variant="subtitle1"
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
                        variant="subtitle1"
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

                    <Stack
                      justifyContent="space-between"
                      direction="row"
                      alignItems="center"
                      my={2}
                    >
                      <FormGroup>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={formik.values.rememberMe}
                              onChange={formik.handleChange}
                              name="rememberMe"
                            />
                          }
                          label="Recordarme"
                        />
                      </FormGroup>
                      <Typography
                        component={Link}
                        to="/auth/forgot-password"
                        fontWeight="500"
                        sx={{
                          textDecoration: 'none',
                          color: 'primary.main',
                        }}
                      >
                        ¿Olvidaste tu contraseña?
                      </Typography>
                    </Stack>

                    <Box>
                      <Button
                        color="primary"
                        variant="contained"
                        size="large"
                        fullWidth
                        type="submit"
                        disabled={formik.isSubmitting}
                        sx={{ mb: 2 }}
                      >
                        {formik.isSubmitting ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                      </Button>
                    </Box>

                    {errorMsg && (
                      <Alert severity="error" sx={{ mt: 2 }}>
                        {errorMsg}
                      </Alert>
                    )}
                  </Stack>
                </form>

                <Typography
                  variant="subtitle1"
                  textAlign="center"
                  color="textSecondary"
                  mt={3}
                >
                  ¿No tienes una cuenta?{' '}
                  <Typography
                    component={Link}
                    to="/auth/register"
                    fontWeight="500"
                    sx={{
                      textDecoration: 'none',
                      color: 'primary.main',
                    }}
                  >
                    Regístrate
                  </Typography>
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </PageContainer>
  );
};

export default Login;
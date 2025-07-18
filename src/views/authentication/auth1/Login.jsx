// src/views/authentication/auth1/Login.js
import React from 'react';
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

// Esquema de validación con Yup
const validationSchema = Yup.object({
  email: Yup.string()
    .email('Ingresa un email válido')
    .required('El email es requerido'),
  password: Yup.string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .required('La contraseña es requerida'),
});

const Login = () => {
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting, setFieldError }) => {
      try {
        // Aquí iría la lógica de autenticación
        console.log('Login attempt:', values);
        
        // Simulación de login exitoso
        setTimeout(() => {
          setSubmitting(false);
          navigate('/dashboard');
        }, 1000);
      } catch (error) {
        setSubmitting(false);
        setFieldError('password', 'Email o contraseña incorrectos');
      }
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
                        htmlFor="email"
                        mb="5px"
                      >
                        Email
                      </Typography>
                      <TextField
                        id="email"
                        name="email"
                        type="email"
                        variant="outlined"
                        fullWidth
                        value={formik.values.email}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.email && Boolean(formik.errors.email)}
                        helperText={formik.touched.email && formik.errors.email}
                        placeholder="usuario@ejemplo.com"
                      />
                    </Box>

                    <Box>
                      <Typography
                        variant="subtitle1"
                        fontWeight={600}
                        component="label"
                        htmlFor="password"
                        mb="5px"
                      >
                        Contraseña
                      </Typography>
                      <TextField
                        id="password"
                        name="password"
                        type="password"
                        variant="outlined"
                        fullWidth
                        value={formik.values.password}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.password && Boolean(formik.errors.password)}
                        helperText={formik.touched.password && formik.errors.password}
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

                    {formik.errors.submit && (
                      <Alert severity="error" sx={{ mt: 2 }}>
                        {formik.errors.submit}
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
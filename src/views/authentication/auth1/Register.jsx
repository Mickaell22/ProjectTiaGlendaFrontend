// src/views/authentication/auth1/Register.js
import React from 'react';
import {
  Box,
  Typography,
  Button,
  Stack,
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
  name: Yup.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .required('El nombre es requerido'),
  email: Yup.string()
    .email('Ingresa un email válido')
    .required('El email es requerido'),
  password: Yup.string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .required('La contraseña es requerida'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Las contraseñas deben coincidir')
    .required('Confirma tu contraseña'),
});

const Register = () => {
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting, setFieldError }) => {
      try {
        // Aquí iría la lógica de registro
        console.log('Register attempt:', values);
        
        // Simulación de registro exitoso
        setTimeout(() => {
          setSubmitting(false);
          navigate('/auth/login');
        }, 1000);
      } catch (error) {
        setSubmitting(false);
        setFieldError('email', 'Este email ya está registrado');
      }
    },
  });

  return (
    <PageContainer title="Registro" description="Página de registro">
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
                  Crear nueva cuenta
                </Typography>
                <Typography
                  variant="subtitle1"
                  textAlign="center"
                  color="textSecondary"
                  mb={3}
                >
                  Completa los datos para registrarte
                </Typography>

                <form onSubmit={formik.handleSubmit}>
                  <Stack spacing={3}>
                    <Box>
                      <Typography
                        variant="subtitle1"
                        fontWeight={600}
                        component="label"
                        htmlFor="name"
                        mb="5px"
                      >
                        Nombre Completo
                      </Typography>
                      <TextField
                        id="name"
                        name="name"
                        type="text"
                        variant="outlined"
                        fullWidth
                        value={formik.values.name}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.name && Boolean(formik.errors.name)}
                        helperText={formik.touched.name && formik.errors.name}
                        placeholder="Tu nombre completo"
                      />
                    </Box>

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

                    <Box>
                      <Typography
                        variant="subtitle1"
                        fontWeight={600}
                        component="label"
                        htmlFor="confirmPassword"
                        mb="5px"
                      >
                        Confirmar Contraseña
                      </Typography>
                      <TextField
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        variant="outlined"
                        fullWidth
                        value={formik.values.confirmPassword}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
                        helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
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
                        sx={{ mb: 2 }}
                      >
                        {formik.isSubmitting ? 'Registrando...' : 'Crear Cuenta'}
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
                  ¿Ya tienes una cuenta?{' '}
                  <Typography
                    component={Link}
                    to="/auth/login"
                    fontWeight="500"
                    sx={{
                      textDecoration: 'none',
                      color: 'primary.main',
                    }}
                  >
                    Inicia sesión
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

export default Register;
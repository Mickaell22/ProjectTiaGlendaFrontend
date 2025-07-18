// src/routes/Router.js
import { lazy } from 'react';
import { Navigate } from 'react-router-dom';
import Loadable from './Loadable';

// Layouts
const FullLayout = Loadable(lazy(() => import('src/layouts/full/FullLayout')));
const BlankLayout = Loadable(lazy(() => import('src/layouts/blank/BlankLayout')));

// Authentication pages
const Login = Loadable(lazy(() => import('src/views/authentication/auth1/Login')));
const Register = Loadable(lazy(() => import('src/views/authentication/auth1/Register')));

// Dashboard
const Dashboard = Loadable(lazy(() => import('src/views/dashboard/Dashboard')));

const Router = [
  {
    path: '/',
    element: <FullLayout />,
    children: [
      { path: '/', element: <Navigate to="/dashboard" /> },
      { path: '/dashboard', exact: true, element: <Dashboard /> },
    ],
  },
  {
    path: '/auth',
    element: <BlankLayout />,
    children: [
      { path: '404', element: <Navigate to="/auth/login" /> },
      { path: '/auth/login', element: <Login /> },
      { path: '/auth/register', element: <Register /> },
      { path: '*', element: <Navigate to="/auth/404" /> },
    ],
  },
];

export default Router;
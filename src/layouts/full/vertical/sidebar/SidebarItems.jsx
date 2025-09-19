// src/layouts/full/vertical/sidebar/SidebarItems.jsx
import React from 'react';
import Menuitems from './MenuItems';
import { useLocation } from 'react-router';
import { Box, List, useMediaQuery } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { toggleMobileSidebar } from 'src/store/customizer/CustomizerSlice';
import NavItem from './NavItem';
import NavCollapse from './NavCollapse';
import NavGroup from './NavGroup';

const SidebarItems = () => {
  const { pathname } = useLocation();
  const pathDirect = pathname;
  const pathWithoutLastPart = pathname.slice(0, pathname.lastIndexOf('/'));
  const customizer = useSelector((state) => state.customizer);
  const lgUp = useMediaQuery((theme) => theme.breakpoints.up('lg'));
  const hideMenu = lgUp ? customizer.sidebarCollapse && !customizer.isSidebarHover : '';
  const dispatch = useDispatch();

  // Obtener información del usuario desde localStorage para filtrado
  const getUserRole = () => {
    try {
      const userData = localStorage.getItem('user_data');
      if (userData) {
        const parsedData = JSON.parse(userData);
        return parsedData.rol_nombre || parsedData.rol || '';
      }

      // Fallback: intentar desde JWT token
      const token = localStorage.getItem('jwt_token');
      if (token && token.split('.').length === 3) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.rol || payload.rol_nombre || '';
      }
    } catch (error) {
      console.error('Error obteniendo rol de usuario:', error);
    }
    return '';
  };

  // Filtrar elementos del menú según el rol del usuario
  const filterMenuByRole = (menuItems, userRole) => {
    const role = userRole.toLowerCase();

    // Administradores ven todo
    if (role === 'administrador') {
      return menuItems;
    }

    // IDs permitidos para terapeutas
    const therapistAllowedSections = [
      'Panel Principal',
      'Área Clínica y Educativa',
      'Mi Cuenta'
    ];

    const therapistAllowedItems = [
      'Dashboard',
      'Pacientes y Estudiantes',
      'Área Terapéutica',
      'Mi Perfil',
      'Cerrar Sesión'
    ];

    // IDs permitidos para pedagogos
    const pedagogueAllowedSections = [
      'Panel Principal',
      'Área Clínica y Educativa',
      'Mi Cuenta'
    ];

    const pedagogueAllowedItems = [
      'Dashboard',
      'Pacientes y Estudiantes',
      'Área Pedagógica',
      'Mi Perfil',
      'Cerrar Sesión'
    ];

    return menuItems.filter(item => {
      // Mantener siempre los separadores permitidos
      if (item.subheader) {
        if (role === 'terapeuta') {
          return therapistAllowedSections.includes(item.subheader);
        } else if (role.includes('pedag')) {
          return pedagogueAllowedSections.includes(item.subheader);
        }
        return false;
      }

      // Filtrar elementos del menú
      if (role === 'terapeuta') {
        return therapistAllowedItems.includes(item.title);
      } else if (role.includes('pedag')) {
        return pedagogueAllowedItems.includes(item.title);
      }

      return false;
    });
  };

  const userRole = getUserRole();
  const filteredMenuItems = filterMenuByRole(Menuitems, userRole);

  return (
    <Box sx={{ px: 3 }}>
      <List sx={{ pt: 0 }} className="sidebarNav">
        {filteredMenuItems.map((item, index) => {
          // {/********SubHeader**********/}
          if (item.subheader) {
            return <NavGroup item={item} hideMenu={hideMenu} key={item.subheader} />;

            // {/********If Sub Menu**********/}
            /* eslint no-else-return: "off" */
          } else if (item.children) {
            return (
              <NavCollapse
                menu={item}
                pathDirect={pathDirect}
                hideMenu={hideMenu}
                pathWithoutLastPart={pathWithoutLastPart}
                level={1}
                key={item.id}
                onClick={() => dispatch(toggleMobileSidebar())}
              />
            );

            // {/********If Sub No Menu**********/}
          } else {
            return (
              <NavItem
                item={item}
                key={item.id}
                pathDirect={pathDirect}
                hideMenu={hideMenu}
                onClick={() => dispatch(toggleMobileSidebar())}
              />
            );
          }
        })}
      </List>
    </Box>
  );
};

export default SidebarItems;
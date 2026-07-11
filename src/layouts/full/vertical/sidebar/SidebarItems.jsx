// src/layouts/full/vertical/sidebar/SidebarItems.jsx
import React from 'react';
import { getMenuItems } from './MenuItems';
import { useAuth } from 'src/contexts/AuthContext';
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

  // Usar el usuario del contexto de autenticación
  const { user, isLoading } = useAuth();
  const menuItems = getMenuItems(user);

  // Si el usuario aún no está cargado, mostrar loader o nada
  if (isLoading) {
    return <Box sx={{ px: 3, py: 4 }}><span>Cargando menú...</span></Box>;
  }

  return (
    <Box sx={{ px: 3 }}>
      <List sx={{ pt: 0 }} className="sidebarNav">
        {menuItems.map((item, _index) => {
          if (item.subheader) {
            return <NavGroup item={item} hideMenu={hideMenu} key={item.subheader} />;
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
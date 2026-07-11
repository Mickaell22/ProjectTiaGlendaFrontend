// src/layouts/full/vertical/sidebar/NavItem.jsx
import React from 'react';
import { ListItemButton, ListItemIcon, ListItemText, styled, useMediaQuery } from '@mui/material';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useAuth } from 'src/contexts/AuthContext';
import PropTypes from 'prop-types';

const NavItem = ({ item, level, pathDirect, hideMenu, onClick }) => {
  const lgUp = useMediaQuery((theme) => theme.breakpoints.up('lg'));
  const customizer = useSelector((state) => state.customizer);
  const { logout } = useAuth();
  
  const Icon = item.icon;
  const itemIcon = <Icon stroke={1.5} size="1.3rem" />;

  const handleClick = (e) => {
    if (item.action === 'logout') {
      e.preventDefault();
      logout();
      return;
    }
    if (onClick && !lgUp) {
      onClick();
    }
  };

  const ListItemStyled = styled(ListItemButton)(({ theme }) => ({
    padding: '8px 10px',
    borderRadius: `${customizer.borderRadius}px`,
    marginBottom: level > 1 ? '3px' : '7px',
    color: theme.palette.text.secondary,
    paddingLeft: hideMenu ? '10px' : level > 2 ? `${level * 15}px` : '10px',
    '&:hover': {
      backgroundColor: theme.palette.primary.light,
      color: theme.palette.primary.main,
    },
    '&.Mui-selected': {
      color: 'white',
      backgroundColor: theme.palette.primary.main,
      '&:hover': {
        backgroundColor: theme.palette.primary.main,
        color: 'white',
      },
    },
  }));

  return (
    <ListItemStyled
      component={item.action === 'logout' ? 'div' : Link}
      to={item.action === 'logout' ? undefined : item.href}
      disabled={item.disabled}
      selected={pathDirect === item.href}
      target={item.external ? '_blank' : ''}
      onClick={handleClick}
      sx={{ cursor: 'pointer' }}
    >
      <ListItemIcon
        sx={{
          minWidth: '36px',
          p: '3px 0',
          color: 'inherit',
        }}
      >
        {itemIcon}
      </ListItemIcon>
      <ListItemText>
        {hideMenu ? '' : item.title}
      </ListItemText>
    </ListItemStyled>
  );
};

NavItem.propTypes = {
  item: PropTypes.object,
  level: PropTypes.number,
  pathDirect: PropTypes.any,
  hideMenu: PropTypes.any,
  onClick: PropTypes.func,
};

export default NavItem;
// src/layouts/full/vertical/sidebar/NavItem.jsx
import React from 'react';
import { useTheme } from '@mui/material/styles';
import { ListItemButton, ListItemIcon, ListItemText, styled, useMediaQuery } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';

const NavItem = ({ item, level, pathDirect, hideMenu, onClick }) => {
  const lgUp = useMediaQuery((theme) => theme.breakpoints.up('lg'));
  const customizer = useSelector((state) => state.customizer);
  const { pathname } = useLocation();
  const theme = useTheme();
  
  const Icon = item.icon;
  const itemIcon = <Icon stroke={1.5} size="1.3rem" />;

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
      component={Link}
      to={item.href}
      disabled={item.disabled}
      selected={pathDirect === item.href}
      target={item.external ? '_blank' : ''}
      onClick={lgUp ? null : onClick}
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
// src/layouts/full/vertical/sidebar/NavCollapse.jsx
import React from 'react';
import {
  ListItemButton,
  ListItemIcon,
  ListItemText,
  List,
  styled,
  Collapse,
} from '@mui/material';
import {
  ExpandLess,
  ExpandMore,
} from '@mui/icons-material';
import { useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import NavItem from './NavItem';

const NavCollapse = ({ menu, level, pathWithoutLastPart, pathDirect, hideMenu, onClick }) => {
  const { pathname } = useLocation();
  
  const [open, setOpen] = React.useState(() => {
    // Abrir el grupo si la ruta actual coincide con alguno de sus hijos
    const matches = (item) =>
      (item.href && pathname.startsWith(item.href)) ||
      (item.children ? item.children.some(matches) : false);
    return menu.children ? menu.children.some(matches) : pathname.startsWith(menu.href);
  });

  const menuIcon = menu.icon ? <menu.icon sx={{ fontSize: '1.3rem' }} /> : null;

  const handleClick = () => {
    setOpen(!open);
  };

  const ListItemStyled = styled(ListItemButton)(({ theme }) => ({
    padding: '8px 10px',
    borderRadius: '7px',
    marginBottom: level > 1 ? '3px' : '7px',
    color: theme.palette.text.secondary,
    paddingLeft: hideMenu ? '10px' : level > 2 ? `${level * 15}px` : '10px',
    backgroundColor: open && level < 2 ? theme.palette.primary.light : '',
    '&:hover': {
      backgroundColor: theme.palette.primary.light,
      color: theme.palette.primary.main,
    },
    '&.Mui-selected': {
      color: theme.palette.primary.main,
      backgroundColor: theme.palette.primary.light,
      '&:hover': {
        backgroundColor: theme.palette.primary.light,
        color: theme.palette.primary.main,
      },
    },
  }));

  // If Menu has Children
  const submenus = menu.children?.map((item) => {
    if (item.children) {
      return (
        <NavCollapse
          key={item.id}
          menu={item}
          level={level + 1}
          pathWithoutLastPart={pathWithoutLastPart}
          pathDirect={pathDirect}
          hideMenu={hideMenu}
          onClick={onClick}
        />
      );
    } else {
      return (
        <NavItem
          key={item.id}
          item={item}
          level={level + 1}
          pathDirect={pathDirect}
          hideMenu={hideMenu}
          onClick={onClick}
        />
      );
    }
  });

  return (
    <React.Fragment key={menu.id}>
      <ListItemStyled onClick={handleClick} selected={pathWithoutLastPart === menu.href}>
        <ListItemIcon
          sx={{
            minWidth: '36px',
            p: '3px 0',
            color: 'inherit',
          }}
        >
          {menuIcon}
        </ListItemIcon>
        <ListItemText color="inherit">
          {hideMenu ? '' : menu.title}
        </ListItemText>
        {!hideMenu && (
          <>
            {!open ? (
              <ExpandMore sx={{ fontSize: '1rem' }} />
            ) : (
              <ExpandLess sx={{ fontSize: '1rem' }} />
            )}
          </>
        )}
      </ListItemStyled>
      <Collapse in={open} timeout="auto" unmountOnExit>
        <List component="div" disablePadding sx={{ pl: 1 }}>
          {submenus}
        </List>
      </Collapse>
    </React.Fragment>
  );
};

NavCollapse.propTypes = {
  menu: PropTypes.object,
  level: PropTypes.number,
  pathDirect: PropTypes.any,
  pathWithoutLastPart: PropTypes.any,
  hideMenu: PropTypes.any,
  onClick: PropTypes.func,
};

export default NavCollapse;
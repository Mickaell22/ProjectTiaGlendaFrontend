// src/layouts/full/vertical/sidebar/NavGroup.jsx
import { ListSubheader, styled } from '@mui/material';
import PropTypes from 'prop-types';

const NavGroup = ({ item, hideMenu }) => {

  const ListSubheaderStyle = styled(ListSubheader)(({ theme }) => ({
    fontSize: '0.75rem',
    fontWeight: '700',
    lineHeight: '1.5',
    color: theme.palette.text.primary,
    textTransform: 'uppercase',
    marginTop: '20px',
    marginBottom: '5px',
    padding: '8px 10px',
  }));

  return (
    <ListSubheaderStyle>
      {hideMenu ? '...' : item.subheader}
    </ListSubheaderStyle>
  );
};

NavGroup.propTypes = {
  item: PropTypes.object,
  hideMenu: PropTypes.any,
};

export default NavGroup;
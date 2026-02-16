// src/views/centro/CentroLista.jsx
import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TablePagination,
  IconButton,
  InputAdornment,
  Stack,
  Avatar,
  Chip,
  Tooltip,
  Box,
  useTheme
} from '@mui/material';
import {
  Business,
  Add,
  Edit,
  Delete,
  Visibility,
  Search,
  RestartAlt
} from '@mui/icons-material';

// Servicios
import CentroService from '../../services/centroService.js';

/* ---------------- Helpers ---------------- */
const purpleOutlineSX = {
  '& .MuiOutlinedInput-root': {
    '& fieldset': { borderColor: 'primary.main' },
    '&:hover fieldset': { borderColor: 'primary.main' },
    '&.Mui-focused fieldset': { borderColor: 'primary.main', borderWidth: 2 }
  }
};

const turnoLabels = {
  matutino: 'Matutino',
  vespertino: 'Vespertino',
  mixto: 'Mixto',
};

const CentroLista = ({
  centros = [],
  onEdit,
  onDelete,
  onReactivar,
  onViewDetail,
  onAddNew
}) => {
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Filtrado
  const filteredCentros = CentroService.filterCentros(centros, searchTerm);

  return (
    <Card
      elevation={8}
      sx={{
        borderRadius: 4,
        mb: 4,
        backgroundColor: 'background.paper',
        border: theme.palette.mode === 'dark' ? `1px solid ${theme.palette.divider}` : 'none',
        overflow: 'hidden',
        width: '100%',
        maxWidth: { xs: '100%', sm: 800, md: 1000 },
        mx: 'auto'
      }}
    >
      {/* Header */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: 'white',
          p: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <Box>
          <Typography variant="h6" fontWeight="bold" display="flex" alignItems="center">
            <Business sx={{ mr: 1 }} />
            Lista de Centros
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            Busca y gestiona los centros de trabajo
          </Typography>
        </Box>

        <Chip
          label={`${filteredCentros.length} centro${filteredCentros.length !== 1 ? 's' : ''}`}
          color="default"
          sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
          size="small"
        />
      </Box>

      <CardContent sx={{ p: { xs: 2, md: 4 } }}>
        {/* Toolbar */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            mb: 3,
            flexWrap: 'nowrap',
            overflowX: 'auto',
            pb: 1,
            '& > *': { flex: '0 0 auto' }
          }}
        >
          <TextField
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre o codigo..."
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              )
            }}
            sx={{
              ...purpleOutlineSX,
              minWidth: 260,
              flex: '1 1 380px'
            }}
          />

          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={onAddNew}
            sx={{
              bgcolor: theme.palette.primary.main,
              color: theme.palette.getContrastText(theme.palette.primary.main),
              '&:hover': { bgcolor: theme.palette.primary.dark }
            }}
          >
            Nuevo Centro
          </Button>
        </Box>

        {/* Tabla */}
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Centro</TableCell>
              <TableCell>Codigo</TableCell>
              <TableCell>Contacto</TableCell>
              <TableCell>Turno</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredCentros.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    {searchTerm
                      ? 'No se encontraron centros con los filtros aplicados'
                      : 'No hay centros registrados'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredCentros
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((item) => (
                  <TableRow key={item.id}>
                    {/* Centro */}
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <Avatar sx={{ mr: 2, bgcolor: item.estado === 'activo' ? 'primary.main' : 'grey.400' }}>
                          <Business />
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="bold">
                            {item.nombre}
                          </Typography>
                          {item.direccion && (
                            <Typography variant="caption" color="text.secondary">
                              {item.direccion}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </TableCell>

                    {/* Codigo */}
                    <TableCell>
                      <Chip label={item.codigo} size="small" variant="outlined" />
                    </TableCell>

                    {/* Contacto */}
                    <TableCell>
                      <Box>
                        {item.telefono && (
                          <Typography variant="body2">{item.telefono}</Typography>
                        )}
                        {item.email && (
                          <Typography variant="caption" color="text.secondary">
                            {item.email}
                          </Typography>
                        )}
                        {!item.telefono && !item.email && (
                          <Typography variant="caption" color="text.secondary">--</Typography>
                        )}
                      </Box>
                    </TableCell>

                    {/* Turno */}
                    <TableCell>
                      <Typography variant="body2">
                        {turnoLabels[item.turno_principal] || item.turno_principal || '--'}
                      </Typography>
                    </TableCell>

                    {/* Estado */}
                    <TableCell>
                      <Chip
                        label={item.estado === 'activo' ? 'Activo' : 'Inactivo'}
                        color={item.estado === 'activo' ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>

                    {/* Acciones */}
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Tooltip title="Ver detalles">
                          <IconButton color="info" size="small" onClick={() => onViewDetail(item)}>
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Editar">
                          <IconButton color="primary" size="small" onClick={() => onEdit(item)}>
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        {item.estado === 'activo' ? (
                          <Tooltip title="Desactivar">
                            <IconButton color="error" size="small" onClick={() => onDelete(item.id)}>
                              <Delete />
                            </IconButton>
                          </Tooltip>
                        ) : (
                          <Tooltip title="Reactivar">
                            <IconButton color="success" size="small" onClick={() => onReactivar(item.id)}>
                              <RestartAlt />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>

        {/* Paginacion */}
        <TablePagination
          component="div"
          count={filteredCentros.length}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 25, 50]}
          labelRowsPerPage="Filas por pagina:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} de ${count !== -1 ? count : `mas de ${to}`}`
          }
        />
      </CardContent>
    </Card>
  );
};

export default CentroLista;

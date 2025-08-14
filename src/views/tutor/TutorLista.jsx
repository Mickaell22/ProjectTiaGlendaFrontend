import React, { useState } from 'react';
import {
  Card,
  CardContent,
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
  Typography,
  Box,
  Tooltip,
  Chip,
  Avatar
} from '@mui/material';
import {
  Edit,
  Delete,
  Visibility,
  Search,
  PersonAdd,
  Person,
  FamilyRestroom,
  Phone,
  Email,
  Work
} from '@mui/icons-material';

const TutorLista = ({ 
  tutores = [], 
  onEdit, 
  onDelete, 
  onViewDetail, 
  onNewTutor,
  loading = false 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Filtrar tutores
  const filteredTutores = tutores.filter(t =>
    t.nombre_completo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.cedula?.includes(searchTerm) ||
    t.parentesco?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.telefono_emergencia?.includes(searchTerm)
  );

  return (
    <Card elevation={3} sx={{ p: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ mb: 0, display: 'flex', alignItems: 'center' }}>
          <FamilyRestroom sx={{ mr: 1 }} />
          Lista de Tutores
          <Chip 
            label={`${filteredTutores.length} tutor${filteredTutores.length !== 1 ? 'es' : ''}`} 
            color="primary" 
            size="small" 
            sx={{ ml: 2 }}
          />
        </Typography>
        <Button
          variant="contained"
          startIcon={<PersonAdd />}
          onClick={onNewTutor}
          sx={{ whiteSpace: 'nowrap' }}
        >
          Nuevo Tutor
        </Button>
      </Box>

      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Buscar tutores..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            )
          }}
        />
      </Box>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Tutor</TableCell>
            <TableCell>Cédula</TableCell>
            <TableCell>Parentesco</TableCell>
            <TableCell>Teléfono</TableCell>
            <TableCell>Estado</TableCell>
            <TableCell>Acciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredTutores.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                <Box>
                  <Search sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    {searchTerm ? 'No se encontraron tutores' : 'No hay tutores registrados'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {searchTerm
                      ? 'Intenta con otros términos de búsqueda'
                      : 'Comienza agregando el primer tutor al sistema'}
                  </Typography>
                  {!searchTerm && (
                    <Button
                      variant="contained"
                      startIcon={<PersonAdd />}
                      onClick={onNewTutor}
                      sx={{ mt: 2 }}
                    >
                      Agregar Primer Tutor
                    </Button>
                  )}
                </Box>
              </TableCell>
            </TableRow>
          ) : (
            filteredTutores.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((t) => (
              <TableRow key={t.id}>
                <TableCell>
                  <Box display="flex" alignItems="center">
                    <Avatar sx={{ mr: 2, bgcolor: 'secondary.light' }}>
                      <Person />
                    </Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight="bold">
                        {t.nombre_completo}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="flex" alignItems="center">
                        <Email sx={{ fontSize: 12, mr: 0.5 }} />
                        {t.correo || 'Sin email'}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>{t.cedula}</TableCell>
                <TableCell>
                  <Chip 
                    label={t.parentesco || 'No especificado'} 
                    color="secondary"
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center">
                    <Phone sx={{ fontSize: 14, mr: 0.5, color: 'text.secondary' }} />
                    {t.telefono || t.telefono_emergencia || 'Sin teléfono'}
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={t.estado || 'activo'} 
                    color={
                      t.estado === 'activo' ? 'success' :
                      t.estado === 'inactivo' ? 'error' : 'default'
                    }
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <Tooltip title="Ver Detalles">
                      <IconButton color="primary" onClick={() => onViewDetail(t)} size="small">
                        <Visibility fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Editar">
                      <IconButton color="success" onClick={() => onEdit(t)} size="small">
                        <Edit fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar">
                      <IconButton color="error" onClick={() => onDelete(t.id)} size="small">
                        <Delete fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      
      <TablePagination
        component="div"
        count={filteredTutores.length}
        page={page}
        onPageChange={(e, newPage) => setPage(newPage)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
        rowsPerPageOptions={[5, 10, 25, 50]}
        labelRowsPerPage="Filas por página:"
        labelDisplayedRows={({ from, to, count }) => 
          `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
        }
      />
    </Card>
  );
};

export default TutorLista;
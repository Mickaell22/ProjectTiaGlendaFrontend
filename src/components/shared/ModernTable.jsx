// src/components/shared/ModernTable.jsx
// Componente de tabla moderna reutilizable

import React from 'react';
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TablePagination,
  IconButton,
  Stack,
  Tooltip,
  Box,
  Typography,
  Chip
} from '@mui/material';
import {
  Visibility,
  Edit,
  Delete
} from '@mui/icons-material';

const ModernTable = ({
  columns,
  data,
  page,
  rowsPerPage,
  totalCount,
  onPageChange,
  onRowsPerPageChange,
  onView,
  onEdit,
  onDelete,
  renderCell,
  noDataMessage = "No hay datos disponibles",
  showActions = true,
  customActions = []
}) => {
  return (
    <Box>
      <Table>
        <TableHead>
          <TableRow>
            {columns.map((column) => (
              <TableCell key={column.id} sx={{ fontWeight: 'bold', ...column.headerStyle }}>
                {column.label}
              </TableCell>
            ))}
            {showActions && <TableCell sx={{ fontWeight: 'bold' }}>Acciones</TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length + (showActions ? 1 : 0)} align="center">
                <Typography variant="body2" color="text.secondary" sx={{ py: 4 }}>
                  {noDataMessage}
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            data
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row, index) => (
                <TableRow key={row.id || index} hover>
                  {columns.map((column) => (
                    <TableCell key={column.id}>
                      {renderCell ? renderCell(row, column) : row[column.field]}
                    </TableCell>
                  ))}
                  {showActions && (
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        {onView && (
                          <Tooltip title="Ver detalles">
                            <IconButton 
                              color="info" 
                              size="small"
                              onClick={() => onView(row)}
                            >
                              <Visibility />
                            </IconButton>
                          </Tooltip>
                        )}
                        {onEdit && (
                          <Tooltip title="Editar">
                            <IconButton 
                              color="primary" 
                              size="small"
                              onClick={() => onEdit(row)}
                            >
                              <Edit />
                            </IconButton>
                          </Tooltip>
                        )}
                        {customActions.map((action, idx) => (
                          <Tooltip key={idx} title={action.tooltip}>
                            <IconButton 
                              color={action.color || "default"}
                              size="small"
                              onClick={() => action.onClick(row)}
                            >
                              {action.icon}
                            </IconButton>
                          </Tooltip>
                        ))}
                        {onDelete && (
                          <Tooltip title="Eliminar">
                            <IconButton 
                              color="error" 
                              size="small"
                              onClick={() => onDelete(row.id)}
                            >
                              <Delete />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Stack>
                    </TableCell>
                  )}
                </TableRow>
              ))
          )}
        </TableBody>
      </Table>

      <TablePagination
        component="div"
        count={totalCount || data.length}
        page={page}
        onPageChange={onPageChange}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={onRowsPerPageChange}
        rowsPerPageOptions={[5, 10, 25, 50]}
        labelRowsPerPage="Filas por página:"
        labelDisplayedRows={({ from, to, count }) => 
          `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
        }
      />
    </Box>
  );
};

export default ModernTable;
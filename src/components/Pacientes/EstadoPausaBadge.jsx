import React, { useState, useEffect } from 'react';
import { Chip, Tooltip, Box, CircularProgress } from '@mui/material';
import { Pause, PlayArrow, Warning } from '@mui/icons-material';
import PausasService from '../../services/pausasService';

const EstadoPausaBadge = ({ pacienteId, compactMode = false, onStatusChange = null }) => {
  const [estadoPausa, setEstadoPausa] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (pacienteId) {
      cargarEstadoPausa();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- carga intencional solo al montar/cambiar la clave
  }, [pacienteId]);

  const cargarEstadoPausa = async () => {
    try {
      setLoading(true);
      const data = await PausasService.verificarPausaActiva(pacienteId);
      setEstadoPausa(data);

      if (onStatusChange) {
        onStatusChange(data);
      }
    } catch (error) {
      console.error('Error cargando estado de pausa:', error);
      setEstadoPausa(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return compactMode ? (
      <CircularProgress size={16} />
    ) : (
      <Chip
        label="Cargando..."
        size="small"
        icon={<CircularProgress size={16} />}
      />
    );
  }

  if (!estadoPausa || !estadoPausa.tiene_pausa_activa) {
    return compactMode ? (
      <Tooltip title="Paciente activo">
        <PlayArrow fontSize="small" color="success" />
      </Tooltip>
    ) : (
      <Chip
        label="Activo"
        color="success"
        size="small"
        icon={<PlayArrow />}
      />
    );
  }

  // Paciente con pausa activa
  const tipoPausa = estadoPausa.tipo_pausa;
  const esGeneral = tipoPausa === 'general';
  const diasRestantes = PausasService.calcularDiasRestantes(estadoPausa.fecha_fin_pausa);
  const esProximaVencer = diasRestantes !== null && diasRestantes > 0 && diasRestantes <= 7;

  const getLabel = () => {
    if (esGeneral) {
      if (diasRestantes !== null) {
        return `Pausado (${diasRestantes}d)`;
      }
      return 'Pausado';
    } else {
      const count = estadoPausa.especialidades_pausadas?.length || 0;
      return `${count} Esp. Pausada${count > 1 ? 's' : ''}`;
    }
  };

  const getTooltipText = () => {
    const lines = [];

    if (esGeneral) {
      lines.push('Pausa General - Todas las especialidades pausadas');
    } else {
      const count = estadoPausa.especialidades_pausadas?.length || 0;
      lines.push(`Pausa por Especialidad - ${count} especialidad${count > 1 ? 'es' : ''}`);
    }

    if (estadoPausa.motivo_pausa) {
      lines.push(`Motivo: ${estadoPausa.motivo_pausa}`);
    }

    if (estadoPausa.fecha_inicio_pausa) {
      lines.push(`Desde: ${PausasService.formatDateShort(estadoPausa.fecha_inicio_pausa)}`);
    }

    if (estadoPausa.fecha_fin_pausa) {
      lines.push(`Hasta: ${PausasService.formatDateShort(estadoPausa.fecha_fin_pausa)}`);
      if (diasRestantes !== null) {
        lines.push(`${diasRestantes} dia${diasRestantes !== 1 ? 's' : ''} restante${diasRestantes !== 1 ? 's' : ''}`);
      }
    } else {
      lines.push('Sin fecha de finalizacion');
    }

    return lines.join('\n');
  };

  if (compactMode) {
    return (
      <Tooltip title={getTooltipText()}>
        <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
          {esProximaVencer ? (
            <Warning fontSize="small" color="warning" />
          ) : (
            <Pause fontSize="small" color="error" />
          )}
        </Box>
      </Tooltip>
    );
  }

  return (
    <Tooltip title={getTooltipText()}>
      <Chip
        label={getLabel()}
        color={esProximaVencer ? 'warning' : 'error'}
        size="small"
        icon={esProximaVencer ? <Warning /> : <Pause />}
      />
    </Tooltip>
  );
};

export default EstadoPausaBadge;

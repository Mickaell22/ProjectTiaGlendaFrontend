// Temporary debug component to test data loading
import React, { useEffect, useState } from 'react';
import {
  Box, Card, CardContent, Container, Typography, Alert, 
  Grid, Button, Accordion, AccordionSummary, AccordionDetails
} from '@mui/material';
import { ExpandMore, Refresh, BugReport } from '@mui/icons-material';
import sesionTerapiaService from 'src/services/SesionTerapiaService';

const DebugSesiones = () => {
  const [debugData, setDebugData] = useState({
    pacientes: { data: [], error: null, loading: false },
    terapeutas: { data: [], error: null, loading: false },
    especialidades: { data: [], error: null, loading: false },
    sesiones: { data: [], error: null, loading: false }
  });

  const fetchAllData = async () => {
    console.log('🔍 Starting debug data fetch...');
    
    // Reset loading states
    setDebugData(prev => ({
      pacientes: { ...prev.pacientes, loading: true, error: null },
      terapeutas: { ...prev.terapeutas, loading: true, error: null },
      especialidades: { ...prev.especialidades, loading: true, error: null },
      sesiones: { ...prev.sesiones, loading: true, error: null }
    }));

    // Test pacientes
    try {
      console.log('📝 Fetching pacientes...');
      const pacientesRes = await sesionTerapiaService.getPacientesDisponibles();
      console.log('Pacientes raw response:', pacientesRes);
      
      setDebugData(prev => ({
        ...prev,
        pacientes: { 
          data: pacientesRes?.data || pacientesRes || [], 
          error: null, 
          loading: false,
          raw: pacientesRes 
        }
      }));
    } catch (error) {
      console.error('Error fetching pacientes:', error);
      setDebugData(prev => ({
        ...prev,
        pacientes: { 
          data: [], 
          error: error.message, 
          loading: false,
          raw: error.response?.data 
        }
      }));
    }

    // Test terapeutas
    try {
      console.log('👨‍⚕️ Fetching terapeutas...');
      const terapeutasRes = await sesionTerapiaService.getTerapeutasDisponibles();
      console.log('Terapeutas raw response:', terapeutasRes);
      
      setDebugData(prev => ({
        ...prev,
        terapeutas: { 
          data: terapeutasRes?.data || terapeutasRes || [], 
          error: null, 
          loading: false,
          raw: terapeutasRes 
        }
      }));
    } catch (error) {
      console.error('Error fetching terapeutas:', error);
      setDebugData(prev => ({
        ...prev,
        terapeutas: { 
          data: [], 
          error: error.message, 
          loading: false,
          raw: error.response?.data 
        }
      }));
    }

    // Test especialidades
    try {
      console.log('🏥 Fetching especialidades...');
      const especialidadesRes = await sesionTerapiaService.getEspecialidades();
      console.log('Especialidades raw response:', especialidadesRes);
      
      setDebugData(prev => ({
        ...prev,
        especialidades: { 
          data: especialidadesRes?.data || especialidadesRes || [], 
          error: null, 
          loading: false,
          raw: especialidadesRes 
        }
      }));
    } catch (error) {
      console.error('Error fetching especialidades:', error);
      setDebugData(prev => ({
        ...prev,
        especialidades: { 
          data: [], 
          error: error.message, 
          loading: false,
          raw: error.response?.data 
        }
      }));
    }

    // Test sesiones existentes
    try {
      console.log('🧠 Fetching sesiones...');
      const sesionesRes = await sesionTerapiaService.getSesiones();
      console.log('Sesiones raw response:', sesionesRes);
      
      setDebugData(prev => ({
        ...prev,
        sesiones: { 
          data: sesionesRes?.data || sesionesRes || [], 
          error: null, 
          loading: false,
          raw: sesionesRes 
        }
      }));
    } catch (error) {
      console.error('Error fetching sesiones:', error);
      setDebugData(prev => ({
        ...prev,
        sesiones: { 
          data: [], 
          error: error.message, 
          loading: false,
          raw: error.response?.data 
        }
      }));
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const DataSection = ({ title, data, icon }) => {
    const hasData = data.data && data.data.length > 0;
    const isLoading = data.loading;
    const hasError = data.error;

    return (
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Box display="flex" alignItems="center" gap={1}>
            {icon}
            <Typography variant="h6">
              {title} 
              {isLoading && ' (Cargando...)'}
              {!isLoading && !hasError && ` (${data.data.length} items)`}
              {hasError && ' (Error)'}
            </Typography>
            {hasData && <Alert severity="success" sx={{ ml: 2, py: 0 }}>OK</Alert>}
            {hasError && <Alert severity="error" sx={{ ml: 2, py: 0 }}>Error</Alert>}
            {!hasData && !hasError && !isLoading && <Alert severity="warning" sx={{ ml: 2, py: 0 }}>Vacío</Alert>}
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom>Estado:</Typography>
              <Typography variant="body2">
                Items: {data.data.length} | 
                Error: {hasError ? 'Sí' : 'No'} | 
                Loading: {isLoading ? 'Sí' : 'No'}
              </Typography>
              
              {hasError && (
                <Alert severity="error" sx={{ mt: 1 }}>
                  <Typography variant="body2">{data.error}</Typography>
                </Alert>
              )}
              
              {hasData && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2">Primer item:</Typography>
                  <Box component="pre" sx={{ 
                    fontSize: '12px', 
                    backgroundColor: 'grey.100', 
                    p: 1, 
                    borderRadius: 1,
                    overflow: 'auto',
                    maxHeight: '200px'
                  }}>
                    {JSON.stringify(data.data[0], null, 2)}
                  </Box>
                </Box>
              )}
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom>Raw Response:</Typography>
              <Box component="pre" sx={{ 
                fontSize: '12px', 
                backgroundColor: 'grey.100', 
                p: 1, 
                borderRadius: 1,
                overflow: 'auto',
                maxHeight: '200px'
              }}>
                {JSON.stringify(data.raw, null, 2)}
              </Box>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>
    );
  };

  return (
    <Container maxWidth="xl" sx={{ py: 2 }}>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Typography variant="h5" display="flex" alignItems="center" gap={1}>
              <BugReport color="warning" />
              Debug Sesiones Terapéuticas
            </Typography>
            <Button 
              variant="outlined" 
              startIcon={<Refresh />}
              onClick={fetchAllData}
            >
              Actualizar Datos
            </Button>
          </Box>
          
          <Alert severity="info" sx={{ mb: 2 }}>
            Esta es una página temporal para debuggear la carga de datos. 
            Verifica la consola del navegador para logs detallados.
          </Alert>
        </CardContent>
      </Card>

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <DataSection 
            title="Pacientes Disponibles" 
            data={debugData.pacientes}
            icon="👤"
          />
        </Grid>
        
        <Grid item xs={12}>
          <DataSection 
            title="Terapeutas Disponibles" 
            data={debugData.terapeutas}
            icon="👨‍⚕️"
          />
        </Grid>
        
        <Grid item xs={12}>
          <DataSection 
            title="Especialidades" 
            data={debugData.especialidades}
            icon="🏥"
          />
        </Grid>
        
        <Grid item xs={12}>
          <DataSection 
            title="Sesiones Existentes" 
            data={debugData.sesiones}
            icon="🧠"
          />
        </Grid>
      </Grid>

      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Información del Entorno
          </Typography>
          <Typography variant="body2">
            • API Base URL: {sesionTerapiaService.api?.defaults?.baseURL || 'No configurada'}
          </Typography>
          <Typography variant="body2">
            • User Agent: {navigator.userAgent}
          </Typography>
          <Typography variant="body2">
            • Timestamp: {new Date().toISOString()}
          </Typography>
        </CardContent>
      </Card>
    </Container>
  );
};

export default DebugSesiones;
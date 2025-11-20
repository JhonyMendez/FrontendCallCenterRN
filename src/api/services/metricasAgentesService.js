import { apiClient } from '../client';
import { ENDPOINTS } from '../config';

export const metricasAgenteService = {
  // Registrar métrica
  registrar: async (metricaData) => {
    return await apiClient.post(ENDPOINTS.METRICAS_AGENTES.BASE, metricaData);
  },

  // Obtener métricas de un agente
  getByAgente: async (idAgente, fechaInicio = null, fechaFin = null) => {
    const query = new URLSearchParams();
    if (fechaInicio) query.append('fecha_inicio', fechaInicio);
    if (fechaFin) query.append('fecha_fin', fechaFin);
    
    const queryString = query.toString();
    const endpoint = queryString
      ? `${ENDPOINTS.METRICAS_AGENTES.BY_ID(idAgente)}?${queryString}`
      : ENDPOINTS.METRICAS_AGENTES.BY_ID(idAgente);
    
    return await apiClient.get(endpoint);
  },

  // Obtener resumen de un agente
  getResumen: async (idAgente, fechaInicio, fechaFin) => {
    const query = new URLSearchParams({
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin
    });
    
    return await apiClient.get(`${ENDPOINTS.METRICAS_AGENTES.RESUMEN(idAgente)}?${query.toString()}`);
  }
};
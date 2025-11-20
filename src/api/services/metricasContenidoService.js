import { apiClient } from '../client';
import { ENDPOINTS } from '../config';

export const metricasContenidoService = {
  // Registrar métrica
  registrar: async (metricaData) => {
    return await apiClient.post(ENDPOINTS.METRICAS_CONTENIDOS.BASE, metricaData);
  },

  // Obtener métricas de un contenido
  getByContenido: async (idContenido, fechaInicio = null, fechaFin = null) => {
    const query = new URLSearchParams();
    if (fechaInicio) query.append('fecha_inicio', fechaInicio);
    if (fechaFin) query.append('fecha_fin', fechaFin);
    
    const queryString = query.toString();
    const endpoint = queryString
      ? `${ENDPOINTS.METRICAS_CONTENIDOS.BY_ID(idContenido)}?${queryString}`
      : ENDPOINTS.METRICAS_CONTENIDOS.BY_ID(idContenido);
    
    return await apiClient.get(endpoint);
  },

  // Obtener top contenidos más usados
  getTopMasUsados: async (limit = 10) => {
    return await apiClient.get(`${ENDPOINTS.METRICAS_CONTENIDOS.TOP_MAS_USADOS}?limit=${limit}`);
  }
};
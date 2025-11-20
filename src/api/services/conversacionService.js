
import { apiClient } from '../client';
import { ENDPOINTS } from '../config';

export const conversacionService = {
  // Crear conversación
  create: async (conversacionData) => {
    return await apiClient.post(ENDPOINTS.CONVERSACIONES.BASE, conversacionData);
  },

  // Listar conversaciones activas
  getActivas: async (limit = 100) => {
    return await apiClient.get(`${ENDPOINTS.CONVERSACIONES.ACTIVAS}?limit=${limit}`);
  },

  // Estadísticas generales
  getEstadisticasGenerales: async () => {
    return await apiClient.get(ENDPOINTS.CONVERSACIONES.ESTADISTICAS);
  },

  // Estadísticas por fecha
  getEstadisticasFecha: async (fecha) => {
    return await apiClient.get(ENDPOINTS.CONVERSACIONES.ESTADISTICAS_FECHA(fecha));
  },

  // Listar por visitante
  getByVisitante: async (idVisitante, params = {}) => {
    const query = new URLSearchParams();
    if (params.estado) query.append('estado', params.estado);
    if (params.skip !== undefined) query.append('skip', params.skip);
    if (params.limit !== undefined) query.append('limit', params.limit);
    
    const queryString = query.toString();
    const endpoint = queryString 
      ? `${ENDPOINTS.CONVERSACIONES.BY_VISITANTE(idVisitante)}?${queryString}`
      : ENDPOINTS.CONVERSACIONES.BY_VISITANTE(idVisitante);
    
    return await apiClient.get(endpoint);
  },

  // Listar por agente
  getByAgente: async (idAgente, params = {}) => {
    const query = new URLSearchParams();
    if (params.estado) query.append('estado', params.estado);
    if (params.skip !== undefined) query.append('skip', params.skip);
    if (params.limit !== undefined) query.append('limit', params.limit);
    
    const queryString = query.toString();
    const endpoint = queryString 
      ? `${ENDPOINTS.CONVERSACIONES.BY_AGENTE(idAgente)}?${queryString}`
      : ENDPOINTS.CONVERSACIONES.BY_AGENTE(idAgente);
    
    return await apiClient.get(endpoint);
  },

  // Obtener por MongoDB ID
  getByMongoId: async (mongoId) => {
    return await apiClient.get(ENDPOINTS.CONVERSACIONES.BY_MONGODB(mongoId));
  },

  // Obtener por ID
  getById: async (id) => {
    return await apiClient.get(ENDPOINTS.CONVERSACIONES.BY_ID(id));
  },

  // Actualizar conversación
  update: async (id, conversacionData) => {
    return await apiClient.put(ENDPOINTS.CONVERSACIONES.BY_ID(id), conversacionData);
  },

  // Finalizar conversación
  finalizar: async (id) => {
    return await apiClient.post(ENDPOINTS.CONVERSACIONES.FINALIZAR(id));
  },

  // Derivar a otro agente
  derivar: async (id, nuevoAgenteId) => {
    return await apiClient.post(ENDPOINTS.CONVERSACIONES.DERIVAR(id, nuevoAgenteId));
  },

  // Registrar mensajes
  registrarMensajes: async (id, cantidad = 1) => {
    return await apiClient.post(`${ENDPOINTS.CONVERSACIONES.MENSAJES(id)}?cantidad=${cantidad}`);
  }
};
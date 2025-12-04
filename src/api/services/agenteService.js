import { apiClient } from '../client';
import { ENDPOINTS } from '../config';

export const agenteService = {
  // Crear un nuevo agente
  create: async (agenteData) => {
    return await apiClient.post(ENDPOINTS.AGENTES.BASE, agenteData);
  },

  // Obtener todos los agentes con filtros
  getAll: async (params = {}) => {
    const query = new URLSearchParams();
    
    if (params.skip !== undefined) query.append('skip', params.skip);
    if (params.limit !== undefined) query.append('limit', params.limit);
    if (params.activo !== undefined) query.append('activo', params.activo);
    if (params.tipo_agente) query.append('tipo_agente', params.tipo_agente);
    if (params.id_departamento) query.append('id_departamento', params.id_departamento);
    
    const queryString = query.toString();
    const endpoint = queryString 
      ? `${ENDPOINTS.AGENTES.BASE}?${queryString}` 
      : ENDPOINTS.AGENTES.BASE;
    
    return await apiClient.get(endpoint);
  },

  // Obtener estadísticas generales
  getEstadisticasGenerales: async () => {
    return await apiClient.get(ENDPOINTS.AGENTES.ESTADISTICAS);
  },

  // Buscar agentes
  search: async (searchTerm) => {
    return await apiClient.get(`${ENDPOINTS.AGENTES.BUSCAR}?q=${encodeURIComponent(searchTerm)}`);
  },

  // Obtener agente por ID
  getById: async (id) => {
    return await apiClient.get(ENDPOINTS.AGENTES.BY_ID(id));
  },

  // Obtener estadísticas de un agente específico
  getEstadisticas: async (id) => {
    return await apiClient.get(ENDPOINTS.AGENTES.ESTADISTICAS_BY_ID(id));
  },

  // Actualizar agente
  update: async (id, agenteData) => {
    return await apiClient.put(ENDPOINTS.AGENTES.BY_ID(id), agenteData);
  },

  // Eliminar agente
  delete: async (id) => {
    return await apiClient.delete(ENDPOINTS.AGENTES.BY_ID(id));
  },

  // Cambiar estado del agente (activar/desactivar)
  toggleStatus: async (id, activo) => {
    return await apiClient.patch(`${ENDPOINTS.AGENTES.BY_ID(id)}/estado`, { activo });
  }
};
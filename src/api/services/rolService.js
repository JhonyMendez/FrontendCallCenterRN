import { apiClient } from '../client';
import { ENDPOINTS } from '../config';

export const rolService = {
  // Crear rol
  create: async (rolData) => {
    return await apiClient.post(ENDPOINTS.ROLES.BASE, rolData);
  },

  // Listar roles
  getAll: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.skip !== undefined) query.append('skip', params.skip);
    if (params.limit !== undefined) query.append('limit', params.limit);
    if (params.activo !== undefined) query.append('activo', params.activo);
    
    const queryString = query.toString();
    const endpoint = queryString
      ? `${ENDPOINTS.ROLES.BASE}?${queryString}`
      : ENDPOINTS.ROLES.BASE;
    
    return await apiClient.get(endpoint);
  },

  // Obtener estadísticas
  getEstadisticas: async () => {
    return await apiClient.get(ENDPOINTS.ROLES.ESTADISTICAS);
  },

  // Obtener por ID
  getById: async (id) => {
    return await apiClient.get(ENDPOINTS.ROLES.BY_ID(id));
  },

  // Actualizar rol
  update: async (id, rolData) => {
    return await apiClient.put(ENDPOINTS.ROLES.BY_ID(id), rolData);
  },

  // Eliminar rol
  delete: async (id) => {
    return await apiClient.delete(ENDPOINTS.ROLES.BY_ID(id));
  }
};
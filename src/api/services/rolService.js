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

  // 🔹 NUEVO: Método listarRoles (alias de getAll con logs mejorados)
  listarRoles: async (params = {}) => {
    try {
      console.log('📤 [rolService] Solicitando roles con params:', params);
      
      const query = new URLSearchParams();
      if (params.skip !== undefined) query.append('skip', params.skip);
      if (params.limit !== undefined) query.append('limit', params.limit);
      
      // Mapear solo_activos a activo (para compatibilidad)
      if (params.solo_activos !== undefined) {
        query.append('activo', params.solo_activos);
      } else if (params.activo !== undefined) {
        query.append('activo', params.activo);
      }
      
      const queryString = query.toString();
      const endpoint = queryString
        ? `${ENDPOINTS.ROLES.BASE}?${queryString}`
        : ENDPOINTS.ROLES.BASE;
      
      console.log('🌐 [rolService] Endpoint:', endpoint);
      
      const response = await apiClient.get(endpoint);
      
      console.log('✅ [rolService] Respuesta recibida:', response);
      console.log('✅ [rolService] Tipo:', typeof response);
      console.log('✅ [rolService] Es array?:', Array.isArray(response));
      
      // Procesar la respuesta
      let roles = [];
      if (Array.isArray(response)) {
        roles = response;
      } else if (response && Array.isArray(response.data)) {
        roles = response.data;
      } else if (response && Array.isArray(response.roles)) {
        roles = response.roles;
      } else {
        console.warn('⚠️ [rolService] Formato de respuesta inesperado:', response);
      }
      
      console.log('🎭 [rolService] Roles procesados:', roles);
      console.log('🎭 [rolService] Total roles:', roles.length);
      
      return roles;
    } catch (error) {
      console.error('❌ [rolService] Error listando roles:', error);
      throw new Error(
        error.data?.detail || 
        error.message || 
        'Error al listar roles'
      );
    }
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

export default rolService;
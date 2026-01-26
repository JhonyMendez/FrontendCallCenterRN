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
    if (params.incluir_eliminados !== undefined) query.append('incluir_eliminados', params.incluir_eliminados);
    
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
  search: async (searchTerm, incluirEliminados = false) => {
    const params = new URLSearchParams({
      q: searchTerm,
      incluir_eliminados: incluirEliminados
    });
    return await apiClient.get(`${ENDPOINTS.AGENTES.BUSCAR}?${params.toString()}`);
  },

  // Obtener agente por ID
  getById: async (id, incluirEliminados = false) => {
    const params = incluirEliminados ? '?incluir_eliminados=true' : '';
    return await apiClient.get(`${ENDPOINTS.AGENTES.BY_ID(id)}${params}`);
  },

  // Obtener estadísticas de un agente específico
  getEstadisticas: async (id) => {
    return await apiClient.get(ENDPOINTS.AGENTES.ESTADISTICAS_BY_ID(id));
  },

  // Actualizar agente
  update: async (id, agenteData) => {
    return await apiClient.put(ENDPOINTS.AGENTES.BY_ID(id), agenteData);
  },

  // ====== GESTIÓN DE ESTADO OPERACIONAL ======
  
  // Desactivar agente (activo=false)
  desactivar: async (id) => {
    return await apiClient.patch(`${ENDPOINTS.AGENTES.BY_ID(id)}/desactivar`);
  },

  // Activar agente (activo=true)
  activar: async (id) => {
    return await apiClient.patch(`${ENDPOINTS.AGENTES.BY_ID(id)}/activar`);
  },

  // ====== GESTIÓN DE SOFT DELETE ======
  
  // ⭐ ACTUALIZADO: Eliminar agente (soft delete) con auditoría
  delete: async (id, options = {}) => {
    const params = new URLSearchParams();
    
    // Si options es un número, asumimos que es el eliminado_por (retrocompatibilidad)
    if (typeof options === 'number') {
      params.append('eliminado_por', options);
    } 
    // Si options es un objeto con eliminado_por
    else if (options.eliminado_por) {
      params.append('eliminado_por', options.eliminado_por);
    }
    
    const queryString = params.toString();
    const endpoint = queryString 
      ? `${ENDPOINTS.AGENTES.BY_ID(id)}?${queryString}`
      : ENDPOINTS.AGENTES.BY_ID(id);
    
    return await apiClient.delete(endpoint);
  },

  // Restaurar agente eliminado
  restore: async (id) => {
    return await apiClient.patch(`${ENDPOINTS.AGENTES.BY_ID(id)}/restaurar`);
  },

  // Eliminar permanentemente (hard delete) - ⚠️ IRREVERSIBLE
  deletePermanently: async (id) => {
    return await apiClient.delete(`${ENDPOINTS.AGENTES.BY_ID(id)}/permanente`);
  },

  // ====== MÉTODOS DE CONVENIENCIA ======
  
  // Obtener solo agentes activos (no eliminados)
  getActivos: async (params = {}) => {
    return await agenteService.getAll({
      ...params,
      activo: true,
      incluir_eliminados: false
    });
  },

  // Obtener solo agentes eliminados
  getEliminados: async (params = {}) => {
    return await agenteService.getAll({
      ...params,
      incluir_eliminados: true
    }).then(response => {
      // Filtrar solo los eliminados en el cliente si la API no lo hace
      if (response.data) {
        response.data = response.data.filter(agente => agente.eliminado === true);
      }
      return response;
    });
  },

  // Cambiar estado del agente (wrapper legacy - mantener por compatibilidad)
  toggleStatus: async (id, activo) => {
    return activo 
      ? await agenteService.activar(id)
      : await agenteService.desactivar(id);
  },

  // Verificar si un agente está eliminado
  isDeleted: async (id) => {
    try {
      const response = await agenteService.getById(id, true);
      return response.data?.eliminado === true;
    } catch (error) {
      throw error;
    }
  },

  // Verificar si un agente puede ser eliminado
  canDelete: async (id) => {
    try {
      const stats = await agenteService.getEstadisticas(id);
      const tieneContenidos = stats.data?.total_contenidos > 0;
      return !tieneContenidos;
    } catch (error) {
      return false;
    }
  }
};
import { apiClient } from '../client';
import { ENDPOINTS } from '../config';

export const categoriaService = {
  // Obtener todas las categorías (con filtros opcionales)
  getAll: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    // Agregar parámetros de filtro si existen
    if (params.activo !== undefined) {
      queryParams.append('activo', params.activo);
    }
    if (params.id_agente !== undefined) {
      queryParams.append('id_agente', params.id_agente);
    }
    
    const queryString = queryParams.toString();
    const endpoint = queryString 
      ? `${ENDPOINTS.CATEGORIAS.BASE}?${queryString}`
      : ENDPOINTS.CATEGORIAS.BASE;
    
    return await apiClient.get(endpoint);
  },

  // Obtener una categoría por ID
  getById: async (id) => {
    return await apiClient.get(ENDPOINTS.CATEGORIAS.BY_ID(id));
  },

  // Crear una nueva categoría
  create: async (categoriaData) => {
    return await apiClient.post(ENDPOINTS.CATEGORIAS.BASE, categoriaData);
  },

  // Obtener categorías por agente (opcionalmente filtradas por estado activo)
  getByAgente: async (idAgente, activo = null) => {
    const endpoint = activo !== null 
      ? `${ENDPOINTS.CATEGORIAS.BY_AGENTE(idAgente)}?activo=${activo}`
      : ENDPOINTS.CATEGORIAS.BY_AGENTE(idAgente);
    
    return await apiClient.get(endpoint);
  },

  // Actualizar una categoría existente
  update: async (id, categoriaData) => {
    return await apiClient.put(ENDPOINTS.CATEGORIAS.BY_ID(id), categoriaData);
  },

  // Eliminar una categoría por ID
  delete: async (id) => {
    return await apiClient.delete(ENDPOINTS.CATEGORIAS.BY_ID(id));
  }

  
};
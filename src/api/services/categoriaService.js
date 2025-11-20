import { apiClient } from '../client';
import { ENDPOINTS } from '../config';

export const categoriaService = {
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
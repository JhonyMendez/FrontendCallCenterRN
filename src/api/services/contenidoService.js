import { apiClient } from '../client';
import { ENDPOINTS } from '../config';

export const contenidoService = {
  // Crear contenido
  create: async (contenidoData) => {
    return await apiClient.post(ENDPOINTS.CONTENIDOS.BASE, contenidoData);
  },

  // Listar contenidos de un agente
  getByAgente: async (idAgente, params = {}) => {
    const query = new URLSearchParams();
    if (params.estado) query.append('estado', params.estado);
    if (params.skip !== undefined) query.append('skip', params.skip);
    if (params.limit !== undefined) query.append('limit', params.limit);
    // 🔥 NO incluir include_deleted - por defecto el backend filtra eliminados
    
    const queryString = query.toString();
    const endpoint = queryString
      ? `${ENDPOINTS.CONTENIDOS.BY_AGENTE(idAgente)}?${queryString}`
      : ENDPOINTS.CONTENIDOS.BY_AGENTE(idAgente);
    
    return await apiClient.get(endpoint);
  },

  // Actualizar contenido
  update: async (id, contenidoData) => {
    return await apiClient.put(ENDPOINTS.CONTENIDOS.BY_ID(id), contenidoData);
  },

  // Publicar contenido
  publicar: async (id) => {
    return await apiClient.post(ENDPOINTS.CONTENIDOS.PUBLICAR(id));
  },

  

  // 🔥 Eliminar contenido (soft delete permanente)
  softDelete: async (id) => {
    return await apiClient.delete(`${ENDPOINTS.CONTENIDOS.BY_ID(id)}?hard_delete=false`);
  },

  // 🔥 AGREGAR ESTE MÉTODO AL FINAL
  actualizarVigencias: async () => {
    return await apiClient.post('/contenidos/vigencia/actualizar-todos', {});
  }
};


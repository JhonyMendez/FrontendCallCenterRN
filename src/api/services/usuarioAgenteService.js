import { apiClient } from '../client';
import { ENDPOINTS } from '../config';

export const usuarioAgenteService = {
  // Asignar usuario a agente
  asignar: async (data) => {
    return await apiClient.post(ENDPOINTS.USUARIO_AGENTE.BASE, data);
  },

  // Listar agentes por usuario
  getAgentesByUsuario: async (idUsuario, activo = null) => {
    const endpoint = activo !== null
      ? `${ENDPOINTS.USUARIO_AGENTE.BY_USUARIO(idUsuario)}?activo=${activo}`
      : ENDPOINTS.USUARIO_AGENTE.BY_USUARIO(idUsuario);
    
    return await apiClient.get(endpoint);
  },

  // Listar usuarios por agente
  getUsuariosByAgente: async (idAgente, activo = null) => {
    const endpoint = activo !== null
      ? `${ENDPOINTS.USUARIO_AGENTE.BY_AGENTE(idAgente)}?activo=${activo}`
      : ENDPOINTS.USUARIO_AGENTE.BY_AGENTE(idAgente);
    
    return await apiClient.get(endpoint);
  },

  // Actualizar permisos
  actualizarPermisos: async (id, data) => {
    return await apiClient.put(ENDPOINTS.USUARIO_AGENTE.BY_ID(id), data);
  },

  // Revocar acceso
  revocarAcceso: async (id) => {
    return await apiClient.delete(ENDPOINTS.USUARIO_AGENTE.BY_ID(id));
  }
};
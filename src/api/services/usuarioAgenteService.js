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

  // ✅ NUEVO: Obtener permisos de un usuario para un agente específico
  obtenerPorUsuarioYAgente: async (idUsuario, idAgente) => {
    try {
      const response = await apiClient.get(
        `${ENDPOINTS.USUARIO_AGENTE.BASE}/usuario/${idUsuario}/agente/${idAgente}`
      );
      return response;
    } catch (error) {
      console.error('Error obteniendo permisos usuario-agente:', error);
      throw error;
    }
  },

  // ✅ NUEVO: Alias para obtener por usuario (útil para la alternativa)
  obtenerPorUsuario: async (idUsuario) => {
    return await apiClient.get(ENDPOINTS.USUARIO_AGENTE.BY_USUARIO(idUsuario));
  },

  // ✅ CORREGIDO: Actualizar permisos (nombre correcto del método)
  actualizar: async (idUsuario, idAgente, data) => {
    return await apiClient.put(
      `${ENDPOINTS.USUARIO_AGENTE.BASE}/usuario/${idUsuario}/agente/${idAgente}`,
      data
    );
  },

  // Actualizar permisos (método original mantenido por compatibilidad)
  actualizarPermisos: async (id, data) => {
    return await apiClient.put(ENDPOINTS.USUARIO_AGENTE.BY_ID(id), data);
  },

  // Revocar acceso
  revocarAcceso: async (id) => {
    return await apiClient.delete(ENDPOINTS.USUARIO_AGENTE.BY_ID(id));
  },

  // Verificar permisos de un usuario sobre un agente específico
  verificarPermisos: async (idUsuario, idAgente) => {
    return await apiClient.get(
      `${ENDPOINTS.USUARIO_AGENTE.BASE}/verificar/${idUsuario}/${idAgente}`
    );
  },

  // Listar IDs de agentes accesibles
  getAgentesAccesibles: async (idUsuario) => {
    return await apiClient.get(
      `${ENDPOINTS.USUARIO_AGENTE.BASE}/accesibles/${idUsuario}`
    );
  }
};
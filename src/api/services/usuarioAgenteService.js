import { apiClient } from '../client';
import { ENDPOINTS, API_CONFIG } from '../config';  // ✅ AGREGAR API_CONFIG


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

  // Obtener permisos de un usuario para un agente específico
  obtenerPorUsuarioYAgente: async (idUsuario, idAgente) => {
    try {
      const response = await apiClient.get(
        ENDPOINTS.USUARIO_AGENTE.OBTENER_POR_USUARIO_Y_AGENTE(idUsuario, idAgente)  // 🔥 ARREGLADO: usar endpoint correcto
      );
      return response;
    } catch (error) {
      console.error('Error obteniendo permisos usuario-agente:', error);
      throw error;
    }
  },

  // Alias para obtener por usuario
  obtenerPorUsuario: async (idUsuario) => {
    return await apiClient.get(ENDPOINTS.USUARIO_AGENTE.BY_USUARIO(idUsuario));
  },

  // Actualizar permisos
  actualizar: async (idUsuario, idAgente, data) => {
    return await apiClient.put(
      ENDPOINTS.USUARIO_AGENTE.OBTENER_POR_USUARIO_Y_AGENTE(idUsuario, idAgente),  // 🔥 ARREGLADO
      data
    );
  },

  // Actualizar permisos (método original mantenido por compatibilidad)
  actualizarPermisos: async (id, data) => {
    return await apiClient.put(ENDPOINTS.USUARIO_AGENTE.BY_ID(id), data);
  },

  // ✅ NUEVO: Eliminar completamente el registro usuario-agente
eliminar: async (idUsuario, idAgente) => {
  try {
    const endpoint = ENDPOINTS.USUARIO_AGENTE.OBTENER_POR_USUARIO_Y_AGENTE(idUsuario, idAgente);
    
    console.log('🔍 DEBUG DELETE:');
    console.log('  - idUsuario:', idUsuario);
    console.log('  - idAgente:', idAgente);
    console.log('  - endpoint generado:', endpoint);
    console.log('  - baseURL:', API_CONFIG.BASE_URL);
    console.log('  - URL completa:', API_CONFIG.BASE_URL + endpoint);
    
    // Verificar doble barra
    if (endpoint.includes('//')) {
      console.error('⚠️ DOBLE BARRA DETECTADA EN ENDPOINT:', endpoint);
    }
    
    const response = await apiClient.delete(endpoint);
    console.log(`✅ Registro eliminado: Usuario ${idUsuario} - Agente ${idAgente}`);
    return response;
  } catch (error) {
    console.error(`❌ Error eliminando registro usuario ${idUsuario} - agente ${idAgente}:`, error);
    throw error;
  }
},

  // Revocar acceso (método original - podría usar el nuevo eliminar internamente)
  revocarAcceso: async (id) => {
    return await apiClient.delete(ENDPOINTS.USUARIO_AGENTE.BY_ID(id));
  },

  // Verificar permisos de un usuario sobre un agente específico
  verificarPermisos: async (idUsuario, idAgente) => {
    return await apiClient.get(
      `${ENDPOINTS.USUARIO_AGENTE.BASE}verificar/${idUsuario}/${idAgente}`
    );
  },

  // Listar IDs de agentes accesibles
  getAgentesAccesibles: async (idUsuario) => {
    return await apiClient.get(
      `${ENDPOINTS.USUARIO_AGENTE.BASE}accesibles/${idUsuario}`
    );
  }
};
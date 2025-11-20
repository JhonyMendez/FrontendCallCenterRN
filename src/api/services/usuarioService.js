// src/api/services/usuarioService.js
import { apiClient } from '../client';
import { ENDPOINTS } from '../config';

export const usuarioService = {
  // Login con logging detallado
  login: async (credentials) => {
    try {
      console.log('🔐 [UsuarioService] Login iniciado');
      console.log('🔐 [UsuarioService] Username:', credentials.username);
      console.log('🔐 [UsuarioService] Endpoint:', ENDPOINTS.USUARIOS.LOGIN);
      
      const response = await apiClient.post(
        ENDPOINTS.USUARIOS.LOGIN, 
        credentials
      );
      
      console.log('✅ [UsuarioService] Login exitoso');
      console.log('✅ [UsuarioService] Token recibido:', response.token ? 'Sí' : 'No');
      
      return response;
    } catch (error) {
      console.error('❌ [UsuarioService] Error en login:', error);
      throw error;
    }
  },

  // Crear usuario
  create: async (usuarioData) => {
    return await apiClient.post(ENDPOINTS.USUARIOS.BASE, usuarioData);
  },

  // Listar usuarios
  getAll: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.skip !== undefined) query.append('skip', params.skip);
    if (params.limit !== undefined) query.append('limit', params.limit);
    if (params.estado) query.append('estado', params.estado);
    
    const queryString = query.toString();
    const endpoint = queryString
      ? `${ENDPOINTS.USUARIOS.BASE}?${queryString}`
      : ENDPOINTS.USUARIOS.BASE;
    
    return await apiClient.get(endpoint);
  },

  // Obtener estadísticas
  getEstadisticas: async () => {
    return await apiClient.get(ENDPOINTS.USUARIOS.ESTADISTICAS);
  },

  // Obtener por ID
  getById: async (id) => {
    return await apiClient.get(ENDPOINTS.USUARIOS.BY_ID(id));
  },

  // Actualizar usuario
  update: async (id, usuarioData) => {
    return await apiClient.put(ENDPOINTS.USUARIOS.BY_ID(id), usuarioData);
  },

  // Eliminar usuario (soft delete)
  delete: async (id) => {
    return await apiClient.delete(ENDPOINTS.USUARIOS.BY_ID(id));
  },

  // Cambiar password
  cambiarPassword: async (id, passwordData) => {
    return await apiClient.post(ENDPOINTS.USUARIOS.CAMBIAR_PASSWORD(id), passwordData);
  },

  // Desbloquear usuario
  desbloquear: async (id) => {
    return await apiClient.post(ENDPOINTS.USUARIOS.DESBLOQUEAR(id));
  }
};
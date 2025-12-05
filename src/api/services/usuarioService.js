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

  // ✅ AGREGAR ESTE MÉTODO
  /**
   * Crear usuario completo con transacción atómica (Persona + Usuario + Roles)
   * @param {Object} data - { username, email, password, persona: {...}, roles: [...] }
   */
  createCompleto: async (data) => {
    try {
      const response = await apiClient.post('/usuarios/crear-completo', data);
      return response;
    } catch (error) {
      // Propagar el error tal cual viene del backend
      throw error;
    }
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
  },

  // Asignar rol
  asignarRol: async (id_usuario, id_rol) => {
    try {
      console.log(`📤 Asignando rol ${id_rol} a usuario ${id_usuario}`);
      const response = await apiClient.post(
        `/usuario-roles/usuario/${id_usuario}/asignar-rol`,
        { id_rol }
      );
      console.log('✅ Rol asignado:', response);
      return response;
    } catch (error) {
      console.error('❌ Error asignando rol:', error);
      throw new Error(
        error.data?.detail || 
        error.message || 
        'Error al asignar rol'
      );
    }
  },

  /**
   * REMOVER ROL de un usuario
   */
  removerRol: async (id_usuario, id_rol) => {
    try {
      console.log(`📤 Removiendo rol ${id_rol} de usuario ${id_usuario}`);
      const response = await apiClient.delete(
        `/usuario-roles/usuario/${id_usuario}/revocar-rol/${id_rol}`
      );
      console.log('✅ Rol removido:', response);
      return response;
    } catch (error) {
      console.error('❌ Error removiendo rol:', error);
      throw new Error(
        error.data?.detail || 
        error.message || 
        'Error al remover rol'
      );
    }
  }
};
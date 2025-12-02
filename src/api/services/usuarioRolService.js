import { apiClient } from '../client';
import { ENDPOINTS } from '../config';

export const usuarioRolService = {
  // ==================== CRUD BÁSICOS ====================
  
  // Asignar un rol a un usuario
  asignarRol: async (usuarioRolData) => {
    return await apiClient.post(ENDPOINTS.USUARIO_ROLES.BASE, usuarioRolData);
  },

  // Listar todas las asignaciones con filtros
  listarAsignaciones: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.skip !== undefined) query.append('skip', params.skip);
    if (params.limit !== undefined) query.append('limit', params.limit);
    if (params.id_usuario !== undefined) query.append('id_usuario', params.id_usuario);
    if (params.id_rol !== undefined) query.append('id_rol', params.id_rol);
    if (params.solo_activos !== undefined) query.append('solo_activos', params.solo_activos);
    
    const queryString = query.toString();
    const endpoint = queryString
      ? `${ENDPOINTS.USUARIO_ROLES.BASE}?${queryString}`
      : ENDPOINTS.USUARIO_ROLES.BASE;
    
    return await apiClient.get(endpoint);
  },

  // Obtener estadísticas generales
  getEstadisticas: async () => {
    return await apiClient.get(ENDPOINTS.USUARIO_ROLES.ESTADISTICAS);
  },

  // Obtener una asignación específica por ID
  getById: async (id_usuario_rol) => {
    return await apiClient.get(ENDPOINTS.USUARIO_ROLES.BY_ID(id_usuario_rol));
  },

  // Actualizar una asignación
  update: async (id_usuario_rol, usuarioRolData) => {
    return await apiClient.put(ENDPOINTS.USUARIO_ROLES.BY_ID(id_usuario_rol), usuarioRolData);
  },

  // Eliminar (desactivar) una asignación
  delete: async (id_usuario_rol) => {
    return await apiClient.delete(ENDPOINTS.USUARIO_ROLES.BY_ID(id_usuario_rol));
  },

  // ==================== ENDPOINTS ESPECÍFICOS DE USUARIO ====================

  // Obtener todos los roles de un usuario
  getRolesUsuario: async (id_usuario, solo_activos = true) => {
    const endpoint = `${ENDPOINTS.USUARIO_ROLES.ROLES_USUARIO(id_usuario)}?solo_activos=${solo_activos}`;
    return await apiClient.get(endpoint);
  },

  // Obtener estadísticas de un usuario
  getEstadisticasUsuario: async (id_usuario) => {
    return await apiClient.get(ENDPOINTS.USUARIO_ROLES.ESTADISTICAS_USUARIO(id_usuario));
  },

  // Asignar un rol a un usuario (endpoint simplificado)
  asignarRolAUsuario: async (id_usuario, rolData) => {
    return await apiClient.post(
      ENDPOINTS.USUARIO_ROLES.ASIGNAR_ROL_USUARIO(id_usuario),
      rolData
    );
  },

  // Asignar múltiples roles a un usuario
  asignarMultiplesRoles: async (id_usuario, rolesData) => {
    return await apiClient.post(
      ENDPOINTS.USUARIO_ROLES.ASIGNAR_MULTIPLES_ROLES(id_usuario),
      rolesData
    );
  },

  // Revocar un rol específico de un usuario
  revocarRol: async (id_usuario, id_rol) => {
    return await apiClient.delete(
      ENDPOINTS.USUARIO_ROLES.REVOCAR_ROL(id_usuario, id_rol)
    );
  },

  // Revocar todos los roles de un usuario
  revocarTodosRoles: async (id_usuario) => {
    return await apiClient.delete(
      ENDPOINTS.USUARIO_ROLES.REVOCAR_TODOS_ROLES(id_usuario)
    );
  },

  // ==================== ENDPOINTS ESPECÍFICOS DE ROL ====================

  // Obtener usuarios con un rol específico
  getUsuariosConRol: async (id_rol, solo_activos = true) => {
    const endpoint = `${ENDPOINTS.USUARIO_ROLES.USUARIOS_CON_ROL(id_rol)}?solo_activos=${solo_activos}`;
    return await apiClient.get(endpoint);
  },

  // Obtener estadísticas de un rol
  getEstadisticasRol: async (id_rol) => {
    return await apiClient.get(ENDPOINTS.USUARIO_ROLES.ESTADISTICAS_ROL(id_rol));
  },

  // ==================== ENDPOINTS DE VERIFICACIÓN ====================

  // Verificar si un usuario tiene un rol
  verificarUsuarioTieneRol: async (id_usuario, id_rol, solo_activos = true) => {
    const endpoint = `${ENDPOINTS.USUARIO_ROLES.VERIFICAR_ROL(id_usuario, id_rol)}?solo_activos=${solo_activos}`;
    return await apiClient.get(endpoint);
  },

  // ==================== ENDPOINTS DE MANTENIMIENTO ====================

  // Procesar expiraciones
  procesarExpiraciones: async () => {
    return await apiClient.post(ENDPOINTS.USUARIO_ROLES.PROCESAR_EXPIRACIONES);
  }
};
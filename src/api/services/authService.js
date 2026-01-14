// src/api/services/authService.js
import { Platform } from 'react-native';
import { apiClient } from '../client';

const isWeb = Platform.OS === 'web';

let AsyncStorage;
if (!isWeb) {
  AsyncStorage = require('@react-native-async-storage/async-storage').default;
}

// ==================== STORAGE UNIVERSAL ====================
const storage = {
  async getItem(key) {
    if (isWeb) {
      return localStorage.getItem(key);
    } else {
      return await AsyncStorage.getItem(key);
    }
  },
  
  async setItem(key, value) {
    if (isWeb) {
      localStorage.setItem(key, value);
    } else {
      await AsyncStorage.setItem(key, value);
    }
  },
  
  async removeItem(key) {
    if (isWeb) {
      localStorage.removeItem(key);
    } else {
      await AsyncStorage.removeItem(key);
    }
  },

  async multiRemove(keys) {
    if (isWeb) {
      keys.forEach(key => localStorage.removeItem(key));
    } else {
      await AsyncStorage.multiRemove(keys);
    }
  }
};

// ==================== AUTH SERVICE ====================
const authService = {
  
  // ========== PROCESAR LOGIN ==========
  procesarLogin: async (usuario) => {
    try {
      console.log('🔐 [authService] Procesando login para:', usuario.username);
      
      // ✅ GUARDAR ID DEL USUARIO
      await storage.setItem('@usuario_id', usuario.id_usuario.toString());
      await storage.setItem('@usuario_username', usuario.username);
      await storage.setItem('@usuario_email', usuario.email || '');
      await storage.setItem('@usuario_nombre_completo', usuario.nombre_completo || usuario.username);

      // 🔥 Guardar departamento si existe
      if (usuario.id_departamento) {
        await storage.setItem('@usuario_id_departamento', usuario.id_departamento.toString());
        console.log('✅ Guardado id_departamento:', usuario.id_departamento);
      } else {
        console.log('⚠️ Usuario sin id_departamento al hacer login');
      }
      
      // Guardar flags de administrador
      await storage.setItem('@usuario_es_admin', usuario.es_admin ? 'true' : 'false');
      await storage.setItem('@usuario_es_superadmin', usuario.es_superadmin ? 'true' : 'false');

      // Procesar roles
      const roles = usuario.roles || [];
      
      if (!roles || roles.length === 0) {
        throw new Error('Usuario sin roles asignados. Contacta al administrador');
      }

      // Determinar rol principal (el de mayor jerarquía)
      let rolPrincipal = null;
      
      if (roles.some(r => r.id_rol === 1)) {
        rolPrincipal = roles.find(r => r.id_rol === 1);
      } else if (roles.some(r => r.id_rol === 2)) {
        rolPrincipal = roles.find(r => r.id_rol === 2);
      } else if (roles.some(r => r.id_rol === 3)) {
        rolPrincipal = roles.find(r => r.id_rol === 3);
      } else {
        rolPrincipal = roles[0];
      }

      // Guardar rol principal
      await storage.setItem('@rol_principal_id', rolPrincipal.id_rol.toString());
      await storage.setItem('@rol_principal_nombre', rolPrincipal.nombre_rol);

      // Determinar ruta según el rol
      const ruta = authService.getRutaPorRol(rolPrincipal.id_rol);

      return {
        success: true,
        usuario: usuario.username,
        rolPrincipal: rolPrincipal.nombre_rol,
        ruta
      };
      
    } catch (error) {
      console.error('❌ [authService] Error procesando login:', error);
      throw error;
    }
  },

  // ========== OBTENER RUTA POR ROL ==========
  getRutaPorRol: (idRol) => {
    switch (idRol) {
      case 1: // Super Admin
        return '/superadmin/dashboard';
      case 2: // Admin
        return '/admin/dashboardAdmin';
      case 3: // Funcionario
        return '/funcionario/dashboard';
      default:
        return '/login';
    }
  },

  // ========== LOGOUT (NUEVO) ==========
  logout: async () => {
    try {
      console.log('🚪 [authService] Iniciando logout...');
      
      // Intentar notificar al backend
      try {
        const token = await apiClient.getToken();
        if (token) {
          await apiClient.post('/usuarios/logout', {}, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          console.log('✅ Backend notificado del logout');
        }
      } catch (error) {
        console.log('⚠️ Error notificando logout al servidor:', error);
        // No fallar el logout si el backend no responde
      }
      
      // Limpiar token primero
      await apiClient.removeToken();
      
      // Limpiar sesión local
      await authService.limpiarSesion();
      
      console.log('✅ [authService] Logout completado');
      
      return { success: true };
      
    } catch (error) {
      console.error('❌ [authService] Error en logout:', error);
      
      // Limpiar de todas formas aunque haya error
      try {
        await apiClient.removeToken();
        await authService.limpiarSesion();
      } catch (e) {
        console.error('❌ Error limpiando en catch:', e);
      }
      
      return { success: false, error: error.message };
    }
  },

  // ========== LIMPIAR SESIÓN ==========
  limpiarSesion: async () => {
    try {
      await storage.multiRemove([
        '@usuario_id',
        '@usuario_username',
        '@usuario_email',
        '@usuario_nombre_completo',
        '@usuario_id_departamento',
        '@usuario_es_admin',
        '@usuario_es_superadmin',
        '@rol_principal_id',
        '@rol_principal_nombre',
        '@todos_roles',
        '@permisos',
        '@datos_sesion'
      ]);
      console.log('✅ [authService] Sesión limpiada');
    } catch (error) {
      console.error('❌ [authService] Error limpiando sesión:', error);
      throw error;
    }
  },

  // ========== OBTENER ID USUARIO ==========
  getUsuarioId: async () => {
    try {
      const id = await storage.getItem('@usuario_id');
      return id ? parseInt(id) : null;
    } catch (error) {
      console.error('❌ Error obteniendo usuario_id:', error);
      return null;
    }
  },

  // ========== OBTENER USUARIO ACTUAL ==========
  getUsuarioActual: async () => {
    try {
      const [id, username, email, nombreCompleto, idDepartamento] = await Promise.all([
        storage.getItem('@usuario_id'),
        storage.getItem('@usuario_username'),
        storage.getItem('@usuario_email'),
        storage.getItem('@usuario_nombre_completo'),
        storage.getItem('@usuario_id_departamento')
      ]);

      if (!id || !username) {
        return null;
      }

      const usuario = {
        id_usuario: parseInt(id),
        username,
        email: email || '',
        nombre_completo: nombreCompleto || username
      };

      // Agregar id_departamento si existe
      if (idDepartamento) {
        usuario.id_departamento = parseInt(idDepartamento);
      }

      console.log('🔐 getUsuarioActual devuelve:', usuario);
      
      return usuario;
    } catch (error) {
      console.error('❌ Error obteniendo usuario actual:', error);
      return null;
    }
  },

  // ========== OBTENER DATOS DE SESIÓN ==========
  obtenerDatosSesion: async () => {
    try {
      const [
        rolIdStr,
        rolNombre,
        usuarioId,
        username,
        email,
        nombreCompleto,
        esAdmin,
        esSuperAdmin
      ] = await Promise.all([
        storage.getItem('@rol_principal_id'),
        storage.getItem('@rol_principal_nombre'),
        storage.getItem('@usuario_id'),
        storage.getItem('@usuario_username'),
        storage.getItem('@usuario_email'),
        storage.getItem('@usuario_nombre_completo'),
        storage.getItem('@usuario_es_admin'),
        storage.getItem('@usuario_es_superadmin')
      ]);

      // Validar que existan los datos mínimos
      if (!rolIdStr || !username || !usuarioId) {
        return null;
      }

      const rolId = parseInt(rolIdStr);
      
      if (isNaN(rolId) || rolId < 1) {
        return null;
      }

      return {
        usuario: {
          id_usuario: parseInt(usuarioId),
          username,
          email: email || '',
          nombre_completo: nombreCompleto || username,
          es_admin: esAdmin === 'true',
          es_superadmin: esSuperAdmin === 'true'
        },
        rolPrincipal: {
          id_rol: rolId,
          nombre_rol: rolNombre || 'Sin rol'
        }
      };
    } catch (error) {
      console.error('❌ Error obteniendo datos de sesión:', error);
      return null;
    }
  }
};

export default authService;
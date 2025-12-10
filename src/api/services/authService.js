// src/api/services/authService.js
import { Platform } from 'react-native';

const isWeb = Platform.OS === 'web';

let AsyncStorage;
if (!isWeb) {
  AsyncStorage = require('@react-native-async-storage/async-storage').default;
}

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

const authService = {
  procesarLogin: async (usuario) => {
    try {
      console.log('🔐 [authService] Procesando login para:', usuario.username);
      
      // ✅ GUARDAR ID DEL USUARIO
      await storage.setItem('@usuario_id', usuario.id_usuario.toString());
      await storage.setItem('@usuario_username', usuario.username);
      await storage.setItem('@usuario_email', usuario.email || '');
      await storage.setItem('@usuario_nombre_completo', usuario.nombre_completo || usuario.username);
      
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

  getRutaPorRol: (idRol) => {
    const isWeb = Platform.OS === 'web';
    
    switch (idRol) {
      case 1: // Super Admin
        return isWeb ? '/superadmin/dashboard' : '/superadmin/dashboard';
      case 2: // Admin
        return isWeb ? '/admin/dashboard' : '/admin/dashboard';
      case 3: // Funcionario
        return isWeb ? '/funcionario/dashboard' : '/funcionario/dashboard';
      default:
        return '/login';
    }
  },

  limpiarSesion: async () => {
    try {
      await storage.multiRemove([
        '@usuario_id',
        '@usuario_username',
        '@usuario_email',
        '@usuario_nombre_completo',
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
    }
  },

  // ✅ NUEVO: Método para obtener el id_usuario
  getUsuarioId: async () => {
    try {
      const id = await storage.getItem('@usuario_id');
      return id ? parseInt(id) : null;
    } catch (error) {
      console.error('❌ Error obteniendo usuario_id:', error);
      return null;
    }
  },

  // ✅ NUEVO: Método para obtener datos completos del usuario
  getUsuarioActual: async () => {
    try {
      const [id, username, email, nombreCompleto] = await Promise.all([
        storage.getItem('@usuario_id'),
        storage.getItem('@usuario_username'),
        storage.getItem('@usuario_email'),
        storage.getItem('@usuario_nombre_completo')
      ]);

      if (!id || !username) {
        return null;
      }

      return {
        id_usuario: parseInt(id),
        username,
        email: email || '',
        nombre_completo: nombreCompleto || username
      };
    } catch (error) {
      console.error('❌ Error obteniendo usuario actual:', error);
      return null;
    }
  }
};

export default authService;
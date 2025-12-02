// ==================================================================================
// src/api/services/authService.js
// Servicio UNIVERSAL de autenticación (React Web + React Native)
// ==================================================================================

import { Platform } from 'react-native';

// Detectar plataforma
const isWeb = Platform.OS === 'web';

// Importación condicional de AsyncStorage
let AsyncStorage;
if (!isWeb) {
  AsyncStorage = require('@react-native-async-storage/async-storage').default;
}

// ==================================================================================
// STORAGE UNIVERSAL (localStorage para web, AsyncStorage para móvil)
// ==================================================================================
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

  async multiSet(pairs) {
    if (isWeb) {
      // En web, hacemos setItem uno por uno
      pairs.forEach(([key, value]) => {
        localStorage.setItem(key, value);
      });
    } else {
      await AsyncStorage.multiSet(pairs);
    }
  },

  async multiRemove(keys) {
    if (isWeb) {
      keys.forEach(key => {
        localStorage.removeItem(key);
      });
    } else {
      await AsyncStorage.multiRemove(keys);
    }
  }
};

// ==================================================================================
// CONSTANTES DE ROLES
// ==================================================================================
export const ROLES = {
  SUPER_ADMIN: 1,
  ADMIN: 2,
  FUNCIONARIO: 3
};

// ==================================================================================
// SERVICIO DE AUTENTICACIÓN
// ==================================================================================
const authService = {

  // ==================== OBTENER RUTA POR ROL ====================
  getRutaPorRol: function(idRol) {
    switch (idRol) {
      case ROLES.SUPER_ADMIN:
        return isWeb ? '/superadmin/dashboard' : '/(superadmin)/dashboard';
      case ROLES.ADMIN:
        return isWeb ? '/admin/dashboard' : '/(admin)/dashboard';
      case ROLES.FUNCIONARIO:
        return isWeb ? '/funcionario/dashboard' : '/(funcionario)/dashboard';
      default:
        return '/login';
    }
  },

  // ==================== PROCESO COMPLETO DE LOGIN ====================
  procesarLogin: async function (usuario) {
    try {
      console.log('🔐 Iniciando proceso de autenticación...');
      console.log('👤 Usuario:', usuario.username);

      const roles = usuario.roles;

      if (!roles || roles.length === 0) {
        throw new Error('Usuario sin roles asignados. Contacta al administrador.');
      }

      console.log('✅ Roles obtenidos del login:', roles);

      const rolPrincipal = usuario.rol_principal;

      if (!rolPrincipal) {
        throw new Error('No se pudo determinar el rol principal del usuario.');
      }

      console.log('👤 Rol principal:', rolPrincipal.nombre_rol);

      const datosSesion = {
        usuario: {
          id_usuario: usuario.id_usuario,
          username: usuario.username,
          email: usuario.email,
          estado: usuario.estado
        },
        roles: roles,
        rolPrincipal: rolPrincipal,
        permisos: usuario.permisos || {},
        fechaSesion: new Date().toISOString()
      };

      // Guardar datos de sesión de forma universal
      await storage.multiSet([
        ['@usuario_id', usuario.id_usuario?.toString() || ''],
        ['@usuario_username', usuario.username || ''],
        ['@usuario_email', usuario.email || ''],
        ['@rol_principal_id', rolPrincipal.id_rol?.toString() || ''],
        ['@rol_principal_nombre', rolPrincipal.nombre_rol || ''],
        ['@todos_roles', JSON.stringify(roles)],
        ['@permisos', JSON.stringify(usuario.permisos || {})],
        ['@datos_sesion', JSON.stringify(datosSesion)]
      ]);

      console.log('✅ Datos de sesión guardados correctamente');

      const rutaDestino = this.getRutaPorRol(rolPrincipal.id_rol);

      console.log('📍 Redirigiendo a:', rutaDestino);

      return {
        success: true,
        ruta: rutaDestino,
        rolPrincipal: rolPrincipal.nombre_rol,
        usuario: usuario.username
      };

    } catch (error) {
      console.error('❌ Error en proceso de login:', error);
      throw error;
    }
  },

  // ==================== OBTENER DATOS DE SESIÓN ====================
  obtenerDatosSesion: async function() {
    try {
      const datosSesionStr = await storage.getItem('@datos_sesion');
      
      if (!datosSesionStr) {
        return null;
      }

      return JSON.parse(datosSesionStr);
    } catch (error) {
      console.error('❌ Error obteniendo datos de sesión:', error);
      return null;
    }
  },

  // ==================== VERIFICAR SI ESTÁ AUTENTICADO ====================
  estaAutenticado: async function() {
    try {
      const token = await storage.getItem('token');
      const datosSesion = await this.obtenerDatosSesion();
      
      return !!(token && datosSesion);
    } catch (error) {
      console.error('❌ Error verificando autenticación:', error);
      return false;
    }
  },

  // ==================== LIMPIAR SESIÓN ====================
  limpiarSesion: async function() {
    try {
      console.log('🧹 Limpiando sesión...');

      await storage.multiRemove([
        '@usuario_id',
        '@usuario_username',
        '@usuario_email',
        '@rol_principal_id',
        '@rol_principal_nombre',
        '@todos_roles',
        '@permisos',
        '@datos_sesion'
      ]);

      console.log('🧼 Sesión eliminada correctamente');

    } catch (error) {
      console.error('❌ Error limpiando sesión:', error);
    }
  }
};

export default authService;
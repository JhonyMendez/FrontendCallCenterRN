// ==================================================================================
// src/hooks/useAuth.js
// Hook UNIVERSAL para autenticación - SOLUCIÓN DEFINITIVA AL BUCLE INFINITO
// ==================================================================================

import { usePathname, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';

const isWeb = Platform.OS === 'web';

let AsyncStorage, apiClient;
if (!isWeb) {
  AsyncStorage = require('@react-native-async-storage/async-storage').default;
  apiClient = require('../api/client').apiClient;
}

export const ROLES = {
  SUPER_ADMIN: 1,
  ADMIN: 2,
  FUNCIONARIO: 3
};

// 🔑 CLAVE ÚNICA PARA EL TOKEN (MISMA QUE USA ApiClient)
const TOKEN_KEY = 'auth_token';

// ==================================================================================
// STORAGE UNIVERSAL
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
  }
};

// ==================================================================================
// HELPER: Obtener ruta por rol
// ==================================================================================
const getRutaPorRol = (idRol) => {
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
};

// ==================================================================================
// HELPER: Normalizar pathname
// ==================================================================================
const normalizarPath = (path) => {
  if (!path) return '';
  return path.toLowerCase().replace(/\/$/, '').replace(/^\(|\)$/g, '');
};

// ==================================================================================
// HELPER: Verificar si la ruta pertenece a la sección del rol
// ==================================================================================
const rutaPerteneceAlRol = (pathname, idRol) => {
  if (!pathname) return false;
  
  const pathNormalizado = normalizarPath(pathname);
  
  // Para SuperAdmin
  if (idRol === ROLES.SUPER_ADMIN) {
    return pathNormalizado.includes('superadmin');
  }
  
  // Para Admin (pero no superadmin)
  if (idRol === ROLES.ADMIN) {
    return pathNormalizado.includes('admin') && !pathNormalizado.includes('superadmin');
  }
  
  // Para Funcionario
  if (idRol === ROLES.FUNCIONARIO) {
    return pathNormalizado.includes('funcionario');
  }
  
  return false;
};

// ==================================================================================
// HOOK PRINCIPAL - SIN BUCLE INFINITO
// ==================================================================================
export const useAuth = (rolesPermitidos = []) => {
  const router = useRouter();
  const pathname = usePathname();
  
  // CRÍTICO: Prevenir verificaciones múltiples
  const verificacionRealizada = useRef(false);
  const montado = useRef(true);
  const redirecting = useRef(false); // 🔥 NUEVO: Prevenir redirecciones múltiples
  
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [usuario, setUsuario] = useState(null);
  const [rolPrincipal, setRolPrincipal] = useState(null);
  const [permisos, setPermisos] = useState({});

  useEffect(() => {
    montado.current = true;
    
    // Solo verificar una vez al montar
    if (!verificacionRealizada.current) {
      verificacionRealizada.current = true;
      verificarAutenticacion();
    }
    
    return () => {
      montado.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const verificarAutenticacion = async () => {
    // 🔥 CRÍTICO: Si ya estamos redirigiendo, no hacer nada
    if (redirecting.current) {
      console.log('🔄 [useAuth] Ya estamos redirigiendo, ignorando verificación');
      return;
    }

    try {
      console.log('🔍 [useAuth] Verificando autenticación...');
      console.log('📍 [useAuth] Ruta actual:', pathname);
      
      // 🔑 AHORA LEE LA MISMA KEY QUE EL ApiClient
      const token = await storage.getItem(TOKEN_KEY);
      console.log('🧪 [useAuth] Token desde storage:', token ? 'PRESENTE' : 'NULL');
      
      if (!token) {
        console.log('❌ [useAuth] No hay token, redirigiendo a login');
        if (montado.current && !redirecting.current) {
          redirecting.current = true;
          setLoading(false);
          setAuthenticated(false);
          router.replace('/login');
        }
        return;
      }

      // Obtener todos los datos necesarios del storage
      const [rolIdStr, usernameStorage, emailStorage, nombreRolStorage, usuarioIdStr] = await Promise.all([
        storage.getItem('@rol_principal_id'),
        storage.getItem('@usuario_username'),
        storage.getItem('@usuario_email'),
        storage.getItem('@rol_principal_nombre'),
        storage.getItem('@usuario_id')
      ]);
      
      // 🔥 VALIDACIÓN CRÍTICA: Verificar que existan TODOS los datos esenciales
      if (!rolIdStr || !usernameStorage) {
        console.log('❌ [useAuth] Sesión incompleta (falta rol o username)');
        throw new Error('Sesión incompleta - datos faltantes');
      }

      const idRolActual = parseInt(rolIdStr);
      
      // 🔥 VALIDACIÓN: Verificar que el rol sea válido
      if (isNaN(idRolActual) || idRolActual < 1 || idRolActual > 3) {
        console.log('❌ [useAuth] Rol inválido:', idRolActual);
        throw new Error('Rol inválido');
      }
      
      console.log('✅ [useAuth] Usuario desde storage:', usernameStorage);
      console.log('🎭 [useAuth] Rol ID:', idRolActual);
      console.log('🎭 [useAuth] Rol Nombre:', nombreRolStorage);
      console.log('🔐 [useAuth] Roles permitidos en esta ruta:', rolesPermitidos);
      console.log('📍 [useAuth] Pathname normalizado:', normalizarPath(pathname));

      // 🔥 CRÍTICO: Verificar si estamos en la ruta correcta PRIMERO
      const estaEnRutaCorrecta = rutaPerteneceAlRol(pathname, idRolActual);
      
      console.log('📍 [useAuth] ¿Está en ruta correcta para su rol?', estaEnRutaCorrecta);

      // 🔥 LÓGICA CORREGIDA: Solo verificar permisos si se especificaron roles permitidos
      if (rolesPermitidos.length > 0) {
        const tieneRolPermitido = rolesPermitidos.includes(idRolActual);

        console.log('🔐 [useAuth] ¿Tiene rol permitido?', tieneRolPermitido);

        if (!tieneRolPermitido) {
          console.log('⚠️ [useAuth] Usuario no tiene permisos para esta ruta');
          console.log('🔀 [useAuth] Rol actual:', idRolActual, '- Roles permitidos:', rolesPermitidos);
          
          // 🔥 SOLO REDIRIGIR SI NO ESTÁ EN SU RUTA CORRECTA
          if (!estaEnRutaCorrecta && !redirecting.current) {
            const rutaCorrecta = getRutaPorRol(idRolActual);
            console.log('🔀 [useAuth] Redirigiendo a su ruta correcta:', rutaCorrecta);
            
            if (montado.current) {
              redirecting.current = true;
              setLoading(false);
              setAuthenticated(false);
              
              // 🔥 Pequeño delay para evitar race conditions
              await new Promise(resolve => setTimeout(resolve, 100));
              router.replace(rutaCorrecta);
            }
            return;
          } else if (estaEnRutaCorrecta) {
            // 🔥 Está en su ruta correcta pero la página específica requiere otro rol
            // En este caso, simplemente no autenticar pero tampoco redirigir
            console.log('⚠️ [useAuth] Está en su sección pero esta página requiere otro rol');
            if (montado.current) {
              setLoading(false);
              setAuthenticated(false);
            }
            return;
          }
        }
      }

      // 🔥 Si llegamos aquí, el usuario está autenticado correctamente
      console.log('✅ [useAuth] Autenticación exitosa');
      
      // Construir datos del usuario desde storage
      const usuarioData = {
        id_usuario: usuarioIdStr ? parseInt(usuarioIdStr) : null,
        username: usernameStorage,
        email: emailStorage,
        nombre_completo: usernameStorage // Fallback
      };

      const rolPrincipalData = {
        id_rol: idRolActual,
        nombre_rol: nombreRolStorage || 'Usuario'
      };

      if (montado.current) {
        setUsuario(usuarioData);
        setRolPrincipal(rolPrincipalData);
        setPermisos({});
        setAuthenticated(true);
        setLoading(false);
      }

    } catch (error) {
      console.error('❌ [useAuth] Error verificando autenticación:', error.message);
      
      if (montado.current && !redirecting.current) {
        redirecting.current = true;
        
        // Limpiar sesión corrupta
        try {
          await storage.removeItem(TOKEN_KEY);
          await storage.removeItem('@rol_principal_id');
          await storage.removeItem('@usuario_username');
          await storage.removeItem('@usuario_email');
          await storage.removeItem('@rol_principal_nombre');
          await storage.removeItem('@usuario_id');
          console.log('🧹 [useAuth] Sesión corrupta limpiada');
        } catch (cleanupError) {
          console.error('Error limpiando sesión:', cleanupError);
        }
        
        setLoading(false);
        setAuthenticated(false);
        
        // 🔥 Pequeño delay antes de redirigir
        await new Promise(resolve => setTimeout(resolve, 100));
        router.replace('/login');
      }
    }
  };

  const tienePermiso = (nombrePermiso) => {
    if (!rolPrincipal || !rolPrincipal.permisos) return false;
    return rolPrincipal.permisos.some(p => p.nombre === nombrePermiso);
  };

  const esSuperAdmin = () => {
    return rolPrincipal?.id_rol === ROLES.SUPER_ADMIN;
  };

  const esAdmin = () => {
    return rolPrincipal?.id_rol === ROLES.ADMIN;
  };

  const esFuncionario = () => {
    return rolPrincipal?.id_rol === ROLES.FUNCIONARIO;
  };

  const logout = async () => {
    try {
      console.log('🚪 [useAuth] Cerrando sesión...');
      
      // Prevenir múltiples logouts
      if (redirecting.current) {
        console.log('🔄 [useAuth] Logout ya en proceso');
        return;
      }
      
      redirecting.current = true;
      
      const token = await storage.getItem(TOKEN_KEY);
      
      if (token) {
        try {
          if (isWeb) {
            await fetch('/api/auth/logout', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });
          } else {
            await apiClient.post('/auth/logout');
          }
        } catch (error) {
          console.error('Error en llamada de logout:', error);
        }
      }
    } catch (error) {
      console.error('❌ [useAuth] Error en logout:', error);
    } finally {
      // Limpiar todo el storage
      await storage.removeItem(TOKEN_KEY);
      await storage.removeItem('@usuario_id');
      await storage.removeItem('@usuario_username');
      await storage.removeItem('@usuario_email');
      await storage.removeItem('@rol_principal_id');
      await storage.removeItem('@rol_principal_nombre');
      await storage.removeItem('@todos_roles');
      await storage.removeItem('@permisos');
      await storage.removeItem('@datos_sesion');
      
      if (montado.current) {
        setAuthenticated(false);
        setUsuario(null);
        setRolPrincipal(null);
        setPermisos({});
      }
      
      await new Promise(resolve => setTimeout(resolve, 100));
      router.replace('/login');
    }
  };

  return {
    loading,
    authenticated,
    usuario,
    rolPrincipal,
    permisos,
    tienePermiso,
    esSuperAdmin,
    esAdmin,
    esFuncionario,
    logout,
    isWeb,
    isMobile: !isWeb
  };
};

// ==================================================================================
// COMPONENTE WRAPPER PARA PROTEGER RUTAS
// ==================================================================================
export const ProtectedRoute = ({ children, rolesPermitidos = [] }) => {
  const { loading, authenticated } = useAuth(rolesPermitidos);

  if (loading) {
    if (isWeb) {
      return (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          flexDirection: 'column',
          gap: '15px'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #e5e7eb',
            borderTop: '4px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <p style={{ color: '#6b7280', fontSize: '14px' }}>
            Verificando autenticación...
          </p>
        </div>
      );
    } else {
      const { View, Text, ActivityIndicator } = require('react-native');
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={{ marginTop: 15, color: '#6b7280' }}>
            Verificando autenticación...
          </Text>
        </View>
      );
    }
  }

  return authenticated ? children : null;
};

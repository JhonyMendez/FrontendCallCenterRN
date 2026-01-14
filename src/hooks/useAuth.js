// ==================================================================================
// src/hooks/useAuth.js
// Hook UNIVERSAL con integración de SessionContext
// ==================================================================================

import { usePathname, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import { useSession } from '../contexts/SessionContext'; // ✅ IMPORTAR

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
      return '/auth/login';
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
  
  if (idRol === ROLES.SUPER_ADMIN) {
    return pathNormalizado.includes('superadmin');
  }
  
  if (idRol === ROLES.ADMIN) {
    return pathNormalizado.includes('admin') && !pathNormalizado.includes('superadmin');
  }
  
  if (idRol === ROLES.FUNCIONARIO) {
    return pathNormalizado.includes('funcionario');
  }
  
  return false;
};

// ==================================================================================
// HOOK PRINCIPAL - CON SessionContext
// ==================================================================================
export const useAuth = (rolesPermitidos = []) => {
  const router = useRouter();
  const pathname = usePathname();
  const { handleSessionExpired } = useSession(); // ✅ USAR CONTEXTO
  
  const verificacionRealizada = useRef(false);
  const montado = useRef(true);
  const redirecting = useRef(false);
  const sessionExpiredTriggered = useRef(false); // ✅ NUEVO
  
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [usuario, setUsuario] = useState(null);
  const [rolPrincipal, setRolPrincipal] = useState(null);
  const [permisos, setPermisos] = useState({});

  useEffect(() => {
    montado.current = true;
    
    if (!verificacionRealizada.current) {
      verificacionRealizada.current = true;
      verificarAutenticacion();
    }

    // ✅ Verificar cada 5 segundos si el token sigue presente
    const intervalo = setInterval(async () => {
      const token = await storage.getItem(TOKEN_KEY);
      
      // Si no hay token pero estamos autenticados = sesión expirada
      if (!token && authenticated && !sessionExpiredTriggered.current) {
        console.log('🔒 [useAuth] Token desapareció - SESIÓN EXPIRADA');
        sessionExpiredTriggered.current = true;
        
        setAuthenticated(false);
        setLoading(false);
        
        // ✅ Llamar al manejador del contexto para mostrar modal
        handleSessionExpired();
      }
    }, 5000);
    
    return () => {
      montado.current = false;
      clearInterval(intervalo);
    };
  }, [authenticated, handleSessionExpired]);

  const verificarAutenticacion = async () => {
    if (redirecting.current) {
      console.log('🔄 [useAuth] Ya estamos redirigiendo, ignorando verificación');
      return;
    }

    try {
      console.log('🔍 [useAuth] Verificando autenticación...');
      console.log('📍 [useAuth] Ruta actual:', pathname);
      
      const token = await storage.getItem(TOKEN_KEY);
      console.log('🧪 [useAuth] Token desde storage:', token ? 'PRESENTE' : 'NULL');
      
      if (!token) {
        console.log('❌ [useAuth] No hay token, redirigiendo a login');
        if (montado.current && !redirecting.current) {
          redirecting.current = true;
          setLoading(false);
          setAuthenticated(false);
          router.replace('/auth/login');
        }
        return;
      }

      const [rolIdStr, usernameStorage, emailStorage, nombreRolStorage, usuarioIdStr] = await Promise.all([
        storage.getItem('@rol_principal_id'),
        storage.getItem('@usuario_username'),
        storage.getItem('@usuario_email'),
        storage.getItem('@rol_principal_nombre'),
        storage.getItem('@usuario_id')
      ]);
      
      if (!rolIdStr || !usernameStorage) {
        console.log('❌ [useAuth] Sesión incompleta (falta rol o username)');
        throw new Error('Sesión incompleta - datos faltantes');
      }

      const idRolActual = parseInt(rolIdStr);
      
      if (isNaN(idRolActual) || idRolActual < 1 || idRolActual > 3) {
        console.log('❌ [useAuth] Rol inválido:', idRolActual);
        throw new Error('Rol inválido');
      }
      
      console.log('✅ [useAuth] Usuario desde storage:', usernameStorage);
      console.log('🎭 [useAuth] Rol ID:', idRolActual);

      const estaEnRutaCorrecta = rutaPerteneceAlRol(pathname, idRolActual);
      
      if (rolesPermitidos.length > 0) {
        const tieneRolPermitido = rolesPermitidos.includes(idRolActual);

        if (!tieneRolPermitido) {
          console.log('⚠️ [useAuth] Usuario no tiene permisos para esta ruta');
          
          if (!estaEnRutaCorrecta && !redirecting.current) {
            const rutaCorrecta = getRutaPorRol(idRolActual);
            console.log('🔀 [useAuth] Redirigiendo a su ruta correcta:', rutaCorrecta);
            
            if (montado.current) {
              redirecting.current = true;
              setLoading(false);
              setAuthenticated(false);
              
              await new Promise(resolve => setTimeout(resolve, 100));
              router.replace(rutaCorrecta);
            }
            return;
          } else if (estaEnRutaCorrecta) {
            console.log('⚠️ [useAuth] Está en su sección pero esta página requiere otro rol');
            if (montado.current) {
              setLoading(false);
              setAuthenticated(false);
            }
            return;
          }
        }
      }

      console.log('✅ [useAuth] Autenticación exitosa');
      
      const usuarioData = {
        id_usuario: usuarioIdStr ? parseInt(usuarioIdStr) : null,
        username: usernameStorage,
        email: emailStorage,
        nombre_completo: usernameStorage
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
      
      if (montado.current && !redirecting.current && !sessionExpiredTriggered.current) {
        sessionExpiredTriggered.current = true;
        
        setLoading(false);
        setAuthenticated(false);
        
        // ✅ Usar el contexto para mostrar modal y limpiar
        handleSessionExpired();
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
      
      if (redirecting.current || sessionExpiredTriggered.current) {
        console.log('🔄 [useAuth] Logout ya en proceso');
        return;
      }
      
      sessionExpiredTriggered.current = true;
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

      // ✅ Limpiar todo
      await Promise.all([
        storage.removeItem(TOKEN_KEY),
        storage.removeItem('@usuario_id'),
        storage.removeItem('@usuario_username'),
        storage.removeItem('@usuario_email'),
        storage.removeItem('@rol_principal_id'),
        storage.removeItem('@rol_principal_nombre'),
        storage.removeItem('@todos_roles'),
        storage.removeItem('@permisos'),
        storage.removeItem('@datos_sesion'),
      ]);
      
      if (montado.current) {
        setAuthenticated(false);
        setUsuario(null);
        setRolPrincipal(null);
        setPermisos({});
      }
      
      await new Promise(resolve => setTimeout(resolve, 100));
      router.replace('/auth/login');
      
    } catch (error) {
      console.error('❌ [useAuth] Error en logout:', error);
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
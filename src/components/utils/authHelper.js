// src/components/utils/authHelper.js
import { jwtDecode } from "jwt-decode";
import { apiClient } from "../../api/client";

/**
 * Callback opcional que se llama cuando se detecta token expirado
 * Debe ser configurado por el SessionProvider
 */
let sessionExpiredCallback = null;

export const setSessionExpiredCallback = (callback) => {
  sessionExpiredCallback = callback;
};

/**
 * Obtiene el ID del usuario desde el token JWT
 * @returns {Promise<number|null>} ID del usuario o null si no hay token válido
 */
export const getUserIdFromToken = async () => {
  try {
    const token = await apiClient.getToken();

    if (!token) {
      console.log("❌ [authHelper] No hay token - usuario no autenticado");
      return null;
    }

    // ✅ Verificar si el token está expirado ANTES de decodificar
    const decoded = jwtDecode(token);
    console.log("🔍 [authHelper] Token decodificado:", decoded);

    // ✅ Verificar expiración
    if (decoded.exp) {
      const now = Math.floor(Date.now() / 1000);
      if (decoded.exp < now) {
        console.log("🔒 [authHelper] Token expirado - llamando callback");
        
        // ✅ Llamar al callback si existe (mostrará el modal)
        if (sessionExpiredCallback) {
          sessionExpiredCallback();
        }
        
        return null;
      }
    }

    // El ID está en "sub" como STRING
    const userId = decoded.sub ? parseInt(decoded.sub) : null;
    
    if (userId && !isNaN(userId)) {
      console.log("✅ [authHelper] ID obtenido:", userId);
      return userId;
    }

    console.log("❌ [authHelper] ID inválido en token");
    return null;

  } catch (error) {
    console.error("❌ [authHelper] Error obteniendo ID desde token:", error);
    
    // ✅ Si el error es por token inválido o expirado
    if (error.name === 'InvalidTokenError' || error.message.includes('expired')) {
      console.log("🔒 [authHelper] Token inválido/expirado - llamando callback");
      
      if (sessionExpiredCallback) {
        sessionExpiredCallback();
      }
    }
    
    return null;
  }
};

/**
 * Verifica si el usuario está autenticado (tiene token válido)
 * @returns {Promise<boolean>}
 */
export const isAuthenticated = async () => {
  const userId = await getUserIdFromToken();
  return userId !== null;
};

/**
 * Obtiene el rol del usuario desde el token
 * @returns {Promise<string|null>}
 */
export const getUserRoleFromToken = async () => {
  try {
    const token = await apiClient.getToken();

    if (!token) {
      return null;
    }

    const decoded = jwtDecode(token);
    
    // Verificar expiración
    if (decoded.exp) {
      const now = Math.floor(Date.now() / 1000);
      if (decoded.exp < now) {
        console.log("🔒 [authHelper] Token expirado");
        
        if (sessionExpiredCallback) {
          sessionExpiredCallback();
        }
        
        return null;
      }
    }

    // El rol puede estar en diferentes campos según tu backend
    return decoded.role || decoded.rol || decoded.user_role || null;

  } catch (error) {
    console.error("❌ [authHelper] Error obteniendo rol desde token:", error);
    
    if (error.name === 'InvalidTokenError' || error.message.includes('expired')) {
      if (sessionExpiredCallback) {
        sessionExpiredCallback();
      }
    }
    
    return null;
  }
};

/**
 * Obtiene el email del usuario desde el token
 * @returns {Promise<string|null>}
 */
export const getUserEmailFromToken = async () => {
  try {
    const token = await apiClient.getToken();

    if (!token) {
      return null;
    }

    const decoded = jwtDecode(token);
    
    // Verificar expiración
    if (decoded.exp) {
      const now = Math.floor(Date.now() / 1000);
      if (decoded.exp < now) {
        console.log("🔒 [authHelper] Token expirado");
        
        if (sessionExpiredCallback) {
          sessionExpiredCallback();
        }
        
        return null;
      }
    }

    return decoded.email || null;

  } catch (error) {
    console.error("❌ [authHelper] Error obteniendo email desde token:", error);
    
    if (error.name === 'InvalidTokenError' || error.message.includes('expired')) {
      if (sessionExpiredCallback) {
        sessionExpiredCallback();
      }
    }
    
    return null;
  }
};

/**
 * Obtiene toda la información del usuario desde el token
 * @returns {Promise<object|null>}
 */
export const getUserDataFromToken = async () => {
  try {
    const token = await apiClient.getToken();

    if (!token) {
      return null;
    }

    const decoded = jwtDecode(token);
    
    // Verificar expiración
    if (decoded.exp) {
      const now = Math.floor(Date.now() / 1000);
      if (decoded.exp < now) {
        console.log("🔒 [authHelper] Token expirado");
        
        if (sessionExpiredCallback) {
          sessionExpiredCallback();
        }
        
        return null;
      }
    }

    return {
      id: decoded.sub ? parseInt(decoded.sub) : null,
      email: decoded.email || null,
      role: decoded.role || decoded.rol || null,
      username: decoded.username || decoded.user || null,
      exp: decoded.exp || null,
      iat: decoded.iat || null,
    };

  } catch (error) {
    console.error("❌ [authHelper] Error obteniendo datos desde token:", error);
    
    if (error.name === 'InvalidTokenError' || error.message.includes('expired')) {
      if (sessionExpiredCallback) {
        sessionExpiredCallback();
      }
    }
    
    return null;
  }
};
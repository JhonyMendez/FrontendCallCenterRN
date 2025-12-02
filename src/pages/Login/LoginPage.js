// ==================================================================================
// src/pages/Login/LoginPage.js
// Página de Login UNIVERSAL (React Web + React Native) - BUCLE INFINITO SOLUCIONADO
// ==================================================================================

import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, Platform, View } from "react-native";
import { apiClient } from "../../api/client";
import authService from "../../api/services/authService";
import { usuarioService } from "../../api/services/usuarioService";
import LoginCard from "../../components/Login/LoginCard";
import { loginStyles } from "../../styles/loginStyles";

// Detectar plataforma
const isWeb = Platform.OS === 'web';

// Importación condicional de AsyncStorage
let AsyncStorage;
if (!isWeb) {
  AsyncStorage = require('@react-native-async-storage/async-storage').default;
}

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
  },

  async multiRemove(keys) {
    if (isWeb) {
      keys.forEach(key => localStorage.removeItem(key));
    } else {
      await AsyncStorage.multiRemove(keys);
    }
  }
};

// ==================================================================================
// CONSTANTES DE SEGURIDAD
// ==================================================================================
const MAX_INTENTOS_LOGIN = 5;
const TIEMPO_BLOQUEO_MS = 15 * 60 * 1000; // 15 minutos
const STORAGE_KEYS = {
  INTENTOS: '@login_intentos',
  BLOQUEO_HASTA: '@login_bloqueo_hasta',
  ULTIMO_INTENTO: '@login_ultimo_intento'
};

export default function LoginPage() {
  const router = useRouter();
  const verificacionRealizada = useRef(false); // CRÍTICO: Evitar verificaciones múltiples
  const redirigiendo = useRef(false); // CRÍTICO: Evitar redirecciones múltiples

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(true); // Comienza en true
  const [intentosFallidos, setIntentosFallidos] = useState(0);
  const [bloqueadoHasta, setBloqueadoHasta] = useState(null);
  const [tiempoRestante, setTiempoRestante] = useState(0);

// ==================== VERIFICAR SI YA ESTÁ AUTENTICADO ====================
useEffect(() => {
  // Solo verificar una vez al montar el componente
  if (!verificacionRealizada.current) {
    verificacionRealizada.current = true;
    verificarSesionExistente();
  }
}, []);

const verificarSesionExistente = async () => {
  // Si ya estamos redirigiendo, no hacer nada
  if (redirigiendo.current) {
    console.log("🔄 Redirección ya en proceso, ignorando verificación");
    return;
  }

  try {
    console.log("🔍 [LoginPage] Verificando sesión existente...");
    const token = await apiClient.getToken();
    
    if (!token) {
      console.log("ℹ️ [LoginPage] No hay token, mostrando formulario");
      setIsLoading(false);
      return;
    }

    console.log("✅ [LoginPage] Token encontrado:", token.substring(0, 20) + "...");
    
    // ⚠️ NUEVO: Verificar que el token sea válido haciendo una petición al backend
    //try {
      //const validacion = await apiClient.get('/auth/verify-token');
      //console.log("✅ [LoginPage] Token validado por el servidor:", validacion);
    //} catch (errorValidacion) {
      //console.log("❌ [LoginPage] Token inválido en servidor, limpiando sesión");
      //await apiClient.removeToken();
      //await authService.limpiarSesion();
      //setIsLoading(false);
      //return;
    //}
    
    // Verificar que existan datos básicos en storage
    const [rolIdStr, username, esAdmin, esSuperAdmin] = await Promise.all([
      storage.getItem('@rol_principal_id'),
      storage.getItem('@usuario_username'),
      storage.getItem('@usuario_es_admin'),
      storage.getItem('@usuario_es_superadmin')
    ]);
    
    console.log("📦 [LoginPage] Datos en storage:", {
      rolIdStr,
      username,
      esAdmin,
      esSuperAdmin
    });
    
    if (!rolIdStr || !username) {
      console.log("⚠️ [LoginPage] Sesión incompleta, limpiando...");
      await apiClient.removeToken();
      await authService.limpiarSesion();
      setIsLoading(false);
      return;
    }

    // ⚠️ NUEVO: Validar que el rol sea correcto
    const rolId = parseInt(rolIdStr);
    if (isNaN(rolId) || rolId < 1) {
      console.log("⚠️ [LoginPage] Rol inválido, limpiando sesión");
      await apiClient.removeToken();
      await authService.limpiarSesion();
      setIsLoading(false);
      return;
    }

    // Calcular ruta de destino
    const ruta = authService.getRutaPorRol(rolId);
    console.log("🚀 [LoginPage] Sesión válida, redirigiendo a:", ruta);
    
    // ⚠️ NUEVO: Agregar un pequeño delay antes de redirigir
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Marcar que estamos redirigiendo ANTES de redirigir
    redirigiendo.current = true;
    
    // Redirigir
    router.replace(ruta);
    
    // NO llamar setIsLoading(false) aquí - mantener loading durante redirect
    
  } catch (error) {
    console.log("❌ [LoginPage] Error verificando sesión:", error);
    
    try {
      await apiClient.removeToken();
      await authService.limpiarSesion();
    } catch (cleanupError) {
      console.error("Error limpiando sesión:", cleanupError);
    }
    
    setIsLoading(false);
  }
};

  // ==================== CARGAR INTENTOS Y BLOQUEOS ====================
  useEffect(() => {
    cargarEstadoBloqueo();
  }, []);

  const cargarEstadoBloqueo = async () => {
    try {
      const [intentos, bloqueoHasta] = await Promise.all([
        storage.getItem(STORAGE_KEYS.INTENTOS),
        storage.getItem(STORAGE_KEYS.BLOQUEO_HASTA)
      ]);

      if (intentos) {
        setIntentosFallidos(parseInt(intentos));
      }

      if (bloqueoHasta) {
        const tiempoBloqueo = parseInt(bloqueoHasta);
        const ahora = Date.now();
        
        if (tiempoBloqueo > ahora) {
          setBloqueadoHasta(tiempoBloqueo);
          iniciarTemporizadorBloqueo(tiempoBloqueo);
        } else {
          await limpiarBloqueo();
        }
      }
    } catch (error) {
      console.error("❌ Error cargando estado de bloqueo:", error);
    }
  };

  // ==================== TEMPORIZADOR DE BLOQUEO ====================
  const iniciarTemporizadorBloqueo = (tiempoBloqueo) => {
    const intervalo = setInterval(() => {
      const ahora = Date.now();
      const restante = tiempoBloqueo - ahora;
      
      if (restante <= 0) {
        clearInterval(intervalo);
        limpiarBloqueo();
        setTiempoRestante(0);
        setBloqueadoHasta(null);
      } else {
        setTiempoRestante(Math.ceil(restante / 1000));
      }
    }, 1000);

    return () => clearInterval(intervalo);
  };

  // ==================== GESTIÓN DE INTENTOS FALLIDOS ====================
  const registrarIntentoFallido = async () => {
    try {
      const nuevosIntentos = intentosFallidos + 1;
      setIntentosFallidos(nuevosIntentos);
      
      await storage.setItem(STORAGE_KEYS.INTENTOS, nuevosIntentos.toString());
      await storage.setItem(STORAGE_KEYS.ULTIMO_INTENTO, Date.now().toString());

      if (nuevosIntentos >= MAX_INTENTOS_LOGIN) {
        await bloquearTemporalmente();
      } else {
        const intentosRestantes = MAX_INTENTOS_LOGIN - nuevosIntentos;
        setErrorMsg(
          `Credenciales incorrectas. Te quedan ${intentosRestantes} intento${intentosRestantes !== 1 ? 's' : ''}`
        );
      }
    } catch (error) {
      console.error("❌ Error registrando intento fallido:", error);
    }
  };

  const bloquearTemporalmente = async () => {
    try {
      const tiempoBloqueo = Date.now() + TIEMPO_BLOQUEO_MS;
      await storage.setItem(STORAGE_KEYS.BLOQUEO_HASTA, tiempoBloqueo.toString());
      setBloqueadoHasta(tiempoBloqueo);
      iniciarTemporizadorBloqueo(tiempoBloqueo);
      
      setErrorMsg(
        `Demasiados intentos fallidos. Intenta nuevamente en 15 minutos`
      );

      if (!isWeb) {
        Alert.alert(
          "Cuenta bloqueada temporalmente",
          "Has excedido el número máximo de intentos. Espera 15 minutos para volver a intentar.",
          [{ text: "Entendido" }]
        );
      }
    } catch (error) {
      console.error("❌ Error bloqueando temporalmente:", error);
    }
  };

  const limpiarBloqueo = async () => {
    try {
      await storage.multiRemove([
        STORAGE_KEYS.INTENTOS,
        STORAGE_KEYS.BLOQUEO_HASTA,
        STORAGE_KEYS.ULTIMO_INTENTO
      ]);
      setIntentosFallidos(0);
      setBloqueadoHasta(null);
      setTiempoRestante(0);
    } catch (error) {
      console.error("❌ Error limpiando bloqueo:", error);
    }
  };

  // ==================== VALIDACIONES DE SEGURIDAD ====================
  const validarCredenciales = () => {
    if (!username.trim()) {
      setErrorMsg("Por favor ingresa tu usuario");
      return false;
    }

    if (username.trim().length < 3) {
      setErrorMsg("El usuario debe tener al menos 3 caracteres");
      return false;
    }

    if (username.trim().length > 50) {
      setErrorMsg("El usuario no puede exceder 50 caracteres");
      return false;
    }

    const usernameRegex = /^[a-zA-Z0-9_-]+$/;
    if (!usernameRegex.test(username.trim())) {
      setErrorMsg("El usuario solo puede contener letras, números, guiones y guión bajo");
      return false;
    }

    if (!password.trim()) {
      setErrorMsg("Por favor ingresa tu contraseña");
      return false;
    }

    if (password.trim().length < 4) {
      setErrorMsg("La contraseña debe tener al menos 4 caracteres");
      return false;
    }

    if (password.trim().length > 100) {
      setErrorMsg("La contraseña no puede exceder 100 caracteres");
      return false;
    }

    return true;
  };

  // ==================== SANITIZACIÓN ====================
  const sanitizarInput = (input) => {
  return input
    .trim()
    .replace(/[<>]/g, '')
    .slice(0, 100);
};

// ==================== MANEJO DE LOGIN CON ROLES ====================
// ==================== MANEJO DE LOGIN CON ROLES ====================
const handleLogin = async () => {
  // 1. Bloqueo por demasiados intentos
  if (bloqueadoHasta && Date.now() < bloqueadoHasta) {
    const minutosRestantes = Math.ceil(tiempoRestante / 60);
    setErrorMsg(
      `Cuenta bloqueada. Espera ${minutosRestantes} minuto${minutosRestantes !== 1 ? 's' : ''} para intentar nuevamente`
    );
    return;
  }

  // 2. Validar campos
  if (!validarCredenciales()) {
    return;
  }

  setErrorMsg("");
  setIsLoading(true);

  try {
    const usernameSanitizado = sanitizarInput(username);
    const passwordSanitizado = password.trim();

    console.log("🔐 [LoginPage] Intentando login con:", { username: usernameSanitizado });

    // 👇 SIN Promise.race, esperamos directamente al backend
    const response = await usuarioService.login({ 
      username: usernameSanitizado, 
      password: passwordSanitizado
    });

    console.log("✅ [LoginPage] Respuesta del servidor recibida");

    // ===== VALIDACIONES DE RESPUESTA =====
    if (!response || typeof response !== 'object') {
      throw new Error("Respuesta del servidor inválida");
    }

    if (!response.token || typeof response.token !== 'string') {
      throw new Error("Token de autenticación inválido");
    }

    if (!response.usuario || typeof response.usuario !== 'object') {
      throw new Error("Datos de usuario inválidos");
    }

    if (response.token.length < 10) {
      throw new Error("Token de autenticación mal formado");
    }

    // Limpiar intentos fallidos y guardar token
    await limpiarBloqueo();
    await apiClient.setToken(response.token);
    await new Promise(resolve => setTimeout(resolve, 100));
    console.log("✅ [LoginPage] Token guardado correctamente");

    // Usuario inactivo
    if (response.usuario.estado !== 'activo') {
      await apiClient.removeToken();
      setErrorMsg("Tu cuenta no está activa. Contacta al administrador");
      setIsLoading(false);
      return;
    }

    // Cambio de contraseña obligatorio
    if (response.usuario.requiere_cambio_password === true) {
      console.log("⚠️ [LoginPage] Usuario requiere cambio de contraseña");
      redirigiendo.current = true;
      await new Promise(resolve => setTimeout(resolve, 0));
      router.replace("/cambiar-password");
      return;
    }

    console.log("🔍 [LoginPage] Procesando roles del usuario...");
    
    const resultadoAuth = await authService.procesarLogin(response.usuario);

    if (!resultadoAuth.success) {
      throw new Error("Error procesando roles del usuario");
    }

    console.log("✅ [LoginPage] Autenticación completada");
    console.log(`👤 [LoginPage] Usuario: ${resultadoAuth.usuario}`);
    console.log(`🎭 [LoginPage] Rol: ${resultadoAuth.rolPrincipal}`);
    console.log(`🚀 [LoginPage] Redirigiendo a: ${resultadoAuth.ruta}`);

    // Marcar que estamos redirigiendo
    redirigiendo.current = true;
    await new Promise(resolve => setTimeout(resolve, 0));

    if (!isWeb) {
      Alert.alert(
        "Bienvenido",
        `Hola ${resultadoAuth.usuario}, has iniciado sesión como ${resultadoAuth.rolPrincipal}`,
        [{ 
          text: "Continuar", 
          onPress: () => {
            redirigiendo.current = true;
            router.replace(resultadoAuth.ruta);
          }
        }]
      );
    } else {
      router.replace(resultadoAuth.ruta);
    }

    // NO hacemos setIsLoading(false) aquí porque nos vamos a otra pantalla

  } catch (error) {
    console.error("❌ [LoginPage] Error en login:", error);
    
    // Resetear flag de redirección en caso de error
    redirigiendo.current = false;
    
    // Registrar intento fallido si es error de autenticación
    if (error.status === 401 || error.status === 403) {
      await registrarIntentoFallido();
    }

    // ===== MANEJO DE ERRORES =====
    if (error.status === 408 || error.isTimeout) {
      setErrorMsg(
        "No se pudo conectar con el servidor.\n" +
        "Verifica que el backend esté encendido y que el móvil esté en la MISMA red WiFi."
      );
    } else if (error.status === 401) {
      // Mensaje ya se setea en registrarIntentoFallido
    } else if (error.status === 403) {
      setErrorMsg(error.message || "Usuario bloqueado o inactivo. Contacta al administrador");
    } else if (error.status === 429) {
      setErrorMsg("Demasiadas solicitudes. Espera un momento e intenta nuevamente");
    } else if (error.status >= 500) {
      setErrorMsg("Error en el servidor. Intenta nuevamente más tarde");
    } else if (error.message === "Network request failed") {
      setErrorMsg("No se pudo conectar al servidor. Revisa tu conexión o la IP del backend");
    } else if (error.message && error.message.includes("sin roles")) {
      setErrorMsg(error.message);
    } else if (error.message && !error.message.includes("Credenciales")) {
      setErrorMsg(error.message);
    } else if (!errorMsg) {
      setErrorMsg("Error al iniciar sesión. Intenta nuevamente");
    }

    // Limpiar datos de autenticación
    try {
      await apiClient.removeToken();
      await authService.limpiarSesion();
    } catch (cleanupError) {
      console.error("Error limpiando sesión:", cleanupError);
    }
    
    setPassword("");
    setIsLoading(false);
  }
};

  // ==================== FORMATEAR TIEMPO RESTANTE ====================
  const formatearTiempoRestante = () => {
    if (tiempoRestante <= 0) return "";
    
    const minutos = Math.floor(tiempoRestante / 60);
    const segundos = tiempoRestante % 60;
    
    return `${minutos}:${segundos.toString().padStart(2, '0')}`;
  };

  // Si estamos redirigiendo, mostrar loading
  if (redirigiendo.current) {
    return (
      <View style={loginStyles.container}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      </View>
    );
  }

  return (
    <View style={loginStyles.container}>
      {isLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      ) : (
        <LoginCard
          username={username}
          password={password}
          setUsername={setUsername}
          setPassword={setPassword}
          errorMsg={errorMsg}
          handleLogin={handleLogin}
          isBlocked={bloqueadoHasta && Date.now() < bloqueadoHasta}
          tiempoRestante={formatearTiempoRestante()}
          intentosRestantes={Math.max(0, MAX_INTENTOS_LOGIN - intentosFallidos)}
        />
      )}
    </View>
  );
}
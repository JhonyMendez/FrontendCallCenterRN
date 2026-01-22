// ==================================================================================
// src/pages/Login/LoginPage.js
// Sistema de Bloqueo PROGRESIVO POR USUARIO (almacenado en frontend)
// Compatible con Web (localStorage) y Móvil (AsyncStorage)
// ==================================================================================

import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, Platform, ScrollView, View } from "react-native";
import { apiClient } from "../../api/client";
import authService from "../../api/services/authService";
import { usuarioService } from "../../api/services/usuarioService";
import LoginCard from "../../components/Login/LoginCard";
import { loginStyles } from "../../styles/loginStyles";

// ==================================================================================
// STORAGE UNIVERSAL - Compatible con Web y Móvil
// ==================================================================================
const storage = {
  async getItem(key) {
    try {
      if (Platform.OS === 'web') {
        // Web: usar localStorage (síncrono pero lo hacemos async)
        return Promise.resolve(localStorage.getItem(key));
      } else {
        // Móvil: usar AsyncStorage
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        return await AsyncStorage.getItem(key);
      }
    } catch (error) {
      console.error(`Error obteniendo ${key}:`, error);
      return null;
    }
  },

  async setItem(key, value) {
    try {
      if (Platform.OS === 'web') {
        localStorage.setItem(key, value);
        return Promise.resolve();
      } else {
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        return await AsyncStorage.setItem(key, value);
      }
    } catch (error) {
      console.error(`Error guardando ${key}:`, error);
    }
  },

  async removeItem(key) {
    try {
      if (Platform.OS === 'web') {
        localStorage.removeItem(key);
        return Promise.resolve();
      } else {
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        return await AsyncStorage.removeItem(key);
      }
    } catch (error) {
      console.error(`Error eliminando ${key}:`, error);
    }
  },

  async multiRemove(keys) {
    try {
      if (Platform.OS === 'web') {
        keys.forEach(key => localStorage.removeItem(key));
        return Promise.resolve();
      } else {
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        return await AsyncStorage.multiRemove(keys);
      }
    } catch (error) {
      console.error('Error eliminando múltiples keys:', error);
    }
  }
};

// ==================================================================================
// CONSTANTES DE SEGURIDAD CON BLOQUEO PROGRESIVO POR USUARIO
// ==================================================================================
const MAX_INTENTOS_LOGIN = 5;

// Tiempos de bloqueo progresivos (en milisegundos)
const TIEMPOS_BLOQUEO = [
  5 * 60 * 1000,      // 1er bloqueo: 5 minutos
  15 * 60 * 1000,     // 2do bloqueo: 15 minutos
  30 * 60 * 1000,     // 3er bloqueo: 30 minutos
  60 * 60 * 1000,     // 4to bloqueo: 1 hora
  120 * 60 * 1000     // 5to+ bloqueo: 2 horas
];

// ==================================================================================
// GESTOR DE BLOQUEOS POR USUARIO
// ==================================================================================
const BloqueoUsuarioManager = {
  // Obtener clave única para el usuario
  getKey: (username, suffix) => {
    return `@login_${username}_${suffix}`;
  },

  // Obtener datos de bloqueo del usuario
  getDatosUsuario: async (username) => {
    try {
      const [intentos, bloqueoHasta, contadorBloqueos, ultimoReset] = await Promise.all([
        storage.getItem(BloqueoUsuarioManager.getKey(username, 'intentos')),
        storage.getItem(BloqueoUsuarioManager.getKey(username, 'bloqueo_hasta')),
        storage.getItem(BloqueoUsuarioManager.getKey(username, 'contador_bloqueos')),
        storage.getItem(BloqueoUsuarioManager.getKey(username, 'ultimo_reset'))
      ]);

      return {
        intentos: intentos ? parseInt(intentos) : 0,
        bloqueoHasta: bloqueoHasta ? parseInt(bloqueoHasta) : null,
        contadorBloqueos: contadorBloqueos ? parseInt(contadorBloqueos) : 0,
        ultimoReset: ultimoReset ? parseInt(ultimoReset) : null
      };
    } catch (error) {
      console.error("Error obteniendo datos de usuario:", error);
      return {
        intentos: 0,
        bloqueoHasta: null,
        contadorBloqueos: 0,
        ultimoReset: null
      };
    }
  },

  // Verificar si debe resetear el contador (24h sin bloqueos)
  debeResetearContador: (ultimoReset) => {
    if (!ultimoReset) return false;
    const RESET_DESPUES_DE = 24 * 60 * 60 * 1000; // 24 horas
    return (Date.now() - ultimoReset) > RESET_DESPUES_DE;
  },

  // Registrar intento fallido
  registrarIntentoFallido: async (username) => {
    const datos = await BloqueoUsuarioManager.getDatosUsuario(username);
    const nuevosIntentos = datos.intentos + 1;

    await storage.setItem(
      BloqueoUsuarioManager.getKey(username, 'intentos'),
      nuevosIntentos.toString()
    );

    return nuevosIntentos;
  },

  // Bloquear usuario
  bloquearUsuario: async (username) => {
    const datos = await BloqueoUsuarioManager.getDatosUsuario(username);

    // Verificar si debe resetear el contador
    if (BloqueoUsuarioManager.debeResetearContador(datos.ultimoReset)) {
      console.log(`🔄 Reseteando contador de bloqueos para ${username}`);
      datos.contadorBloqueos = 0;
    }

    // Incrementar contador de bloqueos
    const nuevoContador = datos.contadorBloqueos + 1;

    // Calcular tiempo de bloqueo
    const indiceBloqueo = Math.min(nuevoContador - 1, TIEMPOS_BLOQUEO.length - 1);
    const duracionBloqueo = TIEMPOS_BLOQUEO[indiceBloqueo];
    const tiempoBloqueo = Date.now() + duracionBloqueo;

    // Guardar datos
    await Promise.all([
      storage.setItem(
        BloqueoUsuarioManager.getKey(username, 'bloqueo_hasta'),
        tiempoBloqueo.toString()
      ),
      storage.setItem(
        BloqueoUsuarioManager.getKey(username, 'contador_bloqueos'),
        nuevoContador.toString()
      ),
      storage.setItem(
        BloqueoUsuarioManager.getKey(username, 'ultimo_reset'),
        Date.now().toString()
      )
    ]);

    return {
      nuevoContador,
      duracionBloqueo,
      tiempoBloqueo
    };
  },

  // Limpiar bloqueo actual (pero mantener el contador)
  limpiarBloqueoActual: async (username) => {
    await storage.multiRemove([
      BloqueoUsuarioManager.getKey(username, 'intentos'),
      BloqueoUsuarioManager.getKey(username, 'bloqueo_hasta')
    ]);
  },

  // Resetear TODO para el usuario (login exitoso)
  resetearUsuario: async (username) => {
    console.log(`✅ Login exitoso - Reseteando datos de bloqueo para: ${username}`);
    await storage.multiRemove([
      BloqueoUsuarioManager.getKey(username, 'intentos'),
      BloqueoUsuarioManager.getKey(username, 'bloqueo_hasta'),
      BloqueoUsuarioManager.getKey(username, 'contador_bloqueos'),
      BloqueoUsuarioManager.getKey(username, 'ultimo_reset')
    ]);
  }
};

// ==================================================================================
// COMPONENTE PRINCIPAL
// ==================================================================================
export default function LoginPage() {
  const router = useRouter();
  const verificacionRealizada = useRef(false);
  const redirigiendo = useRef(false);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [intentosFallidos, setIntentosFallidos] = useState(0);
  const [bloqueadoHasta, setBloqueadoHasta] = useState(null);
  const [tiempoRestante, setTiempoRestante] = useState(0);
  const [contadorBloqueos, setContadorBloqueos] = useState(0);

  // ==================== VERIFICAR SI YA ESTÁ AUTENTICADO ====================
  useEffect(() => {
    if (!verificacionRealizada.current) {
      verificacionRealizada.current = true;
      verificarSesionExistente();
    }
  }, []);

  const verificarSesionExistente = async () => {
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

      console.log("✅ [LoginPage] Token encontrado, validando con servidor...");

      try {
        const validacion = await apiClient.get('/usuarios/verificar-sesion');

        if (!validacion || !validacion.valido) {
          throw new Error("Token inválido según servidor");
        }

        console.log("✅ [LoginPage] Token validado correctamente");

      } catch (errorValidacion) {
        console.log("❌ [LoginPage] Token inválido:", errorValidacion.message);
        await apiClient.removeToken();
        await authService.limpiarSesion();
        setIsLoading(false);
        return;
      }

      const [rolIdStr, username] = await Promise.all([
        storage.getItem('@rol_principal_id'),
        storage.getItem('@usuario_username')
      ]);

      if (!rolIdStr || !username) {
        console.log("⚠️ [LoginPage] Sesión incompleta, limpiando...");
        await apiClient.removeToken();
        await authService.limpiarSesion();
        setIsLoading(false);
        return;
      }

      const rolId = parseInt(rolIdStr);
      if (isNaN(rolId) || rolId < 1) {
        console.log("⚠️ [LoginPage] Rol inválido");
        await apiClient.removeToken();
        await authService.limpiarSesion();
        setIsLoading(false);
        return;
      }

      const ruta = authService.getRutaPorRol(rolId);
      console.log("🚀 [LoginPage] Sesión válida, redirigiendo a:", ruta);

      await new Promise(resolve => setTimeout(resolve, 100));
      redirigiendo.current = true;
      router.replace(ruta);

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

  // ==================== CARGAR DATOS DEL USUARIO ACTUAL ====================
  useEffect(() => {
    if (username.trim().length >= 3) {
      cargarDatosUsuario();
    } else {
      // Resetear estado si no hay username
      setIntentosFallidos(0);
      setBloqueadoHasta(null);
      setContadorBloqueos(0);
      setTiempoRestante(0);
    }
  }, [username]);

  const cargarDatosUsuario = async () => {
    try {
      const datos = await BloqueoUsuarioManager.getDatosUsuario(username.trim());

      setIntentosFallidos(datos.intentos);
      setContadorBloqueos(datos.contadorBloqueos);

      if (datos.bloqueoHasta && datos.bloqueoHasta > Date.now()) {
        setBloqueadoHasta(datos.bloqueoHasta);
        iniciarTemporizadorBloqueo(datos.bloqueoHasta);
      } else if (datos.bloqueoHasta) {
        // Bloqueo expirado, limpiar
        await BloqueoUsuarioManager.limpiarBloqueoActual(username.trim());
        setIntentosFallidos(0);
        setBloqueadoHasta(null);
      }
    } catch (error) {
      console.error("❌ Error cargando datos de usuario:", error);
    }
  };

  // ==================== TEMPORIZADOR DE BLOQUEO ====================
  useEffect(() => {
    let intervalo;

    if (bloqueadoHasta && bloqueadoHasta > Date.now()) {
      intervalo = setInterval(() => {
        const ahora = Date.now();
        const restante = bloqueadoHasta - ahora;

        if (restante <= 0) {
          setTiempoRestante(0);
          setBloqueadoHasta(null);
          if (username.trim()) {
            BloqueoUsuarioManager.limpiarBloqueoActual(username.trim());
          }
        } else {
          setTiempoRestante(Math.ceil(restante / 1000));
        }
      }, 1000);
    }

    return () => {
      if (intervalo) clearInterval(intervalo);
    };
  }, [bloqueadoHasta, username]);

  const iniciarTemporizadorBloqueo = (tiempoBloqueo) => {
    setBloqueadoHasta(tiempoBloqueo);
    const restante = Math.ceil((tiempoBloqueo - Date.now()) / 1000);
    setTiempoRestante(restante);
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
      setErrorMsg("El usuario solo puede contener letras, numeros, guiones y guion bajo");
      return false;
    }

    if (!password.trim()) {
      setErrorMsg("Por favor ingresa tu contrasena");
      return false;
    }

    if (password.trim().length < 4) {
      setErrorMsg("La contrasena debe tener al menos 4 caracteres");
      return false;
    }

    if (password.trim().length > 100) {
      setErrorMsg("La contrasena no puede exceder 100 caracteres");
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
  const handleLogin = async () => {
    // 1. Verificar bloqueo del usuario actual
    if (bloqueadoHasta && Date.now() < bloqueadoHasta) {
      const segundosRestantes = tiempoRestante;
      const minutosRestantes = Math.floor(segundosRestantes / 60);
      const segundos = segundosRestantes % 60;

      let mensajeTiempo = "";
      if (minutosRestantes > 0) {
        mensajeTiempo = `${minutosRestantes} minuto${minutosRestantes !== 1 ? 's' : ''}`;
        if (segundos > 0) {
          mensajeTiempo += ` y ${segundos} segundo${segundos !== 1 ? 's' : ''}`;
        }
      } else {
        mensajeTiempo = `${segundos} segundo${segundos !== 1 ? 's' : ''}`;
      }

      setErrorMsg(
        `Cuenta bloqueada. Espera ${mensajeTiempo} para intentar nuevamente.\n\n` +
        `Bloqueo numero ${contadorBloqueos}`
      );
      return;
    }

    // 2. Validar campos
    if (!validarCredenciales()) {
      return;
    }

    setErrorMsg("");
    setIsLoading(true);

    const usernameSanitizado = sanitizarInput(username);

    try {
      const passwordSanitizado = password.trim();

      console.log("🔐 [LoginPage] Intentando login con:", { username: usernameSanitizado });

      const response = await usuarioService.login({
        username: usernameSanitizado,
        password: passwordSanitizado
      });

      console.log("✅ [LoginPage] Respuesta del servidor recibida");

      // ===== VALIDACIONES DE RESPUESTA =====
      if (!response || typeof response !== 'object') {
        throw new Error("Respuesta del servidor invalida");
      }

      if (!response.token || typeof response.token !== 'string') {
        throw new Error("Token de autenticacion invalido");
      }

      if (!response.usuario || typeof response.usuario !== 'object') {
        throw new Error("Datos de usuario invalidos");
      }

      if (response.token.length < 10) {
        throw new Error("Token de autenticacion mal formado");
      }

      // ✅ LOGIN EXITOSO - RESETEAR TODO EL BLOQUEO DEL USUARIO
      await BloqueoUsuarioManager.resetearUsuario(usernameSanitizado);

      await apiClient.setToken(response.token);
      await new Promise(resolve => setTimeout(resolve, 100));
      console.log("✅ [LoginPage] Token guardado correctamente");

      // Usuario inactivo
      if (response.usuario.estado !== 'activo') {
        await apiClient.removeToken();
        setErrorMsg("Tu cuenta no esta activa. Contacta al administrador");
        setIsLoading(false);
        return;
      }

      console.log("🔍 [LoginPage] Procesando roles del usuario...");

      const resultadoAuth = await authService.procesarLogin(response.usuario);

      if (!resultadoAuth.success) {
        throw new Error("Error procesando roles del usuario");
      }

      // ✅ GUARDAR DATOS COMPLETOS EN LOCALSTORAGE
      try {
        const datosSesion = {
          usuario: {
            id_usuario: response.usuario.id_usuario,
            id_persona: response.usuario.persona?.id_persona || response.usuario.id_persona,
            username: response.usuario.username,
            email: response.usuario.email,
            estado: response.usuario.estado,
            nombre: response.usuario.persona?.nombre || response.usuario.nombre || '',
            apellido: response.usuario.persona?.apellido || response.usuario.apellido || '',
            cedula: response.usuario.persona?.cedula || response.usuario.cedula || '',
            telefono: response.usuario.persona?.telefono || response.usuario.telefono || '',
            direccion: response.usuario.persona?.direccion || response.usuario.direccion || '',
            fecha_nacimiento: response.usuario.persona?.fecha_nacimiento || response.usuario.fecha_nacimiento || null,
            genero: response.usuario.persona?.genero || response.usuario.genero || '',
            tipo_persona: response.usuario.persona?.tipo_persona || response.usuario.tipo_persona || '',
          },
          roles: response.usuario.roles || [],
          token: response.token,
          fecha_login: new Date().toISOString()
        };

        await storage.setItem('@datos_sesion', JSON.stringify(datosSesion));
        console.log('✅ [LoginPage] Datos completos guardados en @datos_sesion');

      } catch (errorGuardado) {
        console.error('⚠️ Error guardando datos completos:', errorGuardado);
      }

      console.log("✅ [LoginPage] Autenticacion completada");
      console.log(`👤 [LoginPage] Usuario: ${resultadoAuth.usuario}`);
      console.log(`🎭 [LoginPage] Rol: ${resultadoAuth.rolPrincipal}`);
      console.log(`🚀 [LoginPage] Redirigiendo a: ${resultadoAuth.ruta}`);

      redirigiendo.current = true;
      await new Promise(resolve => setTimeout(resolve, 0));

      if (Platform.OS !== 'web') {
        Alert.alert(
          "Bienvenido",
          `Hola ${resultadoAuth.usuario}, has iniciado sesion como ${resultadoAuth.rolPrincipal}`,
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

    } catch (error) {
      console.error("❌ [LoginPage] Error en login:", error);

      redirigiendo.current = false;

      // ❌ LOGIN FALLIDO - REGISTRAR INTENTO
      if (error.status === 401 || error.status === 403) {
        const nuevosIntentos = await BloqueoUsuarioManager.registrarIntentoFallido(usernameSanitizado);
        setIntentosFallidos(nuevosIntentos);

        if (nuevosIntentos >= MAX_INTENTOS_LOGIN) {
          // BLOQUEAR USUARIO
          const datosBloqueo = await BloqueoUsuarioManager.bloquearUsuario(usernameSanitizado);

          setBloqueadoHasta(datosBloqueo.tiempoBloqueo);
          setContadorBloqueos(datosBloqueo.nuevoContador);
          iniciarTemporizadorBloqueo(datosBloqueo.tiempoBloqueo);

          const minutos = Math.ceil(datosBloqueo.duracionBloqueo / (60 * 1000));
          let mensajeTiempo = "";

          if (minutos < 60) {
            mensajeTiempo = `${minutos} minutos`;
          } else {
            const horas = Math.floor(minutos / 60);
            mensajeTiempo = `${horas} hora${horas > 1 ? 's' : ''}`;
          }

          const mensajeBloqueo =
            `Demasiados intentos fallidos.\n\n` +
            `Bloqueo numero ${datosBloqueo.nuevoContador}\n` +
            `Duracion: ${mensajeTiempo}\n\n` +
            `Cada bloqueo aumenta el tiempo de espera.`;

          setErrorMsg(mensajeBloqueo);

          if (Platform.OS !== 'web') {
            Alert.alert(
              "Cuenta bloqueada temporalmente",
              `Este es tu bloqueo numero ${datosBloqueo.nuevoContador}.\n\n` +
              `Debes esperar ${mensajeTiempo} antes de volver a intentar.\n\n` +
              `Los bloqueos aumentan progresivamente:\n` +
              `- 1er bloqueo: 5 minutos\n` +
              `- 2do bloqueo: 15 minutos\n` +
              `- 3er bloqueo: 30 minutos\n` +
              `- 4to bloqueo: 1 hora\n` +
              `- 5to bloqueo en adelante: 2 horas`,
              [{ text: "Entendido" }]
            );
          }
        } else {
          const intentosRestantes = MAX_INTENTOS_LOGIN - nuevosIntentos;
          setErrorMsg(
            `Credenciales incorrectas. Te quedan ${intentosRestantes} intento${intentosRestantes !== 1 ? 's' : ''}`
          );
        }
      }

      // ===== MANEJO DE ERRORES =====
      if (error.status === 408 || error.isTimeout) {
        setErrorMsg(
          "No se pudo conectar con el servidor.\n" +
          "Verifica que el backend este encendido y que el movil este en la MISMA red WiFi."
        );
      } else if (error.status === 403) {
        setErrorMsg(error.message || "Usuario bloqueado o inactivo. Contacta al administrador");
      } else if (error.status === 429) {
        setErrorMsg("Demasiadas solicitudes. Espera un momento e intenta nuevamente");
      } else if (error.status >= 500) {
        setErrorMsg("Error en el servidor. Intenta nuevamente mas tarde");
      } else if (error.message === "Network request failed") {
        setErrorMsg("No se pudo conectar al servidor. Revisa tu conexion o la IP del backend");
      } else if (error.message && error.message.includes("sin roles")) {
        setErrorMsg(error.message);
      } else if (error.message && !error.message.includes("Credenciales") && !errorMsg) {
        setErrorMsg(error.message);
      }

      try {
        await apiClient.removeToken();
        await authService.limpiarSesion();
      } catch (cleanupError) {
        console.error("Error limpiando sesion:", cleanupError);
      }

      setPassword("");
      setIsLoading(false);
    }
  };

  // ==================== FORMATEAR TIEMPO RESTANTE ====================
  const formatearTiempoRestante = () => {
    if (tiempoRestante <= 0) return "";

    const horas = Math.floor(tiempoRestante / 3600);
    const minutos = Math.floor((tiempoRestante % 3600) / 60);
    const segundos = tiempoRestante % 60;

    if (horas > 0) {
      return `${horas}:${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
    }

    return `${minutos}:${segundos.toString().padStart(2, '0')}`;
  };

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
    <ScrollView
      style={{ flex: 1, backgroundColor: '#1a1a2e' }}
      contentContainerStyle={{ flexGrow: 1, paddingBottom: 200 }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
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
            mostrarPassword={mostrarPassword}
            setMostrarPassword={setMostrarPassword}
          />
        )}
      </View>
    </ScrollView>
  );
}
// ==================================================================================
// src/pages/Administrador/GestionUsuarioAdminPage.js
// ACTUALIZADO: Eliminado lógico + Modales custom + Reactivación
// ==================================================================================

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Search, Users } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

import { rolService } from '../../api/services/rolService';
import { usuarioService } from '../../api/services/usuarioService';
import GestionUsuariosCard from '../../components/SuperAdministrador/GestionUsuarioCard';
import UsuarioCard from '../../components/SuperAdministrador/UsuarioCard';

import AdminSidebar from '../../components/Sidebar/sidebarAdmin';
import { contentStyles } from '../../components/Sidebar/SidebarSuperAdminStyles';
import { getUserIdFromToken } from '../../components/utils/authHelper';
import SecurityValidator from '../../components/utils/SecurityValidator';
import { styles } from '../../styles/GestionUsuariosStyles';

const isWeb = Platform.OS === 'web';

// 🔐 ============ UTILIDADES DE SEGURIDAD ============
const SecurityUtils = {
    // Rate Limiter
    createRateLimiter(maxAttempts, windowMs) {
        const attempts = {};
        return {
            isAllowed(key) {
                const now = Date.now();
                if (!attempts[key]) {
                    attempts[key] = [];
                }
                attempts[key] = attempts[key].filter(time => now - time < windowMs);
                if (attempts[key].length >= maxAttempts) {
                    this.logSecurityEvent('RATE_LIMIT_EXCEEDED', { key, attempts: attempts[key].length });
                    return false;
                }
                attempts[key].push(now);
                return true;
            }
        };
    },

    // Validar ID numérico
    validateId(id) {
        const numId = parseInt(id, 10);
        return !isNaN(numId) && numId > 0;
    },

    // Validar estructura de objeto usuario COMPLETA
    validateUserObject(user) {
        if (!user || typeof user !== 'object') {
            return false;
        }
        if (!user.id_usuario || !this.validateId(user.id_usuario)) {
            return false;
        }
        if (!user.username || typeof user.username !== 'string') {
            return false;
        }
        // Validar que tenga roles como array
        if (!Array.isArray(user.roles)) {
            return false;
        }
        // Validar estructura de persona si existe
        if (user.persona) {
            if (typeof user.persona !== 'object' || !user.persona.nombre || !user.persona.apellido) {
                return false;
            }
        }
        return true;
    },

    // Detectar XSS
    detectXssAttempt(text) {
        if (!text) return false;
        const xssPatterns = [
            /<script[^>]*>.*?<\/script>/gi,
            /on\w+\s*=/gi,
            /<iframe/gi,
            /javascript:/gi,
            /eval\(/gi,
            /onerror\s*=/gi,
            /onload\s*=/gi,
        ];
        return xssPatterns.some(pattern => pattern.test(text));
    },

    // Log de eventos de seguridad
    logSecurityEvent(eventType, details) {
        const timestamp = new Date().toISOString();
        console.warn('🔒 SECURITY EVENT:', {
            timestamp,
            eventType,
            details,
            userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A',
        });
    }
};

const GestionUsuarioPage = () => {
  // ==================== ESTADOS ====================
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [usuarios, setUsuarios] = useState([]);
  const [usuariosFiltrados, setUsuariosFiltrados] = useState([]);
  const [roles, setRoles] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [filtroRol, setFiltroRol] = useState('todos');
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [totalUsuarios, setTotalUsuarios] = useState(0);

  // ✅ NUEVOS ESTADOS PARA PAGINACIÓN
  const [skip, setSkip] = useState(0);
  const [limit, setLimit] = useState(50); // Por defecto 50 usuarios
  const [paginaActual, setPaginaActual] = useState(1);


  // ==================== ESTADOS PARA MODALES ====================
  const [modalConfirm, setModalConfirm] = useState({
    visible: false,
    title: '',
    message: '',
    onConfirm: null,
    type: 'danger'
  });

  const [modalNotification, setModalNotification] = useState({
    visible: false,
    message: '',
    type: 'success'
  });

  const [modalDepartamentoAsignado, setModalDepartamentoAsignado] = useState({
    visible: false,
    usuario: null,
    departamento: null
  });

  // ==================== ANIMACIONES ====================
  const fadeAnim = useRef(new Animated.Value(0)).current;
  // ✅ Rate limiter para búsquedas: 30 intentos por minuto
  const rateLimiterBusqueda = useRef(SecurityUtils.createRateLimiter(30, 60000)).current;
  // ✅ Rate limiter para operaciones críticas: 5 intentos por minuto
  const rateLimiterOperaciones = useRef(SecurityUtils.createRateLimiter(5, 60000)).current;



  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    cargarDatosIniciales();
  }, []);

  // ✅ RECARGAR cuando cambien skip o limit
  useEffect(() => {
    if (!mostrarFormulario) {
      cargarUsuarios();
    }
  }, [skip, limit]);

  // ==================== FILTRADO ====================
  useEffect(() => {
    filtrarUsuarios();
  }, [usuarios, busqueda, filtroRol]);

  useEffect(() => {
    setTotalUsuarios(usuariosFiltrados.length);
  }, [usuariosFiltrados]);



  const filtrarUsuarios = () => {
    // ✅ Rate limiting para búsquedas: 30 intentos por minuto
    if (!rateLimiterBusqueda.isAllowed('filtrarUsuarios')) {
      SecurityUtils.logSecurityEvent('RATE_LIMIT_FILTRAR_USUARIOS', { 
        action: 'filtrar',
        razon: 'demasiadas_busquedas' 
      });
      Alert.alert('Límite excedido', 'Demasiados intentos de búsqueda. Por favor, intente más tarde.');
      return;
    }

    const lista = Array.isArray(usuarios) ? usuarios : [];
    let resultado = [...lista];

    // ✅ FILTRAR INACTIVOS
    resultado = resultado.filter(u => u.estado?.toLowerCase() !== 'inactivo');

    // Filtrar por búsqueda
    if (busqueda.trim()) {
      // ✅ Detectar intento XSS en búsqueda - con validación más completa
      if (SecurityUtils.detectXssAttempt(busqueda)) {
        SecurityUtils.logSecurityEvent('XSS_ATTEMPT_SEARCH', { 
          busqueda,
          razon: 'xss_pattern_detected'
        });
        Alert.alert('Error de Seguridad', 'Se detectó un intento de inyección maliciosa.');
        return;
      }

      const busquedaLower = SecurityValidator.sanitizeText(busqueda).toLowerCase();

      resultado = resultado.filter(u => {
        // Sanitizar cada campo antes de comparar
        const nombre = SecurityValidator.sanitizeText(u.persona?.nombre || '').toLowerCase();
        const apellido = SecurityValidator.sanitizeText(u.persona?.apellido || '').toLowerCase();
        const username = SecurityValidator.sanitizeText(u.username || '').toLowerCase();
        const email = SecurityValidator.sanitizeText(u.email || '').toLowerCase();
        const cedula = SecurityValidator.sanitizeText(u.persona?.cedula || '');

        return nombre.includes(busquedaLower) ||
          apellido.includes(busquedaLower) ||
          username.includes(busquedaLower) ||
          email.includes(busquedaLower) ||
          cedula.includes(busqueda);
      });
    }

    // Filtrar por rol
    if (filtroRol !== 'todos') {
      const rolIdSeguro = parseInt(filtroRol);
      if (isNaN(rolIdSeguro) || rolIdSeguro <= 0) {
        SecurityUtils.logSecurityEvent('INVALID_FILTER_ROL_ID', { filtroRol });
        return;
      }

      resultado = resultado.filter(u =>
        Array.isArray(u.roles) &&
        u.roles.some(r => r.id_rol === rolIdSeguro)
      );
    }

    setUsuariosFiltrados(resultado);
  };

  // ==================== FUNCIONES DE CARGA ====================
  const cargarDatosIniciales = async () => {
    setLoading(true);
    try {
      await Promise.all([
        cargarUsuarios(),
        cargarRoles()
      ]);
    } catch (error) {
      // 🔐 Manejo de token expirado
      if (error?.isTokenExpired) {
        SecurityUtils.logSecurityEvent('TOKEN_EXPIRED_LOAD_INITIAL_DATA', {});
        console.log('🔒 Token expirado - SessionContext manejará');
        setLoading(false);
        return;
      }

      console.error('Error cargando datos:', error);
      SecurityUtils.logSecurityEvent('ERROR_LOAD_INITIAL_DATA', {
        error: error.message,
        stack: error.stack
      });
      Alert.alert('Error', 'No se pudieron cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const cargarUsuarios = async () => {
    try {
      // ✅ Rate limiting para carga de usuarios
      if (!rateLimiterOperaciones.isAllowed('cargarUsuarios')) {
        SecurityUtils.logSecurityEvent('RATE_LIMIT_CARGAR_USUARIOS', { 
          action: 'cargarUsuarios',
          razon: 'demasiadas_solicitudes' 
        });
        Alert.alert('Error de Seguridad', 'Demasiadas solicitudes. Por favor, intente más tarde.');
        return;
      }

      // 🔐 Validar parámetros de paginación
      const skipSeguro = Math.max(0, parseInt(skip) || 0);
      const limitSeguro = Math.max(1, Math.min(200, parseInt(limit) || 50));

      if (skipSeguro < 0 || limitSeguro < 1 || limitSeguro > 200) {
        SecurityUtils.logSecurityEvent('INVALID_PAGINATION_PARAMS', { skip: skipSeguro, limit: limitSeguro });
        throw new Error('Parámetros de paginación inválidos');
      }

      const response = await usuarioService.listarCompleto({
        skip: skipSeguro,
        limit: limitSeguro
      });

      // 🔐 Validar estructura de respuesta del backend
      if (!response || !Array.isArray(response.usuarios)) {
        SecurityUtils.logSecurityEvent('INVALID_BACKEND_RESPONSE_USUARIOS', { response });
        throw new Error('Respuesta del servidor inválida');
      }

      const listaUsuarios = Array.isArray(response.usuarios) ? response.usuarios : [];

      // ✅ Validar datos de usuarios antes de mostrar (XSS prevention)
      const usuariosFiltrados = listaUsuarios.filter(usuario => {
        // Validar estructura básica del usuario
        if (!SecurityUtils.validateUserObject(usuario)) {
          SecurityUtils.logSecurityEvent('INVALID_USER_OBJECT', { 
            id_usuario: usuario?.id_usuario,
            razon: 'estructura_invalida'
          });
          return false;
        }

        // Detectar intentos XSS en username
        if (SecurityUtils.detectXssAttempt(usuario.username)) {
          SecurityUtils.logSecurityEvent('XSS_ATTEMPT_USERNAME', { 
            id_usuario: usuario.id_usuario,
            username: usuario.username 
          });
          return false;
        }

        // Detectar intentos XSS en email
        if (SecurityUtils.detectXssAttempt(usuario.email)) {
          SecurityUtils.logSecurityEvent('XSS_ATTEMPT_EMAIL', { 
            id_usuario: usuario.id_usuario,
            email: usuario.email 
          });
          return false;
        }

        const rolesUsuario = usuario.roles || [];

        // Si no tiene roles, no mostrarlo
        if (rolesUsuario.length === 0) return false;

        // Verificar que NINGUNO de sus roles sea de admin/superadmin
        const tieneRolProhibido = rolesUsuario.some(rol => {
          const nombreRolLower = (rol.nombre_rol || '').toLowerCase();
          const nivel = rol.nivel_jerarquia || rol.nivel_acceso || 999;

          return nivel < 3 ||
            nombreRolLower.includes('super') ||
            nombreRolLower.includes('administrador') ||
            nombreRolLower.includes('admin');
        });

        return !tieneRolProhibido;
      });

      setUsuarios(usuariosFiltrados);
      setTotalUsuarios(usuariosFiltrados.length);
    } catch (error) {
      // 🔐 Manejo de token expirado
      if (error?.isTokenExpired) {
        SecurityUtils.logSecurityEvent('TOKEN_EXPIRED_CARGAR_USUARIOS', {});
        console.log('🔒 Token expirado - SessionContext manejará');
        return;
      }

      console.error('❌ Error cargando usuarios:', error);
      SecurityUtils.logSecurityEvent('ERROR_CARGAR_USUARIOS', {
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
  };

  const cargarRoles = async () => {
    try {
      const response = await rolService.listarRoles({
        skip: 0,
        limit: 100,
        solo_activos: true
      });

      // 🔐 Validar respuesta del backend
      if (!response) {
        SecurityUtils.logSecurityEvent('INVALID_BACKEND_RESPONSE_ROLES', { response });
        throw new Error('Respuesta del servidor inválida');
      }

      let listaRoles = [];
      if (Array.isArray(response)) {
        listaRoles = response;
      } else if (response && Array.isArray(response.data)) {
        listaRoles = response.data;
      } else {
        throw new Error('Formato de respuesta de roles inválido');
      }

      // ✅ FILTRAR: Solo mostrar roles de Funcionario (nivel >= 3)
      const rolesValidos = listaRoles.filter(rol => {
        if (!rol || typeof rol.id_rol !== 'number' || rol.id_rol <= 0) return false;

        const nombreRolLower = (rol.nombre_rol || '').toLowerCase();
        const nivel = rol.nivel_jerarquia || rol.nivel_acceso || 999;

        // ✅ Solo permitir roles con nivel >= 3 Y que NO sean admin/superadmin
        return nivel >= 3 &&
          !nombreRolLower.includes('super') &&
          !nombreRolLower.includes('administrador') &&
          !nombreRolLower.includes('admin');
      });

      setRoles(rolesValidos);
    } catch (error) {
      // 🔐 Manejo de token expirado
      if (error?.isTokenExpired) {
        SecurityUtils.logSecurityEvent('TOKEN_EXPIRED_CARGAR_ROLES', {});
        console.log('🔒 Token expirado - SessionContext manejará');
        return;
      }

      console.error('Error cargando roles:', error);
      SecurityUtils.logSecurityEvent('ERROR_CARGAR_ROLES', {
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
  };

  // ==================== FUNCIONES DE NAVEGACIÓN ====================
  const abrirFormularioNuevo = () => {
    setUsuarioSeleccionado(null);
    setMostrarFormulario(true);
  };

  const abrirFormularioEditar = (usuario) => {
    setUsuarioSeleccionado(usuario);
    setMostrarFormulario(true);
  };

  const cerrarFormulario = () => {
    setMostrarFormulario(false);
    setUsuarioSeleccionado(null);
  };

  // ==================== FUNCIONES DE ACCIONES ====================
  const handleGuardado = async (exito) => {
    if (exito) {
      // ✅ PRIMERO CERRAR EL FORMULARIO
      cerrarFormulario();

      // ✅ LUEGO RECARGAR USUARIOS
      setLoading(true);
      try {
        await cargarUsuarios();

        Alert.alert(
          'Éxito',
          usuarioSeleccionado
            ? 'Usuario actualizado correctamente'
            : 'Usuario creado correctamente'
        );
      } catch (error) {
        console.error('Error recargando usuarios:', error);
      } finally {
        setLoading(false);
      }
    } else {
      // Si falló, solo cerrar
      cerrarFormulario();
    }
  };

  const confirmarEliminar = async (usuario) => {
    console.log('🔵 [confirmarEliminar] INICIADO');
    console.log('🔵 Usuario recibido:', usuario);

    if (!usuario || !usuario.id_usuario) {
      console.log('❌ Usuario inválido, mostrando notificación');
      setModalNotification({
        visible: true,
        message: 'Error: Usuario inválido',
        type: 'error'
      });
      return;
    }

    // ✅ VALIDAR QUE NO SE ELIMINE A SÍ MISMO
    try {
      const miIdUsuario = await getUserIdFromToken();

      if (usuario.id_usuario === miIdUsuario) {
        console.log('❌ Intento de auto-eliminación bloqueado');
        setModalNotification({
          visible: true,
          message: '❌ No puedes eliminarte a ti mismo',
          type: 'error'
        });
        return;
      }
    } catch (error) {
      console.error('Error obteniendo ID del usuario actual:', error);
    }

    // ✅ NUEVA VALIDACIÓN: Verificar si tiene departamento asignado
    if (usuario.departamento || usuario.id_departamento) {
      const nombreDept = usuario.departamento?.nombre || 'un departamento';

      console.log('❌ Usuario tiene departamento asignado:', nombreDept);

      // ✅ Mostrar modal bonito en lugar de notificación simple
      setModalDepartamentoAsignado({
        visible: true,
        usuario: usuario,
        departamento: nombreDept
      });
      return;
    }

    const usernameSeguro = SecurityValidator.sanitizeText(usuario.username || 'este usuario');

    console.log('✅ Mostrando modal de confirmación');

    setModalConfirm({
      visible: true,
      title: 'Confirmar Eliminación',
      message: `¿Estás seguro de eliminar al usuario ${usernameSeguro}?\n\nEste usuario será marcado como inactivo.`,
      onConfirm: () => {
        console.log('🔵 onConfirm ejecutado');
        setModalConfirm({ ...modalConfirm, visible: false });
        eliminarUsuario(usuario.id_usuario);
      },
      type: 'danger'
    });
  };

  const eliminarUsuario = async (id_usuario) => {
    console.log('🔍 [eliminarUsuario] Iniciando eliminación...');
    console.log('🔍 [eliminarUsuario] ID recibido:', id_usuario);

    // ✅ Validar ID con SecurityUtils
    if (!SecurityUtils.validateId(id_usuario)) {
      console.error('❌ ID inválido:', id_usuario);
      SecurityUtils.logSecurityEvent('INVALID_DELETE_ID', { 
        id_usuario,
        razon: 'id_no_numerico_o_negativo'
      });
      Alert.alert('Error de Seguridad', 'ID de usuario inválido');
      return;
    }

    const idSeguro = parseInt(id_usuario);
    console.log('🔍 [eliminarUsuario] ID parseado:', idSeguro);

    console.log('✅ [eliminarUsuario] ID validado, llamando al servicio...');
    setLoading(true);

    try {
      // ✅ Rate limiting para operaciones: máx 5 eliminaciones por minuto
      if (!rateLimiterOperaciones.isAllowed(`delete_${idSeguro}`)) {
        SecurityUtils.logSecurityEvent('RATE_LIMIT_DELETE_USER', { 
          id_usuario: idSeguro,
          razon: 'demasiados_intentos_eliminacion'
        });
        Alert.alert('Error de Seguridad', 'Demasiados intentos de eliminación. Por favor, intente más tarde.');
        setLoading(false);
        return;
      }

      // 🔐 Validar que el usuario existe en la lista antes de eliminarlo
      const usuarioAEliminar = usuarios.find(u => u.id_usuario === idSeguro);
      if (!usuarioAEliminar || !SecurityUtils.validateUserObject(usuarioAEliminar)) {
        SecurityUtils.logSecurityEvent('INVALID_USER_DELETE_ATTEMPT', { 
          id_usuario: idSeguro,
          razon: 'usuario_no_encontrado_o_invalido'
        });
        Alert.alert('Error', 'El usuario no existe o es inválido');
        setLoading(false);
        return;
      }

      console.log('📤 [eliminarUsuario] Llamando a usuarioService.delete...');
      const response = await usuarioService.delete(idSeguro);

      console.log('✅ [eliminarUsuario] Respuesta del servicio:', response);

      // ✅ Log de seguridad: Usuario eliminado exitosamente
      SecurityUtils.logSecurityEvent('USER_DELETED', { 
        id_usuario: idSeguro,
        username: usuarioAEliminar.username
      });

      // Actualizar el estado local para que aparezca como inactivo
      console.log('🔄 [eliminarUsuario] Actualizando estado local...');
      setUsuarios(prevUsuarios => {
        const nuevosUsuarios = prevUsuarios.map(u => {
          if (u.id_usuario === idSeguro) {
            console.log('🔄 Usuario encontrado, cambiando estado a inactivo:', u.username);
            return {
              ...u,
              estado: 'inactivo',
              persona: u.persona ? { ...u.persona, estado: 'inactivo' } : null
            };
          }
          return u;
        });
        console.log('✅ [eliminarUsuario] Estado local actualizado');
        return nuevosUsuarios;
      });

      setModalNotification({
        visible: true,
        message: 'Usuario eliminado correctamente',
        type: 'success'
      });
      console.log('✅ [eliminarUsuario] Proceso completado');

    } catch (error) {
      // 🔐 Manejo de token expirado
      if (error?.isTokenExpired) {
        SecurityUtils.logSecurityEvent('TOKEN_EXPIRED_DELETE_USER', { id_usuario: idSeguro });
        console.log('🔒 Token expirado - SessionContext manejará');
        setLoading(false);
        return;
      }

      console.error('❌ [eliminarUsuario] ERROR COMPLETO:', error);
      console.error('❌ [eliminarUsuario] Error.message:', error.message);
      console.error('❌ [eliminarUsuario] Error.data:', error.data);

      SecurityUtils.logSecurityEvent('ERROR_DELETE_USER', {
        id_usuario: idSeguro,
        error: error.message,
        stack: error.stack
      });

      const mensajeError = SecurityValidator.sanitizeText(
        error.message || 'No se pudo eliminar el usuario'
      );
      setModalNotification({
        visible: true,
        message: mensajeError,
        type: 'error'
      });
    } finally {
      console.log('🏁 [eliminarUsuario] Finally - Quitando loading');
      setLoading(false);
    }
  };

  const confirmarReactivar = (usuario) => {
    if (!usuario || !usuario.id_usuario) {
      setModalNotification({
        visible: true,
        message: 'Error: Usuario inválido',
        type: 'error'
      });
      return;
    }

    const usernameSeguro = SecurityValidator.sanitizeText(usuario.username || 'este usuario');

    setModalConfirm({
      visible: true,
      title: 'Confirmar Reactivación',
      message: `¿Estás seguro de reactivar al usuario ${usernameSeguro}?`,
      onConfirm: () => {
        setModalConfirm({ ...modalConfirm, visible: false });
        reactivarUsuario(usuario.id_usuario);
      },
      type: 'success'
    });
  };

  const reactivarUsuario = async (id_usuario) => {
    // ✅ Validar ID con SecurityUtils
    if (!SecurityUtils.validateId(id_usuario)) {
      SecurityUtils.logSecurityEvent('INVALID_REACTIVATE_ID', { 
        id_usuario,
        razon: 'id_no_numerico_o_negativo'
      });
      Alert.alert('Error de Seguridad', 'ID de usuario inválido');
      return;
    }

    const idSeguro = parseInt(id_usuario);

    setLoading(true);
    try {
      // ✅ Rate limiting para operaciones: máx 5 reactivaciones por minuto
      if (!rateLimiterOperaciones.isAllowed(`reactivate_${idSeguro}`)) {
        SecurityUtils.logSecurityEvent('RATE_LIMIT_REACTIVATE_USER', { 
          id_usuario: idSeguro,
          razon: 'demasiados_intentos_reactivacion'
        });
        Alert.alert('Error de Seguridad', 'Demasiados intentos de reactivación. Por favor, intente más tarde.');
        setLoading(false);
        return;
      }

      // 🔐 Validar que el usuario existe en la lista antes de reactivarlo
      const usuarioAReactivar = usuarios.find(u => u.id_usuario === idSeguro);
      if (!usuarioAReactivar || !SecurityUtils.validateUserObject(usuarioAReactivar)) {
        SecurityUtils.logSecurityEvent('INVALID_USER_REACTIVATE_ATTEMPT', { 
          id_usuario: idSeguro,
          razon: 'usuario_no_encontrado_o_invalido'
        });
        Alert.alert('Error', 'El usuario no existe o es inválido');
        setLoading(false);
        return;
      }

      const response = await usuarioService.reactivar(idSeguro);

      console.log('✅ Usuario reactivado:', response);

      // ✅ Log de seguridad: Usuario reactivado exitosamente
      SecurityUtils.logSecurityEvent('USER_REACTIVATED', { 
        id_usuario: idSeguro,
        username: usuarioAReactivar.username
      });

      // Actualizar el estado local para que aparezca como activo
      setUsuarios(prevUsuarios =>
        prevUsuarios.map(u =>
          u.id_usuario === idSeguro
            ? {
              ...u,
              estado: 'activo',
              persona: u.persona ? { ...u.persona, estado: 'activo' } : null
            }
            : u
        )
      );

      setModalNotification({
        visible: true,
        message: 'Usuario reactivado correctamente',
        type: 'success'
      });
    } catch (error) {
      // 🔐 Manejo de token expirado
      if (error?.isTokenExpired) {
        SecurityUtils.logSecurityEvent('TOKEN_EXPIRED_REACTIVATE_USER', { id_usuario: idSeguro });
        console.log('🔒 Token expirado - SessionContext manejará');
        setLoading(false);
        return;
      }

      console.error('❌ Error reactivando usuario:', error);
      
      SecurityUtils.logSecurityEvent('ERROR_REACTIVATE_USER', {
        id_usuario: idSeguro,
        error: error.message,
        stack: error.stack
      });

      const mensajeError = SecurityValidator.sanitizeText(
        error.message || 'No se pudo reactivar el usuario'
      );
      setModalNotification({
        visible: true,
        message: mensajeError,
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };


  // ✅ CONTAR USUARIOS POR ROL (solo activos, sin aplicar filtros de búsqueda/rol)
  const contarPorRol = (idRol) => {
    const lista = Array.isArray(usuarios)
      ? usuarios.filter(u => u.estado?.toLowerCase() !== 'inactivo')
      : [];

    if (idRol === 'todos') return lista.length;

    // Validar que idRol sea un número válido
    const rolIdSeguro = parseInt(idRol);
    if (isNaN(rolIdSeguro)) return 0;

    return lista.filter(u =>
      Array.isArray(u.roles) &&
      u.roles.some(r => r.id_rol === rolIdSeguro)
    ).length;
  };

  // ✅ PAGINACIÓN
  const totalPaginas = Math.ceil(totalUsuarios / limit);

  const cambiarPagina = (nuevaPagina) => {
    // Validar que sea un número positivo
    const paginaSegura = parseInt(nuevaPagina);
    if (isNaN(paginaSegura) || paginaSegura < 1 || paginaSegura > totalPaginas) {
      return;
    }

    setPaginaActual(paginaSegura);
    setSkip((paginaSegura - 1) * limit);
  };

  const cambiarLimit = (nuevoLimit) => {
    // Validar rango (mínimo 10, máximo 200)
    const limitSeguro = parseInt(nuevoLimit);
    if (isNaN(limitSeguro) || limitSeguro < 10 || limitSeguro > 200) {
      Alert.alert('Error', 'El límite debe estar entre 10 y 200');
      return;
    }

    setLimit(limitSeguro);
    setSkip(0);
    setPaginaActual(1);
  };

  // ==================== RENDER ====================
  return (
    <View style={contentStyles.wrapper}>

      {/* ============ SIDEBAR WEB ============ */}
      {isWeb && (
        <AdminSidebar
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
          onNavigate={() => setSidebarOpen(false)}
        />
      )}

      {/* ============ BOTÓN TOGGLE SIDEBAR ============ */}
      <TouchableOpacity
        style={{
          position: 'absolute',
          top: Platform.OS === 'ios' ? 50 : 40,  // ← NUEVA LÍNEA
          left: sidebarOpen ? 296 : 16,
          zIndex: 1001,
          backgroundColor: '#1e1b4b',
          padding: 12,
          borderRadius: 12,
          shadowColor: '#667eea',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.4,
          shadowRadius: 8,
          elevation: 8,
        }}
        onPress={() => setSidebarOpen(!sidebarOpen)}
      >
        <Ionicons name={sidebarOpen ? "close" : "menu"} size={24} color="#ffffff" />
      </TouchableOpacity>

      {/* ============ CONTENIDO PRINCIPAL ============ */}
      <View style={[
        contentStyles.mainContent,
        sidebarOpen && contentStyles.mainContentWithSidebar
      ]}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#667eea" />
            <Text style={styles.loadingText}>Cargando usuarios...</Text>
          </View>
        ) : mostrarFormulario ? (
          <GestionUsuariosCard
            usuario={usuarioSeleccionado}
            roles={roles}
            onCerrar={cerrarFormulario}
            onGuardado={handleGuardado}
          />
        ) : (
          <ScrollView
            style={styles.container}
            showsVerticalScrollIndicator={false}
          >
            {/* Header con gradiente */}
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.header}
            >
              <View style={styles.headerContent}>
                <View style={styles.headerTop}>
                  <View style={styles.headerTitleContainer}>
                    <Users size={32} color="#FFFFFF" />
                    <View>
                      <Text style={styles.headerTitle}>Gestión de Usuarios</Text>
                      <Text style={styles.headerSubtitle}>
                        {usuariosFiltrados.length} usuarios activos
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.btnAdd}
                    onPress={abrirFormularioNuevo}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="add" size={32} color="#667eea" />
                  </TouchableOpacity>
                </View>



                {/* Barra de búsqueda */}
                <View style={styles.searchContainer}>
                  <Search size={20} color="#9CA3AF" style={styles.searchIcon} />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Buscar por nombre, usuario, email o cédula"
                    placeholderTextColor="#9CA3AF"
                    value={busqueda}
                    onChangeText={(text) => {
                      // Sanitizar y truncar a 100 caracteres
                      const busquedaLimpia = SecurityValidator.truncateText(
                        SecurityValidator.sanitizeText(text),
                        100
                      );
                      setBusqueda(busquedaLimpia);
                    }}
                    maxLength={100}
                  />
                  {busqueda.length > 0 && (
                    <TouchableOpacity onPress={() => setBusqueda('')}>
                      <Ionicons name="close-circle" size={20} color="#9CA3AF" />
                    </TouchableOpacity>
                  )}
                </View>

                {/* ✅ FILTROS DE ROL DINÁMICOS */}
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.filtersContainer}
                >
                  <TouchableOpacity
                    style={[
                      styles.filterChip,
                      filtroRol === 'todos' && styles.filterChipActive
                    ]}
                    onPress={() => setFiltroRol('todos')}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.filterChipText,
                      filtroRol === 'todos' && styles.filterChipTextActive
                    ]}>
                      Todos ({contarPorRol('todos')})
                    </Text>
                  </TouchableOpacity>



                  {roles.map(rol => (
                    <TouchableOpacity
                      key={rol.id_rol}
                      style={[
                        styles.filterChip,
                        filtroRol === String(rol.id_rol) && styles.filterChipActive
                      ]}
                      onPress={() => setFiltroRol(String(rol.id_rol))}
                      activeOpacity={0.7}
                    >
                      <Text style={[
                        styles.filterChipText,
                        filtroRol === String(rol.id_rol) && styles.filterChipTextActive
                      ]}>
                        {SecurityValidator.sanitizeText(rol.nombre_rol || 'Sin nombre')} ({contarPorRol(rol.id_rol)})
                      </Text>
                    </TouchableOpacity>
                  ))}


                </ScrollView>
              </View>
            </LinearGradient>

            {/* Lista de usuarios */}
            <ScrollView
              style={styles.listaContainer}
              showsVerticalScrollIndicator={false}
            >
              {usuariosFiltrados.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Users size={60} color="#9CA3AF" />
                  <Text style={styles.emptyText}>
                    {busqueda || filtroRol !== 'todos'
                      ? 'No se encontraron usuarios'
                      : 'No hay usuarios registrados'}
                  </Text>
                </View>
              ) : (
                usuariosFiltrados.map((usuario, index) => (
                  <UsuarioCard
                    key={usuario.id_usuario}
                    usuario={usuario}
                    onEditar={() => abrirFormularioEditar(usuario)}
                    onEliminar={() => confirmarEliminar(usuario)}
                    onReactivar={() => confirmarReactivar(usuario)}
                    index={index}
                  />
                ))
              )}

              {/* ✅ PAGINACIÓN */}
              {totalPaginas > 1 && (
                <View style={styles.paginationContainer}>
                  <TouchableOpacity
                    style={[styles.paginationBtn, paginaActual === 1 && styles.paginationBtnDisabled]}
                    onPress={() => cambiarPagina(paginaActual - 1)}
                    disabled={paginaActual === 1}
                  >
                    <Ionicons name="chevron-back" size={20} color={paginaActual === 1 ? '#9CA3AF' : '#667eea'} />
                  </TouchableOpacity>

                  <Text style={styles.paginationText}>
                    Página {paginaActual} de {totalPaginas}
                  </Text>

                  <TouchableOpacity
                    style={[styles.paginationBtn, paginaActual === totalPaginas && styles.paginationBtnDisabled]}
                    onPress={() => cambiarPagina(paginaActual + 1)}
                    disabled={paginaActual === totalPaginas}
                  >
                    <Ionicons name="chevron-forward" size={20} color={paginaActual === totalPaginas ? '#9CA3AF' : '#667eea'} />
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
          </ScrollView>
        )}
      </View>

      {/* Modales */}
      <ConfirmModal
        visible={modalConfirm.visible}
        title={modalConfirm.title}
        message={modalConfirm.message}
        onConfirm={modalConfirm.onConfirm}
        onCancel={() => setModalConfirm({ ...modalConfirm, visible: false })}
        confirmText={modalConfirm.type === 'success' ? 'Reactivar' : 'Eliminar'}
        cancelText="Cancelar"
        type={modalConfirm.type}
      />

      <NotificationModal
        visible={modalNotification.visible}
        message={modalNotification.message}
        type={modalNotification.type}
        onClose={() => setModalNotification({ ...modalNotification, visible: false })}
      />

      {/*Modal para departamento asignado */}
      <DepartamentoAsignadoModal
        visible={modalDepartamentoAsignado.visible}
        usuario={modalDepartamentoAsignado.usuario}
        departamento={modalDepartamentoAsignado.departamento}
        onClose={() => setModalDepartamentoAsignado({ visible: false, usuario: null, departamento: null })}
      />

      {/* ============ SIDEBAR MÓVIL ============ */}
      {!isWeb && sidebarOpen && (
        <>
          {/* Overlay oscuro */}
          <TouchableOpacity
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 998,
            }}
            onPress={() => setSidebarOpen(false)}
            activeOpacity={1}
          />

          {/* Sidebar deslizante */}
          <View style={{
            position: 'absolute',
            top: Platform.OS === 'ios' ? 50 : 40,  // ← SOLO ESTE CAMBIO
            left: 0,
            bottom: 0,
            width: '80%',
            maxWidth: 320,
            zIndex: 999,
          }}>
            <AdminSidebar
              isOpen={sidebarOpen}
              onNavigate={() => setSidebarOpen(false)}
            />
          </View>
        </>
      )}
    </View>
  );
};

// ==================== MODALES CUSTOM ====================
const ConfirmModal = ({ visible, title, message, onConfirm, onCancel, confirmText = 'Confirmar', cancelText = 'Cancelar', type = 'danger' }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }).start();
    } else {
      scaleAnim.setValue(0);
    }
  }, [visible]);

  const getColors = () => {
    if (type === 'danger') {
      return {
        icon: 'warning',
        iconColor: '#ef4444',
        confirmBg: '#ef4444',
      };
    }
    return {
      icon: 'checkmark-circle',
      iconColor: '#10b981',
      confirmBg: '#10b981',
    };
  };

  const colors = getColors();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={modalStyles.overlay}>
        <Animated.View style={[modalStyles.modalContainer, { transform: [{ scale: scaleAnim }] }]}>
          <View style={[modalStyles.iconContainer, { backgroundColor: `${colors.iconColor}20` }]}>
            <Ionicons name={colors.icon} size={48} color={colors.iconColor} />
          </View>

          <Text style={modalStyles.title}>{title}</Text>
          <Text style={modalStyles.message}>{message}</Text>

          <View style={modalStyles.buttonContainer}>
            <TouchableOpacity style={modalStyles.btnCancel} onPress={onCancel} activeOpacity={0.8}>
              <Text style={modalStyles.btnCancelText}>{cancelText}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[modalStyles.btnConfirm, { backgroundColor: colors.confirmBg }]}
              onPress={onConfirm}
              activeOpacity={0.8}
            >
              <Text style={modalStyles.btnConfirmText}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const NotificationModal = ({ visible, message, type = 'success', onClose }) => {
  const slideAnim = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }).start();

      const timer = setTimeout(() => {
        Animated.timing(slideAnim, {
          toValue: -100,
          duration: 300,
          useNativeDriver: true,
        }).start(() => onClose());
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  const getConfig = () => {
    if (type === 'error') {
      return {
        icon: 'close-circle',
        iconColor: '#ef4444',
        bgColor: '#fef2f2',
        borderColor: '#ef4444',
      };
    }
    return {
      icon: 'checkmark-circle',
      iconColor: '#10b981',
      bgColor: '#f0fdf4',
      borderColor: '#10b981',
    };
  };

  const config = getConfig();

  if (!visible) return null;

  return (
    <View style={modalStyles.notificationOverlay}>
      <Animated.View
        style={[
          modalStyles.notificationContainer,
          {
            backgroundColor: config.bgColor,
            borderColor: config.borderColor,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <Ionicons name={config.icon} size={32} color={config.iconColor} />
        <Text style={modalStyles.notificationMessage}>{message}</Text>
        <TouchableOpacity onPress={onClose} style={modalStyles.closeBtn}>
          <Ionicons name="close" size={20} color="#6b7280" />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const DepartamentoAsignadoModal = ({ visible, usuario, departamento, onClose }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }).start();
    } else {
      scaleAnim.setValue(0);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={modalStyles.overlay}>
        <Animated.View style={[modalStyles.modalContainer, { transform: [{ scale: scaleAnim }] }]}>

          {/* Icono de advertencia */}
          <View style={[modalStyles.iconContainer, { backgroundColor: 'rgba(251, 146, 60, 0.2)' }]}>
            <Ionicons name="business" size={48} color="#fb923c" />
          </View>

          {/* Título */}
          <Text style={modalStyles.title}>No se puede eliminar</Text>

          {/* Mensaje principal */}
          <Text style={[modalStyles.message, { marginBottom: 16 }]}>
            El usuario <Text style={{ fontWeight: '700', color: '#1f2937' }}>
              {usuario?.persona?.nombre} {usuario?.persona?.apellido}
            </Text> está asignado al departamento:
          </Text>

          {/* Card del departamento */}
          <View style={{
            width: '100%',
            backgroundColor: 'rgba(102, 126, 234, 0.1)',
            borderRadius: 12,
            padding: 16,
            borderLeftWidth: 4,
            borderLeftColor: '#667eea',
            marginBottom: 20,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
          }}>
            <View style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: 'rgba(102, 126, 234, 0.2)',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              <Ionicons name="business" size={24} color="#667eea" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{
                fontSize: 16,
                fontWeight: '700',
                color: '#1f2937',
                marginBottom: 4,
              }}>
                {departamento}
              </Text>
              <Text style={{
                fontSize: 13,
                color: '#6b7280',
              }}>
                Departamento asignado
              </Text>
            </View>
          </View>

          {/* Instrucciones */}
          <View style={{
            width: '100%',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            borderRadius: 12,
            padding: 16,
            borderLeftWidth: 4,
            borderLeftColor: '#3b82f6',
            marginBottom: 20,
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
              <Ionicons name="information-circle" size={20} color="#3b82f6" style={{ marginTop: 2 }} />
              <View style={{ flex: 1 }}>
                <Text style={{
                  fontSize: 14,
                  fontWeight: '600',
                  color: '#3b82f6',
                  marginBottom: 8,
                }}>
                  📋 Pasos para eliminar este usuario:
                </Text>
                <View style={{ gap: 8 }}>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <Text style={{ color: '#3b82f6', fontWeight: '700', fontSize: 13 }}>1.</Text>
                    <Text style={{
                      color: '#1f2937',
                      fontSize: 13,
                      flex: 1,
                      lineHeight: 18,
                    }}>
                      Ve a <Text style={{ fontWeight: '700' }}>Gestión de Asignaciones</Text>
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <Text style={{ color: '#3b82f6', fontWeight: '700', fontSize: 13 }}>2.</Text>
                    <Text style={{
                      color: '#1f2937',
                      fontSize: 13,
                      flex: 1,
                      lineHeight: 18,
                    }}>
                      Remueve al usuario del departamento o reasígnalo a otro
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <Text style={{ color: '#3b82f6', fontWeight: '700', fontSize: 13 }}>3.</Text>
                    <Text style={{
                      color: '#1f2937',
                      fontSize: 13,
                      flex: 1,
                      lineHeight: 18,
                    }}>
                      Regresa aquí y podrás eliminar el usuario
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Botón de cerrar */}
          <TouchableOpacity
            style={[modalStyles.btnConfirm, {
              backgroundColor: '#667eea',
              width: '100%',
              paddingVertical: 14,
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
            }]}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Ionicons name="checkmark-circle" size={20} color="#ffffff" style={{ marginRight: 8 }} />
            <Text style={modalStyles.btnConfirmText}>Entendido</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

// Estilos para los modales
const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  btnCancel: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  btnCancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6b7280',
  },
  btnConfirm: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  btnConfirmText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
  },
  notificationOverlay: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 40,  // ← NUEVA LÍNEA
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingTop: 60,
    zIndex: 9999,
    pointerEvents: 'box-none',
  },
  notificationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    maxWidth: 400,
    minWidth: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
    gap: 12,
  },
  notificationMessage: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
  },
  closeBtn: {
    padding: 4,
  },
});

export default GestionUsuarioPage;
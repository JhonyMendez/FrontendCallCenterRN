import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { agenteService } from '../../api/services/agenteService';
import { departamentoService } from '../../api/services/departamentoService';
import { usuarioAgenteService } from '../../api/services/usuarioAgenteService';
import { usuarioService } from '../../api/services/usuarioService';
import PermisosModal from '../../components/Modals/PermisosModal';
import AdminSidebar from '../../components/Sidebar/sidebarAdmin';
import {
  DepartamentoCard,
  InfoCard,
  ResumenCard,
  UsuarioCard,
  UsuarioDetalleModal
} from '../../components/SuperAdministrador/GestionAsignacionUsCard';
import { styles } from '../../styles/GestionAsignacionUsStyles';
const isWeb = Platform.OS === 'web';

// ============ FUNCIONES DE SEGURIDAD ============
const SecurityUtils = {
  // 1️⃣ Sanitizar input contra XSS
  sanitizeInput(text) {
    if (!text) return '';
    return text
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
      .replace(/<img[^>]*onerror[^>]*>/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .replace(/<[^>]*>/g, '')
      .trim();
  },

  // 2️⃣ Validar email
  isValidEmail(email) {
    if (!email) return true;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // 3️⃣ Validar URL
  isValidUrl(url) {
    if (!url) return true;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },

  // 4️⃣ Validar rango de números
  validateNumberRange(value, min, max) {
    const num = parseInt(value, 10);
    return !isNaN(num) && num >= min && num <= max;
  },

  // 5️⃣ Sanitizar input contra SQL Injection
  sanitizeSqlInput(text) {
    if (!text) return '';
    return text
      .replace(/['"];?/g, '')
      .replace(/--/g, '')
      .replace(/\/\*/g, '')
      .replace(/\*\//g, '')
      .replace(/;/g, '')
      .trim();
  },

  // 6️⃣ Crear limitador de velocidad (Rate Limiter)
  createRateLimiter(maxAttempts, windowMs) {
    const attempts = {};

    return {
      isAllowed(key) {
        const now = Date.now();
        if (!attempts[key]) {
          attempts[key] = [];
        }

        // Limpiar intentos antiguos
        attempts[key] = attempts[key].filter(time => now - time < windowMs);

        // Verificar si se alcanzó el límite
        if (attempts[key].length >= maxAttempts) {
          this.logSecurityEvent('RATE_LIMIT_EXCEEDED', { key, attempts: attempts[key].length });
          return false;
        }

        attempts[key].push(now);
        return true;
      },

      logSecurityEvent(eventType, details) {
        console.warn(`🔒 SECURITY: ${eventType}`, details, new Date().toISOString());
      },

      reset(key) {
        delete attempts[key];
      },
    };
  },

  // 7️⃣ Log de eventos de seguridad
  logSecurityEvent(eventType, details) {
    const timestamp = new Date().toISOString();
    const logMessage = {
      timestamp,
      eventType,
      details,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A',
    };
    console.warn('🔒 SECURITY EVENT:', logMessage);

    // Aquí podrías enviar a un servidor de logging
    try {
      // Opcional: enviar eventos críticos al backend
      if (['UNAUTHORIZED_ACCESS', 'SQL_INJECTION_ATTEMPT', 'XSS_ATTEMPT'].includes(eventType)) {
        // await loggingService.logSecurityEvent(logMessage);
      }
    } catch (err) {
      console.error('Error logging security event:', err);
    }
  },

  // 8️⃣ Validar longitud de string
  validateStringLength(str, maxLength) {
    if (!str) return true;
    return str.length <= maxLength;
  },

  // 9️⃣ Validar contraseña fuerte (si aplica)
  isStrongPassword(password) {
    if (!password || password.length < 8) return false;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*]/.test(password);
    return hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar;
  },

  // 🔟 Detectar inyección SQL (solo patrones específicos y peligrosos)
  detectSqlInjection(text) {
    if (!text) return false;
    // Solo detectar palabras clave SQL REALES (no guiones normales)
    const sqlPatterns = [
      /\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|UNION|WHERE|FROM|BY)\b/i,
      /\/\*[\s\S]*?\*\//,  // Comentarios SQL /* */
      /;\s*(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE)/i, // ; seguido de SQL
      /(['"])\s*(OR|AND)\s*(['"]?1['"]?|true)\s*=/i, // ' OR '1'='1' pattern
    ];
    return sqlPatterns.some(pattern => pattern.test(text));
  },

  // 1️⃣1️⃣ Detectar intentos de XSS
  detectXssAttempt(text) {
    if (!text) return false;
    const xssPatterns = [
      /<script[^>]*>.*?<\/script>/gi,
      /on\w+\s*=/gi,
      /<iframe/gi,
      /javascript:/gi,
      /eval\(/gi,
    ];
    return xssPatterns.some(pattern => pattern.test(text));
  },

  // 1️⃣2️⃣ Validar ID numérico
  validateId(id) {
    const numId = Number(id);
    return !isNaN(numId) && numId > 0 && Number.isInteger(numId) ? numId : null;
  },

  // 1️⃣3️⃣ Validar usuario
  validarUsuario(usuario) {
    if (!usuario || typeof usuario !== 'object') return false;
    return (
      this.validateId(usuario.id_usuario) !== null &&
      usuario.persona &&
      typeof usuario.persona === 'object' &&
      usuario.persona.nombre &&
      usuario.persona.apellido
    );
  },

  // 1️⃣4️⃣ Validar departamento
  validarDepartamento(depto) {
    if (!depto || typeof depto !== 'object') return false;
    return (
      this.validateId(depto.id_departamento) !== null &&
      depto.nombre &&
      typeof depto.nombre === 'string'
    );
  },
};

// Función de sanitización de texto (wrapper)
const sanitizeInput = (input) => {
  return SecurityUtils.sanitizeInput(input).substring(0, 100);
};

// Validación de IDs numéricos (wrapper)
const validateNumericId = (id) => {
  return SecurityUtils.validateId(id);
};

// Validación de arrays de IDs
const validateIdArray = (ids) => {
  if (!Array.isArray(ids)) return [];
  return ids.filter(id => SecurityUtils.validateId(id) !== null).map(id => Number(id));
};

// Validar usuario (wrapper)
const validarUsuario = (usuario) => {
  return SecurityUtils.validarUsuario(usuario);
};

// Validar departamento (wrapper)
const validarDepartamento = (depto) => {
  return SecurityUtils.validarDepartamento(depto);
};

export default function GestionAsignacionUsPage() {
  const router = useRouter();

  // 🔐 Rate limiter ref
  const rateLimiterRef = useRef(SecurityUtils.createRateLimiter(5, 60000));

  // State
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [departamentos, setDepartamentos] = useState([]);

  // Departamento seleccionado
  const [selectedDepartamento, setSelectedDepartamento] = useState(null);
  const [usuarios, setUsuarios] = useState([]);
  const [loadingUsuarios, setLoadingUsuarios] = useState(false);

  // Selección de usuarios
  const [selectedUsuarios, setSelectedUsuarios] = useState([]);

  // Departamento destino
  const [nuevoDepartamento, setNuevoDepartamento] = useState(null);

  // Búsqueda
  const [busquedaDept, setBusquedaDept] = useState('');
  const [busquedaUsuario, setBusquedaUsuario] = useState('');

  const [mostrarCambioDept, setMostrarCambioDept] = useState(false);
  const [mostrarAsignacionSinDept, setMostrarAsignacionSinDept] = useState(false);
  const [usuariosSinDept, setUsuariosSinDept] = useState([]);
  const [loadingSinDept, setLoadingSinDept] = useState(false);

  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [mostrarDetalleUsuario, setMostrarDetalleUsuario] = useState(false);
  const [mostrarModalPermisos, setMostrarModalPermisos] = useState(false);

  const [modoEdicion, setModoEdicion] = useState(false);
  const [permisosActuales, setPermisosActuales] = useState(null);
  const [usuarioEditandoPermisos, setUsuarioEditandoPermisos] = useState(null);

  const [mostrarModalRevocacion, setMostrarModalRevocacion] = useState(false);
  const [usuarioARevocar, setUsuarioARevocar] = useState(null);
  const [loadingRevocacion, setLoadingRevocacion] = useState(false);

  useEffect(() => {
    cargarDepartamentos();
  }, []);

  useEffect(() => {
    if (selectedDepartamento) {
      cargarUsuariosDepartamento(selectedDepartamento);
    } else {
      setUsuarios([]);
      setSelectedUsuarios([]);
      setNuevoDepartamento(null);
    }
  }, [selectedDepartamento]);

  useEffect(() => {
    if (!mostrarAsignacionSinDept && selectedDepartamento && !mostrarCambioDept) {
      cargarUsuariosDepartamento(selectedDepartamento);
    }
  }, [mostrarAsignacionSinDept]);

  const cargarUsuariosSinDepartamento = async () => {
    try {
      setLoadingSinDept(true);
      const response = await usuarioService.listarCompleto({
        estado: 'activo'
      });

      // ✅ Filtrar: sin departamento Y solo funcionarios
      const sinDept = (response?.usuarios || []).filter(u =>
        (!u.departamento && !u.id_departamento) &&
        (u.rol_principal?.nombre_rol?.toLowerCase() === 'funcionario' ||
          u.roles?.some(r => r.nombre_rol?.toLowerCase() === 'funcionario'))
      );

      console.log('✅ Usuarios sin departamento (Funcionarios):', sinDept.length);
      setUsuariosSinDept(sinDept);
    } catch (error) {
      console.error('Error cargando usuarios sin departamento:', error);
      Alert.alert('Error', 'No se pudieron cargar los usuarios sin departamento');
    } finally {
      setLoadingSinDept(false);
    }
  };

  const cargarDepartamentos = async () => {
    try {
      setLoading(true);
      const response = await departamentoService.getAll({ activo: true });

      // ✅ VALIDAR respuesta
      if (!Array.isArray(response)) {
        console.error('❌ Respuesta inválida del servidor');
        setDepartamentos([]);
        return;
      }

      const deptosValidados = response.filter(validarDepartamento);
      setDepartamentos(deptosValidados);

      if (deptosValidados.length !== response.length) {
        console.warn('⚠️ Algunos departamentos fueron filtrados por ser inválidos');
      }
    } catch (error) {
      console.error('Error cargando departamentos:', error);
      Alert.alert('Error', 'No se pudieron cargar los departamentos');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  const cargarUsuariosDepartamento = async (idDepartamento) => {
    try {
      // ✅ VALIDACIÓN: ID de departamento
      const idValidado = validateNumericId(idDepartamento);
      if (!idValidado) {
        console.error('❌ ID de departamento inválido:', idDepartamento);
        Alert.alert('Error', 'ID de departamento inválido');
        return;
      }

      setLoadingUsuarios(true);
      const response = await usuarioService.listarCompleto({
        id_departamento: idValidado,
        estado: 'activo'
      });

      // ✅ VALIDACIÓN: Respuesta del servidor
      if (!response || !response.usuarios || !Array.isArray(response.usuarios)) {
        console.warn('⚠️ Respuesta inválida del servidor');
        setUsuarios([]);
        setLoadingUsuarios(false);
        return;
      }
      // ✅ Filtrar: solo funcionarios
      const usuariosFuncionarios = (response?.usuarios || []).filter(u =>
        u.rol_principal?.nombre_rol?.toLowerCase() === 'funcionario' ||
        u.roles?.some(r => r.nombre_rol?.toLowerCase() === 'funcionario')
      );
      console.log('✅ Funcionarios en departamento:', usuariosFuncionarios.length);
      setUsuarios(usuariosFuncionarios);
    } catch (error) {
      console.error('Error cargando usuarios:', error);
      Alert.alert('Error', 'No se pudieron cargar los usuarios del departamento');
    } finally {
      setLoadingUsuarios(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    cargarDepartamentos();
  };

  const toggleUsuario = (idUsuario) => {
    const idValidado = validateNumericId(idUsuario);
    if (!idValidado) {
      console.warn('⚠️ ID de usuario inválido:', idUsuario);
      return;
    }

    setSelectedUsuarios(prev => {
      if (prev.includes(idValidado)) {
        return prev.filter(id => id !== idValidado);
      } else {
        return [...prev, idValidado];
      }
    });
  };

  const seleccionarTodos = () => {
    const usuariosFiltrados = getUsuariosFiltrados();

    // ✅ LÍMITE: Máximo 100 usuarios a la vez
    if (usuariosFiltrados.length > 100) {
      Alert.alert(
        '⚠️ Límite Excedido',
        'Por seguridad, solo puedes seleccionar hasta 100 usuarios a la vez'
      );
      return;
    }

    if (selectedUsuarios.length === usuariosFiltrados.length) {
      setSelectedUsuarios([]);
    } else {
      const idsValidados = validateIdArray(usuariosFiltrados.map(u => u.id_usuario));
      setSelectedUsuarios(idsValidados);
    }
  };

  const handleMoverUsuarios = async () => {
    // ✅ Rate limiting
    if (!rateLimiterRef.current.isAllowed('handleMoverUsuarios')) {
      SecurityUtils.logSecurityEvent('RATE_LIMIT_MOVE_USUARIOS', { timestamp: new Date() });
      Alert.alert('⚠️ Demasiados intentos', 'Por favor, espera un momento antes de intentar de nuevo');
      return;
    }

    // ✅ Validar IDs seleccionados
    const idsValidados = validateIdArray(selectedUsuarios);
    if (idsValidados.length === 0) {
      SecurityUtils.logSecurityEvent('MOVE_USUARIOS_NO_VALID_IDS', { ids: selectedUsuarios });
      Alert.alert('⚠️', 'No hay usuarios válidos seleccionados');
      return;
    }

    if (idsValidados.length !== selectedUsuarios.length) {
      SecurityUtils.logSecurityEvent('MOVE_USUARIOS_PARTIAL_VALID_IDS', { 
        totalSelected: selectedUsuarios.length,
        validIds: idsValidados.length
      });
      Alert.alert('⚠️', 'Algunos IDs de usuarios no son válidos');
      return;
    }

    // Si es asignación de usuarios sin departamento
    if (mostrarAsignacionSinDept) {
      if (idsValidados.length === 0) {
        Alert.alert('⚠️', 'Debes seleccionar al menos un usuario');
        return;
      }

      const deptoValidado = validateNumericId(selectedDepartamento);
      if (!deptoValidado) {
        SecurityUtils.logSecurityEvent('MOVE_USUARIOS_INVALID_DEPT_ID', { deptId: selectedDepartamento });
        Alert.alert('⚠️', 'ID de departamento destino inválido');
        return;
      }

      // ✅ NUEVO: Abrir modal de permisos
      setMostrarModalPermisos(true);
      return;
    }

    // Si es cambio de departamento
    if (idsValidados.length === 0) {
      window.alert('⚠️ Debes seleccionar al menos un usuario para mover');
      return;
    }

    const nuevoDeptoValidado = validateNumericId(nuevoDepartamento);
    const selectedDeptoValidado = validateNumericId(selectedDepartamento);

    if (!nuevoDeptoValidado || !selectedDeptoValidado) {
      SecurityUtils.logSecurityEvent('MOVE_USUARIOS_INVALID_DEPT_IDS', { 
        newDeptId: nuevoDepartamento,
        selectedDeptId: selectedDepartamento
      });
      window.alert('❌ IDs de departamento inválidos');
      return;
    }

    if (nuevoDeptoValidado === selectedDeptoValidado) {
      window.alert('⚠️ El departamento destino debe ser diferente al actual');
      return;
    }

    const nombreDepartamentoDestino = getDepartamentoNombre(nuevoDeptoValidado);

    if (!nombreDepartamentoDestino) {
      SecurityUtils.logSecurityEvent('MOVE_USUARIOS_DEPT_NOT_FOUND', { deptId: nuevoDeptoValidado });
      window.alert('❌ No se encontró el departamento destino');
      return;
    }

    const confirmar = window.confirm(`¿Mover ${idsValidados.length} usuario(s) a ${nombreDepartamentoDestino}?`);

    if (!confirmar) {
      SecurityUtils.logSecurityEvent('MOVE_USUARIOS_CANCELLED_BY_USER', { 
        usuariosCount: idsValidados.length,
        destinoDept: nuevoDeptoValidado
      });
      return;
    }

    SecurityUtils.logSecurityEvent('MOVE_USUARIOS_ATTEMPT', {
      usuariosCount: idsValidados.length,
      origenDept: selectedDeptoValidado,
      destinoDept: nuevoDeptoValidado,
      usuariosIds: idsValidados
    });

    try {
      setLoading(true);

      const promesas = idsValidados.map(idUsuario =>
        usuarioService.cambiarDepartamento(idUsuario, {
          id_departamento: nuevoDeptoValidado,
        })
      );

      const resultados = await Promise.all(promesas);

      SecurityUtils.logSecurityEvent('MOVE_USUARIOS_SUCCESS', {
        usuariosCount: idsValidados.length,
        destinoDept: nuevoDeptoValidado,
        nombreDept: nombreDepartamentoDestino
      });

      window.alert(`✅ ${idsValidados.length} usuario(s) movido(s) correctamente a ${nombreDepartamentoDestino}`);

      await cargarUsuariosDepartamento(selectedDepartamento);
      setSelectedUsuarios([]);
      setNuevoDepartamento(null);

    } catch (error) {
      SecurityUtils.logSecurityEvent('MOVE_USUARIOS_ERROR', {
        usuariosCount: idsValidados.length,
        error: error.message
      });
      console.error('❌ Error moviendo usuarios:', error);
      window.alert('❌ Error: ' + (error.message || 'No se pudieron mover los usuarios'));
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmarConPermisos = async (permisos) => {
    try {
      // ✅ Rate limiting
      if (!rateLimiterRef.current.isAllowed('handleConfirmarConPermisos')) {
        SecurityUtils.logSecurityEvent('RATE_LIMIT_PERMISOS', { timestamp: new Date() });
        Alert.alert('⚠️ Demasiados intentos', 'Por favor, espera un momento antes de intentar de nuevo');
        return;
      }

      // ✅ VALIDACIÓN: Verificar estructura de permisos
      const permisosRequeridos = [
        'puede_ver_contenido',
        'puede_crear_contenido',
        'puede_editar_contenido',
        'puede_eliminar_contenido',
        'puede_publicar_contenido',
        'puede_ver_metricas',
        'puede_exportar_datos',
        'puede_configurar_agente',
        'puede_gestionar_permisos',
        'puede_gestionar_categorias',
        'puede_gestionar_widgets'
      ];

      const permisosValidos = permisosRequeridos.every(
        p => typeof permisos[p] === 'boolean'
      );

      if (!permisosValidos) {
        SecurityUtils.logSecurityEvent('PERMISOS_INVALID_STRUCTURE', { permisos });
        Alert.alert('❌ Error', 'Estructura de permisos inválida');
        return;
      }

      setLoading(true);
      setMostrarModalPermisos(false);

      // ✅ NUEVO: Si es modo edición, actualizar permisos existentes
      if (modoEdicion && usuarioEditandoPermisos) {
        const idUsuarioValidado = validateNumericId(usuarioEditandoPermisos.usuario.id_usuario);
        const idAgenteValidado = validateNumericId(usuarioEditandoPermisos.agente.id_agente);

        if (!idUsuarioValidado || !idAgenteValidado) {
          SecurityUtils.logSecurityEvent('PERMISOS_EDIT_INVALID_IDS', {
            usuarioId: usuarioEditandoPermisos.usuario.id_usuario,
            agenteId: usuarioEditandoPermisos.agente.id_agente
          });
          Alert.alert('❌ Error', 'IDs de usuario o agente inválidos');
          setLoading(false);
          return;
        }

        SecurityUtils.logSecurityEvent('PERMISOS_UPDATE_ATTEMPT', {
          usuarioId: idUsuarioValidado,
          agenteId: idAgenteValidado,
          permisosCount: Object.values(permisos).filter(v => v === true).length
        });

        try {
          await usuarioAgenteService.actualizar(
            idUsuarioValidado,
            idAgenteValidado,
            {
              puede_ver_contenido: permisos.puede_ver_contenido,
              puede_crear_contenido: permisos.puede_crear_contenido,
              puede_editar_contenido: permisos.puede_editar_contenido,
              puede_eliminar_contenido: permisos.puede_eliminar_contenido,
              puede_publicar_contenido: permisos.puede_publicar_contenido,
              puede_ver_metricas: permisos.puede_ver_metricas,
              puede_exportar_datos: permisos.puede_exportar_datos,
              puede_configurar_agente: permisos.puede_configurar_agente,
              puede_gestionar_permisos: permisos.puede_gestionar_permisos,
              puede_gestionar_categorias: permisos.puede_gestionar_categorias,
              puede_gestionar_widgets: permisos.puede_gestionar_widgets,
            }
          );

          SecurityUtils.logSecurityEvent('PERMISOS_UPDATE_SUCCESS', {
            usuarioId: idUsuarioValidado,
            agenteId: idAgenteValidado,
            nombreUsuario: `${usuarioEditandoPermisos.usuario.persona?.nombre} ${usuarioEditandoPermisos.usuario.persona?.apellido}`
          });

          // Limpiar estados
          setModoEdicion(false);
          setUsuarioEditandoPermisos(null);
          setPermisosActuales(null);
          setLoading(false);

          Alert.alert(
            '✅ Permisos Actualizados',
            `Los permisos de ${usuarioEditandoPermisos.usuario.persona?.nombre} ${usuarioEditandoPermisos.usuario.persona?.apellido} se actualizaron correctamente.`,
            [{ text: 'Perfecto', style: 'default' }]
          );

          return;
        } catch (error) {
          SecurityUtils.logSecurityEvent('PERMISOS_UPDATE_ERROR', {
            usuarioId: idUsuarioValidado,
            error: error.message
          });
          console.error('❌ Error actualizando permisos:', error);
          Alert.alert('Error', 'No se pudieron actualizar los permisos');
          setLoading(false);
          return;
        }
      }

      // ✅ VALIDACIÓN: IDs de usuarios
      const idsValidados = validateIdArray(selectedUsuarios);
      if (idsValidados.length === 0) {
        SecurityUtils.logSecurityEvent('PERMISOS_ASSIGN_NO_VALID_USERS', { idsValidados });
        Alert.alert('❌ Error', 'No hay usuarios válidos para asignar');
        setLoading(false);
        return;
      }

      // ✅ VALIDACIÓN: ID de departamento
      const deptoValidado = validateNumericId(selectedDepartamento);
      if (!deptoValidado) {
        SecurityUtils.logSecurityEvent('PERMISOS_ASSIGN_INVALID_DEPT', { deptId: selectedDepartamento });
        Alert.alert('❌ Error', 'ID de departamento inválido');
        setLoading(false);
        return;
      }

      // ✅ RESTO DEL CÓDIGO (para asignación nueva)
      const usuariosAsignados = idsValidados.length;
      const nombreDept = departamentoActual?.nombre;
      const idsUsuarios = [...idsValidados];

      SecurityUtils.logSecurityEvent('PERMISOS_ASSIGN_ATTEMPT', {
        usuariosCount: idsUsuarios.length,
        departamento: deptoValidado,
        permisosCount: Object.values(permisos).filter(v => v === true).length
      });

      console.log('🔍 Iniciando asignación de usuarios:', idsUsuarios);
      console.log('🔍 Departamento destino:', deptoValidado, '-', nombreDept);
      console.log('🔍 Permisos a aplicar:', permisos);

      const promesasDepartamento = idsUsuarios.map(idUsuario =>
        usuarioService.cambiarDepartamento(idUsuario, {
          id_departamento: deptoValidado,
        })
      );

      await Promise.all(promesasDepartamento);
      console.log('✅ Usuarios asignados al departamento exitosamente');

      const agentesResponse = await obtenerAgentesDelDepartamento(deptoValidado);
      const agentes = agentesResponse || [];

      console.log('🔍 Agentes obtenidos:', agentes.length, 'agente(s)');
      console.log('🔍 Detalle de agentes:', agentes.map(a => ({ id: a.id_agente, nombre: a.nombre })));

      if (agentes.length === 0) {
        // ✅ PRIMERO: Recargar datos
        await cargarUsuariosDepartamento(selectedDepartamento);
        await cargarUsuariosSinDepartamento();

        SecurityUtils.logSecurityEvent('PERMISOS_ASSIGN_NO_AGENTS', {
          usuariosCount: usuariosAsignados,
          departamento: deptoValidado
        });

        // ✅ SEGUNDO: Limpiar estados (esto cierra la vista de asignación)
        setMostrarAsignacionSinDept(false);
        setSelectedUsuarios([]);
        setNuevoDepartamento(null);
        setLoading(false);

        // ✅ TERCERO: Mostrar alerta
        Alert.alert(
          '⚠️ Advertencia',
          `Los ${usuariosAsignados} usuario(s) se asignaron correctamente al departamento "${nombreDept}", pero este departamento no tiene agentes virtuales.\n\n✓ El cambio de departamento fue exitoso\n✓ Los permisos se aplicarán automáticamente cuando se creen agentes en este departamento.`,
          [{ text: 'Entendido', style: 'default' }]
        );

        return;
      }

      const promesasPermisos = [];

      for (const idUsuario of idsUsuarios) {
        for (const agente of agentes) {
          const datosAsignacion = {
            id_usuario: idUsuario,
            id_agente: agente.id_agente,
            puede_ver_contenido: permisos.puede_ver_contenido,
            puede_crear_contenido: permisos.puede_crear_contenido,
            puede_editar_contenido: permisos.puede_editar_contenido,
            puede_eliminar_contenido: permisos.puede_eliminar_contenido,
            puede_publicar_contenido: permisos.puede_publicar_contenido,
            puede_ver_metricas: permisos.puede_ver_metricas,
            puede_exportar_datos: permisos.puede_exportar_datos,
            puede_configurar_agente: permisos.puede_configurar_agente,
            puede_gestionar_permisos: permisos.puede_gestionar_permisos,
            puede_gestionar_categorias: permisos.puede_gestionar_categorias,
            puede_gestionar_widgets: permisos.puede_gestionar_widgets,
            notas: `Asignado automáticamente al ingresar al departamento ${nombreDept}`
          };

          console.log(`📝 Preparando asignación: Usuario ${idUsuario} → Agente ${agente.id_agente} (${agente.nombre})`);

          promesasPermisos.push(
            usuarioAgenteService.asignar(datosAsignacion)
          );
        }
      }

      console.log('🔍 Total de asignaciones a realizar:', promesasPermisos.length);
      console.log(`🔍 Desglose: ${idsUsuarios.length} usuario(s) × ${agentes.length} agente(s) = ${promesasPermisos.length} asignaciones`);

      if (promesasPermisos.length > 0) {
        const resultados = await Promise.all(promesasPermisos);
        console.log('✅ Asignaciones completadas:', resultados.length);
      }

      SecurityUtils.logSecurityEvent('PERMISOS_ASSIGN_SUCCESS', {
        usuariosCount: idsUsuarios.length,
        agentesCount: agentes.length,
        asignacionesCount: promesasPermisos.length,
        departamento: deptoValidado
      });

      // ✅ PRIMERO: Recargar datos
      await cargarUsuariosDepartamento(selectedDepartamento);
      await cargarUsuariosSinDepartamento();

      // ✅ SEGUNDO: Limpiar estados (esto cierra la vista de asignación)
      setMostrarAsignacionSinDept(false);
      setSelectedUsuarios([]);
      setNuevoDepartamento(null);
      setLoading(false);

      // ✅ TERCERO: Mostrar alerta
      const resumenPermisos = Object.entries(permisos)
        .filter(([_, value]) => value === true)
        .length;

      Alert.alert(
        '✅ Asignación Exitosa',
        `${usuariosAsignados} usuario(s) asignado(s) a "${nombreDept}"\n\n`,
        [{ text: 'Perfecto', style: 'default' }]
      );

    } catch (error) {
      SecurityUtils.logSecurityEvent('PERMISOS_ASSIGN_ERROR', {
        error: error.message,
        usuariosCount: selectedUsuarios.length
      });
      console.error('❌ Error asignando usuarios:', error);
      console.error('❌ Stack:', error.stack);

      Alert.alert(
        '❌ Error en la Asignación',
        `No se pudieron asignar los usuarios:\n\n${error.message || 'Error desconocido'}\n\nIntenta nuevamente o contacta al administrador.`,
        [{ text: 'Cerrar', style: 'cancel' }]
      );

      setLoading(false);
    }
  };

  const obtenerAgentesDelDepartamento = async (idDepartamento) => {
    try {
      // ✅ VALIDACIÓN: ID de departamento
      const idValidado = validateNumericId(idDepartamento);
      if (!idValidado) {
        console.error('❌ ID de departamento inválido');
        return [];
      }

      console.log('🔍 [obtenerAgentesDelDepartamento] Buscando agentes para departamento:', idValidado);

      const response = await agenteService.getAll({ id_departamento: idValidado });

      console.log('🔍 [obtenerAgentesDelDepartamento] Respuesta completa del servicio:', response);
      console.log('🔍 [obtenerAgentesDelDepartamento] response.agentes:', response?.agentes);
      console.log('🔍 [obtenerAgentesDelDepartamento] response.data:', response?.data);
      console.log('🔍 [obtenerAgentesDelDepartamento] response directamente:', Array.isArray(response) ? response : 'No es array');

      // Intentar diferentes estructuras de respuesta
      let agentes = [];

      if (Array.isArray(response)) {
        // Caso 1: La respuesta ES directamente el array de agentes
        agentes = response;
        console.log('✅ Caso 1: response es array directo');
      } else if (response?.agentes && Array.isArray(response.agentes)) {
        // Caso 2: La respuesta tiene propiedad 'agentes'
        agentes = response.agentes;
        console.log('✅ Caso 2: response.agentes');
      } else if (response?.data && Array.isArray(response.data)) {
        // Caso 3: La respuesta tiene propiedad 'data'
        agentes = response.data;
        console.log('✅ Caso 3: response.data');
      } else if (response?.data?.agentes && Array.isArray(response.data.agentes)) {
        // Caso 4: La respuesta tiene data.agentes
        agentes = response.data.agentes;
        console.log('✅ Caso 4: response.data.agentes');
      } else {
        console.log('⚠️ No se pudo determinar la estructura de la respuesta');
      }

      // Filtrar solo agentes activos del departamento específico
      const agentesFiltrados = agentes.filter(a => {
        const idAgenteDept = validateNumericId(a.id_departamento);
        return idAgenteDept === idValidado;
      });

      console.log('🔍 [obtenerAgentesDelDepartamento] Agentes filtrados:', agentesFiltrados.length);
      console.log('🔍 [obtenerAgentesDelDepartamento] Detalle:', agentesFiltrados.map(a => ({
        id: a.id_agente,
        nombre: a.nombre,
        id_departamento: a.id_departamento
      })));

      return agentesFiltrados;
    } catch (error) {
      console.error('❌ [obtenerAgentesDelDepartamento] Error obteniendo agentes:', error);
      console.error('❌ [obtenerAgentesDelDepartamento] Error completo:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      return [];
    }
  };

  const cargarPermisosUsuario = async (usuario, agente) => {
    try {
      console.log('🔍 Cargando permisos para:', { usuario: usuario.id_usuario, agente: agente.id_agente });

      const response = await usuarioAgenteService.obtenerPorUsuarioYAgente(usuario.id_usuario, agente.id_agente);

      console.log('🔍 Respuesta de permisos:', response);

      if (response) {
        return {
          puede_ver_contenido: response.puede_ver_contenido || false,
          puede_crear_contenido: response.puede_crear_contenido || false,
          puede_editar_contenido: response.puede_editar_contenido || false,
          puede_eliminar_contenido: response.puede_eliminar_contenido || false,
          puede_publicar_contenido: response.puede_publicar_contenido || false,
          puede_ver_metricas: response.puede_ver_metricas || false,
          puede_exportar_datos: response.puede_exportar_datos || false,
          puede_configurar_agente: response.puede_configurar_agente || false,
          puede_gestionar_permisos: response.puede_gestionar_permisos || false,
          puede_gestionar_categorias: response.puede_gestionar_categorias || false,
          puede_gestionar_widgets: response.puede_gestionar_widgets || false,
        };
      }

      // Si no hay permisos, retornar permisos por defecto
      return {
        puede_ver_contenido: true,
        puede_crear_contenido: true,
        puede_editar_contenido: true,
        puede_eliminar_contenido: false,
        puede_publicar_contenido: false,
        puede_ver_metricas: true,
        puede_exportar_datos: false,
        puede_configurar_agente: false,
        puede_gestionar_permisos: false,
        puede_gestionar_categorias: false,
        puede_gestionar_widgets: false,
      };
    } catch (error) {
      console.error('❌ Error cargando permisos:', error);
      // Retornar permisos por defecto en caso de error
      return {
        puede_ver_contenido: true,
        puede_crear_contenido: true,
        puede_editar_contenido: true,
        puede_eliminar_contenido: false,
        puede_publicar_contenido: false,
        puede_ver_metricas: true,
        puede_exportar_datos: false,
        puede_configurar_agente: false,
        puede_gestionar_permisos: false,
        puede_gestionar_categorias: false,
        puede_gestionar_widgets: false,
      };
    }
  };


  const handleEditarPermisos = async (usuario) => {
    try {
      // ✅ Validar usuario
      if (!validarUsuario(usuario)) {
        Alert.alert('Error', 'Datos de usuario inválidos');
        return;
      }

      const idUsuarioValidado = validateNumericId(usuario.id_usuario);
      if (!idUsuarioValidado) {
        Alert.alert('Error', 'ID de usuario inválido');
        return;
      }

      console.log('📝 Iniciando edición de permisos para usuario:', idUsuarioValidado);

      // Obtener agentes del departamento del usuario
      const idDepartamento = usuario.departamento?.id_departamento || usuario.id_departamento;
      const idDepartamentoValidado = validateNumericId(idDepartamento);

      if (!idDepartamentoValidado) {
        Alert.alert('Error', 'El usuario no tiene un departamento válido asignado');
        return;
      }

      const agentesResponse = await obtenerAgentesDelDepartamento(idDepartamentoValidado);
      const agentes = agentesResponse || [];

      if (agentes.length === 0) {
        const nombreDept = usuario.departamento?.nombre || 'este departamento';

        Alert.alert(
          '⚠️ Sin Agentes Virtuales',
          `El usuario está asignado correctamente a "${nombreDept}", pero este departamento no tiene agentes virtuales.\n\n✓ El usuario permanece en el departamento\n✓ Los permisos se aplicarán automáticamente cuando se creen agentes.`,
          [{ text: 'Entendido', style: 'default' }]
        );

        return;
      }

      // Por ahora tomamos el primer agente (puedes mejorar esto después para seleccionar cuál agente)
      const agente = agentes[0];

      // Cargar permisos actuales
      const permisos = await cargarPermisosUsuario(usuario, agente);

      console.log('📝 Permisos cargados:', permisos);

      // Configurar estado para edición
      setUsuarioEditandoPermisos({ usuario, agente });
      setPermisosActuales(permisos);
      setModoEdicion(true);
      setMostrarModalPermisos(true);

    } catch (error) {
      console.error('❌ Error al preparar edición de permisos:', error);
      Alert.alert('Error', 'No se pudieron cargar los permisos del usuario');
    }
  };

  const handleRevocarAsignacion = async (usuario) => {
    // ✅ Validar usuario
    if (!validarUsuario(usuario)) {
      Alert.alert('Error', 'Datos de usuario inválidos');
      return;
    }

    setUsuarioARevocar(usuario);
    setMostrarModalRevocacion(true);
  };

  const confirmarRevocacion = async () => {
    if (!usuarioARevocar) {
      SecurityUtils.logSecurityEvent('REVOCACION_NO_USER_SELECTED', { timestamp: new Date() });
      return;
    }

    // ✅ Rate limiting
    if (!rateLimiterRef.current.isAllowed('confirmarRevocacion')) {
      SecurityUtils.logSecurityEvent('RATE_LIMIT_REVOCACION', { timestamp: new Date() });
      Alert.alert('⚠️ Demasiados intentos', 'Por favor, espera un momento antes de intentar de nuevo');
      return;
    }

    // ✅ Validar usuario
    const idUsuarioValidado = validateNumericId(usuarioARevocar.id_usuario);
    if (!idUsuarioValidado) {
      SecurityUtils.logSecurityEvent('REVOCACION_INVALID_USER_ID', { userId: usuarioARevocar.id_usuario });
      Alert.alert('Error', 'ID de usuario inválido');
      return;
    }

    try {
      setLoadingRevocacion(true);

      const nombreUsuario = `${usuarioARevocar.persona?.nombre} ${usuarioARevocar.persona?.apellido}`;

      SecurityUtils.logSecurityEvent('REVOCACION_ATTEMPT', {
        usuarioId: idUsuarioValidado,
        nombreUsuario: nombreUsuario
      });

      // 1. Obtener agentes del departamento
      const idDepartamento = usuarioARevocar.departamento?.id_departamento || usuarioARevocar.id_departamento;
      const idDepartamentoValidado = validateNumericId(idDepartamento);

      if (!idDepartamentoValidado) {
        SecurityUtils.logSecurityEvent('REVOCACION_INVALID_DEPT_ID', { deptId: idDepartamento });
        Alert.alert('Error', 'Departamento inválido');
        setLoadingRevocacion(false);
        return;
      }

      const agentesResponse = await obtenerAgentesDelDepartamento(idDepartamentoValidado);
      const agentes = agentesResponse || [];

      // 2. ELIMINAR registros de usuario_agente
      if (agentes.length > 0) {
        const promesasEliminar = agentes.map(agente => {
          const idAgenteValidado = validateNumericId(agente.id_agente);
          if (!idAgenteValidado) {
            console.warn('⚠️ ID de agente inválido:', agente.id_agente);
            return Promise.resolve();
          }
          return usuarioAgenteService.eliminar(idUsuarioValidado, idAgenteValidado);
        });

        await Promise.all(promesasEliminar);
        console.log('✅ Registros eliminados de usuario_agente:', agentes.length, 'agente(s)');

        SecurityUtils.logSecurityEvent('REVOCACION_AGENT_RECORDS_DELETED', {
          usuarioId: idUsuarioValidado,
          agentesCount: agentes.length
        });
      }

      // 3. Remover departamento del usuario
      await usuarioService.cambiarDepartamento(idUsuarioValidado, {
        id_departamento: null,
      });

      console.log('✅ Departamento removido del usuario');

      SecurityUtils.logSecurityEvent('REVOCACION_DEPT_REMOVED', {
        usuarioId: idUsuarioValidado,
        departamentoId: idDepartamentoValidado
      });

      // 4. Recargar datos
      await cargarUsuariosDepartamento(selectedDepartamento);

      setLoadingRevocacion(false);
      setMostrarModalRevocacion(false);
      setUsuarioARevocar(null);

      SecurityUtils.logSecurityEvent('REVOCACION_SUCCESS', {
        usuarioId: idUsuarioValidado,
        nombreUsuario: nombreUsuario,
        departamentoId: idDepartamentoValidado,
        timestamp: new Date().toISOString()
      });

      Alert.alert(
        '✅ Revocación Exitosa',
        `${nombreUsuario} ha sido removido del departamento.\n\n`,
        [{ text: 'Entendido', style: 'default' }]
      );

    } catch (error) {
      SecurityUtils.logSecurityEvent('REVOCACION_ERROR', {
        usuarioId: usuarioARevocar?.id_usuario,
        error: error.message
      });
      console.error('❌ Error revocando asignación:', error);
      setLoadingRevocacion(false);
      Alert.alert('Error', 'No se pudo revocar la asignación: ' + error.message);
    }
  };

  const getDepartamentoNombre = (idDepartamento) => {
    return departamentos.find(d => d.id_departamento === idDepartamento)?.nombre || '';
  };

  const getDepartamentosFiltrados = () => {
    if (!busquedaDept.trim()) return departamentos;

    // 🔐 Detectar intentos de ataque en búsqueda
    if (SecurityUtils.detectXssAttempt(busquedaDept)) {
      SecurityUtils.logSecurityEvent('XSS_ATTEMPT_IN_DEPT_SEARCH', { 
        input: busquedaDept.substring(0, 50),
        timestamp: new Date().toISOString()
      });
      Alert.alert('⚠️ Contenido sospechoso', 'Se detectó contenido no permitido en la búsqueda');
      return [];
    }

    if (SecurityUtils.detectSqlInjection(busquedaDept)) {
      SecurityUtils.logSecurityEvent('SQL_INJECTION_ATTEMPT_IN_DEPT_SEARCH', { 
        input: busquedaDept.substring(0, 50),
        timestamp: new Date().toISOString()
      });
      Alert.alert('⚠️ Caracteres sospechosos', 'Se detectaron caracteres no permitidos en la búsqueda');
      return [];
    }

    const busqueda = busquedaDept.toLowerCase();
    return departamentos.filter(d =>
      d.nombre.toLowerCase().includes(busqueda) ||
      d.codigo.toLowerCase().includes(busqueda) ||
      (d.facultad && d.facultad.toLowerCase().includes(busqueda))
    );
  };

  const getUsuariosFiltrados = () => {
    if (!busquedaUsuario.trim()) return usuarios;

    // 🔐 Detectar intentos de ataque en búsqueda
    if (SecurityUtils.detectXssAttempt(busquedaUsuario)) {
      SecurityUtils.logSecurityEvent('XSS_ATTEMPT_IN_USER_SEARCH', { 
        input: busquedaUsuario.substring(0, 50),
        timestamp: new Date().toISOString()
      });
      Alert.alert('⚠️ Contenido sospechoso', 'Se detectó contenido no permitido en la búsqueda');
      return [];
    }

    if (SecurityUtils.detectSqlInjection(busquedaUsuario)) {
      SecurityUtils.logSecurityEvent('SQL_INJECTION_ATTEMPT_IN_USER_SEARCH', { 
        input: busquedaUsuario.substring(0, 50),
        timestamp: new Date().toISOString()
      });
      Alert.alert('⚠️ Caracteres sospechosos', 'Se detectaron caracteres no permitidos en la búsqueda');
      return [];
    }

    const busqueda = busquedaUsuario.toLowerCase();
    return usuarios.filter(u =>
      u.persona?.nombre.toLowerCase().includes(busqueda) ||
      u.persona?.apellido.toLowerCase().includes(busqueda) ||
      u.username.toLowerCase().includes(busqueda) ||
      u.email.toLowerCase().includes(busqueda) ||
      (u.persona?.cedula && u.persona.cedula.includes(busqueda))
    );
  };

  const resetSeleccion = () => {
    setSelectedDepartamento(null);
    setSelectedUsuarios([]);
    setNuevoDepartamento(null);
    setBusquedaUsuario('');
    setMostrarCambioDept(false);
    setMostrarAsignacionSinDept(false);
    setUsuariosSinDept([]);
  };

  const departamentoActual = departamentos.find(d => d.id_departamento === selectedDepartamento);
  const departamentoDestino = departamentos.find(d => Number(d.id_departamento) === Number(nuevoDepartamento));

  const departamentosFiltrados = getDepartamentosFiltrados();
  const usuariosFiltrados = getUsuariosFiltrados();

  const ModalRevocacion = () => {
    if (!mostrarModalRevocacion || !usuarioARevocar) return null;

    const nombreCompleto = `${usuarioARevocar.persona?.nombre} ${usuarioARevocar.persona?.apellido}`;
    const nombreDepartamento = usuarioARevocar.departamento?.nombre || 'departamento';

    return (
      <View style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
        padding: 20,
      }}>
        <View style={{
          backgroundColor: '#ffffff',
          borderRadius: 20,
          padding: 24,
          width: '100%',
          maxWidth: 500,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
        }}>

          {/* Header */}
          <View style={{ alignItems: 'center', marginBottom: 20 }}>
            <View style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: '#fee2e2',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 16,
            }}>
              <Ionicons name="warning" size={48} color="#ef4444" />
            </View>
            <Text style={{
              fontSize: 24,
              fontWeight: '700',
              color: '#1f2937',
              marginBottom: 8,
            }}>
              Confirmar Revocación
            </Text>
          </View>

          {/* Contenido */}
          <View style={{ marginBottom: 24 }}>
            <Text style={{
              fontSize: 16,
              color: '#4b5563',
              lineHeight: 24,
              textAlign: 'center',
              marginBottom: 16,
            }}>
              ¿Estás seguro de revocar la asignación de{' '}
              <Text style={{ fontWeight: '700', color: '#1f2937' }}>{nombreCompleto}</Text>
              {' '}del departamento{' '}
              <Text style={{ fontWeight: '700', color: '#1f2937' }}>"{nombreDepartamento}"</Text>?
            </Text>

            <View style={{
              backgroundColor: '#fef3c7',
              padding: 16,
              borderRadius: 12,
              borderLeftWidth: 4,
              borderLeftColor: '#f59e0b',
            }}>
              <Text style={{
                fontSize: 14,
                fontWeight: '600',
                color: '#92400e',
                marginBottom: 8,
              }}>
                Esta acción realizará lo siguiente:
              </Text>
              <View style={{ gap: 6 }}>
                <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                  <Text style={{ color: '#92400e', marginRight: 8 }}>•</Text>
                  <Text style={{ flex: 1, color: '#92400e', fontSize: 14 }}>
                    Removerá el departamento del usuario
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                  <Text style={{ color: '#92400e', marginRight: 8 }}>•</Text>
                  <Text style={{ flex: 1, color: '#92400e', fontSize: 14 }}>
                    Eliminará todos los registros en los agentes virtuales
                  </Text>
                </View>
              </View>
            </View>

            <View style={{
              backgroundColor: '#dbeafe',
              padding: 12,
              borderRadius: 8,
              marginTop: 12,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
            }}>
              <Ionicons name="information-circle" size={20} color="#2563eb" />
              <Text style={{
                flex: 1,
                fontSize: 13,
                color: '#1e40af',
              }}>
                Esta acción puede revertirse asignándolo nuevamente
              </Text>
            </View>
          </View>

          {/* Botones */}
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity
              style={{
                flex: 1,
                paddingVertical: 14,
                borderRadius: 10,
                backgroundColor: '#f3f4f6',
                alignItems: 'center',
              }}
              onPress={() => {
                setMostrarModalRevocacion(false);
                setUsuarioARevocar(null);
              }}
              disabled={loadingRevocacion}
              activeOpacity={0.7}
            >
              <Text style={{
                fontSize: 16,
                fontWeight: '600',
                color: '#4b5563',
              }}>
                Cancelar
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                flex: 1,
                paddingVertical: 14,
                borderRadius: 10,
                backgroundColor: loadingRevocacion ? '#fca5a5' : '#ef4444',
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'center',
                gap: 8,
              }}
              onPress={confirmarRevocacion}
              disabled={loadingRevocacion}
              activeOpacity={0.7}
            >
              {loadingRevocacion ? (
                <>
                  <ActivityIndicator size="small" color="#ffffff" />
                  <Text style={{
                    fontSize: 16,
                    fontWeight: '600',
                    color: '#ffffff',
                  }}>
                    Revocando...
                  </Text>
                </>
              ) : (
                <>
                  <Ionicons name="trash-outline" size={20} color="#ffffff" />
                  <Text style={{
                    fontSize: 16,
                    fontWeight: '600',
                    color: '#ffffff',
                  }}>
                    Revocar
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.wrapper}>

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
        style={[
          styles.toggleButton,
          { left: sidebarOpen ? 296 : 16 }
        ]}
        onPress={() => setSidebarOpen(!sidebarOpen)}
      >
        <Ionicons name={sidebarOpen ? "close" : "menu"} size={24} color="#ffffff" />
      </TouchableOpacity>

      {/* ============ CONTENIDO PRINCIPAL ============ */}
      <View style={styles.mainContent}>
        <ScrollView
          style={styles.container}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="swap-horizontal" size={28} color="#3b82f6" />
              </View>
              <View>
                <Text style={styles.title}>Asignacion por Departamentos</Text>
                <Text style={styles.subtitle}>
                  {departamentos.length} departamentos • {usuarios.length} usuarios en departamento seleccionado
                </Text>
              </View>
            </View>

            {selectedDepartamento && (
              <TouchableOpacity
                style={styles.resetButton}
                onPress={resetSeleccion}
              >
                <Ionicons name="close-circle" size={20} color="#ef4444" />
                <Text style={styles.resetButtonText}>Limpiar Selección</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Breadcrumb */}
          {selectedDepartamento && (
            <View style={styles.breadcrumb}>
              <TouchableOpacity
                style={styles.breadcrumbItem}
                onPress={resetSeleccion}
              >
                <Ionicons name="home" size={16} color="#3b82f6" />
                <Text style={styles.breadcrumbText}>Departamentos</Text>
              </TouchableOpacity>
              <Ionicons name="chevron-forward" size={16} color="#94a3b8" />
              <View style={styles.breadcrumbItem}>
                <Text style={styles.breadcrumbTextActive}>
                  {departamentoActual?.nombre}
                </Text>
              </View>
            </View>
          )}

          {/* PASO 1: Seleccionar Departamento */}
          {!selectedDepartamento ? (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.stepBadge}>
                  <Text style={styles.stepNumber}>1</Text>
                </View>
                <Text style={styles.sectionTitle}>Selecciona un Departamento</Text>
              </View>

              {/* Búsqueda Departamentos */}
              <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#94a3b8" />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Buscar departamento por nombre, código o facultad..."
                  placeholderTextColor="#94a3b8"
                  value={busquedaDept}
                  onChangeText={(text) => setBusquedaDept(sanitizeInput(text))}
                  maxLength={100}
                />
                {busquedaDept.length > 0 && (
                  <TouchableOpacity onPress={() => setBusquedaDept('')}>
                    <Ionicons name="close-circle" size={20} color="#94a3b8" />
                  </TouchableOpacity>
                )}
              </View>

              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#3b82f6" />
                  <Text style={styles.loadingText}>Cargando departamentos...</Text>
                </View>
              ) : departamentosFiltrados.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Ionicons name="business-outline" size={64} color="#cbd5e1" />
                  <Text style={styles.emptyTitle}>No se encontraron departamentos</Text>
                  <Text style={styles.emptyText}>
                    {busquedaDept ? 'Intenta con otros términos de búsqueda' : 'No hay departamentos disponibles'}
                  </Text>
                </View>
              ) : (
                <View style={styles.departamentosGrid}>
                  {departamentosFiltrados.map((dept) => (
                    <DepartamentoCard
                      key={dept.id_departamento}
                      departamento={dept}
                      onPress={() => setSelectedDepartamento(dept.id_departamento)}
                      isSelected={false}
                    />
                  ))}
                </View>
              )}
            </View>
          ) : (
            <>
              {/* PASO 2: Ver Usuarios del Departamento */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={styles.stepBadge}>
                    <Text style={styles.stepNumber}>2</Text>
                  </View>
                  <View style={styles.sectionTitleContainer}>
                    <Text style={styles.sectionTitle}>Usuarios en {departamentoActual?.nombre}</Text>
                    <Text style={styles.sectionSubtitle}>
                      {usuarios.length} usuarios totales
                      {mostrarCambioDept && ` • ${selectedUsuarios.length} seleccionados`}
                    </Text>
                  </View>
                </View>

                {/* Botones de Acción */}
                <View style={styles.actionButtonsContainer}>
                  <TouchableOpacity
                    style={[styles.actionToggleButton, mostrarCambioDept && styles.actionToggleButtonActive]}
                    onPress={() => {
                      setMostrarCambioDept(!mostrarCambioDept);
                      setMostrarAsignacionSinDept(false);
                      setSelectedUsuarios([]);
                      setNuevoDepartamento(null);
                    }}
                  >
                    <Ionicons name="swap-horizontal" size={20} color={mostrarCambioDept ? "#ffffff" : "#3b82f6"} />
                    <Text style={[styles.actionToggleText, mostrarCambioDept && styles.actionToggleTextActive]}>
                      {mostrarCambioDept ? 'Cancelar Cambio' : 'Cambiar de Departamento'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionToggleButton, mostrarAsignacionSinDept && styles.actionToggleButtonActive]}
                    onPress={() => {
                      setMostrarAsignacionSinDept(!mostrarAsignacionSinDept);
                      setMostrarCambioDept(false);
                      setSelectedUsuarios([]);
                      setNuevoDepartamento(null);

                      if (!mostrarAsignacionSinDept) {
                        cargarUsuariosSinDepartamento();
                      }
                    }}
                  >
                    <Ionicons name="add-circle" size={20} color={mostrarAsignacionSinDept ? "#ffffff" : "#10b981"} />
                    <Text style={[styles.actionToggleText, mostrarAsignacionSinDept && styles.actionToggleTextActive]}>
                      {mostrarAsignacionSinDept ? 'Cancelar Asignación' : 'Asignar Usuarios Sin Departamento'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Mostrar usuarios sin departamento (para asignar) */}
                {mostrarAsignacionSinDept ? (
                  <>
                    <InfoCard
                      icon="information-circle"
                      color="#10b981"
                      text={`Selecciona usuarios sin departamento para asignarlos a ${departamentoActual?.nombre}`}
                    />

                    <TouchableOpacity
                      style={[styles.actionToggleButton]}
                      onPress={() => setMostrarAsignacionSinDept(false)}
                    >
                      <Ionicons name="arrow-back" size={20} color="#3b82f6" />
                      <Text style={styles.actionToggleText}>
                        Volver a Usuarios del Departamento
                      </Text>
                    </TouchableOpacity>

                    {loadingSinDept ? (
                      <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#10b981" />
                        <Text style={styles.loadingText}>Cargando usuarios sin departamento...</Text>
                      </View>
                    ) : usuariosSinDept.length === 0 ? (
                      <View style={styles.emptyContainer}>
                        <Ionicons name="checkmark-circle" size={64} color="#10b981" />
                        <Text style={styles.emptyTitle}>Todos los usuarios tienen departamento</Text>
                      </View>
                    ) : (
                      <>
                        <TouchableOpacity
                          style={styles.selectAllButton}
                          onPress={() => {
                            if (selectedUsuarios.length === usuariosSinDept.length) {
                              setSelectedUsuarios([]);
                            } else {
                              setSelectedUsuarios(usuariosSinDept.map(u => u.id_usuario));
                            }
                          }}
                        >
                          <Ionicons
                            name={selectedUsuarios.length === usuariosSinDept.length ? "checkbox" : "square-outline"}
                            size={20}
                            color="#10b981"
                          />
                          <Text style={styles.selectAllText}>
                            {selectedUsuarios.length === usuariosSinDept.length ? 'Deseleccionar todos' : 'Seleccionar todos'}
                          </Text>
                        </TouchableOpacity>

                        <View style={styles.usuariosList}>
                          {usuariosSinDept.map((usuario) => (
                            <UsuarioCard
                              key={usuario.id_usuario}
                              usuario={usuario}
                              isSelected={selectedUsuarios.includes(usuario.id_usuario)}
                              onPress={() => toggleUsuario(usuario.id_usuario)}
                              showCheckbox={true}
                              showChevron={false}
                              showNoDeptBadge={true}
                              checkboxColor="#10b981"
                              selectedStyle="green"
                            />
                          ))}
                        </View>

                        {selectedUsuarios.length > 0 && (
                          <ResumenCard
                            selectedCount={selectedUsuarios.length}
                            departamentoOrigen={null}
                            departamentoDestino={departamentoActual}
                            loading={loading}
                            onConfirm={handleMoverUsuarios}
                            confirmButtonText={`Confirmar y Asignar ${selectedUsuarios.length} Usuario(s)`}
                            confirmButtonColor="#10b981"
                            isAsignacion={true}
                          />
                        )}
                      </>
                    )}
                  </>
                ) : (
                  /* Mostrar usuarios del departamento actual */
                  <>
                    {/* Búsqueda Usuarios */}
                    <View style={styles.searchContainer}>
                      <Ionicons name="search" size={20} color="#94a3b8" />
                      <TextInput
                        style={styles.searchInput}
                        placeholder="Buscar usuario..."
                        placeholderTextColor="#94a3b8"
                        value={busquedaUsuario}
                        onChangeText={(text) => setBusquedaUsuario(sanitizeInput(text))}
                        maxLength={100}
                      />
                      {busquedaUsuario.length > 0 && (
                        <TouchableOpacity onPress={() => setBusquedaUsuario('')}>
                          <Ionicons name="close-circle" size={20} color="#94a3b8" />
                        </TouchableOpacity>
                      )}
                    </View>

                    {mostrarCambioDept && usuariosFiltrados.length > 0 && (
                      <TouchableOpacity
                        style={styles.selectAllButton}
                        onPress={seleccionarTodos}
                      >
                        <Ionicons
                          name={selectedUsuarios.length === usuariosFiltrados.length ? "checkbox" : "square-outline"}
                          size={20}
                          color="#3b82f6"
                        />
                        <Text style={styles.selectAllText}>
                          {selectedUsuarios.length === usuariosFiltrados.length ? 'Deseleccionar todos' : 'Seleccionar todos'}
                        </Text>
                      </TouchableOpacity>
                    )}

                    {loadingUsuarios ? (
                      <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#3b82f6" />
                        <Text style={styles.loadingText}>Cargando usuarios...</Text>
                      </View>
                    ) : usuariosFiltrados.length === 0 ? (
                      <View style={styles.emptyContainer}>
                        <Ionicons name="people-outline" size={64} color="#cbd5e1" />
                        <Text style={styles.emptyTitle}>No hay usuarios en este departamento</Text>
                        <Text style={styles.emptyText}>
                          {busquedaUsuario ? 'Intenta con otros términos' : 'Este departamento no tiene usuarios asignados'}
                        </Text>
                      </View>
                    ) : (
                      <View style={styles.usuariosList}>
                        {usuariosFiltrados.map((usuario) => {
                          console.log('🔍 Renderizando usuario:', usuario.persona?.nombre, 'showEdit:', !mostrarCambioDept);
                          return (
                            <UsuarioCard
                              key={usuario.id_usuario}
                              usuario={usuario}
                              isSelected={selectedUsuarios.includes(usuario.id_usuario)}
                              onPress={() => {
                                if (mostrarCambioDept) {
                                  toggleUsuario(usuario.id_usuario);
                                } else {
                                  setUsuarioSeleccionado(usuario);
                                  setMostrarDetalleUsuario(true);
                                }
                              }}
                              showCheckbox={mostrarCambioDept}
                              showChevron={false}
                              showEditPermisosButton={!mostrarCambioDept}
                              onPressEditPermisos={handleEditarPermisos}
                            />
                          );
                        })}
                      </View>
                    )}
                  </>
                )}
              </View>

              {/* PASO 3: Seleccionar Departamento Destino */}
              {selectedUsuarios.length > 0 && mostrarCambioDept && (
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <View style={styles.stepBadge}>
                      <Text style={styles.stepNumber}>3</Text>
                    </View>
                    <Text style={styles.sectionTitle}>Selecciona Departamento Destino</Text>
                  </View>

                  <View style={styles.departamentosGrid}>
                    {departamentos
                      .filter(d => d.id_departamento !== selectedDepartamento)
                      .map((dept) => (
                        <DepartamentoCard
                          key={dept.id_departamento}
                          departamento={dept}
                          onPress={() => setNuevoDepartamento(dept.id_departamento)}
                          isSelected={nuevoDepartamento === dept.id_departamento}
                          showRadio={true}
                        />
                      ))}
                  </View>
                </View>
              )}

              {/* Resumen del Cambio */}
              {nuevoDepartamento && departamentoActual && departamentoDestino && selectedUsuarios.length > 0 && (
                <ResumenCard
                  selectedCount={selectedUsuarios.length}
                  departamentoOrigen={departamentoActual}
                  departamentoDestino={departamentoDestino}
                  loading={loading}
                  onConfirm={handleMoverUsuarios}
                  confirmButtonText="Confirmar cambio de departamento"
                />
              )}
            </>
          )}

        </ScrollView>
      </View>

      {/* Modal de Detalle de Usuario */}
      {mostrarDetalleUsuario && usuarioSeleccionado && (
        <UsuarioDetalleModal
          usuario={usuarioSeleccionado}
          onClose={() => {
            setMostrarDetalleUsuario(false);
            setUsuarioSeleccionado(null);
          }}
          onEditarPermisos={(usuario) => {
            setMostrarDetalleUsuario(false);
            handleEditarPermisos(usuario);
          }}
          onRevocarAsignacion={handleRevocarAsignacion}
        />
      )}

      {/* ✅ NUEVO: Modal de Permisos */}
      <PermisosModal
        isOpen={mostrarModalPermisos}
        onClose={() => {
          setMostrarModalPermisos(false);
          setModoEdicion(false);
          setUsuarioEditandoPermisos(null);
          setPermisosActuales(null);
        }}
        onConfirm={handleConfirmarConPermisos}
        selectedCount={modoEdicion ? 1 : selectedUsuarios.length}
        departamentoDestino={modoEdicion ? usuarioEditandoPermisos?.usuario?.departamento : departamentoActual}
        permisosIniciales={modoEdicion ? permisosActuales : null}
        modoEdicion={modoEdicion}
        usuarioEditando={usuarioEditandoPermisos?.usuario}
      />
      {/* ✅ Modal de Revocación */}
      <ModalRevocacion />

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
            top: 0,
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
}
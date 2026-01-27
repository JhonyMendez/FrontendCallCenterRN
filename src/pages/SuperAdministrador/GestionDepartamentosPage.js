import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { agenteService } from '../../api/services/agenteService';
import { departamentoService } from '../../api/services/departamentoService';
import { usuarioService } from '../../api/services/usuarioService';
import SuperAdminSidebar from '../../components/Sidebar/sidebarSuperAdmin';
import { contentStyles } from '../../components/Sidebar/SidebarSuperAdminStyles';
import GestionDepartamentosCard from '../../components/SuperAdministrador/GestionDepartamentosCard';
import { styles } from '../../styles/gestionDepartamentosStyles';

// 🔐 ============ UTILIDADES DE SEGURIDAD ANTIHACKING ============
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
};

const isWeb = Platform.OS === 'web';
const { width } = Dimensions.get('window');
const isMobile = width < 768;

// Componente Tooltip para Web y Móvil
function TooltipIcon({ text }) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <View style={{ position: 'relative' }}>
      <TouchableOpacity
        onPress={() => setShowTooltip(!showTooltip)} // Para móvil (tap)
        onMouseEnter={() => !isMobile && setShowTooltip(true)} // Para web (hover)
        onMouseLeave={() => !isMobile && setShowTooltip(false)} // Para web
        style={{
          width: 18,
          height: 18,
          borderRadius: 9,
          backgroundColor: 'rgba(102, 126, 234, 0.2)',
          justifyContent: 'center',
          alignItems: 'center',
          borderWidth: 1,
          borderColor: 'rgba(102, 126, 234, 0.4)',
        }}
      >
        <Text style={{ color: '#667eea', fontSize: 12, fontWeight: 'bold' }}>?</Text>
      </TouchableOpacity>

      {showTooltip && (
        <>
          {/* Overlay para cerrar al tocar fuera (solo móvil) */}
          {isMobile && (
            <TouchableOpacity
              onPress={() => setShowTooltip(false)}
              style={{
                position: 'absolute',
                top: -1000,
                left: -1000,
                right: -1000,
                bottom: -1000,
                zIndex: 999,
              }}
              activeOpacity={1}
            />
          )}

          {/* Tooltip */}
          <View style={{
            position: 'absolute',
            top: isMobile ? 25 : -5,
            left: isMobile ? -100 : 25,
            backgroundColor: '#1a1a2e',
            padding: 12,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: 'rgba(102, 126, 234, 0.3)',
            minWidth: isMobile ? 250 : 200,
            maxWidth: isMobile ? 300 : 280,
            zIndex: 1000,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
          }}>
            {/* Flecha indicadora */}
            <View style={{
              position: 'absolute',
              top: isMobile ? -6 : 8,
              left: isMobile ? '50%' : -6,
              marginLeft: isMobile ? -6 : 0,
              width: 12,
              height: 12,
              backgroundColor: '#1a1a2e',
              borderTopWidth: 1,
              borderLeftWidth: 1,
              borderColor: 'rgba(102, 126, 234, 0.3)',
              transform: [{ rotate: isMobile ? '45deg' : '-45deg' }],
            }} />

            <Text style={{
              color: 'rgba(255, 255, 255, 0.9)',
              fontSize: 12,
              lineHeight: 18,
            }}>
              {text}
            </Text>

            {/* Botón cerrar solo en móvil */}
            {isMobile && (
              <TouchableOpacity
                onPress={() => setShowTooltip(false)}
                style={{
                  position: 'absolute',
                  top: 4,
                  right: 4,
                  width: 20,
                  height: 20,
                  borderRadius: 10,
                  backgroundColor: 'rgba(239, 68, 68, 0.2)',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Ionicons name="close" size={14} color="#ef4444" />
              </TouchableOpacity>
            )}
          </View>
        </>
      )}
    </View>
  );
}

export default function GestionDepartamentosPage() {
  // 🔐 ============ RATE LIMITER ============
  const rateLimiterRef = React.useRef(SecurityUtils.createRateLimiter(5, 60000)); // 5 intentos en 60 segundos

  // ============ STATE ============
  const [departamentos, setDepartamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingDepartamento, setEditingDepartamento] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [errors, setErrors] = useState({});
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [departamentoToDelete, setDepartamentoToDelete] = useState(null);
  const [agentesGlobal, setAgentesGlobal] = useState([]);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [agentesAsignados, setAgentesAsignados] = useState([]);
  const [usuariosAsignados, setUsuariosAsignados] = useState([]);

  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    codigo: '',
    email: '',
    telefono: '',
    ubicacion: '',
    facultad: '',
  });

  // ============ FUNCIONES DE VALIDACIÓN Y SEGURIDAD ============

  const validateEmail = (email) => {
    if (!email) return true; // Email es opcional
    // Detectar intentos de XSS o SQL Injection
    if (SecurityUtils.detectXssAttempt(email) || SecurityUtils.detectSqlInjection(email)) {
      SecurityUtils.logSecurityEvent('EMAIL_VALIDATION_SUSPICIOUS', { email });
      return false;
    }
    return SecurityUtils.isValidEmail(email);
  };

  const validatePhone = (phone) => {
    if (!phone) return true; // Teléfono es opcional
    if (SecurityUtils.detectXssAttempt(phone) || SecurityUtils.detectSqlInjection(phone)) {
      SecurityUtils.logSecurityEvent('PHONE_VALIDATION_SUSPICIOUS', { phone });
      return false;
    }
    const phoneRegex = /^[0-9+\-\s()]{7,15}$/;
    return phoneRegex.test(phone);
  };

  const validateCodigo = (codigo) => {
    if (!codigo) return false;

    // 🔐 PRIMERO validar formato permitido
    const codigoRegex = /^[A-Za-z0-9_-]+$/;
    if (!codigoRegex.test(codigo)) {
      return false;
    }

    // 🔐 LUEGO detectar patrones sospechosos (solo XSS, NO SQL injection)
    // Los guiones normales (-) son válidos en códigos, así que NO validamos SQL injection aquí
    if (SecurityUtils.detectXssAttempt(codigo)) {
      SecurityUtils.logSecurityEvent('CODIGO_VALIDATION_SUSPICIOUS', { codigo });
      return false;
    }

    return true;
  };

  const validateForm = () => {
    const newErrors = {};

    // 🔐 Detectar intentos de ataque en todos los campos
    Object.keys(formData).forEach(key => {
      const value = formData[key];
      if (value && typeof value === 'string') {
        if (SecurityUtils.detectXssAttempt(value)) {
          SecurityUtils.logSecurityEvent('XSS_ATTEMPT_DETECTED', { field: key, value: value.substring(0, 50) });
          newErrors[key] = '⚠️ Contenido sospechoso detectado en este campo';
        }
        if (SecurityUtils.detectSqlInjection(value)) {
          SecurityUtils.logSecurityEvent('SQL_INJECTION_ATTEMPT_DETECTED', { field: key, value: value.substring(0, 50) });
          newErrors[key] = '⚠️ Caracteres sospechosos detectados en este campo';
        }
      }
    });

    // Si hay intentos de ataque, detener validación
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return false;
    }

    // Nombre (requerido, mínimo 5 caracteres, máximo 100)
    if (!formData.nombre || formData.nombre.trim().length === 0) {
      newErrors.nombre = 'El nombre es obligatorio';
    } else if (formData.nombre.trim().length < 5) {
      newErrors.nombre = 'El nombre debe tener al menos 5 caracteres';
    } else if (!SecurityUtils.validateStringLength(formData.nombre, 100)) {
      newErrors.nombre = 'El nombre no puede exceder 100 caracteres';
    }

    // Código (requerido, mínimo 3 caracteres, máximo 50, solo alfanumérico)
    if (!formData.codigo || formData.codigo.trim().length === 0) {
      newErrors.codigo = 'El código es obligatorio';
    } else if (formData.codigo.trim().length < 3) {
      newErrors.codigo = 'El código debe tener al menos 3 caracteres';
    } else if (!SecurityUtils.validateStringLength(formData.codigo, 50)) {
      newErrors.codigo = 'El código no puede exceder 50 caracteres';
    } else if (!validateCodigo(formData.codigo)) {
      newErrors.codigo = 'El código solo puede contener letras, números, guiones y guiones bajos';
    }

    // Facultad (opcional, máximo 100 caracteres)
    if (formData.facultad && !SecurityUtils.validateStringLength(formData.facultad, 100)) {
      newErrors.facultad = 'La facultad no puede exceder 100 caracteres';
    }

    // Email (opcional, pero debe ser válido si se proporciona)
    if (formData.email && !validateEmail(formData.email)) {
      newErrors.email = 'El email no tiene un formato válido';
    }
    if (formData.email && !SecurityUtils.validateStringLength(formData.email, 100)) {
      newErrors.email = 'El email no puede exceder 100 caracteres';
    }

    // Teléfono (opcional, pero debe ser válido si se proporciona)
    if (formData.telefono && !validatePhone(formData.telefono)) {
      newErrors.telefono = 'El teléfono no tiene un formato válido';
    }
    if (formData.telefono && !SecurityUtils.validateStringLength(formData.telefono, 20)) {
      newErrors.telefono = 'El teléfono no puede exceder 20 caracteres';
    }

    // Ubicación (opcional, máximo 200 caracteres)
    if (formData.ubicacion && !SecurityUtils.validateStringLength(formData.ubicacion, 200)) {
      newErrors.ubicacion = 'La ubicación no puede exceder 200 caracteres';
    }

    // Descripción (opcional, máximo 500 caracteres)
    if (formData.descripcion && !SecurityUtils.validateStringLength(formData.descripcion, 500)) {
      newErrors.descripcion = 'La descripción no puede exceder 500 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ============ EFFECTS ============
  useEffect(() => {
    cargarDepartamentos();
  }, []);

  useEffect(() => {
    cargarAgentes();
  }, []);

  // ============ FUNCIONES ============
  const cargarDepartamentos = async () => {
    try {
      setLoading(true);

      // 🔐 Validar parámetros antes de enviar
      const params = { activo: true };

      if (typeof params.activo !== 'boolean') {
        SecurityUtils.logSecurityEvent('INVALID_LOAD_PARAMS', { params });
        throw new Error('Parámetros de carga inválidos');
      }

      const data = await departamentoService.getAll(params);

      // 🔐 Validar respuesta
      if (!Array.isArray(data) && data !== null && typeof data !== 'object') {
        SecurityUtils.logSecurityEvent('INVALID_LOAD_RESPONSE', { data: typeof data });
        throw new Error('Respuesta del servidor inválida');
      }

      setDepartamentos(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error al cargar departamentos:', err);
      SecurityUtils.logSecurityEvent('LOAD_DEPARTAMENTOS_ERROR', { error: err.message });
      Alert.alert('Error', 'No se pudieron cargar los departamentos');
      setDepartamentos([]);
    } finally {
      setLoading(false);
    }
  };

  const cargarAgentes = async () => {
    try {
      console.log('📥 Cargando agentes para validación...');

      // 🔐 Agregar límites razonables para prevenir DoS
      const params = {
        skip: 0,
        limit: 1000 // Límite máximo razonable
      };

      // 🔐 Validar parámetros
      if (params.skip < 0 || params.limit < 1 || params.limit > 1000) {
        SecurityUtils.logSecurityEvent('INVALID_AGENTES_PARAMS', { params });
        throw new Error('Parámetros de carga inválidos');
      }

      const data = await agenteService.getAll(params);

      // 🔐 Validar y normalizar respuesta
      let agentesArray = [];
      if (Array.isArray(data)) {
        agentesArray = data;
      } else if (data && Array.isArray(data.data)) {
        agentesArray = data.data;
      } else if (data && typeof data === 'object') {
        SecurityUtils.logSecurityEvent('UNEXPECTED_AGENTES_RESPONSE', {
          keys: Object.keys(data)
        });
      }

      setAgentesGlobal(agentesArray);
      console.log('✅ Agentes cargados:', agentesArray.length);
    } catch (err) {
      console.error('Error al cargar agentes:', err);
      SecurityUtils.logSecurityEvent('LOAD_AGENTES_ERROR', { error: err.message });
      setAgentesGlobal([]);
    }
  };

  const handleSubmit = async () => {
    // Validar formulario PRIMERO (sin consumir rate limit)
    if (!validateForm()) {
      Alert.alert('Error de validación', 'Por favor, corrige los errores en el formulario');
      SecurityUtils.logSecurityEvent('FORM_VALIDATION_FAILED', { errors: Object.keys(errors) });
      return;
    }

    // 🔐 Rate limiting - máximo 5 intentos por minuto (DESPUÉS de validación)
    if (!rateLimiterRef.current.isAllowed('handleSubmit')) {
      SecurityUtils.logSecurityEvent('RATE_LIMIT_SUBMIT', { timestamp: new Date() });
      Alert.alert('⚠️ Demasiados intentos', 'Por favor, espera un momento antes de intentar de nuevo');
      return;
    }

    try {
      // Sanitizar todos los inputs antes de enviar usando SecurityUtils
      const sanitizedData = {
        nombre: SecurityUtils.sanitizeInput(formData.nombre),
        codigo: SecurityUtils.sanitizeInput(formData.codigo),
        facultad: SecurityUtils.sanitizeInput(formData.facultad),
        email: SecurityUtils.sanitizeInput(formData.email),
        telefono: SecurityUtils.sanitizeInput(formData.telefono),
        ubicacion: SecurityUtils.sanitizeInput(formData.ubicacion),
        descripcion: SecurityUtils.sanitizeInput(formData.descripcion),
      };

      // 🔐 Log evento de operación
      if (editingDepartamento) {
        SecurityUtils.logSecurityEvent('DEPARTAMENTO_UPDATE_ATTEMPT', {
          id: editingDepartamento.id_departamento,
          fields: Object.keys(sanitizedData)
        });
        await departamentoService.update(editingDepartamento.id_departamento, sanitizedData);
        setSuccessMessage('✅ Departamento actualizado exitosamente');
        SecurityUtils.logSecurityEvent('DEPARTAMENTO_UPDATED_SUCCESS', {
          id: editingDepartamento.id_departamento
        });
      } else {
        SecurityUtils.logSecurityEvent('DEPARTAMENTO_CREATE_ATTEMPT', {
          fields: Object.keys(sanitizedData)
        });
        await departamentoService.create(sanitizedData);
        setSuccessMessage('✅ Departamento creado exitosamente');
      }

      // Cerrar modal primero
      setShowModal(false);
      resetForm();

      // Mostrar mensaje de éxito y recargar
      setShowSuccessMessage(true);
      cargarDepartamentos();
      cargarAgentes();

      // Ocultar mensaje después de 3 segundos
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000);

    } catch (err) {
      console.error('Error al guardar:', err);

      // Mostrar mensaje específico del backend
      const errorMessage = err?.message || err?.data?.message || 'No se pudo guardar el departamento';
      Alert.alert('Error', errorMessage);
    }
  };

  const handleEdit = (departamento) => {
    setEditingDepartamento(departamento);
    setFormData({
      nombre: departamento.nombre || '',
      descripcion: departamento.descripcion || '',
      codigo: departamento.codigo || '',
      email: departamento.email || '',
      telefono: departamento.telefono || '',
      ubicacion: departamento.ubicacion || '',
      facultad: departamento.facultad || '',
    });
    setErrors({});
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    try {
      // 🔐 VALIDAR ID PRIMERO (antes de rate limiting)
      if (!id || (typeof id !== 'number' && typeof id !== 'string')) {
        SecurityUtils.logSecurityEvent('INVALID_DELETE_ID_TYPE', { id, type: typeof id });
        Alert.alert('Error', 'ID de departamento inválido');
        return;
      }

      const numId = parseInt(id, 10);
      if (isNaN(numId) || numId <= 0) {
        SecurityUtils.logSecurityEvent('INVALID_DELETE_ID_VALUE', { id, numId });
        Alert.alert('Error', 'ID de departamento inválido');
        return;
      }

      // 🔐 Rate limiting para operaciones de eliminación
      if (!rateLimiterRef.current.isAllowed(`delete_${numId}`)) {
        SecurityUtils.logSecurityEvent('RATE_LIMIT_DELETE', { departamentoId: numId });
        Alert.alert('⚠️ Demasiados intentos', 'Por favor, espera un momento antes de intentar de nuevo');
        return;
      }

      SecurityUtils.logSecurityEvent('DELETE_VERIFICATION_START', {
        departamentoId: numId,
        timestamp: new Date().toISOString()
      });

      console.log('🔍 Verificando departamento ID:', numId);
      console.log('📊 Agentes disponibles:', agentesGlobal.length);

      // ✅ VALIDACIÓN 1: Verificar agentes asignados (ACTIVOS y NO ELIMINADOS)
      const agentesActivosConEsteDepartamento = agentesGlobal.filter(agente => {
        const tieneDepto = agente.id_departamento &&
          agente.id_departamento.toString() === numId.toString();
        const estaActivo = agente.activo === true || agente.activo === 1;
        const noEstaEliminado = !agente.eliminado &&
          agente.eliminado !== 1 &&
          !agente.deleted_at;

        return tieneDepto && estaActivo && noEstaEliminado;
      });

      const cantidadAgentesActivos = agentesActivosConEsteDepartamento.length;

      console.log('📊 Agentes activos NO eliminados:', cantidadAgentesActivos);

      // ✅ VALIDACIÓN 2: Verificar usuarios asignados (NUEVO)
      let usuariosConEsteDepartamento = [];
      try {
        const responseUsuarios = await usuarioService.listarCompleto({
          id_departamento: numId,
          estado: 'activo'
        });

        usuariosConEsteDepartamento = responseUsuarios?.usuarios || [];

        console.log('📊 Usuarios asignados al departamento:', usuariosConEsteDepartamento.length);
      } catch (error) {
        console.error('❌ Error al verificar usuarios:', error);
        SecurityUtils.logSecurityEvent('USER_VERIFICATION_ERROR', {
          departamentoId: numId,
          error: error.message
        });
        Alert.alert(
          'Error',
          'No se pudo verificar los usuarios asignados. Por seguridad, no se permitirá la eliminación.'
        );
        return;
      }

      // ✅ Si tiene usuarios asignados, mostrar modal de advertencia ESPECÍFICO
      if (usuariosConEsteDepartamento.length > 0) {
        console.log('⚠️ No se puede eliminar - hay usuarios asignados');
        SecurityUtils.logSecurityEvent('DELETE_BLOCKED_USERS_ASSIGNED', {
          departamentoId: numId,
          usuariosCount: usuariosConEsteDepartamento.length
        });
        setUsuariosAsignados(usuariosConEsteDepartamento);
        setShowWarningModal(true);
        return;
      }

      // ✅ Si tiene agentes ACTIVOS y NO ELIMINADOS, mostrar modal de advertencia
      if (cantidadAgentesActivos > 0) {
        console.log('⚠️ No se puede eliminar - hay agentes activos asignados');
        SecurityUtils.logSecurityEvent('DELETE_BLOCKED_AGENTS_ASSIGNED', {
          departamentoId: numId,
          agentesCount: cantidadAgentesActivos
        });
        setAgentesAsignados(agentesActivosConEsteDepartamento);
        setShowWarningModal(true);
        return;
      }

      // ✅ Si NO tiene usuarios NI agentes activos, permitir eliminación
      console.log('✅ Se puede eliminar - no hay usuarios ni agentes activos');
      SecurityUtils.logSecurityEvent('DELETE_ALLOWED', { departamentoId: numId });
      setDepartamentoToDelete(numId);
      setShowDeleteModal(true);

    } catch (err) {
      console.error('❌ Error al verificar dependencias:', err);
      SecurityUtils.logSecurityEvent('DELETE_VERIFICATION_ERROR', {
        error: err.message,
        stack: err.stack
      });
      Alert.alert(
        'Error',
        'No se pudo verificar las dependencias del departamento. Por seguridad, no se permitirá la eliminación.'
      );
    }
  };

  // Nueva función para confirmar la eliminación
  const confirmDelete = async () => {
    // 🔐 Validar que existe departamentoToDelete
    if (!departamentoToDelete) {
      SecurityUtils.logSecurityEvent('DELETE_WITHOUT_ID_ATTEMPT', { timestamp: new Date() });
      Alert.alert('Error', 'No se especificó el departamento a eliminar');
      return;
    }

    // 🔐 Validar tipo y valor del ID
    const numId = parseInt(departamentoToDelete, 10);
    if (isNaN(numId) || numId <= 0) {
      SecurityUtils.logSecurityEvent('INVALID_DELETE_CONFIRMATION_ID', {
        id: departamentoToDelete,
        numId,
        type: typeof departamentoToDelete
      });
      Alert.alert('Error', 'ID inválido para eliminación');
      setShowDeleteModal(false);
      setDepartamentoToDelete(null);
      return;
    }

    try {
      SecurityUtils.logSecurityEvent('DEPARTAMENTO_DELETE_CONFIRMED', {
        id: numId,
        timestamp: new Date().toISOString()
      });

      // ✅ ELIMINADO LÓGICO: actualizar activo a false
      await departamentoService.update(numId, { activo: false });

      SecurityUtils.logSecurityEvent('DEPARTAMENTO_DELETED_SUCCESS', {
        id: numId,
        timestamp: new Date().toISOString()
      });

      setSuccessMessage('🗑️ Departamento eliminado correctamente');
      setShowSuccessMessage(true);

      // Cerrar modal de confirmación
      setShowDeleteModal(false);
      setDepartamentoToDelete(null);

      // Recargar lista (ahora sin el departamento eliminado)
      cargarDepartamentos();
      cargarAgentes();

      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000);
    } catch (err) {
      console.error('Error al eliminar:', err);
      SecurityUtils.logSecurityEvent('DEPARTAMENTO_DELETE_ERROR', {
        id: numId,
        error: err.message
      });
      const errorMessage = err?.message || err?.data?.message || 'No se pudo eliminar el departamento';
      Alert.alert('Error', errorMessage);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setDepartamentoToDelete(null);
  };



  const resetForm = () => {
    setFormData({
      nombre: '',
      descripcion: '',
      codigo: '',
      email: '',
      telefono: '',
      ubicacion: '',
      facultad: '',
    });
    setEditingDepartamento(null);
    setErrors({});
  };

  const handleInputChange = (field, value) => {
    // 🔐 Validar que value es string y limitar longitud máxima
    if (typeof value !== 'string') {
      SecurityUtils.logSecurityEvent('NON_STRING_INPUT_ATTEMPT', { field, type: typeof value });
      return;
    }

    // 🔐 Limitar longitud absoluta (máximo 1000 caracteres para prevenir overflow)
    if (value.length > 1000) {
      SecurityUtils.logSecurityEvent('INPUT_LENGTH_EXCEEDED', {
        field,
        length: value.length
      });
      Alert.alert('⚠️ Texto demasiado largo', 'El contenido excede el límite permitido');
      return;
    }

    // Limpiar error del campo cuando el usuario escribe
    if (errors[field]) {
      setErrors({ ...errors, [field]: null });
    }

    // ✅ NO sanitizar aquí, dejar escribir libremente
    // La sanitización se hace al enviar (handleSubmit)
    setFormData({ ...formData, [field]: value });
  };

  // Sanitizar búsqueda para prevenir XSS y SQL Injection
  const handleSearchChange = (text) => {
    // 🔐 Detectar intentos de ataque en búsqueda
    if (SecurityUtils.detectXssAttempt(text)) {
      SecurityUtils.logSecurityEvent('XSS_ATTEMPT_IN_SEARCH', {
        input: text.substring(0, 50),
        timestamp: new Date().toISOString()
      });
      Alert.alert('⚠️ Contenido sospechoso', 'Se detectó contenido no permitido en la búsqueda');
      return;
    }

    if (SecurityUtils.detectSqlInjection(text)) {
      SecurityUtils.logSecurityEvent('SQL_INJECTION_ATTEMPT_IN_SEARCH', {
        input: text.substring(0, 50),
        timestamp: new Date().toISOString()
      });
      Alert.alert('⚠️ Caracteres sospechosos', 'Se detectaron caracteres no permitidos en la búsqueda');
      return;
    }

    // Sanitizar normalmente
    const sanitized = SecurityUtils.sanitizeInput(text);
    setSearchTerm(sanitized);
  };

  const filteredDepartamentos = departamentos.filter(
    (dept) =>
      dept.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dept.codigo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dept.facultad?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ============ RENDER ============
  return (
    <View style={contentStyles.wrapper}>

      {/* ============ SIDEBAR WEB ============ */}
      {isWeb && (
        <SuperAdminSidebar
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
          onNavigate={() => setSidebarOpen(false)}
        />
      )}

      {/* ============ BOTÓN TOGGLE SIDEBAR ============ */}
      <TouchableOpacity
        style={{
          position: 'absolute',
          top: 16,
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
        <View style={styles.container}>
          {/* ============ HEADER ============ */}
          <View style={[
            styles.header,
            isMobile && { paddingTop: 60 }
          ]}>
            <View style={styles.headerLeft}>
              <Text style={[
                styles.title,
                isMobile && { fontSize: 20 }
              ]}>
                🏢 Departamentos
              </Text>
              <Text style={[
                styles.subtitle,
                isMobile && { fontSize: 13 }
              ]}>
                {departamentos.length} {departamentos.length === 1 ? 'departamento registrado' : 'departamentos registrados'}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => {
                resetForm();
                setShowModal(true);
              }}
              activeOpacity={0.8}
            >
              <Ionicons name="add-circle" size={22} color="white" />
              <Text style={styles.buttonText}>Nuevo</Text>
            </TouchableOpacity>
          </View>

          {/* ============ MENSAJE DE ÉXITO ============ */}
          {showSuccessMessage && (
            <View style={{
              margin: 16,
              backgroundColor: 'rgba(16, 185, 129, 0.2)',
              borderLeftWidth: 4,
              borderLeftColor: '#10b981',
              borderRadius: 12,
              padding: 16,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
              shadowColor: '#10b981',
              shadowOpacity: 0.3,
              shadowRadius: 8,
              shadowOffset: { width: 0, height: 4 },
              elevation: 5,
            }}>
              <View style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: 'rgba(16, 185, 129, 0.3)',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
                <Ionicons name="checkmark-circle" size={24} color="#10b981" />
              </View>
              <Text style={{
                flex: 1,
                color: '#10b981',
                fontSize: 15,
                fontWeight: '700',
              }}>
                {successMessage}
              </Text>
            </View>
          )}

          {/* ============ BÚSQUEDA ============ */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="rgba(255, 255, 255, 0.5)" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar por nombre, código o facultad..."
              placeholderTextColor="rgba(255, 255, 255, 0.4)"
              value={searchTerm}
              onChangeText={handleSearchChange}
              maxLength={100}
            />
            {searchTerm.length > 0 && (
              <TouchableOpacity onPress={() => setSearchTerm('')}>
                <Ionicons name="close-circle" size={20} color="rgba(255, 255, 255, 0.5)" />
              </TouchableOpacity>
            )}
          </View>

          {/* ============ LISTA ============ */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#667eea" />
              <Text style={styles.loadingText}>Cargando departamentos...</Text>
            </View>
          ) : (
            <FlatList
              data={filteredDepartamentos}
              keyExtractor={(item) => item.id_departamento?.toString() || Math.random().toString()}
              renderItem={({ item }) => (
                <GestionDepartamentosCard
                  departamento={item}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              )}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Ionicons name="folder-open-outline" size={80} color="rgba(255, 255, 255, 0.2)" />
                  <Text style={styles.emptyText}>No se encontraron departamentos</Text>
                  <Text style={{ color: 'rgba(255, 255, 255, 0.3)', marginTop: 8, fontSize: 14 }}>
                    {searchTerm ? 'Intenta con otros términos de búsqueda' : 'Crea tu primer departamento'}
                  </Text>
                </View>
              }
            />
          )}

          {/* ============ MODAL FORMULARIO ============ */}
          <Modal visible={showModal} animationType="fade" transparent>
            <View style={styles.modalOverlay}>
              <View style={styles.modal}>

                {/* Header del Modal */}
                <View style={styles.modalHeader}>
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: isMobile ? 8 : 12,
                    flex: 1
                  }}>
                    <View style={{
                      width: isMobile ? 40 : 48,
                      height: isMobile ? 40 : 48,
                      borderRadius: 14,
                      backgroundColor: 'rgba(102, 126, 234, 0.3)',
                      justifyContent: 'center',
                      alignItems: 'center',
                      shadowColor: '#667eea',
                      shadowOpacity: 0.5,
                      shadowRadius: 8,
                      shadowOffset: { width: 0, height: 4 },
                      elevation: 6,
                    }}>
                      <Ionicons
                        name={editingDepartamento ? "create-outline" : "add-circle-outline"}
                        size={isMobile ? 24 : 28}
                        color="#667eea"
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[
                        styles.modalTitle,
                        isMobile && { fontSize: 16 }
                      ]}>
                        {editingDepartamento ? 'Editar Departamento' : 'Nuevo Departamento'}
                      </Text>
                      <Text style={{
                        color: 'rgba(255, 255, 255, 0.5)',
                        fontSize: isMobile ? 11 : 12,
                        marginTop: 2
                      }}>
                        {editingDepartamento ? 'Modifica la información' : 'Completa los campos'}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    style={{
                      width: isMobile ? 36 : 40,
                      height: isMobile ? 36 : 40,
                      borderRadius: 12,
                      backgroundColor: 'rgba(239, 68, 68, 0.15)',
                      justifyContent: 'center',
                      alignItems: 'center',
                      borderWidth: 1,
                      borderColor: 'rgba(239, 68, 68, 0.3)',
                      marginLeft: isMobile ? 8 : 0,
                    }}
                  >
                    <Ionicons name="close" size={isMobile ? 20 : 22} color="#ef4444" />
                  </TouchableOpacity>
                </View>

                {/* Contenido del Modal */}
                <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>

                  {/* Nombre */}
                  <View style={styles.formGroup}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                      <Ionicons name="text" size={16} color="#667eea" />
                      <Text style={styles.label}>
                        Nombre <Text style={styles.required}>*</Text>
                      </Text>
                      <TooltipIcon text="Ingresa el nombre completo del departamento. Debe tener entre 5 y 100 caracteres. Ejemplo: Departamento de Sistemas y Tecnología" />
                    </View>
                    <TextInput
                      style={[styles.input, errors.nombre && { borderColor: '#ef4444', borderWidth: 2 }]}
                      value={formData.nombre}
                      onChangeText={(text) => handleInputChange('nombre', text)}
                      placeholder="Ej: Departamento de Sistemas"
                      placeholderTextColor="rgba(255, 255, 255, 0.3)"
                      maxLength={100}
                    />
                    {errors.nombre && (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 }}>
                        <Ionicons name="alert-circle" size={14} color="#ef4444" />
                        <Text style={{ color: '#ef4444', fontSize: 12, fontWeight: '600' }}>
                          {errors.nombre}
                        </Text>
                      </View>
                    )}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
                      <Text style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: 11 }}>
                        {formData.nombre.length}/100 caracteres
                      </Text>
                      {formData.nombre.length >= 5 && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                          <Ionicons name="checkmark-circle" size={14} color="#10b981" />
                          <Text style={{ color: '#10b981', fontSize: 11, fontWeight: '600' }}>Válido</Text>
                        </View>
                      )}
                    </View>
                  </View>

                  {/* Código */}
                  <View style={styles.formGroup}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                      <Ionicons name="pricetag" size={16} color="#667eea" />
                      <Text style={styles.label}>
                        Código <Text style={styles.required}>*</Text>
                      </Text>
                      <TooltipIcon text="Código único para identificar el departamento. Solo usa letras, números, guiones (-) y guiones bajos (_). Entre 3 y 50 caracteres. Ejemplo: DEPT-SIS-001" />
                    </View>
                    <TextInput
                      style={[styles.input, errors.codigo && { borderColor: '#ef4444', borderWidth: 2 }]}
                      value={formData.codigo}
                      onChangeText={(text) => handleInputChange('codigo', text)}
                      placeholder="Ej: DEPT-SIS-001"
                      placeholderTextColor="rgba(255, 255, 255, 0.3)"
                      maxLength={50}
                      autoCapitalize="characters"
                    />
                    {errors.codigo && (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 }}>
                        <Ionicons name="alert-circle" size={14} color="#ef4444" />
                        <Text style={{ color: '#ef4444', fontSize: 12, fontWeight: '600' }}>
                          {errors.codigo}
                        </Text>
                      </View>
                    )}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
                      <Text style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: 11 }}>
                        {formData.codigo.length}/50 caracteres
                      </Text>
                      {formData.codigo.length >= 3 && validateCodigo(formData.codigo) && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                          <Ionicons name="checkmark-circle" size={14} color="#10b981" />
                          <Text style={{ color: '#10b981', fontSize: 11, fontWeight: '600' }}>Válido</Text>
                        </View>
                      )}
                    </View>
                  </View>

                  {/* Facultad */}
                  <View style={styles.formGroup}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                      <Ionicons name="business" size={16} color="#667eea" />
                      <Text style={styles.label}>Facultad</Text>
                      <TooltipIcon text="Facultad a la que pertenece el departamento (opcional). Máximo 100 caracteres. Ejemplo: Ingeniería y Tecnología" />
                    </View>
                    <TextInput
                      style={[styles.input, errors.facultad && { borderColor: '#ef4444', borderWidth: 2 }]}
                      value={formData.facultad}
                      onChangeText={(text) => handleInputChange('facultad', text)}
                      placeholder="Ej: Ingeniería y Tecnología"
                      placeholderTextColor="rgba(255, 255, 255, 0.3)"
                      maxLength={100}
                    />
                    {errors.facultad && (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 }}>
                        <Ionicons name="alert-circle" size={14} color="#ef4444" />
                        <Text style={{ color: '#ef4444', fontSize: 12, fontWeight: '600' }}>
                          {errors.facultad}
                        </Text>
                      </View>
                    )}
                    <Text style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: 11, marginTop: 6 }}>
                      {formData.facultad.length}/100 caracteres
                    </Text>
                  </View>

                  {/* Email */}
                  <View style={styles.formGroup}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                      <Ionicons name="mail" size={16} color="#667eea" />
                      <Text style={styles.label}>Email</Text>
                      <TooltipIcon text="Correo electrónico de contacto del departamento (opcional). Debe tener formato válido. Ejemplo: sistemas@institucion.edu.ec" />
                    </View>
                    <TextInput
                      style={[styles.input, errors.email && { borderColor: '#ef4444', borderWidth: 2 }]}
                      value={formData.email}
                      onChangeText={(text) => handleInputChange('email', text)}
                      placeholder="correo@ejemplo.com"
                      placeholderTextColor="rgba(255, 255, 255, 0.3)"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      maxLength={100}
                    />
                    {errors.email && (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 }}>
                        <Ionicons name="alert-circle" size={14} color="#ef4444" />
                        <Text style={{ color: '#ef4444', fontSize: 12, fontWeight: '600' }}>
                          {errors.email}
                        </Text>
                      </View>
                    )}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
                      <Text style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: 11 }}>
                        {formData.email.length}/100 caracteres
                      </Text>
                      {formData.email.length > 0 && !errors.email && validateEmail(formData.email) && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                          <Ionicons name="checkmark-circle" size={14} color="#10b981" />
                          <Text style={{ color: '#10b981', fontSize: 11, fontWeight: '600' }}>Válido</Text>
                        </View>
                      )}
                    </View>
                  </View>

                  {/* Teléfono */}
                  <View style={styles.formGroup}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                      <Ionicons name="call" size={16} color="#667eea" />
                      <Text style={styles.label}>Teléfono</Text>
                      <TooltipIcon text="Número de teléfono del departamento (opcional). Entre 7 y 15 caracteres. Ejemplo: 0991234567 o +593 99 123 4567" />
                    </View>
                    <TextInput
                      style={[styles.input, errors.telefono && { borderColor: '#ef4444', borderWidth: 2 }]}
                      value={formData.telefono}
                      onChangeText={(text) => handleInputChange('telefono', text)}
                      placeholder="0991234567"
                      placeholderTextColor="rgba(255, 255, 255, 0.3)"
                      keyboardType="phone-pad"
                      maxLength={20}
                    />
                    {errors.telefono && (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 }}>
                        <Ionicons name="alert-circle" size={14} color="#ef4444" />
                        <Text style={{ color: '#ef4444', fontSize: 12, fontWeight: '600' }}>
                          {errors.telefono}
                        </Text>
                      </View>
                    )}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
                      <Text style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: 11 }}>
                        {formData.telefono.length}/20 caracteres
                      </Text>
                      {formData.telefono.length > 0 && validatePhone(formData.telefono) && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                          <Ionicons name="checkmark-circle" size={14} color="#10b981" />
                          <Text style={{ color: '#10b981', fontSize: 11, fontWeight: '600' }}>Válido</Text>
                        </View>
                      )}
                    </View>
                  </View>

                  {/* Ubicación */}
                  <View style={styles.formGroup}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                      <Ionicons name="location" size={16} color="#667eea" />
                      <Text style={styles.label}>Ubicación</Text>
                      <TooltipIcon text="Ubicación física del departamento (opcional). Máximo 200 caracteres. Ejemplo: Edificio A, Piso 2, Oficina 205" />
                    </View>
                    <TextInput
                      style={[styles.input, errors.ubicacion && { borderColor: '#ef4444', borderWidth: 2 }]}
                      value={formData.ubicacion}
                      onChangeText={(text) => handleInputChange('ubicacion', text)}
                      placeholder="Edificio A, Piso 2, Oficina 205"
                      placeholderTextColor="rgba(255, 255, 255, 0.3)"
                      maxLength={200}
                    />
                    {errors.ubicacion && (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 }}>
                        <Ionicons name="alert-circle" size={14} color="#ef4444" />
                        <Text style={{ color: '#ef4444', fontSize: 12, fontWeight: '600' }}>
                          {errors.ubicacion}
                        </Text>
                      </View>
                    )}
                    <Text style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: 11, marginTop: 6 }}>
                      {formData.ubicacion.length}/200 caracteres
                    </Text>
                  </View>

                  {/* Descripción */}
                  <View style={styles.formGroup}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                      <Ionicons name="document-text" size={16} color="#667eea" />
                      <Text style={styles.label}>Descripción</Text>
                      <TooltipIcon text="Descripción detallada del departamento, sus funciones y responsabilidades (opcional). Máximo 500 caracteres." />
                    </View>
                    <TextInput
                      style={[styles.input, styles.textArea, errors.descripcion && { borderColor: '#ef4444', borderWidth: 2 }]}
                      value={formData.descripcion}
                      onChangeText={(text) => handleInputChange('descripcion', text)}
                      placeholder="Descripción detallada del departamento, sus funciones y responsabilidades..."
                      placeholderTextColor="rgba(255, 255, 255, 0.3)"
                      multiline
                      numberOfLines={4}
                      textAlignVertical="top"
                      maxLength={500}
                    />
                    {errors.descripcion && (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 }}>
                        <Ionicons name="alert-circle" size={14} color="#ef4444" />
                        <Text style={{ color: '#ef4444', fontSize: 12, fontWeight: '600' }}>
                          {errors.descripcion}
                        </Text>
                      </View>
                    )}
                    <Text style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: 11, marginTop: 6 }}>
                      {formData.descripcion.length}/500 caracteres
                    </Text>
                  </View>

                </ScrollView>

                {/* Footer del Modal */}
                <View style={styles.modalFooter}>
                  <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.secondaryButtonText}>Cancelar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={handleSubmit}
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name={editingDepartamento ? "checkmark-circle" : "add-circle"}
                      size={20}
                      color="white"
                    />
                    <Text style={styles.buttonText}>
                      {editingDepartamento ? 'Actualizar' : 'Crear'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

          {/* ============ MODAL DE ADVERTENCIA (Departamento con usuarios/agentes) ============ */}
          <Modal visible={showWarningModal} animationType="fade" transparent>
            <View style={styles.modalOverlay}>
              <View style={[styles.modal, { maxWidth: 500, padding: 0 }]}>

                {/* Header del Modal */}
                <View style={{
                  padding: 24,
                  borderBottomWidth: 1,
                  borderBottomColor: 'rgba(251, 146, 60, 0.2)',
                  backgroundColor: 'rgba(251, 146, 60, 0.1)',
                }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                    <View style={{
                      width: 56,
                      height: 56,
                      borderRadius: 16,
                      backgroundColor: 'rgba(251, 146, 60, 0.2)',
                      justifyContent: 'center',
                      alignItems: 'center',
                      borderWidth: 2,
                      borderColor: 'rgba(251, 146, 60, 0.4)',
                    }}>
                      <Ionicons name="warning" size={32} color="#fb923c" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{
                        fontSize: 20,
                        fontWeight: '700',
                        color: '#fb923c',
                        marginBottom: 4,
                      }}>
                        ❌ No se puede eliminar
                      </Text>
                      <Text style={{
                        fontSize: 13,
                        color: 'rgba(255, 255, 255, 0.6)',
                      }}>
                        Este departamento tiene dependencias activas
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Contenido del Modal */}
                <ScrollView style={{ maxHeight: 400, padding: 24 }}>

                  {/* ✅ MOSTRAR USUARIOS SI HAY */}
                  {usuariosAsignados.length > 0 && (
                    <>
                      <Text style={{
                        fontSize: 16,
                        color: 'rgba(255, 255, 255, 0.9)',
                        lineHeight: 24,
                        marginBottom: 16,
                      }}>
                        Este departamento tiene <Text style={{ fontWeight: '700', color: '#fb923c' }}>
                          {usuariosAsignados.length} {usuariosAsignados.length === 1 ? 'usuario asignado' : 'usuarios asignados'}
                        </Text>. Debes reasignar o remover a todos los usuarios antes de eliminarlo.
                      </Text>

                      {/* Lista de usuarios asignados */}
                      <View style={{
                        backgroundColor: 'rgba(71, 85, 105, 0.3)',
                        borderRadius: 12,
                        padding: 16,
                        borderWidth: 1,
                        borderColor: 'rgba(251, 146, 60, 0.3)',
                        marginBottom: 16,
                      }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                          <Ionicons name="people" size={20} color="#fb923c" />
                          <Text style={{
                            fontSize: 15,
                            fontWeight: '700',
                            color: '#fb923c',
                          }}>
                            {usuariosAsignados.length === 1 ? 'Usuario asignado:' : 'Usuarios asignados:'}
                          </Text>
                        </View>
                        {usuariosAsignados.slice(0, 5).map((usuario, index) => (
                          <View
                            key={usuario.id_usuario || index}
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              gap: 12,
                              paddingVertical: 12,
                              paddingHorizontal: 12,
                              backgroundColor: 'rgba(102, 126, 234, 0.1)',
                              borderRadius: 8,
                              borderLeftWidth: 3,
                              borderLeftColor: '#667eea',
                              marginBottom: index < Math.min(4, usuariosAsignados.length - 1) ? 8 : 0,
                            }}
                          >
                            <View style={{
                              width: 40,
                              height: 40,
                              borderRadius: 20,
                              backgroundColor: 'rgba(102, 126, 234, 0.2)',
                              justifyContent: 'center',
                              alignItems: 'center',
                            }}>
                              <Ionicons name="person" size={20} color="#667eea" />
                            </View>
                            <View style={{ flex: 1 }}>
                              <Text style={{
                                color: 'rgba(255, 255, 255, 0.9)',
                                fontSize: 15,
                                fontWeight: '600',
                                marginBottom: 2,
                              }}>
                                {usuario.persona?.nombre} {usuario.persona?.apellido}
                              </Text>
                              <Text style={{
                                color: 'rgba(255, 255, 255, 0.5)',
                                fontSize: 12,
                              }}>
                                {usuario.username} • {usuario.email}
                              </Text>
                            </View>
                            <Ionicons name="link" size={18} color="#667eea" />
                          </View>
                        ))}
                        {usuariosAsignados.length > 5 && (
                          <Text style={{
                            color: 'rgba(255, 255, 255, 0.6)',
                            fontSize: 13,
                            fontStyle: 'italic',
                            marginTop: 8,
                            textAlign: 'center',
                          }}>
                            ... y {usuariosAsignados.length - 5} usuario(s) más
                          </Text>
                        )}
                      </View>

                      {/* Instrucciones para usuarios */}
                      <View style={{
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        borderLeftWidth: 4,
                        borderLeftColor: '#3b82f6',
                        padding: 16,
                        borderRadius: 8,
                        marginBottom: 16,
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
                              📋 Pasos para eliminar este departamento:
                            </Text>
                            <View style={{ gap: 8 }}>
                              <View style={{ flexDirection: 'row', gap: 8 }}>
                                <Text style={{ color: '#3b82f6', fontWeight: '700' }}>1.</Text>
                                <Text style={{
                                  color: 'rgba(255, 255, 255, 0.8)',
                                  fontSize: 13,
                                  flex: 1,
                                  lineHeight: 20,
                                }}>
                                  Ve a <Text style={{ fontWeight: '700' }}>Gestión de Asignaciones</Text>
                                </Text>
                              </View>
                              <View style={{ flexDirection: 'row', gap: 8 }}>
                                <Text style={{ color: '#3b82f6', fontWeight: '700' }}>2.</Text>
                                <Text style={{
                                  color: 'rgba(255, 255, 255, 0.8)',
                                  fontSize: 13,
                                  flex: 1,
                                  lineHeight: 20,
                                }}>
                                  Reasigna {usuariosAsignados.length === 1 ? 'el usuario' : 'los usuarios'} a otro departamento o remuévelos
                                </Text>
                              </View>
                              <View style={{ flexDirection: 'row', gap: 8 }}>
                                <Text style={{ color: '#3b82f6', fontWeight: '700' }}>3.</Text>
                                <Text style={{
                                  color: 'rgba(255, 255, 255, 0.8)',
                                  fontSize: 13,
                                  flex: 1,
                                  lineHeight: 20,
                                }}>
                                  Regresa aquí y podrás eliminar el departamento
                                </Text>
                              </View>
                            </View>
                          </View>
                        </View>
                      </View>
                    </>
                  )}

                  {/* ✅ MOSTRAR AGENTES SI HAY (y no hay usuarios) */}
                  {usuariosAsignados.length === 0 && agentesAsignados.length > 0 && (
                    <>
                      <Text style={{
                        fontSize: 16,
                        color: 'rgba(255, 255, 255, 0.9)',
                        lineHeight: 24,
                        marginBottom: 16,
                      }}>
                        Este departamento tiene <Text style={{ fontWeight: '700', color: '#fb923c' }}>
                          {agentesAsignados.length} {agentesAsignados.length === 1 ? 'agente asignado' : 'agentes asignados'}
                        </Text>. Debes revocar todas las asignaciones antes de eliminarlo.
                      </Text>

                      {/* Lista de agentes asignados */}
                      <View style={{
                        backgroundColor: 'rgba(71, 85, 105, 0.3)',
                        borderRadius: 12,
                        padding: 16,
                        borderWidth: 1,
                        borderColor: 'rgba(251, 146, 60, 0.3)',
                        marginBottom: 16,
                      }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                          <Ionicons name="chatbubbles" size={20} color="#fb923c" />
                          <Text style={{
                            fontSize: 15,
                            fontWeight: '700',
                            color: '#fb923c',
                          }}>
                            {agentesAsignados.length === 1 ? 'Agente asignado:' : 'Agentes asignados:'}
                          </Text>
                        </View>
                        {agentesAsignados.map((agente, index) => (
                          <View
                            key={agente.id_agente || index}
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              gap: 12,
                              paddingVertical: 12,
                              paddingHorizontal: 12,
                              backgroundColor: 'rgba(102, 126, 234, 0.1)',
                              borderRadius: 8,
                              borderLeftWidth: 3,
                              borderLeftColor: '#667eea',
                              marginBottom: index < agentesAsignados.length - 1 ? 8 : 0,
                            }}
                          >
                            <View style={{
                              width: 40,
                              height: 40,
                              borderRadius: 20,
                              backgroundColor: 'rgba(102, 126, 234, 0.2)',
                              justifyContent: 'center',
                              alignItems: 'center',
                            }}>
                              <Text style={{ fontSize: 20 }}>{agente.icono || '🤖'}</Text>
                            </View>
                            <View style={{ flex: 1 }}>
                              <Text style={{
                                color: 'rgba(255, 255, 255, 0.9)',
                                fontSize: 15,
                                fontWeight: '600',
                                marginBottom: 2,
                              }}>
                                {agente.nombre_agente}
                              </Text>
                              <Text style={{
                                color: 'rgba(255, 255, 255, 0.5)',
                                fontSize: 12,
                              }}>
                                {agente.area_especialidad || agente.tipo_agente}
                              </Text>
                            </View>
                            <Ionicons name="link" size={18} color="#667eea" />
                          </View>
                        ))}
                      </View>

                      {/* Instrucciones para agentes */}
                      <View style={{
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        borderLeftWidth: 4,
                        borderLeftColor: '#3b82f6',
                        padding: 16,
                        borderRadius: 8,
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
                              📋 Pasos para eliminar este departamento:
                            </Text>
                            <View style={{ gap: 8 }}>
                              <View style={{ flexDirection: 'row', gap: 8 }}>
                                <Text style={{ color: '#3b82f6', fontWeight: '700' }}>1.</Text>
                                <Text style={{
                                  color: 'rgba(255, 255, 255, 0.8)',
                                  fontSize: 13,
                                  flex: 1,
                                  lineHeight: 20,
                                }}>
                                  Ve a <Text style={{ fontWeight: '700' }}>Gestión de Agentes</Text>
                                </Text>
                              </View>
                              <View style={{ flexDirection: 'row', gap: 8 }}>
                                <Text style={{ color: '#3b82f6', fontWeight: '700' }}>2.</Text>
                                <Text style={{
                                  color: 'rgba(255, 255, 255, 0.8)',
                                  fontSize: 13,
                                  flex: 1,
                                  lineHeight: 20,
                                }}>
                                  Edita {agentesAsignados.length === 1 ? 'el agente' : 'cada agente'} y quita la asignación del departamento
                                </Text>
                              </View>
                              <View style={{ flexDirection: 'row', gap: 8 }}>
                                <Text style={{ color: '#3b82f6', fontWeight: '700' }}>3.</Text>
                                <Text style={{
                                  color: 'rgba(255, 255, 255, 0.8)',
                                  fontSize: 13,
                                  flex: 1,
                                  lineHeight: 20,
                                }}>
                                  Regresa aquí y podrás eliminar el departamento
                                </Text>
                              </View>
                            </View>
                          </View>
                        </View>
                      </View>
                    </>
                  )}
                </ScrollView>

                {/* Footer del Modal */}
                <View style={{
                  padding: 24,
                  paddingTop: 0,
                }}>
                  <TouchableOpacity
                    style={{
                      backgroundColor: '#667eea',
                      paddingVertical: 14,
                      borderRadius: 12,
                      alignItems: 'center',
                      flexDirection: 'row',
                      justifyContent: 'center',
                      gap: 8,
                      shadowColor: '#667eea',
                      shadowOpacity: 0.4,
                      shadowRadius: 8,
                      shadowOffset: { width: 0, height: 4 },
                      elevation: 6,
                    }}
                    onPress={() => {
                      setShowWarningModal(false);
                      setUsuariosAsignados([]); // ✅ Limpiar usuarios
                      setAgentesAsignados([]);  // ✅ Limpiar agentes
                    }}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="checkmark-circle" size={20} color="white" />
                    <Text style={{
                      color: 'white',
                      fontSize: 15,
                      fontWeight: '700',
                    }}>
                      Entendido
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

          {/* ============ MODAL DE CONFIRMACIÓN DE ELIMINACIÓN ============ */}
          <Modal visible={showDeleteModal} animationType="fade" transparent>
            <View style={styles.modalOverlay}>
              <View style={[styles.modal, { maxWidth: 450, padding: 0 }]}>

                {/* Header del Modal */}
                <View style={{
                  padding: 24,
                  borderBottomWidth: 1,
                  borderBottomColor: 'rgba(239, 68, 68, 0.2)',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                    <View style={{
                      width: 56,
                      height: 56,
                      borderRadius: 16,
                      backgroundColor: 'rgba(239, 68, 68, 0.2)',
                      justifyContent: 'center',
                      alignItems: 'center',
                      borderWidth: 2,
                      borderColor: 'rgba(239, 68, 68, 0.4)',
                    }}>
                      <Ionicons name="warning" size={32} color="#ef4444" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{
                        fontSize: 20,
                        fontWeight: '700',
                        color: '#ef4444',
                        marginBottom: 4,
                      }}>
                        Confirmar eliminación
                      </Text>
                      <Text style={{
                        fontSize: 13,
                        color: 'rgba(255, 255, 255, 0.6)',
                      }}>
                        Esta acción no se puede deshacer
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Contenido del Modal */}
                <View style={{ padding: 24 }}>
                  <Text style={{
                    fontSize: 16,
                    color: 'rgba(255, 255, 255, 0.9)',
                    lineHeight: 24,
                    marginBottom: 16,
                  }}>
                    ¿Está seguro de que desea eliminar este departamento?
                  </Text>

                  <View style={{
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    borderLeftWidth: 4,
                    borderLeftColor: '#ef4444',
                    padding: 16,
                    borderRadius: 8,
                    marginBottom: 8,
                  }}>
                    <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
                      <Ionicons name="alert-circle" size={20} color="#ef4444" style={{ marginTop: 2 }} />
                      <View style={{ flex: 1 }}>
                        <Text style={{
                          fontSize: 14,
                          fontWeight: '600',
                          color: '#ef4444',
                          marginBottom: 6,
                        }}>
                          Advertencia importante
                        </Text>
                        <Text style={{
                          fontSize: 13,
                          color: 'rgba(255, 255, 255, 0.7)',
                          lineHeight: 20,
                        }}>
                          Esta acción es permanente y no se puede deshacer desde la aplicación. El departamento será eliminado del sistema.
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Footer del Modal */}
                <View style={{
                  flexDirection: 'row',
                  gap: 12,
                  padding: 24,
                  paddingTop: 0,
                }}>
                  <TouchableOpacity
                    style={{
                      flex: 1,
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      paddingVertical: 14,
                      borderRadius: 12,
                      alignItems: 'center',
                      borderWidth: 1,
                      borderColor: 'rgba(255, 255, 255, 0.2)',
                    }}
                    onPress={cancelDelete}
                    activeOpacity={0.7}
                  >
                    <Text style={{
                      color: 'rgba(255, 255, 255, 0.9)',
                      fontSize: 15,
                      fontWeight: '600',
                    }}>
                      Cancelar
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={{
                      flex: 1,
                      backgroundColor: '#ef4444',
                      paddingVertical: 14,
                      borderRadius: 12,
                      alignItems: 'center',
                      flexDirection: 'row',
                      justifyContent: 'center',
                      gap: 8,
                      shadowColor: '#ef4444',
                      shadowOpacity: 0.4,
                      shadowRadius: 8,
                      shadowOffset: { width: 0, height: 4 },
                      elevation: 6,
                    }}
                    onPress={confirmDelete}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="trash" size={18} color="white" />
                    <Text style={{
                      color: 'white',
                      fontSize: 15,
                      fontWeight: '700',
                    }}>
                      Eliminar
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </View>
      </View>

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
            <SuperAdminSidebar
              isOpen={sidebarOpen}
              onNavigate={() => setSidebarOpen(false)}
            />
          </View>
        </>
      )}
    </View>
  );
}
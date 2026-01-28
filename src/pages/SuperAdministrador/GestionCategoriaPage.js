import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
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
  View
} from 'react-native';
import { agenteService } from '../../api/services/agenteService';
import { categoriaService } from '../../api/services/categoriaService';
import SuperAdminSidebar from '../../components/Sidebar/sidebarSuperAdmin';
import { contentStyles } from '../../components/Sidebar/SidebarSuperAdminStyles';
import GestionCategoriaCard from '../../components/SuperAdministrador/GestionCategoriaCard';
import { styles } from '../../styles/gestionCategoriaStyles';
// 🔒 SECURITY: Anti-hacking utilities - VERSIÓN COMPLETA
const SecurityUtils = {
  // ✅ Create a rate limiter (attempts per time window)
  createRateLimiter: (maxAttempts, timeWindowMs) => {
    let attempts = 0;
    let lastReset = Date.now();
    return () => {
      const now = Date.now();
      if (now - lastReset > timeWindowMs) {
        attempts = 0;
        lastReset = now;
      }
      attempts++;
      return attempts <= maxAttempts;
    };
  },

  // ✅ Validate positive integer IDs
  validateId: (id) => {
    return Number.isInteger(id) && id > 0;
  },

  // ✅ Validate string length (1-500 chars max)
  validateString: (str, minLength = 1, maxLength = 500) => {
    if (typeof str !== 'string') return false;
    const trimmed = str.trim();
    return trimmed.length >= minLength && trimmed.length <= maxLength;
  },

  // ✅ XSS Detection: Check for common attack patterns
  detectXssAttempt: (text) => {
    if (typeof text !== 'string') return false;
    const xssPatterns = [
      /<script\b/gi,
      /on\w+\s*=/gi,  // Event handlers like onload=, onclick=, etc.
      /<iframe/gi,
      /javascript:/gi,
      /eval\s*\(/gi,
      /onerror\s*=/gi,
      /onload\s*=/gi
    ];
    return xssPatterns.some(pattern => pattern.test(text));
  },

  // ✅ XSS Protection: Remove potentially dangerous HTML/JS
  sanitizeText: (text) => {
    if (typeof text !== 'string') return '';
    return text
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .replace(/<[^>]*>/g, '')
      .trim();
  },

  // ✅ Output Encoding
  encodeOutput: (text) => {
    if (typeof text !== 'string') return '';
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  },

  // ✅ Validate numbers and prevent negative overflow
  validateNumberRange: (value, min = -999999, max = 999999) => {
    const num = Number(value);
    return !isNaN(num) && num >= min && num <= max;
  },

  // ✅ Remove SQL injection patterns
  sanitizeSqlInput: (text) => {
    if (typeof text !== 'string') return '';
    return text
      .replace(/('|"|;|--|\*|%|_)/g, '')
      .trim();
  },

  // ✅ Rate limiting - Prevent brute force attacks
  createRateLimiter: (maxAttempts = 5, windowMs = 60000) => {
    const attempts = new Map();
    return {
      isAllowed: (key) => {
        const now = Date.now();
        if (!attempts.has(key)) {
          attempts.set(key, []);
        }
        const userAttempts = attempts.get(key);
        const recentAttempts = userAttempts.filter(time => now - time < windowMs);
        if (recentAttempts.length >= maxAttempts) {
          return false;
        }
        recentAttempts.push(now);
        attempts.set(key, recentAttempts);
        return true;
      }
    };
  },

  // ✅ Logging for security audit
  logSecurityEvent: (eventType, details) => {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      eventType,
      details,
      userAgent: Platform.OS
    };
    console.warn(`🔒 SECURITY [${eventType}]:`, logEntry);
  }
};

// ============ COMPONENTE TOOLTIP ============
function TooltipIcon({ text }) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const buttonRef = useRef(null);
  const isMobile = Platform.OS !== 'web';
  const { width } = Dimensions.get('window');

  const handlePress = () => {
    if (isMobile && buttonRef.current) {
      buttonRef.current.measure((fx, fy, width, height, px, py) => {
        setPosition({ x: px, y: py });
        setShowTooltip(true);
      });
    } else {
      setShowTooltip(!showTooltip);
    }
  };

  return (
    <View style={{ position: 'relative', marginLeft: 6 }}>
      <TouchableOpacity
        ref={buttonRef}
        onPress={handlePress}
        onMouseEnter={() => !isMobile && setShowTooltip(true)}
        onMouseLeave={() => !isMobile && setShowTooltip(false)}
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

      {/* Tooltip para WEB */}
      {showTooltip && !isMobile && (
        <View style={{
          position: 'absolute',
          top: -5,
          left: 25,
          minWidth: 200,
          maxWidth: 280,
          backgroundColor: '#1a1a2e',
          padding: 12,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: 'rgba(102, 126, 234, 0.3)',
          zIndex: 1000,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
        }}>
          <View style={{
            position: 'absolute',
            top: 8,
            left: -6,
            width: 12,
            height: 12,
            backgroundColor: '#1a1a2e',
            borderTopWidth: 1,
            borderLeftWidth: 1,
            borderColor: 'rgba(102, 126, 234, 0.3)',
            transform: [{ rotate: '-45deg' }],
          }} />

          <Text style={{
            color: 'rgba(255, 255, 255, 0.9)',
            fontSize: 12,
            lineHeight: 18,
          }}>
            {text}
          </Text>
        </View>
      )}

      {/* Tooltip para MÓVIL */}
      {showTooltip && isMobile && (
        <Modal
          visible={true}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowTooltip(false)}
        >
          <TouchableOpacity
            style={{
              flex: 1,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
            }}
            activeOpacity={1}
            onPress={() => setShowTooltip(false)}
          >
            <View style={{
              position: 'absolute',
              top: position.y + 25,
              left: Math.min(position.x - 50, width - 270),
              width: 250,
              backgroundColor: '#1a1a2e',
              padding: 16,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: 'rgba(102, 126, 234, 0.3)',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.4,
              shadowRadius: 8,
              elevation: 10,
            }}>
              <View style={{
                position: 'absolute',
                top: -6,
                left: Math.max(50, position.x - Math.min(position.x - 50, width - 270)),
                width: 12,
                height: 12,
                backgroundColor: '#1a1a2e',
                borderTopWidth: 1,
                borderLeftWidth: 1,
                borderColor: 'rgba(102, 126, 234, 0.3)',
                transform: [{ rotate: '45deg' }],
              }} />

              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
                marginBottom: 10,
                paddingBottom: 10,
                borderBottomWidth: 1,
                borderBottomColor: 'rgba(102, 126, 234, 0.2)',
              }}>
                <View style={{
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  backgroundColor: 'rgba(102, 126, 234, 0.2)',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                  <Text style={{ fontSize: 14 }}>💡</Text>
                </View>
                <Text style={{
                  color: '#667eea',
                  fontSize: 13,
                  fontWeight: '700',
                  flex: 1,
                }}>
                  Información
                </Text>
                <TouchableOpacity
                  onPress={() => setShowTooltip(false)}
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 11,
                    backgroundColor: 'rgba(239, 68, 68, 0.2)',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Ionicons name="close" size={14} color="#ef4444" />
                </TouchableOpacity>
              </View>

              <Text style={{
                color: 'rgba(255, 255, 255, 0.9)',
                fontSize: 12,
                lineHeight: 18,
              }}>
                {text}
              </Text>
            </View>
          </TouchableOpacity>
        </Modal>
      )}
    </View>
  );
}

export default function GestionCategoriaPage() {
  // ============ STATE ============
  const [categorias, setCategorias] = useState([]);
  const [agentes, setAgentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingAgentes, setLoadingAgentes] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActivo, setFilterActivo] = useState('all');
  const [filterAgente, setFilterAgente] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingCategoria, setEditingCategoria] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [errors, setErrors] = useState({});
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const scrollRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [searchAgente, setSearchAgente] = useState('');
  const [showAllAgentes, setShowAllAgentes] = useState(false);
  const [searchFilterAgente, setSearchFilterAgente] = useState('');
  const [showDetalleModal, setShowDetalleModal] = useState(false);
  const [categoriaDetalle, setCategoriaDetalle] = useState(null);
  const [breadcrumb, setBreadcrumb] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoriaToDelete, setCategoriaToDelete] = useState(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorModalMessage, setErrorModalMessage] = useState('');
  // 🔒 SECURITY: Rate limiter and session timeout
  const rateLimiterRef = useRef(SecurityUtils.createRateLimiter(5, 60000));
  const [lastActionTime, setLastActionTime] = useState(0);
  const ACTION_COOLDOWN = 1000; // 1 segundo entre acciones
  const [sessionTimeout, setSessionTimeout] = useState(null);
  const SESSION_DURATION = 30 * 60 * 1000; // 30 minutos

  // Arrays de iconos y colores disponibles
  const iconosDisponibles = [
    'folder', 'document', 'file-tray', 'archive', 'briefcase',
    'cart', 'cash', 'card', 'calculator', 'calendar',
    'clipboard', 'bookmark', 'flag', 'star', 'heart',

    'bulb'
  ];

  const coloresDisponibles = [
    { nombre: 'Púrpura', hex: '#667eea' },
    { nombre: 'Azul', hex: '#3b82f6' },
    { nombre: 'Cyan', hex: '#06b6d4' },
    { nombre: 'Verde', hex: '#10b981' },
    { nombre: 'Lima', hex: '#84cc16' },
    { nombre: 'Amarillo', hex: '#fbbf24' },
    { nombre: 'Naranja', hex: '#f97316' },
    { nombre: 'Rojo', hex: '#ef4444' },
    { nombre: 'Rosa', hex: '#ec4899' },
    { nombre: 'Fucsia', hex: '#d946ef' },
    { nombre: 'Índigo', hex: '#6366f1' },
    { nombre: 'Violeta', hex: '#8b5cf6' },
    { nombre: 'Gris', hex: '#6b7280' },


    { nombre: 'Esmeralda', hex: '#059669' }
  ];

  const filteredCategorias = categorias.filter((cat) => {
    const search = searchTerm.toLowerCase();

    // Buscar por nombre o descripción
    const matchesSearch =
      !search ||
      cat.nombre?.toLowerCase().includes(search) ||
      cat.descripcion?.toLowerCase().includes(search);

    // Filtro por estado (Todas / Activas / Inactivas)
    const matchesActivo =
      filterActivo === 'all'
        ? true
        : cat.activo === (filterActivo === 'true');

    // Filtro por agente (Todos / uno específico)
    const matchesAgente =
      filterAgente === 'all'
        ? true
        : String(cat.id_agente) === String(filterAgente);

    // Solo mostrar categorías padre (sin id_categoria_padre)
    const isCategoriaPadre = cat.id_categoria_padre === null;

    // ✅ NUEVO: Excluir eliminadas (doble verificación por si acaso)
    const noEliminada = !cat.eliminado;

    return matchesSearch && matchesActivo && matchesAgente && isCategoriaPadre && noEliminada;
  });

  const isWeb = Platform.OS === 'web';

  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    icono: 'folder',
    color: '#667eea',
    orden: 0,
    activo: true,
    eliminado: false,
    id_agente: null,
    id_categoria_padre: null,
  });

  // ============ VALIDACIONES ============
  // 🔒 SECURITY: Usar SecurityUtils centralizado
  const sanitizeInput = (text) => {
    return SecurityUtils.sanitizeText(text);
  };


  const validateForm = () => {
    const newErrors = {};

    // Sanitizar ANTES de validar
    const nombreLimpio = sanitizeInput(formData.nombre);
    const descripcionLimpia = sanitizeInput(formData.descripcion);

    // Nombre (requerido, mínimo 3 caracteres, máximo 100)
    if (!nombreLimpio || nombreLimpio.length === 0) {
      newErrors.nombre = 'El nombre es obligatorio';
    } else if (nombreLimpio.length < 3) {
      newErrors.nombre = 'El nombre debe tener al menos 3 caracteres';
    } else if (nombreLimpio.length > 100) {
      newErrors.nombre = 'El nombre no puede exceder 100 caracteres';
    } else if (!/^[a-zA-Z0-9\sáéíóúÁÉÍÓÚñÑüÜ\-_.,:;()]+$/.test(nombreLimpio)) {
      newErrors.nombre = 'El nombre contiene caracteres no permitidos';
    }

    // Descripción (opcional, máximo 500 caracteres)
    if (descripcionLimpia && descripcionLimpia.length > 500) {
      newErrors.descripcion = 'La descripción no puede exceder 500 caracteres';
    }

    // Agente (requerido y debe existir)
    if (!formData.id_agente) {
      newErrors.id_agente = 'Debes seleccionar un agente';
    } else {
      const agenteId = parseInt(formData.id_agente);
      if (isNaN(agenteId) || agenteId <= 0) {
        newErrors.id_agente = 'ID de agente inválido';
      } else if (!agentes.some(a => a.id_agente === agenteId)) {
        newErrors.id_agente = 'El agente seleccionado no existe';
      }
    }

    // Validar icono
    if (!iconosDisponibles.includes(formData.icono)) {
      newErrors.icono = 'Icono no permitido';
    }

    // Validar color (debe ser hex válido)
    if (!/^#[0-9A-F]{6}$/i.test(formData.color)) {
      newErrors.color = 'Color inválido';
    }

    // Validar que el color esté en la lista permitida
    if (!coloresDisponibles.some(c => c.hex === formData.color)) {
      newErrors.color = 'Color no permitido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ============ EFFECTS ============
  useEffect(() => {
    cargarAgentes();
    cargarCategorias();
  }, []);

  // 🔒 SECURITY: Session timeout management
  useEffect(() => {
    const resetTimeout = () => {
      if (sessionTimeout) clearTimeout(sessionTimeout);

      const timeout = setTimeout(() => {
        Alert.alert(
          'Sesión Expirada',
          'Tu sesión ha expirado por inactividad. Por favor, recarga la página.',
          [{
            text: 'Entendido',
            onPress: () => {
              if (Platform.OS === 'web') {
                window.location.reload();
              }
            }
          }]
        );
      }, SESSION_DURATION);

      setSessionTimeout(timeout);
    };

    resetTimeout();

    return () => {
      if (sessionTimeout) clearTimeout(sessionTimeout);
    };
  }, [categorias, showModal, showDetalleModal]);

  // ============ FUNCIONES ============
  const cargarAgentes = async () => {
    try {
      // 🔒 SECURITY: Rate limiting
      if (!rateLimiterRef.current.isAllowed('cargarAgentes')) {
        SecurityUtils.logSecurityEvent('RATE_LIMIT_EXCEEDED', {
          function: 'cargarAgentes',
          operation: 'load_agents'
        });
        Alert.alert('Seguridad', 'Demasiadas solicitudes. Por favor, espere.');
        return;
      }

      setLoadingAgentes(true);
      SecurityUtils.logSecurityEvent('LOAD_AGENTS_START', { function: 'cargarAgentes' });
      
      const data = await agenteService.getAll({ activo: true });

      // 🔒 SECURITY: Validar que sea un array
      if (!Array.isArray(data)) {
        SecurityUtils.logSecurityEvent('INVALID_DATA_FORMAT', { 
          function: 'cargarAgentes',
          receivedType: typeof data 
        });
        throw new Error('Formato de datos inválido');
      }

      // 🔒 SECURITY: Sanitizar y validar agentes
      const agentesValidos = data
        .filter(agente => {
          // Validar estructura
          if (!agente || typeof agente !== 'object') return false;
          if (!agente.id_agente || !agente.nombre_agente) return false;
          // 🔒 Validar ID numérico
          if (!SecurityUtils.validateId(agente.id_agente)) return false;
          // 🔒 Detectar XSS en nombre del agente
          if (SecurityUtils.detectXssAttempt(agente.nombre_agente)) {
            SecurityUtils.logSecurityEvent('XSS_ATTEMPT_DETECTED', { 
              field: 'nombre_agente',
              value: agente.nombre_agente.substring(0, 50) 
            });
            return false;
          }
          return true;
        })
        .map(agente => ({
          ...agente,
          nombre_agente: SecurityUtils.sanitizeText(agente.nombre_agente || ''),
          area_especialidad: SecurityUtils.sanitizeText(agente.area_especialidad || ''),
          id_agente: parseInt(agente.id_agente) || 0,
        }));

      setAgentes(agentesValidos);
      SecurityUtils.logSecurityEvent('LOAD_AGENTS_SUCCESS', { 
        function: 'cargarAgentes',
        agentsLoaded: agentesValidos.length 
      });
    } catch (err) {
      console.error('Error al cargar agentes:', err);
      SecurityUtils.logSecurityEvent('LOAD_AGENTS_ERROR', { 
        function: 'cargarAgentes',
        error: err.message 
      });
      Alert.alert('Error', 'No se pudieron cargar los agentes');
      setAgentes([]);
    } finally {
      setLoadingAgentes(false);
    }
  };

  const cargarCategorias = async () => {
    try {
      // 🔒 SECURITY: Rate limiting on load operations
      if (!rateLimiterRef.current.isAllowed('cargarCategorias')) {
        SecurityUtils.logSecurityEvent('RATE_LIMIT_EXCEEDED', {
          function: 'cargarCategorias',
          operation: 'load',
          limit: '5 per 60s'
        });
        Alert.alert('Seguridad', 'Demasiadas solicitudes. Por favor, espere un momento.');
        return;
      }

      setLoading(true);
      SecurityUtils.logSecurityEvent('LOAD_CATEGORIES_START', { function: 'cargarCategorias' });
      
      const data = await categoriaService.getAll();

      // 🔒 SECURITY: Validate response structure
      if (!Array.isArray(data)) {
        SecurityUtils.logSecurityEvent('INVALID_DATA_FORMAT', { 
          function: 'cargarCategorias',
          receivedType: typeof data 
        });
        throw new Error('Formato de datos inválido');
      }

      // 🔒 SECURITY: Filtrar y sanitizar categorías
      const categoriasActivas = data
        .filter(cat => {
          // Validar estructura del objeto
          if (!cat || typeof cat !== 'object') return false;

          // Validar campos requeridos
          if (!cat.id_categoria || !cat.nombre) return false;

          // Excluir eliminadas
          if (cat.eliminado) return false;

          return true;
        })
        .map(cat => ({
          ...cat,
          // 🔒 Sanitizar campos de texto
          nombre: SecurityUtils.sanitizeText(cat.nombre || ''),
          descripcion: SecurityUtils.sanitizeText(cat.descripcion || ''),
          // 🔒 Validar campos numéricos
          id_categoria: parseInt(cat.id_categoria) || 0,
          id_agente: parseInt(cat.id_agente) || null,
          id_categoria_padre: cat.id_categoria_padre ? parseInt(cat.id_categoria_padre) : null,
          orden: parseInt(cat.orden) || 0,
          // 🔒 Validar booleanos
          activo: Boolean(cat.activo),
          eliminado: Boolean(cat.eliminado),
        }));

      setCategorias(categoriasActivas);
      SecurityUtils.logSecurityEvent('LOAD_CATEGORIES_SUCCESS', { 
        function: 'cargarCategorias',
        categoriesLoaded: categoriasActivas.length 
      });
    } catch (err) {
      console.error('Error al cargar categorías:', err);
      SecurityUtils.logSecurityEvent('LOAD_CATEGORIES_ERROR', { 
        function: 'cargarCategorias',
        error: err.message 
      });
      Alert.alert('Error', 'No se pudieron cargar las categorías');
      setCategorias([]);
    } finally {
      setLoading(false);
    }
  };


  const handleSubmit = async () => {
    // 🔒 SECURITY: Rate limiting check on operations
    if (!rateLimiterRef.current.isAllowed('handleSubmit')) {
      SecurityUtils.logSecurityEvent('RATE_LIMIT_EXCEEDED', { 
        function: 'handleSubmit',
        operation: 'save_category',
        limit: '5 per 60s'
      });
      Alert.alert('⚠️ Seguridad', 'Demasiadas solicitudes. Por favor, intenta nuevamente en un momento.');
      return;
    }

    if (!validateForm()) {
      SecurityUtils.logSecurityEvent('FORM_VALIDATION_FAILED', { 
        function: 'handleSubmit',
        errorCount: Object.keys(errors).length 
      });
      Alert.alert('Error de validación', 'Por favor, corrige los errores en el formulario');
      return;
    }

    try {
      // 🔒 SECURITY: Sanitize all input data
      const sanitizedData = {
        nombre: SecurityUtils.sanitizeText(formData.nombre),
        descripcion: SecurityUtils.sanitizeText(formData.descripcion),
        icono: formData.icono,
        color: formData.color,
        orden: (() => {
          const orden = parseInt(formData.orden);
          if (isNaN(orden) || orden < 0 || orden > 9999) {
            return 0; // Valor por defecto seguro
          }
          return orden;
        })(),
        activo: formData.activo,
        eliminado: formData.eliminado || false,
        id_agente: (() => {
          const id = parseInt(formData.id_agente);
          if (!SecurityUtils.validateId(id)) {
            throw new Error('ID de agente inválido');
          }
          // 🔒 SECURITY: Verificar que el agente existe en la lista
          const agenteExiste = agentes.some(a => a.id_agente === id);
          if (!agenteExiste) {
            throw new Error('El agente seleccionado no existe');
          }
          return id;
        })(),
        id_categoria_padre: (() => {
          if (!formData.id_categoria_padre) return null;

          const id = parseInt(formData.id_categoria_padre);
          if (!SecurityUtils.validateId(id)) {
            throw new Error('ID de categoría padre inválido');
          }

          // 🔒 SECURITY: Verificar que la categoría padre existe
          const categoriaExiste = categorias.some(c => c.id_categoria === id);
          if (!categoriaExiste) {
            throw new Error('La categoría padre seleccionada no existe');
          }

          // 🔒 SECURITY: Verificar que pertenece al mismo agente
          const categoriaPadre = categorias.find(c => c.id_categoria === id);
          if (categoriaPadre && categoriaPadre.id_agente !== formData.id_agente) {
            throw new Error('La categoría padre debe pertenecer al mismo agente');
          }

          return id;
        })(),
      };

      // 🔒 SECURITY: Log sanitized data
      SecurityUtils.logSecurityEvent('CATEGORIA_SAVE_ATTEMPT', {
        operation: editingCategoria ? 'update' : 'create',
        id_agente: sanitizedData.id_agente,
        nombre: sanitizedData.nombre.substring(0, 20) + '...',
        timestamp: new Date().toISOString()
      });

      if (editingCategoria) {
        // ✅ Validar si está cambiando el agente y tiene subcategorías
        if (editingCategoria.id_agente !== formData.id_agente) {
          const subcategorias = getSubcategorias(editingCategoria.id_categoria);
          if (subcategorias.length > 0) {
            SecurityUtils.logSecurityEvent('AGENT_CHANGE_BLOCKED', {
              categoriaId: editingCategoria.id_categoria,
              subcategoriasCount: subcategorias.length,
              function: 'handleSubmit'
            });
            setErrorModalMessage(
              `No puedes cambiar el agente de esta categoría porque tiene ${subcategorias.length} subcategoría${subcategorias.length === 1 ? '' : 's'} asociada${subcategorias.length === 1 ? '' : 's'}. Primero debes eliminar o mover las subcategorías.`
            );
            setShowErrorModal(true);
            return;
          }
        }

        // 🔒 SECURITY: Log update action
        SecurityUtils.logSecurityEvent('CATEGORIA_UPDATE_START', {
          id: editingCategoria.id_categoria,
          changes: {
            nombre: sanitizedData.nombre !== editingCategoria.nombre,
            agente: sanitizedData.id_agente !== editingCategoria.id_agente,
            activo: sanitizedData.activo !== editingCategoria.activo
          },
          timestamp: new Date().toISOString()
        });

        await categoriaService.update(editingCategoria.id_categoria, sanitizedData);
        setSuccessMessage('✅ Categoría actualizada exitosamente');
        SecurityUtils.logSecurityEvent('CATEGORIA_UPDATE_SUCCESS', { 
          id: editingCategoria.id_categoria 
        });

        // 🔥 CRÍTICO: Recargar INMEDIATAMENTE después de actualizar
        await cargarCategorias();

      } else {
        // 🔒 SECURITY: Log create action
        SecurityUtils.logSecurityEvent('CATEGORIA_CREATE_START', {
          id_agente: sanitizedData.id_agente,
          nombre: sanitizedData.nombre.substring(0, 20) + '...',
          timestamp: new Date().toISOString()
        });

        await categoriaService.create(sanitizedData);
        setSuccessMessage('✅ Categoría creada exitosamente');
        SecurityUtils.logSecurityEvent('CATEGORIA_CREATE_SUCCESS', { 
          id_agente: sanitizedData.id_agente 
        });

        // 🔥 CRÍTICO: Recargar INMEDIATAMENTE después de crear
        await cargarCategorias();
      }

      // Cerrar modal y mostrar mensaje
      setShowModal(false);
      resetForm();
      setShowSuccessMessage(true);

      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000);

    } catch (err) {
      console.error('Error al guardar:', err);
      SecurityUtils.logSecurityEvent('CATEGORIA_SAVE_ERROR', { 
        operation: editingCategoria ? 'update' : 'create',
        error: err.message,
        timestamp: new Date().toISOString()
      });
      const errorMessage = err?.message || err?.data?.message || 'No se pudo guardar la categoría';
      Alert.alert('Error', errorMessage);
    }
  };

  const handleEdit = (categoria) => {
    setEditingCategoria(categoria);
    setFormData({
      nombre: categoria.nombre || '',
      descripcion: categoria.descripcion || '',
      icono: categoria.icono || 'folder',
      color: categoria.color || '#667eea',
      orden: categoria.orden || 0,
      activo: categoria.activo !== undefined ? categoria.activo : true,
      eliminado: categoria.eliminado || false,  // ✅ NUEVO
      id_agente: categoria.id_agente || null,
      id_categoria_padre: categoria.id_categoria_padre || null,
    });
    setErrors({});
    setShowModal(true);
  };

  const handleDelete = (id) => {
    // 🔒 SECURITY: Rate limiting on delete operations
    if (!rateLimiterRef.current.isAllowed('handleDelete')) {
      SecurityUtils.logSecurityEvent('RATE_LIMIT_EXCEEDED', {
        function: 'handleDelete',
        operation: 'delete',
        limit: '5 per 60s'
      });
      Alert.alert('Seguridad', 'Demasiadas solicitudes de eliminación. Por favor, espere.');
      return;
    }

    // 🔒 SECURITY: Validate ID
    if (!SecurityUtils.validateId(id)) {
      Alert.alert('Error', 'ID de categoría inválido');
      SecurityUtils.logSecurityEvent('INVALID_ID_DELETE', { id, function: 'handleDelete' });
      return;
    }

    // 🔒 SECURITY: Verificar que la categoría existe
    const categoriaExiste = categorias.some(c => c.id_categoria === id);
    if (!categoriaExiste) {
      SecurityUtils.logSecurityEvent('DELETE_NONEXISTENT_CATEGORY', { id, function: 'handleDelete' });
      Alert.alert('Error', 'La categoría no existe');
      return;
    }

    // Guardar la categoría a eliminar y mostrar modal
    SecurityUtils.logSecurityEvent('DELETE_MODAL_OPENED', { 
      id, 
      function: 'handleDelete',
      timestamp: new Date().toISOString()
    });
    setCategoriaToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!categoriaToDelete) return;

    // 🔒 SECURITY: Rate limiting on confirm delete
    if (!rateLimiterRef.current.isAllowed('confirmDelete')) {
      SecurityUtils.logSecurityEvent('RATE_LIMIT_EXCEEDED', {
        function: 'confirmDelete',
        operation: 'confirm_delete',
        limit: '5 per 60s'
      });
      Alert.alert('Seguridad', 'Demasiadas solicitudes. Por favor, espere.');
      setShowDeleteModal(false);
      setCategoriaToDelete(null);
      return;
    }

    // 🔒 SECURITY: Validar que el ID es un número válido
    const id = parseInt(categoriaToDelete);
    if (!SecurityUtils.validateId(id)) {
      Alert.alert('Error', 'ID de categoría inválido');
      SecurityUtils.logSecurityEvent('INVALID_DELETE_ID', { 
        id: categoriaToDelete,
        function: 'confirmDelete'
      });
      setShowDeleteModal(false);
      setCategoriaToDelete(null);
      return;
    }

    // 🔒 SECURITY: Verificar que la categoría existe antes de eliminar
    const categoriaExiste = categorias.some(c => c.id_categoria === id);
    if (!categoriaExiste) {
      Alert.alert('Error', 'La categoría no existe o ya fue eliminada');
      SecurityUtils.logSecurityEvent('DELETE_NONEXISTENT_CATEGORY', { 
        id,
        function: 'confirmDelete'
      });
      setShowDeleteModal(false);
      setCategoriaToDelete(null);
      return;
    }

    try {
      SecurityUtils.logSecurityEvent('DELETE_CATEGORY_START', { 
        id,
        function: 'confirmDelete',
        timestamp: new Date().toISOString()
      });

      // ✅ Eliminado lógico
      await categoriaService.delete(id);
      
      setSuccessMessage('🗑️ Categoría eliminada correctamente');
      setShowSuccessMessage(true);
      setShowDeleteModal(false);
      setCategoriaToDelete(null);
      
      SecurityUtils.logSecurityEvent('CATEGORIA_DELETED_SUCCESS', { 
        id,
        function: 'confirmDelete',
        timestamp: new Date().toISOString()
      });
      
      await cargarCategorias();

      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000);
    } catch (err) {
      console.error('Error al eliminar:', err);
      SecurityUtils.logSecurityEvent('DELETE_CATEGORY_ERROR', { 
        id, 
        message: err.message,
        function: 'confirmDelete',
        timestamp: new Date().toISOString()
      });

      // ✅ Cerrar modal de confirmación
      setShowDeleteModal(false);
      setCategoriaToDelete(null);

      // ✅ Extraer el mensaje de error del backend
      const errorMessage = err?.response?.data?.message
        || err?.message
        || 'No se pudo eliminar la categoría';

      // ✅ Mostrar modal de error personalizado
      setErrorModalMessage(errorMessage);
      setShowErrorModal(true);
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      descripcion: '',
      icono: 'folder',
      color: '#667eea',
      orden: 0,
      activo: true,
      eliminado: false,  // ✅ NUEVO
      id_agente: null,
      id_categoria_padre: null,
    });
    setEditingCategoria(null);
    setErrors({});
    setSearchAgente('');
    setShowAllAgentes(false);
  };


  const handleOpenDetalle = (categoria) => {
    setCategoriaDetalle(categoria);
    setBreadcrumb([categoria]);
    setShowDetalleModal(true);
  };

  const handleNavigateToSubcategoria = (subcategoria) => {
    setBreadcrumb([...breadcrumb, subcategoria]);
    setCategoriaDetalle(subcategoria);
  };

  const handleBreadcrumbClick = (index) => {
    const newBreadcrumb = breadcrumb.slice(0, index + 1);
    setBreadcrumb(newBreadcrumb);
    setCategoriaDetalle(newBreadcrumb[newBreadcrumb.length - 1]);
  };

  const getSubcategorias = (idCategoriaPadre) => {
    return categorias.filter(cat =>
      cat.id_categoria_padre === idCategoriaPadre &&
      !cat.eliminado  // ✅ NUEVO: Excluir eliminadas
    );
  };

  const handleInputChange = (field, value) => {
    if (errors[field]) {
      setErrors({ ...errors, [field]: null });
    }

    // Para campos de texto (nombre, descripcion), NO sanitizar mientras el usuario escribe
    // Solo sanitizar cuando se valide el formulario
    let sanitizedValue = value;

    // Validar IDs numéricos
    if (['id_agente', 'id_categoria_padre', 'orden'].includes(field)) {
      const numValue = parseInt(value);
      if (isNaN(numValue) || numValue < 0) {
        return; // No actualizar si el valor no es válido
      }
      sanitizedValue = numValue;
    }

    // Validar icono
    if (field === 'icono' && !iconosDisponibles.includes(value)) {
      return; // No actualizar si el icono no está permitido
    }

    // Validar color
    if (field === 'color' && !coloresDisponibles.some(c => c.hex === value)) {
      return; // No actualizar si el color no está permitido
    }

    // Si cambió el agente, resetear la categoría padre
    if (field === 'id_agente') {
      setFormData({
        ...formData,
        [field]: sanitizedValue,
        id_categoria_padre: null
      });
    } else {
      setFormData({ ...formData, [field]: sanitizedValue });
    }
  };

  const handleSearchChange = (text) => {
    // 🔒 SECURITY: Rate limiting on search
    if (!rateLimiterRef.current.isAllowed('handleSearch')) {
      SecurityUtils.logSecurityEvent('RATE_LIMIT_EXCEEDED', {
        function: 'handleSearchChange',
        operation: 'search',
        limit: '30 per 60s'
      });
      return;
    }

    // 🔒 SECURITY: Detectar intento de XSS
    if (SecurityUtils.detectXssAttempt(text)) {
      SecurityUtils.logSecurityEvent('XSS_ATTEMPT_DETECTED', {
        function: 'handleSearchChange',
        attempt: text.substring(0, 100)
      });
      Alert.alert('Seguridad', 'Se detectó un intento sospechoso. Por favor, revise su entrada.');
      return;
    }

    // 🔒 SECURITY: Sanitizar término de búsqueda
    const sanitized = SecurityUtils.sanitizeText(text);
    
    // Limitar longitud
    const limited = sanitized.substring(0, 100);
    
    setSearchTerm(limited);
    SecurityUtils.logSecurityEvent('SEARCH_PERFORMED', {
      function: 'handleSearchChange',
      searchLength: limited.length
    });
  };


  const getAgenteNombre = (id_agente) => {
    const agente = agentes.find(a => a.id_agente === id_agente);
    return agente?.nombre_agente || 'Sin agente';
  };

  const filteredAgentes = agentes.filter((agente) => {
    const search = searchAgente.toLowerCase();
    return !search || agente.nombre_agente?.toLowerCase().includes(search);
  });

  const filteredFilterAgentes = agentes.filter((agente) => {
    const search = searchFilterAgente.toLowerCase();
    return !search || agente.nombre_agente?.toLowerCase().includes(search);
  });

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
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.title}>📁 Categorías</Text>
              <Text style={styles.subtitle}>
                {categorias.length} {categorias.length === 1 ? 'categoría registrada' : 'categorías registradas'}
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
              <Text style={styles.buttonText}>Nueva</Text>
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
              placeholder="Buscar por nombre o código..."
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

          {/* ============ FILTROS ============ */}
          <View style={{ paddingHorizontal: 16 }}>
            {/* Filtro por Estado */}
            <View style={[
              styles.filterContainer,
              // ✅ Forzar que se ajusten en móvil
              !isWeb && {
                flexDirection: 'row',
                flexWrap: 'nowrap',
                justifyContent: 'space-between',
                paddingHorizontal: 16,
                gap: 6,
              }
            ]}>
              {[
                { key: 'all', label: 'Todas', icon: 'apps' },
                { key: 'true', label: 'Activas', icon: 'checkmark-circle' },
                { key: 'false', label: 'Inactivas', icon: 'close-circle' }
              ].map((filter) => (
                <TouchableOpacity
                  key={filter.key}
                  style={[
                    styles.filterButton,
                    filterActivo === filter.key && styles.filterButtonActive,
                    // ✅ Botones MUY compactos en móvil
                    !isWeb && {
                      paddingHorizontal: 6,
                      paddingVertical: 5,
                      minWidth: 0,
                      flex: 1,
                      maxWidth: '31%', // ✅ CRÍTICO: Limitar ancho máximo
                    }
                  ]}
                  onPress={() => setFilterActivo(filter.key)}
                  activeOpacity={0.7}
                >
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: isWeb ? 6 : 2,
                    justifyContent: 'center'
                  }}>
                    <Ionicons
                      name={filter.icon}
                      size={isWeb ? 14 : 10}
                      color={filterActivo === filter.key ? 'white' : 'rgba(255, 255, 255, 0.6)'}
                    />
                    <Text
                      style={[
                        styles.filterText,
                        filterActivo === filter.key && styles.filterTextActive,
                        // ✅ Texto MUY pequeño en móvil
                        !isWeb && {
                          fontSize: 9,
                        }
                      ]}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {filter.label}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* Filtro por Agente */}
            <View style={{ marginTop: 12 }}>
              {/* 🔍 Búsqueda compacta */}
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
                paddingHorizontal: 16,
                paddingVertical: 8,
                marginBottom: 8,
                borderRadius: 8,
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.08)',
              }}>
                <Ionicons name="search" size={16} color="rgba(255, 255, 255, 0.4)" />
                <TextInput
                  style={{
                    flex: 1,
                    color: 'white',
                    fontSize: 13,
                    paddingVertical: 2,
                  }}
                  placeholder="Buscar agente..."
                  placeholderTextColor="rgba(255, 255, 255, 0.3)"
                  value={searchFilterAgente}
                  onChangeText={(text) => setSearchFilterAgente(text.substring(0, 100))}
                  maxLength={100}
                />
                {searchFilterAgente.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchFilterAgente('')}>
                    <Ionicons name="close-circle" size={16} color="rgba(255, 255, 255, 0.4)" />
                  </TouchableOpacity>
                )}
              </View>

              {/* Botones de filtro */}
              <ScrollView
                ref={scrollRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{
                  paddingHorizontal: 16,
                  paddingVertical: 4,
                  paddingRight: 32,
                }}
                style={{
                  flexGrow: 0,
                }}
                onStartShouldSetResponder={() => Platform.OS === 'web'}
                onMoveShouldSetResponder={() => Platform.OS === 'web' && isDragging}
                onResponderGrant={(e) => {
                  if (Platform.OS === 'web' && e.nativeEvent.button === 0) {
                    setIsDragging(true);
                    setStartX(e.nativeEvent.pageX);
                    if (scrollRef.current) {
                      scrollRef.current.measure((x, y, width, height, pageX, pageY) => {
                        setScrollLeft(scrollRef.current.scrollLeft || 0);
                      });
                    }
                  }
                }}
                onResponderMove={(e) => {
                  if (Platform.OS === 'web' && isDragging && scrollRef.current) {
                    const x = e.nativeEvent.pageX;
                    const walk = (startX - x) * 2;
                    scrollRef.current.scrollTo({ x: (scrollLeft || 0) + walk, animated: false });
                  }
                }}
                onResponderRelease={() => {
                  if (Platform.OS === 'web') {
                    setIsDragging(false);
                  }
                }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    gap: 8,
                    cursor: Platform.OS === 'web' ? (isDragging ? 'grabbing' : 'grab') : 'default',
                  }}
                  onMouseDown={(e) => {
                    if (Platform.OS === 'web') {
                      e.preventDefault();
                      setIsDragging(true);
                      setStartX(e.pageX);
                      if (scrollRef.current) {
                        setScrollLeft(scrollRef.current.scrollLeft || 0);
                      }
                    }
                  }}
                  onMouseMove={(e) => {
                    if (Platform.OS === 'web' && isDragging && scrollRef.current) {
                      e.preventDefault();
                      const x = e.pageX;
                      const walk = (startX - x) * 2;
                      scrollRef.current.scrollTo({ x: (scrollLeft || 0) + walk, animated: false });
                    }
                  }}
                  onMouseUp={() => {
                    if (Platform.OS === 'web') {
                      setIsDragging(false);
                    }
                  }}
                  onMouseLeave={() => {
                    if (Platform.OS === 'web') {
                      setIsDragging(false);
                    }
                  }}
                >
                  <TouchableOpacity
                    style={[
                      styles.filterButton,
                      filterAgente === 'all' && styles.filterButtonActive,
                    ]}
                    onPress={() => setFilterAgente('all')}
                    activeOpacity={0.7}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Ionicons
                        name="globe"
                        size={14}
                        color={filterAgente === 'all' ? 'white' : 'rgba(255, 255, 255, 0.6)'}
                      />
                      <Text
                        style={[
                          styles.filterText,
                          filterAgente === 'all' && styles.filterTextActive,
                        ]}
                        numberOfLines={1}
                      >
                        Todos
                      </Text>
                    </View>
                  </TouchableOpacity>

                  {filteredFilterAgentes.map((agente) => (
                    <TouchableOpacity
                      key={agente.id_agente}
                      style={[
                        styles.filterButton,
                        filterAgente === agente.id_agente.toString() && styles.filterButtonActive,
                      ]}
                      onPress={() => setFilterAgente(agente.id_agente.toString())}
                      activeOpacity={0.7}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Ionicons
                          name="person"
                          size={14}
                          color={filterAgente === agente.id_agente.toString() ? 'white' : 'rgba(255, 255, 255, 0.6)'}
                        />
                        <Text
                          style={[
                            styles.filterText,
                            filterAgente === agente.id_agente.toString() && styles.filterTextActive,
                          ]}
                          numberOfLines={1}
                        >
                          {agente.nombre_agente}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          </View>

          {/* ============ LISTA ============ */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#667eea" />
              <Text style={styles.loadingText}>Cargando categorías...</Text>
            </View>
          ) : (
            <FlatList
              data={filteredCategorias}
              keyExtractor={(item) => item.id_categoria?.toString() || Math.random().toString()}
              renderItem={({ item }) => (
                <GestionCategoriaCard
                  categoria={item}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onPress={handleOpenDetalle}
                  agenteNombre={getAgenteNombre(item.id_agente)}
                />
              )}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Ionicons name="folder-open-outline" size={80} color="rgba(255, 255, 255, 0.2)" />
                  <Text style={styles.emptyText}>No se encontraron categorías</Text>
                  <Text style={{ color: 'rgba(255, 255, 255, 0.3)', marginTop: 8, fontSize: 14 }}>
                    {searchTerm ? 'Intenta con otros términos de búsqueda' : 'Crea tu primera categoría'}
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
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <View style={{
                      width: 48,
                      height: 48,
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
                        name={editingCategoria ? "create-outline" : "add-circle-outline"}
                        size={28}
                        color="#667eea"
                      />
                    </View>
                    <View>
                      <Text style={styles.modalTitle}>
                        {editingCategoria ? 'Editar Categoría' : 'Nueva Categoría'}
                      </Text>
                      <Text style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: 12, marginTop: 2 }}>
                        {editingCategoria ? 'Modifica la información de la categoría' : 'Completa los campos requeridos'}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 12,
                      backgroundColor: 'rgba(239, 68, 68, 0.15)',
                      justifyContent: 'center',
                      alignItems: 'center',
                      borderWidth: 1,
                      borderColor: 'rgba(239, 68, 68, 0.3)',
                    }}
                  >
                    <Ionicons name="close" size={22} color="#ef4444" />
                  </TouchableOpacity>
                </View>

                {/* Contenido del Modal */}
                <ScrollView
                  style={styles.modalContent}
                  contentContainerStyle={{ paddingBottom: 120 }}
                  showsVerticalScrollIndicator={true}
                  bounces={true}
                >

                  {/* Selector de Agente */}
                  <View style={styles.formGroup}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                      <Ionicons name="person-circle" size={16} color="#667eea" />
                      <Text style={styles.label}>
                        Agente Virtual <Text style={styles.required}>*</Text>
                      </Text>
                      <TooltipIcon text="Selecciona el agente virtual al que pertenecerá esta categoría. Una vez que la categoría tenga subcategorías, no podrás cambiar el agente." />
                    </View>

                    {editingCategoria && getSubcategorias(editingCategoria.id_categoria).length > 0 && (
                      <View style={{
                        flexDirection: 'row',
                        gap: 12,
                        padding: 12,
                        backgroundColor: 'rgba(251, 191, 36, 0.1)',
                        borderRadius: 12,
                        borderLeftWidth: 4,
                        borderLeftColor: '#fbbf24',
                        marginBottom: 12,
                      }}>
                        <Ionicons name="warning" size={20} color="#fbbf24" />
                        <Text style={{
                          flex: 1,
                          color: '#fbbf24',
                          fontSize: 13,
                          lineHeight: 18,
                        }}>
                          Esta categoría tiene {getSubcategorias(editingCategoria.id_categoria).length} subcategoría{getSubcategorias(editingCategoria.id_categoria).length === 1 ? '' : 's'}.
                          No podrás cambiar el agente hasta que elimines o muevas las subcategorías.
                        </Text>
                      </View>
                    )}

                    {loadingAgentes ? (

                      <View style={{
                        padding: 16,
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: 12,
                        alignItems: 'center',
                      }}>
                        <ActivityIndicator size="small" color="#667eea" />
                        <Text style={{ color: 'rgba(255, 255, 255, 0.5)', marginTop: 8, fontSize: 12 }}>
                          Cargando agentes...
                        </Text>
                      </View>
                    ) : (
                      <View style={{ gap: 8 }}>
                        {/* 🔍 Campo de búsqueda de agentes - SIEMPRE VISIBLE */}
                        <View style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 10,
                          paddingHorizontal: 14,
                          paddingVertical: 10,
                          borderRadius: 10,
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          borderWidth: 1,
                          borderColor: 'rgba(255, 255, 255, 0.1)',
                          marginBottom: 8,
                        }}>
                          <Ionicons name="search" size={18} color="rgba(255, 255, 255, 0.5)" />
                          <TextInput
                            style={{
                              flex: 1,
                              color: 'white',
                              fontSize: 14,
                              paddingVertical: 4,
                            }}
                            placeholder="Buscar agente..."
                            placeholderTextColor="rgba(255, 255, 255, 0.4)"
                            value={searchAgente}
                            onChangeText={(text) => setSearchAgente(text.substring(0, 100))}
                            maxLength={100}
                          />
                          {searchAgente.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchAgente('')}>
                              <Ionicons name="close-circle" size={18} color="rgba(255, 255, 255, 0.5)" />
                            </TouchableOpacity>
                          )}
                        </View>

                        {/* Lista de agentes filtrados */}
                        {filteredAgentes.length === 0 ? (
                          <View style={{
                            padding: 20,
                            alignItems: 'center',
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            borderRadius: 12,
                          }}>
                            <Ionicons name="search-outline" size={40} color="rgba(255, 255, 255, 0.3)" />
                            <Text style={{ color: 'rgba(255, 255, 255, 0.5)', marginTop: 8, fontSize: 13 }}>
                              No se encontraron agentes
                            </Text>
                          </View>
                        ) : (
                          <>
                            {/* Mostrar solo los primeros 3 o todos según showAllAgentes */}
                            {(showAllAgentes ? filteredAgentes : filteredAgentes.slice(0, 3)).map((agente) => {
                              // ✅ Calcular si tiene subcategorías y si está deshabilitado
                              const tieneSubcategorias = editingCategoria && getSubcategorias(editingCategoria.id_categoria).length > 0;
                              const esAgenteActual = editingCategoria && editingCategoria.id_agente === agente.id_agente;
                              const estaDeshabilitado = tieneSubcategorias && !esAgenteActual;

                              return (
                                <TouchableOpacity
                                  key={agente.id_agente}
                                  style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    gap: 12,
                                    padding: 14,
                                    borderRadius: 12,
                                    borderWidth: 2,
                                    borderColor: formData.id_agente === agente.id_agente
                                      ? '#667eea'
                                      : 'rgba(255, 255, 255, 0.15)',
                                    backgroundColor: formData.id_agente === agente.id_agente
                                      ? 'rgba(102, 126, 234, 0.2)'
                                      : 'rgba(255, 255, 255, 0.05)',
                                    opacity: estaDeshabilitado ? 0.4 : 1,
                                  }}
                                  onPress={() => {
                                    if (!estaDeshabilitado) {
                                      handleInputChange('id_agente', agente.id_agente);
                                    }
                                  }}
                                  activeOpacity={estaDeshabilitado ? 1 : 0.7}
                                  disabled={estaDeshabilitado}
                                >
                                  <View style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 10,
                                    backgroundColor: agente.color_tema || '#667eea',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                  }}>
                                    <Ionicons
                                      name="person"
                                      size={22}
                                      color="white"
                                    />
                                  </View>
                                  <View style={{ flex: 1 }}>
                                    <Text style={{
                                      color: formData.id_agente === agente.id_agente ? '#667eea' : 'white',
                                      fontWeight: '700',
                                      fontSize: 15,
                                    }}>
                                      {agente.nombre_agente}
                                    </Text>
                                    <Text style={{
                                      color: 'rgba(255, 255, 255, 0.5)',
                                      fontSize: 12,
                                      marginTop: 2,
                                    }}>
                                      {agente.area_especialidad || 'Agente general'}
                                    </Text>
                                  </View>
                                  {formData.id_agente === agente.id_agente && (
                                    <Ionicons name="checkmark-circle" size={24} color="#667eea" />
                                  )}
                                  {estaDeshabilitado && (
                                    <Ionicons name="lock-closed" size={20} color="rgba(255, 255, 255, 0.3)" />
                                  )}
                                </TouchableOpacity>
                              );
                            })}

                            {/* Botón "Ver más" / "Ver menos" */}
                            {filteredAgentes.length > 3 && (
                              <TouchableOpacity
                                style={{
                                  flexDirection: 'row',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: 8,
                                  padding: 12,
                                  borderRadius: 10,
                                  backgroundColor: 'rgba(102, 126, 234, 0.15)',
                                  borderWidth: 1,
                                  borderColor: 'rgba(102, 126, 234, 0.3)',
                                  marginTop: 8,
                                }}
                                onPress={() => setShowAllAgentes(!showAllAgentes)}
                                activeOpacity={0.7}
                              >
                                <Ionicons
                                  name={showAllAgentes ? "chevron-up" : "chevron-down"}
                                  size={18}
                                  color="#667eea"
                                />
                                <Text style={{
                                  color: '#667eea',
                                  fontSize: 14,
                                  fontWeight: '600',
                                }}>
                                  {showAllAgentes
                                    ? 'Ver menos'
                                    : `Ver ${filteredAgentes.length - 3} agente${filteredAgentes.length - 3 === 1 ? '' : 's'} más`
                                  }
                                </Text>
                              </TouchableOpacity>
                            )}
                          </>
                        )}

                        {errors.id_agente && (
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 }}>
                            <Ionicons name="alert-circle" size={14} color="#ef4444" />
                            <Text style={{ color: '#ef4444', fontSize: 12, fontWeight: '600' }}>
                              {errors.id_agente}
                            </Text>
                          </View>
                        )}
                      </View>
                    )}
                  </View>

                  {/* ========== Selector de Categoría Padre/Hija ========== */}
                  <View style={styles.formGroup}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                      <Ionicons name="git-branch" size={16} color="#667eea" />
                      <Text style={styles.label}>
                        Nivel de Categoría
                        <Text style={{ fontSize: 11, fontWeight: '400', color: 'rgba(255, 255, 255, 0.5)', textTransform: 'none' }}>
                          {' '}(¿Es una categoría independiente o depende de otra?)
                        </Text>
                      </Text>
                      <TooltipIcon text="Elige si esta categoría es independiente (aparecerá en el menú principal) o si depende de otra categoría existente (será una subcategoría que se mostrará dentro de otra)." />
                    </View>

                    {/* Opción: Categoría independiente (sin padre) */}
                    <TouchableOpacity
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 12,
                        padding: 14,
                        borderRadius: 12,
                        borderWidth: 2,
                        borderColor: formData.id_categoria_padre === null
                          ? '#667eea'
                          : 'rgba(255, 255, 255, 0.15)',
                        backgroundColor: formData.id_categoria_padre === null
                          ? 'rgba(102, 126, 234, 0.2)'
                          : 'rgba(255, 255, 255, 0.05)',
                        marginBottom: 8,
                      }}
                      onPress={() => handleInputChange('id_categoria_padre', null)}
                      activeOpacity={0.7}
                    >
                      <View style={{
                        width: 40,
                        height: 40,
                        borderRadius: 10,
                        backgroundColor: 'rgba(102, 126, 234, 0.3)',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}>
                        <Ionicons name="home" size={22} color="#667eea" />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{
                          color: formData.id_categoria_padre === null ? '#667eea' : 'white',
                          fontWeight: '700',
                          fontSize: 15,
                        }}>
                          Categoría Independiente
                        </Text>
                        <Text style={{
                          color: 'rgba(255, 255, 255, 0.5)',
                          fontSize: 12,
                          marginTop: 2,
                        }}>
                          Aparecerá directamente en el menú principal
                        </Text>
                      </View>
                      {formData.id_categoria_padre === null && (
                        <Ionicons name="checkmark-circle" size={24} color="#667eea" />
                      )}
                    </TouchableOpacity>

                    {/* Texto explicativo si hay categorías disponibles */}
                    {formData.id_agente && categorias.filter(cat =>
                      cat.id_agente === formData.id_agente &&
                      (!editingCategoria || cat.id_categoria !== editingCategoria.id_categoria)
                    ).length > 0 && (
                        <View style={{
                          padding: 12,
                          backgroundColor: 'rgba(102, 126, 234, 0.1)',
                          borderRadius: 10,
                          marginBottom: 8,
                          borderLeftWidth: 3,
                          borderLeftColor: '#667eea',
                        }}>
                          <Text style={{
                            color: 'rgba(255, 255, 255, 0.7)',
                            fontSize: 12,
                            lineHeight: 18,
                          }}>
                            O selecciona una categoría existente para crear una subcategoría dentro de ella:
                          </Text>
                        </View>
                      )}

                    {/* Lista de categorías disponibles como padre */}
                    {categorias
                      .filter(cat => {
                        // Filtrar: solo categorías del mismo agente
                        if (!formData.id_agente || cat.id_agente !== formData.id_agente) return false;

                        // Filtrar: no puede ser padre de sí misma (al editar)
                        if (editingCategoria && cat.id_categoria === editingCategoria.id_categoria) return false;

                        // Filtrar: no mostrar categorías que ya son hijas de esta (evitar ciclos)
                        if (editingCategoria && cat.id_categoria_padre === editingCategoria.id_categoria) return false;

                        return true;
                      })
                      .map((cat) => (
                        <TouchableOpacity
                          key={cat.id_categoria}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 12,
                            padding: 14,
                            borderRadius: 12,
                            borderWidth: 2,
                            borderColor: formData.id_categoria_padre === cat.id_categoria
                              ? '#667eea'
                              : 'rgba(255, 255, 255, 0.15)',
                            backgroundColor: formData.id_categoria_padre === cat.id_categoria
                              ? 'rgba(102, 126, 234, 0.2)'
                              : 'rgba(255, 255, 255, 0.05)',
                            marginBottom: 8,
                          }}
                          onPress={() => handleInputChange('id_categoria_padre', cat.id_categoria)}
                          activeOpacity={0.7}
                        >
                          <View style={{
                            width: 40,
                            height: 40,
                            borderRadius: 10,
                            backgroundColor: cat.color || '#667eea',
                            justifyContent: 'center',
                            alignItems: 'center',
                          }}>
                            <Ionicons name={cat.icono || 'folder'} size={22} color="white" />
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={{
                              color: formData.id_categoria_padre === cat.id_categoria ? '#667eea' : 'white',
                              fontWeight: '700',
                              fontSize: 15,
                            }}>
                              Dentro de: {cat.nombre}
                            </Text>
                            {cat.descripcion && (
                              <Text
                                style={{
                                  color: 'rgba(255, 255, 255, 0.5)',
                                  fontSize: 12,
                                  marginTop: 2,
                                }}
                                numberOfLines={1}
                              >
                                {cat.descripcion}
                              </Text>
                            )}
                          </View>
                          {formData.id_categoria_padre === cat.id_categoria && (
                            <Ionicons name="checkmark-circle" size={24} color="#667eea" />
                          )}
                        </TouchableOpacity>
                      ))
                    }

                    {/* Mensaje si no hay categorías disponibles */}
                    {formData.id_agente && categorias.filter(cat =>
                      cat.id_agente === formData.id_agente &&
                      (!editingCategoria || cat.id_categoria !== editingCategoria.id_categoria)
                    ).length === 0 && (
                        <View style={{
                          padding: 16,
                          alignItems: 'center',
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          borderRadius: 12,
                          marginTop: 8,
                        }}>
                          <Ionicons name="information-circle" size={32} color="rgba(255, 255, 255, 0.3)" />
                          <Text style={{ color: 'rgba(255, 255, 255, 0.5)', marginTop: 8, fontSize: 13, textAlign: 'center' }}>
                            No hay otras categorías disponibles del agente seleccionado.
                            Esta será una categoría independiente.
                          </Text>
                        </View>
                      )}

                    {/* Mensaje si no se ha seleccionado agente */}
                    {!formData.id_agente && (
                      <View style={{
                        padding: 16,
                        alignItems: 'center',
                        backgroundColor: 'rgba(251, 191, 36, 0.1)',
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: 'rgba(251, 191, 36, 0.3)',
                        marginTop: 8,
                      }}>
                        <Ionicons name="alert-circle" size={32} color="#fbbf24" />
                        <Text style={{ color: '#fbbf24', marginTop: 8, fontSize: 13, textAlign: 'center', fontWeight: '600' }}>
                          Primero selecciona un agente para ver las categorías disponibles
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Nombre */}
                  <View style={styles.formGroup}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                      <Ionicons name="text" size={16} color="#667eea" />
                      <Text style={styles.label}>
                        Nombre <Text style={styles.required}>*</Text>
                        <Text style={{ fontSize: 11, fontWeight: '400', color: 'rgba(255, 255, 255, 0.5)', textTransform: 'none' }}>
                          {' '}(3-100 caracteres)
                        </Text>
                      </Text>
                      <TooltipIcon text="Ingresa un nombre descriptivo para la categoría. Debe tener entre 3 y 100 caracteres. Ejemplo: 'Solicitudes de Información', 'Quejas y Reclamos'." />
                    </View>
                    <TextInput
                      style={[styles.input, errors.nombre && { borderColor: '#ef4444', borderWidth: 2 }]}
                      value={formData.nombre}
                      onChangeText={(text) => handleInputChange('nombre', text)}
                      placeholder="Ej: Solicitud de Información"
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
                      {formData.nombre.length >= 3 && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                          <Ionicons name="checkmark-circle" size={14} color="#10b981" />
                          <Text style={{ color: '#10b981', fontSize: 11, fontWeight: '600' }}>Válido</Text>
                        </View>
                      )}
                    </View>
                  </View>

                  {/* Selector de Icono */}
                  <View style={styles.formGroup}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                      <Ionicons name="star" size={16} color="#667eea" />
                      <Text style={styles.label}>Icono Seleccionado</Text>
                      <TooltipIcon text="Elige un icono representativo para esta categoría. El icono ayuda a identificar visualmente la categoría en la interfaz." />
                    </View>

                    {/* Vista previa del icono seleccionado */}
                    <View style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 12,
                      padding: 16,
                      borderRadius: 12,
                      backgroundColor: 'rgba(102, 126, 234, 0.15)',
                      borderWidth: 1,
                      borderColor: 'rgba(102, 126, 234, 0.3)',
                      marginBottom: 12,
                    }}>
                      <View style={{
                        width: 48,
                        height: 48,
                        borderRadius: 12,
                        backgroundColor: formData.color || '#667eea',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}>
                        <Ionicons name={formData.icono || 'folder'} size={28} color="white" />
                      </View>
                      <View>
                        <Text style={{ color: '#667eea', fontWeight: '700', fontSize: 15 }}>
                          {formData.icono || 'folder'}
                        </Text>
                        <Text style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: 12, marginTop: 2 }}>
                          Vista previa del icono
                        </Text>
                      </View>
                    </View>

                    {/* Grid de iconos */}
                    <View style={{
                      flexDirection: 'row',
                      flexWrap: 'wrap',
                      gap: 8,
                      padding: 12,
                      borderRadius: 12,
                      backgroundColor: 'rgba(255, 255, 255, 0.03)',
                      borderWidth: 1,
                      borderColor: 'rgba(255, 255, 255, 0.08)',
                      maxHeight: 300,
                    }}>
                      <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}
                      >
                        {iconosDisponibles.map((icono) => (
                          <TouchableOpacity
                            key={icono}
                            style={{
                              width: 52,
                              height: 52,
                              borderRadius: 12,
                              justifyContent: 'center',
                              alignItems: 'center',
                              backgroundColor: formData.icono === icono
                                ? 'rgba(102, 126, 234, 0.3)'
                                : 'rgba(255, 255, 255, 0.05)',
                              borderWidth: 2,
                              borderColor: formData.icono === icono
                                ? '#667eea'
                                : 'transparent',
                            }}
                            onPress={() => handleInputChange('icono', icono)}
                            activeOpacity={0.7}
                          >
                            <Ionicons
                              name={icono}
                              size={24}
                              color={formData.icono === icono ? '#667eea' : 'rgba(255, 255, 255, 0.6)'}
                            />
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  </View>





                  {/* Selector de Color */}
                  <View style={styles.formGroup}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                      <Ionicons name="color-palette" size={16} color="#667eea" />
                      <Text style={styles.label}>Color Seleccionado</Text>
                      <TooltipIcon text="Selecciona un color que identifique esta categoría. El color se usará en tarjetas, badges y otros elementos visuales de la interfaz." />
                    </View>

                    {/* Color actual */}
                    <View style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 12,
                      padding: 16,
                      borderRadius: 12,
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      borderWidth: 1,
                      borderColor: 'rgba(255, 255, 255, 0.1)',
                      marginBottom: 12,
                    }}>
                      <View style={{
                        width: 48,
                        height: 48,
                        borderRadius: 12,
                        backgroundColor: formData.color || '#667eea',
                        borderWidth: 2,
                        borderColor: 'rgba(255, 255, 255, 0.2)',
                      }} />
                      <View>
                        <Text style={{ color: 'white', fontWeight: '700', fontSize: 15 }}>
                          {coloresDisponibles.find(c => c.hex === formData.color)?.nombre || 'Personalizado'}
                        </Text>
                        <Text style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: 12, marginTop: 2 }}>
                          {formData.color || '#667eea'}
                        </Text>
                      </View>
                    </View>

                    {/* Grid de colores */}
                    <View style={{
                      flexDirection: 'row',
                      flexWrap: 'wrap',
                      gap: 12,
                      padding: 16,
                      borderRadius: 12,
                      backgroundColor: 'rgba(255, 255, 255, 0.03)',
                      borderWidth: 1,
                      borderColor: 'rgba(255, 255, 255, 0.08)',
                    }}>
                      {coloresDisponibles.map((color) => (
                        <TouchableOpacity
                          key={color.hex}
                          style={{
                            width: 56,
                            height: 56,
                            borderRadius: 14,
                            backgroundColor: color.hex,
                            justifyContent: 'center',
                            alignItems: 'center',
                            borderWidth: 3,
                            borderColor: formData.color === color.hex
                              ? 'white'
                              : 'transparent',
                            shadowColor: color.hex,
                            shadowOpacity: formData.color === color.hex ? 0.5 : 0.2,
                            shadowRadius: 8,
                            shadowOffset: { width: 0, height: 4 },
                            elevation: formData.color === color.hex ? 8 : 2,
                          }}
                          onPress={() => handleInputChange('color', color.hex)}
                          activeOpacity={0.8}
                        >
                          {formData.color === color.hex && (
                            <Ionicons name="checkmark" size={28} color="white" />
                          )}
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  {/* Orden */}
                  <View style={styles.formGroup}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                      <Ionicons name="reorder-three" size={16} color="#667eea" />
                      <Text style={styles.label}>Orden</Text>
                      <TooltipIcon text="Define el orden de aparición de esta categoría. Un número menor aparecerá primero. Ejemplo: 1, 2, 3... Las categorías se ordenarán de menor a mayor." />
                    </View>

                    {/* Selector visual de 1 a 10 */}
                    <View style={{
                      flexDirection: 'row',
                      flexWrap: 'wrap',
                      gap: 8,
                      padding: 12,
                      borderRadius: 12,
                      backgroundColor: 'rgba(255, 255, 255, 0.03)',
                      borderWidth: 1,
                      borderColor: 'rgba(255, 255, 255, 0.08)',
                    }}>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((numero) => (
                        <TouchableOpacity
                          key={numero}
                          style={{
                            width: 50,
                            height: 50,
                            borderRadius: 12,
                            justifyContent: 'center',
                            alignItems: 'center',
                            backgroundColor: formData.orden === numero
                              ? 'rgba(102, 126, 234, 0.3)'
                              : 'rgba(255, 255, 255, 0.05)',
                            borderWidth: 2,
                            borderColor: formData.orden === numero
                              ? '#667eea'
                              : 'rgba(255, 255, 255, 0.15)',
                          }}
                          onPress={() => handleInputChange('orden', numero)}
                          activeOpacity={0.7}
                        >
                          <Text style={{
                            color: formData.orden === numero ? '#667eea' : 'rgba(255, 255, 255, 0.7)',
                            fontSize: 18,
                            fontWeight: '700',
                          }}>
                            {numero}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>

                    {/* Muestra el número seleccionado */}
                    <View style={{
                      marginTop: 12,
                      padding: 12,
                      borderRadius: 10,
                      backgroundColor: 'rgba(102, 126, 234, 0.1)',
                      borderLeftWidth: 3,
                      borderLeftColor: '#667eea',
                    }}>
                      <Text style={{
                        color: 'rgba(255, 255, 255, 0.7)',
                        fontSize: 13,
                      }}>
                        Orden seleccionado: <Text style={{ color: '#667eea', fontWeight: '700', fontSize: 15 }}>{formData.orden}</Text>
                      </Text>
                    </View>
                  </View>

                  {/* Descripción */}
                  <View style={styles.formGroup}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                      <Ionicons name="document-text" size={16} color="#667eea" />
                      <Text style={styles.label}>
                        Descripción
                      </Text>
                      <TooltipIcon text="Agrega una descripción detallada de la categoría. Explica qué tipo de contenido o consultas incluirá esta categoría. Máximo 500 caracteres." />
                    </View>
                    <TextInput
                      style={[styles.input, styles.textArea, errors.descripcion && { borderColor: '#ef4444', borderWidth: 2 }]}
                      value={formData.descripcion}
                      onChangeText={(text) => handleInputChange('descripcion', text)}
                      placeholder="Descripción de la categoría..."
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

                  {/* Checkbox Activo */}
                  <TouchableOpacity
                    style={styles.checkboxContainer}
                    onPress={() => setFormData({ ...formData, activo: !formData.activo })}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={formData.activo ? 'checkbox' : 'square-outline'}
                      size={28}
                      color="#667eea"
                    />
                    <Text style={styles.checkboxLabel}>Categoría activa</Text>
                  </TouchableOpacity>

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
                      name={editingCategoria ? "checkmark-circle" : "add-circle"}
                      size={20}
                      color="white"
                    />
                    <Text style={styles.buttonText}>
                      {editingCategoria ? 'Actualizar' : 'Crear'}
                    </Text>
                  </TouchableOpacity>
                </View>

              </View>
            </View>
          </Modal>

          {/* ============ MODAL DETALLE CATEGORÍA ============ */}
          <Modal visible={showDetalleModal} animationType="fade" transparent>
            <View style={styles.modalOverlay}>
              <View style={[styles.modal, { maxWidth: 700, maxHeight: '90%' }]}>

                {/* Header del Modal */}
                <View style={styles.modalHeader}>
                  <View style={{ flex: 1 }}>
                    {/* Breadcrumb */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                      {breadcrumb.map((item, index) => (
                        <View key={item.id_categoria} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                          <TouchableOpacity
                            onPress={() => handleBreadcrumbClick(index)}
                            style={{
                              paddingHorizontal: 12,
                              paddingVertical: 6,
                              borderRadius: 8,
                              backgroundColor: index === breadcrumb.length - 1
                                ? 'rgba(102, 126, 234, 0.3)'
                                : 'rgba(255, 255, 255, 0.05)',
                            }}
                          >
                            <Text style={{
                              color: index === breadcrumb.length - 1 ? '#667eea' : 'rgba(255, 255, 255, 0.6)',
                              fontSize: 13,
                              fontWeight: index === breadcrumb.length - 1 ? '700' : '500',
                            }}>
                              {item.nombre}
                            </Text>
                          </TouchableOpacity>
                          {index < breadcrumb.length - 1 && (
                            <Ionicons name="chevron-forward" size={16} color="rgba(255, 255, 255, 0.4)" />
                          )}
                        </View>
                      ))}
                    </View>

                    {/* Título e info */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                      <View style={{
                        width: 48,
                        height: 48,
                        borderRadius: 14,
                        backgroundColor: categoriaDetalle?.color || '#667eea',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}>
                        <Ionicons
                          name={categoriaDetalle?.icono || 'folder'}
                          size={28}
                          color="white"
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.modalTitle}>{categoriaDetalle?.nombre}</Text>
                        <Text style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: 12, marginTop: 2 }}>
                          {getAgenteNombre(categoriaDetalle?.id_agente)}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <TouchableOpacity
                    onPress={() => {
                      setShowDetalleModal(false);
                      setCategoriaDetalle(null);
                      setBreadcrumb([]);
                    }}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 12,
                      backgroundColor: 'rgba(239, 68, 68, 0.15)',
                      justifyContent: 'center',
                      alignItems: 'center',
                      borderWidth: 1,
                      borderColor: 'rgba(239, 68, 68, 0.3)',
                    }}
                  >
                    <Ionicons name="close" size={22} color="#ef4444" />
                  </TouchableOpacity>
                </View>

                {/* Contenido del Modal */}
                <ScrollView
                  style={styles.modalContent}
                  contentContainerStyle={{ paddingBottom: 24 }}
                  showsVerticalScrollIndicator={false}
                >

                  {/* Información de la categoría */}
                  <View style={{ gap: 16 }}>

                    {/* Estado */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                      <View style={{
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderRadius: 8,
                        backgroundColor: categoriaDetalle?.activo
                          ? 'rgba(16, 185, 129, 0.2)'
                          : 'rgba(239, 68, 68, 0.2)',
                        borderWidth: 1,
                        borderColor: categoriaDetalle?.activo
                          ? 'rgba(16, 185, 129, 0.3)'
                          : 'rgba(239, 68, 68, 0.3)',
                      }}>
                        <Text style={{
                          color: categoriaDetalle?.activo ? '#10b981' : '#ef4444',
                          fontWeight: '700',
                          fontSize: 13,
                        }}>
                          {categoriaDetalle?.activo ? '✓ Activa' : '✗ Inactiva'}
                        </Text>
                      </View>

                      <View style={{
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderRadius: 8,
                        backgroundColor: 'rgba(102, 126, 234, 0.15)',
                        borderWidth: 1,
                        borderColor: 'rgba(102, 126, 234, 0.3)',
                      }}>
                        <Text style={{ color: '#667eea', fontWeight: '700', fontSize: 13 }}>
                          Orden: {categoriaDetalle?.orden || 0}
                        </Text>
                      </View>
                    </View>

                    {/* Descripción */}
                    {categoriaDetalle?.descripcion && (
                      <View style={{
                        padding: 16,
                        borderRadius: 12,
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        borderWidth: 1,
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                      }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                          <Ionicons name="document-text" size={16} color="#667eea" />
                          <Text style={{ color: '#667eea', fontWeight: '700', fontSize: 14 }}>
                            Descripción
                          </Text>
                        </View>
                        <Text style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: 14, lineHeight: 20 }}>
                          {categoriaDetalle.descripcion}
                        </Text>
                      </View>
                    )}

                    {/* Acciones rápidas */}
                    <View style={{ flexDirection: 'row', gap: 12 }}>
                      <TouchableOpacity
                        style={{
                          flex: 1,
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 8,
                          padding: 14,
                          borderRadius: 12,
                          backgroundColor: 'rgba(102, 126, 234, 0.15)',
                          borderWidth: 1,
                          borderColor: 'rgba(102, 126, 234, 0.3)',
                        }}
                        onPress={() => {
                          setShowDetalleModal(false);
                          handleEdit(categoriaDetalle);
                        }}
                      >
                        <Ionicons name="create" size={20} color="#667eea" />
                        <Text style={{ color: '#667eea', fontWeight: '700', fontSize: 14 }}>
                          Editar
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={{
                          flex: 1,
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 8,
                          padding: 14,
                          borderRadius: 12,
                          backgroundColor: 'rgba(239, 68, 68, 0.15)',
                          borderWidth: 1,
                          borderColor: 'rgba(239, 68, 68, 0.3)',
                        }}
                        onPress={() => {
                          setShowDetalleModal(false);
                          handleDelete(categoriaDetalle?.id_categoria);
                        }}
                      >
                        <Ionicons name="trash" size={20} color="#ef4444" />
                        <Text style={{ color: '#ef4444', fontWeight: '700', fontSize: 14 }}>
                          Eliminar
                        </Text>
                      </TouchableOpacity>
                    </View>

                    {/* Subcategorías */}
                    {categoriaDetalle && (
                      <View style={{ marginTop: 8 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                          <Ionicons name="git-branch" size={18} color="#667eea" />
                          <Text style={{ color: 'white', fontWeight: '700', fontSize: 16 }}>
                            Subcategorías
                          </Text>
                          <View style={{
                            paddingHorizontal: 8,
                            paddingVertical: 2,
                            borderRadius: 6,
                            backgroundColor: 'rgba(102, 126, 234, 0.3)',
                          }}>
                            <Text style={{ color: '#667eea', fontWeight: '700', fontSize: 12 }}>
                              {getSubcategorias(categoriaDetalle.id_categoria).length}
                            </Text>
                          </View>
                        </View>

                        {getSubcategorias(categoriaDetalle.id_categoria).length > 0 ? (
                          <View style={{ gap: 12 }}>
                            {getSubcategorias(categoriaDetalle.id_categoria).map((sub) => (
                              <TouchableOpacity
                                key={sub.id_categoria}
                                style={{
                                  flexDirection: 'row',
                                  alignItems: 'center',
                                  gap: 12,
                                  padding: 16,
                                  borderRadius: 12,
                                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                  borderWidth: 1,
                                  borderColor: 'rgba(255, 255, 255, 0.1)',
                                }}
                                onPress={() => handleNavigateToSubcategoria(sub)}
                                activeOpacity={0.7}
                              >
                                <View style={{
                                  width: 44,
                                  height: 44,
                                  borderRadius: 12,
                                  backgroundColor: sub.color || '#667eea',
                                  justifyContent: 'center',
                                  alignItems: 'center',
                                }}>
                                  <Ionicons name={sub.icono || 'folder'} size={24} color="white" />
                                </View>
                                <View style={{ flex: 1 }}>
                                  <Text style={{ color: 'white', fontWeight: '700', fontSize: 15 }}>
                                    {sub.nombre}
                                  </Text>
                                  {sub.descripcion && (
                                    <Text
                                      style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: 12, marginTop: 2 }}
                                      numberOfLines={1}
                                    >
                                      {sub.descripcion}
                                    </Text>
                                  )}
                                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
                                    <View style={{
                                      paddingHorizontal: 6,
                                      paddingVertical: 2,
                                      borderRadius: 4,
                                      backgroundColor: sub.activo
                                        ? 'rgba(16, 185, 129, 0.2)'
                                        : 'rgba(239, 68, 68, 0.2)',
                                    }}>
                                      <Text style={{
                                        color: sub.activo ? '#10b981' : '#ef4444',
                                        fontSize: 10,
                                        fontWeight: '700',
                                      }}>
                                        {sub.activo ? 'Activa' : 'Inactiva'}
                                      </Text>
                                    </View>
                                    {getSubcategorias(sub.id_categoria).length > 0 && (
                                      <Text style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: 11 }}>
                                        {getSubcategorias(sub.id_categoria).length} sub
                                      </Text>
                                    )}
                                  </View>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color="rgba(255, 255, 255, 0.3)" />
                              </TouchableOpacity>
                            ))}
                          </View>
                        ) : (
                          <View style={{
                            padding: 24,
                            alignItems: 'center',
                            backgroundColor: 'rgba(255, 255, 255, 0.03)',
                            borderRadius: 12,
                            borderWidth: 1,
                            borderColor: 'rgba(255, 255, 255, 0.05)',
                          }}>
                            <Ionicons name="file-tray-outline" size={40} color="rgba(255, 255, 255, 0.2)" />
                            <Text style={{ color: 'rgba(255, 255, 255, 0.5)', marginTop: 8, fontSize: 13 }}>
                              No hay subcategorías
                            </Text>
                          </View>
                        )}
                      </View>
                    )}
                  </View>
                </ScrollView>
              </View>
            </View>
          </Modal>
          {/* ============ MODAL CONFIRMACIÓN ELIMINAR ============ */}
          <Modal visible={showDeleteModal} animationType="fade" transparent>
            <View style={styles.modalOverlay}>
              <View style={[styles.modal, { maxWidth: 500, padding: 0 }]}>

                {/* Header del Modal */}
                <View style={{
                  padding: 24,
                  borderBottomWidth: 1,
                  borderBottomColor: 'rgba(255, 255, 255, 0.1)',
                }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <View style={{
                      width: 48,
                      height: 48,
                      borderRadius: 14,
                      backgroundColor: 'rgba(239, 68, 68, 0.2)',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                      <Ionicons name="warning" size={28} color="#ef4444" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{
                        color: 'white',
                        fontSize: 18,
                        fontWeight: '700',
                      }}>
                        Confirmar eliminación
                      </Text>
                      <Text style={{
                        color: 'rgba(255, 255, 255, 0.5)',
                        fontSize: 13,
                        marginTop: 4,
                      }}>
                        Esta acción no se puede deshacer
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Contenido */}
                <View style={{ padding: 24 }}>
                  <Text
                    style={{
                      color: 'rgba(255, 255, 255, 0.85)',
                      fontSize: 15,
                      lineHeight: 22,
                      textAlign: 'center',
                    }}
                  >
                    ¿Está seguro de eliminar esta categoría?
                    {'\n'}
                    Esta acción es permanente y no se podrán restaurar los datos.
                  </Text>
                </View>

                {/* Footer con botones */}
                <View style={{
                  flexDirection: 'row',
                  gap: 12,
                  padding: 24,
                  paddingTop: 0,
                }}>
                  <TouchableOpacity
                    style={{
                      flex: 1,
                      paddingVertical: 14,
                      borderRadius: 12,
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      borderWidth: 1,
                      borderColor: 'rgba(255, 255, 255, 0.2)',
                      alignItems: 'center',
                    }}
                    onPress={() => {
                      setShowDeleteModal(false);
                      setCategoriaToDelete(null);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={{
                      color: 'white',
                      fontSize: 15,
                      fontWeight: '600',
                    }}>
                      Cancelar
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={{
                      flex: 1,
                      paddingVertical: 14,
                      borderRadius: 12,
                      backgroundColor: '#ef4444',
                      alignItems: 'center',
                      flexDirection: 'row',
                      justifyContent: 'center',
                      gap: 8,
                    }}
                    onPress={confirmDelete}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="trash" size={20} color="white" />
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
          {/* ============ MODAL DE ERROR ============ */}
          <Modal visible={showErrorModal} animationType="fade" transparent>
            <View style={styles.modalOverlay}>
              <View style={[styles.modal, { maxWidth: 500, padding: 0 }]}>

                {/* Header del Modal */}
                <View style={{
                  padding: 24,
                  borderBottomWidth: 1,
                  borderBottomColor: 'rgba(239, 68, 68, 0.2)',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  borderTopLeftRadius: 24,
                  borderTopRightRadius: 24,
                }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <View style={{
                      width: 48,
                      height: 48,
                      borderRadius: 14,
                      backgroundColor: 'rgba(239, 68, 68, 0.2)',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                      <Ionicons name="close-circle" size={28} color="#ef4444" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{
                        color: '#ef4444',
                        fontSize: 18,
                        fontWeight: '700',
                      }}>
                        No se puede eliminar
                      </Text>
                      <Text style={{
                        color: 'rgba(255, 255, 255, 0.5)',
                        fontSize: 12,
                        marginTop: 2,
                      }}>
                        La categoría tiene dependencias
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Contenido */}
                <View style={{ padding: 24 }}>
                  <View style={{
                    flexDirection: 'row',
                    gap: 12,
                    padding: 16,
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    borderRadius: 12,
                    borderLeftWidth: 4,
                    borderLeftColor: '#ef4444',
                  }}>
                    <Ionicons name="information-circle" size={24} color="#ef4444" />
                    <Text style={{
                      flex: 1,
                      color: 'rgba(255, 255, 255, 0.9)',
                      fontSize: 14,
                      lineHeight: 20,
                    }}>
                      {errorModalMessage}
                    </Text>
                  </View>

                  <Text style={{
                    color: 'rgba(255, 255, 255, 0.6)',
                    fontSize: 13,
                    marginTop: 16,
                    lineHeight: 18,
                  }}>
                    Para eliminar esta categoría, primero debes:
                  </Text>

                  <View style={{ marginTop: 12, gap: 8 }}>
                    {errorModalMessage.includes('contenido') && (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <Ionicons name="checkmark-circle-outline" size={16} color="#667eea" />
                        <Text style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: 13 }}>
                          Eliminar o mover los contenidos asociados
                        </Text>
                      </View>
                    )}
                    {errorModalMessage.includes('subcategoría') && (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <Ionicons name="checkmark-circle-outline" size={16} color="#667eea" />
                        <Text style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: 13 }}>
                          Eliminar o mover las subcategorías
                        </Text>
                      </View>
                    )}
                  </View>
                </View>

                {/* Footer */}
                <View style={{
                  padding: 24,
                  paddingTop: 0,
                }}>
                  <TouchableOpacity
                    style={{
                      paddingVertical: 14,
                      borderRadius: 12,
                      backgroundColor: '#667eea',
                      alignItems: 'center',
                      flexDirection: 'row',
                      justifyContent: 'center',
                      gap: 8,
                    }}
                    onPress={() => setShowErrorModal(false)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="checkmark" size={20} color="white" />
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
      </View>
    </View>
  );
}
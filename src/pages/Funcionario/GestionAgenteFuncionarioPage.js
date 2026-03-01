// UBICACIÓN: src/pages/SuperAdministrador/GestionAgentePage.js
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Image,
    Modal,
    Platform,
    ScrollView,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { agenteService } from '../../api/services/agenteService';
import authService from '../../api/services/authService';
import { categoriaService } from '../../api/services/categoriaService';
import { contenidoService } from '../../api/services/contenidoService';
import { departamentoService } from '../../api/services/departamentoService';
import { usuarioAgenteService } from '../../api/services/usuarioAgenteService';
import FuncionarioSidebar from '../../components/Sidebar/sidebarFuncionario';
import GestionAgenteCard from '../../components/SuperAdministrador/GestionAgenteCard';
import { getUserIdFromToken } from "../../components/utils/authHelper";
import SecurityValidator from '../../components/utils/SecurityValidator';
import { contentStyles } from '../../styles/contentStyles';
import { getStatIconColor, modalStyles, styles } from '../../styles/gestionAgenteStyles';

const isWeb = Platform.OS === 'web';

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

// 🔐 ============ SECURITY UTILS ============
const SecurityUtils = {
    // Rate limiter factory
    createRateLimiter: (maxAttempts, timeWindow) => {
        let attempts = [];
        return {
            isAllowed: (key) => {
                const now = Date.now();
                attempts = attempts.filter(t => now - t < timeWindow);
                if (attempts.length < maxAttempts) {
                    attempts.push(now);
                    return true;
                }
                return false;
            }
        };
    },

    // Validar ID
    validateId: (id) => {
        return typeof id === 'number' && id > 0;
    },

    // Validar string
    validateString: (str, maxLength = 500) => {
        return typeof str === 'string' &&
            str.length > 0 &&
            str.length <= maxLength;
    },

    // Detectar XSS - 7 patrones comunes
    detectXssAttempt: (text) => {
        const xssPatterns = [
            /<script/i,
            /on\w+\s*=/i,
            /<iframe/i,
            /javascript:/i,
            /eval\(/i,
            /onerror=/i,
            /onload=/i,
        ];
        return xssPatterns.some(pattern => pattern.test(String(text)));
    },

    // Sanitizar texto
    sanitizeText: (text) => {
        return String(text)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;');
    },

    // Logging de eventos de seguridad
    logSecurityEvent: (eventType, details = {}) => {
        console.log(`🔐 ${eventType}:`, {
            timestamp: new Date().toISOString(),
            event: eventType,
            details,
            userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A'
        });
    }
};

export default function GestionAgentePage() {
    // ============ STATE ============
    const [agentes, setAgentes] = useState([]);
    const [departamentos, setDepartamentos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tienePermiso, setTienePermiso] = useState(false);
    const [verificandoPermiso, setVerificandoPermiso] = useState(true);
    const [estadoCarga, setEstadoCarga] = useState('cargando')
    const [mensajeError, setMensajeError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterTipo, setFilterTipo] = useState('todos');
    const [filterEstado, setFilterEstado] = useState('todos');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [departamentoUsuario, setDepartamentoUsuario] = useState(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [agenteParaCambiarEstado, setAgenteParaCambiarEstado] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [agenteToDelete, setAgenteToDelete] = useState(null);
    const [showToggleModal, setShowToggleModal] = useState(false);
    const [agenteToToggle, setAgenteToToggle] = useState(null);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [errorDetails, setErrorDetails] = useState(null);

    // Modales
    const [showFormModal, setShowFormModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [formMode, setFormMode] = useState('create'); // 'create' o 'edit'
    const [selectedAgente, setSelectedAgente] = useState(null);

    // Form Data
    const [formData, setFormData] = useState({
        nombre_agente: '',
        tipo_agente: 'especializado',
        area_especialidad: '',
        descripcion: '',
        modelo_ia: 'llama3:8b',
        temperatura: '0.3',
        max_tokens: '4000',
        prompt_mision: '',
        prompt_reglas: ['', ''],
        prompt_tono: 'amigable',
        prompt_especializado: '',
        herramientas_disponibles: '',
        idioma_principal: 'es',
        zona_horaria: 'America/Guayaquil',
        activo: true,
        icono: '🤖',
        id_departamento: '',
        avatar_url: '',
        color_tema: '#667eea',
        mensaje_bienvenida: '',
        mensaje_despedida: '',
        mensaje_derivacion: '',
        mensaje_fuera_horario: '',
        palabras_clave_trigger: '',
        prioridad_routing: '0',
        puede_ejecutar_acciones: false,
        acciones_disponibles: '',
        requiere_autenticacion: false,
        horarios: {
            lunes: { activo: true, bloques: [{ inicio: '08:00', fin: '17:00' }] },
            martes: { activo: true, bloques: [{ inicio: '08:00', fin: '17:00' }] },
            miercoles: { activo: true, bloques: [{ inicio: '08:00', fin: '17:00' }] },
            jueves: { activo: true, bloques: [{ inicio: '08:00', fin: '17:00' }] },
            viernes: { activo: true, bloques: [{ inicio: '08:00', fin: '17:00' }] },
            sabado: { activo: false, bloques: [] },
            domingo: { activo: false, bloques: [] }
        },
    });
    const [formErrors, setFormErrors] = useState({});
    const [showDeptPicker, setShowDeptPicker] = useState(false);
    const [usuarioActual, setUsuarioActual] = useState(null);
    const [stats, setStats] = useState({
        total: 0,
        activos: 0,
        router: 0,
        especializados: 0,
    });

    // ============ CONSTANTES ============
    const iconos = ['🤖', '🧠', '💼', '📊', '🎯', '🔧', '📚', '💡', '🌟', '⚡', '🎨', '🔬'];
    // ✅ Detectar plataforma
    const isWeb = Platform.OS === 'web';

    // 🔐 Rate limiters para operaciones críticas
    const rateLimiterBusqueda = useRef(SecurityUtils.createRateLimiter(30, 60000)).current; // 30 búsquedas/minuto
    const rateLimiterOperaciones = useRef(SecurityUtils.createRateLimiter(5, 60000)).current; // 5 operaciones/minuto

    // ============ VERIFICAR PERMISOS ============
    const verificarPermisoGestionUsuarios = async () => {
        try {
            setVerificandoPermiso(true);

            // 1️⃣ Obtener ID del usuario actual
            const idUsuarioActual = await authService.getUsuarioId();

            if (!idUsuarioActual) {
                setTienePermiso(false);
                setMensajeError('No se pudo obtener el usuario actual. Por favor inicia sesión nuevamente.');
                setVerificandoPermiso(false);
                return;
            }

            // 2️⃣ Obtener datos del usuario para verificar su rol
            const usuarioData = await authService.getUsuarioActual();

            console.log('👤 Usuario verificando permisos de gestión:', usuarioData?.username);

            // 3️⃣ Si es SuperAdmin, tiene acceso total
            const rolPrincipal = usuarioData?.rol_principal?.nombre_rol?.toLowerCase();

            if (rolPrincipal === 'superadministrador') {
                console.log('✅ SuperAdmin detectado - Acceso total');
                setTienePermiso(true);
                setVerificandoPermiso(false);
                return;
            }

            // 4️⃣ Para funcionarios y jefes, verificar permiso específico
            const permisosData = await usuarioAgenteService.getAgentesByUsuario(idUsuarioActual, true);

            console.log('🔍 Permisos del usuario:', permisosData);

            // 5️⃣ Verificar si tiene permiso "puede_gestionar_permisos" en AL MENOS UN agente
            const tienePermisoGestion = permisosData?.some(relacion =>
                relacion.puede_configurar_agente === true
            );

            console.log('🔍 ¿Tiene permiso "puede_configurar_agente"?:', tienePermisoGestion);

            if (!tienePermisoGestion) {
                setMensajeError('No tienes permisos para gestionar asignaciones de usuarios. Contacta a tu administrador para solicitar el permiso "Configurar Agente".');
            }

            setTienePermiso(tienePermisoGestion);

        } catch (error) {
            console.error('❌ Error verificando permisos:', error);
            setTienePermiso(false);
            setMensajeError('Error al verificar permisos. Por favor intenta nuevamente.');
        } finally {
            setVerificandoPermiso(false);
        }
    };
    // ============ EFFECTS ============
    useEffect(() => {
        cargarAgentes();
    }, [filterTipo, filterEstado]);

    useEffect(() => {
        if (agentes.length > 0) {
            cargarEstadisticas();
        }
    }, [agentes]);

    useEffect(() => {
        verificarPermisoGestionUsuarios();
    }, []);

    useEffect(() => {
        if (tienePermiso && !verificandoPermiso) {
            cargarDepartamentos();
        }
    }, [tienePermiso, verificandoPermiso]);

    useEffect(() => {
        const cargarUsuario = async () => {
            try {
                // Intentar TODAS las posibles claves
                const posiblesClaves = [
                    '@datos_sesion',
                    'datos_sesion',
                    '@user_session',
                    'user_data',
                    'currentUser'
                ];

                let usuarioEncontrado = null;

                for (const clave of posiblesClaves) {
                    const data = await AsyncStorage.getItem(clave); // ✅ AsyncStorage

                    if (data) {
                        try {
                            const parsed = JSON.parse(data);

                            // Buscar el usuario en diferentes estructuras
                            if (parsed.usuario) {
                                usuarioEncontrado = parsed.usuario;
                                break;
                            } else if (parsed.user) {
                                usuarioEncontrado = parsed.user;
                                break;
                            } else if (parsed.id_usuario) {
                                usuarioEncontrado = parsed;
                                break;
                            }
                        } catch (e) {
                            console.log('Error parseando:', clave);
                        }
                    }
                }

                if (usuarioEncontrado) {
                    console.log('✅ Usuario encontrado:', usuarioEncontrado);
                    setUsuarioActual(usuarioEncontrado);
                } else {
                    console.log('⚠️ No se encontró usuario en AsyncStorage');

                    // Debug: Mostrar TODAS las claves disponibles
                    const allKeys = await AsyncStorage.getAllKeys();
                    console.log('📋 Claves disponibles en AsyncStorage:', allKeys);

                    for (const key of allKeys) {
                        const val = await AsyncStorage.getItem(key);
                        console.log(`  ${key}:`, val?.substring(0, 100) + '...'); // Mostrar primeros 100 chars
                    }
                }
            } catch (error) {
                console.error('❌ Error al cargar usuario:', error);
            }
        };

        cargarUsuario();
    }, []);

    // ============ HELPERS ============
    // Validar URLs de imagen usando SecurityValidator
    const isValidImageUrl = (url) => {
        if (!url) return false;

        // Primero verificar que sea una URL segura
        if (!SecurityValidator.isSecureUrl(url)) {
            return false;
        }

        // Luego verificar que sea una imagen válida
        return SecurityValidator.isValidImageUrl(url);
    };

    // ============ FUNCIONES DE CARGA ============
    const cargarAgentes = async () => {
        try {
            setLoading(true);
            setEstadoCarga('cargando');

            // 🔐 Rate limiting: máx 5 operaciones/minuto
            if (!rateLimiterOperaciones.isAllowed('cargarAgentes')) {
                SecurityUtils.logSecurityEvent('RATE_LIMIT_CARGAR_AGENTES', {
                    razon: 'demasiadas_cargas'
                });
                Alert.alert('Límite excedido', 'Estás recargando demasiado rápido. Por favor espera un momento.');
                setLoading(false);
                return;
            }

            // 1️⃣ Obtener ID del usuario actual
            const idUsuarioActual = await authService.getUsuarioId();

            if (!idUsuarioActual) {
                setEstadoCarga('sin_departamento');
                setMensajeError('No se pudo obtener el usuario actual. Por favor inicia sesión nuevamente.');
                SecurityUtils.logSecurityEvent('ERROR_LOAD_AGENTS', {
                    razon: 'no_user_id'
                });
                setLoading(false);
                return;
            }

            // 2️⃣ Obtener datos del usuario para verificar su departamento
            const usuarioData = await authService.getUsuarioActual();

            // 🔐 Validar estructura del usuario
            if (!usuarioData || typeof usuarioData !== 'object') {
                throw new Error('Datos de usuario inválidos');
            }

            console.log('👤 Usuario actual COMPLETO:', JSON.stringify(usuarioData, null, 2));
            console.log('🔍 ID Usuario:', usuarioData?.id_usuario);
            console.log('🏢 ID Departamento del usuario:', usuarioData?.id_departamento);

            // 3️⃣ Verificar múltiples formas posibles de obtener el departamento
            const idDepartamento =
                usuarioData?.id_departamento ||
                usuarioData?.departamento?.id_departamento ||
                usuarioData?.departamento_id;

            // 🔐 Validar que el ID de departamento sea válido
            if (!idDepartamento || !SecurityUtils.validateId(parseInt(idDepartamento))) {
                console.log('❌ Usuario SIN departamento o departamento inválido');
                setEstadoCarga('sin_departamento');
                setMensajeError('No tienes un departamento asignado. Por favor contacta a un administrador para que te asigne uno.');
                SecurityUtils.logSecurityEvent('INVALID_DEPARTMENT_ID', {
                    idDepartamento
                });
                setLoading(false);
                return;
            }

            console.log('✅ Usuario tiene departamento:', idDepartamento);
            setDepartamentoUsuario(idDepartamento);

            // 4️⃣ Cargar todos los agentes
            const data = await agenteService.getAll();
            const agentesArray = Array.isArray(data) ? data : (data?.data || []);

            // 🔐 Validar respuesta de la API
            if (!Array.isArray(agentesArray)) {
                throw new Error('Respuesta inválida de la API de agentes');
            }

            // 5️⃣ Filtrar solo el agente del departamento del usuario
            const agenteDelDepartamento = agentesArray.find(
                agente => agente.id_departamento &&
                    agente.id_departamento.toString() === idDepartamento.toString()
            );

            console.log('🔍 Buscando agente para departamento:', idDepartamento);
            console.log('🎯 Agente encontrado:', agenteDelDepartamento);

            // 🔐 Validar que el agente tenga estructura correcta
            if (agenteDelDepartamento) {
                if (!agenteDelDepartamento.id_agente) {
                    throw new Error('Agente sin ID válido');
                }
                // 🔐 Detectar XSS en nombre del agente
                if (SecurityUtils.detectXssAttempt(agenteDelDepartamento.nombre_agente)) {
                    SecurityUtils.logSecurityEvent('XSS_ATTEMPT_AGENT_NAME', {
                        nombre: agenteDelDepartamento.nombre_agente?.substring(0, 100)
                    });
                    throw new Error('Intento de inyección detectado en nombre de agente');
                }
            }

            if (!agenteDelDepartamento) {
                console.log('❌ Departamento SIN agente asignado');
                setEstadoCarga('sin_agente');
                setMensajeError('Tu departamento aún no tiene un agente asignado. Por favor contacta a un administrador.');
                SecurityUtils.logSecurityEvent('NO_AGENT_FOR_DEPARTMENT', {
                    idDepartamento
                });
                setLoading(false);
                return;
            }

            console.log('✅ Agente encontrado:', agenteDelDepartamento.nombre_agente);

            // 6️⃣ Establecer solo el agente del departamento
            setAgentes([agenteDelDepartamento]);

            // 7️⃣ 🔥 NUEVO: Auto-seleccionar el agente del departamento
            setSelectedAgente(agenteDelDepartamento);
            console.log('🎯 Agente auto-seleccionado:', agenteDelDepartamento.id_agente);

            // 🔐 Log de éxito
            SecurityUtils.logSecurityEvent('AGENTS_LOADED', {
                cantidad: 1,
                idDepartamento
            });

            // ✅ Todo OK
            setEstadoCarga('ok');

        } catch (err) {
            console.error('❌ Error cargando agentes:', err);
            SecurityUtils.logSecurityEvent('ERROR_LOADING_AGENTS', {
                error: err.message,
                stack: err.stack
            });
            setEstadoCarga('sin_departamento');
            setMensajeError('Error al cargar los datos. Por favor intenta nuevamente.');
            setAgentes([]);
        } finally {
            setLoading(false);
        }
    };

    const cargarEstadisticas = async () => {
        try {
            // 🔐 Rate limiting: máx 20 verificaciones/minuto
            if (!rateLimiterBusqueda.isAllowed('cargarEstadisticas')) {
                SecurityUtils.logSecurityEvent('RATE_LIMIT_CARGAR_ESTADISTICAS', {
                    razon: 'demasiadas_verificaciones'
                });
                return;
            }

            console.log('📊 Cargando estadísticas...');

            // Calcular estadísticas solo del agente del departamento
            const agentesArray = agentes;

            // 🔐 Validar que agentesArray sea un array
            if (!Array.isArray(agentesArray)) {
                throw new Error('Datos de agentes inválidos');
            }

            const calculadas = {
                total: agentesArray.length,
                activos: agentesArray.filter(a => a.activo === true || a.activo === 1).length,
                router: agentesArray.filter(a => a.tipo_agente === 'router').length,
                especializados: agentesArray.filter(a => a.tipo_agente === 'especializado').length,
            };

            // 🔐 Validar que los números sean válidos
            if (Object.values(calculadas).some(v => typeof v !== 'number' || v < 0)) {
                throw new Error('Estadísticas calculadas inválidas');
            }

            console.log('✅ Estadísticas calculadas:', calculadas);
            SecurityUtils.logSecurityEvent('STATS_LOADED', {
                stats: calculadas
            });
            setStats(calculadas);

        } catch (err) {
            console.error('❌ Error al cargar estadísticas:', err);
            SecurityUtils.logSecurityEvent('ERROR_LOAD_STATS', {
                error: err.message
            });
            setStats({
                total: 0,
                activos: 0,
                router: 0,
                especializados: 0,
            });
        }
    };

    // ============  Cargar departamentos para el formulario ===========

    const cargarDepartamentos = async () => {
        try {
            const data = await departamentoService.getAll({ activo: true });
            setDepartamentos(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Error al cargar departamentos:', err);
            setDepartamentos([]);
        }
    };

    // ============ FUNCIONES DE FORMULARIO ============
    const resetForm = () => {
        setFormData({
            nombre_agente: '',
            tipo_agente: 'especializado',
            area_especialidad: '',
            descripcion: '',
            modelo_ia: 'llama3:8b',
            temperatura: '0.3',
            max_tokens: '4000',
            prompt_mision: '',
            prompt_reglas: ['', ''],
            prompt_tono: 'amigable',
            prompt_especializado: '',
            herramientas_disponibles: '',
            idioma_principal: 'es',
            zona_horaria: 'America/Guayaquil',
            activo: true,
            icono: '🤖',
            id_departamento: '',
            avatar_url: '',
            color_tema: '#667eea',
            mensaje_bienvenida: '',
            mensaje_despedida: '',
            mensaje_derivacion: '',
            mensaje_fuera_horario: '',
            palabras_clave_trigger: '',
            prioridad_routing: '0',
            puede_ejecutar_acciones: false,
            acciones_disponibles: '',
            requiere_autenticacion: false,
            creado_por: null,
            actualizado_por: null,
            horarios: {
                lunes: { activo: true, bloques: [{ inicio: '08:00', fin: '17:00' }] },
                martes: { activo: true, bloques: [{ inicio: '08:00', fin: '17:00' }] },
                miercoles: { activo: true, bloques: [{ inicio: '08:00', fin: '17:00' }] },
                jueves: { activo: true, bloques: [{ inicio: '08:00', fin: '17:00' }] },
                viernes: { activo: true, bloques: [{ inicio: '08:00', fin: '17:00' }] },
                sabado: { activo: false, bloques: [] },
                domingo: { activo: false, bloques: [] }
            },
        });
        setFormErrors({});
    };

    // Validar formulario
    // Validar formulario con SecurityValidator
    const validateForm = () => {

        // Usar el validador de seguridad
        const validation = SecurityValidator.validateAgenteForm(formData, formMode);
        ({
            isValid: validation.isValid,
            errorsCount: Object.keys(validation.errors).length,
            errors: validation.errors
        });

        // Si hay errores de departamento duplicado en modo creación
        if (formMode === 'create' && formData.id_departamento) {
            const departamentoYaTieneAgente = agentes.some(
                a => a.id_departamento &&
                    a.id_departamento.toString() === formData.id_departamento.toString()
            );

            if (departamentoYaTieneAgente) {
                validation.errors.id_departamento = '⚠️ Este departamento ya tiene un agente asignado';
                validation.isValid = false;
            }
        }

        // Si está editando y intenta cambiar departamento
        if (formMode === 'edit' && selectedAgente?.id_departamento) {
            if (formData.id_departamento &&
                selectedAgente.id_departamento.toString() !== formData.id_departamento.toString()) {
                validation.errors.id_departamento = '⚠️ No se puede cambiar el departamento';
                validation.isValid = false;
            }
        }
        setFormErrors(validation.errors);

        if (!validation.isValid) {
        } else {
            console.log('✅ Validación exitosa');
        }

        return validation.isValid;
    };

    // ============ HANDLERS CRUD ============
    const handleCreateNew = () => {
        setFormMode('create');
        resetForm();
        setShowFormModal(true);
    };

    // ============ PARSER: Separar prompt_sistema en componentes ============
    const parsePromptSistema = (prompt_sistema) => {
        if (!prompt_sistema) {
            return {
                prompt_mision: '',
                prompt_reglas: ['', ''],
                prompt_tono: 'amigable',
                prompt_especializado: ''
            };
        }

        // Extraer MISIÓN
        const misionMatch = prompt_sistema.match(/MISIÓN:\s*([\s\S]*?)(?=\n\n(?:ESPECIALIZACIÓN|REGLAS|TONO):|\n\nTONO:|$)/);
        const prompt_mision = misionMatch ? misionMatch[1].trim() : '';

        // Extraer ESPECIALIZACIÓN (si existe)
        const especializacionMatch = prompt_sistema.match(/ESPECIALIZACIÓN:\s*([\s\S]*?)(?=\n\n(?:REGLAS|TONO):|\n\nTONO:|$)/);
        const prompt_especializado = especializacionMatch ? especializacionMatch[1].trim() : '';

        // Extraer REGLAS
        const reglasMatch = prompt_sistema.match(/REGLAS:\s*([\s\S]*?)(?=\n\nTONO:|$)/);
        let prompt_reglas = ['', ''];

        if (reglasMatch) {
            const reglasTexto = reglasMatch[1].trim();
            const reglasArray = reglasTexto
                .split('\n')
                .filter(linea => linea.trim().startsWith('-'))
                .map(linea => linea.replace(/^-\s*/, '').trim())
                .filter(r => r.length > 0);

            prompt_reglas = reglasArray.length >= 2 ? reglasArray : ['', ''];
        }

        // Extraer TONO
        let prompt_tono = 'amigable';

        if (prompt_sistema.includes('formal') || prompt_sistema.includes('profesional')) {
            prompt_tono = 'formal';
        } else if (prompt_sistema.includes('técnico') || prompt_sistema.includes('tecnico')) {
            prompt_tono = 'tecnico';
        } else if (prompt_sistema.includes('amigable') || prompt_sistema.includes('empático')) {
            prompt_tono = 'amigable';
        }

        return {
            prompt_mision,
            prompt_reglas,
            prompt_tono,
            prompt_especializado
        };
    };

    // Editar agente
    const handleEdit = (agente) => {
        // 🔥 VALIDACIÓN: Verificar que el usuario puede editar este agente
        if (usuarioActual?.id_departamento && agente.id_departamento) {
            if (usuarioActual.id_departamento.toString() !== agente.id_departamento.toString()) {
                Alert.alert(
                    '⛔ Acceso Denegado',
                    'No tienes permisos para editar agentes de otros departamentos. Solo puedes modificar el agente de tu departamento.',
                    [{ text: 'Entendido', style: 'cancel' }]
                );
                return;
            }
        }

        setFormMode('edit');
        setSelectedAgente(agente);

        // ⭐ PARSEAR prompt_sistema para obtener los componentes
        const { prompt_mision, prompt_reglas, prompt_tono, prompt_especializado } = parsePromptSistema(agente.prompt_sistema);

        setFormData({
            nombre_agente: agente.nombre_agente || '',
            tipo_agente: agente.tipo_agente || 'especializado',
            area_especialidad: agente.area_especialidad || '',
            descripcion: agente.descripcion || '',
            modelo_ia: 'llama3:8b',
            temperatura: (() => {
                const temp = agente.temperatura?.toString() || '0.3';
                // ✅ Validar que sea uno de los valores permitidos, sino usar el más cercano
                const valoresPermitidos = ['0.2', '0.3', '0.5'];

                if (valoresPermitidos.includes(temp)) {
                    return temp;
                }

                // Si el valor no está en los permitidos, buscar el más cercano
                const tempNum = parseFloat(temp);
                if (tempNum < 0.25) return '0.2';      // Más cercano a 0.2
                if (tempNum < 0.4) return '0.3';       // Más cercano a 0.3
                return '0.5';                          // Más cercano a 0.5
            })(),
            max_tokens: agente.max_tokens?.toString() || '4000',

            prompt_mision: prompt_mision,
            prompt_reglas: prompt_reglas,
            prompt_tono: prompt_tono,
            prompt_especializado: prompt_especializado,

            herramientas_disponibles: agente.herramientas_disponibles || '',
            idioma_principal: agente.idioma_principal || 'es',
            zona_horaria: agente.zona_horaria || 'America/Guayaquil',
            activo: agente.activo !== undefined ? agente.activo : true,
            icono: agente.icono || '🤖',
            id_departamento: agente.id_departamento?.toString() || '',
            avatar_url: agente.avatar_url || '',
            color_tema: agente.color_tema || '#667eea',
            mensaje_bienvenida: agente.mensaje_bienvenida || '',
            mensaje_despedida: agente.mensaje_despedida || '',
            mensaje_derivacion: agente.mensaje_derivacion || '',
            mensaje_fuera_horario: agente.mensaje_fuera_horario || '',
            palabras_clave_trigger: agente.palabras_clave_trigger || '',
            prioridad_routing: agente.prioridad_routing?.toString() || '0',
            puede_ejecutar_acciones: agente.puede_ejecutar_acciones || false,
            acciones_disponibles: agente.acciones_disponibles || '',
            requiere_autenticacion: agente.requiere_autenticacion || false,
            creado_por: agente.creado_por || null,
            actualizado_por: null,
            requiere_autenticacion: agente.requiere_autenticacion || false,
            creado_por: agente.creado_por || null,
            actualizado_por: null,
            // ⭐ AGREGAR ESTO AL FINAL:
            horarios: (() => {
                if (!agente.horarios) {
                    return {
                        lunes: { activo: true, bloques: [{ inicio: '08:00', fin: '17:00' }] },
                        martes: { activo: true, bloques: [{ inicio: '08:00', fin: '17:00' }] },
                        miercoles: { activo: true, bloques: [{ inicio: '08:00', fin: '17:00' }] },
                        jueves: { activo: true, bloques: [{ inicio: '08:00', fin: '17:00' }] },
                        viernes: { activo: true, bloques: [{ inicio: '08:00', fin: '17:00' }] },
                        sabado: { activo: false, bloques: [] },
                        domingo: { activo: false, bloques: [] }
                    };
                }

                const horariosDesdeDB = typeof agente.horarios === 'string'
                    ? JSON.parse(agente.horarios)
                    : agente.horarios;

                const horariosParaFormulario = {
                    lunes: { activo: false, bloques: [] },
                    martes: { activo: false, bloques: [] },
                    miercoles: { activo: false, bloques: [] },
                    jueves: { activo: false, bloques: [] },
                    viernes: { activo: false, bloques: [] },
                    sabado: { activo: false, bloques: [] },
                    domingo: { activo: false, bloques: [] }
                };

                Object.entries(horariosDesdeDB).forEach(([dia, bloques]) => {
                    if (Array.isArray(bloques) && bloques.length > 0) {
                        horariosParaFormulario[dia] = {
                            activo: true,
                            bloques: bloques
                        };
                    }
                });

                return horariosParaFormulario;
            })(),
        });

        setShowFormModal(true);
    };


    // Función para obtener departamentos disponibles
    const getDepartamentosDisponibles = () => {

        // Si estamos editando y el agente ya tiene departamento asignado
        if (formMode === 'edit' && selectedAgente?.id_departamento) {
            const deptAsignado = departamentos.find(d =>
                d.id_departamento.toString() === selectedAgente.id_departamento.toString()
            );
            return deptAsignado ? [deptAsignado] : [];
        }


        // Obtener IDs de departamentos ocupados
        const departamentosOcupados = agentes
            .filter(a => {
                const tieneDepto = a.id_departamento != null && a.id_departamento !== '';
                if (tieneDepto) {
                }
                return tieneDepto;
            })
            .map(a => a.id_departamento.toString());

        // Filtrar departamentos disponibles
        const disponibles = departamentos.filter(d => {
            const deptId = d.id_departamento.toString();
            const estaOcupado = departamentosOcupados.includes(deptId);
            return !estaOcupado;
        });

        return disponibles;
    };


    // Guardar agente (crear o actualizar)
    const handleSaveForm = async () => {

        if (!validateForm()) {
            Alert.alert('Error de validación', 'Por favor, corrige los errores en el formulario');
            return;
        }

        // Verificar que hay un usuario logueado
        // Obtener ID del usuario desde el token
        const userId = await getUserIdFromToken();

        if (!userId) {
            console.warn("❌ No se pudo obtener el ID del usuario desde el token");
            Alert.alert("Error", "No se pudo identificar al usuario autenticado.");
            return;
        }

        // Registrar el usuario que realiza la acción
        let usuarioParaGuardar = {
            id_usuario: userId
        };

        try {

            // CONSTRUIR EL PROMPT_SISTEMA 
            const { nombre_agente, area_especialidad, prompt_mision, prompt_reglas, prompt_tono, prompt_especializado } = formData;

            const contextoBase = `Eres ${nombre_agente} del TEC AZUAY, especializado en ${area_especialidad}.`;
            const misionTexto = `\n\nMISIÓN:\n${prompt_mision}`;
            const especializacionTexto = prompt_especializado
                ? `\n\nESPECIALIZACIÓN:\n${prompt_especializado}`
                : '';
            const reglasLimpias = prompt_reglas.filter(r => r.trim() !== '');
            const reglasTexto = reglasLimpias.length > 0
                ? `\n\nREGLAS:\n${reglasLimpias.map(r => `- ${r}`).join('\n')}`
                : '';
            const tonoMap = {
                formal: 'Sé formal, profesional y preciso en tus respuestas.',
                amigable: 'Sé amigable, cercano y empático, pero mantén profesionalismo.',
                tecnico: 'Usa lenguaje técnico claro y preciso, enfócate en soluciones concretas.'
            };
            const tonoTexto = `\n\nTONO:\n${tonoMap[prompt_tono] || tonoMap.amigable}`;
            const prompt_sistema_final = `${contextoBase}${misionTexto}${especializacionTexto}${reglasTexto}${tonoTexto}`;

            const horariosParaBD = {};
            Object.entries(formData.horarios).forEach(([dia, config]) => {
                if (config.activo && config.bloques && config.bloques.length > 0) {
                    horariosParaBD[dia] = config.bloques;
                }
            });

            const dataPreSanitizar = {
                ...formData,
                prompt_sistema: prompt_sistema_final,
                horarios: JSON.stringify(horariosParaBD)
            };

            // ⭐ ESTABLECER CAMPOS DE AUDITORÍA ANTES DE SANITIZAR
            if (formMode === 'create') {
                dataPreSanitizar.creado_por = usuarioParaGuardar.id_usuario;
                console.log('➕ MODO CREAR - Estableciendo creado_por PRE-sanitizar:', dataPreSanitizar.creado_por);
            } else {
                dataPreSanitizar.actualizado_por = usuarioParaGuardar.id_usuario;
                console.log('✏️ MODO EDITAR - Estableciendo actualizado_por PRE-sanitizar:', dataPreSanitizar.actualizado_por);
            }

            console.log('📦 Datos PRE-sanitizar:', dataPreSanitizar);

            // Sanitizar
            const dataToSave = SecurityValidator.sanitizeAgenteData(dataPreSanitizar);


            // ENVIAR AL BACKEND
            let response;
            if (formMode === 'create') {
                response = await agenteService.create(dataToSave);
            } else {
                response = await agenteService.update(selectedAgente.id_agente, dataToSave);
            }

            // Éxito
            setSuccessMessage(formMode === 'create' ? '✅ Agente creado correctamente' : '✅ Agente actualizado correctamente');
            setShowSuccessMessage(true);
            setShowFormModal(false);

            await cargarAgentes();
            await cargarEstadisticas();
            resetForm();

            setTimeout(() => {
                setShowSuccessMessage(false);
            }, 3000);

        } catch (err) {


            Alert.alert(
                'Error al guardar',
                `No se pudo guardar el agente.\n\nDetalles: ${err?.response?.data?.message || err?.message || 'Error desconocido'}`
            );
        }
    };

    const handleView = async (agente) => {
        // Cargar el nombre del departamento si no lo tiene
        let agenteConDatos = { ...agente };

        if (agente.id_departamento && !agente.departamento_nombre) {
            try {
                const dept = departamentos.find(
                    d => d.id_departamento.toString() === agente.id_departamento.toString()
                );

                if (dept) {
                    agenteConDatos.departamento_nombre = dept.nombre;
                } else {
                    // Si no está en la lista, buscarlo en el servicio
                    const deptData = await departamentoService.getById(agente.id_departamento);
                    agenteConDatos.departamento_nombre = deptData?.nombre || 'Sin asignar';
                }
            } catch (error) {
                console.warn('⚠️ No se pudo cargar el departamento:', error);
                agenteConDatos.departamento_nombre = 'Sin asignar';
            }
        }

        setSelectedAgente(agenteConDatos);
        setShowDetailModal(true);
    };
    const handleDelete = (agente) => {
        // � Rate limiting: máx 5 operaciones/minuto
        if (!rateLimiterOperaciones.isAllowed('eliminarAgente')) {
            SecurityUtils.logSecurityEvent('RATE_LIMIT_DELETE_AGENT', {
                razon: 'demasiadas_operaciones'
            });
            Alert.alert('Límite excedido', 'Estás realizando demasiadas operaciones. Por favor espera un momento.');
            return;
        }

        // 🔐 Validar que el agente tenga ID válido
        if (!agente || !SecurityUtils.validateId(agente.id_agente)) {
            SecurityUtils.logSecurityEvent('INVALID_AGENT_ID_DELETE', {
                id: agente?.id_agente
            });
            Alert.alert('Error', 'Agente inválido');
            return;
        }

        // 🔥 VALIDACIÓN: Verificar que el usuario puede eliminar este agente
        if (usuarioActual?.id_departamento && agente.id_departamento) {
            if (usuarioActual.id_departamento.toString() !== agente.id_departamento.toString()) {
                SecurityUtils.logSecurityEvent('UNAUTHORIZED_DELETE_ATTEMPT', {
                    idAgente: agente.id_agente,
                    usuarioDept: usuarioActual.id_departamento,
                    agenteDept: agente.id_departamento
                });
                Alert.alert(
                    '⛔ Acceso Denegado',
                    'No tienes permisos para eliminar agentes de otros departamentos. Solo puedes eliminar el agente de tu departamento.',
                    [{ text: 'Entendido', style: 'cancel' }]
                );
                return;
            }
        }

        SecurityUtils.logSecurityEvent('DELETE_AGENT_INITIATED', {
            idAgente: agente.id_agente,
            nombreAgente: agente.nombre_agente
        });

        setAgenteToDelete(agente);
        setShowDeleteModal(true);
    };

    const confirmarEliminacion = async () => {
        if (!agenteToDelete) return;

        try {
            // 🔐 Rate limiting de operaciones
            if (!rateLimiterOperaciones.isAllowed('confirmarEliminar')) {
                SecurityUtils.logSecurityEvent('RATE_LIMIT_CONFIRM_DELETE', {
                    razon: 'demasiadas_operaciones'
                });
                Alert.alert('Límite excedido', 'Por favor espera un momento.');
                return;
            }

            // ✅ VALIDACIÓN 1: Verificar si tiene contenidos asociados
            const responseContenidos = await contenidoService.getByAgente(
                agenteToDelete.id_agente
            );
            const contenidosAsociados = responseContenidos?.data || responseContenidos || [];

            // 🔐 Validar respuesta de API
            if (!Array.isArray(contenidosAsociados)) {
                throw new Error('Respuesta inválida de contenidos');
            }

            // ✅ VALIDACIÓN 2: Verificar si tiene categorías asociadas (NO ELIMINADAS)
            const todasCategorias = await categoriaService.getAll({
                id_agente: agenteToDelete.id_agente
            });

            // 🔥 FILTRAR solo categorías NO eliminadas
            const categoriasAsociadas = Array.isArray(todasCategorias)
                ? todasCategorias.filter(cat => !cat.eliminado)
                : [];

            const tieneContenidos = contenidosAsociados && contenidosAsociados.length > 0;
            const tieneCategorias = categoriasAsociadas && categoriasAsociados.length > 0;

            // ❌ Si tiene contenidos O categorías, no permitir eliminar
            if (tieneContenidos || tieneCategorias) {
                // Cerrar modal de confirmación
                setShowDeleteModal(false);

                // ✅ Construir mensaje de error MÁS CLARO
                const cantidadContenidos = contenidosAsociados.length;
                const cantidadCategorias = categoriasAsociadas.length;

                const textoContenido = cantidadContenidos === 1 ? 'contenido asociado' : 'contenidos asociados';
                const textoCategoria = cantidadCategorias === 1 ? 'categoría asociada' : 'categorías asociadas';

                let mensajeError = `No se puede eliminar el agente "${agenteToDelete.nombre_agente}" porque tiene `;

                // Construir frase según lo que tenga
                if (tieneContenidos && tieneCategorias) {
                    // Tiene AMBOS
                    mensajeError += `${cantidadContenidos} ${textoContenido} y ${cantidadCategorias} ${textoCategoria}.`;
                } else if (tieneContenidos) {
                    // Solo tiene contenidos
                    mensajeError += `${cantidadContenidos} ${textoContenido}.`;
                } else {
                    // Solo tiene categorías
                    mensajeError += `${cantidadCategorias} ${textoCategoria}.`;
                }

                mensajeError += ' Primero debes eliminar o reasignar estos elementos a otro agente.';

                // 🔐 Log de intentos de eliminación bloqueados
                SecurityUtils.logSecurityEvent('DELETE_AGENT_BLOCKED', {
                    idAgente: agenteToDelete.id_agente,
                    razon: 'contenidos_o_categorias_asociadas',
                    contenidos: cantidadContenidos,
                    categorias: cantidadCategorias
                });

                // Mostrar modal de error
                setErrorMessage(mensajeError);
                setErrorDetails({
                    contenidos: tieneContenidos ? cantidadContenidos : 0,
                    categorias: tieneCategorias ? cantidadCategorias : 0
                });
                setShowErrorModal(true);
                return;
            }

            // ✅ Si NO tiene contenidos NI categorías, proceder con la eliminación
            const userId = await getUserIdFromToken();

            if (!userId) {
                console.warn("❌ No se pudo obtener el ID del usuario");
                SecurityUtils.logSecurityEvent('ERROR_GET_USER_ID', {
                    razon: 'no_user_token'
                });
                Alert.alert("Error", "No se pudo identificar al usuario autenticado.");
                return;
            }

            await agenteService.delete(agenteToDelete.id_agente, { eliminado_por: userId });

            // 🔐 Log de eliminación exitosa
            SecurityUtils.logSecurityEvent('AGENT_DELETED_SUCCESS', {
                idAgente: agenteToDelete.id_agente,
                nombreAgente: agenteToDelete.nombre_agente,
                eliminadoPor: userId
            });

            setSuccessMessage('🗑️ Agente eliminado permanentemente');
            setShowSuccessMessage(true);

            setShowDeleteModal(false);
            setShowDetailModal(false);
            setAgenteToDelete(null);

            await cargarAgentes();
            await cargarEstadisticas();

            setTimeout(() => {
                setShowSuccessMessage(false);
            }, 3000);
        } catch (err) {
            // 🔐 Log de error en eliminación
            SecurityUtils.logSecurityEvent('ERROR_DELETE_AGENT', {
                error: err.message,
                idAgente: agenteToDelete?.id_agente
            });

            // El mensaje viene directamente en err.message
            let mensajeError = err?.message || 'No se pudo eliminar el agente';

            // Reemplazar "desactivar" por "eliminar" si viene del backend
            mensajeError = mensajeError.replace(/desactivar/gi, 'eliminar');

            console.log('📝 Mostrando error:', mensajeError);

            // Cerrar modal de confirmación
            setShowDeleteModal(false);

            // Mostrar modal de error
            setErrorMessage(mensajeError);
            setErrorDetails({ message: mensajeError });
            setShowErrorModal(true);
        }
    };

    const handleToggleStatus = (agente) => {
        // � Rate limiting: máx 5 operaciones/minuto
        if (!rateLimiterOperaciones.isAllowed('toggleEstado')) {
            SecurityUtils.logSecurityEvent('RATE_LIMIT_TOGGLE_STATUS', {
                razon: 'demasiadas_operaciones'
            });
            Alert.alert('Límite excedido', 'Estás realizando demasiadas operaciones. Por favor espera un momento.');
            return;
        }

        // 🔐 Validar que el agente tenga ID válido
        if (!agente || !SecurityUtils.validateId(agente.id_agente)) {
            SecurityUtils.logSecurityEvent('INVALID_AGENT_ID_TOGGLE', {
                id: agente?.id_agente
            });
            Alert.alert('Error', 'Agente inválido');
            return;
        }

        // 🔥 VALIDACIÓN: Verificar que el usuario puede cambiar el estado de este agente
        if (usuarioActual?.id_departamento && agente.id_departamento) {
            if (usuarioActual.id_departamento.toString() !== agente.id_departamento.toString()) {
                SecurityUtils.logSecurityEvent('UNAUTHORIZED_TOGGLE_ATTEMPT', {
                    idAgente: agente.id_agente,
                    usuarioDept: usuarioActual.id_departamento,
                    agenteDept: agente.id_departamento
                });
                Alert.alert(
                    '⛔ Acceso Denegado',
                    'No tienes permisos para cambiar el estado de agentes de otros departamentos.',
                    [{ text: 'Entendido', style: 'cancel' }]
                );
                return;
            }
        }

        SecurityUtils.logSecurityEvent('TOGGLE_STATUS_INITIATED', {
            idAgente: agente.id_agente,
            nuevoEstado: !agente.activo
        });

        // Abrir modal de confirmación
        setAgenteParaCambiarEstado(agente);
        setShowConfirmModal(true);
    };

    const confirmarCambioEstado = async () => {
        if (!agenteParaCambiarEstado) return;

        try {
            // 🔐 Rate limiting de operaciones
            if (!rateLimiterOperaciones.isAllowed('confirmarToggle')) {
                SecurityUtils.logSecurityEvent('RATE_LIMIT_CONFIRM_TOGGLE', {
                    razon: 'demasiadas_operaciones'
                });
                Alert.alert('Límite excedido', 'Por favor espera un momento.');
                return;
            }

            // 🔐 Validar que el agente tenga estructura correcta
            if (!SecurityUtils.validateId(agenteParaCambiarEstado.id_agente)) {
                throw new Error('ID de agente inválido');
            }

            const newStatus = !agenteParaCambiarEstado.activo;

            // 🔐 Validar los datos antes de actualizar
            if (typeof newStatus !== 'boolean') {
                throw new Error('Estado del agente inválido');
            }

            await agenteService.update(agenteParaCambiarEstado.id_agente, {
                ...agenteParaCambiarEstado,
                activo: newStatus,
            });

            // 🔐 Log de éxito
            SecurityUtils.logSecurityEvent('AGENT_STATUS_CHANGED', {
                idAgente: agenteParaCambiarEstado.id_agente,
                nuevoEstado: newStatus
            });

            setSuccessMessage(
                `✅ Agente ${newStatus ? 'activado' : 'desactivado'} correctamente`
            );
            setShowSuccessMessage(true);
            setShowConfirmModal(false);
            setAgenteParaCambiarEstado(null);

            cargarAgentes();
            cargarEstadisticas();

            setTimeout(() => {
                setShowSuccessMessage(false);
            }, 3000);
        } catch (err) {
            // 🔐 Log de error
            SecurityUtils.logSecurityEvent('ERROR_CHANGE_STATUS', {
                error: err.message,
                idAgente: agenteParaCambiarEstado?.id_agente
            });

            Alert.alert('Error', err.message || 'No se pudo cambiar el estado del agente');
            setShowConfirmModal(false);
        }
    };

    const cancelarCambioEstado = () => {
        setShowConfirmModal(false);
        setAgenteParaCambiarEstado(null);
    };

    // ============ UTILIDADES ============

    const handleSearchChange = (text) => {
        // 🔐 Rate limiting: máx 30 búsquedas/minuto
        if (!rateLimiterBusqueda.isAllowed('busqueda')) {
            SecurityUtils.logSecurityEvent('RATE_LIMIT_SEARCH', {
                razon: 'demasiadas_busquedas'
            });
            return;
        }

        // 🔐 Detectar XSS en búsqueda
        if (SecurityUtils.detectXssAttempt(text)) {
            SecurityUtils.logSecurityEvent('XSS_ATTEMPT_SEARCH', {
                query: text.substring(0, 100)
            });
            Alert.alert('Seguridad', 'Se detectó un intento de inyección maliciosa.');
            setSearchTerm('');
            return;
        }

        const sanitized = SecurityValidator.sanitizeText(text);
        const truncated = SecurityValidator.truncateText(sanitized, 100);
        SecurityUtils.logSecurityEvent('SEARCH_PERFORMED', {
            length: truncated.length
        });
        setSearchTerm(truncated);
    };

    // 🔥 Filtrar agentes por búsqueda Y estado
    const filteredAgentes = agentes.filter((agente) => {
        // Filtro de búsqueda
        const matchSearch =
            agente.nombre_agente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            agente.area_especialidad?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            agente.tipo_agente?.toLowerCase().includes(searchTerm.toLowerCase());

        // Filtro de estado
        const matchEstado =
            filterEstado === 'todos' ? true :
                filterEstado === 'activo' ? (agente.activo === true || agente.activo === 1) :
                    filterEstado === 'inactivo' ? (agente.activo === false || agente.activo === 0) :
                        true;

        return matchSearch && matchEstado;
    });

    const formatModelName = (modelo) => {
        if (!modelo) return 'N/A';
        if (modelo.includes('claude')) {
            const parts = modelo.split('-');
            if (parts.length >= 3) {
                const name = parts[1].charAt(0).toUpperCase() + parts[1].slice(1);
                const version = parts[2];
                return `${name} ${version}`;
            }
            return 'Claude';
        } else if (modelo.includes('gpt')) {
            return modelo.toUpperCase().replace(/-/g, ' ');
        } else if (modelo.includes('gemini')) {
            const parts = modelo.split('-');
            return parts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
        }
        return modelo.split('-').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getTipoBadgeStyles = (tipo) => {
        switch (tipo) {
            case 'router':
                return { bg: 'rgba(251, 146, 60, 0.2)', text: '#fb923c', border: '#fb923c' };
            case 'especializado':
                return { bg: 'rgba(34, 197, 94, 0.2)', text: '#22c55e', border: '#22c55e' };
            case 'hibrido':
                return { bg: 'rgba(168, 85, 247, 0.2)', text: '#a855f7', border: '#a855f7' };
            default:
                return { bg: 'rgba(148, 163, 184, 0.2)', text: '#94a3b8', border: '#94a3b8' };
        }
    };

    // ============ RENDER ============
    return (
        <View style={contentStyles.wrapper}>

            {/* ============ SIDEBAR ============ */}
            {/* ============ SIDEBAR SOLO EN WEB ============ */}
            {isWeb && (
                <FuncionarioSidebar
                    isOpen={sidebarOpen}
                    onToggle={() => setSidebarOpen(!sidebarOpen)}
                    onNavigate={() => setSidebarOpen(false)}
                />
            )}

            {/* ============ SIDEBAR MÓVIL CON OVERLAY ============ */}
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
                    <View
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            bottom: 0,
                            width: '80%',
                            maxWidth: 320,
                            zIndex: 999,
                        }}
                    >
                        <FuncionarioSidebar
                            isOpen={sidebarOpen}
                            onNavigate={() => setSidebarOpen(false)}
                        />
                    </View>
                </>
            )}

            {/* ============ CONTENIDO PRINCIPAL ============ */}
            <View style={[
                contentStyles.mainContent,
                sidebarOpen && contentStyles.mainContentWithSidebar
            ]}>

                {/* ============ BOTÓN TOGGLE SIDEBAR ============ */}
                <TouchableOpacity
                    style={{
                        position: 'absolute',
                        top: 16,
                        left: 16,
                        zIndex: 1001,
                        backgroundColor: '#1e1b4b',
                        padding: 12,
                        borderRadius: 12,
                        shadowColor: '#667eea',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.4,
                        shadowRadius: 8,
                        elevation: 8,
                        // ✅ AJUSTE: Aumentar la distancia del movimiento
                        transform: [
                            { translateX: sidebarOpen && !isWeb ? 280 : 0 } // Aumentado de 260 a 280px
                        ],
                    }}
                    onPress={() => setSidebarOpen(!sidebarOpen)}
                >
                    <Ionicons name={sidebarOpen ? "close" : "menu"} size={24} color="#ffffff" />
                </TouchableOpacity>

                {/* ============ PANTALLA DE CARGA ============ */}
                {verificandoPermiso || estadoCarga !== 'ok' ? (
                    <View style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: '#0f172a',
                    }}>
                        {/* CARGANDO */}
                        {(verificandoPermiso || estadoCarga === 'cargando') && (
                            <>
                                <ActivityIndicator size="large" color="#667eea" />
                                <Text style={{
                                    color: 'rgba(255, 255, 255, 0.7)',
                                    marginTop: 16,
                                    fontSize: 16,
                                    fontWeight: '600',
                                }}>
                                    {verificandoPermiso ? 'Verificando permisos...' : 'Verificando departamento y agente...'}
                                </Text>
                            </>
                        )}

                        {/* SIN DEPARTAMENTO */}
                        {!verificandoPermiso && estadoCarga === 'sin_departamento' && (
                            <View style={{
                                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                padding: 40,
                                borderRadius: 24,
                                borderWidth: 2,
                                borderColor: '#ef4444',
                                maxWidth: 500,
                                alignItems: 'center',
                            }}>
                                <Text style={{ fontSize: 64, marginBottom: 20 }}>🏢</Text>
                                <Text style={{
                                    fontSize: 24,
                                    fontWeight: '700',
                                    color: '#ef4444',
                                    marginBottom: 12,
                                    textAlign: 'center',
                                }}>
                                    Sin Departamento Asignado
                                </Text>
                                <Text style={{
                                    fontSize: 14,
                                    color: 'rgba(255, 255, 255, 0.7)',
                                    textAlign: 'center',
                                    lineHeight: 22,
                                }}>
                                    {mensajeError}
                                </Text>
                            </View>
                        )}

                        {/* SIN AGENTE */}
                        {!verificandoPermiso && estadoCarga === 'sin_agente' && (
                            <View style={{
                                backgroundColor: 'rgba(251, 191, 36, 0.1)',
                                padding: 40,
                                borderRadius: 24,
                                borderWidth: 2,
                                borderColor: '#fbbf24',
                                maxWidth: 500,
                                alignItems: 'center',
                            }}>
                                <Text style={{ fontSize: 64, marginBottom: 20 }}>🤖</Text>
                                <Text style={{
                                    fontSize: 24,
                                    fontWeight: '700',
                                    color: '#fbbf24',
                                    marginBottom: 12,
                                    textAlign: 'center',
                                }}>
                                    Agente No Configurado
                                </Text>
                                <Text style={{
                                    fontSize: 14,
                                    color: 'rgba(255, 255, 255, 0.7)',
                                    textAlign: 'center',
                                    lineHeight: 22,
                                }}>
                                    {mensajeError}
                                </Text>
                            </View>
                        )}
                    </View>
                ) : !tienePermiso ? (
                    /* ============ PANTALLA SIN PERMISOS ============ */
                    <View style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                        padding: 32,
                        backgroundColor: '#0f172a',
                    }}>
                        <View style={{
                            width: 120,
                            height: 120,
                            borderRadius: 60,
                            backgroundColor: 'rgba(239, 68, 68, 0.2)',
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginBottom: 24,
                            borderWidth: 3,
                            borderColor: 'rgba(239, 68, 68, 0.3)',
                        }}>
                            <Ionicons name="lock-closed" size={56} color="#ef4444" />
                        </View>

                        <Text style={{
                            color: 'white',
                            fontSize: 24,
                            fontWeight: '700',
                            marginBottom: 12,
                            textAlign: 'center',
                        }}>
                            Acceso Restringido
                        </Text>

                        <Text style={{
                            color: 'rgba(255, 255, 255, 0.6)',
                            fontSize: 16,
                            textAlign: 'center',
                            lineHeight: 24,
                            maxWidth: 500,
                        }}>
                            {mensajeError}
                        </Text>

                        <TouchableOpacity
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: 8,
                                marginTop: 32,
                                paddingHorizontal: 24,
                                paddingVertical: 12,
                                borderRadius: 12,
                                backgroundColor: 'rgba(102, 126, 234, 0.2)',
                                borderWidth: 1,
                                borderColor: 'rgba(102, 126, 234, 0.3)',
                            }}
                            onPress={() => {
                                // Aquí puedes agregar navegación de regreso si tienes router
                            }}
                        >
                            <Ionicons name="arrow-back" size={20} color="#667eea" />
                            <Text style={{
                                color: '#667eea',
                                fontSize: 15,
                                fontWeight: '600',
                            }}>
                                Volver
                            </Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    /* ============ CONTENIDO NORMAL (SI TIENE PERMISOS) ============ */
                    <ScrollView
                        style={styles.container}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{
                            paddingBottom: isWeb ? 100 : 120,
                            paddingTop: isWeb ? 0 : 70,  // ✅ REDUCIDO de 80 a 70
                        }}
                    >

                        {/* ============ HEADER ============ */}
                        <View style={styles.header}>
                            <View style={styles.headerLeft}>
                                <Text style={styles.title}>🤖 Gestión de Agentes en Funcionario</Text>
                                <Text style={styles.subtitle}>
                                    {agentes.length} {agentes.length === 1 ? 'agente registrado' : 'agentes registrados'}
                                </Text>
                            </View>

                            {/* Badge en WEB (posición original) */}
                            {isWeb && agentes.length === 1 && (
                                <View style={{
                                    marginHorizontal: 16,
                                    marginTop: 12,
                                    marginBottom: 12,
                                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                                    padding: 12,
                                    borderRadius: 12,
                                    borderWidth: 1,
                                    borderColor: 'rgba(16, 185, 129, 0.3)',
                                }}>
                                    <View style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        gap: 10,
                                    }}>
                                        <View style={{
                                            width: 32,
                                            height: 32,
                                            borderRadius: 8,
                                            backgroundColor: '#10b981',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                        }}>
                                            <Ionicons name="checkmark-circle" size={18} color="white" />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={{
                                                color: '#10b981',
                                                fontWeight: '700',
                                                fontSize: 14,
                                            }}>
                                                Agente de tu departamento
                                            </Text>
                                            <Text style={{
                                                color: 'rgba(255, 255, 255, 0.7)',
                                                fontSize: 12,
                                                lineHeight: 16,
                                            }} numberOfLines={1}>
                                                {agentes[0].nombre_agente}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            )}

                        </View>

                        {/* Badge en MÓVIL (debajo del header) */}
                        {!isWeb && agentes.length === 1 && (
                            <View style={{
                                marginHorizontal: 16,
                                marginTop: 12,
                                marginBottom: 8,
                                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                                paddingVertical: 10,
                                paddingHorizontal: 12,
                                borderRadius: 10,
                                borderLeftWidth: 3,
                                borderLeftColor: '#10b981',
                            }}>
                                <View style={{
                                    flexDirection: 'row',
                                    alignItems: 'flex-start',
                                    gap: 8,
                                }}>
                                    <Ionicons name="checkmark-circle" size={18} color="#10b981" style={{ marginTop: 2 }} />
                                    <View style={{ flex: 1 }}>
                                        <Text style={{
                                            color: '#10b981',
                                            fontWeight: '600',
                                            fontSize: 12,
                                            lineHeight: 18,
                                        }}>
                                            Gestionando: {agentes[0].nombre_agente}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        )}

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

                        {/* ============ ESTADÍSTICAS ============ */}
                        <View style={styles.statsGrid}>
                            <View style={styles.statCard}>
                                <View style={[
                                    styles.statIconWrapper,
                                    { backgroundColor: getStatIconColor('total').bg }
                                ]}>
                                    <Ionicons
                                        name="apps"
                                        size={24}
                                        color={getStatIconColor('total').color}
                                    />
                                </View>
                                <View style={styles.statContent}>
                                    <Text style={styles.statLabel}>Total Agentes</Text>
                                    <Text style={styles.statValue}>{stats?.total ?? 0}</Text>
                                </View>
                            </View>

                            <View style={styles.statCard}>
                                <View style={[
                                    styles.statIconWrapper,
                                    { backgroundColor: getStatIconColor('activos').bg }
                                ]}>
                                    <Ionicons
                                        name="power"
                                        size={24}
                                        color={getStatIconColor('activos').color}
                                    />
                                </View>
                                <View style={styles.statContent}>
                                    <Text style={styles.statLabel}>Activos</Text>
                                    <Text style={styles.statValue}>{stats?.activos ?? 0}</Text>
                                </View>
                            </View>

                            <View style={styles.statCard}>
                                <View style={[
                                    styles.statIconWrapper,
                                    { backgroundColor: getStatIconColor('router').bg }
                                ]}>
                                    <Ionicons
                                        name="filter"
                                        size={24}
                                        color={getStatIconColor('router').color}
                                    />
                                </View>
                                <View style={styles.statContent}>
                                    <Text style={styles.statLabel}>Routers</Text>
                                    <Text style={styles.statValue}>{stats?.router ?? 0}</Text>
                                </View>
                            </View>

                            <View style={styles.statCard}>
                                <View style={[
                                    styles.statIconWrapper,
                                    { backgroundColor: getStatIconColor('especializados').bg }
                                ]}>
                                    <Ionicons
                                        name="people"
                                        size={24}
                                        color={getStatIconColor('especializados').color}
                                    />
                                </View>
                                <View style={styles.statContent}>
                                    <Text style={styles.statLabel}>Especializados</Text>
                                    <Text style={styles.statValue}>{stats?.especializados ?? 0}</Text>
                                </View>
                            </View>
                        </View>


                        {/* ============ BÚSQUEDA ============ */}
                        <View style={styles.searchContainer}>
                            <Ionicons name="search" size={20} color="rgba(255, 255, 255, 0.5)" style={styles.searchIcon} />
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Buscar agentes..."
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
                        <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
                            {/* Título general */}
                            <Text style={{
                                fontSize: 13,
                                fontWeight: '600',
                                color: 'rgba(255, 255, 255, 0.7)',
                                marginBottom: 12,
                                textTransform: 'uppercase',
                                letterSpacing: 0.5,
                            }}>
                                🔍 Filtros de búsqueda
                            </Text>

                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={{ gap: 12 }}
                            >
                                <View style={styles.filterContainer}>
                                    {/* Filtros de Estado */}
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                        <Text style={{
                                            fontSize: 12,
                                            fontWeight: '500',
                                            color: 'rgba(255, 255, 255, 0.6)',
                                            marginRight: 4,
                                        }}>
                                            Estado:
                                        </Text>
                                        {[
                                            { key: 'todos', label: 'Todos', icon: 'list' },
                                            { key: 'activo', label: 'Activos', icon: 'checkmark-circle' },
                                            { key: 'inactivo', label: 'Inactivos', icon: 'close-circle' },
                                        ].map((filter) => (
                                            <TouchableOpacity
                                                key={`estado-${filter.key}`}
                                                style={[
                                                    styles.filterButton,
                                                    filterEstado === filter.key && styles.filterButtonActive,
                                                ]}
                                                onPress={() => setFilterEstado(filter.key)}
                                                activeOpacity={0.7}
                                            >
                                                <Ionicons
                                                    name={filter.icon}
                                                    size={14}
                                                    color={filterEstado === filter.key ? 'white' : 'rgba(255, 255, 255, 0.6)'}
                                                />
                                                <Text
                                                    style={[
                                                        styles.filterText,
                                                        filterEstado === filter.key && styles.filterTextActive,
                                                    ]}
                                                >
                                                    {filter.label}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>
                            </ScrollView>
                        </View>

                        {/* ============ LISTA ============ */}
                        {loading ? (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="large" color="#667eea" />
                                <Text style={styles.loadingText}>Cargando agentes...</Text>
                            </View>
                        ) : filteredAgentes.length === 0 ? (
                            <View style={styles.emptyContainer}>
                                <Ionicons name="file-tray-outline" size={80} color="rgba(255, 255, 255, 0.2)" />
                                <Text style={styles.emptyText}>No se encontraron agentes</Text>
                                <Text style={styles.emptySubtext}>
                                    {searchTerm ? 'Intenta con otros términos de búsqueda' : 'Crea tu primer agente virtual'}
                                </Text>
                            </View>
                        ) : (
                            <View style={{ paddingHorizontal: 16 }}>
                                {filteredAgentes.map((item) => (
                                    <GestionAgenteCard
                                        key={item.id_agente?.toString() || Math.random().toString()}
                                        agente={item}
                                        onEdit={handleEdit}
                                        onDelete={handleDelete}
                                        onView={handleView}
                                        onToggleStatus={handleToggleStatus}
                                    />
                                ))}
                            </View>
                        )}

                    </ScrollView>
                )}
            </View>

            {/* ============ MODAL FORMULARIO (CREAR/EDITAR) ============ */}
            <Modal
                visible={showFormModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowFormModal(false)}
            >
                <View style={modalStyles.overlay}>
                    <View style={modalStyles.container}>
                        <View style={modalStyles.header}>
                            <Text style={modalStyles.title}>
                                {formMode === 'create' ? '✨ Crear Nuevo Agente' : '✏️ Editar Agente'}
                            </Text>
                            <TouchableOpacity onPress={() => setShowFormModal(false)}>
                                <Ionicons name="close" size={24} color="#ffffff" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={modalStyles.content} showsVerticalScrollIndicator={false}>

                            {/* ============ INFORMACIÓN BÁSICA ============ */}
                            <View style={modalStyles.section}>
                                <Text style={modalStyles.sectionTitle}>📋 Información Básica</Text>

                                <View style={modalStyles.formGroup}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Text style={modalStyles.label}>Nombre del Agente *</Text>
                                        <TooltipIcon text="Ingresa un nombre descriptivo que identifique claramente la función del agente. Este nombre será visible para los usuarios." />
                                    </View>
                                    <TextInput
                                        style={[modalStyles.input, formErrors.nombre_agente && modalStyles.inputError]}
                                        placeholder="Ej: Asistente de Ventas"
                                        placeholderTextColor="rgba(255, 255, 255, 0.4)"
                                        value={formData.nombre_agente}
                                        onChangeText={(text) => setFormData({ ...formData, nombre_agente: text })}
                                        maxLength={100}
                                    />
                                    <Text style={[modalStyles.helperText, { textAlign: 'right', marginTop: 4 }]}>
                                        {formData.nombre_agente?.length || 0} / 100 caracteres
                                    </Text>
                                    {formErrors.nombre_agente && (
                                        <Text style={modalStyles.errorText}>{formErrors.nombre_agente}</Text>
                                    )}
                                </View>

                                <View style={modalStyles.formGroup}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Text style={modalStyles.label}>Área de Especialidad *</Text>
                                        <TooltipIcon text="Define el área específica en la que el agente se especializa (ej: Ventas, Soporte Técnico, RRHH). Esto ayuda a clasificar y organizar los agentes." />
                                    </View>
                                    <TextInput
                                        style={[modalStyles.input, formErrors.area_especialidad && modalStyles.inputError]}
                                        placeholder="Ej: Ventas, Soporte, RRHH"
                                        placeholderTextColor="rgba(255, 255, 255, 0.4)"
                                        value={formData.area_especialidad}
                                        onChangeText={(text) => setFormData({ ...formData, area_especialidad: text })}
                                        maxLength={100}
                                    />
                                    <Text style={[modalStyles.helperText, { textAlign: 'right', marginTop: 4 }]}>
                                        {formData.area_especialidad?.length || 0} / 100 caracteres
                                    </Text>
                                    {formErrors.area_especialidad && (
                                        <Text style={modalStyles.errorText}>{formErrors.area_especialidad}</Text>
                                    )}
                                </View>

                                <View style={modalStyles.formGroup}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Text style={modalStyles.label}>Departamento Responsable</Text>
                                        <TooltipIcon text="Selecciona el departamento al que pertenece este agente. Cada departamento solo puede tener un agente asignado. Una vez asignado, no se puede cambiar." />
                                    </View>
                                    <TextInput
                                        style={[modalStyles.textArea, formErrors.descripcion && modalStyles.inputError]}
                                        placeholder="Describe el propósito y funciones del agente..."
                                        placeholderTextColor="rgba(255, 255, 255, 0.4)"
                                        value={formData.descripcion}
                                        onChangeText={(text) => setFormData({ ...formData, descripcion: text })}
                                        multiline
                                        numberOfLines={4}
                                        maxLength={500}
                                    />
                                    <Text style={[modalStyles.helperText, { textAlign: 'right', marginTop: 4 }]}>
                                        {formData.descripcion?.length || 0} / 500 caracteres
                                    </Text>
                                    {formErrors.descripcion && (
                                        <Text style={modalStyles.errorText}>{formErrors.descripcion}</Text>
                                    )}
                                </View>

                                <View style={modalStyles.formGroup}>
                                    <Text style={modalStyles.label}>Departamento Responsable</Text>
                                    {formErrors.id_departamento && (
                                        <View style={{
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            gap: 8,
                                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                            padding: 10,
                                            borderRadius: 8,
                                            marginTop: 8,
                                            borderLeftWidth: 3,
                                            borderLeftColor: '#ef4444',
                                        }}>
                                            <Ionicons name="warning" size={16} color="#ef4444" />
                                            <Text style={{
                                                color: '#ef4444',
                                                fontSize: 12,
                                                fontWeight: '600',
                                                flex: 1,
                                            }}>
                                                {formErrors.id_departamento}
                                            </Text>
                                        </View>
                                    )}
                                    {/* Si está editando Y tiene departamento asignado - BLOQUEADO */}
                                    {formMode === 'edit' && selectedAgente?.id_departamento ? (
                                        <>
                                            <View style={{
                                                backgroundColor: 'rgba(71, 85, 105, 0.3)',
                                                borderWidth: 1,
                                                borderColor: 'rgba(148, 163, 184, 0.3)',
                                                borderRadius: 12,
                                                padding: 16,
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                marginTop: 8,
                                            }}>
                                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                                    <Ionicons name="business-outline" size={20} color="#94a3b8" />
                                                    <Text style={{
                                                        color: '#94a3b8',
                                                        fontSize: 15,
                                                        fontWeight: '500',
                                                    }}>
                                                        {departamentos.find(d => d.id_departamento.toString() === selectedAgente.id_departamento.toString())?.nombre || 'Departamento asignado'}
                                                    </Text>
                                                </View>
                                                <View style={{
                                                    backgroundColor: 'rgba(148, 163, 184, 0.2)',
                                                    paddingHorizontal: 10,
                                                    paddingVertical: 4,
                                                    borderRadius: 6,
                                                }}>
                                                    <Text style={{
                                                        color: '#94a3b8',
                                                        fontSize: 11,
                                                        fontWeight: '600',
                                                        textTransform: 'uppercase',
                                                        letterSpacing: 0.5,
                                                    }}>
                                                        Bloqueado
                                                    </Text>
                                                </View>
                                            </View>
                                            <Text style={modalStyles.helperText}>
                                                ⚠️ El departamento no puede cambiarse una vez asignado
                                            </Text>
                                        </>
                                    ) : (
                                        /* Si está creando O no tiene departamento - SELECTOR CON MODAL */
                                        <>
                                            {/* Botón para abrir el modal */}
                                            <TouchableOpacity
                                                style={{
                                                    marginTop: 8,
                                                    backgroundColor: 'rgba(71, 85, 105, 0.3)',
                                                    borderWidth: 2,
                                                    borderColor: 'rgba(148, 163, 184, 0.3)',
                                                    borderRadius: 12,
                                                    padding: 16,
                                                    flexDirection: 'row',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                }}
                                                onPress={() => {
                                                    console.log('🖱️ Abriendo selector de departamento');
                                                    setShowDeptPicker(true);
                                                }}
                                                activeOpacity={0.7}
                                            >
                                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
                                                    <Ionicons name="business-outline" size={20} color="#667eea" />
                                                    <Text style={{
                                                        color: formData.id_departamento ? '#ffffff' : 'rgba(255, 255, 255, 0.5)',
                                                        fontSize: 15,
                                                        fontWeight: '500',
                                                        flex: 1,
                                                    }}>
                                                        {formData.id_departamento
                                                            ? departamentos.find(d => d.id_departamento.toString() === formData.id_departamento)?.nombre || 'Seleccionar...'
                                                            : 'Seleccionar departamento...'}
                                                    </Text>
                                                </View>
                                                <Ionicons name="chevron-down" size={20} color="#667eea" />
                                            </TouchableOpacity>

                                            {/* Modal con lista de departamentos */}
                                            <Modal
                                                visible={showDeptPicker}
                                                animationType="slide"
                                                transparent={true}
                                                onRequestClose={() => setShowDeptPicker(false)}
                                            >
                                                <View style={{
                                                    flex: 1,
                                                    backgroundColor: 'rgba(0, 0, 0, 0.75)',
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                    padding: 20,
                                                }}>
                                                    <View style={{
                                                        backgroundColor: '#1e293b',
                                                        borderRadius: 16,
                                                        width: '100%',
                                                        maxWidth: 500,
                                                        maxHeight: '80%',
                                                        shadowColor: '#000',
                                                        shadowOffset: { width: 0, height: 8 },
                                                        shadowOpacity: 0.5,
                                                        shadowRadius: 16,
                                                        elevation: 16,
                                                    }}>
                                                        {/* Header del modal */}
                                                        <View style={{
                                                            backgroundColor: 'rgba(102, 126, 234, 0.2)',
                                                            padding: 16,
                                                            borderTopLeftRadius: 16,
                                                            borderTopRightRadius: 16,
                                                            borderBottomWidth: 1,
                                                            borderBottomColor: 'rgba(102, 126, 234, 0.3)',
                                                            flexDirection: 'row',
                                                            alignItems: 'center',
                                                            justifyContent: 'space-between',
                                                        }}>
                                                            <Text style={{ color: '#667eea', fontSize: 16, fontWeight: '700' }}>
                                                                📋 Seleccionar Departamento
                                                            </Text>
                                                            <TouchableOpacity
                                                                onPress={() => setShowDeptPicker(false)}
                                                                style={{
                                                                    width: 32,
                                                                    height: 32,
                                                                    borderRadius: 16,
                                                                    backgroundColor: 'rgba(148, 163, 184, 0.2)',
                                                                    justifyContent: 'center',
                                                                    alignItems: 'center',
                                                                }}
                                                            >
                                                                <Ionicons name="close" size={20} color="#ffffff" />
                                                            </TouchableOpacity>
                                                        </View>

                                                        {/* Información */}
                                                        <View style={{
                                                            padding: 12,
                                                            backgroundColor: 'rgba(102, 126, 234, 0.1)',
                                                            borderBottomWidth: 1,
                                                            borderBottomColor: 'rgba(148, 163, 184, 0.2)',
                                                        }}>
                                                            <Text style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: 13 }}>
                                                                {getDepartamentosDisponibles().length} departamento(s) disponible(s)
                                                            </Text>
                                                        </View>

                                                        {/* Lista de departamentos */}
                                                        <ScrollView
                                                            style={{ maxHeight: 400 }}
                                                            showsVerticalScrollIndicator={true}
                                                        >
                                                            {/* Opción: Sin asignar */}
                                                            <TouchableOpacity
                                                                style={{
                                                                    padding: 16,
                                                                    borderBottomWidth: 1,
                                                                    borderBottomColor: 'rgba(148, 163, 184, 0.2)',
                                                                    backgroundColor: !formData.id_departamento
                                                                        ? 'rgba(102, 126, 234, 0.3)'
                                                                        : 'transparent',
                                                                }}
                                                                onPress={() => {
                                                                    console.log('✅ Seleccionado: Sin asignar');
                                                                    setFormData({ ...formData, id_departamento: '' });
                                                                    setShowDeptPicker(false);
                                                                }}
                                                            >
                                                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                                                    <View style={{
                                                                        width: 24,
                                                                        height: 24,
                                                                        borderRadius: 12,
                                                                        borderWidth: 2,
                                                                        borderColor: !formData.id_departamento ? '#667eea' : '#94a3b8',
                                                                        backgroundColor: !formData.id_departamento ? '#667eea' : 'transparent',
                                                                        justifyContent: 'center',
                                                                        alignItems: 'center',
                                                                    }}>
                                                                        {!formData.id_departamento && (
                                                                            <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#ffffff' }} />
                                                                        )}
                                                                    </View>
                                                                    <Text style={{
                                                                        color: !formData.id_departamento ? '#ffffff' : 'rgba(255, 255, 255, 0.7)',
                                                                        fontSize: 15,
                                                                        fontWeight: !formData.id_departamento ? '600' : '400',
                                                                        flex: 1,
                                                                    }}>
                                                                        Sin asignar
                                                                    </Text>
                                                                    {!formData.id_departamento && (
                                                                        <Ionicons name="checkmark-circle" size={24} color="#22c55e" />
                                                                    )}
                                                                </View>
                                                            </TouchableOpacity>

                                                            {/* Departamentos disponibles */}
                                                            {getDepartamentosDisponibles().length > 0 ? (
                                                                getDepartamentosDisponibles().map((dept, index) => (
                                                                    <TouchableOpacity
                                                                        key={`dept-modal-${index}`}
                                                                        style={{
                                                                            padding: 16,
                                                                            borderBottomWidth: 1,
                                                                            borderBottomColor: 'rgba(148, 163, 184, 0.2)',
                                                                            backgroundColor: formData.id_departamento === dept.id_departamento.toString()
                                                                                ? 'rgba(102, 126, 234, 0.3)'
                                                                                : 'transparent',
                                                                        }}
                                                                        onPress={() => {
                                                                            console.log('✅ Departamento seleccionado:', dept.nombre);
                                                                            setFormData({ ...formData, id_departamento: dept.id_departamento.toString() });
                                                                            setShowDeptPicker(false);
                                                                        }}
                                                                    >
                                                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                                                            <View style={{
                                                                                width: 24,
                                                                                height: 24,
                                                                                borderRadius: 12,
                                                                                borderWidth: 2,
                                                                                borderColor: formData.id_departamento === dept.id_departamento.toString() ? '#667eea' : '#94a3b8',
                                                                                backgroundColor: formData.id_departamento === dept.id_departamento.toString() ? '#667eea' : 'transparent',
                                                                                justifyContent: 'center',
                                                                                alignItems: 'center',
                                                                            }}>
                                                                                {formData.id_departamento === dept.id_departamento.toString() && (
                                                                                    <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#ffffff' }} />
                                                                                )}
                                                                            </View>
                                                                            <View style={{ flex: 1 }}>
                                                                                <Text style={{
                                                                                    color: formData.id_departamento === dept.id_departamento.toString() ? '#ffffff' : 'rgba(255, 255, 255, 0.9)',
                                                                                    fontSize: 15,
                                                                                    fontWeight: formData.id_departamento === dept.id_departamento.toString() ? '600' : '400',
                                                                                }}>
                                                                                    {dept.nombre}
                                                                                </Text>
                                                                                {dept.codigo && (
                                                                                    <Text style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: 12, marginTop: 2 }}>
                                                                                        Código: {dept.codigo}
                                                                                    </Text>
                                                                                )}
                                                                            </View>
                                                                            {formData.id_departamento === dept.id_departamento.toString() && (
                                                                                <Ionicons name="checkmark-circle" size={24} color="#22c55e" />
                                                                            )}
                                                                        </View>
                                                                    </TouchableOpacity>
                                                                ))
                                                            ) : (
                                                                <View style={{ padding: 40, alignItems: 'center' }}>
                                                                    <Ionicons name="folder-open-outline" size={64} color="rgba(255, 255, 255, 0.3)" />
                                                                    <Text style={{
                                                                        color: 'rgba(255, 255, 255, 0.6)',
                                                                        fontSize: 16,
                                                                        marginTop: 16,
                                                                        textAlign: 'center',
                                                                        fontWeight: '500',
                                                                    }}>
                                                                        No hay departamentos disponibles
                                                                    </Text>
                                                                    <Text style={{
                                                                        color: 'rgba(255, 255, 255, 0.4)',
                                                                        fontSize: 14,
                                                                        marginTop: 8,
                                                                        textAlign: 'center',
                                                                    }}>
                                                                        Todos ya tienen un agente asignado
                                                                    </Text>
                                                                </View>
                                                            )}
                                                        </ScrollView>

                                                        {/* Footer con botón cerrar */}
                                                        <View style={{
                                                            padding: 16,
                                                            borderTopWidth: 1,
                                                            borderTopColor: 'rgba(148, 163, 184, 0.2)',
                                                            backgroundColor: 'rgba(30, 41, 59, 0.5)',
                                                            borderBottomLeftRadius: 16,
                                                            borderBottomRightRadius: 16,
                                                        }}>
                                                            <TouchableOpacity
                                                                style={{
                                                                    backgroundColor: 'rgba(148, 163, 184, 0.2)',
                                                                    padding: 12,
                                                                    borderRadius: 8,
                                                                    alignItems: 'center',
                                                                }}
                                                                onPress={() => setShowDeptPicker(false)}
                                                            >
                                                                <Text style={{ color: '#ffffff', fontSize: 14, fontWeight: '600' }}>
                                                                    Cerrar
                                                                </Text>
                                                            </TouchableOpacity>
                                                        </View>
                                                    </View>
                                                </View>
                                            </Modal>

                                            {/* Contador */}
                                            <View style={{
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                                gap: 8,
                                                backgroundColor: getDepartamentosDisponibles().length > 0 ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                                padding: 10,
                                                borderRadius: 8,
                                                marginTop: 8,
                                            }}>
                                                <Ionicons
                                                    name={getDepartamentosDisponibles().length > 0 ? "checkmark-circle" : "close-circle"}
                                                    size={16}
                                                    color={getDepartamentosDisponibles().length > 0 ? "#22c55e" : "#ef4444"}
                                                />
                                                <Text style={{
                                                    color: getDepartamentosDisponibles().length > 0 ? "#22c55e" : "#ef4444",
                                                    fontSize: 12,
                                                    fontWeight: '600',
                                                    flex: 1,
                                                }}>
                                                    {getDepartamentosDisponibles().length > 0
                                                        ? `${getDepartamentosDisponibles().length} departamento(s) disponible(s)`
                                                        : 'No hay departamentos disponibles'}
                                                </Text>
                                            </View>

                                            <Text style={modalStyles.helperText}>
                                                🔒 Cada departamento solo puede tener un agente asignado
                                            </Text>
                                        </>
                                    )}
                                </View>

                                {/* ============ Icono  ============ */}
                                <View style={modalStyles.formGroup}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Text style={modalStyles.label}>Icono</Text>
                                        <TooltipIcon text="Selecciona un emoji que represente visualmente al agente. Este icono aparecerá junto al nombre del agente en la interfaz." />
                                    </View>

                                    {/* Contenedor scrolleable */}
                                    <ScrollView
                                        horizontal
                                        showsHorizontalScrollIndicator={false}
                                        contentContainerStyle={{
                                            paddingVertical: 8,
                                            paddingHorizontal: 4,
                                        }}
                                    >
                                        <View style={{ flexDirection: 'row', gap: 8 }}>
                                            {iconos.map((icon, index) => (
                                                <TouchableOpacity
                                                    key={icon}
                                                    style={[
                                                        modalStyles.iconOption,
                                                        formData.icono === icon && modalStyles.iconOptionSelected,
                                                    ]}
                                                    onPress={() => setFormData({ ...formData, icono: icon })}
                                                    activeOpacity={0.7}
                                                >
                                                    <Text style={modalStyles.iconText}>{icon}</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    </ScrollView>

                                    {/* Texto de ayuda */}
                                    <Text style={modalStyles.helperText}>
                                        👆 Mantén clic y arrastra para ver más iconos
                                    </Text>
                                </View>
                            </View>

                            {/* ============ SECCIÓN: APARIENCIA ============ */}
                            <View style={modalStyles.section}>
                                <Text style={modalStyles.sectionTitle}>🎨 Apariencia</Text>

                                <View style={modalStyles.formGroup}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Text style={modalStyles.label}>URL del Avatar</Text>
                                        <TooltipIcon text="Ingresa la URL de una imagen para usar como avatar del agente. Acepta URLs de Google Images, Pinterest, Instagram, etc. La imagen debe ser accesible públicamente." />
                                    </View>
                                    {/* Input con validación */}
                                    <View style={{ gap: 12 }}>
                                        <TextInput
                                            style={[
                                                modalStyles.input,
                                                formErrors.avatar_url && modalStyles.inputError,
                                                formData.avatar_url && !isValidImageUrl(formData.avatar_url) && {
                                                    borderColor: '#fbbf24',
                                                    borderWidth: 2,
                                                }
                                            ]}
                                            placeholder="https://ejemplo.com/avatar.png o cualquier URL de imagen"
                                            placeholderTextColor="rgba(255, 255, 255, 0.4)"
                                            value={formData.avatar_url}
                                            onChangeText={(text) => setFormData({ ...formData, avatar_url: text })}
                                            maxLength={1000}
                                            autoCapitalize="none"
                                            autoCorrect={false}
                                        />
                                        <Text style={[modalStyles.helperText, { textAlign: 'right', marginTop: 4 }]}>
                                            {formData.avatar_url?.length || 0} / 255 caracteres
                                        </Text>
                                        {formErrors.avatar_url && (
                                            <Text style={modalStyles.errorText}>{formErrors.avatar_url}</Text>
                                        )}

                                        {/* Preview del Avatar */}
                                        {formData.avatar_url && formData.avatar_url.startsWith('http') && (
                                            <View style={{
                                                backgroundColor: 'rgba(71, 85, 105, 0.3)',
                                                borderRadius: 12,
                                                padding: 16,
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                                gap: 12,
                                                borderWidth: 1,
                                                borderColor: 'rgba(102, 126, 234, 0.3)',
                                            }}>
                                                <Image
                                                    source={{ uri: formData.avatar_url }}
                                                    style={{
                                                        width: 60,
                                                        height: 60,
                                                        borderRadius: 30,
                                                        borderWidth: 2,
                                                        borderColor: 'rgba(102, 126, 234, 0.5)',
                                                        backgroundColor: 'rgba(71, 85, 105, 0.5)',
                                                    }}
                                                    resizeMode="cover"
                                                />
                                                <View style={{ flex: 1 }}>
                                                    <View style={{
                                                        flexDirection: 'row',
                                                        alignItems: 'center',
                                                        gap: 6,
                                                        marginBottom: 4,
                                                    }}>
                                                        <Ionicons name="image" size={16} color="#667eea" />
                                                        <Text style={{
                                                            color: '#667eea',
                                                            fontSize: 13,
                                                            fontWeight: '600',
                                                        }}>
                                                            Vista previa
                                                        </Text>
                                                    </View>
                                                    <Text style={{
                                                        color: 'rgba(255, 255, 255, 0.6)',
                                                        fontSize: 11,
                                                    }}>
                                                        Cargando imagen...
                                                    </Text>
                                                </View>
                                            </View>
                                        )}

                                        {/* Advertencia sobre URLs externas */}
                                        {formData.avatar_url && !isValidImageUrl(formData.avatar_url) && formData.avatar_url.startsWith('http') && (
                                            <View style={{
                                                flexDirection: 'row',
                                                alignItems: 'flex-start',
                                                gap: 8,
                                                backgroundColor: 'rgba(251, 191, 36, 0.1)',
                                                padding: 12,
                                                borderRadius: 8,
                                                borderLeftWidth: 3,
                                                borderLeftColor: '#fbbf24',
                                            }}>
                                                <Ionicons name="warning" size={18} color="#fbbf24" />
                                                <View style={{ flex: 1 }}>
                                                    <Text style={{
                                                        color: '#fbbf24',
                                                        fontSize: 12,
                                                        fontWeight: '600',
                                                        marginBottom: 4,
                                                    }}>
                                                        URL Externa Detectada
                                                    </Text>
                                                    <Text style={{
                                                        color: 'rgba(251, 191, 36, 0.8)',
                                                        fontSize: 11,
                                                    }}>
                                                        Esta URL puede funcionar, pero algunos sitios bloquean imágenes externas. Si no se muestra correctamente, prueba descargando la imagen y subiéndola a un servicio como Imgur.
                                                    </Text>
                                                </View>
                                            </View>
                                        )}
                                    </View>

                                    <Text style={modalStyles.helperText}>
                                        ✅ Acepta URLs de: Google Images, Pinterest, Instagram, Twitter, etc.
                                    </Text>
                                    <Text style={[modalStyles.helperText, { marginTop: 4 }]}>
                                        💡 Copia la URL de la imagen (clic derecho → Copiar dirección de imagen)
                                    </Text>
                                    <Text style={[modalStyles.helperText, { marginTop: 4 }]}>
                                        ⚠️ Algunas plataformas pueden bloquear el acceso externo
                                    </Text>
                                </View>

                                {/* COLOR */}
                                <View style={modalStyles.formGroup}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Text style={modalStyles.label}>Color del Tema</Text>
                                        <TooltipIcon text="Selecciona un color que represente al agente. Este color se usará en la interfaz para identificar visualmente al agente y sus respuestas." />
                                    </View>

                                    {/* Input y Preview con botón de paleta */}
                                    <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
                                        <TextInput
                                            style={[modalStyles.input, { flex: 1 }]}
                                            placeholder="#667eea"
                                            placeholderTextColor="rgba(255, 255, 255, 0.4)"
                                            value={formData.color_tema}
                                            onChangeText={(text) => {
                                                const hex = text.startsWith('#') ? text : '#' + text;
                                                setFormData({ ...formData, color_tema: hex });
                                            }}
                                            maxLength={7}
                                            autoCapitalize="none"
                                        />

                                        {/* Preview del color */}
                                        <View style={{
                                            width: 50,
                                            height: 50,
                                            borderRadius: 8,
                                            backgroundColor: formData.color_tema || '#667eea',
                                            borderWidth: 2,
                                            borderColor: 'rgba(255, 255, 255, 0.2)',
                                        }} />

                                        {/* Botón para abrir paleta */}
                                        <TouchableOpacity
                                            style={{
                                                width: 50,
                                                height: 50,
                                                borderRadius: 8,
                                                backgroundColor: 'rgba(102, 126, 234, 0.2)',
                                                borderWidth: 2,
                                                borderColor: '#667eea',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                            }}
                                            onPress={() => setShowColorPicker(!showColorPicker)}
                                            activeOpacity={0.7}
                                        >
                                            <Ionicons
                                                name={showColorPicker ? "close" : "color-palette"}
                                                size={24}
                                                color="#667eea"
                                            />
                                        </TouchableOpacity>
                                    </View>

                                    {/* Paleta desplegable */}
                                    {showColorPicker && (
                                        <View style={{
                                            marginTop: 12,
                                            backgroundColor: 'rgba(71, 85, 105, 0.3)',
                                            borderRadius: 12,
                                            padding: 16,
                                            borderWidth: 1,
                                            borderColor: 'rgba(148, 163, 184, 0.3)',
                                        }}>
                                            <Text style={{
                                                color: 'rgba(255, 255, 255, 0.7)',
                                                fontSize: 13,
                                                fontWeight: '600',
                                                marginBottom: 12,
                                            }}>
                                                🎨 Selecciona un Color
                                            </Text>

                                            {/* Fila 1: Colores Principales */}
                                            <View style={{ marginBottom: 12 }}>
                                                <Text style={{
                                                    color: 'rgba(255, 255, 255, 0.5)',
                                                    fontSize: 11,
                                                    marginBottom: 8,
                                                    textTransform: 'uppercase',
                                                    letterSpacing: 0.5,
                                                }}>
                                                    Principales
                                                </Text>
                                                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                                                    {[
                                                        { color: '#667eea', name: 'Índigo' },
                                                        { color: '#3b82f6', name: 'Azul' },
                                                        { color: '#8b5cf6', name: 'Púrpura' },
                                                        { color: '#ec4899', name: 'Rosa' },
                                                        { color: '#f43f5e', name: 'Rojo' },
                                                    ].map((item) => (
                                                        <TouchableOpacity
                                                            key={item.color}
                                                            style={{
                                                                width: 50,
                                                                height: 50,
                                                                borderRadius: 8,
                                                                backgroundColor: item.color,
                                                                borderWidth: formData.color_tema === item.color ? 3 : 2,
                                                                borderColor: formData.color_tema === item.color
                                                                    ? '#ffffff'
                                                                    : 'rgba(255, 255, 255, 0.2)',
                                                                justifyContent: 'center',
                                                                alignItems: 'center',
                                                            }}
                                                            onPress={() => {
                                                                setFormData({ ...formData, color_tema: item.color });
                                                                setShowColorPicker(false);
                                                            }}
                                                            activeOpacity={0.7}
                                                        >
                                                            {formData.color_tema === item.color && (
                                                                <Ionicons name="checkmark-circle" size={20} color="#ffffff" />
                                                            )}
                                                        </TouchableOpacity>
                                                    ))}
                                                </View>
                                            </View>

                                            {/* Fila 2: Colores Cálidos */}
                                            <View style={{ marginBottom: 12 }}>
                                                <Text style={{
                                                    color: 'rgba(255, 255, 255, 0.5)',
                                                    fontSize: 11,
                                                    marginBottom: 8,
                                                    textTransform: 'uppercase',
                                                    letterSpacing: 0.5,
                                                }}>
                                                    Cálidos
                                                </Text>
                                                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                                                    {[
                                                        { color: '#f59e0b', name: 'Naranja' },
                                                        { color: '#fb923c', name: 'Mandarina' },
                                                        { color: '#ef4444', name: 'Rojo Vivo' },
                                                        { color: '#dc2626', name: 'Carmesí' },
                                                        { color: '#be185d', name: 'Magenta' },
                                                    ].map((item) => (
                                                        <TouchableOpacity
                                                            key={item.color}
                                                            style={{
                                                                width: 50,
                                                                height: 50,
                                                                borderRadius: 8,
                                                                backgroundColor: item.color,
                                                                borderWidth: formData.color_tema === item.color ? 3 : 2,
                                                                borderColor: formData.color_tema === item.color
                                                                    ? '#ffffff'
                                                                    : 'rgba(255, 255, 255, 0.2)',
                                                                justifyContent: 'center',
                                                                alignItems: 'center',
                                                            }}
                                                            onPress={() => {
                                                                setFormData({ ...formData, color_tema: item.color });
                                                                setShowColorPicker(false);
                                                            }}
                                                            activeOpacity={0.7}
                                                        >
                                                            {formData.color_tema === item.color && (
                                                                <Ionicons name="checkmark-circle" size={20} color="#ffffff" />
                                                            )}
                                                        </TouchableOpacity>
                                                    ))}
                                                </View>
                                            </View>

                                            {/* Fila 3: Colores Fríos */}
                                            <View style={{ marginBottom: 12 }}>
                                                <Text style={{
                                                    color: 'rgba(255, 255, 255, 0.5)',
                                                    fontSize: 11,
                                                    marginBottom: 8,
                                                    textTransform: 'uppercase',
                                                    letterSpacing: 0.5,
                                                }}>
                                                    Fríos
                                                </Text>
                                                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                                                    {[
                                                        { color: '#06b6d4', name: 'Cyan' },
                                                        { color: '#0891b2', name: 'Turquesa' },
                                                        { color: '#0e7490', name: 'Azul Océano' },
                                                        { color: '#0d9488', name: 'Verde Azulado' },
                                                        { color: '#14b8a6', name: 'Teal' },
                                                    ].map((item) => (
                                                        <TouchableOpacity
                                                            key={item.color}
                                                            style={{
                                                                width: 50,
                                                                height: 50,
                                                                borderRadius: 8,
                                                                backgroundColor: item.color,
                                                                borderWidth: formData.color_tema === item.color ? 3 : 2,
                                                                borderColor: formData.color_tema === item.color
                                                                    ? '#ffffff'
                                                                    : 'rgba(255, 255, 255, 0.2)',
                                                                justifyContent: 'center',
                                                                alignItems: 'center',
                                                            }}
                                                            onPress={() => {
                                                                setFormData({ ...formData, color_tema: item.color });
                                                                setShowColorPicker(false);
                                                            }}
                                                            activeOpacity={0.7}
                                                        >
                                                            {formData.color_tema === item.color && (
                                                                <Ionicons name="checkmark-circle" size={20} color="#ffffff" />
                                                            )}
                                                        </TouchableOpacity>
                                                    ))}
                                                </View>
                                            </View>

                                            {/* Fila 4: Colores Naturales */}
                                            <View>
                                                <Text style={{
                                                    color: 'rgba(255, 255, 255, 0.5)',
                                                    fontSize: 11,
                                                    marginBottom: 8,
                                                    textTransform: 'uppercase',
                                                    letterSpacing: 0.5,
                                                }}>
                                                    Naturales
                                                </Text>
                                                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                                                    {[
                                                        { color: '#10b981', name: 'Verde' },
                                                        { color: '#22c55e', name: 'Esmeralda' },
                                                        { color: '#84cc16', name: 'Lima' },
                                                        { color: '#eab308', name: 'Amarillo' },
                                                        { color: '#64748b', name: 'Pizarra' },
                                                    ].map((item) => (
                                                        <TouchableOpacity
                                                            key={item.color}
                                                            style={{
                                                                width: 50,
                                                                height: 50,
                                                                borderRadius: 8,
                                                                backgroundColor: item.color,
                                                                borderWidth: formData.color_tema === item.color ? 3 : 2,
                                                                borderColor: formData.color_tema === item.color
                                                                    ? '#ffffff'
                                                                    : 'rgba(255, 255, 255, 0.2)',
                                                                justifyContent: 'center',
                                                                alignItems: 'center',
                                                            }}
                                                            onPress={() => {
                                                                setFormData({ ...formData, color_tema: item.color });
                                                                setShowColorPicker(false);
                                                            }}
                                                            activeOpacity={0.7}
                                                        >
                                                            {formData.color_tema === item.color && (
                                                                <Ionicons name="checkmark-circle" size={20} color="#ffffff" />
                                                            )}
                                                        </TouchableOpacity>
                                                    ))}
                                                </View>
                                                {formErrors.color_tema && (
                                                    <Text style={modalStyles.errorText}>{formErrors.color_tema}</Text>
                                                )}
                                            </View>
                                        </View>
                                    )}

                                    <Text style={modalStyles.helperText}>
                                        💡 Haz clic en 🎨 para ver más colores o ingresa tu código hexadecimal
                                    </Text>
                                </View>
                            </View>

                            {/* ============ SECCIÓN: MENSAJES PREDEFINIDOS ============ */}
                            <View style={modalStyles.section}>
                                <Text style={modalStyles.sectionTitle}>💬 Mensajes Predefinidos</Text>

                                <View style={modalStyles.formGroup}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Text style={modalStyles.label}>Mensaje de Bienvenida *</Text>
                                        <TooltipIcon text="Este es el primer mensaje que verán los usuarios al iniciar una conversación con el agente. Hazlo amigable y descriptivo sobre cómo el agente puede ayudar." />
                                    </View>
                                    <TextInput
                                        style={[modalStyles.textArea, formErrors.mensaje_bienvenida && modalStyles.inputError]}
                                        placeholder="¡Hola! Soy tu asistente virtual. ¿En qué puedo ayudarte?"
                                        placeholderTextColor="rgba(255, 255, 255, 0.4)"
                                        value={formData.mensaje_bienvenida}
                                        onChangeText={(text) => setFormData({ ...formData, mensaje_bienvenida: text })}
                                        multiline
                                        numberOfLines={3}
                                        maxLength={500}
                                    />
                                    <Text style={[modalStyles.helperText, { textAlign: 'right', marginTop: 4 }]}>
                                        {formData.mensaje_bienvenida?.length || 0} / 500 caracteres
                                    </Text>
                                    {formErrors.mensaje_bienvenida && (
                                        <Text style={modalStyles.errorText}>{formErrors.mensaje_bienvenida}</Text>
                                    )}
                                    <Text style={modalStyles.helperText}>
                                        Primer mensaje que verá el usuario al iniciar conversación
                                    </Text>
                                </View>

                                <View style={modalStyles.formGroup}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Text style={modalStyles.label}>Mensaje de Despedida *</Text>
                                        <TooltipIcon text="Mensaje que se muestra cuando el usuario finaliza la conversación. Debe ser cortés y puede incluir información de contacto adicional." />
                                    </View>
                                    <TextInput
                                        style={[modalStyles.textArea, formErrors.mensaje_despedida && modalStyles.inputError]}
                                        placeholder="¡Hasta pronto! Fue un gusto ayudarte."
                                        placeholderTextColor="rgba(255, 255, 255, 0.4)"
                                        value={formData.mensaje_despedida}
                                        onChangeText={(text) => setFormData({ ...formData, mensaje_despedida: text })}
                                        multiline
                                        numberOfLines={3}
                                        maxLength={500}
                                    />
                                    <Text style={[modalStyles.helperText, { textAlign: 'right', marginTop: 4 }]}>
                                        {formData.mensaje_despedida?.length || 0} / 500 caracteres
                                    </Text>
                                    {formErrors.mensaje_despedida && (
                                        <Text style={modalStyles.errorText}>{formErrors.mensaje_despedida}</Text>
                                    )}
                                    <Text style={modalStyles.helperText}>
                                        Mensaje cuando el usuario finaliza la conversación
                                    </Text>
                                </View>

                                <View style={modalStyles.formGroup}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Text style={modalStyles.label}>Mensaje de Derivación *</Text>
                                        <TooltipIcon text="Mensaje que se muestra cuando el agente necesita transferir la consulta a un especialista humano o a otro agente. Debe explicar el motivo de la transferencia." />
                                    </View>
                                    <TextInput
                                        style={[modalStyles.textArea, formErrors.mensaje_derivacion && modalStyles.inputError]}
                                        placeholder="Voy a transferir tu consulta a un especialista humano..."
                                        placeholderTextColor="rgba(255, 255, 255, 0.4)"
                                        value={formData.mensaje_derivacion}
                                        onChangeText={(text) => setFormData({ ...formData, mensaje_derivacion: text })}
                                        multiline
                                        numberOfLines={3}
                                        maxLength={500}
                                    />
                                    <Text style={[modalStyles.helperText, { textAlign: 'right', marginTop: 4 }]}>
                                        {formData.mensaje_derivacion?.length || 0} / 500 caracteres
                                    </Text>

                                    {formErrors.mensaje_derivacion && (
                                        <Text style={modalStyles.errorText}>{formErrors.mensaje_derivacion}</Text>
                                    )}
                                    <Text style={modalStyles.helperText}>
                                        Mensaje cuando se deriva a otro agente o humano
                                    </Text>
                                </View>

                                <View style={modalStyles.formGroup}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Text style={modalStyles.label}>Mensaje Fuera de Horario *</Text>
                                        <TooltipIcon text="Mensaje automático que se envía cuando los usuarios escriben fuera del horario de atención. Debe incluir el horario de disponibilidad del agente." />
                                    </View>
                                    <TextInput
                                        style={[modalStyles.textArea, formErrors.mensaje_fuera_horario && modalStyles.inputError]}
                                        placeholder="Gracias por escribir. Nuestro horario es Lunes-Viernes 8am-5pm..."
                                        placeholderTextColor="rgba(255, 255, 255, 0.4)"
                                        value={formData.mensaje_fuera_horario}
                                        onChangeText={(text) => setFormData({ ...formData, mensaje_fuera_horario: text })}
                                        multiline
                                        numberOfLines={3}
                                        maxLength={500}
                                    />
                                    <Text style={[modalStyles.helperText, { textAlign: 'right', marginTop: 4 }]}>
                                        {formData.mensaje_fuera_horario?.length || 0} / 500 caracteres
                                    </Text>
                                    {formErrors.mensaje_fuera_horario && (
                                        <Text style={modalStyles.errorText}>{formErrors.mensaje_fuera_horario}</Text>
                                    )}
                                    <Text style={modalStyles.helperText}>
                                        Mensaje automático cuando se escribe fuera del horario
                                    </Text>
                                </View>
                            </View>

                            {/* Configuración de IA */}
                            <View style={modalStyles.section}>
                                <Text style={modalStyles.sectionTitle}>🤖 Configuración de IA</Text>

                                {/* ⭐ CAMPO BLOQUEADO DE MODELO IA ⭐ */}
                                <View style={modalStyles.formGroup}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Text style={modalStyles.label}>Modelo de IA</Text>
                                        <TooltipIcon text="Modelo de inteligencia artificial que usa el agente. Actualmente está configurado en llama3:8b y no se puede modificar." />
                                    </View>
                                    <View style={{
                                        backgroundColor: 'rgba(71, 85, 105, 0.3)',
                                        borderWidth: 1,
                                        borderColor: 'rgba(148, 163, 184, 0.3)',
                                        borderRadius: 12,
                                        padding: Platform.OS === 'web' ? 16 : 12,
                                        flexDirection: Platform.OS === 'web' ? 'row' : 'column',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                    }}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                            <Ionicons name="cube-outline" size={20} color="#94a3b8" />
                                            <Text style={{
                                                color: '#94a3b8',
                                                fontSize: 15,
                                                fontWeight: '500',
                                            }}>
                                                llama3:8b
                                            </Text>
                                        </View>
                                        <View style={{
                                            backgroundColor: 'rgba(148, 163, 184, 0.2)',
                                            paddingHorizontal: 10,
                                            paddingVertical: 4,
                                            borderRadius: 6,
                                            alignSelf: Platform.OS === 'web' ? 'auto' : 'flex-start',
                                            marginTop: Platform.OS === 'web' ? 0 : 8,
                                        }}>
                                            <Text style={{
                                                color: '#94a3b8',
                                                fontSize: 11,
                                                fontWeight: '600',
                                                textTransform: 'uppercase',
                                                letterSpacing: 0.5,
                                            }}>
                                                Bloqueado
                                            </Text>
                                        </View>
                                    </View>
                                    <Text style={modalStyles.helperText}>
                                        Este modelo está configurado por defecto y no se puede cambiar
                                    </Text>
                                </View>

                                {/* Temperatura (Creatividad) */}
                                <View style={modalStyles.formGroup}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Text style={modalStyles.label}>Temperatura (Creatividad) *</Text>
                                        <TooltipIcon text="Controla la creatividad de las respuestas. Balanceado (0.2) es ideal para la mayoría de casos. Valores más altos generan respuestas más creativas pero menos predecibles." />
                                    </View>

                                    {/* Opciones de Temperatura */}
                                    <View style={{ gap: Platform.OS === 'web' ? 12 : 10 }}>
                                        {/* OPCIÓN 1: Balanceado (0.2) - RECOMENDADO */}
                                        <TouchableOpacity
                                            style={[
                                                {
                                                    backgroundColor: formData.temperatura === '0.2'
                                                        ? 'rgba(102, 126, 234, 0.2)'
                                                        : 'rgba(71, 85, 105, 0.3)',
                                                    borderWidth: 2,
                                                    borderColor: formData.temperatura === '0.2'
                                                        ? '#667eea'
                                                        : 'rgba(148, 163, 184, 0.3)',
                                                    borderRadius: 12,
                                                    padding: Platform.OS === 'web' ? 16 : 12,
                                                },
                                                formErrors.temperatura && { borderColor: '#ef4444' }
                                            ]}
                                            onPress={() => setFormData({ ...formData, temperatura: '0.2' })}
                                            activeOpacity={0.7}
                                        >
                                            <View style={{
                                                flexDirection: Platform.OS === 'web' ? 'row' : 'column',
                                                alignItems: Platform.OS === 'web' ? 'center' : 'flex-start',
                                                justifyContent: 'space-between',
                                                marginBottom: 8,
                                                gap: Platform.OS === 'web' ? 0 : 8
                                            }}>
                                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                                    <View style={{
                                                        width: 24,
                                                        height: 24,
                                                        borderRadius: 12,
                                                        borderWidth: 2,
                                                        borderColor: formData.temperatura === '0.2' ? '#667eea' : '#94a3b8',
                                                        backgroundColor: formData.temperatura === '0.2' ? '#667eea' : 'transparent',
                                                        justifyContent: 'center',
                                                        alignItems: 'center',
                                                    }}>
                                                        {formData.temperatura === '0.2' && (
                                                            <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#ffffff' }} />
                                                        )}
                                                    </View>
                                                    <Text style={{
                                                        color: formData.temperatura === '0.2' ? '#ffffff' : '#94a3b8',
                                                        fontSize: 16,
                                                        fontWeight: '600',
                                                    }}>
                                                        ⚖️ Balanceado (0.2)
                                                    </Text>
                                                </View>
                                                <View style={{
                                                    backgroundColor: 'rgba(34, 197, 94, 0.2)',
                                                    paddingHorizontal: 8,
                                                    paddingVertical: 4,
                                                    borderRadius: 6,
                                                    borderWidth: 1,
                                                    borderColor: '#22c55e',
                                                    alignSelf: Platform.OS === 'web' ? 'auto' : 'flex-start',
                                                }}>
                                                    <Text style={{ color: '#22c55e', fontSize: 11, fontWeight: '700' }}>
                                                        ✨ RECOMENDADO
                                                    </Text>
                                                </View>
                                            </View>
                                            <Text style={{
                                                color: formData.temperatura === '0.2' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.6)',
                                                fontSize: 13,
                                                marginBottom: 8,
                                            }}>
                                                Uso general - Ideal para la mayoría de casos
                                            </Text>
                                            {formData.temperatura === '0.2' && (
                                                <View style={{
                                                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                                                    borderRadius: 8,
                                                    padding: 12,
                                                    gap: 6,
                                                }}>
                                                    <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
                                                        <Text style={{ color: '#22c55e', fontSize: 12 }}>✓</Text>
                                                        <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: 12, flex: 1 }}>
                                                            Equilibrio perfecto entre precisión y creatividad
                                                        </Text>
                                                    </View>
                                                    <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
                                                        <Text style={{ color: '#22c55e', fontSize: 12 }}>✓</Text>
                                                        <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: 12, flex: 1 }}>
                                                            Respuestas coherentes y útiles
                                                        </Text>
                                                    </View>
                                                    <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
                                                        <Text style={{ color: '#22c55e', fontSize: 12 }}>✓</Text>
                                                        <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: 12, flex: 1 }}>
                                                            Funciona bien en soporte, consultas y asesoría
                                                        </Text>
                                                    </View>
                                                </View>
                                            )}
                                        </TouchableOpacity>

                                        {/* OPCIÓN 2: Creativo (0.3) */}
                                        <TouchableOpacity
                                            style={{
                                                backgroundColor: formData.temperatura === '0.3'
                                                    ? 'rgba(168, 85, 247, 0.2)'
                                                    : 'rgba(71, 85, 105, 0.3)',
                                                borderWidth: 2,
                                                borderColor: formData.temperatura === '0.3'
                                                    ? '#a855f7'
                                                    : 'rgba(148, 163, 184, 0.3)',
                                                borderRadius: 12,
                                                padding: 16,
                                            }}
                                            onPress={() => setFormData({ ...formData, temperatura: '0.3' })}
                                            activeOpacity={0.7}
                                        >
                                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                                                <View style={{
                                                    width: 24,
                                                    height: 24,
                                                    borderRadius: 12,
                                                    borderWidth: 2,
                                                    borderColor: formData.temperatura === '0.3' ? '#a855f7' : '#94a3b8',
                                                    backgroundColor: formData.temperatura === '0.3' ? '#a855f7' : 'transparent',
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                }}>
                                                    {formData.temperatura === '0.3' && (
                                                        <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#ffffff' }} />
                                                    )}
                                                </View>
                                                <Text style={{
                                                    color: formData.temperatura === '0.3' ? '#ffffff' : '#94a3b8',
                                                    fontSize: 16,
                                                    fontWeight: '600',
                                                }}>
                                                    🎨 Creativo (0.3)
                                                </Text>
                                            </View>
                                            <Text style={{
                                                color: formData.temperatura === '0.3' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.6)',
                                                fontSize: 13,
                                                marginBottom: 8,
                                            }}>
                                                Para redacción, ideas y contenido variado
                                            </Text>
                                            {formData.temperatura === '0.3' && (
                                                <View style={{
                                                    backgroundColor: 'rgba(168, 85, 247, 0.1)',
                                                    borderRadius: 8,
                                                    padding: 12,
                                                    gap: 6,
                                                }}>
                                                    <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
                                                        <Text style={{ color: '#22c55e', fontSize: 12 }}>✓</Text>
                                                        <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: 12, flex: 1 }}>
                                                            Respuestas más variadas y originales
                                                        </Text>
                                                    </View>
                                                    <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
                                                        <Text style={{ color: '#22c55e', fontSize: 12 }}>✓</Text>
                                                        <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: 12, flex: 1 }}>
                                                            Ideal para generar contenido creativo
                                                        </Text>
                                                    </View>
                                                    <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
                                                        <Text style={{ color: '#fbbf24', fontSize: 12 }}>⚠</Text>
                                                        <Text style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: 12, flex: 1 }}>
                                                            Puede ser menos preciso en datos técnicos
                                                        </Text>
                                                    </View>
                                                    <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
                                                        <Text style={{ color: '#fbbf24', fontSize: 12 }}>⚠</Text>
                                                        <Text style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: 12, flex: 1 }}>
                                                            Ocasionalmente divaga del tema principal
                                                        </Text>
                                                    </View>
                                                </View>
                                            )}
                                        </TouchableOpacity>

                                        {/* OPCIÓN 3: Muy Creativo (0.5) */}
                                        <TouchableOpacity
                                            style={{
                                                backgroundColor: formData.temperatura === '0.5'
                                                    ? 'rgba(251, 146, 60, 0.2)'
                                                    : 'rgba(71, 85, 105, 0.3)',
                                                borderWidth: 2,
                                                borderColor: formData.temperatura === '0.5'
                                                    ? '#fb923c'
                                                    : 'rgba(148, 163, 184, 0.3)',
                                                borderRadius: 12,
                                                padding: 16,
                                            }}
                                            onPress={() => setFormData({ ...formData, temperatura: '0.5' })}
                                            activeOpacity={0.7}
                                        >
                                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                                                <View style={{
                                                    width: 24,
                                                    height: 24,
                                                    borderRadius: 12,
                                                    borderWidth: 2,
                                                    borderColor: formData.temperatura === '0.5' ? '#fb923c' : '#94a3b8',
                                                    backgroundColor: formData.temperatura === '0.5' ? '#fb923c' : 'transparent',
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                }}>
                                                    {formData.temperatura === '0.5' && (
                                                        <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#ffffff' }} />
                                                    )}
                                                </View>
                                                <Text style={{
                                                    color: formData.temperatura === '0.5' ? '#ffffff' : '#94a3b8',
                                                    fontSize: 16,
                                                    fontWeight: '600',
                                                }}>
                                                    🚀 Muy Creativo (0.5)
                                                </Text>
                                            </View>
                                            <Text style={{
                                                color: formData.temperatura === '0.5' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.6)',
                                                fontSize: 13,
                                                marginBottom: 8,
                                            }}>
                                                Experimental - Solo para casos especiales
                                            </Text>
                                            {formData.temperatura === '0.5' && (
                                                <View style={{
                                                    backgroundColor: 'rgba(251, 146, 60, 0.1)',
                                                    borderRadius: 8,
                                                    padding: 12,
                                                    gap: 6,
                                                }}>
                                                    <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
                                                        <Text style={{ color: '#22c55e', fontSize: 12 }}>✓</Text>
                                                        <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: 12, flex: 1 }}>
                                                            Máxima originalidad e innovación
                                                        </Text>
                                                    </View>
                                                    <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
                                                        <Text style={{ color: '#22c55e', fontSize: 12 }}>✓</Text>
                                                        <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: 12, flex: 1 }}>
                                                            Útil para lluvia de ideas o brainstorming
                                                        </Text>
                                                    </View>
                                                    <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
                                                        <Text style={{ color: '#ef4444', fontSize: 12 }}>✗</Text>
                                                        <Text style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: 12, flex: 1 }}>
                                                            Respuestas impredecibles e inconsistentes
                                                        </Text>
                                                    </View>
                                                    <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
                                                        <Text style={{ color: '#ef4444', fontSize: 12 }}>✗</Text>
                                                        <Text style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: 12, flex: 1 }}>
                                                            Puede generar contenido irrelevante
                                                        </Text>
                                                    </View>
                                                    <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
                                                        <Text style={{ color: '#ef4444', fontSize: 12 }}>✗</Text>
                                                        <Text style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: 12, flex: 1 }}>
                                                            No recomendado para uso en producción
                                                        </Text>
                                                    </View>
                                                </View>
                                            )}
                                        </TouchableOpacity>
                                    </View>

                                    {formErrors.temperatura && (
                                        <Text style={modalStyles.errorText}>{formErrors.temperatura}</Text>
                                    )}
                                </View>


                                {/*MAXIMO DE TOKENS*/}
                                <View style={modalStyles.formGroup}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Text style={modalStyles.label}>Tokens Máximos</Text>
                                        <TooltipIcon text="Define la longitud máxima de las respuestas del agente. 1000 tokens es ideal para respuestas completas. Valores más altos permiten respuestas más detalladas pero consumen más recursos." />
                                    </View>
                                    {/* Opciones de Tokens */}
                                    <View style={{ gap: 12 }}>
                                        {/* OPCIÓN 1: Respuestas Cortas (500) */}
                                        <TouchableOpacity
                                            style={[
                                                {
                                                    backgroundColor: formData.max_tokens === '500'
                                                        ? 'rgba(59, 130, 246, 0.2)'
                                                        : 'rgba(71, 85, 105, 0.3)',
                                                    borderWidth: 2,
                                                    borderColor: formData.max_tokens === '500'
                                                        ? '#3b82f6'
                                                        : 'rgba(148, 163, 184, 0.3)',
                                                    borderRadius: 12,
                                                    padding: Platform.OS === 'web' ? 16 : 12,
                                                },
                                                formErrors.max_tokens && { borderColor: '#ef4444' }
                                            ]}
                                            onPress={() => setFormData({ ...formData, max_tokens: '500' })}
                                            activeOpacity={0.7}
                                        >
                                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                                                <View style={{
                                                    width: 24,
                                                    height: 24,
                                                    borderRadius: 12,
                                                    borderWidth: 2,
                                                    borderColor: formData.max_tokens === '500' ? '#3b82f6' : '#94a3b8',
                                                    backgroundColor: formData.max_tokens === '500' ? '#3b82f6' : 'transparent',
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                }}>
                                                    {formData.max_tokens === '500' && (
                                                        <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#ffffff' }} />
                                                    )}
                                                </View>
                                                <Text style={{
                                                    color: formData.max_tokens === '500' ? '#ffffff' : '#94a3b8',
                                                    fontSize: 16,
                                                    fontWeight: '600',
                                                }}>
                                                    ⚡ Cortas (500 tokens)
                                                </Text>
                                            </View>
                                            <Text style={{
                                                color: formData.max_tokens === '500' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.6)',
                                                fontSize: 13,
                                                marginBottom: 8,
                                            }}>
                                                Respuestas rápidas y directas
                                            </Text>
                                            {formData.max_tokens === '500' && (
                                                <View style={{
                                                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                                    borderRadius: 8,
                                                    padding: 12,
                                                    gap: 6,
                                                }}>
                                                    <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
                                                        <Text style={{ color: '#22c55e', fontSize: 12 }}>✓</Text>
                                                        <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: 12, flex: 1 }}>
                                                            Respuestas ultra rápidas
                                                        </Text>
                                                    </View>
                                                    <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
                                                        <Text style={{ color: '#22c55e', fontSize: 12 }}>✓</Text>
                                                        <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: 12, flex: 1 }}>
                                                            Consumo mínimo de recursos
                                                        </Text>
                                                    </View>
                                                    <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
                                                        <Text style={{ color: '#ef4444', fontSize: 12 }}>✗</Text>
                                                        <Text style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: 12, flex: 1 }}>
                                                            Respuestas muy limitadas en extensión
                                                        </Text>
                                                    </View>
                                                    <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
                                                        <Text style={{ color: '#ef4444', fontSize: 12 }}>✗</Text>
                                                        <Text style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: 12, flex: 1 }}>
                                                            No apta para explicaciones detalladas
                                                        </Text>
                                                    </View>
                                                </View>
                                            )}
                                        </TouchableOpacity>

                                        {/* OPCIÓN 2: FAQ (800) */}
                                        <TouchableOpacity
                                            style={{
                                                backgroundColor: formData.max_tokens === '800'
                                                    ? 'rgba(16, 185, 129, 0.2)'
                                                    : 'rgba(71, 85, 105, 0.3)',
                                                borderWidth: 2,
                                                borderColor: formData.max_tokens === '800'
                                                    ? '#10b981'
                                                    : 'rgba(148, 163, 184, 0.3)',
                                                borderRadius: 12,
                                                padding: 16,
                                            }}
                                            onPress={() => setFormData({ ...formData, max_tokens: '800' })}
                                            activeOpacity={0.7}
                                        >
                                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                                                <View style={{
                                                    width: 24,
                                                    height: 24,
                                                    borderRadius: 12,
                                                    borderWidth: 2,
                                                    borderColor: formData.max_tokens === '800' ? '#10b981' : '#94a3b8',
                                                    backgroundColor: formData.max_tokens === '800' ? '#10b981' : 'transparent',
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                }}>
                                                    {formData.max_tokens === '800' && (
                                                        <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#ffffff' }} />
                                                    )}
                                                </View>
                                                <Text style={{
                                                    color: formData.max_tokens === '800' ? '#ffffff' : '#94a3b8',
                                                    fontSize: 16,
                                                    fontWeight: '600',
                                                }}>
                                                    💬 FAQ (800 tokens)
                                                </Text>
                                            </View>
                                            <Text style={{
                                                color: formData.max_tokens === '800' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.6)',
                                                fontSize: 13,
                                                marginBottom: 8,
                                            }}>
                                                Ideal para preguntas frecuentes
                                            </Text>
                                            {formData.max_tokens === '800' && (
                                                <View style={{
                                                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                                                    borderRadius: 8,
                                                    padding: 12,
                                                    gap: 6,
                                                }}>
                                                    <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
                                                        <Text style={{ color: '#22c55e', fontSize: 12 }}>✓</Text>
                                                        <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: 12, flex: 1 }}>
                                                            Perfecto para preguntas y respuestas
                                                        </Text>
                                                    </View>
                                                    <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
                                                        <Text style={{ color: '#22c55e', fontSize: 12 }}>✓</Text>
                                                        <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: 12, flex: 1 }}>
                                                            Buen balance velocidad/detalle
                                                        </Text>
                                                    </View>
                                                    <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
                                                        <Text style={{ color: '#fbbf24', fontSize: 12 }}>⚠</Text>
                                                        <Text style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: 12, flex: 1 }}>
                                                            Puede quedarse corto en temas complejos
                                                        </Text>
                                                    </View>
                                                </View>
                                            )}
                                        </TouchableOpacity>

                                        {/* OPCIÓN 3: Normal (1000) - RECOMENDADO */}
                                        <TouchableOpacity
                                            style={{
                                                backgroundColor: formData.max_tokens === '1000'
                                                    ? 'rgba(102, 126, 234, 0.2)'
                                                    : 'rgba(71, 85, 105, 0.3)',
                                                borderWidth: 2,
                                                borderColor: formData.max_tokens === '1000'
                                                    ? '#667eea'
                                                    : 'rgba(148, 163, 184, 0.3)',
                                                borderRadius: 12,
                                                padding: 16,
                                            }}
                                            onPress={() => setFormData({ ...formData, max_tokens: '1000' })}
                                            activeOpacity={0.7}
                                        >
                                            <View style={{
                                                flexDirection: Platform.OS === 'web' ? 'row' : 'column',
                                                alignItems: Platform.OS === 'web' ? 'center' : 'flex-start',
                                                justifyContent: 'space-between',
                                                marginBottom: 8,
                                                gap: Platform.OS === 'web' ? 0 : 8
                                            }}>
                                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                                    <View style={{
                                                        width: 24,
                                                        height: 24,
                                                        borderRadius: 12,
                                                        borderWidth: 2,
                                                        borderColor: formData.max_tokens === '1000' ? '#667eea' : '#94a3b8',
                                                        backgroundColor: formData.max_tokens === '1000' ? '#667eea' : 'transparent',
                                                        justifyContent: 'center',
                                                        alignItems: 'center',
                                                    }}>
                                                        {formData.max_tokens === '1000' && (
                                                            <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#ffffff' }} />
                                                        )}
                                                    </View>
                                                    <Text style={{
                                                        color: formData.max_tokens === '1000' ? '#ffffff' : '#94a3b8',
                                                        fontSize: 16,
                                                        fontWeight: '600',
                                                    }}>
                                                        ⚖️ Normal (1000 tokens)
                                                    </Text>
                                                </View>
                                                <View style={{
                                                    backgroundColor: 'rgba(34, 197, 94, 0.2)',
                                                    paddingHorizontal: 8,
                                                    paddingVertical: 4,
                                                    borderRadius: 6,
                                                    borderWidth: 1,
                                                    borderColor: '#22c55e',
                                                    alignSelf: Platform.OS === 'web' ? 'auto' : 'flex-start',
                                                }}>
                                                    <Text style={{ color: '#22c55e', fontSize: 11, fontWeight: '700' }}>
                                                        ✨ RECOMENDADO
                                                    </Text>
                                                </View>
                                            </View>
                                            <Text style={{
                                                color: formData.max_tokens === '1000' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.6)',
                                                fontSize: 13,
                                                marginBottom: 8,
                                            }}>
                                                Uso general - Respuestas completas
                                            </Text>
                                            {formData.max_tokens === '1000' && (
                                                <View style={{
                                                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                                                    borderRadius: 8,
                                                    padding: 12,
                                                    gap: 6,
                                                }}>
                                                    <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
                                                        <Text style={{ color: '#22c55e', fontSize: 12 }}>✓</Text>
                                                        <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: 12, flex: 1 }}>
                                                            Respuestas completas y bien estructuradas
                                                        </Text>
                                                    </View>
                                                    <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
                                                        <Text style={{ color: '#22c55e', fontSize: 12 }}>✓</Text>
                                                        <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: 12, flex: 1 }}>
                                                            Versátil para la mayoría de casos
                                                        </Text>
                                                    </View>
                                                    <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
                                                        <Text style={{ color: '#22c55e', fontSize: 12 }}>✓</Text>
                                                        <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: 12, flex: 1 }}>
                                                            Consumo equilibrado de recursos
                                                        </Text>
                                                    </View>
                                                    <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
                                                        <Text style={{ color: '#fbbf24', fontSize: 12 }}>⚠</Text>
                                                        <Text style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: 12, flex: 1 }}>
                                                            Consumo moderado de tokens
                                                        </Text>
                                                    </View>
                                                </View>
                                            )}
                                        </TouchableOpacity>

                                        {/* OPCIÓN 4: Detalladas (2000) */}
                                        <TouchableOpacity
                                            style={{
                                                backgroundColor: formData.max_tokens === '2000'
                                                    ? 'rgba(168, 85, 247, 0.2)'
                                                    : 'rgba(71, 85, 105, 0.3)',
                                                borderWidth: 2,
                                                borderColor: formData.max_tokens === '2000'
                                                    ? '#a855f7'
                                                    : 'rgba(148, 163, 184, 0.3)',
                                                borderRadius: 12,
                                                padding: 16,
                                            }}
                                            onPress={() => setFormData({ ...formData, max_tokens: '2000' })}
                                            activeOpacity={0.7}
                                        >
                                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                                                <View style={{
                                                    width: 24,
                                                    height: 24,
                                                    borderRadius: 12,
                                                    borderWidth: 2,
                                                    borderColor: formData.max_tokens === '2000' ? '#a855f7' : '#94a3b8',
                                                    backgroundColor: formData.max_tokens === '2000' ? '#a855f7' : 'transparent',
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                }}>
                                                    {formData.max_tokens === '2000' && (
                                                        <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#ffffff' }} />
                                                    )}
                                                </View>
                                                <Text style={{
                                                    color: formData.max_tokens === '2000' ? '#ffffff' : '#94a3b8',
                                                    fontSize: 16,
                                                    fontWeight: '600',
                                                }}>
                                                    📚 Detalladas (2000 tokens)
                                                </Text>
                                            </View>
                                            <Text style={{
                                                color: formData.max_tokens === '2000' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.6)',
                                                fontSize: 13,
                                                marginBottom: 8,
                                            }}>
                                                Explicaciones extensas y profundas
                                            </Text>
                                            {formData.max_tokens === '2000' && (
                                                <View style={{
                                                    backgroundColor: 'rgba(168, 85, 247, 0.1)',
                                                    borderRadius: 8,
                                                    padding: 12,
                                                    gap: 6,
                                                }}>
                                                    <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
                                                        <Text style={{ color: '#22c55e', fontSize: 12 }}>✓</Text>
                                                        <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: 12, flex: 1 }}>
                                                            Respuestas muy detalladas y exhaustivas
                                                        </Text>
                                                    </View>
                                                    <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
                                                        <Text style={{ color: '#22c55e', fontSize: 12 }}>✓</Text>
                                                        <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: 12, flex: 1 }}>
                                                            Ideal para consultas complejas
                                                        </Text>
                                                    </View>
                                                    <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
                                                        <Text style={{ color: '#ef4444', fontSize: 12 }}>✗</Text>
                                                        <Text style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: 12, flex: 1 }}>
                                                            Mayor consumo de recursos y costos
                                                        </Text>
                                                    </View>
                                                    <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
                                                        <Text style={{ color: '#ef4444', fontSize: 12 }}>✗</Text>
                                                        <Text style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: 12, flex: 1 }}>
                                                            Respuestas más lentas
                                                        </Text>
                                                    </View>
                                                    <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
                                                        <Text style={{ color: '#ef4444', fontSize: 12 }}>✗</Text>
                                                        <Text style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: 12, flex: 1 }}>
                                                            Puede incluir información innecesaria
                                                        </Text>
                                                    </View>
                                                </View>
                                            )}
                                        </TouchableOpacity>
                                    </View>

                                    {formErrors.max_tokens && (
                                        <Text style={modalStyles.errorText}>{formErrors.max_tokens}</Text>
                                    )}
                                </View>

                                {/* PROMPT SISTEMA */}
                                {/* ⭐ CAMPO 1: MISIÓN */}
                                <View style={modalStyles.formGroup}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Text style={modalStyles.label}>Misión del Agente *</Text>
                                        <TooltipIcon text="Define el objetivo principal del agente. Describe claramente qué problema resuelve o qué servicio proporciona a los usuarios." />
                                    </View>
                                    <TextInput
                                        style={[modalStyles.textArea, formErrors.prompt_mision && modalStyles.inputError]}
                                        placeholder="Ej: Ayudar a estudiantes a resolver problemas con sus cuentas y acceso a sistemas"
                                        placeholderTextColor="rgba(255, 255, 255, 0.4)"
                                        value={formData.prompt_mision}
                                        onChangeText={(text) => setFormData({ ...formData, prompt_mision: text })}
                                        multiline
                                        numberOfLines={3}
                                        maxLength={300}
                                    />
                                    <Text style={[modalStyles.helperText, { textAlign: 'right', marginTop: 4 }]}>
                                        {formData.prompt_mision?.length || 0} / 300 caracteres
                                    </Text>
                                    {formErrors.prompt_mision && (
                                        <Text style={modalStyles.errorText}>{formErrors.prompt_mision}</Text>
                                    )}
                                    <Text style={modalStyles.helperText}>
                                        Define el objetivo principal del agente
                                    </Text>
                                </View>

                                {/* ⭐ CAMPO 2: REGLAS (Mínimo 2) */}
                                <View style={modalStyles.formGroup}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Text style={modalStyles.label}>Reglas de Comportamiento * (Mínimo 2)</Text>
                                        <TooltipIcon text="Establece comportamientos específicos que el agente debe seguir. Por ejemplo: 'Responde siempre en español', 'Sé cortés y profesional'. Mínimo 2, máximo recomendado 5." />
                                    </View>
                                    {formData.prompt_reglas.map((regla, index) => (
                                        <View key={index} style={{ marginBottom: 12 }}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                                <Text style={{ color: '#667eea', fontSize: 16, fontWeight: '700' }}>
                                                    {index + 1}.
                                                </Text>
                                                <TextInput
                                                    style={[
                                                        modalStyles.input,
                                                        { flex: 1 },
                                                        formErrors[`prompt_regla_${index}`] && modalStyles.inputError
                                                    ]}
                                                    placeholder={`Regla ${index + 1}: Ej: Responde siempre en español`}
                                                    placeholderTextColor="rgba(255, 255, 255, 0.4)"
                                                    value={regla}
                                                    onChangeText={(text) => {
                                                        const nuevasReglas = [...formData.prompt_reglas];
                                                        nuevasReglas[index] = text;
                                                        setFormData({ ...formData, prompt_reglas: nuevasReglas });
                                                    }}
                                                    maxLength={200}
                                                />
                                                {formData.prompt_reglas.length > 2 && (
                                                    <TouchableOpacity
                                                        onPress={() => {
                                                            const nuevasReglas = formData.prompt_reglas.filter((_, i) => i !== index);
                                                            setFormData({ ...formData, prompt_reglas: nuevasReglas });
                                                        }}
                                                        style={{
                                                            width: 36,
                                                            height: 36,
                                                            borderRadius: 8,
                                                            backgroundColor: 'rgba(239, 68, 68, 0.2)',
                                                            borderWidth: 1,
                                                            borderColor: '#ef4444',
                                                            justifyContent: 'center',
                                                            alignItems: 'center',
                                                        }}
                                                    >
                                                        <Ionicons name="trash-outline" size={18} color="#ef4444" />
                                                    </TouchableOpacity>
                                                )}
                                            </View>

                                            {/* ⭐ NUEVO: Contador de caracteres */}
                                            <Text style={[modalStyles.helperText, { textAlign: 'right', marginTop: 4, fontSize: 11 }]}>
                                                {regla?.length || 0} / 200 caracteres
                                            </Text>

                                            {formErrors[`prompt_regla_${index}`] && (
                                                <Text style={modalStyles.errorText}>{formErrors[`prompt_regla_${index}`]}</Text>
                                            )}
                                        </View>
                                    ))}

                                    {/* Botón agregar regla */}
                                    <TouchableOpacity
                                        style={{
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            gap: 8,
                                            backgroundColor: 'rgba(102, 126, 234, 0.2)',
                                            borderWidth: 2,
                                            borderColor: '#667eea',
                                            borderStyle: 'dashed',
                                            borderRadius: 12,
                                            padding: 14,
                                            marginTop: 8,
                                        }}
                                        onPress={() => {
                                            setFormData({
                                                ...formData,
                                                prompt_reglas: [...formData.prompt_reglas, '']
                                            });
                                        }}
                                        activeOpacity={0.7}
                                    >
                                        <Ionicons name="add-circle-outline" size={20} color="#667eea" />
                                        <Text style={{ color: '#667eea', fontSize: 14, fontWeight: '600' }}>
                                            Agregar otra regla
                                        </Text>
                                    </TouchableOpacity>

                                    <Text style={modalStyles.helperText}>
                                        Define comportamientos específicos (mínimo 2, máximo recomendado 5)
                                    </Text>
                                </View>

                                {/* ⭐ CAMPO 3: TONO (Selector) */}
                                <View style={modalStyles.formGroup}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Text style={modalStyles.label}>Tono de Comunicación *</Text>
                                        <TooltipIcon text="Define el estilo de comunicación del agente. Formal es profesional, Amigable es cercano y empático, Técnico usa lenguaje especializado." />
                                    </View>

                                    <View style={{ gap: 12 }}>
                                        {/* Opción: Formal */}
                                        <TouchableOpacity
                                            style={{
                                                backgroundColor: formData.prompt_tono === 'formal'
                                                    ? 'rgba(59, 130, 246, 0.2)'
                                                    : 'rgba(71, 85, 105, 0.3)',
                                                borderWidth: 2,
                                                borderColor: formData.prompt_tono === 'formal'
                                                    ? '#3b82f6'
                                                    : 'rgba(148, 163, 184, 0.3)',
                                                borderRadius: 12,
                                                padding: Platform.OS === 'web' ? 16 : 12,
                                            }}
                                            onPress={() => setFormData({ ...formData, prompt_tono: 'formal' })}
                                            activeOpacity={0.7}
                                        >
                                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                                <View style={{
                                                    width: 24,
                                                    height: 24,
                                                    borderRadius: 12,
                                                    borderWidth: 2,
                                                    borderColor: formData.prompt_tono === 'formal' ? '#3b82f6' : '#94a3b8',
                                                    backgroundColor: formData.prompt_tono === 'formal' ? '#3b82f6' : 'transparent',
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                }}>
                                                    {formData.prompt_tono === 'formal' && (
                                                        <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#ffffff' }} />
                                                    )}
                                                </View>
                                                <Text style={{
                                                    color: formData.prompt_tono === 'formal' ? '#ffffff' : '#94a3b8',
                                                    fontSize: 16,
                                                    fontWeight: '600',
                                                }}>
                                                    🎩 Formal
                                                </Text>
                                            </View>
                                            <Text style={{
                                                color: formData.prompt_tono === 'formal' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.6)',
                                                fontSize: 13,
                                                marginTop: 8,
                                            }}>
                                                Profesional, preciso y corporativo
                                            </Text>
                                        </TouchableOpacity>

                                        {/* Opción: Amigable (RECOMENDADO) */}
                                        <TouchableOpacity
                                            style={{
                                                backgroundColor: formData.prompt_tono === 'amigable'
                                                    ? 'rgba(102, 126, 234, 0.2)'
                                                    : 'rgba(71, 85, 105, 0.3)',
                                                borderWidth: 2,
                                                borderColor: formData.prompt_tono === 'amigable'
                                                    ? '#667eea'
                                                    : 'rgba(148, 163, 184, 0.3)',
                                                borderRadius: 12,
                                                padding: 16,
                                            }}
                                            onPress={() => setFormData({ ...formData, prompt_tono: 'amigable' })}
                                            activeOpacity={0.7}
                                        >
                                            <View style={{
                                                flexDirection: Platform.OS === 'web' ? 'row' : 'column',
                                                alignItems: Platform.OS === 'web' ? 'center' : 'flex-start',
                                                justifyContent: 'space-between',
                                                marginBottom: 8,
                                                gap: Platform.OS === 'web' ? 0 : 8
                                            }}>
                                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                                    <View style={{
                                                        width: 24,
                                                        height: 24,
                                                        borderRadius: 12,
                                                        borderWidth: 2,
                                                        borderColor: formData.prompt_tono === 'amigable' ? '#667eea' : '#94a3b8',
                                                        backgroundColor: formData.prompt_tono === 'amigable' ? '#667eea' : 'transparent',
                                                        justifyContent: 'center',
                                                        alignItems: 'center',
                                                    }}>
                                                        {formData.prompt_tono === 'amigable' && (
                                                            <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#ffffff' }} />
                                                        )}
                                                    </View>
                                                    <Text style={{
                                                        color: formData.prompt_tono === 'amigable' ? '#ffffff' : '#94a3b8',
                                                        fontSize: 16,
                                                        fontWeight: '600',
                                                    }}>
                                                        😊 Amigable
                                                    </Text>
                                                </View>
                                                <View style={{
                                                    backgroundColor: 'rgba(34, 197, 94, 0.2)',
                                                    paddingHorizontal: 8,
                                                    paddingVertical: 4,
                                                    borderRadius: 6,
                                                    borderWidth: 1,
                                                    borderColor: '#22c55e',
                                                    alignSelf: Platform.OS === 'web' ? 'auto' : 'flex-start',
                                                }}>
                                                    <Text style={{ color: '#22c55e', fontSize: 11, fontWeight: '700' }}>
                                                        ✨ RECOMENDADO
                                                    </Text>
                                                </View>
                                            </View>
                                            <Text style={{
                                                color: formData.prompt_tono === 'amigable' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.6)',
                                                fontSize: 13,
                                            }}>
                                                Cercano, empático y profesional
                                            </Text>
                                        </TouchableOpacity>

                                        {/* Opción: Técnico */}
                                        <TouchableOpacity
                                            style={{
                                                backgroundColor: formData.prompt_tono === 'tecnico'
                                                    ? 'rgba(168, 85, 247, 0.2)'
                                                    : 'rgba(71, 85, 105, 0.3)',
                                                borderWidth: 2,
                                                borderColor: formData.prompt_tono === 'tecnico'
                                                    ? '#a855f7'
                                                    : 'rgba(148, 163, 184, 0.3)',
                                                borderRadius: 12,
                                                padding: 16,
                                            }}
                                            onPress={() => setFormData({ ...formData, prompt_tono: 'tecnico' })}
                                            activeOpacity={0.7}
                                        >
                                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                                <View style={{
                                                    width: 24,
                                                    height: 24,
                                                    borderRadius: 12,
                                                    borderWidth: 2,
                                                    borderColor: formData.prompt_tono === 'tecnico' ? '#a855f7' : '#94a3b8',
                                                    backgroundColor: formData.prompt_tono === 'tecnico' ? '#a855f7' : 'transparent',
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                }}>
                                                    {formData.prompt_tono === 'tecnico' && (
                                                        <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#ffffff' }} />
                                                    )}
                                                </View>
                                                <Text style={{
                                                    color: formData.prompt_tono === 'tecnico' ? '#ffffff' : '#94a3b8',
                                                    fontSize: 16,
                                                    fontWeight: '600',
                                                }}>
                                                    ⚙️ Técnico
                                                </Text>
                                            </View>
                                            <Text style={{
                                                color: formData.prompt_tono === 'tecnico' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.6)',
                                                fontSize: 13,
                                                marginTop: 8,
                                            }}>
                                                Lenguaje técnico, soluciones concretas
                                            </Text>
                                        </TouchableOpacity>
                                    </View>

                                    {formErrors.prompt_tono && (
                                        <Text style={modalStyles.errorText}>{formErrors.prompt_tono}</Text>
                                    )}
                                </View>
                                {formErrors.prompt_sistema && (
                                    <Text style={modalStyles.errorText}>{formErrors.prompt_sistema}</Text>
                                )}
                            </View>


                            {/* ⭐ NUEVO CAMPO: Especialización */}
                            <View style={modalStyles.formGroup}>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>

                                    <Text style={modalStyles.label}>Especialización del Agente</Text>
                                    <TooltipIcon text="Describe temas específicos, servicios o áreas de ayuda adicionales del agente. Esto complementa la misión con detalles más específicos sobre lo que el agente puede hacer." />
                                </View>
                                <TextInput
                                    style={[
                                        modalStyles.textArea,
                                        formErrors.prompt_especializado && modalStyles.inputError
                                    ]}
                                    placeholder="Ej: Ayuda con requisitos de prácticas, formatos, horas necesarias, instituciones aliadas, procesos de vinculación..."
                                    placeholderTextColor="rgba(255, 255, 255, 0.4)"
                                    value={formData.prompt_especializado}
                                    onChangeText={(text) => setFormData({ ...formData, prompt_especializado: text })}
                                    multiline
                                    numberOfLines={4}
                                    maxLength={500}
                                />
                                {formErrors.prompt_especializado && (
                                    <Text style={modalStyles.errorText}>{formErrors.prompt_especializado}</Text>
                                )}
                                <Text style={modalStyles.helperText}>
                                    💡 Describe temas específicos, servicios o áreas de ayuda del agente
                                </Text>

                                {/* Preview del texto */}
                                {formData.prompt_especializado && formData.prompt_especializado.length > 0 && (
                                    <View style={{
                                        marginTop: 12,
                                        backgroundColor: 'rgba(102, 126, 234, 0.1)',
                                        borderRadius: 8,
                                        padding: 12,
                                        borderLeftWidth: 3,
                                        borderLeftColor: '#667eea',
                                    }}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                            <Ionicons name="information-circle" size={16} color="#667eea" />
                                            <Text style={{ color: '#667eea', fontSize: 12, fontWeight: '600' }}>
                                                Vista previa de especialización
                                            </Text>
                                        </View>
                                        <Text style={{
                                            color: 'rgba(255, 255, 255, 0.8)',
                                            fontSize: 13,
                                            lineHeight: 20,
                                        }}>
                                            {formData.prompt_especializado}
                                        </Text>
                                        <Text style={{
                                            color: 'rgba(255, 255, 255, 0.5)',
                                            fontSize: 11,
                                            marginTop: 8,
                                        }}>
                                            {formData.prompt_especializado.length} / 500 caracteres
                                        </Text>
                                    </View>
                                )}
                            </View>

                            {/* Configuración Regional */}
                            <View style={modalStyles.section}>
                                <Text style={modalStyles.sectionTitle}>🌍 Configuración Regional</Text>

                                {/* Idioma Principal - BLOQUEADO */}
                                <View style={modalStyles.formGroup}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Text style={modalStyles.label}>Idioma Principal</Text>
                                        <TooltipIcon text="Idioma en el que el agente se comunicará con los usuarios. Actualmente está configurado en Español y no se puede modificar." />
                                    </View>
                                    <View style={{
                                        backgroundColor: 'rgba(71, 85, 105, 0.3)',
                                        borderWidth: 1,
                                        borderColor: 'rgba(148, 163, 184, 0.3)',
                                        borderRadius: 12,
                                        padding: Platform.OS === 'web' ? 16 : 12,
                                        flexDirection: Platform.OS === 'web' ? 'row' : 'column',
                                        alignItems: Platform.OS === 'web' ? 'center' : 'flex-start',
                                        justifyContent: 'space-between',
                                        gap: Platform.OS === 'web' ? 0 : 8,
                                    }}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                            <Text style={{ fontSize: 20 }}>🇪🇸</Text>
                                            <Text style={{
                                                color: '#94a3b8',
                                                fontSize: 15,
                                                fontWeight: '500',
                                            }}>
                                                Español
                                            </Text>
                                        </View>
                                        <View style={{
                                            backgroundColor: 'rgba(148, 163, 184, 0.2)',
                                            paddingHorizontal: 10,
                                            paddingVertical: 4,
                                            borderRadius: 6,
                                            alignSelf: Platform.OS === 'web' ? 'auto' : 'flex-start',
                                            marginTop: Platform.OS === 'web' ? 0 : 8,
                                        }}>
                                            <Text style={{
                                                color: '#94a3b8',
                                                fontSize: 11,
                                                fontWeight: '600',
                                                textTransform: 'uppercase',
                                                letterSpacing: 0.5,
                                            }}>
                                                Bloqueado
                                            </Text>
                                        </View>
                                    </View>
                                    <Text style={modalStyles.helperText}>
                                        El idioma está configurado en Español por defecto
                                    </Text>
                                </View>

                                {/* Zona Horaria - BLOQUEADA */}
                                <View style={modalStyles.formGroup}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Text style={modalStyles.label}>Zona Horaria</Text>
                                        <TooltipIcon text="Zona horaria del agente para coordinar horarios de atención. Configurada para Ecuador (America/Guayaquil, GMT-5) y no se puede modificar." />
                                    </View>
                                    <View style={{
                                        backgroundColor: 'rgba(71, 85, 105, 0.3)',
                                        borderWidth: 1,
                                        borderColor: 'rgba(148, 163, 184, 0.3)',
                                        borderRadius: 12,
                                        padding: Platform.OS === 'web' ? 16 : 12,
                                        flexDirection: Platform.OS === 'web' ? 'row' : 'column',
                                        alignItems: Platform.OS === 'web' ? 'center' : 'flex-start',
                                        justifyContent: 'space-between',
                                        gap: Platform.OS === 'web' ? 0 : 8,
                                    }}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                            <Ionicons name="time-outline" size={20} color="#94a3b8" />
                                            <Text style={{
                                                color: '#94a3b8',
                                                fontSize: 15,
                                                fontWeight: '500',
                                            }}>
                                                America/Guayaquil (GMT-5)
                                            </Text>
                                        </View>
                                        <View style={{
                                            backgroundColor: 'rgba(148, 163, 184, 0.2)',
                                            paddingHorizontal: 10,
                                            paddingVertical: 4,
                                            borderRadius: 6,
                                            alignSelf: Platform.OS === 'web' ? 'auto' : 'flex-start',
                                            marginTop: Platform.OS === 'web' ? 0 : 8,
                                        }}>
                                            <Text style={{
                                                color: '#94a3b8',
                                                fontSize: 11,
                                                fontWeight: '600',
                                                textTransform: 'uppercase',
                                                letterSpacing: 0.5,
                                            }}>
                                                Bloqueado
                                            </Text>
                                        </View>
                                    </View>
                                    <Text style={modalStyles.helperText}>
                                        La zona horaria está configurada para Ecuador
                                    </Text>
                                </View>

                                {/* Estado del Agente - ACTIVO */}
                                <View style={modalStyles.formGroup}>
                                    <View style={modalStyles.switchContainer}>
                                        <View>
                                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                <Text style={modalStyles.label}>Estado del Agente</Text>
                                                <TooltipIcon text="Activa o desactiva el agente. Un agente inactivo no estará disponible para los usuarios pero sus datos se conservarán." />
                                            </View>
                                            <Text style={modalStyles.helperText}>
                                                {formData.activo ? 'Agente activo y disponible' : 'Agente desactivado'}
                                            </Text>
                                        </View>
                                        <Switch
                                            value={formData.activo}
                                            onValueChange={(value) => setFormData({ ...formData, activo: value })}
                                            trackColor={{ false: '#475569', true: '#667eea' }}
                                            thumbColor={formData.activo ? '#ffffff' : '#cbd5e1'}
                                        />
                                    </View>
                                </View>
                            </View>
                            {/* ============ SECCIÓN: HORARIOS DE ATENCIÓN ============ */}
                            <View style={modalStyles.section}>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Text style={modalStyles.sectionTitle}>🕐 Horarios de Atención</Text>
                                    <TooltipIcon text="Define los días y horarios en los que el agente estará disponible. Puedes configurar múltiples bloques horarios por día. Formato 24 horas (HH:MM)." />
                                </View>
                                <View style={{
                                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                    borderRadius: 8,
                                    padding: 12,
                                    marginBottom: 16,
                                    borderLeftWidth: 3,
                                    borderLeftColor: '#3b82f6'
                                }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                        <Ionicons name="information-circle" size={16} color="#3b82f6" />
                                        <Text style={{ color: '#3b82f6', fontSize: 12, fontWeight: '600', flex: 1 }}>
                                            Define cuándo el agente estará disponible para atender usuarios
                                        </Text>
                                    </View>
                                </View>

                                {/* Renderizar cada día */}
                                {['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'].map((dia) => {
                                    const diaConfig = formData.horarios[dia];
                                    const diaLabel = dia.charAt(0).toUpperCase() + dia.slice(1);

                                    return (
                                        <View key={dia} style={modalStyles.formGroup}>
                                            {/* Header del día con switch */}
                                            <View style={{
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                marginBottom: 12,
                                                backgroundColor: diaConfig.activo
                                                    ? 'rgba(102, 126, 234, 0.1)'
                                                    : 'rgba(71, 85, 105, 0.2)',
                                                padding: 14,
                                                borderRadius: 10,
                                                borderWidth: 1,
                                                borderColor: diaConfig.activo
                                                    ? 'rgba(102, 126, 234, 0.3)'
                                                    : 'rgba(148, 163, 184, 0.2)'
                                            }}>
                                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                                    <Ionicons
                                                        name="calendar"
                                                        size={18}
                                                        color={diaConfig.activo ? '#667eea' : '#94a3b8'}
                                                    />
                                                    <Text style={{
                                                        color: diaConfig.activo ? '#ffffff' : '#94a3b8',
                                                        fontSize: 15,
                                                        fontWeight: '600'
                                                    }}>
                                                        {diaLabel}
                                                    </Text>
                                                </View>
                                                <Switch
                                                    value={diaConfig.activo}
                                                    onValueChange={(value) => {
                                                        const nuevosHorarios = { ...formData.horarios };
                                                        nuevosHorarios[dia] = {
                                                            ...nuevosHorarios[dia],
                                                            activo: value,
                                                            bloques: value ? [{ inicio: '08:00', fin: '17:00' }] : []
                                                        };
                                                        setFormData({ ...formData, horarios: nuevosHorarios });
                                                    }}
                                                    trackColor={{ false: '#475569', true: '#667eea' }}
                                                    thumbColor={diaConfig.activo ? '#ffffff' : '#cbd5e1'}
                                                />
                                            </View>

                                            {/* Bloques horarios si está activo */}
                                            {diaConfig.activo && (
                                                <View style={{ gap: 10 }}>
                                                    {diaConfig.bloques.map((bloque, index) => (
                                                        <View key={index} style={{
                                                            flexDirection: 'row',
                                                            alignItems: 'center',
                                                            gap: 10,
                                                            backgroundColor: 'rgba(71, 85, 105, 0.3)',
                                                            padding: 12,
                                                            borderRadius: 10,
                                                            borderWidth: 1,
                                                            borderColor: 'rgba(148, 163, 184, 0.3)'
                                                        }}>
                                                            <Ionicons name="time" size={16} color="#667eea" />

                                                            {/* Hora inicio */}
                                                            <TextInput
                                                                style={{
                                                                    flex: 1,
                                                                    backgroundColor: 'rgba(30, 41, 59, 0.8)',
                                                                    color: '#ffffff',
                                                                    padding: 10,
                                                                    borderRadius: 8,
                                                                    borderWidth: 1,
                                                                    borderColor: 'rgba(102, 126, 234, 0.3)',
                                                                    fontSize: 14,
                                                                    textAlign: 'center'
                                                                }}
                                                                placeholder="08:00"
                                                                placeholderTextColor="rgba(255, 255, 255, 0.4)"
                                                                value={bloque.inicio}
                                                                onChangeText={(text) => {
                                                                    const nuevosHorarios = { ...formData.horarios };
                                                                    nuevosHorarios[dia].bloques[index].inicio = text;
                                                                    setFormData({ ...formData, horarios: nuevosHorarios });
                                                                }}
                                                                maxLength={5}
                                                            />

                                                            <Text style={{ color: '#94a3b8', fontSize: 14 }}>a</Text>

                                                            {/* Hora fin */}
                                                            <TextInput
                                                                style={{
                                                                    flex: 1,
                                                                    backgroundColor: 'rgba(30, 41, 59, 0.8)',
                                                                    color: '#ffffff',
                                                                    padding: 10,
                                                                    borderRadius: 8,
                                                                    borderWidth: 1,
                                                                    borderColor: 'rgba(102, 126, 234, 0.3)',
                                                                    fontSize: 14,
                                                                    textAlign: 'center'
                                                                }}
                                                                placeholder="17:00"
                                                                placeholderTextColor="rgba(255, 255, 255, 0.4)"
                                                                value={bloque.fin}
                                                                onChangeText={(text) => {
                                                                    const nuevosHorarios = { ...formData.horarios };
                                                                    nuevosHorarios[dia].bloques[index].fin = text;
                                                                    setFormData({ ...formData, horarios: nuevosHorarios });
                                                                }}
                                                                maxLength={5}
                                                            />

                                                            {/* Botón eliminar bloque */}
                                                            {diaConfig.bloques.length > 1 && (
                                                                <TouchableOpacity
                                                                    onPress={() => {
                                                                        const nuevosHorarios = { ...formData.horarios };
                                                                        nuevosHorarios[dia].bloques = nuevosHorarios[dia].bloques.filter((_, i) => i !== index);
                                                                        setFormData({ ...formData, horarios: nuevosHorarios });
                                                                    }}
                                                                    style={{
                                                                        width: 32,
                                                                        height: 32,
                                                                        borderRadius: 8,
                                                                        backgroundColor: 'rgba(239, 68, 68, 0.2)',
                                                                        borderWidth: 1,
                                                                        borderColor: '#ef4444',
                                                                        justifyContent: 'center',
                                                                        alignItems: 'center'
                                                                    }}
                                                                >
                                                                    <Ionicons name="trash-outline" size={16} color="#ef4444" />
                                                                </TouchableOpacity>
                                                            )}
                                                        </View>
                                                    ))}

                                                    {/* Botón agregar bloque */}
                                                    <TouchableOpacity
                                                        style={{
                                                            flexDirection: 'row',
                                                            alignItems: 'center',
                                                            gap: 8,
                                                            backgroundColor: 'rgba(102, 126, 234, 0.1)',
                                                            borderWidth: 1,
                                                            borderStyle: 'dashed',
                                                            borderColor: '#667eea',
                                                            borderRadius: 8,
                                                            padding: 10,
                                                            justifyContent: 'center'
                                                        }}
                                                        onPress={() => {
                                                            const nuevosHorarios = { ...formData.horarios };
                                                            nuevosHorarios[dia].bloques.push({ inicio: '13:00', fin: '18:00' });
                                                            setFormData({ ...formData, horarios: nuevosHorarios });
                                                        }}
                                                    >
                                                        <Ionicons name="add-circle-outline" size={16} color="#667eea" />
                                                        <Text style={{ color: '#667eea', fontSize: 13, fontWeight: '600' }}>
                                                            Agregar otro horario
                                                        </Text>
                                                    </TouchableOpacity>
                                                </View>
                                            )}
                                        </View>
                                    );
                                })}

                                <Text style={modalStyles.helperText}>
                                    💡 Formato 24 horas (HH:MM). Puedes agregar varios bloques por día
                                </Text>
                            </View>
                        </ScrollView>

                        <View style={modalStyles.footer}>
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={{ gap: 10, paddingHorizontal: 4, flexGrow: 1, justifyContent: 'flex-end' }}
                            >
                                <TouchableOpacity
                                    style={modalStyles.cancelButton}
                                    onPress={() => setShowFormModal(false)}
                                    activeOpacity={0.8}
                                >
                                    <Text style={modalStyles.cancelButtonText}>Cancelar</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={modalStyles.saveButton}
                                    onPress={handleSaveForm}
                                    activeOpacity={0.8}
                                >
                                    <Ionicons name="checkmark-circle" size={20} color="#ffffff" />
                                    <Text style={modalStyles.saveButtonText}>
                                        {formMode === 'create' ? 'Crear Agente' : 'Guardar Cambios'}
                                    </Text>
                                </TouchableOpacity>
                            </ScrollView>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* ============ MODAL DETALLES ============ */}
            <Modal
                visible={showDetailModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowDetailModal(false)}
            >
                <View style={modalStyles.overlay}>
                    <View style={modalStyles.container}>
                        {selectedAgente && (
                            <>
                                <View style={modalStyles.header}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
                                        <View style={{
                                            width: 50,
                                            height: 50,
                                            borderRadius: 25,
                                            backgroundColor: getTipoBadgeStyles(selectedAgente.tipo_agente).bg,
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            borderWidth: 2,
                                            borderColor: getTipoBadgeStyles(selectedAgente.tipo_agente).border,
                                        }}>
                                            <Text style={{ fontSize: 24 }}>{selectedAgente.icono || '🤖'}</Text>
                                        </View>
                                        <View style={{ flex: 1, marginRight: 8 }}>
                                            <Text style={{
                                                fontSize: Platform.OS === 'web' ? 16 : 14,
                                                fontWeight: '700',
                                                color: '#ffffff',
                                                lineHeight: Platform.OS === 'web' ? 22 : 18,
                                                marginBottom: 4,
                                            }}>
                                                {selectedAgente.nombre_agente}
                                            </Text>
                                            <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
                                                <View style={[
                                                    modalStyles.badge,
                                                    {
                                                        backgroundColor: getTipoBadgeStyles(selectedAgente.tipo_agente).bg,
                                                        borderColor: getTipoBadgeStyles(selectedAgente.tipo_agente).border,
                                                    }
                                                ]}>
                                                    <Text style={[
                                                        modalStyles.badgeText,
                                                        { color: getTipoBadgeStyles(selectedAgente.tipo_agente).text }
                                                    ]}>
                                                        {selectedAgente.tipo_agente}
                                                    </Text>
                                                </View>
                                                <View style={[
                                                    modalStyles.badge,
                                                    {
                                                        backgroundColor: selectedAgente.activo
                                                            ? 'rgba(34, 197, 94, 0.2)'
                                                            : 'rgba(148, 163, 184, 0.2)',
                                                        borderColor: selectedAgente.activo ? '#22c55e' : '#94a3b8',
                                                    }
                                                ]}>
                                                    <View style={{
                                                        width: 6,
                                                        height: 6,
                                                        borderRadius: 3,
                                                        backgroundColor: selectedAgente.activo ? '#22c55e' : '#94a3b8',
                                                        marginRight: 6,
                                                    }} />
                                                    <Text style={[
                                                        modalStyles.badgeText,
                                                        { color: selectedAgente.activo ? '#22c55e' : '#94a3b8' }
                                                    ]}>
                                                        {selectedAgente.activo ? 'Activo' : 'Inactivo'}
                                                    </Text>
                                                </View>
                                            </View>
                                        </View>
                                    </View>
                                    <TouchableOpacity onPress={() => setShowDetailModal(false)}>
                                        <Ionicons name="close" size={24} color="#ffffff" />
                                    </TouchableOpacity>
                                </View>

                                <ScrollView style={modalStyles.content} showsVerticalScrollIndicator={false}>

                                    {/* Descripción */}
                                    <View style={modalStyles.detailSection}>
                                        <Text style={modalStyles.detailSectionTitle}>📝 Descripción</Text>
                                        <View style={{
                                            backgroundColor: 'rgba(71, 85, 105, 0.3)',
                                            borderRadius: 12,
                                            padding: 16,
                                            borderWidth: 1,
                                            borderColor: 'rgba(148, 163, 184, 0.3)',
                                        }}>
                                            <Text style={{
                                                color: 'rgba(255, 255, 255, 0.9)',
                                                fontSize: 14,
                                                lineHeight: 22,
                                            }}>
                                                {selectedAgente.descripcion || 'Sin descripción disponible'}
                                            </Text>
                                        </View>
                                    </View>

                                    {/* Información General */}
                                    <View style={modalStyles.detailSection}>
                                        <Text style={modalStyles.detailSectionTitle}>ℹ️ Información General</Text>
                                        <View style={modalStyles.detailGrid}>
                                            <View style={modalStyles.detailItem}>
                                                <Ionicons name="briefcase" size={16} color="#667eea" />
                                                <View style={{ flex: 1 }}>
                                                    <Text style={modalStyles.detailLabel}>Especialidad</Text>
                                                    <Text style={modalStyles.detailValue}>
                                                        {selectedAgente.area_especialidad || 'General'}
                                                    </Text>
                                                </View>
                                            </View>
                                            <View style={modalStyles.detailItem}>
                                                <Ionicons name="business" size={16} color="#667eea" />
                                                <View style={{ flex: 1 }}>
                                                    <Text style={modalStyles.detailLabel}>Departamento</Text>
                                                    <Text style={modalStyles.detailValue}>
                                                        {(() => {
                                                            // Buscar el departamento en la lista de departamentos
                                                            if (selectedAgente.id_departamento) {
                                                                const dept = departamentos.find(
                                                                    d => d.id_departamento.toString() === selectedAgente.id_departamento.toString()
                                                                );
                                                                return dept?.nombre || selectedAgente.departamento_nombre || 'Sin asignar';
                                                            }
                                                            return 'Sin asignar';
                                                        })()}
                                                    </Text>
                                                </View>
                                            </View>
                                            <View style={modalStyles.detailItem}>
                                                <Ionicons name="flash" size={16} color="#667eea" />
                                                <View style={{ flex: 1 }}>
                                                    <Text style={modalStyles.detailLabel}>Modelo</Text>
                                                    <Text style={modalStyles.detailValue}>
                                                        {formatModelName(selectedAgente.modelo_ia)}
                                                    </Text>
                                                </View>
                                            </View>
                                            <View style={modalStyles.detailItem}>
                                                <Ionicons name="thermometer" size={16} color="#667eea" />
                                                <View style={{ flex: 1 }}>
                                                    <Text style={modalStyles.detailLabel}>Temperatura</Text>
                                                    <Text style={modalStyles.detailValue}>
                                                        {selectedAgente.temperatura || 'N/A'}
                                                    </Text>
                                                </View>
                                            </View>
                                            <View style={modalStyles.detailItem}>
                                                <Ionicons name="cube" size={16} color="#667eea" />
                                                <View style={{ flex: 1 }}>
                                                    <Text style={modalStyles.detailLabel}>Max Tokens</Text>
                                                    <Text style={modalStyles.detailValue}>
                                                        {selectedAgente.max_tokens || 'N/A'}
                                                    </Text>
                                                </View>
                                            </View>
                                        </View>
                                    </View>

                                    {/* Configuración Regional */}
                                    <View style={modalStyles.section}>
                                        <Text style={modalStyles.sectionTitle}>🌍 Configuración Regional</Text>

                                        {/* Idioma Principal - BLOQUEADO */}
                                        <View style={modalStyles.formGroup}>
                                            <Text style={modalStyles.label}>Idioma Principal</Text>
                                            <View style={{
                                                backgroundColor: 'rgba(71, 85, 105, 0.3)',
                                                borderWidth: 1,
                                                borderColor: 'rgba(148, 163, 184, 0.3)',
                                                borderRadius: 12,
                                                padding: 16,
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                            }}>
                                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                                    <Text style={{ fontSize: 24 }}>🇪🇸</Text>
                                                    <Text style={{
                                                        color: '#94a3b8',
                                                        fontSize: 15,
                                                        fontWeight: '500',
                                                    }}>
                                                        Español
                                                    </Text>
                                                </View>
                                                <View style={{
                                                    backgroundColor: 'rgba(148, 163, 184, 0.2)',
                                                    paddingHorizontal: 10,
                                                    paddingVertical: 4,
                                                    borderRadius: 6,
                                                }}>
                                                    <Text style={{
                                                        color: '#94a3b8',
                                                        fontSize: 11,
                                                        fontWeight: '600',
                                                        textTransform: 'uppercase',
                                                        letterSpacing: 0.5,
                                                    }}>
                                                        Bloqueado
                                                    </Text>
                                                </View>
                                            </View>
                                            <Text style={modalStyles.helperText}>
                                                El idioma está configurado en Español por defecto
                                            </Text>
                                        </View>

                                        {/* Zona Horaria - BLOQUEADA */}
                                        <View style={modalStyles.formGroup}>
                                            <Text style={modalStyles.label}>Zona Horaria</Text>
                                            <View style={{
                                                backgroundColor: 'rgba(71, 85, 105, 0.3)',
                                                borderWidth: 1,
                                                borderColor: 'rgba(148, 163, 184, 0.3)',
                                                borderRadius: 12,
                                                padding: Platform.OS === 'web' ? 16 : 12,
                                                flexDirection: Platform.OS === 'web' ? 'row' : 'column',
                                                alignItems: Platform.OS === 'web' ? 'center' : 'flex-start',
                                                justifyContent: 'space-between',
                                                gap: Platform.OS === 'web' ? 0 : 8,
                                            }}>
                                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                                    <Ionicons name="time-outline" size={20} color="#94a3b8" />
                                                    <Text style={{
                                                        color: '#94a3b8',
                                                        fontSize: 15,
                                                        fontWeight: '500',
                                                    }}>
                                                        America/Guayaquil (GMT-5)
                                                    </Text>
                                                </View>
                                                <View style={{
                                                    backgroundColor: 'rgba(148, 163, 184, 0.2)',
                                                    paddingHorizontal: 10,
                                                    paddingVertical: 4,
                                                    borderRadius: 6,
                                                    alignSelf: Platform.OS === 'web' ? 'auto' : 'flex-start',
                                                    marginTop: Platform.OS === 'web' ? 0 : 8,
                                                }}>
                                                    <Text style={{
                                                        color: '#94a3b8',
                                                        fontSize: 11,
                                                        fontWeight: '600',
                                                        textTransform: 'uppercase',
                                                        letterSpacing: 0.5,
                                                    }}>
                                                        Bloqueado
                                                    </Text>
                                                </View>
                                            </View>
                                            <Text style={modalStyles.helperText}>
                                                La zona horaria está configurada para Ecuador
                                            </Text>
                                        </View>

                                        {/* Estado del Agente - ACTIVO (Switch funcional) */}
                                        <View style={modalStyles.formGroup}>
                                            <View style={modalStyles.switchContainer}>
                                                <View>
                                                    <Text style={modalStyles.label}>Estado del Agente</Text>
                                                    <Text style={modalStyles.helperText}>
                                                        {formData.activo ? 'Agente activo y disponible' : 'Agente desactivado'}
                                                    </Text>
                                                </View>
                                                <Switch
                                                    value={formData.activo}
                                                    onValueChange={(value) => setFormData({ ...formData, activo: value })}
                                                    trackColor={{ false: '#475569', true: '#667eea' }}
                                                    thumbColor={formData.activo ? '#ffffff' : '#cbd5e1'}
                                                />
                                            </View>
                                        </View>
                                    </View>

                                    {/* Estadísticas */}
                                    <View style={modalStyles.detailSection}>
                                        <Text style={modalStyles.detailSectionTitle}>📊 Estadísticas y Auditoría</Text>
                                        <View style={modalStyles.detailGrid}>
                                            <View style={modalStyles.detailItem}>
                                                <Ionicons name="chatbubbles" size={16} color="#667eea" />
                                                <View style={{ flex: 1 }}>
                                                    <Text style={modalStyles.detailLabel}>Conversaciones</Text>
                                                    <Text style={modalStyles.detailValue}>
                                                        {selectedAgente.total_conversaciones || 0}
                                                    </Text>
                                                </View>
                                            </View>

                                            <View style={modalStyles.detailItem}>
                                                <Ionicons name="calendar" size={16} color="#667eea" />
                                                <View style={{ flex: 1 }}>
                                                    <Text style={modalStyles.detailLabel}>Fecha de creación</Text>
                                                    <Text style={modalStyles.detailValue}>
                                                        {formatDate(selectedAgente.fecha_creacion)}
                                                    </Text>
                                                </View>
                                            </View>

                                            {/* ⭐ NUEVO: Última actualización */}
                                            {selectedAgente.actualizado_por && (
                                                <>

                                                    <View style={modalStyles.detailItem}>
                                                        <Ionicons name="time" size={16} color="#667eea" />
                                                        <View style={{ flex: 1 }}>
                                                            <Text style={modalStyles.detailLabel}>Última actualización</Text>
                                                            <Text style={modalStyles.detailValue}>
                                                                {formatDate(selectedAgente.fecha_actualizacion)}
                                                            </Text>
                                                        </View>
                                                    </View>
                                                </>
                                            )}
                                        </View>
                                    </View>

                                    {/* Prompt del Sistema */}
                                    {selectedAgente.prompt_sistema && (
                                        <View style={modalStyles.detailSection}>
                                            <Text style={modalStyles.detailSectionTitle}>💬 Prompt del Sistema</Text>
                                            <View style={modalStyles.promptBox}>
                                                <Text style={modalStyles.promptText}>
                                                    {selectedAgente.prompt_sistema}
                                                </Text>
                                            </View>
                                        </View>
                                    )}

                                    {/* ⭐ NUEVO: Especialización */}
                                    {selectedAgente.prompt_especializado && (
                                        <View style={modalStyles.detailSection}>
                                            <Text style={modalStyles.detailSectionTitle}>🎯 Especialización</Text>
                                            <View style={{
                                                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                                                borderRadius: 12,
                                                padding: 16,
                                                borderWidth: 1,
                                                borderColor: 'rgba(102, 126, 234, 0.3)',
                                                borderLeftWidth: 4,
                                                borderLeftColor: '#667eea',
                                            }}>
                                                <Text style={{
                                                    color: 'rgba(255, 255, 255, 0.9)',
                                                    fontSize: 14,
                                                    lineHeight: 22,
                                                }}>
                                                    {selectedAgente.prompt_especializado}
                                                </Text>
                                            </View>
                                        </View>
                                    )}
                                    {/* ⭐ HORARIOS DE ATENCIÓN */}
                                    {selectedAgente.horarios && (
                                        <View style={modalStyles.detailSection}>
                                            <Text style={modalStyles.detailSectionTitle}>🕐 Horarios de Atención</Text>
                                            <View style={{ gap: 12 }}>
                                                {Object.entries(
                                                    typeof selectedAgente.horarios === 'string'
                                                        ? JSON.parse(selectedAgente.horarios)
                                                        : selectedAgente.horarios
                                                ).map(([dia, bloques]) => {
                                                    const diaLabel = dia.charAt(0).toUpperCase() + dia.slice(1);
                                                    const config = Array.isArray(bloques) && bloques.length > 0
                                                        ? { activo: true, bloques }
                                                        : { activo: false, bloques: [] };

                                                    return (
                                                        <View key={dia} style={{
                                                            backgroundColor: config.activo
                                                                ? 'rgba(102, 126, 234, 0.1)'
                                                                : 'rgba(71, 85, 105, 0.2)',
                                                            borderRadius: 10,
                                                            padding: 14,
                                                            borderWidth: 1,
                                                            borderColor: config.activo
                                                                ? 'rgba(102, 126, 234, 0.3)'
                                                                : 'rgba(148, 163, 184, 0.2)'
                                                        }}>
                                                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: config.activo && config.bloques?.length > 0 ? 8 : 0 }}>
                                                                <Ionicons
                                                                    name={config.activo ? "checkmark-circle" : "close-circle"}
                                                                    size={18}
                                                                    color={config.activo ? '#22c55e' : '#94a3b8'}
                                                                />
                                                                <Text style={{
                                                                    color: config.activo ? '#ffffff' : '#94a3b8',
                                                                    fontSize: 15,
                                                                    fontWeight: '600',
                                                                    flex: 1
                                                                }}>
                                                                    {diaLabel}
                                                                </Text>
                                                                {!config.activo && (
                                                                    <Text style={{ color: '#94a3b8', fontSize: 12 }}>
                                                                        No disponible
                                                                    </Text>
                                                                )}
                                                            </View>

                                                            {config.activo && config.bloques?.length > 0 && (
                                                                <View style={{ gap: 6, marginLeft: 28 }}>
                                                                    {config.bloques.map((bloque, index) => (
                                                                        <View key={index} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                                                            <Ionicons name="time-outline" size={14} color="#667eea" />
                                                                            <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: 13 }}>
                                                                                {bloque.inicio} - {bloque.fin}
                                                                            </Text>
                                                                        </View>
                                                                    ))}
                                                                </View>
                                                            )}
                                                        </View>
                                                    );
                                                })}
                                            </View>
                                        </View>
                                    )}

                                </ScrollView>

                                <View style={modalStyles.footer}>
                                    <ScrollView
                                        horizontal
                                        showsHorizontalScrollIndicator={false}
                                        contentContainerStyle={{ gap: 10, paddingHorizontal: 4 }}
                                    >
                                        <TouchableOpacity
                                            style={modalStyles.actionButton}
                                            onPress={() => {
                                                setShowDetailModal(false);
                                                handleEdit(selectedAgente);
                                            }}
                                            activeOpacity={0.8}
                                        >
                                            <Ionicons name="create-outline" size={18} color="#ffffff" />
                                            <Text style={modalStyles.actionButtonText}>Editar</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[
                                                modalStyles.actionButton,
                                                { backgroundColor: selectedAgente?.activo ? '#ef4444' : '#22c55e' }
                                            ]}
                                            onPress={() => {
                                                setShowDetailModal(false);
                                                setTimeout(() => {
                                                    handleToggleStatus(selectedAgente);
                                                }, 300);
                                            }}
                                            activeOpacity={0.8}
                                        >
                                            <Ionicons name="power" size={18} color="#ffffff" />
                                            <Text style={modalStyles.actionButtonText}>
                                                {selectedAgente?.activo ? 'Desactivar' : 'Activar'}
                                            </Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[modalStyles.actionButton, { backgroundColor: '#dc2626' }]}
                                            onPress={() => handleDelete(selectedAgente)}
                                            activeOpacity={0.8}
                                        >
                                            <Ionicons name="trash-outline" size={18} color="#ffffff" />
                                            <Text style={modalStyles.actionButtonText}>Eliminar</Text>
                                        </TouchableOpacity>
                                    </ScrollView>
                                </View>
                            </>
                        )}
                    </View>
                </View>
            </Modal>
            {/* 🔥 Modal de Confirmación de Cambio de Estado - DISEÑO MEJORADO */}
            <Modal
                visible={showConfirmModal}
                animationType="fade"
                transparent={true}
                onRequestClose={cancelarCambioEstado}
            >
                <View style={modalStyles.overlay}>
                    <View style={{
                        backgroundColor: '#1e293b',
                        borderRadius: 24,
                        width: '90%',
                        maxWidth: 480,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 20 },
                        shadowOpacity: 0.5,
                        shadowRadius: 30,
                        elevation: 25,
                        overflow: 'hidden',
                    }}>

                        {/* Header con gradiente */}
                        <View style={{
                            backgroundColor: agenteParaCambiarEstado?.activo
                                ? 'rgba(251, 191, 36, 0.15)'
                                : 'rgba(16, 185, 129, 0.15)',
                            paddingTop: 32,
                            paddingBottom: 24,
                            paddingHorizontal: 24,
                            borderBottomWidth: 1,
                            borderBottomColor: 'rgba(148, 163, 184, 0.2)',
                        }}>
                            {/* Icono grande centrado */}
                            <View style={{
                                width: 80,
                                height: 80,
                                borderRadius: 40,
                                backgroundColor: agenteParaCambiarEstado?.activo
                                    ? 'rgba(251, 191, 36, 0.2)'
                                    : 'rgba(16, 185, 129, 0.2)',
                                justifyContent: 'center',
                                alignItems: 'center',
                                alignSelf: 'center',
                                marginBottom: 16,
                                borderWidth: 3,
                                borderColor: agenteParaCambiarEstado?.activo ? '#fbbf24' : '#10b981',
                            }}>
                                <Text style={{ fontSize: 40 }}>
                                    {agenteParaCambiarEstado?.activo ? '⚠️' : '✅'}
                                </Text>
                            </View>

                            {/* Título */}
                            <Text style={{
                                color: '#ffffff',
                                fontSize: 24,
                                fontWeight: '700',
                                textAlign: 'center',
                                marginBottom: 8,
                            }}>
                                {agenteParaCambiarEstado?.activo ? '¿Desactivar Agente?' : '¿Activar Agente?'}
                            </Text>

                            {/* Subtítulo */}
                            <Text style={{
                                color: 'rgba(255, 255, 255, 0.6)',
                                fontSize: 14,
                                textAlign: 'center',
                            }}>
                                Esta acción afectará la disponibilidad del agente
                            </Text>
                        </View>

                        {/* Contenido del agente */}
                        <View style={{ padding: 24 }}>
                            {agenteParaCambiarEstado && (
                                <View style={{
                                    backgroundColor: 'rgba(71, 85, 105, 0.4)',
                                    borderRadius: 16,
                                    padding: 20,
                                    borderLeftWidth: 4,
                                    borderLeftColor: agenteParaCambiarEstado.activo ? '#fbbf24' : '#10b981',
                                }}>
                                    {/* Info del agente */}
                                    <View style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        gap: 12,
                                        marginBottom: 16,
                                        paddingBottom: 16,
                                        borderBottomWidth: 1,
                                        borderBottomColor: 'rgba(148, 163, 184, 0.2)',
                                    }}>
                                        <Text style={{ fontSize: 32 }}>
                                            {agenteParaCambiarEstado.icono || '🤖'}
                                        </Text>
                                        <View style={{ flex: 1 }}>
                                            <Text style={{
                                                color: '#ffffff',
                                                fontWeight: '700',
                                                fontSize: 16,
                                                marginBottom: 4,
                                            }}>
                                                {agenteParaCambiarEstado.nombre_agente}
                                            </Text>
                                            <Text style={{
                                                color: 'rgba(255, 255, 255, 0.6)',
                                                fontSize: 13,
                                            }}>
                                                {agenteParaCambiarEstado.area_especialidad || 'Sin especialidad'}
                                            </Text>
                                        </View>
                                    </View>

                                    {/* Consecuencias */}
                                    <View style={{ gap: 12 }}>
                                        <Text style={{
                                            color: agenteParaCambiarEstado.activo ? '#fbbf24' : '#10b981',
                                            fontSize: 13,
                                            fontWeight: '700',
                                            textTransform: 'uppercase',
                                            letterSpacing: 0.5,
                                            marginBottom: 4,
                                        }}>
                                            {agenteParaCambiarEstado.activo ? '⚠️ Consecuencias' : '✨ Beneficios'}
                                        </Text>

                                        {(agenteParaCambiarEstado.activo ? [
                                            'Los usuarios no podrán interactuar con este agente',
                                            'Las categorías y contenidos permanecerán guardados',
                                            'Podrás reactivarlo en cualquier momento'
                                        ] : [
                                            'Los usuarios podrán volver a interactuar con este agente',
                                            'Todas las categorías y contenidos estarán disponibles',
                                            'El agente estará completamente operativo'
                                        ]).map((texto, index) => (
                                            <View key={index} style={{
                                                flexDirection: 'row',
                                                alignItems: 'flex-start',
                                                gap: 10,
                                            }}>
                                                <View style={{
                                                    width: 6,
                                                    height: 6,
                                                    borderRadius: 3,
                                                    backgroundColor: agenteParaCambiarEstado.activo
                                                        ? '#fbbf24'
                                                        : '#10b981',
                                                    marginTop: 6,
                                                }} />
                                                <Text style={{
                                                    color: 'rgba(255, 255, 255, 0.8)',
                                                    fontSize: 14,
                                                    lineHeight: 20,
                                                    flex: 1,
                                                }}>
                                                    {texto}
                                                </Text>
                                            </View>
                                        ))}
                                    </View>
                                </View>
                            )}
                        </View>

                        {/* Footer con botones */}
                        <View style={{
                            flexDirection: 'row',
                            gap: 12,
                            padding: 24,
                            paddingTop: 0,
                        }}>
                            {/* Botón Cancelar */}
                            <TouchableOpacity
                                style={{
                                    flex: 1,
                                    backgroundColor: 'rgba(71, 85, 105, 0.5)',
                                    paddingVertical: 16,
                                    borderRadius: 12,
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 8,
                                    borderWidth: 2,
                                    borderColor: 'rgba(148, 163, 184, 0.3)',
                                }}
                                onPress={cancelarCambioEstado}
                                activeOpacity={0.7}
                            >
                                <Ionicons name="close-circle-outline" size={20} color="#cbd5e1" />
                                <Text style={{
                                    color: '#cbd5e1',
                                    fontSize: 15,
                                    fontWeight: '600',
                                }}>
                                    Cancelar
                                </Text>
                            </TouchableOpacity>

                            {/* Botón Confirmar */}
                            <TouchableOpacity
                                style={{
                                    flex: 1,
                                    backgroundColor: agenteParaCambiarEstado?.activo ? '#fbbf24' : '#10b981',
                                    paddingVertical: 16,
                                    borderRadius: 12,
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 8,
                                    shadowColor: agenteParaCambiarEstado?.activo ? '#fbbf24' : '#10b981',
                                    shadowOffset: { width: 0, height: 4 },
                                    shadowOpacity: 0.3,
                                    shadowRadius: 8,
                                    elevation: 8,
                                }}
                                onPress={confirmarCambioEstado}
                                activeOpacity={0.8}
                            >
                                <Ionicons
                                    name={agenteParaCambiarEstado?.activo ? "power" : "checkmark-circle"}
                                    size={20}
                                    color="#ffffff"
                                />
                                <Text style={{
                                    color: '#ffffff',
                                    fontSize: 15,
                                    fontWeight: '700',
                                }}>
                                    {agenteParaCambiarEstado?.activo ? 'Sí, Desactivar' : 'Sí, Activar'}
                                </Text>
                            </TouchableOpacity>
                        </View>

                    </View>
                </View>
            </Modal>
            {/* ============ MODAL CONFIRMACIÓN ELIMINAR ============ */}
            <Modal
                visible={showDeleteModal}
                animationType="fade"
                transparent={true}
                onRequestClose={() => setShowDeleteModal(false)}
            >
                <View style={{
                    flex: 1,
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: 20,
                }}>
                    <View style={{
                        backgroundColor: '#1e293b',
                        borderRadius: 20,
                        width: '100%',
                        maxWidth: 500,
                        overflow: 'hidden',
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 10 },
                        shadowOpacity: 0.5,
                        shadowRadius: 20,
                        elevation: 20,
                    }}>
                        {/* Header con ícono de advertencia */}
                        <View style={{
                            backgroundColor: 'rgba(220, 38, 38, 0.2)',
                            padding: 24,
                            alignItems: 'center',
                            borderBottomWidth: 1,
                            borderBottomColor: 'rgba(220, 38, 38, 0.3)',
                        }}>
                            <View style={{
                                width: 80,
                                height: 80,
                                borderRadius: 40,
                                backgroundColor: 'rgba(220, 38, 38, 0.2)',
                                justifyContent: 'center',
                                alignItems: 'center',
                                marginBottom: 16,
                                borderWidth: 3,
                                borderColor: '#dc2626',
                            }}>
                                <Ionicons name="trash-outline" size={40} color="#dc2626" />
                            </View>
                            <Text style={{
                                fontSize: 24,
                                fontWeight: '700',
                                color: '#ffffff',
                                textAlign: 'center',
                            }}>
                                ⚠️ Confirmar Eliminación
                            </Text>
                        </View>

                        {/* Contenido */}
                        <View style={{ padding: 24 }}>
                            <Text style={{
                                fontSize: 16,
                                color: 'rgba(255, 255, 255, 0.9)',
                                textAlign: 'center',
                                lineHeight: 24,
                                marginBottom: 16,
                            }}>
                                ¿Estás seguro de eliminar permanentemente el agente
                            </Text>

                            <View style={{
                                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                                padding: 16,
                                borderRadius: 12,
                                marginBottom: 16,
                                borderLeftWidth: 4,
                                borderLeftColor: '#667eea',
                            }}>
                                <Text style={{
                                    fontSize: 18,
                                    fontWeight: '700',
                                    color: '#ffffff',
                                    textAlign: 'center',
                                }}>
                                    "{agenteToDelete?.nombre_agente}"?
                                </Text>
                            </View>

                            <View style={{
                                backgroundColor: 'rgba(220, 38, 38, 0.1)',
                                padding: 16,
                                borderRadius: 12,
                                borderLeftWidth: 4,
                                borderLeftColor: '#dc2626',
                            }}>
                                <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
                                    <Ionicons name="warning" size={20} color="#dc2626" style={{ marginTop: 2 }} />
                                    <View style={{ flex: 1 }}>
                                        <Text style={{
                                            fontSize: 14,
                                            fontWeight: '700',
                                            color: '#dc2626',
                                            marginBottom: 6,
                                        }}>
                                            ADVERTENCIA: Esta acción es irreversible
                                        </Text>
                                        <Text style={{
                                            fontSize: 13,
                                            color: 'rgba(220, 38, 38, 0.9)',
                                            lineHeight: 20,
                                        }}>
                                            El agente será marcado como eliminado y NO podrá recuperarse desde la aplicación.
                                        </Text>
                                    </View>
                                </View>

                                <View style={{
                                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                    padding: 12,
                                    borderRadius: 8,
                                    borderWidth: 1,
                                    borderColor: 'rgba(59, 130, 246, 0.3)',
                                }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                        <Ionicons name="information-circle" size={16} color="#3b82f6" />
                                        <Text style={{
                                            fontSize: 12,
                                            color: '#3b82f6',
                                            fontWeight: '600',
                                        }}>
                                            💡 Sugerencia
                                        </Text>
                                    </View>
                                    <Text style={{
                                        fontSize: 12,
                                        color: 'rgba(59, 130, 246, 0.9)',
                                        marginTop: 6,
                                        lineHeight: 18,
                                    }}>
                                        Si solo deseas desactivarlo temporalmente, usa el botón "Desactivar" en su lugar.
                                    </Text>
                                </View>
                            </View>
                        </View>

                        {/* Botones */}
                        <View style={{
                            flexDirection: 'row',
                            gap: 12,
                            padding: 24,
                            paddingTop: 0,
                        }}>
                            <TouchableOpacity
                                style={{
                                    flex: 1,
                                    backgroundColor: 'rgba(71, 85, 105, 0.5)',
                                    padding: 16,
                                    borderRadius: 12,
                                    alignItems: 'center',
                                    borderWidth: 2,
                                    borderColor: 'rgba(148, 163, 184, 0.3)',
                                }}
                                onPress={() => {
                                    setShowDeleteModal(false);
                                    setAgenteToDelete(null);
                                }}
                                activeOpacity={0.8}
                            >
                                <Text style={{
                                    color: '#ffffff',
                                    fontSize: 16,
                                    fontWeight: '600',
                                }}>
                                    Cancelar
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={{
                                    flex: 1,
                                    backgroundColor: '#dc2626',
                                    padding: 16,
                                    borderRadius: 12,
                                    alignItems: 'center',
                                    flexDirection: 'row',
                                    justifyContent: 'center',
                                    gap: 8,
                                    borderWidth: 2,
                                    borderColor: '#b91c1c',
                                    shadowColor: '#dc2626',
                                    shadowOffset: { width: 0, height: 4 },
                                    shadowOpacity: 0.4,
                                    shadowRadius: 8,
                                    elevation: 8,
                                }}
                                onPress={confirmarEliminacion}
                                activeOpacity={0.8}
                            >
                                <Ionicons name="trash" size={20} color="#ffffff" />
                                <Text style={{
                                    color: '#ffffff',
                                    fontSize: 16,
                                    fontWeight: '700',
                                }}>
                                    Eliminar
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* ============ MODAL ERROR ============ */}
            <Modal
                visible={showErrorModal}
                animationType="fade"
                transparent={true}
                onRequestClose={() => setShowErrorModal(false)}
            >
                <View style={{
                    flex: 1,
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: 20,
                }}>
                    <View style={{
                        backgroundColor: '#1e293b',
                        borderRadius: 20,
                        width: '100%',
                        maxWidth: 500,
                        overflow: 'hidden',
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 10 },
                        shadowOpacity: 0.5,
                        shadowRadius: 20,
                        elevation: 20,
                    }}>
                        {/* Header */}
                        <View style={{
                            backgroundColor: 'rgba(239, 68, 68, 0.2)',
                            padding: 24,
                            alignItems: 'center',
                            borderBottomWidth: 1,
                            borderBottomColor: 'rgba(239, 68, 68, 0.3)',
                        }}>
                            <View style={{
                                width: 80,
                                height: 80,
                                borderRadius: 40,
                                backgroundColor: 'rgba(239, 68, 68, 0.2)',
                                justifyContent: 'center',
                                alignItems: 'center',
                                marginBottom: 16,
                                borderWidth: 3,
                                borderColor: '#ef4444',
                            }}>
                                <Ionicons name="alert-circle" size={40} color="#ef4444" />
                            </View>
                            <Text style={{
                                fontSize: 24,
                                fontWeight: '700',
                                color: '#ffffff',
                                textAlign: 'center',
                            }}>
                                ❌ No se puede eliminar
                            </Text>
                        </View>

                        {/* Contenido */}
                        <View style={{ padding: 24 }}>
                            {/* Mensaje principal */}
                            <View style={{
                                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                padding: 16,
                                borderRadius: 12,
                                marginBottom: 16,
                                borderLeftWidth: 4,
                                borderLeftColor: '#ef4444',
                            }}>
                                <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
                                    <Ionicons name="warning" size={20} color="#ef4444" style={{ marginTop: 2 }} />
                                    <View style={{ flex: 1 }}>
                                        <Text style={{
                                            fontSize: 15,
                                            fontWeight: '700',
                                            color: '#ef4444',
                                            marginBottom: 8,
                                        }}>
                                            Error al intentar eliminar
                                        </Text>
                                        <Text style={{
                                            fontSize: 14,
                                            color: 'rgba(255, 255, 255, 0.9)',
                                            lineHeight: 22,
                                        }}>
                                            {errorMessage}
                                        </Text>
                                        {/* ✅ NUEVO: Mostrar detalles de contenidos y categorías */}
                                        {errorDetails && (errorDetails.contenidos > 0 || errorDetails.categorias > 0) && (
                                            <View style={{
                                                marginTop: 12,
                                                backgroundColor: 'rgba(239, 68, 68, 0.05)',
                                                padding: 12,
                                                borderRadius: 8,
                                                gap: 6,
                                            }}>
                                                {errorDetails.contenidos > 0 && (
                                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                                        <Ionicons name="document-text" size={16} color="#ef4444" />
                                                        <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: 13, fontWeight: '600' }}>
                                                            {errorDetails.contenidos} {errorDetails.contenidos === 1 ? 'contenido' : 'contenidos'}
                                                        </Text>
                                                    </View>
                                                )}
                                                {errorDetails.categorias > 0 && (
                                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                                        <Ionicons name="folder" size={16} color="#ef4444" />
                                                        <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: 13, fontWeight: '600' }}>
                                                            {errorDetails.categorias} {errorDetails.categorias === 1 ? 'categoría' : 'categorías'}
                                                        </Text>
                                                    </View>
                                                )}
                                            </View>
                                        )}
                                    </View>
                                </View>
                            </View>

                            {/* Información del agente */}
                            {agenteToDelete && (
                                <View style={{
                                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                                    padding: 16,
                                    borderRadius: 12,
                                    marginBottom: 16,
                                    borderLeftWidth: 4,
                                    borderLeftColor: '#667eea',
                                }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                                        <Text style={{ fontSize: 24 }}>{agenteToDelete.icono || '🤖'}</Text>
                                        <Text style={{
                                            fontSize: 16,
                                            fontWeight: '700',
                                            color: '#ffffff',
                                            flex: 1,
                                        }}>
                                            {agenteToDelete.nombre_agente}
                                        </Text>
                                    </View>
                                    <Text style={{
                                        fontSize: 13,
                                        color: 'rgba(255, 255, 255, 0.7)',
                                    }}>
                                        {agenteToDelete.area_especialidad}
                                    </Text>
                                </View>
                            )}

                            {/* Sugerencia */}
                            <View style={{
                                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                padding: 16,
                                borderRadius: 12,
                                borderLeftWidth: 4,
                                borderLeftColor: '#3b82f6',
                            }}>
                                <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
                                    <Ionicons name="information-circle" size={20} color="#3b82f6" style={{ marginTop: 2 }} />
                                    <View style={{ flex: 1 }}>
                                        <Text style={{
                                            fontSize: 14,
                                            fontWeight: '700',
                                            color: '#3b82f6',
                                            marginBottom: 8,
                                        }}>
                                            💡 ¿Qué puedes hacer?
                                        </Text>

                                        <View style={{ gap: 8 }}>
                                            {/* ✅ NUEVO: Sugerencia dinámica según lo que tenga */}
                                            {errorDetails && errorDetails.contenidos > 0 && (
                                                <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
                                                    <Text style={{ color: '#3b82f6', fontSize: 13 }}>•</Text>
                                                    <Text style={{
                                                        fontSize: 13,
                                                        color: 'rgba(59, 130, 246, 0.9)',
                                                        lineHeight: 20,
                                                        flex: 1,
                                                    }}>
                                                        Elimina o reasigna los <Text style={{ fontWeight: '700' }}>contenidos</Text> asociados
                                                    </Text>
                                                </View>
                                            )}

                                            {errorDetails && errorDetails.categorias > 0 && (
                                                <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
                                                    <Text style={{ color: '#3b82f6', fontSize: 13 }}>•</Text>
                                                    <Text style={{
                                                        fontSize: 13,
                                                        color: 'rgba(59, 130, 246, 0.9)',
                                                        lineHeight: 20,
                                                        flex: 1,
                                                    }}>
                                                        Elimina o reasigna las <Text style={{ fontWeight: '700' }}>categorías</Text> asociadas
                                                    </Text>
                                                </View>
                                            )}

                                            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
                                                <Text style={{ color: '#3b82f6', fontSize: 13 }}>•</Text>
                                                <Text style={{
                                                    fontSize: 13,
                                                    color: 'rgba(59, 130, 246, 0.9)',
                                                    lineHeight: 20,
                                                    flex: 1,
                                                }}>
                                                    O simplemente <Text style={{ fontWeight: '700' }}>desactiva el agente</Text> temporalmente
                                                </Text>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        </View>

                        {/* Botones */}
                        <View style={{
                            flexDirection: 'row',
                            gap: 12,
                            padding: 24,
                            paddingTop: 0,
                        }}>
                            <TouchableOpacity
                                style={{
                                    flex: 1,
                                    backgroundColor: 'rgba(71, 85, 105, 0.5)',
                                    padding: 16,
                                    borderRadius: 12,
                                    alignItems: 'center',
                                    borderWidth: 2,
                                    borderColor: 'rgba(148, 163, 184, 0.3)',
                                }}
                                onPress={() => {
                                    setShowErrorModal(false);
                                    setErrorMessage('');
                                    setErrorDetails(null);
                                }}
                                activeOpacity={0.8}
                            >
                                <Text style={{
                                    color: '#ffffff',
                                    fontSize: 16,
                                    fontWeight: '600',
                                }}>
                                    Cerrar
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={{
                                    flex: 1,
                                    backgroundColor: '#fb923c',
                                    padding: 16,
                                    borderRadius: 12,
                                    alignItems: 'center',
                                    flexDirection: 'row',
                                    justifyContent: 'center',
                                    gap: 8,
                                    borderWidth: 2,
                                    borderColor: '#f97316',
                                    shadowColor: '#fb923c',
                                    shadowOffset: { width: 0, height: 4 },
                                    shadowOpacity: 0.4,
                                    shadowRadius: 8,
                                    elevation: 8,
                                }}
                                onPress={() => {
                                    setShowErrorModal(false);
                                    setErrorMessage('');
                                    setErrorDetails(null);
                                    if (agenteToDelete) {
                                        handleToggleStatus(agenteToDelete);
                                    }
                                }}
                                activeOpacity={0.8}
                            >
                                <Ionicons name="pause" size={20} color="#ffffff" />
                                <Text style={{
                                    color: '#ffffff',
                                    fontSize: 16,
                                    fontWeight: '700',
                                }}>
                                    Desactivar
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View >
    );
}
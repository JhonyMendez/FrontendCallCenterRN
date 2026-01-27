// ==================================================================================
// src/pages/GestionPerfilPage.js
// VERSIÓN MEJORADA - Diseño Moderno ✨
// ==================================================================================

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { User } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    Platform,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

import { usuarioService } from '../../api/services/usuarioService';
import GestionPerfilCard from '../../components/SuperAdministrador/GestionPerfilCard';

import { Dimensions } from 'react-native';
import AdminSidebar from '../../components/Sidebar/sidebarAdmin';
import { contentStyles } from '../../components/Sidebar/SidebarSuperAdminStyles';
import { getUserIdFromToken } from '../../components/utils/authHelper';
import SecurityValidator from '../../components/utils/SecurityValidator';
import { styles } from '../../styles/GestionPerfilStyles';

const { width } = Dimensions.get('window');
const isMobile = width < 768;

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
                    this.logSecurityEvent('RATE_LIMIT_EXCEEDED', { key });
                    return false;
                }
                attempts[key].push(now);
                return true;
            },
            logSecurityEvent(eventType, details) {
                console.warn(`🔒 SECURITY: ${eventType}`, details, new Date().toISOString());
            }
        };
    },

    // Validar ID numérico
    validateId(id) {
        const numId = parseInt(id, 10);
        return !isNaN(numId) && numId > 0;
    },

    // Validar estructura de objeto
    validateUserObject(user) {
        if (!user || typeof user !== 'object') return false;
        if (!user.id_usuario || !this.validateId(user.id_usuario)) return false;
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

const GestionPerfilPage = () => {
    // ==================== ESTADOS ====================
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const rateLimiterRef = useRef(SecurityUtils.createRateLimiter(3, 60000)); // 3 intentos por minuto
    const [loading, setLoading] = useState(true);
    const [usuario, setUsuario] = useState(null);
    const [mostrarFormulario, setMostrarFormulario] = useState(false);

    // ==================== MODALES ====================
    const [modalNotification, setModalNotification] = useState({
        visible: false,
        message: '',
        type: 'success'
    });

    // ==================== ANIMACIONES ====================
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.95)).current;

    useEffect(() => {
        // 🔐 Prevenir múltiples ejecuciones simultáneas
        let isMounted = true;

        const inicializar = async () => {
            if (!isMounted) return;

            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 600,
                    useNativeDriver: true,
                }),
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    tension: 50,
                    friction: 7,
                    useNativeDriver: true,
                }),
            ]).start();

            if (isMounted) {
                await cargarPerfil();
            }
        };

        inicializar();

        // Cleanup function
        return () => {
            isMounted = false;
        };
    }, []); // ⚠️ Importante: array vacío para que solo se ejecute una vez


    const isWeb = Platform.OS === 'web';
    // ==================== CARGAR PERFIL ====================
    const cargarPerfil = async () => {
        // 🔐 Rate limiting
        if (!rateLimiterRef.current.isAllowed('cargarPerfil')) {
            setModalNotification({
                visible: true,
                message: '⚠️ Demasiados intentos. Espera un momento.',
                type: 'error'
            });
            return;
        }

        setLoading(true);
        try {
            const idUsuario = await getUserIdFromToken();

            // 🔐 Validar ID de usuario
            if (!idUsuario || !SecurityUtils.validateId(idUsuario)) {
                SecurityUtils.logSecurityEvent('INVALID_USER_ID', { idUsuario });
                throw new Error('ID de usuario inválido');
            }

            console.log('🔍 ID Usuario validado:', idUsuario);

            // 🔐 Validar parámetros antes de enviar
            const params = {
                skip: 0,
                limit: 100
            };

            if (params.skip < 0 || params.limit < 1 || params.limit > 1000) {
                SecurityUtils.logSecurityEvent('INVALID_QUERY_PARAMS', params);
                throw new Error('Parámetros de consulta inválidos');
            }

            console.log('📡 Cargando datos desde el backend...');
            const response = await usuarioService.listarCompleto(params);

            // 🔐 Validar respuesta del backend
            if (!response || !Array.isArray(response.usuarios)) {
                SecurityUtils.logSecurityEvent('INVALID_BACKEND_RESPONSE', { response });
                throw new Error('Respuesta del servidor inválida');
            }

            console.log('✅ Respuesta recibida:', response);

            const miUsuario = response.usuarios?.find(u => u.id_usuario === idUsuario);

            // 🔐 Validar estructura del usuario
            if (!miUsuario || !SecurityUtils.validateUserObject(miUsuario)) {
                SecurityUtils.logSecurityEvent('USER_NOT_FOUND_OR_INVALID', { idUsuario });
                throw new Error('No se encontraron datos válidos del usuario');
            }

            // 🔐 Sanitizar datos del usuario antes de guardar en estado
            const usuarioSanitizado = {
                ...miUsuario,
                username: SecurityValidator.sanitizeText(miUsuario.username || ''),
                email: SecurityValidator.sanitizeText(miUsuario.email || ''),
                persona: miUsuario.persona ? {
                    ...miUsuario.persona,
                    nombre: SecurityValidator.sanitizeText(miUsuario.persona.nombre || ''),
                    apellido: SecurityValidator.sanitizeText(miUsuario.persona.apellido || ''),
                    cedula: SecurityValidator.sanitizeText(miUsuario.persona.cedula || ''),
                    telefono: SecurityValidator.sanitizeText(miUsuario.persona.telefono || ''),
                    direccion: SecurityValidator.sanitizeText(miUsuario.persona.direccion || ''),
                } : null,
                roles: Array.isArray(miUsuario.roles)
                    ? miUsuario.roles.map(rol => ({
                        ...rol,
                        nombre_rol: SecurityValidator.sanitizeText(rol.nombre_rol || '')
                    }))
                    : []
            };

            console.log('✅ Usuario sanitizado:', usuarioSanitizado);
            setUsuario(usuarioSanitizado);

        } catch (error) {
            if (error?.isTokenExpired) {
                console.log('🔒 Token expirado - SessionContext manejará');
                return;
            }

            console.error('❌ Error cargando perfil:', error);
            SecurityUtils.logSecurityEvent('LOAD_PROFILE_ERROR', {
                error: error.message,
                stack: error.stack
            });

            setModalNotification({
                visible: true,
                message: error.message || 'Error al cargar el perfil',
                type: 'error'
            });
        } finally {
            setLoading(false);
        }
    };
    // ==================== NAVEGACIÓN ====================
    const abrirFormularioEditar = () => {
        // 🔐 Validar que hay un usuario cargado
        if (!usuario || !SecurityUtils.validateUserObject(usuario)) {
            SecurityUtils.logSecurityEvent('EDIT_WITHOUT_USER', { usuario });
            setModalNotification({
                visible: true,
                message: '⚠️ No hay datos de usuario para editar',
                type: 'error'
            });
            return;
        }

        setMostrarFormulario(true);
    };

    const cerrarFormulario = () => {
        setMostrarFormulario(false);
    };

    const handleGuardado = async (exito) => {
        // 🔐 Validar tipo de parámetro
        if (typeof exito !== 'boolean') {
            SecurityUtils.logSecurityEvent('INVALID_GUARDADO_PARAM', { exito });
            cerrarFormulario();
            return;
        }

        if (exito) {
            // 🔐 Rate limiting para recargas
            if (!rateLimiterRef.current.isAllowed('handleGuardado')) {
                setModalNotification({
                    visible: true,
                    message: '⚠️ Demasiadas actualizaciones. Espera un momento.',
                    type: 'error'
                });
                return;
            }

            cerrarFormulario();
            await cargarPerfil();
            setModalNotification({
                visible: true,
                message: '✅ Perfil actualizado correctamente',
                type: 'success'
            });
        } else {
            cerrarFormulario();
        }
    };

    // ==================== UTILIDADES ====================
    const formatearFecha = (fecha) => {
        if (!fecha) return 'No especificada';

        try {
            // 🔐 Validar que sea una fecha válida
            const date = new Date(fecha);

            if (isNaN(date.getTime())) {
                SecurityUtils.logSecurityEvent('INVALID_DATE_FORMAT', { fecha });
                return 'Fecha inválida';
            }

            // 🔐 Validar rango de fecha razonable (1900 - 2100)
            const year = date.getFullYear();
            if (year < 1900 || year > 2100) {
                SecurityUtils.logSecurityEvent('DATE_OUT_OF_RANGE', { fecha, year });
                return 'Fecha fuera de rango';
            }

            return date.toLocaleDateString('es-EC', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch (error) {
            SecurityUtils.logSecurityEvent('DATE_FORMAT_ERROR', { fecha, error: error.message });
            return 'Fecha inválida';
        }
    };

    const getRolGradient = (nombre) => {
        // 🔐 Validar input
        if (!nombre || typeof nombre !== 'string') {
            return ['#6B7280', '#4B5563']; // Default gris
        }

        // 🔐 Limitar longitud
        if (nombre.length > 100) {
            SecurityUtils.logSecurityEvent('ROL_NAME_TOO_LONG', { length: nombre.length });
            return ['#6B7280', '#4B5563'];
        }

        // 🔐 Detectar XSS
        if (SecurityUtils.detectXssAttempt(nombre)) {
            SecurityUtils.logSecurityEvent('XSS_ATTEMPT_IN_ROL_NAME', { nombre: nombre.substring(0, 50) });
            return ['#6B7280', '#4B5563'];
        }

        const nombreLower = nombre.toLowerCase();
        if (nombreLower.includes('super')) return ['#F59E0B', '#D97706'];
        if (nombreLower.includes('administrador')) return ['#667eea', '#764ba2'];
        if (nombreLower.includes('funcionario')) return ['#10B981', '#059669'];
        return ['#6B7280', '#4B5563'];
    };

    const formatearGenero = (genero) => {
        // 🔐 Validar input
        if (!genero || typeof genero !== 'string') {
            return 'No especificado';
        }

        // 🔐 Limitar longitud
        if (genero.length > 50) {
            SecurityUtils.logSecurityEvent('GENERO_TOO_LONG', { length: genero.length });
            return 'No especificado';
        }

        const generos = {
            masculino: '♂ Masculino',
            femenino: '♀ Femenino',
            otro: '⚧ Otro',
            prefiero_no_decir: '✖ Prefiero no decir'
        };
        return generos[genero.toLowerCase()] || 'No especificado';
    };

    const formatearTipoPersona = (tipo) => {
        // 🔐 Validar input
        if (!tipo || typeof tipo !== 'string') {
            return 'No especificado';
        }

        // 🔐 Limitar longitud
        if (tipo.length > 50) {
            SecurityUtils.logSecurityEvent('TIPO_PERSONA_TOO_LONG', { length: tipo.length });
            return 'No especificado';
        }

        const tipos = {
            docente: 'Docente',
            administrativo: 'Administrativo',
            estudiante: 'Estudiante',
            externo: 'Externo'
        };
        return tipos[tipo.toLowerCase()] || 'No especificado';
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

            {/* Botón Toggle */}
            <TouchableOpacity
                style={{
                    position: 'absolute',
                    top: 16,
                    left: sidebarOpen ? 296 : 16,
                    zIndex: 1001,
                    backgroundColor: '#1e1b4b',
                    padding: 12,
                    borderRadius: 12,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.25,
                    shadowRadius: 3.84,
                    elevation: 5,
                }}
                onPress={() => setSidebarOpen(!sidebarOpen)}
            >
                <Ionicons name={sidebarOpen ? "close" : "menu"} size={24} color="#ffffff" />
            </TouchableOpacity>

            {/* Contenido Principal */}
            <View style={[
                contentStyles.mainContent,
                sidebarOpen && contentStyles.mainContentWithSidebar
            ]}>
                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#667eea" />
                        <Text style={styles.loadingText}>Cargando perfil...</Text>
                    </View>
                ) : mostrarFormulario ? (
                    <GestionPerfilCard
                        usuario={usuario}
                        onCerrar={cerrarFormulario}
                        onGuardado={handleGuardado}
                    />
                ) : (
                    <Animated.ScrollView
                        style={[styles.container, { opacity: fadeAnim }]}
                        showsVerticalScrollIndicator={false}
                    >
                        {/* Header Mejorado con Gradiente */}
                        <LinearGradient
                            colors={['#667eea', '#764ba2']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.headerModerno}
                        >
                            <View style={styles.headerContent}>
                                <View style={styles.headerTop}>
                                    <View style={[styles.headerTitleContainer, isMobile && { flex: 1, maxWidth: '65%' }]}>
                                        <View style={styles.headerIconContainer}>
                                            <User size={isMobile ? 28 : 32} color="#FFFFFF" />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={[styles.headerTitle, isMobile && { fontSize: 20 }]}>Mi Perfil</Text>
                                            <Text style={[styles.headerSubtitle, isMobile && { fontSize: 13 }]} numberOfLines={1}>
                                                {SecurityValidator.sanitizeText(usuario?.persona?.nombre || '')} {' '}
                                                {SecurityValidator.sanitizeText(usuario?.persona?.apellido || '')}
                                            </Text>
                                        </View>
                                    </View>
                                    <TouchableOpacity
                                        style={styles.btnEditModerno}
                                        onPress={abrirFormularioEditar}
                                        activeOpacity={0.8}
                                    >
                                        <LinearGradient
                                            colors={['#FFFFFF', '#F3F4F6']}
                                            style={styles.btnEditGradient}
                                        >
                                            <Ionicons name="create" size={isMobile ? 18 : 20} color="#667eea" />
                                            <Text style={[styles.btnEditText, isMobile && { fontSize: 11 }]}>
                                                {isMobile ? 'EDITAR' : 'EDITAR'}
                                            </Text>
                                        </LinearGradient>
                                    </TouchableOpacity>
                                </View>

                                {/* Estado y Email */}
                                <View style={styles.headerBottom}>
                                    <View style={styles.headerInfo}>
                                        <Ionicons name="mail" size={16} color="#FFFFFF" />
                                        <Text style={styles.headerInfoText}>
                                            {SecurityValidator.sanitizeText(usuario?.email || '')}
                                        </Text>
                                    </View>
                                    <View style={styles.headerInfo}>
                                        <Ionicons name="at" size={16} color="#FFFFFF" />
                                        <Text style={styles.headerInfoText}>
                                            {SecurityValidator.sanitizeText(usuario?.username || '')}
                                        </Text>
                                    </View>
                                    <LinearGradient
                                        colors={(() => {
                                            // 🔐 Validar estado antes de usar
                                            const estado = usuario?.estado?.toLowerCase();
                                            const validEstados = ['activo', 'inactivo', 'bloqueado', 'pendiente'];

                                            if (!estado || !validEstados.includes(estado)) {
                                                SecurityUtils.logSecurityEvent('INVALID_USER_ESTADO', { estado });
                                                return ['#6B7280', '#4B5563']; // Gris por defecto
                                            }

                                            return estado === 'activo'
                                                ? ['#10B981', '#059669']
                                                : ['#EF4444', '#DC2626'];
                                        })()}
                                        style={styles.estadoBadgeHeader}
                                    >
                                        <Ionicons
                                            name={(() => {
                                                const estado = usuario?.estado?.toLowerCase();
                                                return estado === 'activo' ? "checkmark-circle" : "close-circle";
                                            })()}
                                            size={16}
                                            color="#FFFFFF"
                                        />
                                        <Text style={styles.estadoBadgeText}>
                                            {(() => {
                                                // 🔐 Sanitizar y validar estado
                                                const estado = usuario?.estado;
                                                if (!estado || typeof estado !== 'string' || estado.length > 20) {
                                                    return 'DESCONOCIDO';
                                                }
                                                return SecurityValidator.sanitizeText(estado).toUpperCase();
                                            })()}
                                        </Text>
                                    </LinearGradient>
                                </View>
                            </View>
                        </LinearGradient>

                        {/* Perfil Card Mejorado */}
                        <Animated.View
                            style={[
                                styles.perfilContainer,
                                { transform: [{ scale: scaleAnim }] }
                            ]}
                        >
                            <View style={styles.perfilCardModerno}>
                                {/* Información Personal */}
                                <View style={styles.infoSectionModerno}>
                                    <View style={styles.sectionHeaderModerno}>
                                        <LinearGradient
                                            colors={['#667eea', '#764ba2']}
                                            style={styles.sectionIconGradient}
                                        >
                                            <Ionicons name="person" size={20} color="#FFFFFF" />
                                        </LinearGradient>
                                        <Text style={styles.sectionTitleModerno}>Información Personal</Text>
                                    </View>

                                    <View style={styles.infoGrid}>
                                        {/* Cédula */}
                                        <View style={styles.infoCardModerno}>
                                            <View style={styles.infoCardHeader}>
                                                <View style={styles.infoIconModerno}>
                                                    <Ionicons name="card-outline" size={20} color="#667eea" />
                                                </View>
                                                <Text style={styles.infoLabelModerno}>Cédula</Text>
                                            </View>
                                            <Text style={styles.infoValueModerno}>
                                                {SecurityValidator.sanitizeText(usuario?.persona?.cedula || 'No especificada')}
                                            </Text>
                                        </View>

                                        {/* Fecha Nacimiento */}
                                        <View style={styles.infoCardModerno}>
                                            <View style={styles.infoCardHeader}>
                                                <View style={styles.infoIconModerno}>
                                                    <Ionicons name="calendar-outline" size={20} color="#667eea" />
                                                </View>
                                                <Text style={styles.infoLabelModerno}>Fecha de Nacimiento</Text>
                                            </View>
                                            <Text style={styles.infoValueModerno}>
                                                {formatearFecha(usuario?.persona?.fecha_nacimiento)}
                                            </Text>
                                        </View>

                                        {/* Género */}
                                        <View style={styles.infoCardModerno}>
                                            <View style={styles.infoCardHeader}>
                                                <View style={styles.infoIconModerno}>
                                                    <Ionicons name="transgender-outline" size={20} color="#667eea" />
                                                </View>
                                                <Text style={styles.infoLabelModerno}>Género</Text>
                                            </View>
                                            <Text style={styles.infoValueModerno}>
                                                {formatearGenero(usuario?.persona?.genero)}
                                            </Text>
                                        </View>

                                        {/* Tipo Persona */}
                                        <View style={styles.infoCardModerno}>
                                            <View style={styles.infoCardHeader}>
                                                <View style={styles.infoIconModerno}>
                                                    <Ionicons name="briefcase-outline" size={20} color="#667eea" />
                                                </View>
                                                <Text style={styles.infoLabelModerno}>Tipo de Persona</Text>
                                            </View>
                                            <Text style={styles.infoValueModerno}>
                                                {formatearTipoPersona(usuario?.persona?.tipo_persona)}
                                            </Text>
                                        </View>
                                    </View>
                                </View>

                                {/* Información de Contacto */}
                                <View style={styles.infoSectionModerno}>
                                    <View style={styles.sectionHeaderModerno}>
                                        <LinearGradient
                                            colors={['#10B981', '#059669']}
                                            style={styles.sectionIconGradient}
                                        >
                                            <Ionicons name="call" size={20} color="#FFFFFF" />
                                        </LinearGradient>
                                        <Text style={styles.sectionTitleModerno}>Contacto</Text>
                                    </View>

                                    <View style={styles.infoGrid}>
                                        {/* Teléfono */}
                                        <View style={styles.infoCardModerno}>
                                            <View style={styles.infoCardHeader}>
                                                <View style={styles.infoIconModerno}>
                                                    <Ionicons name="call-outline" size={20} color="#10B981" />
                                                </View>
                                                <Text style={styles.infoLabelModerno}>Teléfono</Text>
                                            </View>
                                            <Text style={[
                                                usuario?.persona?.telefono ? styles.infoValueModerno : styles.infoValueEmpty
                                            ]}>
                                                {SecurityValidator.sanitizeText(usuario?.persona?.telefono || 'No especificado')}
                                            </Text>
                                        </View>

                                        {/* Dirección */}
                                        <View style={styles.infoCardModerno}>
                                            <View style={styles.infoCardHeader}>\n                                                <View style={styles.infoIconModerno}>
                                                    <Ionicons name="location-outline" size={20} color="#10B981" />
                                                </View>
                                                <Text style={styles.infoLabelModerno}>Dirección</Text>
                                            </View>
                                            <Text 
                                                style={[
                                                    usuario?.persona?.direccion ? styles.infoValueModerno : styles.infoValueEmpty
                                                ]}
                                                numberOfLines={0}
                                            >
                                                {usuario?.persona?.direccion || 'No especificada'}
                                            </Text>
                                        </View>
                                    </View>
                                </View>

                                {/* Roles */}
                                {usuario?.roles && Array.isArray(usuario.roles) && usuario.roles.length > 0 && (
                                    <View style={styles.infoSectionModerno}>
                                        <View style={styles.sectionHeaderModerno}>
                                            <LinearGradient
                                                colors={['#F59E0B', '#D97706']}
                                                style={styles.sectionIconGradient}
                                            >
                                                <Ionicons name="shield-checkmark" size={20} color="#FFFFFF" />
                                            </LinearGradient>
                                            <Text style={styles.sectionTitleModerno}>Roles Asignados</Text>
                                        </View>
                                        <View style={styles.rolesContainerModerno}>
                                            {usuario.roles
                                                .filter(rol => {
                                                    // 🔐 Validar estructura del rol
                                                    if (!rol || typeof rol !== 'object') return false;
                                                    if (!rol.id_rol || !rol.nombre_rol) return false;
                                                    return true;
                                                })
                                                .slice(0, 10) // 🔐 Limitar a 10 roles máximo
                                                .map((rol) => (
                                                    <LinearGradient
                                                        key={rol.id_rol}
                                                        colors={getRolGradient(rol.nombre_rol)}
                                                        start={{ x: 0, y: 0 }}
                                                        end={{ x: 1, y: 1 }}
                                                        style={styles.rolBadgeModerno}
                                                    >
                                                        <Ionicons name="shield" size={16} color="#FFFFFF" />
                                                        <Text style={styles.roleBadgeTextModerno}>
                                                            {SecurityValidator.sanitizeText(
                                                                (rol.nombre_rol || 'Sin nombre').substring(0, 50)
                                                            )}
                                                        </Text>
                                                    </LinearGradient>
                                                ))
                                            }
                                        </View>
                                    </View>
                                )}
                            </View>
                        </Animated.View>
                    </Animated.ScrollView>
                )}

                {/* Modal de Notificaciones */}
                <NotificationModal
                    visible={modalNotification.visible}
                    message={modalNotification.message}
                    type={modalNotification.type}
                    onClose={() => setModalNotification({ ...modalNotification, visible: false })}
                />
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

// ==================== MODAL DE NOTIFICACIÓN MEJORADO ====================
const NotificationModal = ({ visible, message, type = 'success', onClose }) => {
    // 🔐 Sanitizar mensaje
    const sanitizedMessage = SecurityValidator.sanitizeText(message || '');

    // 🔐 Validar tipo
    const validTypes = ['success', 'error'];
    const safeType = validTypes.includes(type) ? type : 'success';
    const slideAnim = useRef(new Animated.Value(-100)).current;
    const scaleAnim = useRef(new Animated.Value(0.8)).current;

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.spring(slideAnim, {
                    toValue: 0,
                    tension: 50,
                    friction: 7,
                    useNativeDriver: true,
                }),
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    tension: 50,
                    friction: 7,
                    useNativeDriver: true,
                }),
            ]).start();

            const timer = setTimeout(() => {
                Animated.parallel([
                    Animated.timing(slideAnim, {
                        toValue: -100,
                        duration: 300,
                        useNativeDriver: true,
                    }),
                    Animated.timing(scaleAnim, {
                        toValue: 0.8,
                        duration: 300,
                        useNativeDriver: true,
                    }),
                ]).start(() => onClose());
            }, 3500);

            return () => clearTimeout(timer);
        }
    }, [visible]);

    const getConfig = () => {
        // 🔐 Usar la versión sanitizada del tipo
        if (safeType === 'error') {
            return {
                icon: 'close-circle',
                iconColor: '#FFFFFF',
                bgGradient: ['#EF4444', '#DC2626'],
            };
        }
        return {
            icon: 'checkmark-circle',
            iconColor: '#FFFFFF',
            bgGradient: ['#10B981', '#059669'],
        };
    };

    const config = getConfig();

    if (!visible) return null;

    return (
        <View style={styles.notificationOverlay}>
            <Animated.View
                style={[
                    styles.notificationWrapper,
                    {
                        transform: [
                            { translateY: slideAnim },
                            { scale: scaleAnim }
                        ]
                    }
                ]}
            >
                <LinearGradient
                    colors={config.bgGradient}
                    style={styles.notificationContainerModerno}
                >
                    <View style={styles.notificationIconContainer}>
                        <Ionicons name={config.icon} size={32} color={config.iconColor} />
                    </View>
                    <Text style={styles.notificationMessageModerno}>
                        {sanitizedMessage.substring(0, 200)}
                    </Text>
                    <TouchableOpacity onPress={onClose} style={styles.notificationCloseBtn}>
                        <Ionicons name="close" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                </LinearGradient>
            </Animated.View>
        </View>
    );
};

export default GestionPerfilPage;

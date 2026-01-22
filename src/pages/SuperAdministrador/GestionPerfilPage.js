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

import SuperAdminSidebar from '../../components/Sidebar/sidebarSuperAdmin';
import { contentStyles } from '../../components/Sidebar/SidebarSuperAdminStyles';
import { getUserIdFromToken } from '../../components/utils/authHelper';
import SecurityValidator from '../../components/utils/SecurityValidator';
import { styles } from '../../styles/GestionPerfilStyles';

const GestionPerfilPage = () => {
    // ==================== ESTADOS ====================
    const [sidebarOpen, setSidebarOpen] = useState(false);
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

        cargarPerfil();
    }, []);


    const isWeb = Platform.OS === 'web';
    // ==================== CARGAR PERFIL ====================
    const cargarPerfil = async () => {
        setLoading(true);
        try {
            const idUsuario = await getUserIdFromToken();
            console.log('🔍 ID Usuario:', idUsuario);

            if (!idUsuario) {
                throw new Error('No se pudo obtener el ID del usuario');
            }

            console.log('📡 Cargando datos desde el backend usando /completo...');
            const response = await usuarioService.listarCompleto({
                skip: 0,
                limit: 100
            });

            console.log('✅ Respuesta completa recibida:', response);

            const miUsuario = response.usuarios?.find(u => u.id_usuario === idUsuario);

            if (!miUsuario) {
                throw new Error('No se encontraron datos del usuario actual');
            }

            console.log('✅ Datos del usuario encontrado:', miUsuario);
            setUsuario(miUsuario);

        } catch (error) {
            if (error?.isTokenExpired) {
                console.log('🔒 Token expirado - SessionContext manejará');
                return;
            }

            console.error('❌ Error cargando perfil:', error);
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
        setMostrarFormulario(true);
    };

    const cerrarFormulario = () => {
        setMostrarFormulario(false);
    };

    const handleGuardado = async (exito) => {
        if (exito) {
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
        const date = new Date(fecha);
        return date.toLocaleDateString('es-EC', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getRolGradient = (nombre) => {
        const nombreLower = (nombre || '').toLowerCase();
        if (nombreLower.includes('super')) return ['#F59E0B', '#D97706'];
        if (nombreLower.includes('administrador')) return ['#667eea', '#764ba2'];
        if (nombreLower.includes('funcionario')) return ['#10B981', '#059669'];
        return ['#6B7280', '#4B5563'];
    };

    const formatearGenero = (genero) => {
        const generos = {
            masculino: '♂ Masculino',
            femenino: '♀ Femenino',
            otro: '⚧ Otro',
            prefiero_no_decir: '✖ Prefiero no decir'
        };
        return generos[genero?.toLowerCase()] || 'No especificado';
    };

    const formatearTipoPersona = (tipo) => {
        const tipos = {
            docente: 'Docente',
            administrativo: 'Administrativo',
            estudiante: 'Estudiante',
            externo: 'Externo'
        };
        return tipos[tipo?.toLowerCase()] || 'No especificado';
    };

    // ==================== RENDER ====================
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
                                    <View style={styles.headerTitleContainer}>
                                        <View style={styles.headerIconContainer}>
                                            <User size={32} color="#FFFFFF" />
                                        </View>
                                        <View>
                                            <Text style={styles.headerTitle}>Mi Perfil</Text>
                                            <Text style={styles.headerSubtitle}>
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
                                            <Ionicons name="create" size={20} color="#667eea" />
                                            <Text style={styles.btnEditText}>EDITAR</Text>
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
                                        colors={usuario?.estado?.toLowerCase() === 'activo'
                                            ? ['#10B981', '#059669']
                                            : ['#EF4444', '#DC2626']
                                        }
                                        style={styles.estadoBadgeHeader}
                                    >
                                        <Ionicons
                                            name={usuario?.estado?.toLowerCase() === 'activo' ? "checkmark-circle" : "close-circle"}
                                            size={16}
                                            color="#FFFFFF"
                                        />
                                        <Text style={styles.estadoBadgeText}>
                                            {usuario?.estado?.toUpperCase() || 'INACTIVO'}
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
                                            <View style={styles.infoCardHeader}>
                                                <View style={styles.infoIconModerno}>
                                                    <Ionicons name="location-outline" size={20} color="#10B981" />
                                                </View>
                                                <Text style={styles.infoLabelModerno}>Dirección</Text>
                                            </View>
                                            <Text style={[
                                                usuario?.persona?.direccion ? styles.infoValueModerno : styles.infoValueEmpty
                                            ]}>
                                                {SecurityValidator.sanitizeText(usuario?.persona?.direccion || 'No especificada')}
                                            </Text>
                                        </View>
                                    </View>
                                </View>

                                {/* Roles */}
                                {usuario?.roles && usuario.roles.length > 0 && (
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
                                            {usuario.roles.map((rol) => (
                                                <LinearGradient
                                                    key={rol.id_rol}
                                                    colors={getRolGradient(rol.nombre_rol)}
                                                    start={{ x: 0, y: 0 }}
                                                    end={{ x: 1, y: 1 }}
                                                    style={styles.rolBadgeModerno}
                                                >
                                                    <Ionicons name="shield" size={16} color="#FFFFFF" />
                                                    <Text style={styles.roleBadgeTextModerno}>
                                                        {SecurityValidator.sanitizeText(rol.nombre_rol || 'Sin nombre')}
                                                    </Text>
                                                </LinearGradient>
                                            ))}
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
                        <SuperAdminSidebar
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
        if (type === 'error') {
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
                    <Text style={styles.notificationMessageModerno}>{message}</Text>
                    <TouchableOpacity onPress={onClose} style={styles.notificationCloseBtn}>
                        <Ionicons name="close" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                </LinearGradient>
            </Animated.View>
        </View>
    );
};

export default GestionPerfilPage;
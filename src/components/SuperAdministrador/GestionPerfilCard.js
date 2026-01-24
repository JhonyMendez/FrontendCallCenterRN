// ==================================================================================
// src/components/Perfil/GestionPerfilCard.js
// Formulario de Edición de Perfil Personal - VERSIÓN MEJORADA ✨
// ==================================================================================
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

import { personaService } from '../../api/services/personaService';
import { usuarioService } from '../../api/services/usuarioService';
import { styles } from '../../styles/GestionPerfilStyles';
import DateInput from '../common/DateInput';
import SecurityValidator from '../utils/SecurityValidator';
const { width } = Dimensions.get('window');
const isMobile = width < 768;

const GestionPerfilCard = ({ usuario, onCerrar, onGuardado }) => {
    // ==================== ESTADOS ====================
    const [pasoActual, setPasoActual] = useState(1);
    const [guardando, setGuardando] = useState(false);
    const [errors, setErrors] = useState({});

    // Modales
    const [modalNotification, setModalNotification] = useState({
        visible: false,
        message: '',
        type: 'success'
    });

    const mostrarNotificacion = (message, type = 'success') => {
        setModalNotification({ visible: true, message, type });
    };

    const ocultarNotificacion = () => {
        setModalNotification({ visible: false, message: '', type: 'success' });
    };

    // Datos de Persona
    const [nombre, setNombre] = useState('');
    const [apellido, setApellido] = useState('');
    const [cedula, setCedula] = useState('');
    const [fechaNacimiento, setFechaNacimiento] = useState('');
    const [telefono, setTelefono] = useState('');
    const [direccion, setDireccion] = useState('');
    const [genero, setGenero] = useState('');

    // Datos de Usuario
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [mostrarPassword, setMostrarPassword] = useState(false);
    const [mostrarConfirmPassword, setMostrarConfirmPassword] = useState(false);

    // ==================== ANIMACIONES ====================
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(100)).current;
    const scaleAnim = useRef(new Animated.Value(0.9)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }),
            Animated.spring(slideAnim, {
                toValue: 0,
                tension: 40,
                friction: 8,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                tension: 50,
                friction: 7,
                useNativeDriver: true,
            }),
        ]).start();

        if (usuario) {
            setNombre(usuario.persona?.nombre || '');
            setApellido(usuario.persona?.apellido || '');
            setCedula(usuario.persona?.cedula || '');
            setTelefono(usuario.persona?.telefono || '');
            setDireccion(usuario.persona?.direccion || '');
            setFechaNacimiento(usuario.persona?.fecha_nacimiento || '');
            setGenero(usuario.persona?.genero || '');
            setUsername(usuario.username || '');
            setEmail(usuario.email || '');
        }
    }, [usuario]);

    // ==================== VALIDACIÓN ====================
    const validarPaso = (paso) => {
        const newErrors = {};

        if (paso === 1) {
            const nombreLimpio = SecurityValidator.truncateText(
                SecurityValidator.sanitizeText(nombre), 100
            );
            if (!nombreLimpio.trim()) newErrors.nombre = 'El nombre es requerido';
            if (nombreLimpio.length < 2) newErrors.nombre = 'Mínimo 2 caracteres';

            const apellidoLimpio = SecurityValidator.truncateText(
                SecurityValidator.sanitizeText(apellido), 100
            );
            if (!apellidoLimpio.trim()) newErrors.apellido = 'El apellido es requerido';
            if (apellidoLimpio.length < 2) newErrors.apellido = 'Mínimo 2 caracteres';

            if (telefono.trim()) {
                const telefonoLimpio = SecurityValidator.sanitizeText(telefono).replace(/[-\s()]/g, '');
                if (telefonoLimpio.length < 7 || telefonoLimpio.length > 15 || !/^\d+$/.test(telefonoLimpio)) {
                    newErrors.telefono = 'Teléfono inválido (7-15 dígitos)';
                }
            }

            if (direccion.trim() && direccion.length > 200) {
                newErrors.direccion = 'Máximo 200 caracteres';
            }
        }

        if (paso === 2) {
            const usernameLimpio = SecurityValidator.truncateText(
                SecurityValidator.sanitizeText(username), 50
            );
            if (!usernameLimpio.trim()) newErrors.username = 'El usuario es requerido';
            if (usernameLimpio.length < 4) newErrors.username = 'Mínimo 4 caracteres';

            const emailLimpio = SecurityValidator.sanitizeText(email).toLowerCase().trim();
            if (!emailLimpio.trim()) newErrors.email = 'El email es requerido';
            if (!SecurityValidator.isValidEmail(emailLimpio)) {
                newErrors.email = 'Email inválido';
            }

            if (password && password.trim()) {
                if (password.length < 8) {
                    newErrors.password = 'Mínimo 8 caracteres';
                } else if (!/[A-Z]/.test(password)) {
                    newErrors.password = 'Debe contener una mayúscula';
                } else if (!/[a-z]/.test(password)) {
                    newErrors.password = 'Debe contener una minúscula';
                } else if (!/[0-9]/.test(password)) {
                    newErrors.password = 'Debe contener un número';
                }

                if (password !== confirmPassword) {
                    newErrors.confirmPassword = 'Las contraseñas no coinciden';
                }
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // ==================== NAVEGACIÓN ====================
    const handleSiguiente = () => {
        if (validarPaso(pasoActual)) {
            setPasoActual(pasoActual + 1);
            setErrors({});
        } else {
            mostrarNotificacion('Por favor completa los campos requeridos', 'error');
        }
    };

    const handleAnterior = () => {
        setPasoActual(pasoActual - 1);
        setErrors({});
    };

    // ==================== GUARDAR ====================
    // ==================== GUARDAR ====================
    const handleGuardar = async () => {
        if (!validarPaso(2)) {
            mostrarNotificacion('Por favor completa los campos requeridos', 'error');
            return;
        }

        setGuardando(true);
        try {
            await actualizarPerfil();

            // ✅ Usar AsyncStorage en móvil, localStorage en web
            const storage = Platform.OS === 'web' ? localStorage : AsyncStorage;

            if (Platform.OS === 'web') {
                // WEB: localStorage
                const datosSesion = localStorage.getItem('@datos_sesion');
                if (datosSesion) {
                    const sesion = JSON.parse(datosSesion);
                    sesion.usuario = {
                        ...sesion.usuario,
                        username: SecurityValidator.truncateText(
                            SecurityValidator.sanitizeText(username), 50
                        ),
                        email: SecurityValidator.sanitizeText(email).toLowerCase().trim(),
                        nombre: SecurityValidator.truncateText(
                            SecurityValidator.sanitizeText(nombre), 100
                        ),
                        apellido: SecurityValidator.truncateText(
                            SecurityValidator.sanitizeText(apellido), 100
                        ),
                        telefono: telefono
                            ? SecurityValidator.sanitizeText(telefono).replace(/[-\s()]/g, '')
                            : null,
                        direccion: direccion
                            ? SecurityValidator.truncateText(SecurityValidator.sanitizeText(direccion), 200)
                            : null,
                        fecha_nacimiento: fechaNacimiento || null,
                        genero: genero ? genero.toLowerCase() : null,
                    };
                    localStorage.setItem('@datos_sesion', JSON.stringify(sesion));
                }
            } else {
                // MÓVIL: AsyncStorage
                const datosSesion = await AsyncStorage.getItem('@datos_sesion');
                if (datosSesion) {
                    const sesion = JSON.parse(datosSesion);
                    sesion.usuario = {
                        ...sesion.usuario,
                        username: SecurityValidator.truncateText(
                            SecurityValidator.sanitizeText(username), 50
                        ),
                        email: SecurityValidator.sanitizeText(email).toLowerCase().trim(),
                        nombre: SecurityValidator.truncateText(
                            SecurityValidator.sanitizeText(nombre), 100
                        ),
                        apellido: SecurityValidator.truncateText(
                            SecurityValidator.sanitizeText(apellido), 100
                        ),
                        telefono: telefono
                            ? SecurityValidator.sanitizeText(telefono).replace(/[-\s()]/g, '')
                            : null,
                        direccion: direccion
                            ? SecurityValidator.truncateText(SecurityValidator.sanitizeText(direccion), 200)
                            : null,
                        fecha_nacimiento: fechaNacimiento || null,
                        genero: genero ? genero.toLowerCase() : null,
                    };
                    await AsyncStorage.setItem('@datos_sesion', JSON.stringify(sesion));
                }
            }

            mostrarNotificacion('✅ Perfil actualizado correctamente', 'success');
            setTimeout(() => onGuardado(true), 2000);

        } catch (error) {
            console.error('❌ Error actualizando perfil:', error);
            const mensajeError = extraerMensajeError(error);
            mostrarNotificacion(mensajeError, 'error');
        } finally {
            setGuardando(false);
        }
    };

    const extraerMensajeError = (error) => {
        if (error.data?.details && Array.isArray(error.data.details)) {
            const mensajes = error.data.details
                .map(e => e.message || e.msg)
                .filter(Boolean);
            return mensajes.length > 0 ? mensajes.join('\n') : 'Error de validación';
        }
        if (error.data?.detail) return error.data.detail;
        if (error.data?.message) return error.data.message;
        if (error.message) return error.message;
        return 'Error desconocido al procesar la solicitud';
    };

    const actualizarPerfil = async () => {
        try {
            const idPersona = usuario?.persona?.id_persona;

            if (idPersona) {
                const personaData = {
                    nombre: SecurityValidator.truncateText(
                        SecurityValidator.sanitizeText(nombre), 100
                    ),
                    apellido: SecurityValidator.truncateText(
                        SecurityValidator.sanitizeText(apellido), 100
                    ),
                    telefono: telefono
                        ? SecurityValidator.sanitizeText(telefono).replace(/[-\s()]/g, '')
                        : null,
                    direccion: direccion
                        ? SecurityValidator.truncateText(SecurityValidator.sanitizeText(direccion), 200)
                        : null,
                    fecha_nacimiento: fechaNacimiento || null,
                    genero: genero ? genero.toLowerCase() : null,
                };
                await personaService.update(idPersona, personaData);
            }

            const usuarioData = {
                username: SecurityValidator.truncateText(
                    SecurityValidator.sanitizeText(username), 50
                ),
                email: SecurityValidator.sanitizeText(email).toLowerCase().trim(),
            };

            if (password && password.trim()) {
                usuarioData.password = password;
            }

            await usuarioService.update(usuario.id_usuario, usuarioData);
        } catch (error) {
            throw error;
        }
    };

    // ==================== RENDER PASOS ====================
    const renderPaso1 = () => (
        <View>
            {/* Título de sección mejorado */}
            <View style={styles.sectionHeaderContainer}>
                <LinearGradient
                    colors={['#667eea', '#764ba2']}
                    style={styles.sectionIconGradient}
                >
                    <Ionicons name="person" size={20} color="#FFFFFF" />
                </LinearGradient>
                <Text style={styles.formSectionTitle}>Información Personal</Text>
            </View>

            <View style={styles.formRow}>
                {/* Cédula */}
                <View style={styles.formColumn}>
                    <Text style={styles.label}>
                        CÉDULA <Text style={styles.labelRequired}>*</Text>
                    </Text>
                    <View style={[styles.inputContainer, styles.inputDisabled]}>
                        <Ionicons name="card-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            value={cedula}
                            editable={false}
                            placeholder="No se puede editar"
                            placeholderTextColor="#9CA3AF"
                        />
                        <Ionicons name="lock-closed" size={16} color="#9CA3AF" />
                    </View>
                    <Text style={[styles.helperText, { color: '#9CA3AF' }]}>
                        🔒 Campo protegido
                    </Text>
                </View>

                {/* Fecha Nacimiento */}
                <View style={styles.formColumn}>
                    <Text style={styles.label}>FECHA NACIMIENTO</Text>
                    <View style={styles.inputContainer}>
                        <Ionicons name="calendar-outline" size={20} color="#667eea" style={styles.inputIcon} />
                        <DateInput
                            value={fechaNacimiento}
                            onChangeText={setFechaNacimiento}
                            placeholder="dd/mm/aaaa"
                            style={styles.input}
                            containerStyle={styles.inputContainer}
                        />
                    </View>
                </View>
            </View>

            <View style={styles.formRow}>
                {/* Nombre */}
                <View style={styles.formColumn}>
                    <Text style={styles.label}>
                        NOMBRE <Text style={styles.labelRequired}>*</Text>
                    </Text>
                    <View style={[styles.inputContainer, errors.nombre && styles.inputError]}>
                        <Ionicons name="person-outline" size={20} color="#667eea" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Tu nombre"
                            placeholderTextColor="#9CA3AF"
                            value={nombre}
                            onChangeText={(text) => {
                                const limpio = SecurityValidator.sanitizeText(text).replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
                                setNombre(limpio);
                                if (errors.nombre) setErrors({ ...errors, nombre: undefined });
                            }}
                        />
                    </View>
                    {errors.nombre && <Text style={styles.errorText}>⚠️ {errors.nombre}</Text>}
                </View>

                {/* Apellido */}
                <View style={styles.formColumn}>
                    <Text style={styles.label}>
                        APELLIDO <Text style={styles.labelRequired}>*</Text>
                    </Text>
                    <View style={[styles.inputContainer, errors.apellido && styles.inputError]}>
                        <Ionicons name="person-outline" size={20} color="#667eea" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Tu apellido"
                            placeholderTextColor="#9CA3AF"
                            value={apellido}
                            onChangeText={(text) => {
                                const limpio = SecurityValidator.sanitizeText(text).replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
                                setApellido(limpio);
                                if (errors.apellido) setErrors({ ...errors, apellido: undefined });
                            }}
                        />
                    </View>
                    {errors.apellido && <Text style={styles.errorText}>⚠️ {errors.apellido}</Text>}
                </View>
            </View>

            <View style={styles.formRow}>
                {/* Teléfono */}
                <View style={styles.formColumn}>
                    <Text style={styles.label}>TELÉFONO</Text>
                    <View style={[styles.inputContainer, errors.telefono && styles.inputError]}>
                        <Ionicons name="call-outline" size={20} color="#667eea" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="0987654321"
                            placeholderTextColor="#9CA3AF"
                            value={telefono}
                            onChangeText={(text) => {
                                const limpio = SecurityValidator.sanitizeText(text).replace(/[^0-9]/g, '');
                                setTelefono(limpio);
                                if (errors.telefono) setErrors({ ...errors, telefono: undefined });
                            }}
                            keyboardType="phone-pad"
                            maxLength={15}
                        />
                    </View>
                    {errors.telefono && <Text style={styles.errorText}>⚠️ {errors.telefono}</Text>}
                </View>

                {/* Género */}
                <View style={styles.formColumn}>
                    <Text style={styles.label}>GÉNERO</Text>
                    <View style={styles.genderContainer}>
                        {[
                            { value: 'masculino', icon: '♂', label: 'MASCULINO' },
                            { value: 'femenino', icon: '♀', label: 'FEMENINO' },
                            { value: 'otro', icon: '⚧', label: 'OTRO' },
                            { value: 'prefiero_no_decir', icon: '✖', label: 'NO DECIR' }
                        ].map(g => (
                            <TouchableOpacity
                                key={g.value}
                                style={[styles.genderBtn, genero === g.value && styles.genderBtnActive]}
                                onPress={() => setGenero(g.value)}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.genderIcon}>{g.icon}</Text>
                                <Text style={[styles.genderBtnText, genero === g.value && styles.genderBtnTextActive]}>
                                    {g.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </View>

            {/* Dirección */}
            <View style={styles.formColumn}>
                <Text style={styles.label}>DIRECCIÓN</Text>
                <View style={[styles.inputContainer, errors.direccion && styles.inputError]}>
                    <Ionicons name="location-outline" size={20} color="#667eea" style={styles.inputIcon} />
                    <TextInput
                        style={styles.input}
                        placeholder="Av. Principal #123"
                        placeholderTextColor="#9CA3AF"
                        value={direccion}
                        onChangeText={(text) => {
                            setDireccion(SecurityValidator.sanitizeText(text));
                            if (errors.direccion) setErrors({ ...errors, direccion: undefined });
                        }}
                        multiline
                    />
                </View>
                {errors.direccion && <Text style={styles.errorText}>⚠️ {errors.direccion}</Text>}
            </View>
        </View>
    );

    const renderPaso2 = () => (
        <View>
            {/* Título de sección mejorado */}
            <View style={styles.sectionHeaderContainer}>
                <LinearGradient
                    colors={['#10B981', '#059669']}
                    style={styles.sectionIconGradient}
                >
                    <Ionicons name="shield-checkmark" size={20} color="#FFFFFF" />
                </LinearGradient>
                <Text style={styles.formSectionTitle}>Credenciales de Acceso</Text>
            </View>

            <View style={styles.formRow}>
                {/* Username */}
                <View style={styles.formColumn}>
                    <Text style={styles.label}>
                        USUARIO <Text style={styles.labelRequired}>*</Text>
                    </Text>
                    <View style={[styles.inputContainer, errors.username && styles.inputError]}>
                        <Ionicons name="at-outline" size={20} color="#667eea" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="usuario123"
                            placeholderTextColor="#9CA3AF"
                            value={username}
                            onChangeText={(text) => {
                                const limpio = text.toLowerCase().replace(/[^a-z0-9_-]/g, '');
                                setUsername(limpio);
                                if (errors.username) setErrors({ ...errors, username: undefined });
                            }}
                            autoCapitalize="none"
                            maxLength={50}
                        />
                    </View>
                    {errors.username && <Text style={styles.errorText}>⚠️ {errors.username}</Text>}
                </View>

                {/* Email */}
                <View style={styles.formColumn}>
                    <Text style={styles.label}>
                        EMAIL <Text style={styles.labelRequired}>*</Text>
                    </Text>
                    <View style={[styles.inputContainer, errors.email && styles.inputError]}>
                        <Ionicons name="mail-outline" size={20} color="#667eea" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="correo@ejemplo.com"
                            placeholderTextColor="#9CA3AF"
                            value={email}
                            onChangeText={(text) => {
                                setEmail(text.toLowerCase().trim());
                                if (errors.email) setErrors({ ...errors, email: undefined });
                            }}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>
                    {errors.email && <Text style={styles.errorText}>⚠️ {errors.email}</Text>}
                </View>
            </View>

            <View style={styles.formRow}>
                {/* Nueva contraseña */}
                <View style={styles.formColumn}>
                    <Text style={styles.label}>NUEVA CONTRASEÑA</Text>
                    <View style={[styles.inputContainer, errors.password && styles.inputError]}>
                        <Ionicons name="lock-closed-outline" size={20} color="#667eea" style={styles.inputIcon} />
                        <TextInput
                            style={[styles.input, { flex: 1 }]}
                            placeholder="Opcional"
                            placeholderTextColor="#9CA3AF"
                            value={password}
                            onChangeText={(text) => {
                                setPassword(text);
                                if (errors.password) setErrors({ ...errors, password: undefined });
                            }}
                            secureTextEntry={!mostrarPassword}
                        />
                        <TouchableOpacity
                            onPress={() => setMostrarPassword(!mostrarPassword)}
                            style={styles.eyeButton}
                        >
                            <Ionicons
                                name={mostrarPassword ? "eye-off-outline" : "eye-outline"}
                                size={20}
                                color="#667eea"
                            />
                        </TouchableOpacity>
                    </View>
                    {errors.password && <Text style={styles.errorText}>⚠️ {errors.password}</Text>}
                </View>

                {/* Confirmar contraseña */}
                <View style={styles.formColumn}>
                    <Text style={styles.label}>CONFIRMAR CONTRASEÑA</Text>
                    <View style={[styles.inputContainer, errors.confirmPassword && styles.inputError]}>
                        <Ionicons name="lock-closed-outline" size={20} color="#667eea" style={styles.inputIcon} />
                        <TextInput
                            style={[styles.input, { flex: 1 }]}
                            placeholder="Repetir contraseña"
                            placeholderTextColor="#9CA3AF"
                            value={confirmPassword}
                            onChangeText={(text) => {
                                setConfirmPassword(text);
                                if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: undefined });
                            }}
                            secureTextEntry={!mostrarConfirmPassword}
                        />
                        <TouchableOpacity
                            onPress={() => setMostrarConfirmPassword(!mostrarConfirmPassword)}
                            style={styles.eyeButton}
                        >
                            <Ionicons
                                name={mostrarConfirmPassword ? "eye-off-outline" : "eye-outline"}
                                size={20}
                                color="#667eea"
                            />
                        </TouchableOpacity>
                    </View>
                    {errors.confirmPassword && <Text style={styles.errorText}>⚠️ {errors.confirmPassword}</Text>}
                </View>
            </View>

            {/* Cards informativos mejorados */}
            <View style={styles.infoCardsContainer}>
                <View style={[styles.infoCard, styles.infoCardWarning]}>
                    <View style={styles.infoCardIconContainer}>
                        <Ionicons name="information-circle" size={24} color="#F59E0B" />
                    </View>
                    <Text style={styles.infoCardText}>
                        Si no deseas cambiar tu contraseña, deja los campos vacíos
                    </Text>
                </View>

                <View style={[styles.infoCard, styles.infoCardSuccess]}>
                    <View style={styles.infoCardIconContainer}>
                        <Ionicons name="shield-checkmark" size={24} color="#10B981" />
                    </View>
                    <Text style={styles.infoCardText}>
                        La contraseña debe tener: mínimo 8 caracteres, una mayúscula, una minúscula y un número
                    </Text>
                </View>
            </View>
        </View>
    );

    // ==================== RENDER PRINCIPAL ====================
    return (
        <Animated.View
            style={[
                styles.formContainer,
                {
                    opacity: fadeAnim,
                    transform: [
                        { translateY: slideAnim },
                        { scale: scaleAnim }
                    ]
                }
            ]}
        >
            <NotificationModal
                visible={modalNotification.visible}
                message={modalNotification.message}
                type={modalNotification.type}
                onClose={ocultarNotificacion}
            />

            {/* Header mejorado */}
            <View style={styles.formHeader}>
                <View style={styles.formHeaderTitle}>
                    <LinearGradient
                        colors={['#667eea', '#764ba2']}
                        style={styles.headerIconGradient}
                    >
                        <Ionicons name="create-outline" size={28} color="#FFFFFF" />
                    </LinearGradient>
                    <View>
                        <Text style={styles.formTitle}>Editar Mi Perfil</Text>
                        <Text style={styles.pasoIndicador}>
                            Paso {pasoActual} de 2 • {pasoActual === 1 ? 'Información Personal' : 'Credenciales'}
                        </Text>
                    </View>
                </View>
                <TouchableOpacity style={styles.btnCerrar} onPress={onCerrar} activeOpacity={0.7}>
                    <Ionicons name="close-circle" size={32} color="#c7d2fe" />
                </TouchableOpacity>
            </View>

            {/* Stepper mejorado */}
            <View style={styles.stepperContainer}>
                {[1, 2].map((paso, index) => (
                    <React.Fragment key={paso}>
                        <View style={styles.stepWrapper}>
                            <View style={[
                                styles.stepCircle,
                                pasoActual === paso && styles.stepCircleActive,
                                pasoActual > paso && styles.stepCircleCompleted
                            ]}>
                                {pasoActual > paso ? (
                                    <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                                ) : (
                                    <Text style={[
                                        styles.stepNumber,
                                        pasoActual === paso && styles.stepNumberActive
                                    ]}>
                                        {paso}
                                    </Text>
                                )}
                            </View>
                            <Text style={[
                                styles.stepLabel,
                                (pasoActual === paso || pasoActual > paso) && styles.stepLabelActive
                            ]}>
                                {paso === 1 ? 'Personal' : 'Credenciales'}
                            </Text>
                        </View>
                        {index < 1 && (
                            <View style={[
                                styles.stepLine,
                                pasoActual > paso && styles.stepLineActive
                            ]} />
                        )}
                    </React.Fragment>
                ))}
            </View>

            {/* Contenido */}
            <ScrollView
                style={styles.formContent}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 20 }}
            >
                {pasoActual === 1 && renderPaso1()}
                {pasoActual === 2 && renderPaso2()}
            </ScrollView>

            {/* Botones mejorados */}
            <View style={styles.actionsContainer}>
                {pasoActual > 1 && (
                    <TouchableOpacity
                        style={styles.btnSecundario}
                        onPress={handleAnterior}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="arrow-back" size={isMobile ? 18 : 20} color="#667eea" />
                        <Text style={styles.btnSecundarioText}>{isMobile ? 'ATRÁS' : 'ANTERIOR'}</Text>
                    </TouchableOpacity>
                )}

                <View style={{ flex: 1 }} />

                <TouchableOpacity
                    style={styles.btnCancelar}
                    onPress={onCerrar}
                    activeOpacity={0.7}
                >
                    <Ionicons name="close" size={isMobile ? 18 : 20} color="#FCA5A5" />
                    <Text style={styles.btnCancelarText}>CANCELAR</Text>
                </TouchableOpacity>

                {pasoActual < 2 ? (
                    <TouchableOpacity onPress={handleSiguiente} activeOpacity={0.85}>
                        <LinearGradient
                            colors={['#667eea', '#764ba2']}
                            style={styles.btnPrimario}
                        >
                            <Text style={styles.btnPrimarioText}>SIGUIENTE</Text>
                            <Ionicons name="arrow-forward" size={isMobile ? 18 : 20} color="#FFFFFF" />
                        </LinearGradient>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        onPress={handleGuardar}
                        disabled={guardando}
                        activeOpacity={0.85}
                    >
                        <LinearGradient
                            colors={guardando ? ['#6B7280', '#4B5563'] : ['#10B981', '#059669']}
                            style={[styles.btnPrimario, guardando && styles.btnGuardarDisabled]}
                        >
                            {guardando ? (
                                <>
                                    <ActivityIndicator size="small" color="#FFFFFF" />
                                    <Text style={styles.btnPrimarioText}>{isMobile ? 'GUARDANDO...' : 'GUARDANDO...'}</Text>
                                </>
                            ) : (
                                <>
                                    <Ionicons name="checkmark-circle" size={isMobile ? 18 : 20} color="#FFFFFF" />
                                    <Text style={styles.btnPrimarioText}>{isMobile ? 'GUARDAR' : 'GUARDAR CAMBIOS'}</Text>
                                </>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>
                )}
            </View>
        </Animated.View>
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
                borderColor: '#EF4444',
            };
        }
        return {
            icon: 'checkmark-circle',
            iconColor: '#FFFFFF',
            bgGradient: ['#10B981', '#059669'],
            borderColor: '#10B981',
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
                    style={styles.notificationContainer}
                >
                    <View style={styles.notificationIconContainer}>
                        <Ionicons name={config.icon} size={32} color={config.iconColor} />
                    </View>
                    <Text style={styles.notificationMessage}>{message}</Text>
                    <TouchableOpacity onPress={onClose} style={styles.notificationCloseBtn}>
                        <Ionicons name="close" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                </LinearGradient>
            </Animated.View>
        </View>
    );
};

export default GestionPerfilCard;
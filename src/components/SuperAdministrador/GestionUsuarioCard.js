import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { personaService } from '../../api/services/personaService';
import { usuarioRolService } from '../../api/services/usuarioRolService';
import { usuarioService } from '../../api/services/usuarioService';

import { cedulaService } from '../../api/services/cedulaService';
import { getUserIdFromToken } from '../../components/utils/authHelper';
import SecurityValidator from '../../components/utils/SecurityValidator';
import { styles } from '../../styles/GestionUsuariosStyles';
import DateInput from '../common/DateInput';
import Toast from '../common/Toast';


const GestionUsuarioCard = ({ usuario, roles, onCerrar, onGuardado }) => {

  // ==================== ESTADOS ====================
  const [pasoActual, setPasoActual] = useState(1); 
  const [guardando, setGuardando] = useState(false);
  const [errors, setErrors] = useState({});
  
  // Al inicio del componente, después de los otros estados
  const [toast, setToast] = useState({ visible: false, message: '', type: 'error' });
  const [consultandoCedula, setConsultandoCedula] = useState(false);
  const [cedulaConsultada, setCedulaConsultada] = useState(false);

  const mostrarToast = (message, type = 'error') => {
    setToast({ visible: true, message, type });
  };

  const ocultarToast = () => {
    setToast({ visible: false, message: '', type: 'error' });
  };
  
  // Datos de Persona (Paso 1 y 2)
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [cedula, setCedula] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  const [genero, setGenero] = useState('');
  const [mostrarCalendario, setMostrarCalendario] = useState(false);
  const [tipoPersona, setTipoPersona] = useState('');
  
  // Datos de Usuario (Paso 3)
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Datos de Roles (Paso 4)
  const [rolesSeleccionados, setRolesSeleccionados] = useState([]);
  const [estado, setEstado] = useState('activo');

  // ==================== ANIMACIONES ====================
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(100)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    if (usuario) {
      setNombre(usuario.persona?.nombre || '');
      setApellido(usuario.persona?.apellido || '');
      setCedula(usuario.persona?.cedula || '');
      setTelefono(usuario.persona?.telefono || '');
      setDireccion(usuario.persona?.direccion || '');

      // ✅ AGREGAR ESTOS CAMPOS
      setFechaNacimiento(usuario.persona?.fecha_nacimiento || '');
      setGenero(usuario.persona?.genero || '');
      setTipoPersona(usuario.persona?.tipo_persona || '');

      setUsername(usuario.username || '');
      setEmail(usuario.email || '');
      setEstado(usuario.estado || 'activo');
      setRolesSeleccionados(usuario.roles?.map(r => r.id_rol) || []);
    }
  }, [usuario]);


  const handleFechaSeleccionada = (event, selectedDate) => {
    setMostrarCalendario(false);
    if (selectedDate) {
      const año = selectedDate.getFullYear();
      const mes = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const dia = String(selectedDate.getDate()).padStart(2, '0');
      setFechaNacimiento(`${año}-${mes}-${dia}`);
    }
  };


  // ==================== CONSULTA DE CÉDULA ====================
// ==================== CONSULTA DE CÉDULA ====================
  const consultarCedula = async () => {
    const cedulaLimpia = SecurityValidator.sanitizeText(cedula).replace(/[^0-9]/g, '');
    
    if (cedulaLimpia.length !== 10) {
      mostrarToast('Ingresa los 10 dígitos de la cédula primero', 'warning');
      return;
    }

    setConsultandoCedula(true);
    
    try {
      // ✅ LLAMAR DIRECTAMENTE AL SERVICIO
      const data = await cedulaService.consultarCedula(cedulaLimpia);
      
      if (!Array.isArray(data) || data.length === 0) {
        throw new Error('No se encontró información para esta cédula');
      }
      
      const persona = data[0];
      
      // ✅ CONCATENAR NOMBRES
      const nombreCompleto = [
        SecurityValidator.sanitizeText(persona.primer_nombre || ''),
        SecurityValidator.sanitizeText(persona.segundo_nombre || '')
      ].filter(Boolean).join(' ');
      
      // ✅ CONCATENAR APELLIDOS
      const apellidoCompleto = [
        SecurityValidator.sanitizeText(persona.primer_apellido || ''),
        SecurityValidator.sanitizeText(persona.segundo_apellido || '')
      ].filter(Boolean).join(' ');
      
      // Llenar campos
      setNombre(nombreCompleto);
      setApellido(apellidoCompleto);
      setTelefono(SecurityValidator.sanitizeText(persona.celular || ''));
      setDireccion(SecurityValidator.sanitizeText(persona.direccion || ''));
      
      if (persona.correo) {
        setEmail(SecurityValidator.sanitizeText(persona.correo).toLowerCase());
      }
      
      setCedulaConsultada(true);
      mostrarToast('✅ Datos cargados correctamente', 'success');
      setErrors({});
      
    } catch (error) {
      console.error('Error consultando cédula:', error);
      mostrarToast(error.message || 'Error al consultar la cédula', 'error');
    } finally {
      setConsultandoCedula(false);
    }
  };
  // ==================== VALIDACIÓN POR PASO ====================
  const validarPaso = (paso) => {
    const newErrors = {};

    if (paso === 1) {
      // Sanitizar y truncar
      const nombreLimpio = SecurityValidator.truncateText(
        SecurityValidator.sanitizeText(nombre), 
        100
      );
      const apellidoLimpio = SecurityValidator.truncateText(
        SecurityValidator.sanitizeText(apellido), 
        100
      );
      const cedulaLimpia = SecurityValidator.sanitizeText(cedula).replace(/[-\s]/g, '');
      
      // Validaciones existentes...
      if (!cedulaLimpia) {
        newErrors.cedula = 'La cédula es requerida';
      } else if (cedulaLimpia.length !== 10 || !/^\d{10}$/.test(cedulaLimpia)) {
        newErrors.cedula = 'La cédula debe tener exactamente 10 dígitos';
      }
      
      if (!nombreLimpio.trim()) newErrors.nombre = 'El nombre es requerido';
      if (nombreLimpio.length < 2) newErrors.nombre = 'Mínimo 2 caracteres';
      
      if (!apellidoLimpio.trim()) newErrors.apellido = 'El apellido es requerido';
      if (apellidoLimpio.length < 2) newErrors.apellido = 'Mínimo 2 caracteres';
      
      // Validar teléfono
      if (telefono.trim()) {
        const telefonoLimpio = SecurityValidator.sanitizeText(telefono).replace(/[-\s()]/g, '');
        if (telefonoLimpio.length < 7 || telefonoLimpio.length > 15 || !/^\d+$/.test(telefonoLimpio)) {
          newErrors.telefono = 'Teléfono inválido (7-15 dígitos)';
        }
      }
      
      // Validar dirección si existe
      if (direccion.trim() && direccion.length > 200) {
        newErrors.direccion = 'Máximo 200 caracteres';
      }
    }

    if (paso === 2) {
      if (!tipoPersona) {
        newErrors.tipoPersona = 'Selecciona el tipo de persona';
      } else {
        const tiposValidos = ['docente', 'administrativo', 'estudiante', 'externo'];
        if (!tiposValidos.includes(tipoPersona.toLowerCase())) {
          newErrors.tipoPersona = 'Tipo de persona inválido';
        }
      }
    }

    if (paso === 3) {
      const usernameLimpio = SecurityValidator.truncateText(
        SecurityValidator.sanitizeText(username), 
        50
      );
      const emailLimpio = SecurityValidator.sanitizeText(email).toLowerCase().trim();
      
      if (!usernameLimpio.trim()) newErrors.username = 'El usuario es requerido';
      if (usernameLimpio.length < 4) newErrors.username = 'Mínimo 4 caracteres';
      
      if (!emailLimpio.trim()) newErrors.email = 'El email es requerido';
      if (!SecurityValidator.isValidEmail(emailLimpio)) {
        newErrors.email = 'Email inválido';
      }

      
      if (!usuario) {
        if (!password) {
          newErrors.password = 'La contraseña es requerida';
        } else {
          if (password.length < 8) {
            newErrors.password = 'Mínimo 8 caracteres';
          } else if (!/[A-Z]/.test(password)) {
            newErrors.password = 'Debe contener una mayúscula';
          } else if (!/[a-z]/.test(password)) {
            newErrors.password = 'Debe contener una minúscula';
          } else if (!/[0-9]/.test(password)) {
            newErrors.password = 'Debe contener un número';
          }
        }
        if (password !== confirmPassword) {
          newErrors.confirmPassword = 'Las contraseñas no coinciden';
        }
      }
    }

    if (paso === 4) {
      if (rolesSeleccionados.length === 0) {
        newErrors.roles = 'Selecciona al menos un rol';
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
      mostrarToast('Por favor completa los campos requeridos', 'warning');
    }
  };

  const handleAnterior = () => {
    setPasoActual(pasoActual - 1);
    setErrors({});
  };

  // ==================== GUARDAR ====================
  const handleGuardar = async () => {
    if (!validarPaso(4)) {
      mostrarToast('Por favor selecciona al menos un rol', 'warning');
      return;
    }

    setGuardando(true);
    try {
      if (usuario) {
        await actualizarUsuario();
      } else {
        await crearUsuario();
      }
      
      mostrarToast(
        usuario ? '✅ Usuario actualizado correctamente' : '✅ Usuario creado exitosamente',
        'success'
      );
      
      setTimeout(() => {
        onGuardado(true);
      }, 1500);
    } catch (error) {
      mostrarToast(error.message || 'No se pudo guardar el usuario', 'error');
      onGuardado(false);
    } finally {
      setGuardando(false);
    }
  };



const crearUsuario = async () => {
  try {
    const idUsuario = await getUserIdFromToken();

    const cedulaLimpia = SecurityValidator.sanitizeText(cedula).replace(/[-\s]/g, '');
    const telefonoLimpio = telefono ? 
      SecurityValidator.sanitizeText(telefono).replace(/[-\s()]/g, '') : null;
    const nombreLimpio = SecurityValidator.truncateText(
      SecurityValidator.sanitizeText(nombre), 100
    );
    const apellidoLimpio = SecurityValidator.truncateText(
      SecurityValidator.sanitizeText(apellido), 100
    );
    const direccionLimpia = direccion ? 
      SecurityValidator.truncateText(SecurityValidator.sanitizeText(direccion), 200) : null;
    const usernameLimpio = SecurityValidator.truncateText(
      SecurityValidator.sanitizeText(username), 50
    );
    const emailLimpio = SecurityValidator.sanitizeText(email).toLowerCase().trim();


    // ✅ USAR createCompleto (transacción atómica)
    const usuarioCompletoData = {
      username: usernameLimpio,
      email: emailLimpio,
      password: password, // NO sanitizar passwords
      estado: estado,
      creado_por: idUsuario,
      persona: {
        cedula: cedulaLimpia,
        nombre: nombreLimpio,
        apellido: apellidoLimpio,
        fecha_nacimiento: fechaNacimiento || null,
        genero: genero ? genero.toLowerCase() : null,
        telefono: telefonoLimpio,
        direccion: direccionLimpia,
        tipo_persona: tipoPersona.toLowerCase(),
        celular: null,
        email_personal: email.trim().toLowerCase(),
        ciudad: null,
        provincia: null,
        id_departamento: null,
        cargo: null,
        fecha_ingreso_institucion: null,
        contacto_emergencia_nombre: null,
        contacto_emergencia_telefono: null,
        contacto_emergencia_relacion: null,
        foto_perfil: null
      },
      roles: rolesSeleccionados
    };

    // ✅ LLAMADA A createCompleto (NO personaService.create)
    const response = await usuarioService.createCompleto(usuarioCompletoData);
    return response;

  } catch (error) {
    let mensajeError = 'Error desconocido';
    
    if (error.data?.details && Array.isArray(error.data.details) && error.data.details.length > 0) {
      const errores = error.data.details.map(e => e.message || e.msg).filter(Boolean);
      mensajeError = errores.join('\n');
    } 
    else if (error.data?.detail) {
      mensajeError = error.data.detail;
    }
    else if (error.data?.message) {
      mensajeError = error.data.message;
    }
    else if (error.message) {
      mensajeError = error.message;
    }
    
    throw new Error(mensajeError);
  }
};

  /// =================== ACTUALIZAR USUARIO ====================

const actualizarUsuario = async () => {
  try {
    // ========== 1. ACTUALIZAR PERSONA ==========
    if (usuario.id_persona) {
      const cedulaLimpia = SecurityValidator.sanitizeText(cedula).replace(/[-\s]/g, '');
      const telefonoLimpio = telefono ? 
        SecurityValidator.sanitizeText(telefono).replace(/[-\s()]/g, '') : null;
      const nombreLimpio = SecurityValidator.truncateText(
        SecurityValidator.sanitizeText(nombre), 100
      );
      const apellidoLimpio = SecurityValidator.truncateText(
        SecurityValidator.sanitizeText(apellido), 100
      );
      const direccionLimpia = direccion ? 
        SecurityValidator.truncateText(SecurityValidator.sanitizeText(direccion), 200) : null;

      const personaData = {
        nombre: nombreLimpio,
        apellido: apellidoLimpio,
        cedula: cedulaLimpia,
        telefono: telefonoLimpio,
        direccion: direccionLimpia,
        fecha_nacimiento: fechaNacimiento || null,
        genero: genero ? genero.toLowerCase() : null,
        tipo_persona: tipoPersona ? tipoPersona.toLowerCase() : null
      };
      
      await personaService.update(usuario.id_persona, personaData);
    }

    // ========== 2. ACTUALIZAR USUARIO ==========
    const usernameLimpio = SecurityValidator.truncateText(
      SecurityValidator.sanitizeText(username), 50
    );
    const emailLimpio = SecurityValidator.sanitizeText(email).toLowerCase().trim();
    

    const usuarioData = {
      username: usernameLimpio,
      email: emailLimpio,
      estado: estado
    };
    
    // Solo incluir password si se cambió
    if (password && password.trim()) {
      usuarioData.password = password;
    }

    await usuarioService.update(usuario.id_usuario, usuarioData);

    // ========== 3. ACTUALIZAR ROLES ==========
    const rolesActuales = usuario.roles?.map(r => r.id_rol) || [];
    const rolesAEliminar = rolesActuales.filter(r => !rolesSeleccionados.includes(r));
    const rolesAAgregar = rolesSeleccionados.filter(r => !rolesActuales.includes(r));

    // Revocar roles que ya no están seleccionados
    for (const id_rol of rolesAEliminar) {
      await usuarioRolService.revocarRol(usuario.id_usuario, id_rol);
    }

    // Asignar nuevos roles
    for (const id_rol of rolesAAgregar) {
      await usuarioRolService.asignarRol(usuario.id_usuario, id_rol);
    }

  } catch (error) {
    // Extraer mensaje del backend
    let mensajeError = 'Error al actualizar usuario';
    
    if (error.data?.details && Array.isArray(error.data.details) && error.data.details.length > 0) {
      const errores = error.data.details.map(e => e.message || e.msg).filter(Boolean);
      mensajeError = errores.join('\n');
    } 
    else if (error.data?.detail) {
      mensajeError = error.data.detail;
    }
    else if (error.data?.message) {
      mensajeError = error.data.message;
    }
    else if (error.message) {
      mensajeError = error.message;
    }
    
    throw new Error(mensajeError);
  }
};


  const toggleRol = (rolId) => {
    if (rolesSeleccionados.includes(rolId)) {
      setRolesSeleccionados(rolesSeleccionados.filter(r => r !== rolId));
    } else {
      setRolesSeleccionados([...rolesSeleccionados, rolId]);
    }
    
    if (errors.roles) {
      setErrors({ ...errors, roles: undefined });
    }
  };

  // ==================== RENDER PASOS ====================
  const renderPaso1 = () => (
    <View>
      <Text style={styles.sectionTitle}>📋 Información Personal Básica</Text>

      <View style={styles.formRow}>



    <View style={styles.formColumn}>
      <Text style={styles.label}>
        CÉDULA <Text style={styles.labelRequired}>*</Text>
      </Text>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <View style={[
          styles.inputContainer, 
          errors.cedula && styles.inputError,
          { flex: 1 }
        ]}>
          <Ionicons name="card-outline" size={20} color="#667eea" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="10 dígitos (ej: 0102417144)"
            placeholderTextColor="#9CA3AF"
            value={cedula}
            onChangeText={(text) => {
              const limpio = SecurityValidator.sanitizeText(text).replace(/[^0-9]/g, '');
              setCedula(limpio);
              setCedulaConsultada(false); // Reset al cambiar
              if (errors.cedula) setErrors({...errors, cedula: undefined});
            }}
            keyboardType="numeric"
            maxLength={10}
            editable={!usuario} // Solo editable en modo crear
          />
        </View>
        
        {/* ✅ BOTÓN DE CONSULTA */}
        {!usuario && cedula.length === 10 && !cedulaConsultada && (
          <TouchableOpacity
            style={{
              backgroundColor: '#667eea',
              paddingHorizontal: 16,
              paddingVertical: 12,
              borderRadius: 8,
              justifyContent: 'center',
              alignItems: 'center',
              minWidth: 100,
            }}
            onPress={consultarCedula}
            disabled={consultandoCedula}
            activeOpacity={0.7}
          >
            {consultandoCedula ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={{ color: '#FFFFFF', fontWeight: '600', fontSize: 14 }}>
                CONSULTAR
              </Text>
            )}
          </TouchableOpacity>
        )}
        
        {/* ✅ INDICADOR DE CONSULTADO */}
        {cedulaConsultada && (
          <View style={{
            backgroundColor: '#10b981',
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderRadius: 8,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
          </View>
        )}
      </View>
      {errors.cedula && <Text style={styles.errorText}>{errors.cedula}</Text>}
      
      {/* ✅ MENSAJE INFORMATIVO */}
      {!usuario && !cedulaConsultada && cedula.length === 10 && (
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginTop: 8,
          padding: 8,
          backgroundColor: '#EFF6FF',
          borderRadius: 8,
        }}>
          <Ionicons name="information-circle" size={16} color="#667eea" />
          <Text style={{ marginLeft: 6, fontSize: 12, color: '#667eea' }}>
            Presiona CONSULTAR para cargar datos automáticamente
          </Text>
        </View>
      )}
    </View>

        <View style={styles.formColumn}>
          <Text style={styles.label}>FECHA NACIMIENTO</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="calendar-outline" size={20} color="#667eea" style={styles.inputIcon} />
            <DateInput
              value={fechaNacimiento}
              onChangeText={setFechaNacimiento}
              placeholder="Seleccionar fecha"
              style={styles.input}
              containerStyle={styles.inputContainer}
            />
          </View>
        </View>
      </View>

      <View style={styles.formRow}>
        <View style={styles.formColumn}>
          <Text style={styles.label}>
            NOMBRE <Text style={styles.labelRequired}>*</Text>
          </Text>
          <View style={[styles.inputContainer, errors.nombre && styles.inputError]}>
            <Ionicons name="person-outline" size={20} color="#667eea" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Solo letras (ej: María)"
              placeholderTextColor="#9CA3AF"
              value={nombre}
              onChangeText={(text) => {
                const limpio = SecurityValidator.sanitizeText(text).replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');

                setNombre(limpio);
                if (errors.nombre) setErrors({...errors, nombre: undefined});
              }}
            />
          </View>
          {errors.nombre && <Text style={styles.errorText}>{errors.nombre}</Text>}
        </View>

        <View style={styles.formColumn}>
          <Text style={styles.label}>
            APELLIDO <Text style={styles.labelRequired}>*</Text>
          </Text>
          <View style={[styles.inputContainer, errors.apellido && styles.inputError]}>
            <Ionicons name="person-outline" size={20} color="#667eea" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Solo letras (ej: Pérez)"
              placeholderTextColor="#9CA3AF"
              value={apellido}
              onChangeText={(text) => {
                const limpio = SecurityValidator.sanitizeText(text).replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');

                setApellido(limpio);
                if (errors.apellido) setErrors({...errors, apellido: undefined});
              }}
            />
          </View>
          {errors.apellido && <Text style={styles.errorText}>{errors.apellido}</Text>}
        </View>
      </View>

      <View style={styles.formRow}>
        <View style={styles.formColumn}>
          <Text style={styles.label}>TELÉFONO</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="call-outline" size={20} color="#667eea" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="7-15 dígitos (ej: 0987654321)"
              placeholderTextColor="#9CA3AF"
              value={telefono}
              onChangeText={(text) => {
                const limpio = SecurityValidator.sanitizeText(text).replace(/[^0-9]/g, '');
                setTelefono(limpio);
              }}
              keyboardType="phone-pad"
              maxLength={15}
            />
          </View>
        </View>

        <View style={styles.formColumn}>
          <Text style={styles.label}>DIRECCIÓN</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="location-outline" size={20} color="#667eea" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Calle principal #123"
              placeholderTextColor="#9CA3AF"
              value={direccion}
              onChangeText={(text) => {
                setDireccion(SecurityValidator.sanitizeText(text));
              }}
            />
          </View>
        </View>
      </View>
    </View>
  );

  const renderPaso2 = () => (
    <View>
      <Text style={styles.sectionTitle}>ℹ️ Información Adicional</Text>

      <View style={styles.formRow}>
        <View style={styles.formColumn}>
          <Text style={styles.label}>GÉNERO</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="transgender-outline" size={20} color="#667eea" style={styles.inputIcon} />
            <View style={styles.pickerContainer}>
              {['masculino', 'femenino', 'otro', 'prefiero_no_decir'].map(g => (
                <TouchableOpacity
                  key={g}
                  style={[styles.genderBtn, genero === g && styles.genderBtnActive]}
                  onPress={() => setGenero(g)}
                >
                  <Text style={[styles.genderBtnText, genero === g && styles.genderBtnTextActive]}>
                    {g.replace('_', ' ').toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.formColumn}>
          <Text style={styles.label}>
            TIPO PERSONA <Text style={styles.labelRequired}>*</Text>
          </Text>
          <View style={[styles.inputContainer, errors.tipoPersona && styles.inputError]}>
            <Ionicons name="briefcase-outline" size={20} color="#667eea" style={styles.inputIcon} />
            <View style={styles.pickerContainer}>
              {['docente', 'administrativo', 'estudiante', 'externo'].map(tipo => (
                <TouchableOpacity
                  key={tipo}
                  style={[styles.tipoBtn, tipoPersona === tipo && styles.tipoBtnActive]}
                  onPress={() => {
                    setTipoPersona(tipo);
                    if (errors.tipoPersona) setErrors({...errors, tipoPersona: undefined});
                  }}
                >
                  <Text style={[styles.tipoBtnText, tipoPersona === tipo && styles.tipoBtnTextActive]}>
                    {tipo.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          {errors.tipoPersona && <Text style={styles.errorText}>{errors.tipoPersona}</Text>}
        </View>
      </View>

      <View style={styles.infoCard}>
        <Ionicons name="information-circle" size={20} color="#667eea" />
        <Text style={styles.infoCardText}>
          Tipos válidos: docente, administrativo, estudiante, externo
        </Text>
      </View>
    </View>
  );

  const renderPaso3 = () => (
    <View>
      <Text style={styles.sectionTitle}>🔐 Credenciales de Acceso</Text>

      <View style={styles.formRow}>
        <View style={styles.formColumn}>
          <Text style={styles.label}>
            USUARIO <Text style={styles.labelRequired}>*</Text>
          </Text>
          <View style={[styles.inputContainer, errors.username && styles.inputError]}>
            <Ionicons name="at-outline" size={20} color="#667eea" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="4-50 caracteres (ej: juan_perez)"
              placeholderTextColor="#9CA3AF"
              value={username}
              onChangeText={(text) => {
                const limpio = text.toLowerCase().replace(/[^a-z0-9_-]/g, '');
                setUsername(limpio);
                if (errors.username) setErrors({...errors, username: undefined});
              }}
              autoCapitalize="none"
              maxLength={50}
            />
          </View>
          {errors.username && <Text style={styles.errorText}>{errors.username}</Text>}
        </View>

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
                if (errors.email) setErrors({...errors, email: undefined});
              }}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
        </View>
      </View>

      <View style={styles.formRow}>
        <View style={styles.formColumn}>
          <Text style={styles.label}>
            CONTRASEÑA {!usuario && <Text style={styles.labelRequired}>*</Text>}
          </Text>
          <View style={[styles.inputContainer, errors.password && styles.inputError]}>
            <Ionicons name="lock-closed-outline" size={20} color="#667eea" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Mínimo 8 caracteres"
              placeholderTextColor="#9CA3AF"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (errors.password) setErrors({...errors, password: undefined});
              }}
              secureTextEntry
            />
          </View>
          {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
        </View>

        <View style={styles.formColumn}>
          <Text style={styles.label}>
            CONFIRMAR {!usuario && <Text style={styles.labelRequired}>*</Text>}
          </Text>
          <View style={[styles.inputContainer, errors.confirmPassword && styles.inputError]}>
            <Ionicons name="lock-closed-outline" size={20} color="#667eea" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Repetir contraseña"
              placeholderTextColor="#9CA3AF"
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                if (errors.confirmPassword) setErrors({...errors, confirmPassword: undefined});
              }}
              secureTextEntry
            />
          </View>
          {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
        </View>
      </View>

      <View style={styles.infoCard}>
        <Ionicons name="shield-checkmark" size={20} color="#667eea" />
        <Text style={styles.infoCardText}>
          La contraseña debe tener mínimo 8 caracteres, una mayúscula, una minúscula y un número
        </Text>
      </View>
    </View>
  );

  const renderPaso4 = () => (
    <View>
      <Text style={styles.sectionTitle}>👥 Asignación de Roles</Text>

      {errors.roles && (
        <View style={styles.infoCardError}>
          <Text style={styles.infoCardText}>{errors.roles}</Text>
        </View>
      )}

      {(!roles || roles.length === 0) ? (
        <View style={styles.infoCard}>
          <Ionicons name="alert-circle" size={20} color="#F59E0B" />
          <Text style={styles.infoCardText}>
            ⚠️ No hay roles disponibles. Verifica la conexión con el servidor.
          </Text>
        </View>
      ) : (
        <View style={styles.rolesGrid}>
          {roles.map((rol) => {
            const rolId = rol.id_rol;
            return (
              <RoleCard
                key={rolId}
                rol={rol}
                rolId={rolId}
                selected={rolesSeleccionados.includes(rolId)}
                onToggle={() => toggleRol(rolId)}
              />
            );
          })}
        </View>
      )}
    </View>
  );

  // ==================== RENDER PRINCIPAL ====================
  return (
    <Animated.View 
      style={[
        styles.cardContainer,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
      ]}
    >
      {/* Toast de notificaciones */}
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={ocultarToast}
      />

      

      {/* Header con Stepper */}
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderTitle}>
          <LinearGradient
            colors={usuario ? ['#667eea', '#764ba2'] : ['#10B981', '#059669']}
            style={{ borderRadius: 14, padding: 10 }}
          >
            <Ionicons 
              name={usuario ? "create-outline" : "person-add-outline"} 
              size={24} 
              color="#FFFFFF" 
            />
          </LinearGradient>
          <View>
            <Text style={styles.cardTitle}>
              {usuario ? 'Editar Usuario' : 'Nuevo Usuario'}
            </Text>
            <Text style={styles.pasoIndicador}>Paso {pasoActual} de 4</Text>
          </View>
        </View>
<TouchableOpacity style={styles.btnCerrar} onPress={onCerrar}>
          <Ionicons name="close" size={24} color="#c7d2fe" />
        </TouchableOpacity>
      </View>


      {/* Stepper Visual */}
      <View style={styles.stepperContainer}>
        {[1, 2, 3, 4].map((paso, index) => (
          <React.Fragment key={paso}>
            <View style={styles.stepWrapper}>
              <View style={[
                styles.stepCircle,
                pasoActual === paso && styles.stepCircleActive,
                pasoActual > paso && styles.stepCircleCompleted
              ]}>
                <Text style={[
                  styles.stepNumber,
                  (pasoActual === paso || pasoActual > paso) && styles.stepNumberActive
                ]}>
                  {pasoActual > paso ? '✓' : paso}
                </Text>
              </View>
            </View>
            {index < 3 && <View style={styles.stepLine} />}
          </React.Fragment>
        ))}
      </View>

      {/* Contenido del Paso Actual */}
      <ScrollView 
        style={styles.cardContent}
        showsVerticalScrollIndicator={false}
      >
        {pasoActual === 1 && renderPaso1()}
        {pasoActual === 2 && renderPaso2()}
        {pasoActual === 3 && renderPaso3()}
        {pasoActual === 4 && renderPaso4()}
      </ScrollView>

      {/* Botones de Navegación */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity 
          style={styles.btnCancelar}
          onPress={onCerrar}
          activeOpacity={0.85}
        >
          <Text style={styles.btnCancelarText}>CANCELAR</Text>
        </TouchableOpacity>





        <View style={{ flexDirection: 'row', gap: 12 }}>
          {pasoActual > 1 && (
            <TouchableOpacity 
              style={styles.btnAnterior}
              onPress={handleAnterior}
              activeOpacity={0.85}
            >
              <Text style={styles.btnAnteriorText}>ANTERIOR</Text>
            </TouchableOpacity>
          )}

          {pasoActual < 4 ? (
            <TouchableOpacity 
              onPress={handleSiguiente}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.btnGuardar}
              >
                <Text style={styles.btnGuardarText}>SIGUIENTE</Text>
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
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.btnGuardar, guardando && styles.btnGuardarDisabled]}
              >
                <Text style={styles.btnGuardarText}>
                  {guardando ? 'GUARDANDO...' : 'GUARDAR USUARIO'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>
      </View>

    </Animated.View>
  );
};

// ==================== COMPONENTE: ROLE CARD ====================
const RoleCard = ({ rol, rolId, selected, onToggle }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    onToggle();
  };

  const getRolGradient = (nombre) => {
    const nombreLower = (nombre || '').toLowerCase();
    if (nombreLower.includes('super')) return ['#F59E0B', '#D97706'];
    if (nombreLower.includes('administrador')) return ['#6366F1', '#4F46E5'];
    if (nombreLower.includes('funcionario')) return ['#10B981', '#059669'];
    return ['#6B7280', '#4B5563'];
  };

  const getRolIcon = (nombre) => {
    const nombreLower = (nombre || '').toLowerCase();
    if (nombreLower.includes('super')) return 'shield-checkmark';
    if (nombreLower.includes('administrador')) return 'person-circle';
    if (nombreLower.includes('funcionario')) return 'people';
    return 'person';
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity 
        style={[styles.roleCard, selected && styles.roleCardSelected]}
        onPress={handlePress}
        activeOpacity={0.9}
      >
        <View style={styles.roleHeader}>
          <LinearGradient
            colors={getRolGradient(rol.nombre_rol)}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.roleIcon}
          >
            <Ionicons name={getRolIcon(rol.nombre_rol)} size={28} color="#FFFFFF" />
          </LinearGradient>
          <Text style={styles.roleName}>{rol.nombre_rol}</Text>
          {selected && <Ionicons name="checkmark-circle" size={28} color="#667eea" />}
        </View>
        <Text style={styles.roleDescription}>{rol.descripcion}</Text>
        <Text style={styles.roleNivel}>Nivel: {rol.nivel_jerarquia || rol.nivel_acceso || 'N/A'}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default GestionUsuarioCard;

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
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

import { styles } from '../../styles/GestionUsuariosStyles';
import DateInput from '../common/DateInput';


const GestionUsuarioCard = ({ usuario, roles, onCerrar, onGuardado }) => {

    console.log('🎭 Roles recibidos en Card:', roles);
  console.log('🎭 Total roles:', roles?.length || 0);
  // ==================== ESTADOS ====================
  const [pasoActual, setPasoActual] = useState(1); 
  const [guardando, setGuardando] = useState(false);
  const [errors, setErrors] = useState({});
  
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

  // ==================== VALIDACIÓN POR PASO ====================
  const validarPaso = (paso) => {
  const newErrors = {};

  if (paso === 1) {
  // Validar cédula (10 dígitos)
  const cedulaLimpia = cedula.trim().replace(/[-\s]/g, '');
  if (!cedulaLimpia) {
    newErrors.cedula = 'La cédula es requerida';
  } else if (cedulaLimpia.length !== 10 || !/^\d{10}$/.test(cedulaLimpia)) {
    newErrors.cedula = 'La cédula debe tener exactamente 10 dígitos';
  }
  
  if (!nombre.trim()) newErrors.nombre = 'El nombre es requerido';
  if (!apellido.trim()) newErrors.apellido = 'El apellido es requerido';
  
  // Validar teléfono si existe
  if (telefono.trim()) {
    const telefonoLimpio = telefono.trim().replace(/[-\s()]/g, '');
    if (telefonoLimpio.length < 7 || telefonoLimpio.length > 15 || !/^\d+$/.test(telefonoLimpio)) {
      newErrors.telefono = 'Teléfono inválido (7-15 dígitos)';
    }
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
  if (!username.trim()) newErrors.username = 'El usuario es requerido';
  if (!email.trim()) newErrors.email = 'El email es requerido';
  if (!email.includes('@')) newErrors.email = 'Email inválido';
  
  if (!usuario) {
    if (!password) newErrors.password = 'La contraseña es requerida';
    else {
      if (password.length < 8) {
        newErrors.password = 'Mínimo 8 caracteres';
      }
      // 👇 NUEVO: al menos una mayúscula
      else if (!/[A-Z]/.test(password)) {
        newErrors.password = 'Debe contener al menos una letra mayúscula';
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
      Alert.alert('Error', 'Por favor completa los campos requeridos');
    }
  };

  const handleAnterior = () => {
    setPasoActual(pasoActual - 1);
    setErrors({});
  };

  // ==================== GUARDAR ====================
  const handleGuardar = async () => {
    if (!validarPaso(4)) {
      Alert.alert('Error', 'Por favor selecciona al menos un rol');
      return;
    }

    setGuardando(true);
    try {
      if (usuario) {
        await actualizarUsuario();
      } else {
        await crearUsuario();
      }
      
      onGuardado(true);
      Alert.alert('Éxito', usuario ? 'Usuario actualizado correctamente' : 'Usuario creado exitosamente');
    } catch (error) {
      console.error('Error guardando usuario:', error);
      Alert.alert(
      'Error', 
      error.response?.data?.error || 
      error.response?.data?.message || 
      error.message || 
      'No se pudo guardar el usuario'
    );
      onGuardado(false);
    } finally {
      setGuardando(false);
    }
  };

const crearUsuario = async () => {
  try {
    // ========== VALIDACIONES PREVIAS ==========

    // Validar y limpiar cédula (10 dígitos exactos)
    const cedulaLimpia = cedula.trim().replace(/[-\s]/g, '');
    if (cedulaLimpia.length !== 10 || !/^\d{10}$/.test(cedulaLimpia)) {
      throw new Error('La cédula debe tener exactamente 10 dígitos numéricos');
    }

    // Validar tipo_persona
    const tiposValidos = ['docente', 'administrativo', 'estudiante', 'externo'];
    if (!tipoPersona || !tiposValidos.includes(tipoPersona.toLowerCase())) {
      throw new Error('El tipo de persona debe ser: docente, administrativo, estudiante o externo');
    }

    // Limpiar teléfono (solo si existe)
    const telefonoLimpio = telefono ? telefono.trim().replace(/[-\s()]/g, '') : null;
    if (telefonoLimpio && (telefonoLimpio.length < 7 || telefonoLimpio.length > 15 || !/^\d+$/.test(telefonoLimpio))) {
      throw new Error('El teléfono debe tener entre 7 y 15 dígitos numéricos');
    }

    // Extra: validación de contraseña alineada con el backend
    if (!password) {
      throw new Error('La contraseña es requerida');
    }
    if (password.length < 8) {
      throw new Error('La contraseña debe tener mínimo 8 caracteres');
    }
    if (!/[A-Z]/.test(password)) {
      throw new Error('La contraseña debe contener al menos una letra mayúscula');
    }
    if (password !== confirmPassword) {
      throw new Error('Las contraseñas no coinciden');
    }

    // ========== 1. CREAR PERSONA ==========
    const personaData = {
      cedula: cedulaLimpia,
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      fecha_nacimiento: fechaNacimiento || null,
      genero: genero ? genero.toLowerCase() : null,
      telefono: telefonoLimpio,
      direccion: direccion.trim() || null,
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
    };

    console.log('📤 Creando persona:', personaData);
    const personaResponse = await personaService.create(personaData);
    console.log('✅ Persona creada:', personaResponse);

    const id_persona = personaResponse.id_persona;

    if (!id_persona) {
      console.error('❌ No se obtuvo id_persona en la respuesta:', personaResponse);
      throw new Error('No se pudo obtener el ID de la persona creada');
    }

    // ========== 2. CREAR USUARIO ==========
    const usuarioData = {
      username: username.trim(),
      email: email.trim().toLowerCase(),
      password: password,
      estado: estado,
      id_persona: id_persona
    };

    console.log('📤 Creando usuario:', usuarioData);
    const usuarioResponse = await usuarioService.create(usuarioData);
    console.log('✅ Usuario creado:', usuarioResponse);

    const id_usuario = usuarioResponse.usuario?.id_usuario || usuarioResponse.id_usuario;

    if (!id_usuario) {
      console.error('❌ No se obtuvo id_usuario en la respuesta:', usuarioResponse);
      throw new Error('No se pudo obtener el ID del usuario creado');
    }

    // ========== 3. ASIGNAR ROLES (TABLA USUARIO_ROL) ==========
    if (!rolesSeleccionados || rolesSeleccionados.length === 0) {
      console.warn('⚠️ No hay roles seleccionados, no se creará usuario_rol');
      return;
    }

    console.log('👥 Roles seleccionados para asignar:', rolesSeleccionados);

    for (const id_rol of rolesSeleccionados) {
      const usuarioRolData = {
        id_usuario: id_usuario,
        id_rol: id_rol,
        activo: true
      };

      console.log('📤 Creando usuario_rol:', usuarioRolData);
      const usuarioRolResponse = await usuarioRolService.asignarRol(usuarioRolData);
      console.log('✅ UsuarioRol creado:', usuarioRolResponse);
    }

  }  catch (error) {
    console.error('❌ Error en crearUsuario:', error);
    
    // ✅ CAMBIA ESTAS LÍNEAS para ver el error real
    console.error('📋 Response completo:', error.response);
    console.error('📋 Data completo:', JSON.stringify(error.response?.data, null, 2));
    
    // ✅ LANZA EL ERROR CON EL MENSAJE DEL BACKEND
    const mensajeError = error.response?.data?.detail || 
                        error.response?.data?.message || 
                        error.response?.data?.error ||
                        error.message;
    
    throw new Error(mensajeError);
  }
  };

/// =================== ACTUALIZAR USUARIO ====================

const actualizarUsuario = async () => {
  if (usuario.id_persona) {
    const personaData = {
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      cedula: cedula.trim(),
      telefono: telefono.trim() || null,
      direccion: direccion.trim() || null
    };
    await personaService.update(usuario.id_persona, personaData);
  }

  const usuarioData = {
    username: username.trim(),
    email: email.trim(),
    estado: estado
  };
  
  if (password) {
    usuarioData.password = password;
  }

  await usuarioService.update(usuario.id_usuario, usuarioData);

  const rolesActuales = usuario.roles?.map(r => r.id_rol) || [];
  const rolesAEliminar = rolesActuales.filter(r => !rolesSeleccionados.includes(r));
  const rolesAAgregar = rolesSeleccionados.filter(r => !rolesActuales.includes(r));

  // 🔻 Revocar roles que ya no están seleccionados
  for (const id_rol of rolesAEliminar) {
    await usuarioRolService.revocarRol(usuario.id_usuario, id_rol);
  }

  // 🔺 Asignar nuevos roles
  for (const id_rol of rolesAAgregar) {
    await usuarioRolService.asignarRolAUsuario(usuario.id_usuario, {
      id_rol: id_rol
      // igual, aquí puedes sumar más campos si tu backend lo requiere
    });
  }

};

const toggleRol = (rolId) => {
  console.log('🎯 Toggle rol:', rolId);
  console.log('📋 Roles actuales:', rolesSeleccionados);
  
  if (rolesSeleccionados.includes(rolId)) {
    setRolesSeleccionados(rolesSeleccionados.filter(r => r !== rolId));
  } else {
    setRolesSeleccionados([...rolesSeleccionados, rolId]);
  }
  
  if (errors.roles) {
    setErrors({ ...errors, roles: undefined });
  }
  
  console.log('✅ Nuevos roles:', rolesSeleccionados);
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
        <View style={[styles.inputContainer, errors.cedula && styles.inputError]}>
          <Ionicons name="card-outline" size={20} color="#667eea" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="0123456789"
            placeholderTextColor="#9CA3AF"
            value={cedula}
            onChangeText={(text) => {
              setCedula(text);
              if (errors.cedula) setErrors({...errors, cedula: undefined});
            }}
            keyboardType="numeric"
            maxLength={10}
          />
        </View>
        {errors.cedula && <Text style={styles.errorText}>{errors.cedula}</Text>}
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
      <View style={styles.formColumn}>cargarRoles
        <Text style={styles.label}>
          NOMBRE <Text style={styles.labelRequired}>*</Text>
        </Text>
        <View style={[styles.inputContainer, errors.nombre && styles.inputError]}>
          <Ionicons name="person-outline" size={20} color="#667eea" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Juan"
            placeholderTextColor="#9CA3AF"
            value={nombre}
            onChangeText={(text) => {
              setNombre(text);
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
            placeholder="Pérez"
            placeholderTextColor="#9CA3AF"
            value={apellido}
            onChangeText={(text) => {
              setApellido(text);
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
            placeholder="0987654321"
            placeholderTextColor="#9CA3AF"
            value={telefono}
            onChangeText={setTelefono}
            keyboardType="phone-pad"
            maxLength={10}
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
            onChangeText={setDireccion}
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
            <TextInput
              style={styles.input}
              placeholder="Masculino/Femenino/Otro"
              placeholderTextColor="#9CA3AF"
              value={genero}
              onChangeText={setGenero}
            />
          </View>
        </View>

        <View style={styles.formColumn}>
          <Text style={styles.label}>
            TIPO PERSONA <Text style={styles.labelRequired}>*</Text>
          </Text>
          <View style={[styles.inputContainer, errors.tipoPersona && styles.inputError]}>
            <Ionicons name="briefcase-outline" size={20} color="#667eea" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="docente/administrativo/estudiante"
              placeholderTextColor="#9CA3AF"
              value={tipoPersona}
              onChangeText={(text) => {
                setTipoPersona(text);
                if (errors.tipoPersona) setErrors({...errors, tipoPersona: undefined});
              }}
            />
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
              placeholder="juanperez"
              placeholderTextColor="#9CA3AF"
              value={username}
              onChangeText={(text) => {
                setUsername(text);
                if (errors.username) setErrors({...errors, username: undefined});
              }}
              autoCapitalize="none"
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
              placeholder="juan@ejemplo.com"
              placeholderTextColor="#9CA3AF"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
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
          La contraseña debe tener mínimo 8 caracteres
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
        const rolId = rol.id_rol;  // 👈 usamos solo el id_rol del backend
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
            <Text style={styles.pasoIndicator}>Paso {pasoActual} de 4</Text>
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
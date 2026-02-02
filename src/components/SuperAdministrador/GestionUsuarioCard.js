import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
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
    console.log('🔔 mostrarToast ejecutado:', { message, type });
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

  const esEdicion = Boolean(usuario?.id_usuario);

  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [mostrarConfirmPassword, setMostrarConfirmPassword] = useState(false);

  // ==================== ANIMACIONES ====================
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(100)).current;




  const extraerMensajeError = (error) => {
    console.log('🔍 extraerMensajeError iniciado');
    console.log('🔍 Error completo capturado:', error);
    console.log('🔍 error.data:', error.data);
    console.log('🔍 error.message:', error.message);

    let mensaje = '';

    // 1. Si hay detalles de validación (array)
    if (error.data?.details && Array.isArray(error.data.details)) {
      console.log('✅ Extrayendo desde error.data.details');
      const mensajes = error.data.details
        .map(e => e.message || e.msg)
        .filter(Boolean);
      mensaje = mensajes.length > 0 ? mensajes.join('\n') : 'Error de validación';
    }

    // 2. Si hay detail del backend (string)
    else if (error.data?.detail) {
      console.log('✅ Extrayendo desde error.data.detail');
      mensaje = error.data.detail;
    }

    // 3. Si hay message del backend
    else if (error.data?.message) {
      console.log('✅ Extrayendo desde error.data.message');
      mensaje = error.data.message;
    }

    // 4. Si solo hay error.message
    else if (error.message) {
      console.log('✅ Extrayendo desde error.message');
      mensaje = error.message;
    }

    // 5. Fallback
    else {
      console.log('⚠️ Usando mensaje fallback');
      mensaje = 'Error desconocido al procesar la solicitud';
    }

    console.log('📤 Mensaje final extraído:', mensaje);
    return mensaje;
  };



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
  const consultarCedula = async () => {
    const cedulaLimpia = SecurityValidator.sanitizeText(cedula).replace(/[^0-9]/g, '');

    if (cedulaLimpia.length !== 10) {
      mostrarToast('Ingresa los 10 dígitos de la cédula primero', 'warning');
      return;
    }

    setConsultandoCedula(true);

    try {
      // ✅ 1. PRIMERO VERIFICAR SI LA CÉDULA YA EXISTE EN LA BD
      try {
        const personaExistente = await personaService.getByCedula(cedulaLimpia);

        if (personaExistente && personaExistente.id_persona) {
          mostrarToast('⚠️ Esta cédula ya está registrada en el sistema', 'error');
          setConsultandoCedula(false);
          return;
        }
      } catch (error) {
        // Si no existe (error 404), continuamos con la consulta externa
        console.log('Cédula no existe en BD local, consultando externamente...');
      }

      // ✅ 2. SI NO EXISTE, CONSULTAR EN SERVICIO EXTERNO
      const data = await cedulaService.consultarCedula(cedulaLimpia);

      if (!Array.isArray(data) || data.length === 0) {
        // ✅ No hay datos externos, pero permitir continuar manualmente
        setCedulaConsultada(true);
        mostrarToast('ℹ️ No se encontró información externa. Puedes ingresar los datos manualmente', 'warning');
        setConsultandoCedula(false);
        return;
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

  // ==================== VALIDACIÓN DE CÉDULA ECUATORIANA ====================
  const validarCedulaEcuatoriana = (cedula) => {
    // Limpiar y validar formato básico
    const cedulaLimpia = cedula.replace(/[^0-9]/g, '');

    if (cedulaLimpia.length !== 10) {
      return { valida: false, mensaje: 'La cédula debe tener 10 dígitos' };
    }

    // Validar que los dos primeros dígitos correspondan a una provincia válida (01-24)
    const provincia = parseInt(cedulaLimpia.substring(0, 2));
    if (provincia < 1 || provincia > 24) {
      return { valida: false, mensaje: 'Código de provincia inválido (debe ser 01-24)' };
    }

    // Validar el tercer dígito (debe ser menor a 6 para personas naturales)
    const tercerDigito = parseInt(cedulaLimpia.charAt(2));
    if (tercerDigito > 5) {
      return { valida: false, mensaje: 'Tercer dígito inválido para cédula de persona natural' };
    }

    // Algoritmo de validación módulo 10
    const coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2];
    const digitoVerificador = parseInt(cedulaLimpia.charAt(9));
    let suma = 0;

    for (let i = 0; i < 9; i++) {
      let valor = parseInt(cedulaLimpia.charAt(i)) * coeficientes[i];
      if (valor >= 10) {
        valor = valor - 9;
      }
      suma += valor;
    }

    const residuo = suma % 10;
    const resultado = residuo === 0 ? 0 : 10 - residuo;

    if (resultado !== digitoVerificador) {
      return { valida: false, mensaje: 'Cédula inválida. Ingrese un número válido.' };
    }

    return { valida: true, mensaje: 'Cédula válida' };
  };
  // ==================== VALIDACIÓN POR PASO ====================
  const validarPaso = async (paso) => {
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

      // ✅ VALIDACIÓN DE CÉDULA ECUATORIANA
      if (!cedulaLimpia) {
        newErrors.cedula = 'La cédula es requerida';
      } else if (cedulaLimpia.length !== 10 || !/^\d{10}$/.test(cedulaLimpia)) {
        newErrors.cedula = 'La cédula debe tener exactamente 10 dígitos';
      } else {
        // ✅ Validar con algoritmo ecuatoriano
        const resultadoValidacion = validarCedulaEcuatoriana(cedulaLimpia);
        if (!resultadoValidacion.valida) {
          newErrors.cedula = resultadoValidacion.mensaje;
        }

        // ✅ VERIFICAR SI LA CÉDULA YA EXISTE (solo en modo CREAR)
        if (!esEdicion && resultadoValidacion.valida) {
          try {
            const todasPersonas = await personaService.getAll();
            const personaExistente = todasPersonas.find(p => p.cedula === cedulaLimpia);

            if (personaExistente) {
              newErrors.cedula = '⚠️ Esta cédula ya está registrada en el sistema';
            }
          } catch (error) {
            console.log('Error verificando cédula:', error);
          }
        }
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

      if (!esEdicion) {
        // Modo CREAR: contraseña obligatoria
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
      } else {
        // Modo EDITAR: solo validar SI se ingresó una contraseña
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

          // Solo validar confirmación si se ingresó contraseña
          if (password !== confirmPassword) {
            newErrors.confirmPassword = 'Las contraseñas no coinciden';
          }
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
  const handleSiguiente = async () => {
    const esValido = await validarPaso(pasoActual);
    if (esValido) {
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

      // ✅ Solo cerrar cuando hay ÉXITO
      setTimeout(() => {
        onGuardado(true);
      }, 2000);

    } catch (error) {
      console.error('❌ Error en handleGuardar:', error);

      const mensajeError = extraerMensajeError(error);
      mostrarToast(mensajeError, 'error');

      // ✅ NO cerrar el card, dejar que el usuario vea el error
      // y pueda corregir los datos
      // onGuardado(false); <-- COMENTAR O ELIMINAR

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


      const rolesProhibidos = rolesSeleccionados.filter(idRol => {
        const rol = roles.find(r => r.id_rol === idRol);
        if (!rol) return true;

        const nombreRolLower = (rol.nombre_rol || '').toLowerCase();
        const nivel = rol.nivel_jerarquia || rol.nivel_acceso || 999;

        return nivel === 1 || nombreRolLower.includes('super');
      });

      if (rolesProhibidos.length > 0) {
        throw new Error('No tienes permiso para asignar roles de superadministrador');
      }

      const usuarioCompletoData = {
        username: usernameLimpio,
        email: emailLimpio,
        password: password,
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
          email_personal: emailLimpio,
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

      const response = await usuarioService.createCompleto(usuarioCompletoData);
      return response;

    } catch (error) {
      console.error('❌ Error en crearUsuario:', error);
      throw error;
    }
  };

  /// =================== ACTUALIZAR USUARIO ====================

  const actualizarUsuario = async () => {
    try {
      // 1. OBTENER ID DE PERSONA DESDE usuario.persona
      const idPersona = usuario?.persona?.id_persona;

      console.log("====== DEBUG PERSONA ======");
      console.log("idPersona =>", idPersona);
      console.log("===========================");

      // 1. ACTUALIZAR PERSONA (solo si existe)
      if (idPersona) {
        const cedulaLimpia = SecurityValidator.sanitizeText(cedula).replace(/[-\s]/g, '');
        const telefonoLimpio = telefono
          ? SecurityValidator.sanitizeText(telefono).replace(/[-\s()]/g, '')
          : null;
        const nombreLimpio = SecurityValidator.truncateText(
          SecurityValidator.sanitizeText(nombre), 100
        );
        const apellidoLimpio = SecurityValidator.truncateText(
          SecurityValidator.sanitizeText(apellido), 100
        );
        const direccionLimpia = direccion
          ? SecurityValidator.truncateText(SecurityValidator.sanitizeText(direccion), 200)
          : null;

        const personaData = {
          nombre: nombreLimpio,
          apellido: apellidoLimpio,
          cedula: cedulaLimpia,
          telefono: telefonoLimpio,
          direccion: direccionLimpia,
          fecha_nacimiento: fechaNacimiento || null,
          genero: genero ? genero.toLowerCase() : null,
          tipo_persona: tipoPersona ? tipoPersona.toLowerCase() : null,
        };

        await personaService.update(idPersona, personaData);
      }

      // 2. ACTUALIZAR USUARIO
      const usernameLimpio = SecurityValidator.truncateText(
        SecurityValidator.sanitizeText(username), 50
      );
      const emailLimpio = SecurityValidator.sanitizeText(email).toLowerCase().trim();

      const usuarioData = {
        username: usernameLimpio,
        email: emailLimpio,
        estado: estado,
      };

      if (password && password.trim()) {
        usuarioData.password = password;
      }

      await usuarioService.update(usuario.id_usuario, usuarioData);

      // 3. ACTUALIZAR ROLES
      const rolesActuales = usuario.roles?.map(r => r.id_rol) || [];
      const rolesAAgregar = rolesSeleccionados.filter(r => !rolesActuales.includes(r));

      // ✅ VALIDAR roles prohibidos (SOLO SUPERADMINISTRADOR)
      const rolesProhibidos = rolesAAgregar.filter(idRol => {
        const rol = roles.find(r => r.id_rol === idRol);
        if (!rol) return true;

        const nombreRolLower = (rol.nombre_rol || '').toLowerCase();
        const nivel = rol.nivel_jerarquia || rol.nivel_acceso || 999;

        return nivel === 1 || nombreRolLower.includes('super');
      });

      if (rolesProhibidos.length > 0) {
        throw new Error('No tienes permiso para asignar roles de superadministrador');
      }

      // ✅ Calcular los roles a eliminar
      const rolesAEliminar = rolesActuales.filter(r => !rolesSeleccionados.includes(r));

      for (const id_rol of rolesAEliminar) {
        await usuarioRolService.revocarRol(usuario.id_usuario, id_rol);
      }

      for (const id_rol of rolesAAgregar) {
        await usuarioRolService.asignarRolAUsuario(usuario.id_usuario, { id_rol });
      }

    } catch (error) {
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

      {/* CÉDULA - ANCHO COMPLETO EN MÓVIL */}
      <View style={{ marginBottom: 20 }}>
        <Text style={styles.label}>
          CÉDULA <Text style={styles.labelRequired}>*</Text>
        </Text>
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-start' }}>
          <View style={[
            styles.inputContainer,
            errors.cedula && styles.inputError,
            { flex: 1 }
          ]}>
            <Ionicons name="card-outline" size={20} color="#667eea" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="10 dígitos"
              placeholderTextColor="#9CA3AF"
              value={cedula}
              onChangeText={(text) => {
                const limpio = SecurityValidator.sanitizeText(text).replace(/[^0-9]/g, '');
                setCedula(limpio);
                setCedulaConsultada(false);

                if (limpio.length === 10) {
                  const resultado = validarCedulaEcuatoriana(limpio);
                  if (!resultado.valida) {
                    setErrors({ ...errors, cedula: resultado.mensaje });
                  } else {
                    setErrors({ ...errors, cedula: undefined });
                  }
                } else if (errors.cedula) {
                  setErrors({ ...errors, cedula: undefined });
                }
              }}
              keyboardType="numeric"
              maxLength={10}
              editable={!usuario}
            />
          </View>

          {/* BOTÓN DE CONSULTA */}
          {!usuario && cedula.length === 10 && !cedulaConsultada && (
            <TouchableOpacity
              style={{
                backgroundColor: '#667eea',
                paddingHorizontal: 16,
                paddingVertical: 16,
                borderRadius: 12,
                justifyContent: 'center',
                alignItems: 'center',
                minWidth: 80,
              }}
              onPress={consultarCedula}
              disabled={consultandoCedula}
              activeOpacity={0.7}
            >
              {consultandoCedula ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Ionicons name="search" size={20} color="#FFFFFF" />
              )}
            </TouchableOpacity>
          )}

          {/* INDICADOR DE CONSULTADO */}
          {cedulaConsultada && (
            <View style={{
              backgroundColor: '#10b981',
              paddingHorizontal: 16,
              paddingVertical: 16,
              borderRadius: 12,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
            </View>
          )}
        </View>

        {/* INDICADOR DE VALIDEZ */}
        {!usuario && cedula.length === 10 && !errors.cedula && (
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: 8,
            padding: 8,
            backgroundColor: '#f0fdf4',
            borderRadius: 8,
            borderWidth: 1,
            borderColor: '#10b981',
          }}>
            <Ionicons name="checkmark-circle" size={16} color="#10b981" />
            <Text style={{ marginLeft: 6, fontSize: 12, color: '#059669', fontWeight: '600' }}>
              Cédula ecuatoriana válida
            </Text>
          </View>
        )}

        {errors.cedula && <Text style={styles.errorText}>{errors.cedula}</Text>}

        {/* MENSAJE INFORMATIVO */}
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
            <Text style={{ marginLeft: 6, fontSize: 12, color: '#667eea', flex: 1 }}>
              Presiona el botón de búsqueda para cargar datos automáticamente
            </Text>
          </View>
        )}
      </View>

      {/* FECHA DE NACIMIENTO - ANCHO COMPLETO */}
      <View style={{ marginBottom: 20 }}>
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

      {/* NOMBRE - ANCHO COMPLETO */}
      <View style={{ marginBottom: 20 }}>
        <Text style={styles.label}>
          NOMBRE <Text style={styles.labelRequired}>*</Text>
        </Text>
        <View style={[styles.inputContainer, errors.nombre && styles.inputError]}>
          <Ionicons name="person-outline" size={20} color="#667eea" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Solo letras"
            placeholderTextColor="#9CA3AF"
            value={nombre}
            onChangeText={(text) => {
              const limpio = SecurityValidator.sanitizeText(text).replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
              setNombre(limpio);
              if (errors.nombre) setErrors({ ...errors, nombre: undefined });
            }}
          />
        </View>
        {errors.nombre && <Text style={styles.errorText}>{errors.nombre}</Text>}
      </View>

      {/* APELLIDO - ANCHO COMPLETO */}
      <View style={{ marginBottom: 20 }}>
        <Text style={styles.label}>
          APELLIDO <Text style={styles.labelRequired}>*</Text>
        </Text>
        <View style={[styles.inputContainer, errors.apellido && styles.inputError]}>
          <Ionicons name="person-outline" size={20} color="#667eea" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Solo letras"
            placeholderTextColor="#9CA3AF"
            value={apellido}
            onChangeText={(text) => {
              const limpio = SecurityValidator.sanitizeText(text).replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
              setApellido(limpio);
              if (errors.apellido) setErrors({ ...errors, apellido: undefined });
            }}
          />
        </View>
        {errors.apellido && <Text style={styles.errorText}>{errors.apellido}</Text>}
      </View>

      {/* TELÉFONO - ANCHO COMPLETO */}
      <View style={{ marginBottom: 20 }}>
        <Text style={styles.label}>TELÉFONO</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="call-outline" size={20} color="#667eea" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="7-15 dígitos"
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

      {/* DIRECCIÓN - ANCHO COMPLETO */}
      <View style={{ marginBottom: 0 }}>
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
  );

  const renderPaso2 = () => (
    <View>
      <Text style={styles.sectionTitle}>ℹ️ Información Adicional</Text>

      {/* GÉNERO - ANCHO COMPLETO */}
      <View style={{ marginBottom: 20 }}>
        <Text style={styles.label}>GÉNERO</Text>
        <View style={styles.pickerContainer}>
          {['masculino', 'femenino', 'otro', 'prefiero_no_decir'].map(g => (
            <TouchableOpacity
              key={g}
              style={[styles.genderBtn, genero === g && styles.genderBtnActive]}
              onPress={() => setGenero(g)}
            >
              <Text style={[styles.genderBtnText, genero === g && styles.genderBtnTextActive]}>
                {g === 'masculino' ? 'M' : g === 'femenino' ? 'F' : g === 'otro' ? 'OTRO' : 'N/A'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* TIPO PERSONA - ANCHO COMPLETO */}
      <View style={{ marginBottom: 20 }}>
        <Text style={styles.label}>
          TIPO PERSONA <Text style={styles.labelRequired}>*</Text>
        </Text>
        <View style={[styles.pickerContainerVertical, errors.tipoPersona && styles.inputError]}>
          {['docente', 'administrativo', 'estudiante', 'externo'].map(tipo => (
            <TouchableOpacity
              key={tipo}
              style={[styles.tipoBtnFull, tipoPersona === tipo && styles.tipoBtnActive]}
              onPress={() => {
                setTipoPersona(tipo);
                if (errors.tipoPersona) setErrors({ ...errors, tipoPersona: undefined });
              }}
            >
              <Ionicons
                name={
                  tipo === 'docente' ? 'school' :
                    tipo === 'administrativo' ? 'briefcase' :
                      tipo === 'estudiante' ? 'person' :
                        'people'
                }
                size={20}
                color={tipoPersona === tipo ? '#FFFFFF' : '#667eea'}
              />
              <Text style={[styles.tipoBtnTextFull, tipoPersona === tipo && styles.tipoBtnTextActive]}>
                {tipo.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {errors.tipoPersona && <Text style={styles.errorText}>{errors.tipoPersona}</Text>}
      </View>

      {!esEdicion && (
        <View style={styles.infoCard}>
          <Ionicons name="shield-checkmark" size={20} color="#667eea" />
          <Text style={styles.infoCardText}>
            La contraseña debe tener mínimo 8 caracteres, una mayúscula, una minúscula y un número
          </Text>
        </View>
      )}
    </View>
  );

  const renderPaso3 = () => (
    <View>
      <Text style={styles.sectionTitle}>🔐 Credenciales de Acceso</Text>

      {/* USUARIO - ANCHO COMPLETO */}
      <View style={{ marginBottom: 20 }}>
        <Text style={styles.label}>
          USUARIO <Text style={styles.labelRequired}>*</Text>
        </Text>
        <View style={[styles.inputContainer, errors.username && styles.inputError]}>
          <Ionicons name="at-outline" size={20} color="#667eea" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="4-50 caracteres"
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
        {errors.username && <Text style={styles.errorText}>{errors.username}</Text>}
      </View>

      {/* EMAIL - ANCHO COMPLETO */}
      <View style={{ marginBottom: 20 }}>
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
        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
      </View>

      {/* CONTRASEÑA - ANCHO COMPLETO */}
      <View style={{ marginBottom: 20 }}>
        <Text style={styles.label}>
          CONTRASEÑA {!esEdicion && <Text style={styles.labelRequired}>*</Text>}
        </Text>

        {/* MOSTRAR INDICADOR SI ES EDICIÓN */}
        {esEdicion && !password && (
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#f0fdf4',
            padding: 12,
            borderRadius: 8,
            marginBottom: 8,
            borderWidth: 1,
            borderColor: '#10b981',
          }}>
            <Ionicons name="checkmark-circle" size={20} color="#10b981" />
            <Text style={{
              marginLeft: 8,
              fontSize: 13,
              color: '#059669',
              fontWeight: '600',
              flex: 1,
            }}>
              Contraseña actual establecida
            </Text>
          </View>
        )}

        <View style={[styles.inputContainer, errors.password && styles.inputError]}>
          <Ionicons name="lock-closed-outline" size={20} color="#667eea" style={styles.inputIcon} />
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder={esEdicion ? "Nueva contraseña (opcional)" : "Mínimo 8 caracteres"}
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
            style={{ padding: 8 }}
            activeOpacity={0.7}
          >
            <Ionicons
              name={mostrarPassword ? "eye-off-outline" : "eye-outline"}
              size={20}
              color="#667eea"
            />
          </TouchableOpacity>
        </View>
        {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
      </View>

      {/* CONFIRMAR CONTRASEÑA - ANCHO COMPLETO */}
      <View style={{ marginBottom: 20 }}>
        <Text style={styles.label}>
          CONFIRMAR {!esEdicion && <Text style={styles.labelRequired}>*</Text>}
        </Text>
        <View style={[styles.inputContainer, errors.confirmPassword && styles.inputError]}>
          <Ionicons name="lock-closed-outline" size={20} color="#667eea" style={styles.inputIcon} />
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder={esEdicion ? "Confirmar nueva (opcional)" : "Repetir contraseña"}
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
            style={{ padding: 8 }}
            activeOpacity={0.7}
          >
            <Ionicons
              name={mostrarConfirmPassword ? "eye-off-outline" : "eye-outline"}
              size={20}
              color="#667eea"
            />
          </TouchableOpacity>
        </View>
        {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
      </View>

      {esEdicion && (
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={20} color="#10b981" />
          <Text style={styles.infoCardText}>
            Deja los campos de contraseña vacíos si no deseas cambiarla
          </Text>
        </View>
      )}

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
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0f0f23' }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
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
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingTop: 24,
            paddingBottom: 0  // ← CERO para todos los pasos
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          <View style={{ padding: 24, paddingBottom: 0 }}>
            {pasoActual === 1 && renderPaso1()}
            {pasoActual === 2 && renderPaso2()}
            {pasoActual === 3 && renderPaso3()}
            {pasoActual === 4 && renderPaso4()}
          </View>
        </ScrollView>

        {/* Botones de Navegación */}
        <View style={{
          backgroundColor: 'rgba(26, 26, 46, 0.98)',
          borderTopWidth: 1,
          borderTopColor: 'rgba(102, 126, 234, 0.3)',
        }}>
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
                  style={{ minWidth: 120, maxWidth: 180 }}
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
                  style={{ minWidth: 120, maxWidth: 140 }}
                >
                  <LinearGradient
                    colors={guardando ? ['#6B7280', '#4B5563'] : ['#10B981', '#059669']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[styles.btnGuardar, guardando && styles.btnGuardarDisabled]}
                  >
                    <Text style={styles.btnGuardarText}>
                      {guardando ? 'GUARDANDO...' : 'GUARDAR'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
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
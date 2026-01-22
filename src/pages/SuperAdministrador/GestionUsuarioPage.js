// ==================================================================================
// src/pages/Administrador/GestionUsuarioPage.js
// ACTUALIZADO: Roles dinámicos + Control de usuarios máximos
// ==================================================================================

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Search, Users } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

import { rolService } from '../../api/services/rolService';
import { usuarioService } from '../../api/services/usuarioService';
import GestionUsuarioCard from '../../components/SuperAdministrador/GestionUsuarioCard';
import UsuarioCard from '../../components/SuperAdministrador/UsuarioCard';

import SuperAdminSidebar from '../../components/Sidebar/sidebarSuperAdmin';
import { contentStyles } from '../../components/Sidebar/SidebarSuperAdminStyles';
import { getUserIdFromToken } from '../../components/utils/authHelper';
import SecurityValidator from '../../components/utils/SecurityValidator';
import { styles } from '../../styles/GestionUsuariosStyles';

const isWeb = Platform.OS === 'web';

const GestionUsuarioPage = () => {
  // ==================== ESTADOS ====================
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [usuarios, setUsuarios] = useState([]);
  const [usuariosFiltrados, setUsuariosFiltrados] = useState([]);
  const [roles, setRoles] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [filtroRol, setFiltroRol] = useState('todos');
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [totalUsuarios, setTotalUsuarios] = useState(0);

  // ✅ NUEVOS ESTADOS PARA PAGINACIÓN
  const [skip, setSkip] = useState(0);
  const [limit, setLimit] = useState(50); // Por defecto 50 usuarios
  const [paginaActual, setPaginaActual] = useState(1);

  // ==================== ESTADOS PARA MODALES ====================
  const [modalConfirm, setModalConfirm] = useState({
    visible: false,
    title: '',
    message: '',
    onConfirm: null,
    type: 'danger'
  });

  const [modalNotification, setModalNotification] = useState({
    visible: false,
    message: '',
    type: 'success'
  });

  //Modal para usuario con departamento
  const [modalDepartamentoAsignado, setModalDepartamentoAsignado] = useState({
    visible: false,
    usuario: null,
    departamento: null
  })

  // ==================== ANIMACIONES ====================
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const rateLimiter = useRef(SecurityValidator.createRateLimiter()).current;



  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    cargarDatosIniciales();
  }, []);

  // ✅ RECARGAR cuando cambien skip o limit
  useEffect(() => {
    if (!mostrarFormulario) {
      cargarUsuarios();
    }
  }, [skip, limit]);

  // ==================== FILTRADO ====================
  useEffect(() => {
    filtrarUsuarios();
  }, [usuarios, busqueda, filtroRol]);

  useEffect(() => {
    setTotalUsuarios(usuariosFiltrados.length);
  }, [usuariosFiltrados]);


  const filtrarUsuarios = () => {
    const limiteCheck = rateLimiter.check(30);
    if (!limiteCheck.allowed) {
      Alert.alert('Límite excedido', limiteCheck.message);
      return;
    }

    const lista = Array.isArray(usuarios) ? usuarios : [];
    let resultado = [...lista];

    // ✅ FILTRAR INACTIVOS
    resultado = resultado.filter(u => u.estado?.toLowerCase() !== 'inactivo');

    // Filtrar por búsqueda
    if (busqueda.trim()) {
      const busquedaLower = SecurityValidator.sanitizeText(busqueda).toLowerCase();

      resultado = resultado.filter(u => {
        // Sanitizar cada campo antes de comparar
        const nombre = SecurityValidator.sanitizeText(u.persona?.nombre || '').toLowerCase();
        const apellido = SecurityValidator.sanitizeText(u.persona?.apellido || '').toLowerCase();
        const username = SecurityValidator.sanitizeText(u.username || '').toLowerCase();
        const email = SecurityValidator.sanitizeText(u.email || '').toLowerCase();
        const cedula = SecurityValidator.sanitizeText(u.persona?.cedula || '');

        return nombre.includes(busquedaLower) ||
          apellido.includes(busquedaLower) ||
          username.includes(busquedaLower) ||
          email.includes(busquedaLower) ||
          cedula.includes(busqueda); // Cédula sin toLowerCase
      });
    }

    // Filtrar por rol
    if (filtroRol !== 'todos') {
      const rolIdSeguro = parseInt(filtroRol);
      if (!isNaN(rolIdSeguro)) {
        resultado = resultado.filter(u =>
          Array.isArray(u.roles) &&
          u.roles.some(r => r.id_rol === rolIdSeguro)
        );
      }
    }

    setUsuariosFiltrados(resultado);
  };




  // ==================== FUNCIONES DE CARGA ====================
  const cargarDatosIniciales = async () => {
    setLoading(true);
    try {
      await Promise.all([
        cargarUsuarios(),
        cargarRoles()
      ]);
    } catch (error) {
      if (error?.isTokenExpired) {
        console.log('🔒 Token expirado - SessionContext manejará');
        return;
      }
      console.error('Error cargando datos:', error);
      Alert.alert('Error', 'No se pudieron cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const cargarUsuarios = async () => {
    try {
      // Validar skip y limit
      const skipSeguro = Math.max(0, parseInt(skip) || 0);
      const limitSeguro = Math.max(1, Math.min(200, parseInt(limit) || 50));

      const response = await usuarioService.listarCompleto({
        skip: skipSeguro,
        limit: limitSeguro
      });

      const listaUsuarios = Array.isArray(response.usuarios) ? response.usuarios : [];
      const total = parseInt(response.total) || 0;

      setUsuarios(listaUsuarios);
      setTotalUsuarios(total);
    } catch (error) {
      if (error?.isTokenExpired) {
        console.log('🔒 Token expirado - SessionContext manejará');
        return;
      }
      console.error('❌ Error cargando usuarios:', error);
      throw error;
    }
  };

  const cargarRoles = async () => {
    try {
      const response = await rolService.listarRoles({
        skip: 0,
        limit: 100,
        solo_activos: true
      });

      let listaRoles = [];
      if (Array.isArray(response)) {
        listaRoles = response;
      } else if (response && Array.isArray(response.data)) {
        listaRoles = response.data;
      }

      // Validar que cada rol tenga id_rol válido
      const rolesValidos = listaRoles.filter(rol =>
        rol && typeof rol.id_rol === 'number' && rol.id_rol > 0
      );

      setRoles(rolesValidos);
    } catch (error) {
      if (error?.isTokenExpired) {
        console.log('🔒 Token expirado - SessionContext manejará');
        return;
      }
      console.error('Error cargando roles:', error);
      throw error;
    }
  };

  // ==================== FUNCIONES DE NAVEGACIÓN ====================
  const abrirFormularioNuevo = () => {
    setUsuarioSeleccionado(null);
    setMostrarFormulario(true);
  };

  const abrirFormularioEditar = (usuario) => {
    setUsuarioSeleccionado(usuario);
    setMostrarFormulario(true);
  };

  const cerrarFormulario = () => {
    setMostrarFormulario(false);
    setUsuarioSeleccionado(null);
  };

  // ==================== FUNCIONES DE ACCIONES ====================
  const handleGuardado = async (exito) => {
    if (exito) {
      // ✅ PRIMERO CERRAR EL FORMULARIO
      cerrarFormulario();

      // ✅ LUEGO RECARGAR USUARIOS
      setLoading(true);
      try {
        await cargarUsuarios();

        Alert.alert(
          'Éxito',
          usuarioSeleccionado
            ? 'Usuario actualizado correctamente'
            : 'Usuario creado correctamente'
        );
      } catch (error) {
        if (error?.isTokenExpired) {
          console.log('🔒 Token expirado - SessionContext manejará');
          return;
        }
        console.error('Error recargando usuarios:', error);
      } finally {
        setLoading(false);
      }
    } else {
      // Si falló, solo cerrar
      cerrarFormulario();
    }
  };
  const confirmarEliminar = async (usuario) => {
    console.log('🔵 [confirmarEliminar] INICIADO');
    console.log('🔵 Usuario recibido:', usuario);

    if (!usuario || !usuario.id_usuario) {
      console.log('❌ Usuario inválido, mostrando notificación');
      setModalNotification({
        visible: true,
        message: 'Error: Usuario inválido',
        type: 'error'
      });
      return;
    }

    // ✅ VALIDAR QUE NO SE ELIMINE A SÍ MISMO
    try {
      const miIdUsuario = await getUserIdFromToken();

      if (usuario.id_usuario === miIdUsuario) {
        console.log('❌ Intento de auto-eliminación bloqueado');
        setModalNotification({
          visible: true,
          message: '❌ No puedes eliminarte a ti mismo',
          type: 'error'
        });
        return;
      }
    } catch (error) {
      console.error('Error obteniendo ID del usuario actual:', error);
    }

    // ✅ NUEVA VALIDACIÓN: Verificar si tiene departamento asignado
    if (usuario.departamento || usuario.id_departamento) {
      const nombreDept = usuario.departamento?.nombre || 'un departamento';

      console.log('❌ Usuario tiene departamento asignado:', nombreDept);

      // ✅ Mostrar modal bonito en lugar de notificación simple
      setModalDepartamentoAsignado({
        visible: true,
        usuario: usuario,
        departamento: nombreDept
      });
      return;
    }

    const usernameSeguro = SecurityValidator.sanitizeText(usuario.username || 'este usuario');

    console.log('✅ Mostrando modal de confirmación');

    setModalConfirm({
      visible: true,
      title: 'Confirmar Eliminación',
      message: `¿Estás seguro de eliminar al usuario ${usernameSeguro}?\n\nEste usuario será Eliminado permanentemente.`,
      onConfirm: () => {
        console.log('🔵 onConfirm ejecutado');
        setModalConfirm({ ...modalConfirm, visible: false });
        eliminarUsuario(usuario.id_usuario);
      },
      type: 'danger'
    });
  };

  const eliminarUsuario = async (id_usuario) => {
    console.log('🔍 [eliminarUsuario] Iniciando eliminación...');
    console.log('🔍 [eliminarUsuario] ID recibido:', id_usuario);

    // Validar ID
    const idSeguro = parseInt(id_usuario);
    console.log('🔍 [eliminarUsuario] ID parseado:', idSeguro);

    if (isNaN(idSeguro) || idSeguro <= 0) {
      console.error('❌ ID inválido:', idSeguro);
      Alert.alert('Error', 'ID de usuario inválido');
      return;
    }

    console.log('✅ [eliminarUsuario] ID validado, llamando al servicio...');
    setLoading(true);

    try {
      console.log('📤 [eliminarUsuario] Llamando a usuarioService.delete...');
      const response = await usuarioService.delete(idSeguro);

      console.log('✅ [eliminarUsuario] Respuesta del servicio:', response);

      // Actualizar el estado local para que aparezca como inactivo
      console.log('🔄 [eliminarUsuario] Actualizando estado local...');
      setUsuarios(prevUsuarios => {
        const nuevosUsuarios = prevUsuarios.map(u => {
          if (u.id_usuario === idSeguro) {
            console.log('🔄 Usuario encontrado, cambiando estado a inactivo:', u.username);
            return {
              ...u,
              estado: 'inactivo',
              persona: u.persona ? { ...u.persona, estado: 'inactivo' } : null
            };
          }
          return u;
        });
        console.log('✅ [eliminarUsuario] Estado local actualizado');
        return nuevosUsuarios;
      });

      setModalNotification({
        visible: true,
        message: 'Usuario eliminado correctamente',
        type: 'success'
      });
      console.log('✅ [eliminarUsuario] Proceso completado');

    } catch (error) {
      if (error?.isTokenExpired) {
        console.log('🔒 Token expirado - SessionContext manejará');
        setLoading(false);
        return;
      }

      console.error('❌ [eliminarUsuario] ERROR COMPLETO:', error);
      console.error('❌ [eliminarUsuario] Error.message:', error.message);
      console.error('❌ [eliminarUsuario] Error.data:', error.data);

      const mensajeError = SecurityValidator.sanitizeText(
        error.message || 'No se pudo eliminar el usuario'
      );
      setModalNotification({
        visible: true,
        message: mensajeError,
        type: 'error'
      });
    } finally {
      console.log('🏁 [eliminarUsuario] Finally - Quitando loading');
      setLoading(false);
    }
  };


  const confirmarReactivar = (usuario) => {
    if (!usuario || !usuario.id_usuario) {
      setModalNotification({
        visible: true,
        message: 'Error: Usuario inválido',
        type: 'error'
      });
      return;
    }

    const usernameSeguro = SecurityValidator.sanitizeText(usuario.username || 'este usuario');

    setModalConfirm({
      visible: true,
      title: 'Confirmar Reactivación',
      message: `¿Estás seguro de reactivar al usuario ${usernameSeguro}?`,
      onConfirm: () => {
        setModalConfirm({ ...modalConfirm, visible: false });
        reactivarUsuario(usuario.id_usuario);
      },
      type: 'success'
    });
  };

  const reactivarUsuario = async (id_usuario) => {
    // Validar ID
    const idSeguro = parseInt(id_usuario);
    if (isNaN(idSeguro) || idSeguro <= 0) {
      Alert.alert('Error', 'ID de usuario inválido');
      return;
    }

    setLoading(true);
    try {
      const response = await usuarioService.reactivar(idSeguro);

      console.log('✅ Usuario reactivado:', response);

      // Actualizar el estado local para que aparezca como activo
      setUsuarios(prevUsuarios =>
        prevUsuarios.map(u =>
          u.id_usuario === idSeguro
            ? {
              ...u,
              estado: 'activo',
              persona: u.persona ? { ...u.persona, estado: 'activo' } : null
            }
            : u
        )
      );

      setModalNotification({
        visible: true,
        message: 'Usuario reactivado correctamente',
        type: 'success'
      });
    } catch (error) {
      if (error?.isTokenExpired) {
        console.log('🔒 Token expirado - SessionContext manejará');
        setLoading(false);
        return;
      }

      console.error('❌ Error reactivando usuario:', error);
      const mensajeError = SecurityValidator.sanitizeText(
        error.message || 'No se pudo reactivar el usuario'
      );
      setModalNotification({
        visible: true,
        message: mensajeError,
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // ✅ CONTAR USUARIOS POR ROL (solo activos, sin aplicar filtros de búsqueda/rol)
  const contarPorRol = (idRol) => {
    // ✅ Filtrar SOLO por estado activo, ignorando búsqueda y filtro de rol
    const lista = Array.isArray(usuarios)
      ? usuarios.filter(u => u.estado?.toLowerCase() !== 'inactivo')
      : [];

    if (idRol === 'todos') return lista.length;

    // Validar que idRol sea un número válido
    const rolIdSeguro = parseInt(idRol);
    if (isNaN(rolIdSeguro)) return 0;

    return lista.filter(u =>
      Array.isArray(u.roles) &&
      u.roles.some(r => r.id_rol === rolIdSeguro)
    ).length;
  };

  // ✅ PAGINACIÓN
  const totalPaginas = Math.ceil(totalUsuarios / limit);

  const cambiarPagina = (nuevaPagina) => {
    // Validar que sea un número positivo
    const paginaSegura = parseInt(nuevaPagina);
    if (isNaN(paginaSegura) || paginaSegura < 1 || paginaSegura > totalPaginas) {
      return;
    }

    setPaginaActual(paginaSegura);
    setSkip((paginaSegura - 1) * limit);
  };

  const cambiarLimit = (nuevoLimit) => {
    // Validar rango (mínimo 10, máximo 200)
    const limitSeguro = parseInt(nuevoLimit);
    if (isNaN(limitSeguro) || limitSeguro < 10 || limitSeguro > 200) {
      Alert.alert('Error', 'El límite debe estar entre 10 y 200');
      return;
    }

    setLimit(limitSeguro);
    setSkip(0);
    setPaginaActual(1);
  };

  // ==================== RENDER ====================
  return (
    <View style={contentStyles.wrapper}>
      {/* Sidebar WEB - Fijo al lado */}
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
            <Text style={styles.loadingText}>Cargando usuarios...</Text>
          </View>
        ) : mostrarFormulario ? (
          <GestionUsuarioCard
            usuario={usuarioSeleccionado}
            roles={roles}
            onCerrar={cerrarFormulario}
            onGuardado={handleGuardado}
          />
        ) : (
          <ScrollView
            style={styles.container}
            showsVerticalScrollIndicator={false}
          >
            {/* Header con gradiente */}
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.header}
            >
              <View style={styles.headerContent}>
                <View style={styles.headerTop}>
                  <View style={styles.headerTitleContainer}>
                    <Users size={32} color="#FFFFFF" />
                    <View>
                      <Text style={styles.headerTitle}>Gestión de Usuarios</Text>
                      <Text style={styles.headerSubtitle}>
                        {usuariosFiltrados.length} usuarios activos
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.btnAdd}
                    onPress={abrirFormularioNuevo}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="add" size={32} color="#667eea" />
                  </TouchableOpacity>
                </View>



                {/* Barra de búsqueda */}
                <View style={styles.searchContainer}>
                  <Search size={20} color="#9CA3AF" style={styles.searchIcon} />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Buscar por nombre, usuario, email o cédula"
                    placeholderTextColor="#9CA3AF"
                    value={busqueda}
                    onChangeText={(text) => {
                      // Sanitizar y truncar a 100 caracteres
                      const busquedaLimpia = SecurityValidator.truncateText(
                        SecurityValidator.sanitizeText(text),
                        100
                      );
                      setBusqueda(busquedaLimpia);
                    }}
                    maxLength={100}
                  />
                  {busqueda.length > 0 && (
                    <TouchableOpacity onPress={() => setBusqueda('')}>
                      <Ionicons name="close-circle" size={20} color="#9CA3AF" />
                    </TouchableOpacity>
                  )}
                </View>

                {/* ✅ FILTROS DE ROL DINÁMICOS */}
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.filtersContainer}
                >
                  <TouchableOpacity
                    style={[
                      styles.filterChip,
                      filtroRol === 'todos' && styles.filterChipActive
                    ]}
                    onPress={() => setFiltroRol('todos')}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.filterChipText,
                      filtroRol === 'todos' && styles.filterChipTextActive
                    ]}>
                      Todos ({contarPorRol('todos')})
                    </Text>
                  </TouchableOpacity>



                  {roles.map(rol => (
                    <TouchableOpacity
                      key={rol.id_rol}
                      style={[
                        styles.filterChip,
                        filtroRol === String(rol.id_rol) && styles.filterChipActive
                      ]}
                      onPress={() => setFiltroRol(String(rol.id_rol))}
                      activeOpacity={0.7}
                    >
                      <Text style={[
                        styles.filterChipText,
                        filtroRol === String(rol.id_rol) && styles.filterChipTextActive
                      ]}>
                        {SecurityValidator.sanitizeText(rol.nombre_rol || 'Sin nombre')} ({contarPorRol(rol.id_rol)})
                      </Text>
                    </TouchableOpacity>
                  ))}


                </ScrollView>
              </View>
            </LinearGradient>

            {/* Lista de usuarios */}
            <ScrollView
              style={styles.listaContainer}
              showsVerticalScrollIndicator={false}
            >
              {usuariosFiltrados.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Users size={60} color="#9CA3AF" />
                  <Text style={styles.emptyText}>
                    {busqueda || filtroRol !== 'todos'
                      ? 'No se encontraron usuarios'
                      : 'No hay usuarios registrados'}
                  </Text>
                </View>
              ) : (
                usuariosFiltrados.map((usuario, index) => (
                  <UsuarioCard
                    key={usuario.id_usuario}
                    usuario={usuario}
                    onEditar={() => abrirFormularioEditar(usuario)}
                    onEliminar={() => confirmarEliminar(usuario)}
                    onReactivar={() => confirmarReactivar(usuario)}
                    index={index}
                  />
                ))
              )}

              {/* ✅ PAGINACIÓN */}
              {totalPaginas > 1 && (
                <View style={styles.paginationContainer}>
                  <TouchableOpacity
                    style={[styles.paginationBtn, paginaActual === 1 && styles.paginationBtnDisabled]}
                    onPress={() => cambiarPagina(paginaActual - 1)}
                    disabled={paginaActual === 1}
                  >
                    <Ionicons name="chevron-back" size={20} color={paginaActual === 1 ? '#9CA3AF' : '#667eea'} />
                  </TouchableOpacity>

                  <Text style={styles.paginationText}>
                    Página {paginaActual} de {totalPaginas}
                  </Text>

                  <TouchableOpacity
                    style={[styles.paginationBtn, paginaActual === totalPaginas && styles.paginationBtnDisabled]}
                    onPress={() => cambiarPagina(paginaActual + 1)}
                    disabled={paginaActual === totalPaginas}
                  >
                    <Ionicons name="chevron-forward" size={20} color={paginaActual === totalPaginas ? '#9CA3AF' : '#667eea'} />
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
          </ScrollView>
        )}
      </View>

      {/* Sidebar MÓVIL - Overlay deslizante */}
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

      {/* Modales */}
      {console.log('🟡 Renderizando modales - modalConfirm:', modalConfirm)}
      {console.log('🟡 Renderizando modales - modalNotification:', modalNotification)}
      <ConfirmModal
        visible={modalConfirm.visible}
        title={modalConfirm.title}
        message={modalConfirm.message}
        onConfirm={modalConfirm.onConfirm}
        onCancel={() => setModalConfirm({ ...modalConfirm, visible: false })}
        confirmText={modalConfirm.type === 'success' ? 'Reactivar' : 'Eliminar'}
        cancelText="Cancelar"
        type={modalConfirm.type}
      />

      <NotificationModal
        visible={modalNotification.visible}
        message={modalNotification.message}
        type={modalNotification.type}
        onClose={() => setModalNotification({ ...modalNotification, visible: false })}
      />

      {/* Modal para departamento asignado */}
      <DepartamentoAsignadoModal
        visible={modalDepartamentoAsignado.visible}
        usuario={modalDepartamentoAsignado.usuario}
        departamento={modalDepartamentoAsignado.departamento}
        onClose={() => setModalDepartamentoAsignado({ visible: false, usuario: null, departamento: null })}
      />
    </View>
  );
};

// ==================== MODALES CUSTOM ====================
const ConfirmModal = ({ visible, title, message, onConfirm, onCancel, confirmText = 'Confirmar', cancelText = 'Cancelar', type = 'danger' }) => {
  console.log('🟢 [ConfirmModal] Renderizado - visible:', visible);
  console.log('🟢 [ConfirmModal] Props:', { title, message, type });

  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }).start();
    } else {
      scaleAnim.setValue(0);
    }
  }, [visible]);

  const getColors = () => {
    if (type === 'danger') {
      return {
        icon: 'warning',
        iconColor: '#ef4444',
        confirmBg: '#ef4444',
      };
    }
    return {
      icon: 'checkmark-circle',
      iconColor: '#10b981',
      confirmBg: '#10b981',
    };
  };

  const colors = getColors();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={modalStyles.overlay}>
        <Animated.View style={[modalStyles.modalContainer, { transform: [{ scale: scaleAnim }] }]}>
          <View style={[modalStyles.iconContainer, { backgroundColor: `${colors.iconColor}20` }]}>
            <Ionicons name={colors.icon} size={48} color={colors.iconColor} />
          </View>

          <Text style={modalStyles.title}>{title}</Text>
          <Text style={modalStyles.message}>{message}</Text>

          <View style={modalStyles.buttonContainer}>
            <TouchableOpacity style={modalStyles.btnCancel} onPress={onCancel} activeOpacity={0.8}>
              <Text style={modalStyles.btnCancelText}>{cancelText}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[modalStyles.btnConfirm, { backgroundColor: colors.confirmBg }]}
              onPress={onConfirm}
              activeOpacity={0.8}
            >
              <Text style={modalStyles.btnConfirmText}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const NotificationModal = ({ visible, message, type = 'success', onClose }) => {
  const slideAnim = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }).start();

      const timer = setTimeout(() => {
        Animated.timing(slideAnim, {
          toValue: -100,
          duration: 300,
          useNativeDriver: true,
        }).start(() => onClose());
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  const getConfig = () => {
    if (type === 'error') {
      return {
        icon: 'close-circle',
        iconColor: '#ef4444',
        bgColor: '#fef2f2',
        borderColor: '#ef4444',
      };
    }
    return {
      icon: 'checkmark-circle',
      iconColor: '#10b981',
      bgColor: '#f0fdf4',
      borderColor: '#10b981',
    };
  };

  const config = getConfig();

  if (!visible) return null;

  return (
    <View style={modalStyles.notificationOverlay}>
      <Animated.View
        style={[
          modalStyles.notificationContainer,
          {
            backgroundColor: config.bgColor,
            borderColor: config.borderColor,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <Ionicons name={config.icon} size={32} color={config.iconColor} />
        <Text style={modalStyles.notificationMessage}>{message}</Text>
        <TouchableOpacity onPress={onClose} style={modalStyles.closeBtn}>
          <Ionicons name="close" size={20} color="#6b7280" />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const DepartamentoAsignadoModal = ({ visible, usuario, departamento, onClose }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }).start();
    } else {
      scaleAnim.setValue(0);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={modalStyles.overlay}>
        <Animated.View style={[modalStyles.modalContainer, { transform: [{ scale: scaleAnim }] }]}>

          {/* Icono de advertencia */}
          <View style={[modalStyles.iconContainer, { backgroundColor: 'rgba(251, 146, 60, 0.2)' }]}>
            <Ionicons name="business" size={48} color="#fb923c" />
          </View>

          {/* Título */}
          <Text style={modalStyles.title}>No se puede eliminar</Text>

          {/* Mensaje principal */}
          <Text style={[modalStyles.message, { marginBottom: 16 }]}>
            El usuario <Text style={{ fontWeight: '700', color: '#1f2937' }}>
              {usuario?.persona?.nombre} {usuario?.persona?.apellido}
            </Text> está asignado al departamento:
          </Text>

          {/* Card del departamento */}
          <View style={{
            width: '100%',
            backgroundColor: 'rgba(102, 126, 234, 0.1)',
            borderRadius: 12,
            padding: 16,
            borderLeftWidth: 4,
            borderLeftColor: '#667eea',
            marginBottom: 20,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
          }}>
            <View style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: 'rgba(102, 126, 234, 0.2)',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              <Ionicons name="business" size={24} color="#667eea" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{
                fontSize: 16,
                fontWeight: '700',
                color: '#1f2937',
                marginBottom: 4,
              }}>
                {departamento}
              </Text>
              <Text style={{
                fontSize: 13,
                color: '#6b7280',
              }}>
                Departamento asignado
              </Text>
            </View>
          </View>

          {/* Instrucciones */}
          <View style={{
            width: '100%',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            borderRadius: 12,
            padding: 16,
            borderLeftWidth: 4,
            borderLeftColor: '#3b82f6',
            marginBottom: 20,
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
                  📋 Pasos para eliminar este usuario:
                </Text>
                <View style={{ gap: 8 }}>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <Text style={{ color: '#3b82f6', fontWeight: '700', fontSize: 13 }}>1.</Text>
                    <Text style={{
                      color: '#1f2937',
                      fontSize: 13,
                      flex: 1,
                      lineHeight: 18,
                    }}>
                      Ve a <Text style={{ fontWeight: '700' }}>Gestión de Asignaciones</Text>
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <Text style={{ color: '#3b82f6', fontWeight: '700', fontSize: 13 }}>2.</Text>
                    <Text style={{
                      color: '#1f2937',
                      fontSize: 13,
                      flex: 1,
                      lineHeight: 18,
                    }}>
                      Remueve al usuario del departamento o reasígnalo a otro
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <Text style={{ color: '#3b82f6', fontWeight: '700', fontSize: 13 }}>3.</Text>
                    <Text style={{
                      color: '#1f2937',
                      fontSize: 13,
                      flex: 1,
                      lineHeight: 18,
                    }}>
                      Regresa aquí y podrás eliminar el usuario
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Botón de cerrar */}
          <TouchableOpacity
            style={[modalStyles.btnConfirm, {
              backgroundColor: '#667eea',
              width: '100%',
              paddingVertical: 14,
            }]}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Ionicons name="checkmark-circle" size={20} color="#ffffff" style={{ marginRight: 8 }} />
            <Text style={modalStyles.btnConfirmText}>Entendido</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

// Estilos para los modales
const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  btnCancel: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  btnCancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6b7280',
  },
  btnConfirm: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  btnConfirmText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
  },
  notificationOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingTop: 60,
    zIndex: 9999,
    pointerEvents: 'box-none',
  },
  notificationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    maxWidth: 400,
    minWidth: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
    gap: 12,
  },
  notificationMessage: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
  },
  closeBtn: {
    padding: 4,
  },
});

export default GestionUsuarioPage;
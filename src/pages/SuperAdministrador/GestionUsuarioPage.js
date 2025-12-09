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
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

import { rolService } from '../../api/services/rolService';
import { usuarioService } from '../../api/services/usuarioService';
import GestionUsuariosCard from '../../components/SuperAdministrador/GestionUsuarioCard';
import UsuarioCard from '../../components/SuperAdministrador/UsuarioCard';

import SuperAdminSidebar from '../../components/Sidebar/sidebarSuperAdmin';
import { contentStyles } from '../../components/Sidebar/SidebarSuperAdminStyles';
import SecurityValidator from '../../components/utils/SecurityValidator';
import { styles } from '../../styles/GestionUsuariosStyles';


const GestionUsuarioPage = () => {
  // ==================== ESTADOS ====================
  const [sidebarOpen, setSidebarOpen] = useState(true);
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



  const filtrarUsuarios = () => {
    const limiteCheck = rateLimiter.check(30); // 30 búsquedas por minuto
    if (!limiteCheck.allowed) {
      Alert.alert('Límite excedido', limiteCheck.message);
      return;
    }

    const lista = Array.isArray(usuarios) ? usuarios : [];
    let resultado = [...lista];


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
        console.error('Error recargando usuarios:', error);
      } finally {
        setLoading(false);
      }
    } else {
      // Si falló, solo cerrar
      cerrarFormulario();
    }
  };

  const confirmarEliminar = (usuario) => {
    // Validar que usuario tenga id válido
    if (!usuario || !usuario.id_usuario) {
      Alert.alert('Error', 'Usuario inválido');
      return;
    }

    const usernameSeguro = SecurityValidator.sanitizeText(usuario.username || 'este usuario');
    
    Alert.alert(
      'Confirmar Eliminación',
      `¿Estás seguro de eliminar al usuario ${usernameSeguro}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive',
          onPress: () => eliminarUsuario(usuario.id_usuario)
        }
      ]
    );
  };

  const eliminarUsuario = async (id_usuario) => {
    // Validar ID
    const idSeguro = parseInt(id_usuario);
    if (isNaN(idSeguro) || idSeguro <= 0) {
      Alert.alert('Error', 'ID de usuario inválido');
      return;
    }

    try {
      await usuarioService.delete(idSeguro);
      Alert.alert('Éxito', 'Usuario eliminado correctamente');
      await cargarUsuarios();
    } catch (error) {
      console.error('Error eliminando usuario:', error);
      const mensajeError = SecurityValidator.sanitizeText(
        error.message || 'No se pudo eliminar el usuario'
      );
      Alert.alert('Error', mensajeError);
    }
  };

  // ✅ CONTAR USUARIOS POR ROL (usando id_rol en lugar de nombre)
  const contarPorRol = (idRol) => {
    const lista = Array.isArray(usuarios) ? usuarios : [];
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
      {/* Sidebar */}
      <SuperAdminSidebar 
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

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
          <GestionUsuariosCard
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
                          {parseInt(totalUsuarios) || 0} usuarios registrados
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
    </View>
  );
};

export default GestionUsuarioPage;
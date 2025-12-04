// ==================================================================================
// src/pages/Administrador/GestionUsuarioPage.js
// Diseño Limpio y Moderno - Versión Simplificada + Sidebar SuperAdmin
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

// 🔹 Sidebar y estilos de layout (igual que en el dashboard)
import SuperAdminSidebar from '../../components/Sidebar/sidebarSuperAdmin';
import { contentStyles } from '../../components/Sidebar/SidebarSuperAdminStyles';

import { styles } from '../../styles/GestionUsuariosStyles';

const GestionUsuarioPage = () => {
  // ==================== ESTADOS ====================
  const [sidebarOpen, setSidebarOpen] = useState(true);      // 👈 Estado del sidebar
  const [loading, setLoading] = useState(false);
  const [usuarios, setUsuarios] = useState([]);               // Lista completa
  const [usuariosFiltrados, setUsuariosFiltrados] = useState([]); // Lista filtrada
  const [roles, setRoles] = useState([]);                    // Catálogo de roles
  const [busqueda, setBusqueda] = useState('');
  const [filtroRol, setFiltroRol] = useState('todos');
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);

  // ==================== ANIMACIONES ====================
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    cargarDatosIniciales();
  }, []);

  // ==================== FILTRADO ====================
  useEffect(() => {
    filtrarUsuarios();
  }, [usuarios, busqueda, filtroRol]);

  const filtrarUsuarios = () => {
    const lista = Array.isArray(usuarios) ? usuarios : [];
    let resultado = [...lista];

    // Filtrar por búsqueda
    if (busqueda.trim()) {
      const busquedaLower = busqueda.toLowerCase();
      resultado = resultado.filter(u => 
        u.persona?.nombre?.toLowerCase().includes(busquedaLower) ||
        u.persona?.apellido?.toLowerCase().includes(busquedaLower) ||
        u.username?.toLowerCase().includes(busquedaLower) ||
        u.email?.toLowerCase().includes(busquedaLower) ||
        u.persona?.cedula?.includes(busqueda)
      );
    }

    // Filtrar por rol
    if (filtroRol !== 'todos') {
      resultado = resultado.filter(u => 
        Array.isArray(u.roles) &&
        u.roles.some(r => r.nombre_rol?.toLowerCase() === filtroRol.toLowerCase())
      );
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
      const response = await usuarioService.getAll({
        skip: 0,
        limit: 100
      });

      let lista = [];
      if (Array.isArray(response)) {
        lista = response;
      } else if (response && Array.isArray(response.data)) {
        lista = response.data;
      } else {
        console.warn('⚠️ respuesta inesperada de usuarioService.getAll:', response);
      }

      console.log('👤 Usuarios cargados:', lista);
      setUsuarios(lista);
    } catch (error) {
      console.error('Error cargando usuarios:', error);
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
      } else {
        console.warn('⚠️ respuesta inesperada de rolService.listarRoles:', response);
      }

      console.log('🎭 Roles cargados:', listaRoles);
      setRoles(listaRoles);
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
      Alert.alert(
        'Éxito',
        usuarioSeleccionado 
          ? 'Usuario actualizado correctamente' 
          : 'Usuario creado correctamente'
      );
      await cargarUsuarios();
      cerrarFormulario();
    }
  };

  const confirmarEliminar = (usuario) => {
    Alert.alert(
      'Confirmar Eliminación',
      `¿Estás seguro de eliminar al usuario ${usuario.username}?`,
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
    try {
      await usuarioService.delete(id_usuario);
      Alert.alert('Éxito', 'Usuario eliminado correctamente');
      await cargarUsuarios();
    } catch (error) {
      console.error('Error eliminando usuario:', error);
      Alert.alert('Error', 'No se pudo eliminar el usuario');
    }
  };

  // Contar usuarios por rol
  const contarPorRol = (nombreRol) => {
    const lista = Array.isArray(usuarios) ? usuarios : [];
    if (nombreRol === 'todos') return lista.length;

    return lista.filter(u => 
      Array.isArray(u.roles) &&
      u.roles.some(r => r.nombre_rol?.toLowerCase() === nombreRol.toLowerCase())
    ).length;
  };

  // ==================== RENDER ====================
  return (
    <View style={contentStyles.wrapper}>
      {/* Sidebar */}
      <SuperAdminSidebar 
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Botón Toggle - mismo estilo que en Dashboard */}
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
                      <Text style={styles.headerSubtitle}>TecAi</Text>
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
                    placeholder="BUSCAR USUARIOS"
                    placeholderTextColor="#9CA3AF"
                    value={busqueda}
                    onChangeText={setBusqueda}
                  />
                </View>

                {/* Filtros de rol */}
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

                  <TouchableOpacity
                    style={[
                      styles.filterChip,
                      filtroRol === 'administrador' && styles.filterChipActive
                    ]}
                    onPress={() => setFiltroRol('administrador')}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.filterChipText,
                      filtroRol === 'administrador' && styles.filterChipTextActive
                    ]}>
                      Admins ({contarPorRol('administrador')})
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.filterChip,
                      filtroRol === 'funcionario' && styles.filterChipActive
                    ]}
                    onPress={() => setFiltroRol('funcionario')}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.filterChipText,
                      filtroRol === 'funcionario' && styles.filterChipTextActive
                    ]}>
                      Funcionarios ({contarPorRol('funcionario')})
                    </Text>
                  </TouchableOpacity>
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
            </ScrollView>
          </ScrollView>
        )}
      </View>
    </View>
  );
};
export default GestionUsuarioPage;

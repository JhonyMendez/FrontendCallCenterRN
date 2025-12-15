// ==================================================================================
// src/pages/Dashboard/DashboardFuncionarioPageAdmin.js
// Dashboard para Funcionario con autenticación y gestión de contenidos
// ==================================================================================

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { apiClient } from '../../api/client';
import {
  AddContentButton,
  ContentRow,
  FilterBar,
  HeaderCard,
  SearchBar
} from '../../components/Dashboard/DashboardFuncionarioCard';
import FuncionarioSidebar from '../../components/Sidebar/sidebarFuncionario';
import { contentStyles } from '../../components/Sidebar/SidebarSuperAdminStyles';
import { ROLES, useAuth } from '../../hooks/useAuth';
import { dashboardFuncionarioStyles } from '../../styles/dashboardFuncionarioStyles';

export default function DashboardFuncionarioPageAdmin() {
  const router = useRouter();
  
  // ==================================================================================
  // AUTENTICACIÓN - Hook personalizado para verificar permisos
  // ==================================================================================
  const { 
    loading: authLoading,
    usuario,
    rolPrincipal,
    tienePermiso,
    logout
  } = useAuth([ROLES.FUNCIONARIO]);

  // ==================================================================================
  // ESTADOS
  // ==================================================================================
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [contenidos, setContenidos] = useState([]);
  const [loadingContenidos, setLoadingContenidos] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // ==================================================================================
  // EFECTOS
  // ==================================================================================
  useEffect(() => {
    if (!authLoading && usuario) {
      cargarContenidos();
    }
  }, [authLoading, usuario]);

  // ==================================================================================
  // FUNCIONES DE CARGA DE DATOS
  // ==================================================================================
  const cargarContenidos = async () => {
    setLoadingContenidos(true);
    try {
      const response = await apiClient.get('/funcionario/contenidos');
      setContenidos(response.contenidos || []);
    } catch (error) {
      console.error('Error cargando contenidos:', error);
      // Datos de ejemplo si falla la API
      setContenidos([
        {
          id: 1,
          titulo: 'Matrículas',
          categoria: 'Información académica',
          estado: 'Publicado',
          fechaActualizacion: '2025-01-20'
        },
        {
          id: 2,
          titulo: 'Horarios',
          categoria: 'Requisitos Titulación',
          estado: 'Activo',
          fechaActualizacion: '2025-12-20'
        },
        {
          id: 3,
          titulo: 'Becas',
          categoria: 'Preguntas estudiantes',
          estado: 'Activo',
          fechaActualizacion: '2025-01-09'
        },
        {
          id: 4,
          titulo: 'Eventos',
          categoria: 'Funcionales',
          estado: 'Inactivo',
          fechaActualizacion: '2025-08-28'
        }
      ]);
    } finally {
      setLoadingContenidos(false);
    }
  };

  // ==================================================================================
  // HANDLERS DE ACCIONES
  // ==================================================================================
  const handleCerrarSesion = async () => {
    await logout();
  };

  const handleAddContent = () => {
    if (tienePermiso('puede_crear_contenido')) {
      router.push('/agregar-contenido');
    } else {
      alert('No tienes permiso para crear contenido');
    }
  };

  const handleEditContent = (id) => {
    if (tienePermiso('puede_editar_contenido')) {
      router.push(`/editar-contenido/${id}`);
    } else {
      alert('No tienes permiso para editar contenido');
    }
  };

  const handleDeleteContent = async (id) => {
    if (!tienePermiso('puede_eliminar_contenido')) {
      alert('No tienes permiso para eliminar contenido');
      return;
    }

    try {
      await apiClient.delete(`/funcionario/contenidos/${id}`);
      setContenidos(contenidos.filter(c => c.id !== id));
    } catch (error) {
      console.error('Error eliminando contenido:', error);
      alert('Error al eliminar el contenido');
    }
  };

  const handleSearch = () => {
    console.log('Buscar:', searchText);
  };

  // ==================================================================================
  // FILTRADO DE CONTENIDOS
  // ==================================================================================
  const contenidosFiltrados = contenidos.filter(contenido => {
    const matchSearch = searchText === '' || 
      contenido.titulo.toLowerCase().includes(searchText.toLowerCase());
    const matchCategory = selectedCategory === '' || 
      contenido.categoria === selectedCategory;
    const matchState = selectedState === '' || 
      contenido.estado === selectedState;
    
    return matchSearch && matchCategory && matchState;
  });

  // ==================================================================================
  // LOADING STATE - Verificación de autenticación
  // ==================================================================================
  if (authLoading) {
    return (
      <View style={contentStyles.wrapper}>
        <FuncionarioSidebar isOpen={sidebarOpen} />
        <View style={[contentStyles.mainContent, sidebarOpen && contentStyles.mainContentWithSidebar]}>
          <View style={[dashboardFuncionarioStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
            <ActivityIndicator size="large" color="#667eea" />
            <Text style={{ marginTop: 15, color: '#636e72', fontSize: 14 }}>
              Verificando autenticación...
            </Text>
          </View>
        </View>
      </View>
    );
  }

  // ==================================================================================
  // RENDER PRINCIPAL
  // ==================================================================================
  return (
    <View style={contentStyles.wrapper}>
      
      {/* ============ SIDEBAR ============ */}
      <FuncionarioSidebar 
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* ============ BOTÓN TOGGLE SIDEBAR ============ */}
      <TouchableOpacity
        style={{
          position: 'absolute',
          top: 16,
          left: sidebarOpen ? 296 : 16,
          zIndex: 1001,
          backgroundColor: '#1e1b4b',
          padding: 12,
          borderRadius: 12,
          shadowColor: '#667eea',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.4,
          shadowRadius: 8,
          elevation: 8,
        }}
        onPress={() => setSidebarOpen(!sidebarOpen)}
      >
        <Ionicons name={sidebarOpen ? "close" : "menu"} size={24} color="#ffffff" />
      </TouchableOpacity>

      {/* ============ CONTENIDO PRINCIPAL ============ */}
      <View style={[
        contentStyles.mainContent, 
        sidebarOpen && contentStyles.mainContentWithSidebar
      ]}>
        <View style={dashboardFuncionarioStyles.container}>
          <ScrollView 
            style={dashboardFuncionarioStyles.scrollView}
            showsVerticalScrollIndicator={false}
          >
            {/* Header Card */}
            <HeaderCard 
              username={usuario?.nombre_completo || usuario?.username}
              role={rolPrincipal?.nombre_rol || 'Funcionario'}
            />

            {/* Botón Agregar Contenido - Solo si tiene permiso */}
            {tienePermiso('puede_crear_contenido') && (
              <AddContentButton onPress={handleAddContent} />
            )}

            {/* Search Bar */}
            <SearchBar
              searchText={searchText}
              onChangeText={setSearchText}
              onSearch={handleSearch}
            />

            {/* Filter Bar */}
            <FilterBar
              selectedCategory={selectedCategory}
              selectedState={selectedState}
              onCategoryPress={() => console.log('Abrir selector de categoría')}
              onStatePress={() => console.log('Abrir selector de estado')}
            />

            {/* Loading de contenidos */}
            {loadingContenidos ? (
              <View style={{ padding: 30, alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#667eea" />
                <Text style={{ marginTop: 10, color: '#636e72' }}>
                  Cargando contenidos...
                </Text>
              </View>
            ) : (
              <>
                {/* Table Container */}
                <View style={dashboardFuncionarioStyles.tableContainer}>
                  {/* Table Header */}
                  <View style={dashboardFuncionarioStyles.tableHeader}>
                    <View style={dashboardFuncionarioStyles.headerCell}>
                      <Text style={dashboardFuncionarioStyles.headerText}>Título</Text>
                    </View>
                    <View style={dashboardFuncionarioStyles.headerCell}>
                      <Text style={dashboardFuncionarioStyles.headerText}>Categoría</Text>
                    </View>
                    <View style={dashboardFuncionarioStyles.headerCell}>
                      <Text style={dashboardFuncionarioStyles.headerText}>Estado</Text>
                    </View>
                    <View style={dashboardFuncionarioStyles.headerCell}>
                      <Text style={dashboardFuncionarioStyles.headerText}>Actualizaciones</Text>
                    </View>
                  </View>

                  {/* Content Rows */}
                  {contenidosFiltrados.length > 0 ? (
                    contenidosFiltrados.map((contenido) => (
                      <ContentRow
                        key={contenido.id}
                        titulo={contenido.titulo}
                        categoria={contenido.categoria}
                        estado={contenido.estado}
                        fechaActualizacion={contenido.fechaActualizacion}
                        onEdit={() => handleEditContent(contenido.id)}
                        onDelete={() => handleDeleteContent(contenido.id)}
                      />
                    ))
                  ) : (
                    <View style={{ padding: 30, alignItems: 'center' }}>
                      <Ionicons name="document-text-outline" size={48} color="#636e72" />
                      <Text style={{ marginTop: 15, color: '#636e72', textAlign: 'center' }}>
                        No se encontraron contenidos
                      </Text>
                    </View>
                  )}
                </View>
              </>
            )}

            {/* Footer */}
            <View style={dashboardFuncionarioStyles.footer}>
              <TouchableOpacity 
                style={dashboardFuncionarioStyles.footerButton}
                onPress={handleCerrarSesion}
              >
                <Ionicons name="log-out-outline" size={20} color="#ff4757" />
                <Text style={dashboardFuncionarioStyles.footerButtonText}>Cerrar sesión</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={dashboardFuncionarioStyles.footerButton}
                onPress={() => router.push('/configuracion')}
              >
                <Ionicons name="settings-outline" size={20} color="#636e72" />
                <Text style={dashboardFuncionarioStyles.footerButtonText}>Configuración</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={dashboardFuncionarioStyles.footerButton}
                onPress={() => router.push('/notificaciones')}
              >
                <Ionicons name="notifications-outline" size={20} color="#636e72" />
                <Text style={dashboardFuncionarioStyles.footerButtonText}>Notificaciones</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </View>
  );
}
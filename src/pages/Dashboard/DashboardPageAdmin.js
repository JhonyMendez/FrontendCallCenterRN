// ==================================================================================
// src/pages/Dashboard/DashboardPageAdmin.js
// Dashboard para Administrador con autenticación integrada
// ==================================================================================

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { apiClient } from '../../api/client';
import { ROLES, useAuth } from '../../hooks/useAuth';
import { dashboardStyles } from '../../styles/dashboardStyles';

export default function DashboardPageAdmin() {
  const router = useRouter();
  
  // ✅ Hook de autenticación - solo permite ADMIN
  const { 
    loading: authLoading,
    usuario,
    rolPrincipal,
    tienePermiso,
    logout
  } = useAuth([ROLES.ADMIN]);

  const [interacciones, setInteracciones] = useState(0);

  useEffect(() => {
    if (!authLoading && usuario) {
      cargarDatos();
    }
  }, [authLoading, usuario]);

  const cargarDatos = async () => {
    try {
      const response = await apiClient.get('/admin/dashboard/stats');
      setInteracciones(response.interaccionesHoy || 0);
    } catch (error) {
      console.error('Error cargando datos:', error);
    }
  };

  const handleCerrarSesion = async () => {
    await logout();
  };

  const menuItems = [
    {
      id: 1,
      title: 'Gestión Usuarios',
      icon: 'people',
      route: '/usuarios',
      gradient: ['#667eea', '#764ba2'],
      description: 'Administrar usuarios del sistema',
      permiso: 'puede_gestionar_usuarios'
    },
    {
      id: 2,
      title: 'Organización',
      icon: 'business',
      route: '/organizacion',
      gradient: ['#f093fb', '#f5576c'],
      description: 'Departamentos y estructura',
      permiso: 'puede_gestionar_departamentos'
    },
    {
      id: 3,
      title: 'Agentes',
      icon: 'chatbubbles',
      route: '/agentes',
      gradient: ['#4facfe', '#00f2fe'],
      description: 'Agentes virtuales de IA',
      permiso: 'puede_gestionar_agentes'
    },
    {
      id: 4,
      title: 'Métricas',
      icon: 'stats-chart',
      route: '/metricas',
      gradient: ['#43e97b', '#38f9d7'],
      description: 'Estadísticas y reportes',
      permiso: 'puede_ver_metricas'
    },
    {
      id: 5,
      title: 'Interacción',
      icon: 'git-network',
      route: '/interaccion',
      gradient: ['#fa709a', '#fee140'],
      description: 'Gestión de interacciones',
      permiso: 'puede_gestionar_interacciones'
    }
  ];

  // Filtrar según permisos
  const menuItemsFiltrados = menuItems.filter(item => 
    !item.permiso || tienePermiso(item.permiso)
  );

  // Loading de autenticación
  if (authLoading) {
    return (
      <View style={[dashboardStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={{ marginTop: 15, color: '#636e72', fontSize: 14 }}>
          Verificando autenticación...
        </Text>
      </View>
    );
  }

  return (
  <View style={contentStyles.wrapper}>
    
    {/* Sidebar */}
    <SuperAdminSidebar isOpen={sidebarOpen} />

    {/* Contenido principal */}
    <View style={contentStyles.mainContent}>

      {/* Botón del menú */}
      <TouchableOpacity
        style={[
          contentStyles.toggleButton,
          sidebarOpen && contentStyles.toggleButtonShifted
        ]}
        onPress={() => setSidebarOpen(!sidebarOpen)}
      >
        <Ionicons name={sidebarOpen ? "close" : "menu"} size={24} color="#ffffff" />
      </TouchableOpacity>

      {/* ScrollView del contenido */}
      <ScrollView
        style={dashboardStyles.container}
        contentContainerStyle={dashboardStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <HeaderCard
          nombre={usuario.nombre_completo}
          username={usuario.username}
          role={usuario.role}
        />

        {/* Aquí pegas ActivityCard, menuItems, footer, etc */}
      </ScrollView>
    </View>
  </View>
);  
}
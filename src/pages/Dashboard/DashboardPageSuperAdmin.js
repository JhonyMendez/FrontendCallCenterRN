// ==================================================================================
// DashboardPageSuperAdmin.js
// Dashboard para Super Administrador - Compatible con Web y Mobile
// ==================================================================================

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { apiClient } from '../../api/client';
import authService from '../../api/services/authService';
import {
  HeaderCard,
  InfoCard,
  QuickActionCard,
  SectionHeader,
  StatCard
} from '../../components/Dashboard/DashboardSuperAdminCard';
import SuperAdminSidebar from '../../components/Sidebar/sidebarSuperAdmin';
import { dashboardStyles } from '../../styles/dashboardSuperAdminStyles';

const isWeb = Platform.OS === 'web';

export default function DashboardPageSuperAdmin() {
  const router = useRouter();

  // State
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [usuario, setUsuario] = useState({
    nombre_completo: 'Alejandro Mendoza',
    username: 'admin',
    role: 'Super Administrador'
  });
  
  const [stats, setStats] = useState({
    totalUsuarios: 127,
    totalAgentes: 8,
    totalDepartamentos: 8,
    conversacionesHoy: 45,
    interaccionesHoy: 342,
    ticketsAbiertos: 23,
    satisfaccion: 94
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      console.log('Datos cargados');
    } catch (error) {
      console.error('Error cargando datos:', error);
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setStats({
        totalUsuarios: Math.floor(Math.random() * 50) + 100,
        totalAgentes: Math.floor(Math.random() * 5) + 5,
        totalDepartamentos: Math.floor(Math.random() * 5) + 5,
        conversacionesHoy: Math.floor(Math.random() * 30) + 30,
        interaccionesHoy: Math.floor(Math.random() * 200) + 250,
        ticketsAbiertos: Math.floor(Math.random() * 20) + 10,
        satisfaccion: Math.floor(Math.random() * 10) + 90
      });
      setLoading(false);
    }, 1000);
  };

  const handleLogout = async () => {
    try {
      await apiClient.removeToken();
      await authService.limpiarSesion();
      router.replace('/auth/login');
    } catch (error) {
      console.error('❌ Error cerrando sesión:', error);
    }
  };

  // Configuración de tarjetas de estadísticas
  const statsCards = [
    {
      title: 'Total Usuarios',
      value: stats.totalUsuarios,
      subtitle: 'Usuarios registrados',
      icon: 'people',
      color: '#3b82f6',
      trend: 12
    },
    {
      title: 'Agentes IA',
      value: stats.totalAgentes,
      subtitle: 'Agentes activos',
      icon: 'hardware-chip',
      color: '#8b5cf6',
      trend: 5
    },
    {
      title: 'Departamentos',
      value: stats.totalDepartamentos,
      subtitle: 'Áreas organizadas',
      icon: 'business',
      color: '#10b981',
      trend: 0
    },
    {
      title: 'Conversaciones',
      value: stats.conversacionesHoy,
      subtitle: 'Hoy',
      icon: 'chatbubbles',
      color: '#f59e0b',
      trend: -8
    }
  ];

  // Acciones rápidas
  const quickActions = [
    {
      id: 1,
      title: 'Gestionar Usuarios',
      description: 'Ver y administrar usuarios',
      icon: 'people-circle',
      color: '#3b82f6',
      route: '/(superadmin)/usuarios'
    },
    {
      id: 2,
      title: 'Configurar Agentes',
      description: 'Configuración de IA',
      icon: 'settings',
      color: '#8b5cf6',
      route: '/(superadmin)/agentes'
    },
    {
      id: 3,
      title: 'Ver Métricas',
      description: 'Estadísticas detalladas',
      icon: 'bar-chart',
      color: '#10b981',
      route: '/(superadmin)/metricas'
    },
    {
      id: 4,
      title: 'Organización',
      description: 'Estructura y departamentos',
      icon: 'git-network',
      color: '#ec4899',
      route: '/(superadmin)/organizacion'
    }
  ];

  // Loading state
  if (loading && stats.totalUsuarios === 0) {
    return (
      <View style={dashboardStyles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={dashboardStyles.loadingText}>Cargando dashboard...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, flexDirection: 'row', backgroundColor: '#0f172a' }}>
      
      {/* Sidebar */}
      <SuperAdminSidebar isOpen={sidebarOpen} />

      {/* Contenido Principal */}
      <View style={{ flex: 1, backgroundColor: '#0f172a' }}>
        
        {/* Header con botón toggle */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingVertical: 12,
          backgroundColor: '#1e1b4b',
          borderBottomWidth: 1,
          borderBottomColor: '#312e81',
        }}>
          <TouchableOpacity
            style={{
              backgroundColor: '#312e81',
              padding: 12,
              borderRadius: 12,
              marginRight: 12,
            }}
            onPress={() => setSidebarOpen(!sidebarOpen)}
          >
            <Ionicons name={sidebarOpen ? "close" : "menu"} size={24} color="#ffffff" />
          </TouchableOpacity>
          
          <Text style={{
            color: '#ffffff',
            fontSize: 18,
            fontWeight: '600',
            flex: 1,
          }}>
            Dashboard
          </Text>
        </View>

        <ScrollView 
          style={dashboardStyles.container} 
          contentContainerStyle={dashboardStyles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          
          {/* Header Card */}
          <HeaderCard
            nombre={usuario.nombre_completo}
            username={usuario.username}
            role={usuario.role}
          />

          {/* Stats Section */}
          <SectionHeader
            title="Estadísticas Generales"
            subtitle="Vista general del sistema"
            icon="stats-chart"
          />

          <View style={dashboardStyles.statsGrid}>
            {statsCards.map((card, index) => (
              <View key={index} style={dashboardStyles.statCardWrapper}>
                <StatCard
                  title={card.title}
                  value={card.value}
                  subtitle={card.subtitle}
                  icon={card.icon}
                  color={card.color}
                  trend={card.trend}
                  onClick={() => console.log(`Clicked: ${card.title}`)}
                />
              </View>
            ))}
          </View>

          {/* Info Cards Section */}
          <SectionHeader
            title="Actividad del Sistema"
            subtitle="Métricas en tiempo real"
            icon="pulse"
            onActionPress={handleRefresh}
            actionText="Actualizar"
          />

          <View style={dashboardStyles.infoGrid}>
            <View style={dashboardStyles.infoCardWrapper}>
              <InfoCard
                title="Interacciones"
                value={stats.interaccionesHoy}
                icon="chatbox-ellipses"
                color="#06b6d4"
                subtitle="En las últimas 24h"
              />
            </View>
            <View style={dashboardStyles.infoCardWrapper}>
              <InfoCard
                title="Tickets"
                value={stats.ticketsAbiertos}
                icon="ticket"
                color="#f97316"
                subtitle="Abiertos actualmente"
              />
            </View>
            <View style={dashboardStyles.infoCardWrapper}>
              <InfoCard
                title="Satisfacción"
                value={`${stats.satisfaccion}%`}
                icon="happy"
                color="#10b981"
                subtitle="Promedio mensual"
              />
            </View>
          </View>

          {/* Quick Actions Section */}
          <SectionHeader
            title="Acciones Rápidas"
            subtitle="Accesos directos"
            icon="flash"
          />

          <View style={dashboardStyles.quickActionsGrid}>
            {quickActions.map((action) => (
              <QuickActionCard
                key={action.id}
                title={action.title}
                description={action.description}
                icon={action.icon}
                color={action.color}
                onClick={() => console.log(`Navigate to: ${action.route}`)}
              />
            ))}
          </View>

          {/* Footer */}
          <View style={dashboardStyles.footer}>
            <View style={dashboardStyles.footerActions}>
              <TouchableOpacity
                style={[dashboardStyles.footerButton, dashboardStyles.logoutButton]}
                onPress={handleLogout}
              >
                <Ionicons name="log-out" size={20} color="#ef4444" />
                <Text style={dashboardStyles.logoutButtonText}>Cerrar sesión</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[dashboardStyles.footerButton, dashboardStyles.secondaryButton]}
                onPress={() => console.log('Settings')}
              >
                <Ionicons name="settings" size={20} color="#64748b" />
                <Text style={dashboardStyles.secondaryButtonText}>Configuración</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[dashboardStyles.footerButton, dashboardStyles.secondaryButton]}
                onPress={() => console.log('Notifications')}
              >
                <Ionicons name="notifications" size={20} color="#64748b" />
                <Text style={dashboardStyles.secondaryButtonText}>Notificaciones</Text>
              </TouchableOpacity>
            </View>
          </View>

        </ScrollView>
      </View>
    </View>
  );
}
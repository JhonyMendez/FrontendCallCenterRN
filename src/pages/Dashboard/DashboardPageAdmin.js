// ==================================================================================
// DashboardPageAdmin.js
// Dashboard para Administrador - Compatible con Web y Mobile
// ==================================================================================

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { apiClient } from '../../api/client';
import { agenteService } from '../../api/services/agenteService';
import authService from '../../api/services/authService';
import { departamentoService } from '../../api/services/departamentoService';
import { usuarioService } from '../../api/services/usuarioService';
import {
  HeaderCard,
  InfoCard,
  SectionHeader,
  StatCard
} from '../../components/Dashboard/DashboardSuperAdminCard';
import AdminSidebar from '../../components/Sidebar/sidebarAdmin';
import { dashboardStyles } from '../../styles/dashboardSuperAdminStyles';

const isWeb = Platform.OS === 'web';

export default function DashboardPageAdmin() {
  const router = useRouter();

  // State
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [usuario, setUsuario] = useState({
    nombre_completo: '',
    username: '',
    role: '',
    id_usuario: null
  });
  
  const [stats, setStats] = useState({
    totalUsuarios: 0,
    totalAgentes: 0,
    totalDepartamentos: 0,
    conversacionesHoy: 0,
    interaccionesHoy: 0,
    ticketsAbiertos: 0,
    satisfaccion: 0
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      console.log('🔄 [Dashboard Admin] Iniciando carga de datos...');
      
      // ⭐ ESTRATEGIA 1: Primero intentar desde localStorage (MÁS RÁPIDO)
      console.log('🔄 [Dashboard Admin] Intentando cargar desde localStorage...');
      let usuarioConfigLoaded = false;
      
      try {
        const posiblesClaves = ['@datos_sesion', 'datos_sesion', '@user_session'];
        
        for (const clave of posiblesClaves) {
          const data = localStorage.getItem(clave);
          
          if (data) {
            const parsed = JSON.parse(data);
            console.log(`📦 [Dashboard Admin] Datos en ${clave}:`, parsed);
            console.log(`📦 [Dashboard Admin] parsed.usuario:`, parsed.usuario);
            console.log(`📦 [Dashboard Admin] parsed.rolPrincipal:`, parsed.rolPrincipal);
            
            if (parsed.usuario) {
              const usuarioConfig = {
                id_usuario: parsed.usuario.id_usuario,
                // ⭐ Intentar múltiples variantes del nombre
                nombre_completo: parsed.usuario.nombre_completo || 
                                parsed.usuario.nombreCompleto || 
                                parsed.usuario.nombre || 
                                parsed.usuario.fullName || 
                                'Administrador',
                // ⭐ Intentar múltiples variantes del username
                username: parsed.usuario.username || 
                         parsed.usuario.userName || 
                         parsed.usuario.user_name || 
                         parsed.usuario.email?.split('@')[0] || 
                         'admin',
                role: parsed.rolPrincipal?.nombre_rol || 
                     parsed.rolPrincipal?.nombreRol || 
                     parsed.usuario.role || 
                     'Administrador'
              };
              console.log('✅ [Dashboard Admin] Usuario configurado desde localStorage:', usuarioConfig);
              setUsuario(usuarioConfig);
              usuarioConfigLoaded = true;
              break;
            }
          }
        }
      } catch (localStorageError) {
        console.warn('⚠️ [Dashboard Admin] Error leyendo localStorage:', localStorageError);
      }
      
      // ⭐ ESTRATEGIA 2: Si no se encontró en localStorage, intentar desde authService
      if (!usuarioConfigLoaded) {
        console.log('🔄 [Dashboard Admin] Intentando cargar desde authService...');
        const datosSesion = await authService.obtenerDatosSesion();
        console.log('📦 [Dashboard Admin] Datos de sesión:', datosSesion);
        
        if (datosSesion && datosSesion.usuario) {
          const usuarioConfig = {
            id_usuario: datosSesion.usuario.id_usuario,
            nombre_completo: datosSesion.usuario.nombre_completo || '',
            username: datosSesion.usuario.username || '',
            role: datosSesion.rolPrincipal?.nombre_rol || 'Administrador'
          };
          console.log('✅ [Dashboard Admin] Usuario configurado desde authService:', usuarioConfig);
          setUsuario(usuarioConfig);
          usuarioConfigLoaded = true;
        }
      }
      
      if (!usuarioConfigLoaded) {
        console.warn('⚠️ [Dashboard Admin] No se pudo obtener información del usuario');
      }
      
      // Cargar estadísticas en paralelo desde el backend
      console.log('📊 [Dashboard Admin] Iniciando carga de estadísticas...');
      
      console.log('📤 [Dashboard Admin] Llamando a usuarioService.listarCompleto()...');
      const usuarios = await usuarioService.listarCompleto({ limit: 1 }).catch((err) => {
        console.error('❌ [Dashboard Admin] Error al cargar usuarios:', err);
        return { total: 0 };
      });
      console.log('📦 [Dashboard Admin] Usuarios recibidos:', usuarios);
      
      console.log('📤 [Dashboard Admin] Llamando a agenteService.getAll()...');
      const agentes = await agenteService.getAll().catch((err) => {
        console.error('❌ [Dashboard Admin] Error al cargar agentes:', err);
        return [];
      });
      console.log('📦 [Dashboard Admin] Agentes recibidos:', agentes);
      
      console.log('📤 [Dashboard Admin] Llamando a departamentoService.getAll()...');
      const departamentos = await departamentoService.getAll().catch((err) => {
        console.error('❌ [Dashboard Admin] Error al cargar departamentos:', err);
        return [];
      });
      console.log('📦 [Dashboard Admin] Departamentos recibidos:', departamentos);
      
      // Actualizar estadísticas con datos reales
      const newStats = {
        totalUsuarios: usuarios.total || 0,
        totalAgentes: Array.isArray(agentes) ? agentes.length : (agentes.total || 0),
        totalDepartamentos: Array.isArray(departamentos) ? departamentos.length : 0,
        conversacionesHoy: 0, // TODO: Implementar endpoint en backend
        interaccionesHoy: 0, // TODO: Implementar endpoint en backend
        ticketsAbiertos: 0, // TODO: Implementar endpoint en backend
        satisfaccion: 0 // TODO: Implementar endpoint en backend
      };
      
      console.log('📊 [Dashboard Admin] Actualizando stats:', newStats);
      setStats(newStats);
      
      console.log('✅ [Dashboard Admin] Datos cargados correctamente');
    } catch (error) {
      console.error('❌ [Dashboard Admin] Error CRÍTICO cargando datos:', error);
      console.error('❌ [Dashboard Admin] Stack trace:', error.stack);
    } finally {
      console.log('🏁 [Dashboard Admin] Finalizando carga (loading = false)');
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    console.log('🔄 Refrescando datos...');
    await cargarDatos();
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
      trend: 0
    },
    {
      title: 'Agentes IA',
      value: stats.totalAgentes,
      subtitle: 'Agentes activos',
      icon: 'hardware-chip',
      color: '#8b5cf6',
      trend: 0
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
      trend: 0
    }
  ];

  // Loading state
  if (loading) {
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
      <AdminSidebar isOpen={sidebarOpen} />

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

        </ScrollView>
      </View>
    </View>
  );
}
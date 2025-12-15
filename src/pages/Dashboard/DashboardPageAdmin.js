// ==================================================================================
// DashboardPageAdmin.js
// Dashboard para Administrador - Compatible con Web y Mobile
// ==================================================================================

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { apiClient } from '../../api/client';
import authService from '../../api/services/authService';
import AdminSidebar from '../../components/Sidebar/sidebarAdmin';

const isWeb = Platform.OS === 'web';

export default function DashboardPageAdmin() {
  const router = useRouter();

  // State
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [usuario, setUsuario] = useState({
    nombre_completo: 'Admin Usuario',
    username: 'admin',
    role: 'Administrador'
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

  const handleLogout = async () => {
    try {
      await apiClient.removeToken();
      await authService.limpiarSesion();
      router.replace('/auth/login');
    } catch (error) {
      console.error('❌ Error cerrando sesión:', error);
    }
  };

  // Loading state
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a' }}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={{ color: '#ffffff', marginTop: 16 }}>Cargando dashboard...</Text>
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
            Dashboard Admin
          </Text>
        </View>

        <ScrollView 
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 20 }}
          showsVerticalScrollIndicator={false}
        >
          
          {/* Header Card */}
          <View style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            backgroundColor: '#667eea',
            borderRadius: 16,
            padding: 24,
            marginBottom: 24,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, marginBottom: 4 }}>
                Bienvenido de nuevo
              </Text>
              <Text style={{ color: '#ffffff', fontSize: 24, fontWeight: '700', marginBottom: 4 }}>
                {usuario.nombre_completo}
              </Text>
              <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 14 }}>
                @{usuario.username} • {usuario.role}
              </Text>
            </View>
            <View style={{
              backgroundColor: 'rgba(255,255,255,0.2)',
              width: 56,
              height: 56,
              borderRadius: 28,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              <Text style={{ color: '#ffffff', fontSize: 20, fontWeight: '700' }}>
                {usuario.nombre_completo.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </Text>
            </View>
          </View>

          {/* Stats Grid */}
          <View style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            marginHorizontal: -8,
            marginBottom: 24,
          }}>
            {[
              { title: 'Usuarios', value: '45', icon: 'people', color: '#3b82f6' },
              { title: 'Departamentos', value: '8', icon: 'business', color: '#10b981' },
              { title: 'Reportes', value: '23', icon: 'document-text', color: '#f59e0b' },
              { title: 'Actividad', value: '156', icon: 'pulse', color: '#8b5cf6' },
            ].map((stat, index) => (
              <View key={index} style={{ width: '50%', padding: 8 }}>
                <View style={{
                  backgroundColor: '#1e293b',
                  borderRadius: 12,
                  padding: 20,
                }}>
                  <View style={{
                    backgroundColor: stat.color,
                    width: 40,
                    height: 40,
                    borderRadius: 8,
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginBottom: 12,
                  }}>
                    <Ionicons name={stat.icon} size={24} color="#ffffff" />
                  </View>
                  <Text style={{ color: '#94a3b8', fontSize: 14, marginBottom: 4 }}>
                    {stat.title}
                  </Text>
                  <Text style={{ color: '#ffffff', fontSize: 28, fontWeight: '700' }}>
                    {stat.value}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {/* Quick Actions */}
          <View style={{ marginBottom: 24 }}>
            <Text style={{ color: '#ffffff', fontSize: 18, fontWeight: '600', marginBottom: 16 }}>
              Acciones Rápidas
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -8 }}>
              {[
                { title: 'Ver Usuarios', icon: 'people-circle', color: '#3b82f6' },
                { title: 'Reportes', icon: 'bar-chart', color: '#10b981' },
                { title: 'Configuración', icon: 'settings', color: '#f59e0b' },
                { title: 'Notificaciones', icon: 'notifications', color: '#8b5cf6' },
              ].map((action, index) => (
                <View key={index} style={{ width: '50%', padding: 8 }}>
                  <TouchableOpacity
                    style={{
                      backgroundColor: '#1e293b',
                      borderRadius: 12,
                      padding: 20,
                      alignItems: 'center',
                    }}
                    onPress={() => console.log(action.title)}
                  >
                    <View style={{
                      backgroundColor: action.color,
                      width: 48,
                      height: 48,
                      borderRadius: 24,
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginBottom: 12,
                    }}>
                      <Ionicons name={action.icon} size={24} color="#ffffff" />
                    </View>
                    <Text style={{ color: '#ffffff', fontSize: 14, fontWeight: '500', textAlign: 'center' }}>
                      {action.title}
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>

          {/* Footer */}
          <View style={{ marginTop: 24, paddingTop: 24, borderTopWidth: 1, borderTopColor: '#1e293b' }}>
            <TouchableOpacity
              style={{
                backgroundColor: '#dc2626',
                borderRadius: 12,
                padding: 16,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onPress={handleLogout}
            >
              <Ionicons name="log-out" size={20} color="#ffffff" />
              <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '600', marginLeft: 8 }}>
                Cerrar sesión
              </Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </View>
    </View>
  );
}
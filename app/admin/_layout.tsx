// app/(admin)/_layout.tsx
import { Stack } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { ROLES, useAuth } from '../../src/hooks/useAuth';

export default function AdminLayout() {
  const { loading, authenticated } = useAuth([ROLES.ADMIN]);

  // Mostrar loading mientras verifica autenticación
  if (loading) {
    return (
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5'
      }}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={{ marginTop: 15, color: '#6b7280', fontSize: 14 }}>
          Verificando permisos...
        </Text>
      </View>
    );
  }

  // Si no está autenticado, useAuth ya lo redirigió
  if (!authenticated) {
    return null;
  }

  // Usuario autenticado y con rol correcto
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#f5f5f5' }
      }}
    >
      <Stack.Screen
        name="dashboard"
        options={{ title: 'Dashboard Administrador' }}
      />
      <Stack.Screen
        name="usuarios"
        options={{ title: 'Gestión de Usuarios' }}
      />
      <Stack.Screen
        name="organizacion"
        options={{ title: 'Organización' }}
      />
      <Stack.Screen
        name="agentes"
        options={{ title: 'Agentes' }}
      />
      <Stack.Screen
        name="metricasAdmin"
        options={{ title: 'Métricas Administrador' }}
      />
      <Stack.Screen
        name="interaccion"
        options={{ title: 'Interacciones' }}
      />
      <Stack.Screen
        name="notificaciones"
        options={{ title: 'Notificaciones' }}
      />
      <Stack.Screen
        name="configuracion"
        options={{ title: 'Configuración' }}
      />
      <Stack.Screen
        name="PerfilAdmin"
        options={{ title: 'Mi Perfil' }}
      />
    </Stack>
  );
}
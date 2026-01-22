// app/superadmin/_layout.tsx
import { Stack } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { ROLES, useAuth } from '../../src/hooks/useAuth';

export default function SuperAdminLayout() {
  const { loading, authenticated } = useAuth([ROLES.SUPER_ADMIN]);

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
          Verificando permisos de Super Administrador...
        </Text>
      </View>
    );
  }

  if (!authenticated) {
    return null;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#f5f5f5' }
      }}
    >
      <Stack.Screen
        name="dashboard"
        options={{ title: 'Dashboard Super Admin' }}
      />
      <Stack.Screen
        name="agente"
        options={{ title: 'Gestión de Agentes' }}
      />
      <Stack.Screen
        name="categoria"
        options={{ title: 'Categorías' }}
      />
      <Stack.Screen
        name="contenido"
        options={{ title: 'Contenido' }}
      />
      <Stack.Screen
        name="departamento"
        options={{ title: 'Departamentos' }}
      />
      <Stack.Screen
        name="DepartamentoUsuario"
        options={{ title: 'Departamento-Usuario' }}
      />
      <Stack.Screen
        name="metricas"
        options={{ title: 'Métricas del Sistema' }}
      />
      <Stack.Screen
        name="usuario"
        options={{ title: 'Gestión de Usuarios' }}
      />
      <Stack.Screen
        name="perfil"
        options={{ title: 'Mi Perfil' }}
      />
    </Stack>
  );
}
// app/funcionario/_layout.tsx
import { Stack } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { ROLES, useAuth } from '../../src/hooks/useAuth';

export default function FuncionarioLayout() {
  const { loading, authenticated } = useAuth([ROLES.FUNCIONARIO]);

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
          Verificando acceso...
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
        options={{ title: 'Dashboard Funcionario' }}
      />
      <Stack.Screen
        name="detalle-conversacion"
        options={{ title: 'Detalle de Conversación' }}
      />
      <Stack.Screen
        name="gestionAgenteFuncionario"
        options={{ title: 'Gestión de Agentes' }}
      />
      <Stack.Screen
        name="gestionCategoriaFuncionario"
        options={{ title: 'Gestión de Categorías' }}
      />
      <Stack.Screen
        name="gestionContenidoFuncionario"
        options={{ title: 'Gestión de Contenido' }}
      />
      <Stack.Screen
        name="gestionconversacion"
        options={{ title: 'Gestión de Conversaciones' }}
      />
      <Stack.Screen
        name="PerfilFuncionario"
        options={{ title: 'Mi Perfil' }}
      />
    </Stack>
  );
}
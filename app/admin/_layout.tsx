// app/(admin)/_layout.tsx
import { Stack } from 'expo-router';

export default function AdminLayout() {
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
      <Stack.Screen name="usuarios" />
      <Stack.Screen name="organizacion" />
      <Stack.Screen name="agentes" />
      <Stack.Screen name="metricas" />
      <Stack.Screen name="interaccion" />
      <Stack.Screen name="notificaciones" />
      <Stack.Screen name="configuracion" />
    </Stack>
  );
}
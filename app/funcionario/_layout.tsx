// app/(funcionario)/_layout.tsx
import { Stack } from 'expo-router';

export default function FuncionarioLayout() {
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
      <Stack.Screen name="agentes" />
      <Stack.Screen name="metricas" />
      <Stack.Screen name="interacciones" />
      <Stack.Screen name="exportar" />
      <Stack.Screen name="notificaciones" />
      <Stack.Screen name="configuracion" />
    </Stack>
  );
}
// ==================================================================================
// app/(superadmin)/_layout.tsx
// Layout para el grupo de rutas de Super Admin
// ==================================================================================

import { Stack } from 'expo-router';

export default function SuperAdminLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#f5f5f5' }
      }}
    >
      {/* Rutas de primer nivel */}
      <Stack.Screen 
        name="dashboard" 
        options={{ title: 'Dashboard Super Admin' }}
      />

      {/* ✅ CORRECTO: Solo el nombre de la carpeta, sin /index */}
      <Stack.Screen 
        name="usuarios"
        options={{ title: 'Gestión de Usuarios' }}
      />

      {/* Otras rutas */}
      <Stack.Screen 
        name="agentes"
        options={{ title: 'Gestión de Agentes' }}
      />
      
      <Stack.Screen 
        name="organizacion"
        options={{ title: 'Organización' }}
      />
      
      <Stack.Screen 
        name="metricas"
        options={{ title: 'Métricas Globales' }}
      />
      
      <Stack.Screen 
        name="roles"
        options={{ title: 'Gestión de Roles' }}
      />
      
      <Stack.Screen 
        name="sistema"
        options={{ title: 'Sistema' }}
      />
      
      <Stack.Screen 
        name="api-keys"
        options={{ title: 'API Keys' }}
      />
      
      <Stack.Screen 
        name="interacciones"
        options={{ title: 'Interacciones' }}
      />
      
      <Stack.Screen 
        name="logs"
        options={{ title: 'Logs del Sistema' }}
      />
      
      <Stack.Screen 
        name="backups"
        options={{ title: 'Backups' }}
      />
      
      <Stack.Screen 
        name="notificaciones"
        options={{ title: 'Notificaciones' }}
      />
      
      <Stack.Screen 
        name="configuracion"
        options={{ title: 'Configuración' }}
      />
    </Stack>
  );
}
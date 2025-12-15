// app/index.tsx
import { apiClient } from '@/src/api/client';
import authService from '@/src/api/services/authService';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, Platform, StatusBar, StyleSheet, View } from 'react-native';

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    verificarAutenticacion();
  }, []);

  const verificarAutenticacion = async () => {
    try {
      // Verificar si hay token
      const token = await apiClient.getToken();
      
      if (!token) {
        console.log('❌ No hay token, redirigiendo a login');
        router.replace('/auth/login');
        return;
      }

      // Obtener datos de sesión
      const datosSesion = await authService.obtenerDatosSesion();
      
      if (!datosSesion || !datosSesion.rolPrincipal) {
        console.log('❌ No hay sesión válida');
        await apiClient.removeToken();
        await authService.limpiarSesion();
        router.replace('/auth/login');
        return;
      }

      // Redirigir según rol
      const ruta = authService.getRutaPorRol(datosSesion.rolPrincipal.id_rol);
      console.log('✅ Sesión válida, redirigiendo a:', ruta);
      router.replace(ruta as any);

    } catch (error) {
      console.error('❌ Error verificando autenticación:', error);
      router.replace('/auth/login');
    }
  };

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#3b82f6" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
});
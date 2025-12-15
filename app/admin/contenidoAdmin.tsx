// app/(superadmin)/departamentos.tsx
import GestionContenidoAdminPage from '@/src/pages/Administrador/GestionContenidoAdminPage';
import { Platform, StatusBar, StyleSheet, View } from 'react-native';

export default function DepartamentosScreen() {
  return (
    <View style={styles.container}>
      <GestionContenidoAdminPage />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
});
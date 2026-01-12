// app/(superadmin)/departamentoAdmin.tsx
import GestionDepartamentosAdminPage from '@/src/pages/Administrador/GestionDepartamentosAdminPage';
import { Platform, StatusBar, StyleSheet, View } from 'react-native';

export default function DepartamentoAdminScreen() {
  return (
    <View style={styles.container}>
      <GestionDepartamentosAdminPage />
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
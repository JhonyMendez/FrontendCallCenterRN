// app/superadmin/asignaciones.tsx
import GestionAsignacionUsPage from '@/src/pages/SuperAdministrador/GestionAsignacionUsPage';
import { Platform, StatusBar, StyleSheet, View } from 'react-native';

export default function AsignacionesScreen() {
  return (
    <View style={styles.container}>
      <GestionAsignacionUsPage />
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

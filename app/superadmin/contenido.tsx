// app/superadmin/contenido.tsx
import GestionContenidoPage from '@/src/pages/SuperAdministrador/GestionContenidoPage';
import { Platform, StatusBar, StyleSheet, View } from 'react-native';

export default function ContenidoScreen() {
  return (
    <View style={styles.container}>
      <GestionContenidoPage />
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
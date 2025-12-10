// app/superadmin/categoria.tsx
import GestionContenidoPage from '@/src/pages/SuperAdministrador/GestionContenidoPage';
import { Platform, StatusBar, StyleSheet, View } from 'react-native';

export default function CategoriaScreen() {
  return (
    <View style={styles.container}>
      <GestionContenidoPage />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f23',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
});
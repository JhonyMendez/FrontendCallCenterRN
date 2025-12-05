// app/superadmin/categoria.tsx
import GestionCategoriaPage from '@/src/pages/SuperAdministrador/GestionCategoriaPage';
import { Platform, StatusBar, StyleSheet, View } from 'react-native';

export default function CategoriaScreen() {
  return (
    <View style={styles.container}>
      <GestionCategoriaPage />
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
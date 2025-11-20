// app/departamentos.tsx
import ListaDepartamentos from '@/src/pages/Departamentos/ListaDepartamentos';
import { Platform, StatusBar, StyleSheet, View } from 'react-native';

export default function DepartamentosScreen() {
  return (
    <View style={styles.container}>
      <ListaDepartamentos />
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
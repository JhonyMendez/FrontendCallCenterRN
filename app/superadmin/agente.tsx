// app/superadmin/agente.tsx
import GestionAgentePage from '@/src/pages/SuperAdministrador/GestionAgentePage';
import { Platform, StatusBar, StyleSheet, View } from 'react-native';

export default function AgenteScreen() {
  return (
    <View style={styles.container}>
        <GestionAgentePage />
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
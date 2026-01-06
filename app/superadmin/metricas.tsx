//app/superadmin/metricas.tsx
import GestionMetricas from '@/src/pages/SuperAdministrador/GestionMetricas';
import { Platform, StatusBar, StyleSheet, View } from 'react-native';

export default function MetricasScreen() {
    return (
        <View style={styles.container}>
            <GestionMetricas />
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
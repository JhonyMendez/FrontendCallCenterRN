//app/funcionario/metricasFuncionario.tsx
import GestionMetricasFuncionario from '@/src/pages/Funcionario/GestionMetricasFuncionario';
import { Platform, StatusBar, StyleSheet, View } from 'react-native';

export default function MetricasScreen() {
    return (
        <View style={styles.container}>
            <GestionMetricasFuncionario />
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
//app/admin/PerfilAdmin.tsx
import GestionPerfilAdmin from '@/src/pages/Administrador/GestionPerfilAdminPage';
import { Platform, StatusBar, StyleSheet, View } from 'react-native';

export default function PerfilScreen() {
    return (
        <View style={styles.container}>
            <GestionPerfilAdmin />
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
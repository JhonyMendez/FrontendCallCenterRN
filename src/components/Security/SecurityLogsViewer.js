// ==================================================================================
// src/components/Security/SecurityLogsViewer.js
// Componente para ver y exportar logs de seguridad
// ==================================================================================

import { useEffect, useState } from 'react';
import { Alert, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { storage } from '../../pages/Login/LoginPage';

export default function SecurityLogsViewer() {
    const [logs, setLogs] = useState([]);
    const [filtro, setFiltro] = useState('todos');

    useEffect(() => {
        cargarLogs();
    }, []);

    const cargarLogs = async () => {
        try {
            const logsStr = await storage.getItem('@security_logs');
            if (logsStr) {
                const logsData = JSON.parse(logsStr);
                setLogs(logsData);
            }
        } catch (error) {
            console.error('Error cargando logs:', error);
        }
    };

    const filtrarLogs = () => {
        if (filtro === 'todos') return logs;
        return logs.filter(log => log.tipo.includes(filtro.toUpperCase()));
    };

    const exportarLogs = () => {
        try {
            const logsTexto = logs
                .map(log =>
                    `[${log.timestamp}] ${log.tipo}\n` +
                    `Device: ${log.deviceFingerprint}\n` +
                    `Data: ${JSON.stringify(log.datos, null, 2)}\n` +
                    '---\n'
                )
                .join('\n');

            if (Platform.OS === 'web') {
                const element = document.createElement('a');
                const file = new Blob([logsTexto], { type: 'text/plain' });
                element.href = URL.createObjectURL(file);
                element.download = `security-logs-${Date.now()}.txt`;
                document.body.appendChild(element);
                element.click();
                document.body.removeChild(element);
            } else {
                Alert.alert('Logs exportados', 'Los logs de seguridad se han copiado al portapapeles');
            }
        } catch (error) {
            Alert.alert('Error', 'No se pudieron exportar los logs');
        }
    };

    const limpiarLogs = () => {
        Alert.alert(
            '⚠️ Confirmar',
            '¿Deseas limpiar todos los logs de seguridad?',
            [
                { text: 'Cancelar' },
                {
                    text: 'Limpiar',
                    onPress: async () => {
                        await storage.removeItem('@security_logs');
                        setLogs([]);
                        Alert.alert('✅ Completado', 'Los logs han sido eliminados');
                    }
                }
            ]
        );
    };

    const logsFiltrados = filtrarLogs();

    return (
        <View style={{ flex: 1, backgroundColor: '#0f0f23', padding: 16 }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#fff', marginBottom: 16 }}>
                🔒 Security Logs
            </Text>

            {/* Botones de acción */}
            <View style={{ flexDirection: 'row', marginBottom: 16, gap: 8 }}>
                <TouchableOpacity
                    onPress={exportarLogs}
                    style={{
                        flex: 1,
                        backgroundColor: '#4CAF50',
                        padding: 10,
                        borderRadius: 8,
                        alignItems: 'center'
                    }}
                >
                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>📥 Exportar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={limpiarLogs}
                    style={{
                        flex: 1,
                        backgroundColor: '#f44336',
                        padding: 10,
                        borderRadius: 8,
                        alignItems: 'center'
                    }}
                >
                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>🗑️ Limpiar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={cargarLogs}
                    style={{
                        flex: 1,
                        backgroundColor: '#2196F3',
                        padding: 10,
                        borderRadius: 8,
                        alignItems: 'center'
                    }}
                >
                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>🔄 Refrescar</Text>
                </TouchableOpacity>
            </View>

            {/* Contador */}
            <Text style={{ color: '#aaa', marginBottom: 16 }}>
                Total: {logsFiltrados.length} eventos | Todos: {logs.length}
            </Text>

            {/* Logs */}
            <ScrollView style={{ flex: 1 }}>
                {logsFiltrados.length > 0 ? (
                    logsFiltrados.map((log, index) => (
                        <View
                            key={index}
                            style={{
                                backgroundColor: '#1a1a2e',
                                padding: 12,
                                marginBottom: 8,
                                borderRadius: 8,
                                borderLeftWidth: 4,
                                borderLeftColor: log.tipo.includes('ERROR') ? '#f44336' :
                                    log.tipo.includes('EXITOSO') ? '#4CAF50' :
                                        log.tipo.includes('FALLIDO') ? '#ff9800' :
                                            '#2196F3'
                            }}
                        >
                            <Text style={{ color: '#fff', fontWeight: 'bold', marginBottom: 4 }}>
                                {log.tipo}
                            </Text>
                            <Text style={{ color: '#aaa', fontSize: 12, marginBottom: 4 }}>
                                {log.timestamp}
                            </Text>
                            <Text style={{ color: '#999', fontSize: 11, marginBottom: 4 }}>
                                Device: {log.deviceFingerprint}
                            </Text>
                            <Text style={{ color: '#bbb', fontSize: 11 }}>
                                {JSON.stringify(log.datos)}
                            </Text>
                        </View>
                    ))
                ) : (
                    <Text style={{ color: '#aaa', textAlign: 'center', marginTop: 20 }}>
                        No hay logs
                    </Text>
                )}
            </ScrollView>
        </View>
    );
}

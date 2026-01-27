// src/components/Modals/ExportExcelModal.js
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    Platform,
    ScrollView,
    Switch,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { conversationMongoService } from '../../api/services/conversationMongoService';

const isWeb = Platform.OS === 'web';

export default function ExportExcelModal({ 
    visible, 
    onClose, 
    agentesDisponibles = [] 
}) {
    const [loading, setLoading] = useState(false);
    const [filtros, setFiltros] = useState({
        id_agente: null,
        estado: null,
        origin: null,
        escaladas: null,
        fecha_inicio: null,
        fecha_fin: null,
        calificacion_min: null,
        calificacion_max: null,
        incluir_visitante: true
    });

    // Opciones de filtros
    const estados = [
        { value: null, label: 'Todos los estados' },
        { value: 'activa', label: 'Activas' },
        { value: 'finalizada', label: 'Finalizadas' },
        { value: 'abandonada', label: 'Abandonadas' },
        { value: 'escalada_humano', label: 'Escaladas a Humano' }
    ];

    const origenes = [
        { value: null, label: 'Todos los orígenes' },
        { value: 'web', label: 'Web' },
        { value: 'mobile', label: 'Mobile' },
        { value: 'widget', label: 'Widget' },
        { value: 'api', label: 'API' }
    ];

    const periodos = [
        { value: 'todo', label: 'Todo el historial' },
        { value: 'hoy', label: 'Hoy' },
        { value: 'semana', label: 'Última semana' },
        { value: 'mes', label: 'Último mes' },
        { value: 'año', label: 'Último año' }
    ];

    const calificaciones = [
        { value: null, label: 'Todas' },
        { value: 1, label: '1 estrella' },
        { value: 2, label: '2 estrellas' },
        { value: 3, label: '3 estrellas' },
        { value: 4, label: '4 estrellas' },
        { value: 5, label: '5 estrellas' }
    ];

    // Calcular fechas según período
    const calcularFechas = (periodo) => {
        const ahora = new Date();
        let fechaInicio = null;

        switch (periodo) {
            case 'hoy':
                fechaInicio = new Date(ahora);
                fechaInicio.setHours(0, 0, 0, 0);
                break;
            case 'semana':
                fechaInicio = new Date(ahora);
                fechaInicio.setDate(ahora.getDate() - 7);
                break;
            case 'mes':
                fechaInicio = new Date(ahora);
                fechaInicio.setDate(ahora.getDate() - 30);
                break;
            case 'año':
                fechaInicio = new Date(ahora);
                fechaInicio.setFullYear(ahora.getFullYear() - 1);
                break;
            default:
                return { fecha_inicio: null, fecha_fin: null };
        }

        return {
            fecha_inicio: fechaInicio.toISOString(),
            fecha_fin: ahora.toISOString()
        };
    };

    const handleExport = async () => {
        try {
            setLoading(true);

            // Construir parámetros de exportación
            const params = {
                id_agente: filtros.id_agente,
                estado: filtros.estado,
                origin: filtros.origin,
                escaladas: filtros.escaladas,
                fecha_inicio: filtros.fecha_inicio,
                fecha_fin: filtros.fecha_fin,
                calificacion_min: filtros.calificacion_min,
                calificacion_max: filtros.calificacion_max,
                incluir_visitante: filtros.incluir_visitante
            };

            console.log('📤 Exportando con parámetros:', params);

            // 🔥 Usar el servicio de conversationMongoService
            const blob = await conversationMongoService.exportToExcel(params);

            // Descargar archivo
            if (Platform.OS === 'web') {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `conversaciones_${new Date().toISOString().split('T')[0]}.xlsx`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);

                Alert.alert(
                    'Éxito',
                    'El archivo se ha descargado correctamente',
                    [{ text: 'OK', onPress: onClose }]
                );
            } else {
                // Para mobile, necesitarías usar FileSystem de expo
                Alert.alert(
                    'Éxito',
                    'Archivo exportado. Descarga iniciada.',
                    [{ text: 'OK', onPress: onClose }]
                );
            }

        } catch (error) {
            console.error('❌ Error exportando:', error);
            Alert.alert(
                'Error',
                error.message || 'No se pudo exportar el archivo. Intenta nuevamente.',
                [{ text: 'OK' }]
            );
        } finally {
            setLoading(false);
        }
    };

    const limpiarFiltros = () => {
        setFiltros({
            id_agente: null,
            estado: null,
            origin: null,
            escaladas: null,
            fecha_inicio: null,
            fecha_fin: null,
            calificacion_min: null,
            calificacion_max: null,
            incluir_visitante: true
        });
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={{
                flex: 1,
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                justifyContent: 'center',
                alignItems: 'center',
                padding: 20
            }}>
                <View style={{
                    backgroundColor: '#1a1a2e',
                    borderRadius: 25,
                    width: isWeb ? 600 : '100%',
                    maxHeight: '90%',
                    borderWidth: 1,
                    borderColor: 'rgba(102, 126, 234, 0.2)',
                    shadowColor: '#667eea',
                    shadowOpacity: 0.3,
                    shadowRadius: 20,
                    shadowOffset: { width: 0, height: 10 },
                    elevation: 15
                }}>
                    {/* Header */}
                    <LinearGradient
                        colors={['#667eea', '#764ba2']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            paddingHorizontal: 25,
                            paddingVertical: 20,
                            borderTopLeftRadius: 25,
                            borderTopRightRadius: 25
                        }}
                    >
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Ionicons name="download-outline" size={28} color="#fff" />
                            <Text style={{
                                fontSize: 22,
                                fontWeight: '900',
                                color: '#fff',
                                marginLeft: 12
                            }}>
                                Exportar a Excel
                            </Text>
                        </View>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close-circle" size={28} color="#fff" />
                        </TouchableOpacity>
                    </LinearGradient>

                    {/* Content */}
                    <ScrollView style={{ maxHeight: 500, padding: 25 }}>
                        {/* Período */}
                        <View style={{ marginBottom: 20 }}>
                            <Text style={{
                                fontSize: 14,
                                fontWeight: '700',
                                color: '#fff',
                                marginBottom: 10
                            }}>
                                📅 Período
                            </Text>
                            <View style={{
                                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                                borderRadius: 12,
                                borderWidth: 1,
                                borderColor: 'rgba(102, 126, 234, 0.3)'
                            }}>
                                <Picker
                                    selectedValue={filtros.periodo || 'todo'}
                                    onValueChange={(value) => {
                                        const fechas = calcularFechas(value);
                                        setFiltros(prev => ({
                                            ...prev,
                                            periodo: value,
                                            fecha_inicio: fechas.fecha_inicio,
                                            fecha_fin: fechas.fecha_fin
                                        }));
                                    }}
                                    style={{ color: '#fff', height: 50 }}
                                    dropdownIconColor="#a29bfe"
                                >
                                    {periodos.map(p => (
                                        <Picker.Item 
                                            key={p.value} 
                                            label={p.label} 
                                            value={p.value}
                                        />
                                    ))}
                                </Picker>
                            </View>
                        </View>

                        {/* Agente */}
                        <View style={{ marginBottom: 20 }}>
                            <Text style={{
                                fontSize: 14,
                                fontWeight: '700',
                                color: '#fff',
                                marginBottom: 10
                            }}>
                                🤖 Agente Virtual
                            </Text>
                            <View style={{
                                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                                borderRadius: 12,
                                borderWidth: 1,
                                borderColor: 'rgba(102, 126, 234, 0.3)'
                            }}>
                                <Picker
                                    selectedValue={filtros.id_agente}
                                    onValueChange={(value) => setFiltros(prev => ({ ...prev, id_agente: value }))}
                                    style={{ color: '#fff', height: 50 }}
                                    dropdownIconColor="#a29bfe"
                                >
                                    <Picker.Item label="Todos los agentes" value={null} />
                                    {agentesDisponibles.map(agente => (
                                        <Picker.Item 
                                            key={agente.id} 
                                            label={agente.nombre} 
                                            value={agente.id}
                                        />
                                    ))}
                                </Picker>
                            </View>
                        </View>

                        {/* Estado */}
                        <View style={{ marginBottom: 20 }}>
                            <Text style={{
                                fontSize: 14,
                                fontWeight: '700',
                                color: '#fff',
                                marginBottom: 10
                            }}>
                                📊 Estado
                            </Text>
                            <View style={{
                                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                                borderRadius: 12,
                                borderWidth: 1,
                                borderColor: 'rgba(102, 126, 234, 0.3)'
                            }}>
                                <Picker
                                    selectedValue={filtros.estado}
                                    onValueChange={(value) => setFiltros(prev => ({ ...prev, estado: value }))}
                                    style={{ color: '#fff', height: 50 }}
                                    dropdownIconColor="#a29bfe"
                                >
                                    {estados.map(e => (
                                        <Picker.Item key={e.value || 'all'} label={e.label} value={e.value} />
                                    ))}
                                </Picker>
                            </View>
                        </View>

                        {/* Origen */}
                        <View style={{ marginBottom: 20 }}>
                            <Text style={{
                                fontSize: 14,
                                fontWeight: '700',
                                color: '#fff',
                                marginBottom: 10
                            }}>
                                📱 Origen
                            </Text>
                            <View style={{
                                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                                borderRadius: 12,
                                borderWidth: 1,
                                borderColor: 'rgba(102, 126, 234, 0.3)'
                            }}>
                                <Picker
                                    selectedValue={filtros.origin}
                                    onValueChange={(value) => setFiltros(prev => ({ ...prev, origin: value }))}
                                    style={{ color: '#fff', height: 50 }}
                                    dropdownIconColor="#a29bfe"
                                >
                                    {origenes.map(o => (
                                        <Picker.Item key={o.value || 'all'} label={o.label} value={o.value} />
                                    ))}
                                </Picker>
                            </View>
                        </View>

                        {/* Calificación */}
                        <View style={{ marginBottom: 20 }}>
                            <Text style={{
                                fontSize: 14,
                                fontWeight: '700',
                                color: '#fff',
                                marginBottom: 10
                            }}>
                                ⭐ Calificación
                            </Text>
                            <View style={{ flexDirection: 'row', gap: 10 }}>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ fontSize: 12, color: '#a29bfe', marginBottom: 5 }}>Mínima</Text>
                                    <View style={{
                                        backgroundColor: 'rgba(102, 126, 234, 0.1)',
                                        borderRadius: 12,
                                        borderWidth: 1,
                                        borderColor: 'rgba(102, 126, 234, 0.3)'
                                    }}>
                                        <Picker
                                            selectedValue={filtros.calificacion_min}
                                            onValueChange={(value) => setFiltros(prev => ({ ...prev, calificacion_min: value }))}
                                            style={{ color: '#fff', height: 50 }}
                                            dropdownIconColor="#a29bfe"
                                        >
                                            {calificaciones.map(c => (
                                                <Picker.Item key={`min-${c.value}`} label={c.label} value={c.value} />
                                            ))}
                                        </Picker>
                                    </View>
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ fontSize: 12, color: '#a29bfe', marginBottom: 5 }}>Máxima</Text>
                                    <View style={{
                                        backgroundColor: 'rgba(102, 126, 234, 0.1)',
                                        borderRadius: 12,
                                        borderWidth: 1,
                                        borderColor: 'rgba(102, 126, 234, 0.3)'
                                    }}>
                                        <Picker
                                            selectedValue={filtros.calificacion_max}
                                            onValueChange={(value) => setFiltros(prev => ({ ...prev, calificacion_max: value }))}
                                            style={{ color: '#fff', height: 50 }}
                                            dropdownIconColor="#a29bfe"
                                        >
                                            {calificaciones.map(c => (
                                                <Picker.Item key={`max-${c.value}`} label={c.label} value={c.value} />
                                            ))}
                                        </Picker>
                                    </View>
                                </View>
                            </View>
                        </View>

                        {/* Solo Escaladas */}
                        <View style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            backgroundColor: 'rgba(102, 126, 234, 0.08)',
                            padding: 15,
                            borderRadius: 12,
                            marginBottom: 20
                        }}>
                            <View style={{ flex: 1 }}>
                                <Text style={{ fontSize: 14, fontWeight: '700', color: '#fff' }}>
                                    🆘 Solo escaladas
                                </Text>
                                <Text style={{ fontSize: 12, color: '#a29bfe', marginTop: 4 }}>
                                    Conversaciones que requirieron atención humana
                                </Text>
                            </View>
                            <Switch
                                value={filtros.escaladas === true}
                                onValueChange={(value) => setFiltros(prev => ({ 
                                    ...prev, 
                                    escaladas: value ? true : null 
                                }))}
                                trackColor={{ false: '#3e3e3e', true: '#667eea' }}
                                thumbColor={filtros.escaladas ? '#fff' : '#f4f3f4'}
                            />
                        </View>

                        {/* Incluir datos de visitante */}
                        <View style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            backgroundColor: 'rgba(102, 126, 234, 0.08)',
                            padding: 15,
                            borderRadius: 12,
                            marginBottom: 10
                        }}>
                            <View style={{ flex: 1 }}>
                                <Text style={{ fontSize: 14, fontWeight: '700', color: '#fff' }}>
                                    👤 Incluir datos de visitante
                                </Text>
                                <Text style={{ fontSize: 12, color: '#a29bfe', marginTop: 4 }}>
                                    IP, dispositivo, navegador, ubicación
                                </Text>
                            </View>
                            <Switch
                                value={filtros.incluir_visitante}
                                onValueChange={(value) => setFiltros(prev => ({ 
                                    ...prev, 
                                    incluir_visitante: value 
                                }))}
                                trackColor={{ false: '#3e3e3e', true: '#667eea' }}
                                thumbColor={filtros.incluir_visitante ? '#fff' : '#f4f3f4'}
                            />
                        </View>
                    </ScrollView>

                    {/* Footer */}
                    <View style={{
                        flexDirection: 'row',
                        padding: 25,
                        gap: 15,
                        borderTopWidth: 1,
                        borderTopColor: 'rgba(102, 126, 234, 0.2)'
                    }}>
                        <TouchableOpacity
                            onPress={limpiarFiltros}
                            style={{
                                flex: 1,
                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                paddingVertical: 15,
                                borderRadius: 12,
                                alignItems: 'center'
                            }}
                        >
                            <Text style={{ color: '#a29bfe', fontWeight: '700', fontSize: 14 }}>
                                Limpiar Filtros
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={handleExport}
                            disabled={loading}
                            style={{ flex: 1 }}
                        >
                            <LinearGradient
                                colors={loading ? ['#555', '#777'] : ['#667eea', '#764ba2']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={{
                                    paddingVertical: 15,
                                    borderRadius: 12,
                                    alignItems: 'center',
                                    flexDirection: 'row',
                                    justifyContent: 'center',
                                    gap: 10
                                }}
                            >
                                {loading ? (
                                    <>
                                        <ActivityIndicator size="small" color="#fff" />
                                        <Text style={{ color: '#fff', fontWeight: '900', fontSize: 14 }}>
                                            Exportando...
                                        </Text>
                                    </>
                                ) : (
                                    <>
                                        <Ionicons name="download" size={20} color="#fff" />
                                        <Text style={{ color: '#fff', fontWeight: '900', fontSize: 14 }}>
                                            Descargar Excel
                                        </Text>
                                    </>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}
// src/components/Modals/ExportExcelModal.js
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { LinearGradient } from 'expo-linear-gradient';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import React, { useEffect, useState } from 'react';
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
    
    // 🔥 Estado inicial de filtros
    const filtrosIniciales = {
        id_agente: null,
        estado: null,
        origin: null,
        escaladas: null,
        fecha_inicio: null,
        fecha_fin: null,
        calificacion_min: null,
        calificacion_max: null,
        incluir_visitante: true,
        periodo: 'todo'
    };
    
    const [filtros, setFiltros] = useState(filtrosIniciales);

    // 🔥 Resetear filtros cuando se cierra el modal
    useEffect(() => {
        if (!visible) {
            setFiltros(filtrosIniciales);
        }
    }, [visible]);

    // 🔥 NUEVO: Monitorear cambios en filtros para debugging
    useEffect(() => {
        console.log('🎚️ Filtros actualizados:', {
            id_agente: filtros.id_agente,
            estado: filtros.estado,
            origin: filtros.origin,
            escaladas: filtros.escaladas,
            periodo: filtros.periodo
        });
    }, [filtros.id_agente, filtros.estado, filtros.origin, filtros.escaladas, filtros.periodo]);

    // 🔥 Opciones de filtros - SOLO ACTIVA Y FINALIZADA
    const estados = [
        { value: null, label: 'Todos los estados' },
        { value: 'activa', label: 'Activas' },
        { value: 'finalizada', label: 'Finalizadas' }
    ];

    // 🔥 Opciones de origen - SOLO WIDGET Y MOBILE
    const origenes = [
        { value: null, label: 'Todos los orígenes' },
        { value: 'widget', label: 'Widget' },
        { value: 'mobile', label: 'Mobile' }
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

            // 🔥 Construir parámetros de exportación (SOLO valores EXPLÍCITOS no null)
            const params = {};
            
            // 🔥 FIJO: ID AGENTE - Ser SÚPER explícito
            console.log('🔍 Verificando id_agente:', {
                valor: filtros.id_agente,
                tipo: typeof filtros.id_agente,
                esNull: filtros.id_agente === null,
                esUndefined: filtros.id_agente === undefined,
                esNaN: isNaN(filtros.id_agente)
            });

            if (filtros.id_agente !== null && filtros.id_agente !== undefined && !isNaN(filtros.id_agente)) {
                const idAgenteNumero = Number(filtros.id_agente);
                params.id_agente = idAgenteNumero;
                console.log('✅ ID Agente INCLUIDO en parámetros:', idAgenteNumero);
            } else {
                console.log('⚠️ ID Agente NO incluido - será null o undefined');
            }
            
            // Solo agregar estado si NO es null
            if (filtros.estado !== null && filtros.estado !== undefined) {
                params.estado = filtros.estado;
                console.log('📊 Estado seleccionado:', params.estado);
            }
            
            // Solo agregar origen si NO es null
            if (filtros.origin !== null && filtros.origin !== undefined) {
                params.origin = filtros.origin;
                console.log('📱 Origen seleccionado:', params.origin);
            }
            
            // Solo agregar si es explícitamente true
            if (filtros.escaladas === true) {
                params.escaladas = true;
                console.log('🆘 Solo escaladas: true');
            }
            
            // Fechas
            if (filtros.fecha_inicio) {
                params.fecha_inicio = filtros.fecha_inicio;
            }
            if (filtros.fecha_fin) {
                params.fecha_fin = filtros.fecha_fin;
            }
            
            // Calificaciones (solo si son números válidos)
            if (filtros.calificacion_min !== null && filtros.calificacion_min !== undefined) {
                params.calificacion_min = Number(filtros.calificacion_min);
            }
            if (filtros.calificacion_max !== null && filtros.calificacion_max !== undefined) {
                params.calificacion_max = Number(filtros.calificacion_max);
            }
            
            // Siempre incluir este parámetro
            params.incluir_visitante = filtros.incluir_visitante;

            console.log('📤 Exportando con parámetros FINALES:', JSON.stringify(params, null, 2));

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
                // Para mobile, usar FileSystem y Sharing de Expo
                try {
                    // Convertir blob a base64
                    const reader = new FileReader();
                    reader.onload = async () => {
                        const base64 = reader.result.split(',')[1];
                        const fileName = `conversaciones_${new Date().toISOString().split('T')[0]}.xlsx`;
                        const filePath = `${FileSystem.documentDirectory}${fileName}`;

                        // Guardar archivo en el sistema de archivos
                        await FileSystem.writeAsStringAsync(filePath, base64, {
                            encoding: 'base64',
                        });

                        console.log('✅ Archivo guardado en:', filePath);

                        // Compartir/descargar el archivo
                        await Sharing.shareAsync(filePath, {
                            mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                            dialogTitle: 'Descargar conversaciones',
                            UTI: 'com.microsoft.excel.xlsx'
                        });

                        Alert.alert(
                            'Éxito',
                            'El archivo se ha generado y preparado para descargar',
                            [{ text: 'OK', onPress: onClose }]
                        );
                    };
                    reader.readAsDataURL(blob);
                } catch (error) {
                    console.error('❌ Error descargando en móvil:', error);
                    Alert.alert(
                        'Error',
                        'No se pudo descargar el archivo en móvil',
                        [{ text: 'OK' }]
                    );
                }
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
        setFiltros(filtrosIniciales);
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
                                backgroundColor: '#2a2a4e',
                                borderRadius: 12,
                                borderWidth: 2,
                                borderColor: '#667eea',
                                overflow: 'hidden'
                            }}>
                                <Picker
                                    selectedValue={filtros.periodo}
                                    onValueChange={(value) => {
                                        const fechas = calcularFechas(value);
                                        setFiltros(prev => ({
                                            ...prev,
                                            periodo: value,
                                            fecha_inicio: fechas.fecha_inicio,
                                            fecha_fin: fechas.fecha_fin
                                        }));
                                    }}
                                    style={{ color: '#fff', height: 50, backgroundColor: '#2a2a4e' }}
                                    dropdownIconColor="#667eea"
                                    itemStyle={{ backgroundColor: '#1a1a2e', color: '#fff', fontSize: 16 }}
                                >
                                    {periodos.map(p => (
                                        <Picker.Item 
                                            key={p.value} 
                                            label={p.label} 
                                            value={p.value}
                                            color="#fff"
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
                                backgroundColor: '#2a2a4e',
                                borderRadius: 12,
                                borderWidth: 2,
                                borderColor: '#667eea',
                                overflow: 'hidden'
                            }}>
                                <Picker
                                    key={`picker-agente-${filtros.id_agente}`}
                                    selectedValue={filtros.id_agente}
                                    onValueChange={(value) => {
                                        console.log('🤖 Agente seleccionado:', value, 'Tipo:', typeof value);
                                        setFiltros(prev => ({ 
                                            ...prev, 
                                            id_agente: value 
                                        }));
                                    }}
                                    style={{ color: '#fff', height: 50, backgroundColor: '#2a2a4e' }}
                                    dropdownIconColor="#667eea"
                                    itemStyle={{ backgroundColor: '#1a1a2e', color: '#fff', fontSize: 16 }}
                                >
                                    <Picker.Item label="Todos los agentes" value={null} color="#fff" />
                                    {agentesDisponibles && agentesDisponibles.length > 0 ? (
                                        agentesDisponibles.map(agente => {
                                            // 🔥 DEBUG: Ver estructura completa
                                            console.log('🔍 Agente completo recibido:', agente);
                                            
                                            // 🔥 FIJO: Intentar múltiples propiedades para el ID
                                            const agenteId = agente.id || agente.id_agente;
                                            const agenteName = agente.nombre || agente.nombre_agente || 'Agente sin nombre';
                                            
                                            console.log('🔍 Agente en lista:', { id: agenteId, nombre: agenteName });
                                            
                                            if (!agenteId) {
                                                console.error('❌ Agente sin ID:', agente);
                                            }
                                            
                                            return (
                                                <Picker.Item 
                                                    key={agenteId || agenteName}
                                                    label={agenteName} 
                                                    value={agenteId}
                                                    color="#fff"
                                                />
                                            );
                                        })
                                    ) : (
                                        <Picker.Item label="Cargando agentes..." value={null} color="#999" />
                                    )}
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
                                backgroundColor: '#2a2a4e',
                                borderRadius: 12,
                                borderWidth: 2,
                                borderColor: '#667eea',
                                overflow: 'hidden'
                            }}>
                                <Picker
                                    selectedValue={filtros.estado}
                                    onValueChange={(value) => setFiltros(prev => ({ ...prev, estado: value }))}
                                    style={{ color: '#fff', height: 50, backgroundColor: '#2a2a4e' }}
                                    dropdownIconColor="#667eea"
                                    itemStyle={{ backgroundColor: '#1a1a2e', color: '#fff', fontSize: 16 }}
                                >
                                    {estados.map(e => (
                                        <Picker.Item key={e.value || 'all'} label={e.label} value={e.value} color="#fff" />
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
                                backgroundColor: '#2a2a4e',
                                borderRadius: 12,
                                borderWidth: 2,
                                borderColor: '#667eea',
                                overflow: 'hidden'
                            }}>
                                <Picker
                                    selectedValue={filtros.origin}
                                    onValueChange={(value) => setFiltros(prev => ({ ...prev, origin: value }))}
                                    style={{ color: '#fff', height: 50, backgroundColor: '#2a2a4e' }}
                                    dropdownIconColor="#667eea"
                                    itemStyle={{ backgroundColor: '#1a1a2e', color: '#fff', fontSize: 16 }}
                                >
                                    {origenes.map(o => (
                                        <Picker.Item key={o.value || 'all'} label={o.label} value={o.value} color="#fff" />
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
                                        backgroundColor: '#2a2a4e',
                                        borderRadius: 12,
                                        borderWidth: 2,
                                        borderColor: '#667eea',
                                        overflow: 'hidden'
                                    }}>
                                        <Picker
                                            selectedValue={filtros.calificacion_min}
                                            onValueChange={(value) => setFiltros(prev => ({ ...prev, calificacion_min: value }))}
                                            style={{ color: '#fff', height: 50, backgroundColor: '#2a2a4e' }}
                                            dropdownIconColor="#667eea"
                                            itemStyle={{ backgroundColor: '#1a1a2e', color: '#fff', fontSize: 16 }}
                                        >
                                            {calificaciones.map(c => (
                                                <Picker.Item key={`min-${c.value}`} label={c.label} value={c.value} color="#fff" />
                                            ))}
                                        </Picker>
                                    </View>
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ fontSize: 12, color: '#a29bfe', marginBottom: 5 }}>Máxima</Text>
                                    <View style={{
                                        backgroundColor: '#2a2a4e',
                                        borderRadius: 12,
                                        borderWidth: 2,
                                        borderColor: '#667eea',
                                        overflow: 'hidden'
                                    }}>
                                        <Picker
                                            selectedValue={filtros.calificacion_max}
                                            onValueChange={(value) => setFiltros(prev => ({ ...prev, calificacion_max: value }))}
                                            style={{ color: '#fff', height: 50, backgroundColor: '#2a2a4e' }}
                                            dropdownIconColor="#667eea"
                                            itemStyle={{ backgroundColor: '#1a1a2e', color: '#fff', fontSize: 16 }}
                                        >
                                            {calificaciones.map(c => (
                                                <Picker.Item key={`max-${c.value}`} label={c.label} value={c.value} color="#fff" />
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
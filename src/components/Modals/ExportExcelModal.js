// src/components/Modals/ExportExcelModal.js
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import * as FileSystem from 'expo-file-system/legacy';
import { LinearGradient } from 'expo-linear-gradient';
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
    agentesDisponibles = [],
    agenteActual = null,
    esFuncionario = false
}) {
    const [loading, setLoading] = useState(false);
    const [formatoExportacion, setFormatoExportacion] = useState('excel'); // 🔥 NUEVO
    
    // 🔥 Estado inicial de filtros (usar strings especiales para "todos" en lugar de null)
    const filtrosIniciales = {
        id_agente: null,
        estado: 'ALL',  // 🔥 String especial en lugar de null
        origin: 'ALL',  // 🔥 String especial en lugar de null
        escaladas: null,
        fecha_inicio: null,
        fecha_fin: null,
        incluir_visitante: true,
        periodo: 'todo'
    };
    
    const [filtros, setFiltros] = useState(filtrosIniciales);

    // 🔥 NUEVO: Efecto para preseleccionar agente del funcionario
    useEffect(() => {
        if (esFuncionario && agenteActual && agentesDisponibles && agentesDisponibles.length > 0) {
            // Buscar el agente actual en la lista disponible
            const agenteEncontrado = agentesDisponibles.find(a => 
                (a.nombre === agenteActual || a.nombre_agente === agenteActual)
            );
            
            if (agenteEncontrado) {
                const agenteId = agenteEncontrado.id || agenteEncontrado.id_agente;
                setFiltros(prev => ({ 
                    ...prev, 
                    id_agente: agenteId 
                }));
                console.log('🔒 Agente preseleccionado para funcionario:', agenteActual, 'ID:', agenteId);
            }
        }
    }, [visible, esFuncionario, agenteActual, agentesDisponibles]);

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

    // 🔥 Opciones de filtros
    const estados = [
        { value: 'ALL', label: 'Todos los estados' },
        { value: 'activa', label: 'Activas' },
        { value: 'finalizada', label: 'Finalizadas' }
    ];

    // 🔥 Opciones de origen
    const origenes = [
        { value: 'ALL', label: 'Todos los orígenes' },
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
            
            // Solo agregar estado si NO es null y NO es 'ALL'
            if (filtros.estado !== null && filtros.estado !== undefined && filtros.estado !== 'ALL' && filtros.estado !== 'Todos los estados') {
                params.estado = filtros.estado;
                console.log('📊 Estado seleccionado:', params.estado);
            }
            
            // Solo agregar origen si NO es null y NO es 'ALL'
            if (filtros.origin !== null && filtros.origin !== undefined && filtros.origin !== 'ALL' && filtros.origin !== 'Todos los orígenes') {
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
            
            // Siempre incluir este parámetro
            params.incluir_visitante = filtros.incluir_visitante;

            console.log('📤 Exportando con parámetros FINALES:', JSON.stringify(params, null, 2));

            // 🔥 NUEVO: Ramificar según formato seleccionado
            if (formatoExportacion === 'excel') {
                await exportarExcel(params);
            } else if (formatoExportacion === 'word') {
                await exportarWord(params);
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

    // 🔥 NUEVA FUNCIÓN: Exportar a Excel
    const exportarExcel = async (params) => {
        try {
            // 🔥 Obtener el archivo del backend
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
            console.error('❌ Error exportando a Excel:', error);
            throw error;
        }
    };

    // 🔥 NUEVA FUNCIÓN: Exportar a Word
    const exportarWord = async (params) => {
        try {
            // 🔥 Llamar al endpoint /export/word del backend
            const response = await conversationMongoService.exportToWord(params);
            const blob = response;
            
            // Descargar con extensión .docx (Word)
            if (Platform.OS === 'web') {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `conversaciones_${new Date().toISOString().split('T')[0]}.docx`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);

                Alert.alert(
                    'Éxito',
                    'El documento Word se ha descargado correctamente',
                    [{ text: 'OK', onPress: onClose }]
                );
            } else {
                // Para mobile
                try {
                    const reader = new FileReader();
                    reader.onload = async () => {
                        const base64 = reader.result.split(',')[1];
                        const fileName = `conversaciones_${new Date().toISOString().split('T')[0]}.docx`;
                        const filePath = `${FileSystem.documentDirectory}${fileName}`;

                        await FileSystem.writeAsStringAsync(filePath, base64, {
                            encoding: 'base64',
                        });

                        console.log('✅ Documento Word guardado en:', filePath);

                        await Sharing.shareAsync(filePath, {
                            mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                            dialogTitle: 'Descargar conversaciones',
                            UTI: 'com.microsoft.word.docx'
                        });

                        Alert.alert(
                            'Éxito',
                            'El documento Word se ha generado y preparado para descargar',
                            [{ text: 'OK', onPress: onClose }]
                        );
                    };
                    reader.readAsDataURL(blob);
                } catch (error) {
                    console.error('❌ Error descargando Word en móvil:', error);
                    Alert.alert(
                        'Error',
                        'No se pudo descargar el documento Word',
                        [{ text: 'OK' }]
                    );
                }
            }
        } catch (error) {
            console.error('❌ Error exportando a Word:', error);
            throw error;
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
                                Exportar Datos
                            </Text>
                        </View>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close-circle" size={28} color="#fff" />
                        </TouchableOpacity>
                    </LinearGradient>

                    {/* Content */}
                    <ScrollView style={{ maxHeight: 500, padding: 25 }}>
                        {/* 🔥 NUEVO: Selector de Formato */}
                        <View style={{ marginBottom: 25 }}>
                            <Text style={{
                                fontSize: 14,
                                fontWeight: '700',
                                color: '#fff',
                                marginBottom: 10
                            }}>
                                📄 Formato de Exportación
                            </Text>
                            <View style={{ flexDirection: 'row', gap: 10 }}>
                                {/* Botón Excel */}
                                <TouchableOpacity
                                    onPress={() => setFormatoExportacion('excel')}
                                    style={{
                                        flex: 1,
                                        padding: 15,
                                        borderRadius: 12,
                                        backgroundColor: formatoExportacion === 'excel' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(102, 126, 234, 0.1)',
                                        borderWidth: 2,
                                        borderColor: formatoExportacion === 'excel' ? '#22c55e' : '#667eea',
                                        alignItems: 'center'
                                    }}
                                >
                                    <Ionicons 
                                        name="grid-outline" 
                                        size={24} 
                                        color={formatoExportacion === 'excel' ? '#22c55e' : '#667eea'} 
                                    />
                                    <Text style={{
                                        marginTop: 8,
                                        fontWeight: '700',
                                        fontSize: 13,
                                        color: formatoExportacion === 'excel' ? '#22c55e' : '#a29bfe'
                                    }}>
                                        Excel
                                    </Text>
                                </TouchableOpacity>

                                {/* Botón Word */}
                                <TouchableOpacity
                                    onPress={() => setFormatoExportacion('word')}
                                    style={{
                                        flex: 1,
                                        padding: 15,
                                        borderRadius: 12,
                                        backgroundColor: formatoExportacion === 'word' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(102, 126, 234, 0.1)',
                                        borderWidth: 2,
                                        borderColor: formatoExportacion === 'word' ? '#3b82f6' : '#667eea',
                                        alignItems: 'center'
                                    }}
                                >
                                    <Ionicons 
                                        name="document-text-outline" 
                                        size={24} 
                                        color={formatoExportacion === 'word' ? '#3b82f6' : '#667eea'} 
                                    />
                                    <Text style={{
                                        marginTop: 8,
                                        fontWeight: '700',
                                        fontSize: 13,
                                        color: formatoExportacion === 'word' ? '#3b82f6' : '#a29bfe'
                                    }}>
                                        Word
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>

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
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                                <Text style={{
                                    fontSize: 14,
                                    fontWeight: '700',
                                    color: '#fff',
                                    flex: 1
                                }}>
                                    🤖 Agente Virtual
                                </Text>
                                {esFuncionario && (
                                    <View style={{
                                        backgroundColor: 'rgba(16, 185, 129, 0.2)',
                                        paddingHorizontal: 8,
                                        paddingVertical: 4,
                                        borderRadius: 6,
                                        borderWidth: 1,
                                        borderColor: '#10b981'
                                    }}>
                                        <Text style={{
                                            fontSize: 11,
                                            color: '#10b981',
                                            fontWeight: '600'
                                        }}>
                                            🔒 Bloqueado
                                        </Text>
                                    </View>
                                )}
                            </View>
                            <View style={{
                                backgroundColor: '#2a2a4e',
                                borderRadius: 12,
                                borderWidth: 2,
                                borderColor: esFuncionario ? '#10b981' : '#667eea',
                                overflow: 'hidden',
                                opacity: esFuncionario ? 0.8 : 1
                            }}>
                                <Picker
                                    key={`picker-agente-${filtros.id_agente}`}
                                    selectedValue={filtros.id_agente}
                                    onValueChange={(value) => {
                                        // 🔒 Bloquear cambio si es funcionario
                                        if (!esFuncionario) {
                                            console.log('🤖 Agente seleccionado:', value, 'Tipo:', typeof value);
                                            setFiltros(prev => ({ 
                                                ...prev, 
                                                id_agente: value 
                                            }));
                                        }
                                    }}
                                    enabled={!esFuncionario}
                                    style={{ color: '#fff', height: 50, backgroundColor: '#2a2a4e' }}
                                    dropdownIconColor={esFuncionario ? '#10b981' : '#667eea'}
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
                                            {formatoExportacion === 'excel' ? 'Descargar Excel' : 'Descargar Word'}
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
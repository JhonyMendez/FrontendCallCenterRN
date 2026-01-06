// ==================================================================================
// src/pages/Metricas/GestionMetricas.js
// Sistema de Gestión de Métricas - Dashboard Institucional TEC-AI
// ==================================================================================

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    Dimensions,
    Platform,
    RefreshControl,
    ScrollView,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import SuperAdminSidebar from '../../components/Sidebar/sidebarSuperAdmin';
import { contentStyles } from '../../components/Sidebar/SidebarSuperAdminStyles';
import GestionMetricasCard from '../../components/SuperAdministrador/GestionMetricasCard';
import { metricasStyles } from '../../styles/GestionMetricasStyles';

const isWeb = Platform.OS === 'web';
const { width } = Dimensions.get('window');
const isTablet = width >= 768;

export default function GestionMetricas() {
    // ==================== ESTADOS ====================
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [filtroActivo, setFiltroActivo] = useState('hoy');
    const [agenteSeleccionado, setAgenteSeleccionado] = useState(null);
    const [fadeAnim] = useState(new Animated.Value(0));
    const [sidebarOpen, setSidebarOpen] = useState(true); // ✅ NUEVO

    // Datos de métricas basados en tu BD
    const [metricas, setMetricas] = useState({
        resumen: {
            totalConversaciones: 0,
            totalMensajes: 0,
            visitantesUnicos: 0,
            conversacionesActivas: 0,
            conversacionesFinalizadas: 0,
            conversacionesEscaladas: 0,
            satisfaccionPromedio: 0,
            tiempoRespuestaPromedioMs: 0,
            duracionConversacionPromedioSeg: 0
        },
        agentesMasActivos: [],
        metricasPorDia: [],
        horasPico: [],
        contenidoMasUsado: [],
        agentesDisponibles: []
    });

    // ==================== EFECTOS ====================
    useEffect(() => {
        // Animación de entrada
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
        }).start();

        cargarMetricas();
    }, []);

    useEffect(() => {
        if (filtroActivo || agenteSeleccionado) {
            cargarMetricas();
        }
    }, [filtroActivo, agenteSeleccionado]);

    // ==================== FUNCIONES DE CARGA ====================
    const cargarMetricas = async () => {
        try {
            if (!refreshing) {
                setLoading(true);
            }

            // TODO: Reemplazar con llamada real a la API
            // const response = await metricasService.obtenerMetricasDiarias({
            //   periodo: filtroActivo,
            //   idAgente: agenteSeleccionado
            // });

            // Simular carga de datos desde tu BD
            await new Promise(resolve => setTimeout(resolve, 600));

            // Datos basados en tu estructura de BD
            const datosEjemplo = {
                resumen: {
                    totalConversaciones: 1247,
                    totalMensajes: 8932,
                    visitantesUnicos: 856,
                    conversacionesActivas: 23,
                    conversacionesFinalizadas: 1186,
                    conversacionesEscaladas: 38,
                    satisfaccionPromedio: 4.6,
                    tiempoRespuestaPromedioMs: 2345,
                    duracionConversacionPromedioSeg: 325
                },
                agentesMasActivos: [
                    {
                        id: 1,
                        nombre: 'Desarrollo de Software y Tecnología',
                        area: 'Desarrollo de Software, Programación',
                        conversacionesIniciadas: 342,
                        conversacionesFinalizadas: 328,
                        mensajesEnviados: 2456,
                        mensajesRecibidos: 2398,
                        satisfaccionPromedio: 4.7,
                        tasaResolucion: 89.2,
                        tiempoRespuestaPromedioMs: 1823,
                        color: '#667eea',
                        icono: '🧠'
                    },
                    {
                        id: 8,
                        nombre: 'Especialista en Big Data',
                        area: 'Big Data y Analítica de Datos',
                        conversacionesIniciadas: 328,
                        conversacionesFinalizadas: 298,
                        mensajesEnviados: 2331,
                        mensajesRecibidos: 2276,
                        satisfaccionPromedio: 4.6,
                        tasaResolucion: 88.1,
                        tiempoRespuestaPromedioMs: 1956,
                        color: '#20c997',
                        icono: '📊'
                    },
                    {
                        id: 4,
                        nombre: 'Agente de Deporte y Salud',
                        area: 'Actividad Física, Deporte',
                        conversacionesIniciadas: 223,
                        conversacionesFinalizadas: 208,
                        mensajesEnviados: 1589,
                        mensajesRecibidos: 1542,
                        satisfaccionPromedio: 4.8,
                        tasaResolucion: 91.4,
                        tiempoRespuestaPromedioMs: 1678,
                        color: '#3bc9db',
                        icono: '⚡'
                    },
                    {
                        id: 2,
                        nombre: 'Agente de Infraestructura',
                        area: 'Redes, Servidores, Plataformas',
                        conversacionesIniciadas: 198,
                        conversacionesFinalizadas: 182,
                        mensajesEnviados: 1432,
                        mensajesRecibidos: 1398,
                        satisfaccionPromedio: 4.5,
                        tasaResolucion: 85.3,
                        tiempoRespuestaPromedioMs: 2134,
                        color: '#764ba2',
                        icono: '🔧'
                    },
                    {
                        id: 3,
                        nombre: 'Agente de Procesos Industriales',
                        area: 'Procesos Industriales, Manufactura',
                        conversacionesIniciadas: 156,
                        conversacionesFinalizadas: 142,
                        mensajesEnviados: 1124,
                        mensajesRecibidos: 1089,
                        satisfaccionPromedio: 4.4,
                        tasaResolucion: 82.7,
                        tiempoRespuestaPromedioMs: 2287,
                        color: '#f093fb',
                        icono: '🔧'
                    }
                ],
                metricasPorDia: [
                    { fecha: '2026-01-01', conversaciones: 178, mensajes: 1243, visitantes: 124 },
                    { fecha: '2026-01-02', conversaciones: 189, mensajes: 1356, visitantes: 142 },
                    { fecha: '2026-01-03', conversaciones: 167, mensajes: 1187, visitantes: 118 },
                    { fecha: '2026-01-04', conversaciones: 203, mensajes: 1478, visitantes: 156 },
                    { fecha: '2026-01-05', conversaciones: 196, mensajes: 1389, visitantes: 147 },
                    { fecha: '2026-01-06', conversaciones: 142, mensajes: 998, visitantes: 98 },
                    { fecha: '2026-01-07', conversaciones: 172, mensajes: 1281, visitantes: 131 }
                ],
                horasPico: [
                    { hora: 9, cantidad: 87, conversaciones: 45 },
                    { hora: 11, cantidad: 134, conversaciones: 67 },
                    { hora: 14, cantidad: 178, conversaciones: 89 },
                    { hora: 16, cantidad: 156, conversaciones: 73 },
                    { hora: 18, cantidad: 98, conversaciones: 52 }
                ],
                contenidoMasUsado: [
                    {
                        id: 1,
                        titulo: 'Introducción a los Lenguajes de Programación',
                        agente: 'Desarrollo de Software',
                        usos: 234,
                        utilidad: 4.7,
                        categoria: 'Lenguajes de Programación'
                    },
                    {
                        id: 2,
                        titulo: 'Requisitos para Prácticas Preprofesionales',
                        agente: 'Desarrollo de Software',
                        usos: 198,
                        utilidad: 4.6,
                        categoria: 'Prácticas Profesionales'
                    },
                    {
                        id: 3,
                        titulo: 'Uso de Talleres y Laboratorios Industriales',
                        agente: 'Procesos Industriales',
                        usos: 167,
                        utilidad: 4.5,
                        categoria: 'Uso de Talleres'
                    },
                    {
                        id: 7,
                        titulo: 'Actividades Deportivas y Bienestar',
                        agente: 'Deporte y Salud',
                        usos: 156,
                        utilidad: 4.8,
                        categoria: 'Deporte y Bienestar'
                    },
                    {
                        id: 11,
                        titulo: 'Protocolos de Seguridad Institucional',
                        agente: 'Seguridad y Rescate',
                        usos: 143,
                        utilidad: 4.6,
                        categoria: 'Seguridad Institucional'
                    }
                ],
                agentesDisponibles: [
                    { id: 1, nombre: 'Desarrollo de Software', activo: true },
                    { id: 2, nombre: 'Infraestructura', activo: true },
                    { id: 3, nombre: 'Procesos Industriales', activo: true },
                    { id: 4, nombre: 'Deporte y Salud', activo: true },
                    { id: 5, nombre: 'Gestión y Finanzas', activo: true },
                    { id: 6, nombre: 'Seguridad y Rescate', activo: true },
                    { id: 8, nombre: 'Big Data', activo: true }
                ]
            };

            setMetricas(datosEjemplo);

        } catch (error) {
            console.error('Error cargando métricas:', error);
            if (!isWeb) {
                Alert.alert(
                    'Error',
                    'No se pudieron cargar las métricas. Intenta nuevamente.',
                    [{ text: 'OK' }]
                );
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        cargarMetricas();
    };

    // ==================== FUNCIONES DE EXPORTACIÓN ====================
    const exportarDatos = async (formato) => {
        try {
            // TODO: Implementar exportación real
            console.log(`Exportando datos en formato: ${formato}`);

            if (!isWeb) {
                Alert.alert(
                    'Exportación Iniciada',
                    `Se generará un reporte ${formato.toUpperCase()} con las métricas actuales.`,
                    [{ text: 'OK' }]
                );
            }
        } catch (error) {
            console.error('Error exportando datos:', error);
        }
    };

    // ==================== RENDERIZADO DE FILTROS ====================
    const renderFiltros = () => {
        const filtros = [
            { id: 'hoy', label: 'Hoy', icono: 'today-outline' },
            { id: 'semana', label: 'Semana', icono: 'calendar-outline' },
            { id: 'mes', label: 'Mes', icono: 'calendar' },
            { id: 'año', label: 'Año', icono: 'calendar-number-outline' }
        ];

        return (
            <View style={metricasStyles.filtrosContainer}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={metricasStyles.filtrosScroll}
                >
                    {filtros.map((filtro) => (
                        <TouchableOpacity
                            key={filtro.id}
                            onPress={() => setFiltroActivo(filtro.id)}
                            activeOpacity={0.7}
                        >
                            {filtroActivo === filtro.id ? (
                                <LinearGradient
                                    colors={['#667eea', '#764ba2']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={metricasStyles.filtroBoton}
                                >
                                    <Ionicons name={filtro.icono} size={18} color="#fff" />
                                    <Text style={metricasStyles.filtroTextoActivo}>{filtro.label}</Text>
                                </LinearGradient>
                            ) : (
                                <View style={metricasStyles.filtroBotonInactivo}>
                                    <Ionicons name={filtro.icono} size={18} color="#a29bfe" />
                                    <Text style={metricasStyles.filtroTextoInactivo}>{filtro.label}</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>
        );
    };

    // ==================== RENDERIZADO DE HEADER ====================
    const renderHeader = () => (
        <LinearGradient
            colors={['#1a1a2e', '#16213e']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={metricasStyles.header}
        >
            <View style={metricasStyles.headerTop}>
                <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}>
                        <LinearGradient
                            colors={['#667eea', '#764ba2']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={metricasStyles.headerIconContainer}
                        >
                            <Ionicons name="stats-chart" size={28} color="#fff" />
                        </LinearGradient>
                        <Text style={metricasStyles.headerTitle}>Dashboard Institucional</Text>
                    </View>
                    <Text style={metricasStyles.headerSubtitle}>
                        Análisis y estadísticas del sistema de chatbots
                    </Text>
                </View>

                <TouchableOpacity
                    style={metricasStyles.exportButton}
                    onPress={() => exportarDatos('excel')}
                    activeOpacity={0.7}
                >
                    <LinearGradient
                        colors={['rgba(102, 126, 234, 0.2)', 'rgba(118, 75, 162, 0.2)']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={metricasStyles.exportButtonGradient}
                    >
                        <Ionicons name="download-outline" size={22} color="#667eea" />
                    </LinearGradient>
                </TouchableOpacity>
            </View>

            {renderFiltros()}
        </LinearGradient>
    );

    // ==================== RENDERIZADO PRINCIPAL ====================
    return (
        <View style={contentStyles.wrapper}>
            {/* ============ SIDEBAR ============ */}
            <SuperAdminSidebar
                isOpen={sidebarOpen}
                onToggle={() => setSidebarOpen(!sidebarOpen)}
            />

            {/* ============ BOTÓN TOGGLE SIDEBAR ============ */}
            <TouchableOpacity
                style={{
                    position: 'absolute',
                    top: 16,
                    left: sidebarOpen ? 296 : 16,
                    zIndex: 1001,
                    backgroundColor: '#1e1b4b',
                    padding: 12,
                    borderRadius: 12,
                    shadowColor: '#667eea',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.4,
                    shadowRadius: 8,
                    elevation: 8,
                }}
                onPress={() => setSidebarOpen(!sidebarOpen)}
            >
                <Ionicons name={sidebarOpen ? "close" : "menu"} size={24} color="#ffffff" />
            </TouchableOpacity>

            {/* ============ CONTENIDO PRINCIPAL ============ */}
            <View style={[
                contentStyles.mainContent,
                sidebarOpen && contentStyles.mainContentWithSidebar
            ]}>
                <View style={metricasStyles.container}>
                    <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
                        <ScrollView
                            style={metricasStyles.scrollView}
                            contentContainerStyle={metricasStyles.scrollContent}
                            refreshControl={
                                <RefreshControl
                                    refreshing={refreshing}
                                    onRefresh={onRefresh}
                                    tintColor="#667eea"
                                    colors={['#667eea', '#764ba2']}
                                />
                            }
                        >
                            {renderHeader()}

                            {loading && !refreshing ? (
                                <View style={metricasStyles.loadingInline}>
                                    <ActivityIndicator size="large" color="#667eea" />
                                </View>
                            ) : (
                                <GestionMetricasCard
                                    metricas={metricas}
                                    filtroActivo={filtroActivo}
                                    agenteSeleccionado={agenteSeleccionado}
                                    onSeleccionarAgente={setAgenteSeleccionado}
                                />
                            )}
                        </ScrollView>
                    </Animated.View>
                </View>
            </View>
        </View>
    );
}
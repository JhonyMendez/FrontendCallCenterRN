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
import { agenteService } from '../../api/services/agenteService';
import { conversacionService } from '../../api/services/conversacionService';
import { conversationMongoService } from '../../api/services/conversationMongoService';
import { visitanteAnonimoService } from '../../api/services/visitanteAnonimoService';
import ExportExcelModal from '../../components/Modals/ExportExcelModal';
import SuperAdminSidebar from '../../components/Sidebar/sidebarSuperAdmin';
import { contentStyles } from '../../components/Sidebar/SidebarSuperAdminStyles';
import GestionMetricasCard from '../../components/SuperAdministrador/GestionMetricasCard';
import { obtenerDescripcionFiltro, obtenerRangoFechas } from '../../components/utils/dateFilterUtils';
import { metricasStyles } from '../../styles/GestionMetricasStyles';

const isWeb = Platform.OS === 'web';
const { width } = Dimensions.get('window');
const isTablet = width >= 768;

export default function GestionMetricas() {
    // ==================== ESTADOS ====================
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [filtroResumen, setFiltroResumen] = useState('hoy'); 
    const [agenteSeleccionado, setAgenteSeleccionado] = useState(null);
    const [fadeAnim] = useState(new Animated.Value(0));
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [showExportModal, setShowExportModal] = useState(false);

    // Estado inicial VACÍO (sin datos quemados)
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

        // 🔥 AGREGAR ESTO:
        resumenFiltrado: {
            totalConversaciones: 0,
            totalMensajes: 0,
            conversacionesFinalizadas: 0,
            conversacionesEscaladas: 0,
            satisfaccionPromedio: 0,
            duracionConversacionPromedioSeg: 0
        },
        
        // 🔥 AGREGAR ESTO:
        mongoMetrics: {
            totalConversaciones: 0,
            conversacionesActivas: 0,
            conversacionesFinalizadas: 0,
            conversacionesEscaladas: 0,
            promedioMensajes: 0,
            calificacionPromedio: 0
        },
        
        // 🔥 AGREGAR ESTO:
        filtroInfo: {
            filtroActivo: 'hoy',
            descripcion: '',
            fechaInicio: null,
            fechaFin: null
        },

        agentesMasActivos: [],
        metricasPorDia: [],
        horasPico: [],
        contenidoMasUsado: [],
        agentesDisponibles: [],

        visitantes: {
            total: 0,
            activos: 0,
            porDispositivo: [],
            porPais: [],
            tendenciaSemanal: []
        },
        conversacionesDetalle: {
            porEstado: [],
            tendenciaSemanal: [],
            tiempoPromedio: 0,
            satisfaccion: 0
        }
    });

    // ==================== EFECTOS ====================
    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
        }).start();

        cargarMetricas(); // Carga inicial sin filtros
    }, []);

    // 🔥 Solo recargar cuando cambie el agente seleccionado
    useEffect(() => {
        if (agenteSeleccionado) {
            cargarMetricas();
        }
    }, [agenteSeleccionado]);

    // ==================== FUNCIÓN AUXILIAR: VERIFICAR TOKEN EXPIRADO ====================


    // 🔥 3. NUEVA FUNCIÓN: cargarResumenFiltrado
    const cargarResumenFiltrado = async (filtro) => {
        try {
            console.log('📊 Cargando resumen con filtro:', filtro);
            
            // Obtener rango de fechas según filtro
            const rangoFechas = obtenerRangoFechas(filtro);
            
            // Solo cargar estadísticas de MongoDB con filtro
            const estadisticasConvMongo = await conversationMongoService.getStats(
                agenteSeleccionado,
                {
                    fecha_inicio: rangoFechas.fecha_inicio,
                    fecha_fin: rangoFechas.fecha_fin
                }
            ).catch(err => {
                console.error('❌ Error en MongoDB filtrado:', err.message);
                return null;
            });

            // Actualizar SOLO la parte del resumen
            setMetricas(prev => ({
                ...prev,
                resumenFiltrado: {
                    totalConversaciones: estadisticasConvMongo?.total_conversaciones || 0,
                    totalMensajes: estadisticasConvMongo?.promedio_mensajes_por_conversacion || 0,
                    conversacionesFinalizadas: estadisticasConvMongo?.conversaciones_finalizadas || 0,
                    conversacionesEscaladas: estadisticasConvMongo?.conversaciones_escaladas || 0,
                    satisfaccionPromedio: estadisticasConvMongo?.calificacion_promedio || 0,
                    duracionConversacionPromedioSeg: estadisticasConvMongo?.promedio_mensajes_por_conversacion || 0
                },
                filtroInfo: {
                    filtroActivo: filtro,
                    descripcion: obtenerDescripcionFiltro(filtro),
                    fechaInicio: rangoFechas.fecha_inicio,
                    fechaFin: rangoFechas.fecha_fin
                }
            }));

        } catch (error) {
            console.error('❌ Error cargando resumen filtrado:', error);
        }
    };


    const verificarTokenExpirado = (error) => {
        if (error?.message && error.message.includes('Token expirado')) {
            Alert.alert(
                'Sesión Expirada',
                'Tu sesión ha caducado. Por favor inicia sesión nuevamente.',
                [
                    {
                        text: 'OK',
                        onPress: () => {
                            // Aquí redirigir al login
                            // navigation.navigate('Login');
                        }
                    }
                ]
            );
            return true;
        }
        return false;
    };

    // ==================== FUNCIÓN AUXILIAR: CARGAR AGENTES REALES ====================
    const cargarAgentesReales = async (estadisticasAgentes) => {
        try {

            // ✅ OBTENER TODOS LOS AGENTES DEL SISTEMA
            const todosLosAgentes = await agenteService.getAll({ activo: true });

            if (!todosLosAgentes) {
                console.error('❌ todosLosAgentes es null o undefined');
                return [];
            }

            // ✅ EXTRAER ARRAY DE AGENTES
            let agentesArray = todosLosAgentes;
            if (!Array.isArray(todosLosAgentes)) {
                console.warn('⚠️ todosLosAgentes no es un array, intentando acceder a .data');
                agentesArray = todosLosAgentes.data || todosLosAgentes.agentes || [];
            }

            if (!Array.isArray(agentesArray) || agentesArray.length === 0) {
                console.warn('⚠️ No se encontraron agentes activos');
                return [];
            }

            // ✅ MAPEAR AGENTES CON ESTADÍSTICAS (si existen)
            const agentesConEstadisticas = agentesArray.map(agente => {
                // 🔍 Buscar estadísticas de este agente (si existen)
                let stats = {};

                // Intentar encontrar estadísticas en diferentes estructuras posibles
                if (estadisticasAgentes?.agentes_activos && Array.isArray(estadisticasAgentes.agentes_activos)) {
                    stats = estadisticasAgentes.agentes_activos.find(
                        a => a.id === agente.id_agente || a.id_agente === agente.id_agente
                    ) || {};
                } else if (Array.isArray(estadisticasAgentes)) {
                    stats = estadisticasAgentes.find(
                        a => a.id === agente.id_agente || a.id_agente === agente.id_agente
                    ) || {};
                }
                // ✅ CONSTRUIR OBJETO CON DATOS DEL AGENTE + ESTADÍSTICAS
                return {
                    id: agente.id_agente,
                    nombre: agente.nombre_agente || agente.nombre || 'Agente Desconocido',
                    icono: agente.icono || '🤖',
                    color: agente.color_tema || agente.color || '#667eea',
                    area: agente.area_especialidad || agente.area || 'General',
                    // Estadísticas (pueden ser 0 si no hay datos)
                    conversacionesIniciadas: stats.conversaciones_iniciadas || 0,
                    mensajesEnviados: stats.mensajes_enviados || 0,
                    satisfaccionPromedio: stats.satisfaccion_promedio || 0,
                    tasaResolucion: stats.tasa_resolucion || 0,
                    tiempoRespuestaPromedioMs: stats.tiempo_respuesta_promedio_ms || 0
                };
            });
            return agentesConEstadisticas;

        } catch (error) {
            console.error('❌ Error en cargarAgentesReales:', error);
            console.error('❌ Stack:', error.stack);
            return [];
        }
    };

    // Nueva función auxiliar para procesar agentes
    const procesarAgentes = (agentesArray, estadisticasAgentes) => {
        const agentesConEstadisticas = agentesArray.map(agente => {
            // Buscar las estadísticas de este agente específico
            const stats = estadisticasAgentes?.agentes_activos?.find(
                a => a.id === agente.id
            ) || {};
            return {
                id: agente.id,
                nombre: agente.nombre || 'Agente Desconocido',
                icono: agente.icono || '🤖',
                color: agente.color || '#667eea',
                area: agente.id_departamento?.nombre || agente.area || 'General',
                conversacionesIniciadas: stats.conversaciones_iniciadas || 0,
                mensajesEnviados: stats.mensajes_enviados || 0,
                satisfaccionPromedio: stats.satisfaccion_promedio || 0,
                tasaResolucion: stats.tasa_resolucion || 0,
                tiempoRespuestaPromedioMs: stats.tiempo_respuesta_promedio_ms || 0
            };
        });
        return agentesConEstadisticas;
    };

    // ==================== FUNCIÓN AUXILIAR: CARGAR AGENTES DISPONIBLES ====================
    const cargarAgentesDisponibles = async () => {
        try {
            const agentes = await agenteService.getAll({ activo: true });
            if (!agentes) {
                console.error('❌ Respuesta null o undefined');
                return [];
            }
            let agentesArray = agentes;

            // Si la respuesta no es un array, intentar extraer el array
            if (!Array.isArray(agentes)) {
                agentesArray = agentes.data || agentes.agentes || [];
            }

            if (!Array.isArray(agentesArray)) {
                console.error('❌ No se pudo extraer un array válido');
                return [];
            }

            const resultado = agentesArray.map(a => ({
                id: a.id,
                nombre: a.nombre_agente || a.nombre || 'Sin nombre',
                activo: a.activo !== undefined ? a.activo : true
            }));
            return resultado;

        } catch (error) {
            console.error('❌ Error cargando agentes disponibles:', error);
            console.error('❌ Stack:', error.stack);
            return [];
        }
    };

    // ==================== FUNCIONES DE CARGA ====================
    const cargarMetricas = async () => {
        try {
            if (!refreshing) {
                setLoading(true);
            }

            // ✅ CARGAR DATOS SIN FILTROS DE FECHA
            const [
                estadisticasConv,
                estadisticasConvMongo, // Sin filtros de fecha
                estadisticasAgentes,
                estadisticasVisitantes
            ] = await Promise.all([
                conversacionService.getEstadisticasGenerales().catch(err => {
                    console.error('❌ Error en conversaciones SQL:', err.message);
                    if (err.message && err.message.includes('Token expirado')) {
                        throw err;
                    }
                    return null;
                }),

                // 🔥 MongoDB SIN filtros de fecha (datos generales)
                conversationMongoService.getStats(agenteSeleccionado).catch(err => {
                    console.error('❌ Error en conversaciones MongoDB:', err.message);
                    if (err.message && err.message.includes('Token expirado')) {
                        throw err;
                    }
                    return null;
                }),

                agenteService.getEstadisticasGenerales().catch(err => {
                    console.error('❌ Error en agentes:', err.message);
                    if (err.message && err.message.includes('Token expirado')) {
                        throw err;
                    }
                    return null;
                }),

                visitanteAnonimoService.getEstadisticas().catch(err => {
                    console.error('❌ Error en visitantes:', err.message);
                    if (err.message && err.message.includes('Token expirado')) {
                        throw err;
                    }
                    return null;
                })
            ]);

            const agentesReales = await cargarAgentesReales(estadisticasAgentes);
            const agentesDisp = await cargarAgentesDisponibles();

            // 🎯 CONSTRUIR DATOS FINALES
            const datosFinales = {
                // 🔥 Resumen SIN filtro (datos generales)
                resumen: {
                    totalConversaciones: 
                        (estadisticasConv?.total_conversaciones || 0) + 
                        (estadisticasConvMongo?.total_conversaciones || 0),
                    totalMensajes: estadisticasConv?.total_mensajes || 0,
                    conversacionesFinalizadas: 
                        estadisticasConvMongo?.conversaciones_finalizadas || 
                        estadisticasConv?.finalizadas || 0,
                    conversacionesEscaladas: 
                        estadisticasConvMongo?.conversaciones_escaladas || 
                        estadisticasConv?.escaladas || 0,
                    satisfaccionPromedio: 
                        estadisticasConvMongo?.calificacion_promedio || 
                        estadisticasConv?.satisfaccion_promedio || 0,
                    duracionConversacionPromedioSeg: 
                        estadisticasConvMongo?.promedio_mensajes_por_conversacion || 
                        estadisticasConv?.duracion_promedio_seg || 0
                },

                // 🔥 Resumen filtrado (se actualiza con cargarResumenFiltrado)
                resumenFiltrado: {
                    totalConversaciones: 0,
                    totalMensajes: 0,
                    conversacionesFinalizadas: 0,
                    conversacionesEscaladas: 0,
                    satisfaccionPromedio: 0,
                    duracionConversacionPromedioSeg: 0
                },

                mongoMetrics: {
                    totalConversaciones: estadisticasConvMongo?.total_conversaciones || 0,
                    conversacionesActivas: estadisticasConvMongo?.conversaciones_activas || 0,
                    conversacionesFinalizadas: estadisticasConvMongo?.conversaciones_finalizadas || 0,
                    conversacionesEscaladas: estadisticasConvMongo?.conversaciones_escaladas || 0,
                    promedioMensajes: estadisticasConvMongo?.promedio_mensajes_por_conversacion || 0,
                    calificacionPromedio: estadisticasConvMongo?.calificacion_promedio || 0
                },

                filtroInfo: {
                    filtroActivo: filtroResumen,
                    descripcion: obtenerDescripcionFiltro(filtroResumen),
                    fechaInicio: null,
                    fechaFin: null
                },

                agentesMasActivos: agentesReales,
                metricasPorDia: Array.isArray(estadisticasConv?.metricas_por_dia)
                    ? estadisticasConv.metricas_por_dia
                    : [],
                horasPico: Array.isArray(estadisticasConv?.horas_pico)
                    ? estadisticasConv.horas_pico
                    : [],
                contenidoMasUsado: Array.isArray(estadisticasConv?.contenido_mas_usado)
                    ? estadisticasConv.contenido_mas_usado
                    : [],
                agentesDisponibles: agentesDisp,

                visitantes: {
                    total: estadisticasVisitantes?.total_visitantes || 0,
                    activos: estadisticasVisitantes?.visitantes_activos || 0,
                    porDispositivo: Array.isArray(estadisticasVisitantes?.por_dispositivo)
                        ? estadisticasVisitantes.por_dispositivo.map(d => ({
                            name: d.dispositivo || d.name,
                            value: d.cantidad || d.value,
                            porcentaje: d.porcentaje
                        }))
                        : [],
                    porPais: Array.isArray(estadisticasVisitantes?.por_pais)
                        ? estadisticasVisitantes.por_pais
                        : [],
                    tendenciaSemanal: Array.isArray(estadisticasVisitantes?.tendencia_semanal)
                        ? estadisticasVisitantes.tendencia_semanal
                        : []
                },

                conversacionesDetalle: {
                    porEstado: [
                        {
                            name: 'Finalizadas',
                            value: estadisticasConvMongo?.conversaciones_finalizadas || 
                                estadisticasConv?.finalizadas || 0,
                            color: '#10b981'
                        },
                        {
                            name: 'Activas',
                            value: estadisticasConvMongo?.conversaciones_activas || 
                                estadisticasConv?.activas || 0,
                            color: '#3b82f6'
                        },
                        {
                            name: 'Escaladas',
                            value: estadisticasConvMongo?.conversaciones_escaladas || 
                                estadisticasConv?.escaladas || 0,
                            color: '#f59e0b'
                        }
                    ],
                    tendenciaSemanal: Array.isArray(estadisticasConv?.tendencia_semanal)
                        ? estadisticasConv.tendencia_semanal
                        : [],
                    tiempoPromedio: estadisticasConv?.duracion_promedio_seg || 0,
                    satisfaccion: estadisticasConvMongo?.calificacion_promedio || 
                                estadisticasConv?.satisfaccion_promedio || 0
                }
            };

            setMetricas(datosFinales);
            // Cargar resumen filtrado con el filtro actual
            await cargarResumenFiltrado(filtroResumen);

            // ⚠️ Advertir sobre endpoints que fallaron
            const endpointsFallidos = [];
            if (!estadisticasConv) endpointsFallidos.push('Conversaciones SQL');
            if (!estadisticasConvMongo) endpointsFallidos.push('Conversaciones MongoDB');
            if (!estadisticasAgentes) endpointsFallidos.push('Agentes');
            if (!estadisticasVisitantes) endpointsFallidos.push('Visitantes');

            if (endpointsFallidos.length > 0 && !refreshing) {
                console.warn('⚠️ Endpoints con errores:', endpointsFallidos.join(', '));
            }

        } catch (error) {
            console.error('❌ Error CRÍTICO cargando métricas:', error);
            console.error('❌ Detalles:', error.response?.data || error.message);

            // Verificar si es un error de token expirado
            if (error.message && error.message.includes('Token expirado')) {
                Alert.alert(
                    'Sesión Expirada',
                    'Tu sesión ha caducado. Por favor inicia sesión nuevamente.',
                );
                setLoading(false);
                setRefreshing(false);
                return;
            }

            // Mantener estado vacío
            setMetricas({
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
                resumenFiltrado: {
                    totalConversaciones: 0,
                    totalMensajes: 0,
                    conversacionesFinalizadas: 0,
                    conversacionesEscaladas: 0,
                    satisfaccionPromedio: 0,
                    duracionConversacionPromedioSeg: 0
                },
                mongoMetrics: {
                    totalConversaciones: 0,
                    conversacionesActivas: 0,
                    conversacionesFinalizadas: 0,
                    conversacionesEscaladas: 0,
                    promedioMensajes: 0,
                    calificacionPromedio: 0
                },
                filtroInfo: {
                    filtroActivo: filtroResumen,
                    descripcion: obtenerDescripcionFiltro(filtroResumen),
                    fechaInicio: null,
                    fechaFin: null
                },
                agentesMasActivos: [],
                metricasPorDia: [],
                horasPico: [],
                contenidoMasUsado: [],
                agentesDisponibles: [],
                visitantes: {
                    total: 0,
                    activos: 0,
                    porDispositivo: [],
                    porPais: [],
                    tendenciaSemanal: []
                },
                conversacionesDetalle: {
                    porEstado: [],
                    tendenciaSemanal: [],
                    tiempoPromedio: 0,
                    satisfaccion: 0
                }
            });

            if (!isWeb && !refreshing) {
                Alert.alert(
                    'Error',
                    'No se pudieron cargar las métricas. Verifica tu conexión.',
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
            // Abrir modal de exportación
            setShowExportModal(true);
        } catch (error) {
            console.error('❌ Error abriendo modal de exportación:', error);
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
                            onPress={async () => {
                                setFiltroResumen(filtro.id);
                                await cargarResumenFiltrado(filtro.id); // 🔥 Solo actualiza resumen
                            }}
                            activeOpacity={0.7}
                        >
                            {filtroResumen === filtro.id ? (
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

                {/* 🔥 BOTÓN DE EXPORTACIÓN ACTUALIZADO */}
                <TouchableOpacity
                    style={metricasStyles.exportButton}
                    onPress={() => setShowExportModal(true)} // 🔥 CAMBIO AQUÍ
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

            {/* 🔥 Filtros ahora solo afectan al Resumen Ejecutivo */}
            <View style={{ marginTop: 10, marginBottom: 5 }}>
                <Text style={{ 
                    fontSize: 12, 
                    color: '#a29bfe', 
                    fontWeight: '600',
                    marginBottom: 10
                }}>
                    Período para Resumen Ejecutivo:
                </Text>
                {renderFiltros()}
            </View>
        </LinearGradient>
    );

    // ==================== RENDERIZADO PRINCIPAL ====================
    return (
        <View style={contentStyles.wrapper}>
            {/* ============ SIDEBAR WEB ============ */}
            {isWeb && (
                <SuperAdminSidebar
                    isOpen={sidebarOpen}
                    onToggle={() => setSidebarOpen(!sidebarOpen)}
                    onNavigate={() => setSidebarOpen(false)}
                />
            )}

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
                                    <Text style={{ color: '#a29bfe', marginTop: 15, fontSize: 14 }}>
                                        Cargando métricas...
                                    </Text>
                                </View>
                            ) : (
                                <GestionMetricasCard
                                    metricas={metricas}
                                    filtroActivo={filtroResumen}  // 🔥 CORREGIR: usar filtroResumen
                                    agenteSeleccionado={agenteSeleccionado}
                                    onSeleccionarAgente={setAgenteSeleccionado}
                                />
                            )}
                        </ScrollView>
                    </Animated.View>
                </View>
            </View>
            {/* ============ SIDEBAR MÓVIL ============ */}
            {!isWeb && sidebarOpen && (
                <>
                    {/* Overlay oscuro */}
                    <TouchableOpacity
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: 'rgba(0, 0, 0, 0.5)',
                            zIndex: 998,
                        }}
                        onPress={() => setSidebarOpen(false)}
                        activeOpacity={1}
                    />

                    {/* Sidebar deslizante */}
                    <View style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        bottom: 0,
                        width: '80%',
                        maxWidth: 320,
                        zIndex: 999,
                    }}>
                        <SuperAdminSidebar
                            isOpen={sidebarOpen}
                            onNavigate={() => setSidebarOpen(false)}
                        />
                    </View>
                </>
            )}
            {/* 🔥 AGREGAR MODAL DE EXPORTACIÓN */}
            <ExportExcelModal
                visible={showExportModal}
                onClose={() => setShowExportModal(false)}
                agentesDisponibles={metricas.agentesDisponibles || []}
            />
        </View>
    );
}
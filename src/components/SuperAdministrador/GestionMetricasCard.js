// ==================================================================================
// src/components/SuperAdministrador/GestionMetricasCard.js
// Cards Premium para visualización de métricas institucionales
// ==================================================================================

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
    Dimensions,
    Platform,
    ScrollView,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { metricasStyles } from '../../styles/GestionMetricasStyles';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;
const isWeb = Platform.OS === 'web';

export default function GestionMetricasCard({
    metricas,
    filtroActivo,
    agenteSeleccionado,
    onSeleccionarAgente
}) {

    const [seccionExpandida, setSeccionExpandida] = useState({
        resumen: true,
        mongo: true,  // 🔥 NUEVO
        agentes: true,
        tendencias: true,
        contenido: true,
        horas: true,
        pastel: true,  // 🔥 NUEVO - Gráfico de pastel
        barrasHorizontales: true,  // 🔥 NUEVO - Gráfico de barras horizontales
        visitantes: true,
        conversaciones: true
    });

    // ==================== FUNCIONES AUXILIARES ====================
    const formatearNumero = (numero) => {
        if (numero >= 1000000) {
            return `${(numero / 1000000).toFixed(1)}M`;
        } else if (numero >= 1000) {
            return `${(numero / 1000).toFixed(1)}K`;
        }
        return numero.toString();
    };

    const formatearTiempo = (milisegundos) => {
        if (milisegundos < 1000) return `${milisegundos}ms`;
        const segundos = (milisegundos / 1000).toFixed(1);
        return `${segundos}s`;
    };

    const formatearDuracion = (segundos) => {
        if (segundos < 60) return `${Math.round(segundos)}s`;
        const minutos = Math.floor(segundos / 60);
        const segs = Math.round(segundos % 60);
        return `${minutos}m ${segs}s`;
    };

    const obtenerColorSatisfaccion = (valor) => {
        if (valor >= 4.5) return ['#20c997', '#17a2b8'];
        if (valor >= 3.5) return ['#ffa502', '#ff6348'];
        return ['#ff4757', '#ff6348'];
    };

    const obtenerColorTasaResolucion = (valor) => {
        if (valor >= 85) return ['#20c997', '#17a2b8'];
        if (valor >= 70) return ['#ffa502', '#ff6348'];
        return ['#ff4757', '#ff6348'];
    };

    const toggleSeccion = (seccion) => {
        setSeccionExpandida(prev => ({
            ...prev,
            [seccion]: !prev[seccion]
        }));
    };

    const obtenerNombreDia = (fecha) => {
        const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        const date = new Date(fecha);
        return dias[date.getDay()];
    };

    // ==================== RESUMEN GENERAL ====================
    const renderResumen = () => {
        // 🔥 Usar resumenFiltrado si existe, sino usar resumen general
        const resumenData = metricas.filtroInfo?.filtroActivo 
            ? metricas.resumenFiltrado 
            : metricas.resumen;

        // 🔥 MÉTRICAS REDUCIDAS (sin Visitantes Únicos, Tiempo Respuesta, Activos Ahora)
        const estadisticas = [
            {
                valor: formatearNumero(resumenData.totalConversaciones),
                label: 'Total Conversaciones',
                icono: 'chatbubbles',
                color: ['#667eea', '#764ba2'],
                descripcion: 'Iniciadas en el periodo'
            },
            {
                valor: formatearNumero(resumenData.totalMensajes),
                label: 'Promedio Mensajes',
                icono: 'mail',
                color: ['#f093fb', '#f5576c'],
                descripcion: 'Por conversación'
            },
            {
                valor: formatearNumero(resumenData.conversacionesFinalizadas),
                label: 'Finalizadas',
                icono: 'checkmark-done',
                color: ['#51cf66', '#37b24d'],
                descripcion: 'Completadas con éxito'
            },
            {
                valor: formatearNumero(resumenData.conversacionesEscaladas),
                label: 'Escaladas',
                icono: 'arrow-up-circle',
                color: ['#ffa502', '#ff6348'],
                descripcion: 'Requirieron humano'
            },
            {
                valor: resumenData.satisfaccionPromedio ? 
                    resumenData.satisfaccionPromedio.toFixed(1) : 'N/A',
                label: 'Satisfacción',
                icono: 'star',
                color: obtenerColorSatisfaccion(resumenData.satisfaccionPromedio),
                descripcion: 'Calificación promedio'
            },
            {
                valor: formatearDuracion(resumenData.duracionConversacionPromedioSeg),
                label: 'Duración Media',
                icono: 'time',
                color: ['#a29bfe', '#6c5ce7'],
                descripcion: 'Por conversación'
            }
        ];

        return (
            <View style={metricasStyles.resumenContainer}>
                <TouchableOpacity
                    onPress={() => toggleSeccion('resumen')}
                    activeOpacity={0.7}
                >
                    <View style={metricasStyles.resumenHeader}>
                        <LinearGradient
                            colors={['#667eea', '#764ba2']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={metricasStyles.resumenIcono}
                        >
                            <Ionicons name="analytics" size={28} color="#fff" />
                        </LinearGradient>
                        <View style={{ flex: 1 }}>
                            <Text style={metricasStyles.resumenTitulo}>Resumen Ejecutivo</Text>
                            <Text style={metricasStyles.resumenSubtitulo}>
                                {metricas.filtroInfo?.descripcion ? `Período: ${metricas.filtroInfo.descripcion}` : 'Métricas generales del sistema'}
                            </Text>
                        </View>
                        <Ionicons
                            name={seccionExpandida.resumen ? "chevron-up" : "chevron-down"}
                            size={26}
                            color="#a29bfe"
                        />
                    </View>
                </TouchableOpacity>

                {seccionExpandida.resumen && (
                    <View style={metricasStyles.estadisticasGrid}>
                        {estadisticas.map((stat, index) => (
                            <View key={index} style={metricasStyles.estadisticaItem}>
                                <LinearGradient
                                    colors={stat.color}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={metricasStyles.estadisticaCard}
                                >
                                    <Ionicons
                                        name={stat.icono}
                                        size={28}
                                        color="rgba(255,255,255,0.25)"
                                        style={metricasStyles.estadisticaIcono}
                                    />
                                    <Text style={metricasStyles.estadisticaValor}>{stat.valor}</Text>
                                    <Text style={metricasStyles.estadisticaLabel}>{stat.label}</Text>
                                </LinearGradient>
                            </View>
                        ))}
                    </View>
                )}
            </View>
        );
    };

    // ==================== RENDIMIENTO POR AGENTE ====================
    const renderAgentes = () => {
        if (!metricas.agentesMasActivos || metricas.agentesMasActivos.length === 0) {
            return null;
        }

        // 🔥 Estado para mostrar todos o solo top 5
        const [mostrarTodos, setMostrarTodos] = useState(false);

        // Obtener top 5 y el resto
        const top5Agentes = metricas.agentesMasActivos.slice(0, 5);
        const restantesAgentes = metricas.agentesMasActivos.slice(5);
        const agentesAMostrar = mostrarTodos ? metricas.agentesMasActivos : top5Agentes;

        return (
            <View style={metricasStyles.seccionContainer}>
                <TouchableOpacity
                    onPress={() => toggleSeccion('agentes')}
                    activeOpacity={0.7}
                >
                    <View style={metricasStyles.seccionHeader}>
                        <View style={metricasStyles.seccionIcono}>
                            <Ionicons name="people-circle" size={22} color="#667eea" />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={metricasStyles.seccionTitulo}>Top Agentes Virtuales</Text>
                            <Text style={{ fontSize: 12, color: '#a29bfe', fontWeight: '500', marginTop: 2 }}>
                                {mostrarTodos ? 
                                    `Mostrando ${metricas.agentesMasActivos.length} agentes` : 
                                    `Top ${Math.min(5, metricas.agentesMasActivos.length)} de ${metricas.agentesMasActivos.length} agentes`
                                }
                            </Text>
                        </View>
                        <Ionicons
                            name={seccionExpandida.agentes ? "chevron-up" : "chevron-down"}
                            size={26}
                            color="#a29bfe"
                            style={{ marginLeft: 'auto' }}
                        />
                    </View>
                </TouchableOpacity>

                {seccionExpandida.agentes && (
                    <View>
                        {/* Lista de agentes */}
                        {agentesAMostrar.map((agente, index) => (
                            <TouchableOpacity
                                key={agente.id}
                                style={metricasStyles.agenteItem}
                                onPress={() => onSeleccionarAgente(agente.id)}
                                activeOpacity={0.7}
                            >
                                <View
                                    style={[
                                        metricasStyles.agenteColor,
                                        { backgroundColor: agente.color }
                                    ]}
                                />

                                <View style={metricasStyles.agenteInfo}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                                        <Text style={{ fontSize: 24, marginRight: 10 }}>{agente.icono}</Text>
                                        <View style={{ flex: 1 }}>
                                            <Text style={metricasStyles.agenteNombre}>{agente.nombre}</Text>
                                            <Text style={{ fontSize: 12, color: '#a29bfe', fontWeight: '500' }}>
                                                {agente.area}
                                            </Text>
                                        </View>
                                    </View>

                                    <View style={metricasStyles.agenteMetricas}>
                                        <View style={metricasStyles.agenteMetrica}>
                                            <Ionicons name="chatbubbles" size={15} color="#a29bfe" />
                                            <Text style={metricasStyles.agenteMetricaTexto}>
                                                {agente.conversacionesIniciadas} conv.
                                            </Text>
                                        </View>

                                        <View style={metricasStyles.agenteMetrica}>
                                            <Ionicons name="mail" size={15} color="#a29bfe" />
                                            <Text style={metricasStyles.agenteMetricaTexto}>
                                                {agente.mensajesEnviados} msg
                                            </Text>
                                        </View>

                                        <View style={metricasStyles.agenteMetrica}>
                                            <Ionicons name="star" size={15} color="#ffa502" />
                                            <Text style={metricasStyles.agenteMetricaTexto}>
                                                {agente.satisfaccionPromedio.toFixed(1)}
                                            </Text>
                                        </View>

                                        <View style={metricasStyles.agenteMetrica}>
                                            <Ionicons name="checkmark-circle" size={15} color="#20c997" />
                                            <Text style={metricasStyles.agenteMetricaTexto}>
                                                {agente.tasaResolucion.toFixed(1)}%
                                            </Text>
                                        </View>

                                        <View style={metricasStyles.agenteMetrica}>
                                            <Ionicons name="timer" size={15} color="#667eea" />
                                            <Text style={metricasStyles.agenteMetricaTexto}>
                                                {formatearTiempo(agente.tiempoRespuestaPromedioMs)}
                                            </Text>
                                        </View>
                                    </View>

                                    {/* Barra de progreso de resolución */}
                                    <View style={metricasStyles.progressBar}>
                                        <LinearGradient
                                            colors={obtenerColorTasaResolucion(agente.tasaResolucion)}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 0 }}
                                            style={[
                                                metricasStyles.progressFill,
                                                { width: `${agente.tasaResolucion}%` }
                                            ]}
                                        />
                                    </View>
                                </View>

                                <Ionicons name="chevron-forward" size={22} color="#a29bfe" />
                            </TouchableOpacity>
                        ))}

                        {/* 🔥 BOTÓN PARA VER TODOS */}
                        {restantesAgentes.length > 0 && (
                            <TouchableOpacity
                                onPress={() => setMostrarTodos(!mostrarTodos)}
                                style={{
                                    marginTop: 15,
                                    marginHorizontal: 15,
                                    marginBottom: 10
                                }}
                                activeOpacity={0.7}
                            >
                                <LinearGradient
                                    colors={mostrarTodos ? 
                                        ['rgba(102, 126, 234, 0.25)', 'rgba(118, 75, 162, 0.25)'] : 
                                        ['rgba(102, 126, 234, 0.12)', 'rgba(118, 75, 162, 0.12)']
                                    }
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        padding: 14,
                                        borderRadius: 12,
                                        borderWidth: 1,
                                        borderColor: 'rgba(102, 126, 234, 0.3)'
                                    }}
                                >
                                    <Ionicons 
                                        name={mostrarTodos ? "chevron-up" : "chevron-down"} 
                                        size={18} 
                                        color="#667eea" 
                                        style={{ marginRight: 8 }}
                                    />
                                    <Text style={{
                                        fontSize: 13,
                                        fontWeight: '700',
                                        color: '#667eea'
                                    }}>
                                        {mostrarTodos ? 
                                            'Mostrar solo Top 5' : 
                                            `Ver todos los agentes (${restantesAgentes.length} más)`
                                        }
                                    </Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        )}
                    </View>
                )}
            </View>
        );
    };

    // ==================== TENDENCIAS ====================
    const renderTendencias = () => {
        if (!metricas.metricasPorDia || metricas.metricasPorDia.length === 0) {
            return null;
        }

        const maxConversaciones = Math.max(...metricas.metricasPorDia.map(t => t.conversaciones));

        return (
            <View style={metricasStyles.seccionContainer}>
                <TouchableOpacity
                    onPress={() => toggleSeccion('tendencias')}
                    activeOpacity={0.7}
                >
                    <View style={metricasStyles.seccionHeader}>
                        <View style={metricasStyles.seccionIcono}>
                            <Ionicons name="trending-up" size={22} color="#667eea" />
                        </View>
                        <Text style={metricasStyles.seccionTitulo}>Actividad Diaria</Text>
                        <Ionicons
                            name={seccionExpandida.tendencias ? "chevron-up" : "chevron-down"}
                            size={26}
                            color="#a29bfe"
                            style={{ marginLeft: 'auto' }}
                        />
                    </View>
                </TouchableOpacity>

                {seccionExpandida.tendencias && (
                    <View style={metricasStyles.graficoContainer}>
                        <View style={metricasStyles.graficoHeader}>
                            <Text style={metricasStyles.graficoTitulo}>Últimos 7 días</Text>
                            <View style={metricasStyles.graficoLeyenda}>
                                <View style={metricasStyles.leyendaItem}>
                                    <LinearGradient
                                        colors={['#667eea', '#764ba2']}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 1 }}
                                        style={metricasStyles.leyendaColor}
                                    />
                                    <Text style={metricasStyles.leyendaTexto}>Conversaciones</Text>
                                </View>
                            </View>
                        </View>

                        {/* Gráfico de barras mejorado */}
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ paddingVertical: 15, paddingHorizontal: 5 }}
                        >
                            {metricas.metricasPorDia.map((dia, index) => {
                                const altura = (dia.conversaciones / maxConversaciones) * 140;

                                return (
                                    <View
                                        key={index}
                                        style={{
                                            alignItems: 'center',
                                            marginRight: 25,
                                            width: 55
                                        }}
                                    >
                                        <View style={{ alignItems: 'center', marginBottom: 10 }}>
                                            <Text style={{
                                                fontSize: 18,
                                                fontWeight: '900',
                                                color: '#fff',
                                                marginBottom: 4
                                            }}>
                                                {dia.conversaciones}
                                            </Text>
                                            <Text style={{
                                                fontSize: 11,
                                                color: '#a29bfe',
                                                fontWeight: '600'
                                            }}>
                                                conv.
                                            </Text>
                                        </View>

                                        <LinearGradient
                                            colors={['#667eea', '#764ba2']}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 0, y: 1 }}
                                            style={{
                                                width: 50,
                                                height: altura,
                                                borderRadius: 12,
                                                marginBottom: 10,
                                                shadowColor: '#667eea',
                                                shadowOpacity: 0.6,
                                                shadowRadius: 10,
                                                shadowOffset: { width: 0, height: 5 },
                                                elevation: 8,
                                            }}
                                        />

                                        <Text style={{
                                            fontSize: 13,
                                            color: '#fff',
                                            fontWeight: '700',
                                            marginBottom: 3
                                        }}>
                                            {obtenerNombreDia(dia.fecha)}
                                        </Text>
                                        <Text style={{
                                            fontSize: 11,
                                            color: '#a29bfe',
                                            fontWeight: '600'
                                        }}>
                                            {new Date(dia.fecha).getDate()}/{new Date(dia.fecha).getMonth() + 1}
                                        </Text>
                                    </View>
                                );
                            })}
                        </ScrollView>
                    </View>
                )}
            </View>
        );
    };

    // ==================== HORAS PICO ====================
    const renderHorasPico = () => {
        if (!metricas.horasPico || metricas.horasPico.length === 0) {
            return null;
        }

        return (
            <View style={metricasStyles.seccionContainer}>
                <TouchableOpacity
                    onPress={() => toggleSeccion('horas')}
                    activeOpacity={0.7}
                >
                    <View style={metricasStyles.seccionHeader}>
                        <View style={metricasStyles.seccionIcono}>
                            <Ionicons name="time" size={22} color="#667eea" />
                        </View>
                        <Text style={metricasStyles.seccionTitulo}>Horarios de Mayor Demanda</Text>
                        <Ionicons
                            name={seccionExpandida.horas ? "chevron-up" : "chevron-down"}
                            size={26}
                            color="#a29bfe"
                            style={{ marginLeft: 'auto' }}
                        />
                    </View>
                </TouchableOpacity>

                {seccionExpandida.horas && (
                    <View style={metricasStyles.horasPicoContainer}>
                        {metricas.horasPico.map((hora, index) => (
                            <View key={index} style={metricasStyles.horaPicoItem}>
                                <LinearGradient
                                    colors={['rgba(102, 126, 234, 0.15)', 'rgba(118, 75, 162, 0.15)']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={metricasStyles.horaPicoCard}
                                >
                                    <Ionicons name="time-outline" size={20} color="#a29bfe" style={{ marginBottom: 6 }} />
                                    <Text style={metricasStyles.horaPicoHora}>
                                        {`${hora.hora}:00`}
                                    </Text>
                                    <Text style={metricasStyles.horaPicoCantidad}>{hora.cantidad}</Text>
                                    <Text style={{ fontSize: 11, color: '#a29bfe', fontWeight: '600', marginTop: 4 }}>
                                        mensajes
                                    </Text>
                                </LinearGradient>
                            </View>
                        ))}
                    </View>
                )}
            </View>
        );
    };

    // ==================== CONTENIDO MÁS USADO ====================
    const renderContenidoMasUsado = () => {
        if (!metricas.contenidoMasUsado || metricas.contenidoMasUsado.length === 0) {
            return null;
        }

        const coloresRanking = [
            ['#ffd93d', '#ffa502'], // Oro
            ['#bdc3c7', '#95a5a6'], // Plata
            ['#d4a574', '#cd853f'], // Bronce
            ['#667eea', '#764ba2'], // Púrpura
            ['#3bc9db', '#1c7ed6']  // Azul
        ];

        const iconosRanking = ['trophy', 'medal', 'ribbon', 'star', 'bookmark'];

        return (
            <View style={metricasStyles.seccionContainer}>
                <TouchableOpacity
                    onPress={() => toggleSeccion('contenido')}
                    activeOpacity={0.7}
                >
                    <View style={metricasStyles.seccionHeader}>
                        <View style={metricasStyles.seccionIcono}>
                            <Ionicons name="document-text" size={22} color="#667eea" />
                        </View>
                        <Text style={metricasStyles.seccionTitulo}>Contenido Más Consultado</Text>
                        <Ionicons
                            name={seccionExpandida.contenido ? "chevron-up" : "chevron-down"}
                            size={26}
                            color="#a29bfe"
                            style={{ marginLeft: 'auto' }}
                        />
                    </View>
                </TouchableOpacity>

                {seccionExpandida.contenido && metricas.contenidoMasUsado.map((contenido, index) => (
                    <View key={contenido.id} style={metricasStyles.contenidoItem}>
                        <LinearGradient
                            colors={coloresRanking[index] || coloresRanking[4]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={metricasStyles.contenidoRanking}
                        >
                            <Ionicons
                                name={iconosRanking[index] || iconosRanking[4]}
                                size={20}
                                color="#fff"
                            />
                        </LinearGradient>

                        <View style={metricasStyles.contenidoInfo}>
                            <Text style={metricasStyles.contenidoTitulo}>{contenido.titulo}</Text>

                            <View style={{ marginBottom: 8 }}>
                                <Text style={{ fontSize: 12, color: '#a29bfe', fontWeight: '600' }}>
                                    📂 {contenido.categoria} • {contenido.agente}
                                </Text>
                            </View>

                            <View style={metricasStyles.contenidoStats}>
                                <View style={metricasStyles.contenidoStat}>
                                    <Ionicons name="eye" size={15} color="#a29bfe" />
                                    <Text style={metricasStyles.contenidoStatTexto}>
                                        {contenido.usos} usos
                                    </Text>
                                </View>

                                <View style={metricasStyles.contenidoStat}>
                                    <Ionicons name="star" size={15} color="#ffa502" />
                                    <Text style={metricasStyles.contenidoStatTexto}>
                                        {contenido.utilidad.toFixed(1)}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        <Ionicons name="chevron-forward" size={22} color="#a29bfe" />
                    </View>
                ))}
            </View>
        );
    };

    // ==================== 🔥 NUEVO: GRÁFICO DE PASTEL - DISTRIBUCIÓN DE ESTADOS ====================
    const renderGraficoPastel = () => {
        if (!metricas.mongoMetrics) {
            return null;
        }

        const estados = [
            {
                label: 'Activas',
                valor: metricas.mongoMetrics.conversacionesActivas || 0,
                color: ['#20c997', '#17a2b8'],
                icono: 'radio-button-on'
            },
            {
                label: 'Finalizadas',
                valor: metricas.mongoMetrics.conversacionesFinalizadas || 0,
                color: ['#667eea', '#764ba2'],
                icono: 'checkmark-circle'
            },
            {
                label: 'Escaladas',
                valor: metricas.mongoMetrics.conversacionesEscaladas || 0,
                color: ['#ffa502', '#ff6348'],
                icono: 'arrow-up-circle'
            }
        ];

        const total = estados.reduce((sum, estado) => sum + estado.valor, 0);
        
        if (total === 0) {
            return null;
        }

        // Calcular porcentajes
        const segmentos = estados.map(estado => ({
            ...estado,
            porcentaje: (estado.valor / total) * 100
        }));

        return (
            <View style={metricasStyles.seccionContainer}>
                <TouchableOpacity
                    onPress={() => toggleSeccion('pastel')}
                    activeOpacity={0.7}
                >
                    <View style={metricasStyles.seccionHeader}>
                        <View style={metricasStyles.seccionIcono}>
                            <Ionicons name="pie-chart" size={22} color="#667eea" />
                        </View>
                        <Text style={metricasStyles.seccionTitulo}>Distribución por Estado</Text>
                        <Ionicons
                            name={seccionExpandida.pastel ? "chevron-up" : "chevron-down"}
                            size={26}
                            color="#a29bfe"
                            style={{ marginLeft: 'auto' }}
                        />
                    </View>
                </TouchableOpacity>

                {seccionExpandida.pastel && (
                    <View style={metricasStyles.graficoContainer}>
                        {/* Gráfico de pastel mejorado con react-native-chart-kit */}
                        <View style={{
                            alignItems: 'center',
                            marginBottom: 30,
                            backgroundColor: 'rgba(15, 15, 35, 0.5)',
                            borderRadius: 20,
                            padding: isWeb ? 20 : 15,
                            borderWidth: 1,
                            borderColor: 'rgba(102, 126, 234, 0.3)'
                        }}>
                            <PieChart
                                data={segmentos.map((seg, idx) => ({
                                    name: `${seg.label}\n${seg.porcentaje.toFixed(1)}%`,
                                    population: seg.valor,
                                    color: seg.color[0],
                                    legendFontColor: '#fff',
                                    legendFontSize: isWeb ? 13 : 11
                                }))}
                                width={isWeb ? width - 80 : width - 40}
                                height={isWeb ? 240 : 200}
                                chartConfig={{
                                    backgroundColor: 'transparent',
                                    backgroundGradientFrom: 'transparent',
                                    backgroundGradientTo: 'transparent',
                                    decimalPlaces: 0,
                                    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                                    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                                    propsForLabels: {
                                        fontSize: isWeb ? 14 : 12,
                                        fontWeight: '900'
                                    }
                                }}
                                accessor="population"
                                backgroundColor="transparent"
                                paddingLeft={isWeb ? "15" : "10"}
                                absolute
                                hasLegend={true}
                                style={{
                                    marginVertical: 5,
                                    borderRadius: 16
                                }}
                            />
                        </View>

                        {/* Estadísticas detalladas en tarjetas */}
                        <View style={{ marginTop: 10, marginBottom: 15, flexDirection: isWeb ? 'row' : 'column', flexWrap: 'wrap', justifyContent: 'space-between', paddingHorizontal: isWeb ? 10 : 0 }}>
                            {segmentos.map((seg, idx) => (
                                <LinearGradient
                                    key={idx}
                                    colors={[...seg.color].reverse()}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={{
                                        marginBottom: 12,
                                        padding: isWeb ? 18 : 14,
                                        borderRadius: 18,
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        width: isWeb ? 'calc(33.333% - 10px)' : '100%',
                                        shadowColor: seg.color[0],
                                        shadowOpacity: 0.5,
                                        shadowRadius: 15,
                                        shadowOffset: { width: 0, height: 6 },
                                        elevation: 10
                                    }}
                                >
                                    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                                        <View style={{
                                            width: isWeb ? 55 : 48,
                                            height: isWeb ? 55 : 48,
                                            borderRadius: isWeb ? 27.5 : 24,
                                            backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            marginRight: isWeb ? 15 : 12
                                        }}>
                                            <Ionicons name={seg.icono} size={isWeb ? 28 : 24} color="#fff" />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={{
                                                fontSize: isWeb ? 18 : 15,
                                                fontWeight: '900',
                                                color: '#fff',
                                                marginBottom: 4,
                                                textShadowColor: 'rgba(0, 0, 0, 0.3)',
                                                textShadowRadius: 3,
                                                textShadowOffset: { width: 0, height: 1 }
                                            }}>
                                                {seg.label}
                                            </Text>
                                            <Text style={{
                                                fontSize: isWeb ? 13 : 11,
                                                color: 'rgba(255, 255, 255, 0.85)',
                                                fontWeight: '700'
                                            }}>
                                                {seg.valor} conv.
                                            </Text>
                                        </View>
                                    </View>
                                    
                                    <View style={{
                                        backgroundColor: 'rgba(255, 255, 255, 0.25)',
                                        paddingHorizontal: isWeb ? 16 : 12,
                                        paddingVertical: isWeb ? 10 : 8,
                                        borderRadius: 14,
                                        minWidth: isWeb ? 70 : 60,
                                        alignItems: 'center',
                                        marginLeft: isWeb ? 10 : 8
                                    }}>
                                        <Text style={{
                                            fontSize: isWeb ? 24 : 20,
                                            fontWeight: '900',
                                            color: '#fff',
                                            textShadowColor: 'rgba(0, 0, 0, 0.3)',
                                            textShadowRadius: 3,
                                            textShadowOffset: { width: 0, height: 1 }
                                        }}>
                                            {seg.porcentaje.toFixed(1)}%
                                        </Text>
                                    </View>
                                </LinearGradient>
                            ))}
                        </View>

                        {/* Total destacado */}
                        <LinearGradient
                            colors={['rgba(102, 126, 234, 0.25)', 'rgba(118, 75, 162, 0.25)']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={{
                                marginHorizontal: isWeb ? 5 : 0,
                                marginTop: 10,
                                padding: isWeb ? 20 : 15,
                                borderRadius: 18,
                                borderWidth: 2,
                                borderColor: 'rgba(102, 126, 234, 0.5)',
                                flexDirection: isWeb ? 'row' : 'column',
                                justifyContent: 'space-between',
                                alignItems: isWeb ? 'center' : 'flex-start',
                                shadowColor: '#667eea',
                                shadowOpacity: 0.4,
                                shadowRadius: 15,
                                shadowOffset: { width: 0, height: 8 },
                                elevation: 8
                            }}
                        >
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: isWeb ? 0 : 12 }}>
                                <LinearGradient
                                    colors={['#667eea', '#764ba2']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={{
                                        width: isWeb ? 55 : 50,
                                        height: isWeb ? 55 : 50,
                                        borderRadius: isWeb ? 27.5 : 25,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        marginRight: isWeb ? 15 : 12,
                                        shadowColor: '#667eea',
                                        shadowOpacity: 0.6,
                                        shadowRadius: 10,
                                        elevation: 8
                                    }}
                                >
                                    <Ionicons name="analytics" size={isWeb ? 28 : 24} color="#fff" />
                                </LinearGradient>
                                <View>
                                    <Text style={{
                                        fontSize: isWeb ? 14 : 12,
                                        color: '#a29bfe',
                                        fontWeight: '800',
                                        marginBottom: 3
                                    }}>
                                        TOTAL CONVERSACIONES
                                    </Text>
                                    <Text style={{
                                        fontSize: isWeb ? 12 : 11,
                                        color: '#667eea',
                                        fontWeight: '600'
                                    }}>
                                        Suma de todos los estados
                                    </Text>
                                </View>
                            </View>
                            <View style={{
                                backgroundColor: 'rgba(102, 126, 234, 0.3)',
                                paddingHorizontal: isWeb ? 20 : 16,
                                paddingVertical: isWeb ? 12 : 10,
                                borderRadius: 16,
                                borderWidth: 2,
                                borderColor: '#667eea'
                            }}>
                                <Text style={{
                                    fontSize: isWeb ? 32 : 28,
                                    fontWeight: '900',
                                    color: '#667eea',
                                    textShadowColor: 'rgba(102, 126, 234, 0.5)',
                                    textShadowRadius: 8,
                                    textShadowOffset: { width: 0, height: 0 }
                                }}>
                                    {total}
                                </Text>
                            </View>
                        </LinearGradient>
                    </View>
                )}
            </View>
        );
    };

    // ==================== 🔥 NUEVO: GRÁFICO DE BARRAS HORIZONTALES - TOP AGENTES ====================
    const renderGraficoBarrasHorizontales = () => {
        if (!metricas.agentesMasActivos || metricas.agentesMasActivos.length === 0) {
            return null;
        }

        const top5 = metricas.agentesMasActivos.slice(0, 5);
        const maxConversaciones = Math.max(...top5.map(a => a.conversacionesIniciadas));

        const colores = [
            ['#667eea', '#764ba2'],
            ['#f093fb', '#f5576c'],
            ['#20c997', '#17a2b8'],
            ['#ffa502', '#ff6348'],
            ['#a29bfe', '#6c5ce7']
        ];

        return (
            <View style={metricasStyles.seccionContainer}>
                <TouchableOpacity
                    onPress={() => toggleSeccion('barrasHorizontales')}
                    activeOpacity={0.7}
                >
                    <View style={metricasStyles.seccionHeader}>
                        <View style={metricasStyles.seccionIcono}>
                            <Ionicons name="bar-chart" size={22} color="#667eea" />
                        </View>
                        <Text style={metricasStyles.seccionTitulo}>Top 5 Agentes - Comparativa</Text>
                        <Ionicons
                            name={seccionExpandida.barrasHorizontales ? "chevron-up" : "chevron-down"}
                            size={26}
                            color="#a29bfe"
                            style={{ marginLeft: 'auto' }}
                        />
                    </View>
                </TouchableOpacity>

                {seccionExpandida.barrasHorizontales && (
                    <View style={metricasStyles.graficoContainer}>
                        {top5.map((agente, index) => {
                            const porcentaje = (agente.conversacionesIniciadas / maxConversaciones) * 100;

                            return (
                                <TouchableOpacity
                                    key={agente.id}
                                    activeOpacity={0.7}
                                    onPress={() => onSeleccionarAgente(agente.id)}
                                    style={{ marginBottom: 25 }}
                                >
                                    {/* Header con nombre y valor */}
                                    <View style={{
                                        flexDirection: 'row',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        marginBottom: 12
                                    }}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                                            <Text style={{ fontSize: 28, marginRight: 12 }}>
                                                {agente.icono}
                                            </Text>
                                            <View style={{ flex: 1 }}>
                                                <Text style={{
                                                    fontSize: 16,
                                                    fontWeight: '800',
                                                    color: '#fff',
                                                    marginBottom: 3
                                                }}>
                                                    {agente.nombre}
                                                </Text>
                                                <Text style={{
                                                    fontSize: 12,
                                                    color: '#a29bfe',
                                                    fontWeight: '600'
                                                }}>
                                                    {agente.area}
                                                </Text>
                                            </View>
                                        </View>
                                        
                                        <LinearGradient
                                            colors={colores[index]}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 1 }}
                                            style={{
                                                paddingHorizontal: 16,
                                                paddingVertical: 10,
                                                borderRadius: 16,
                                                shadowColor: colores[index][0],
                                                shadowOpacity: 0.5,
                                                shadowRadius: 10,
                                                elevation: 5
                                            }}
                                        >
                                            <Text style={{
                                                fontSize: 22,
                                                fontWeight: '900',
                                                color: '#fff'
                                            }}>
                                                {agente.conversacionesIniciadas}
                                            </Text>
                                        </LinearGradient>
                                    </View>

                                    {/* Barra de progreso */}
                                    <View style={{
                                        height: 40,
                                        backgroundColor: 'rgba(102, 126, 234, 0.12)',
                                        borderRadius: 20,
                                        overflow: 'hidden',
                                        borderWidth: 2,
                                        borderColor: 'rgba(102, 126, 234, 0.25)'
                                    }}>
                                        <LinearGradient
                                            colors={colores[index]}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 0 }}
                                            style={{
                                                width: `${porcentaje}%`,
                                                height: '100%',
                                                justifyContent: 'center',
                                                paddingLeft: 18,
                                                shadowColor: colores[index][0],
                                                shadowOpacity: 0.6,
                                                shadowRadius: 10,
                                                elevation: 5
                                            }}
                                        >
                                            <Text style={{
                                                fontSize: 14,
                                                fontWeight: '900',
                                                color: '#fff',
                                                textShadowColor: 'rgba(0, 0, 0, 0.3)',
                                                textShadowRadius: 3,
                                                textShadowOffset: { width: 0, height: 1 }
                                            }}>
                                                {porcentaje.toFixed(0)}%
                                            </Text>
                                        </LinearGradient>
                                    </View>

                                    {/* Métricas adicionales */}
                                    <View style={{
                                        flexDirection: 'row',
                                        marginTop: 12,
                                        paddingHorizontal: 5,
                                        justifyContent: 'space-around'
                                    }}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            <Ionicons name="star" size={16} color="#ffa502" />
                                            <Text style={{
                                                fontSize: 13,
                                                color: '#a29bfe',
                                                marginLeft: 6,
                                                fontWeight: '700'
                                            }}>
                                                {agente.satisfaccionPromedio.toFixed(1)} / 5.0
                                            </Text>
                                        </View>
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            <Ionicons name="checkmark-circle" size={16} color="#20c997" />
                                            <Text style={{
                                                fontSize: 13,
                                                color: '#a29bfe',
                                                marginLeft: 6,
                                                fontWeight: '700'
                                            }}>
                                                {agente.tasaResolucion.toFixed(0)}% resueltas
                                            </Text>
                                        </View>
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            <Ionicons name="mail" size={16} color="#667eea" />
                                            <Text style={{
                                                fontSize: 13,
                                                color: '#a29bfe',
                                                marginLeft: 6,
                                                fontWeight: '700'
                                            }}>
                                                {agente.mensajesEnviados} msgs
                                            </Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                )}
            </View>
        );
    };

    // ==================== VISITANTES ====================
    const renderVisitantes = () => {
        if (!metricas.visitantes) {
            return null;
        }

        const { visitantes } = metricas;

        return (
            <View style={metricasStyles.seccionContainer}>
                <TouchableOpacity
                    onPress={() => toggleSeccion('visitantes')}
                    activeOpacity={0.7}
                >
                    <View style={metricasStyles.seccionHeader}>
                        <View style={metricasStyles.seccionIcono}>
                            <Ionicons name="people" size={22} color="#667eea" />
                        </View>
                        <Text style={metricasStyles.seccionTitulo}>Visitantes Anónimos</Text>
                        <Ionicons
                            name={seccionExpandida.visitantes ? "chevron-up" : "chevron-down"}
                            size={26}
                            color="#a29bfe"
                            style={{ marginLeft: 'auto' }}
                        />
                    </View>
                </TouchableOpacity>

                {seccionExpandida.visitantes && (
                    <View>
                        {/* Tarjetas Resumen */}
                        <View style={metricasStyles.estadisticasGrid}>
                            <View style={metricasStyles.estadisticaItem}>
                                <LinearGradient
                                    colors={['#3bc9db', '#1c7ed6']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={metricasStyles.estadisticaCard}
                                >
                                    <Ionicons
                                        name="people-outline"
                                        size={28}
                                        color="rgba(255,255,255,0.25)"
                                        style={metricasStyles.estadisticaIcono}
                                    />
                                    <Text style={metricasStyles.estadisticaValor}>
                                        {formatearNumero(visitantes.total)}
                                    </Text>
                                    <Text style={metricasStyles.estadisticaLabel}>Total Visitantes</Text>
                                </LinearGradient>
                            </View>

                            <View style={metricasStyles.estadisticaItem}>
                                <LinearGradient
                                    colors={['#20c997', '#17a2b8']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={metricasStyles.estadisticaCard}
                                >
                                    <Ionicons
                                        name="pulse"
                                        size={28}
                                        color="rgba(255,255,255,0.25)"
                                        style={metricasStyles.estadisticaIcono}
                                    />
                                    <Text style={metricasStyles.estadisticaValor}>
                                        {visitantes.activos || 0}
                                    </Text>
                                    <Text style={metricasStyles.estadisticaLabel}>Activos Ahora</Text>
                                </LinearGradient>
                            </View>
                        </View>

                        {/* Gráfica: Dispositivos */}
                        {visitantes.porDispositivo && visitantes.porDispositivo.length > 0 && (
                            <View style={[metricasStyles.graficoContainer, { marginTop: 20 }]}>
                                <View style={metricasStyles.graficoHeader}>
                                    <Text style={metricasStyles.graficoTitulo}>Por Dispositivo</Text>
                                </View>

                                <View style={{ paddingVertical: 20 }}>
                                    {visitantes.porDispositivo.map((dispositivo, index) => {
                                        const colores = [
                                            ['#667eea', '#764ba2'],
                                            ['#f093fb', '#f5576c'],
                                            ['#3bc9db', '#1c7ed6']
                                        ];
                                        const iconos = ['phone-portrait', 'desktop', 'tablet-portrait'];

                                        return (
                                            <View key={index} style={{
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                                marginBottom: 15,
                                                paddingHorizontal: 15
                                            }}>
                                                <LinearGradient
                                                    colors={colores[index] || colores[0]}
                                                    start={{ x: 0, y: 0 }}
                                                    end={{ x: 1, y: 1 }}
                                                    style={{
                                                        width: 40,
                                                        height: 40,
                                                        borderRadius: 12,
                                                        justifyContent: 'center',
                                                        alignItems: 'center',
                                                        marginRight: 12
                                                    }}
                                                >
                                                    <Ionicons
                                                        name={iconos[index] || 'phone-portrait'}
                                                        size={20}
                                                        color="#fff"
                                                    />
                                                </LinearGradient>

                                                <View style={{ flex: 1 }}>
                                                    <View style={{
                                                        flexDirection: 'row',
                                                        justifyContent: 'space-between',
                                                        marginBottom: 6
                                                    }}>
                                                        <Text style={{
                                                            fontSize: 15,
                                                            fontWeight: '700',
                                                            color: '#fff'
                                                        }}>
                                                            {dispositivo.name}
                                                        </Text>
                                                        <Text style={{
                                                            fontSize: 15,
                                                            fontWeight: '700',
                                                            color: '#fff'
                                                        }}>
                                                            {dispositivo.value}
                                                        </Text>
                                                    </View>

                                                    <View style={{
                                                        height: 8,
                                                        backgroundColor: 'rgba(162, 155, 254, 0.15)',
                                                        borderRadius: 4,
                                                        overflow: 'hidden'
                                                    }}>
                                                        <LinearGradient
                                                            colors={colores[index] || colores[0]}
                                                            start={{ x: 0, y: 0 }}
                                                            end={{ x: 1, y: 0 }}
                                                            style={{
                                                                height: '100%',
                                                                width: `${dispositivo.porcentaje}%`
                                                            }}
                                                        />
                                                    </View>

                                                    <Text style={{
                                                        fontSize: 12,
                                                        color: '#a29bfe',
                                                        fontWeight: '600',
                                                        marginTop: 4
                                                    }}>
                                                        {dispositivo.porcentaje}% del total
                                                    </Text>
                                                </View>
                                            </View>
                                        );
                                    })}
                                </View>
                            </View>
                        )}

                        {/* Gráfica: Top Países */}
                        {visitantes.porPais && visitantes.porPais.length > 0 && (
                            <View style={[metricasStyles.graficoContainer, { marginTop: 20 }]}>
                                <View style={metricasStyles.graficoHeader}>
                                    <Text style={metricasStyles.graficoTitulo}>Top Países</Text>
                                </View>

                                <View style={{ paddingVertical: 15 }}>
                                    {visitantes.porPais.slice(0, 5).map((pais, index) => {
                                        const maxCantidad = visitantes.porPais[0]?.cantidad || 1;
                                        const porcentaje = (pais.cantidad / maxCantidad) * 100;

                                        return (
                                            <View key={index} style={{
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                                marginBottom: 12,
                                                paddingHorizontal: 15
                                            }}>
                                                <View style={{
                                                    width: 35,
                                                    height: 35,
                                                    borderRadius: 10,
                                                    backgroundColor: 'rgba(102, 126, 234, 0.2)',
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                    marginRight: 12
                                                }}>
                                                    <Text style={{ fontSize: 18 }}>
                                                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '📍'}
                                                    </Text>
                                                </View>

                                                <View style={{ flex: 1 }}>
                                                    <View style={{
                                                        flexDirection: 'row',
                                                        justifyContent: 'space-between',
                                                        marginBottom: 6
                                                    }}>
                                                        <Text style={{
                                                            fontSize: 14,
                                                            fontWeight: '700',
                                                            color: '#fff'
                                                        }}>
                                                            {pais.pais}
                                                        </Text>
                                                        <Text style={{
                                                            fontSize: 14,
                                                            fontWeight: '700',
                                                            color: '#a29bfe'
                                                        }}>
                                                            {pais.cantidad}
                                                        </Text>
                                                    </View>

                                                    <View style={{
                                                        height: 6,
                                                        backgroundColor: 'rgba(162, 155, 254, 0.15)',
                                                        borderRadius: 3,
                                                        overflow: 'hidden'
                                                    }}>
                                                        <LinearGradient
                                                            colors={['#667eea', '#764ba2']}
                                                            start={{ x: 0, y: 0 }}
                                                            end={{ x: 1, y: 0 }}
                                                            style={{
                                                                height: '100%',
                                                                width: `${porcentaje}%`
                                                            }}
                                                        />
                                                    </View>
                                                </View>
                                            </View>
                                        );
                                    })}
                                </View>
                            </View>
                        )}
                    </View>
                )}
            </View>
        );
    };

    // ==================== CONVERSACIONES DETALLADAS ====================
    const renderMetricasMongo = () => {
        if (!metricas.mongoMetrics) {
            return null;
        }

        const { mongoMetrics } = metricas;

        if (mongoMetrics.totalConversaciones === 0) {
            return null;
        }

        // 🔥 NUEVO: Estado local para días seleccionados
        const [diasSeleccionados, setDiasSeleccionados] = React.useState(7);

        return (
            <View style={metricasStyles.seccionContainer}>
                <TouchableOpacity
                    onPress={() => toggleSeccion('mongo')}
                    activeOpacity={0.7}
                >
                    <View style={metricasStyles.seccionHeader}>
                        <View style={metricasStyles.seccionIcono}>
                            <Ionicons name="server" size={22} color="#667eea" />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={metricasStyles.seccionTitulo}>
                                Conversaciones en Tiempo Real
                            </Text>
                            <Text style={{ fontSize: 12, color: '#a29bfe', fontWeight: '500', marginTop: 2 }}>
                                Datos de MongoDB
                            </Text>
                        </View>
                        <Ionicons
                            name={seccionExpandida.mongo ? "chevron-up" : "chevron-down"}
                            size={26}
                            color="#a29bfe"
                            style={{ marginLeft: 'auto' }}
                        />
                    </View>
                </TouchableOpacity>

                {seccionExpandida.mongo && (
                    <View>

                        {/* Tarjetas Resumen */}
                        <View style={metricasStyles.estadisticasGrid}>
                            <View style={metricasStyles.estadisticaItem}>
                                <LinearGradient
                                    colors={['#667eea', '#764ba2']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={metricasStyles.estadisticaCard}
                                >
                                    <Ionicons
                                        name="chatbubbles"
                                        size={28}
                                        color="rgba(255,255,255,0.25)"
                                        style={metricasStyles.estadisticaIcono}
                                    />
                                    <Text style={metricasStyles.estadisticaValor}>
                                        {formatearNumero(mongoMetrics.totalConversaciones)}
                                    </Text>
                                    <Text style={metricasStyles.estadisticaLabel}>Total MongoDB</Text>
                                </LinearGradient>
                            </View>

                            <View style={metricasStyles.estadisticaItem}>
                                <LinearGradient
                                    colors={['#20c997', '#17a2b8']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={metricasStyles.estadisticaCard}
                                >
                                    <Ionicons
                                        name="pulse"
                                        size={28}
                                        color="rgba(255,255,255,0.25)"
                                        style={metricasStyles.estadisticaIcono}
                                    />
                                    <Text style={metricasStyles.estadisticaValor}>
                                        {formatearNumero(mongoMetrics.conversacionesActivas)}
                                    </Text>
                                    <Text style={metricasStyles.estadisticaLabel}>Activas</Text>
                                </LinearGradient>
                            </View>

                            <View style={metricasStyles.estadisticaItem}>
                                <LinearGradient
                                    colors={['#51cf66', '#37b24d']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={metricasStyles.estadisticaCard}
                                >
                                    <Ionicons
                                        name="checkmark-done"
                                        size={28}
                                        color="rgba(255,255,255,0.25)"
                                        style={metricasStyles.estadisticaIcono}
                                    />
                                    <Text style={metricasStyles.estadisticaValor}>
                                        {formatearNumero(mongoMetrics.conversacionesFinalizadas)}
                                    </Text>
                                    <Text style={metricasStyles.estadisticaLabel}>Finalizadas</Text>
                                </LinearGradient>
                            </View>

                            <View style={metricasStyles.estadisticaItem}>
                                <LinearGradient
                                    colors={['#ffa502', '#ff6348']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={metricasStyles.estadisticaCard}
                                >
                                    <Ionicons
                                        name="arrow-up-circle"
                                        size={28}
                                        color="rgba(255,255,255,0.25)"
                                        style={metricasStyles.estadisticaIcono}
                                    />
                                    <Text style={metricasStyles.estadisticaValor}>
                                        {formatearNumero(mongoMetrics.conversacionesEscaladas)}
                                    </Text>
                                    <Text style={metricasStyles.estadisticaLabel}>Escaladas</Text>
                                </LinearGradient>
                            </View>

                            <View style={metricasStyles.estadisticaItem}>
                                <LinearGradient
                                    colors={['#a29bfe', '#6c5ce7']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={metricasStyles.estadisticaCard}
                                >
                                    <Ionicons
                                        name="mail"
                                        size={28}
                                        color="rgba(255,255,255,0.25)"
                                        style={metricasStyles.estadisticaIcono}
                                    />
                                    <Text style={metricasStyles.estadisticaValor}>
                                        {mongoMetrics.promedioMensajes.toFixed(1)}
                                    </Text>
                                    <Text style={metricasStyles.estadisticaLabel}>Mensajes/Conv</Text>
                                </LinearGradient>
                            </View>

                            <View style={metricasStyles.estadisticaItem}>
                                <LinearGradient
                                    colors={obtenerColorSatisfaccion(mongoMetrics.calificacionPromedio || 0)}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={metricasStyles.estadisticaCard}
                                >
                                    <Ionicons
                                        name="star"
                                        size={28}
                                        color="rgba(255,255,255,0.25)"
                                        style={metricasStyles.estadisticaIcono}
                                    />
                                    <Text style={metricasStyles.estadisticaValor}>
                                        {mongoMetrics.calificacionPromedio ? 
                                            mongoMetrics.calificacionPromedio.toFixed(1) : 
                                            'N/A'
                                        }
                                    </Text>
                                    <Text style={metricasStyles.estadisticaLabel}>Calificación</Text>
                                </LinearGradient>
                            </View>
                        </View>



                        {/* 🔥 GRÁFICA DE LÍNEAS */}
                        {mongoMetrics.datosDiarios && mongoMetrics.datosDiarios.length > 0 && (
                            <View style={[metricasStyles.graficoContainer, { marginTop: 20 }]}>
                                <View style={metricasStyles.graficoHeader}>
                                    <Text style={metricasStyles.graficoTitulo}>
                                        Tendencia Últimos {diasSeleccionados} Días
                                    </Text>
                                </View>

                                 {/* 🔥 NUEVO: Selector de días para la gráfica */}
                                <View style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    marginTop: 15,
                                    marginBottom: 10,
                                    paddingHorizontal: 15
                                }}>
                                    <Text style={{
                                        fontSize: 13,
                                        color: '#a29bfe',
                                        fontWeight: '600'
                                    }}>
                                        Rango de datos:
                                    </Text>

                                    <ScrollView
                                        horizontal
                                        showsHorizontalScrollIndicator={false}
                                        style={{ flexGrow: 0 }}
                                        contentContainerStyle={{ flexDirection: 'row', gap: 8 }}
                                    >
                                        {[3, 7, 14, 30].map((dias) => (
                                            <TouchableOpacity
                                                key={dias}
                                                onPress={() => {
                                                    setDiasSeleccionados(dias);
                                                    // 🔥 Recargar datos con nuevos días
                                                    if (metricas.onRecargarDatosDiarios) {
                                                        metricas.onRecargarDatosDiarios(dias);
                                                    }
                                                }}
                                                activeOpacity={0.7}
                                            >
                                                {diasSeleccionados === dias ? (
                                                    <LinearGradient
                                                        colors={['#667eea', '#764ba2']}
                                                        start={{ x: 0, y: 0 }}
                                                        end={{ x: 1, y: 1 }}
                                                        style={{
                                                            paddingHorizontal: 16,
                                                            paddingVertical: 8,
                                                            borderRadius: 20,
                                                            flexDirection: 'row',
                                                            alignItems: 'center'
                                                        }}
                                                    >
                                                        <Ionicons name="calendar" size={14} color="#fff" style={{ marginRight: 6 }} />
                                                        <Text style={{
                                                            fontSize: 13,
                                                            fontWeight: '700',
                                                            color: '#fff'
                                                        }}>
                                                            {dias === 3 ? '3 días' : dias === 7 ? '1 semana' : dias === 14 ? '2 semanas' : '1 mes'}
                                                        </Text>
                                                    </LinearGradient>
                                                ) : (
                                                    <View style={{
                                                        paddingHorizontal: 16,
                                                        paddingVertical: 8,
                                                        borderRadius: 20,
                                                        backgroundColor: 'rgba(162, 155, 254, 0.1)',
                                                        borderWidth: 1,
                                                        borderColor: 'rgba(162, 155, 254, 0.2)',
                                                        flexDirection: 'row',
                                                        alignItems: 'center'
                                                    }}>
                                                        <Ionicons name="calendar-outline" size={14} color="#a29bfe" style={{ marginRight: 6 }} />
                                                        <Text style={{
                                                            fontSize: 13,
                                                            fontWeight: '600',
                                                            color: '#a29bfe'
                                                        }}>
                                                            {dias === 3 ? '3 días' : dias === 7 ? '1 semana' : dias === 14 ? '2 semanas' : '1 mes'}
                                                        </Text>
                                                    </View>
                                                )}
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                </View>

                                <LineChart
                                    data={{
                                        labels: mongoMetrics.datosDiarios.slice(-diasSeleccionados).map(d => {
                                            const fecha = new Date(d.fecha);
                                            return `${fecha.getDate()}/${fecha.getMonth() + 1}`;
                                        }),
                                        datasets: [
                                            {
                                                data: mongoMetrics.datosDiarios.slice(-diasSeleccionados).map(d => d.total),
                                                color: (opacity = 1) => `rgba(102, 126, 234, ${opacity})`,
                                                strokeWidth: 3
                                            },
                                            {
                                                data: mongoMetrics.datosDiarios.slice(-diasSeleccionados).map(d => d.finalizadas),
                                                color: (opacity = 1) => `rgba(81, 207, 102, ${opacity})`,
                                                strokeWidth: 3
                                            },
                                            {
                                                data: mongoMetrics.datosDiarios.slice(-diasSeleccionados).map(d => d.escaladas),
                                                color: (opacity = 1) => `rgba(255, 165, 2, ${opacity})`,
                                                strokeWidth: 3
                                            }
                                        ],
                                        legend: ["Total", "Finalizadas", "Escaladas"]
                                    }}
                                    width={isTablet ? width * 0.85 : width - 60}
                                    height={250}
                                    chartConfig={{
                                        backgroundColor: 'transparent',
                                        backgroundGradientFrom: 'rgba(26, 26, 46, 0.5)',
                                        backgroundGradientTo: 'rgba(22, 33, 62, 0.5)',
                                        decimalPlaces: 0,
                                        color: (opacity = 1) => `rgba(162, 155, 254, ${opacity})`,
                                        labelColor: (opacity = 1) => `rgba(162, 155, 254, ${opacity})`,
                                        style: {
                                            borderRadius: 16
                                        },
                                        propsForDots: {
                                            r: "6",
                                            strokeWidth: "2",
                                            stroke: "#1a1a2e"
                                        },
                                        propsForBackgroundLines: {
                                            strokeDasharray: "",
                                            stroke: "rgba(162, 155, 254, 0.1)",
                                            strokeWidth: 1
                                        }
                                    }}
                                    bezier
                                    style={{
                                        marginVertical: 15,
                                        borderRadius: 16,
                                        alignSelf: 'center'
                                    }}
                                    withVerticalLines={false}
                                    withHorizontalLines={true}
                                    withInnerLines={true}
                                    withOuterLines={false}
                                    withShadow={false}
                                />

                                {/* Leyenda personalizada */}
                                <View style={{
                                    flexDirection: 'row',
                                    justifyContent: 'center',
                                    flexWrap: 'wrap',
                                    marginTop: 10,
                                    paddingHorizontal: 15
                                }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 20, marginBottom: 10 }}>
                                        <View style={{
                                            width: 20,
                                            height: 4,
                                            backgroundColor: '#667eea',
                                            marginRight: 8,
                                            borderRadius: 2
                                        }} />
                                        <Text style={{ fontSize: 13, color: '#a29bfe', fontWeight: '600' }}>
                                            Total
                                        </Text>
                                    </View>

                                    <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 20, marginBottom: 10 }}>
                                        <View style={{
                                            width: 20,
                                            height: 4,
                                            backgroundColor: '#51cf66',
                                            marginRight: 8,
                                            borderRadius: 2
                                        }} />
                                        <Text style={{ fontSize: 13, color: '#a29bfe', fontWeight: '600' }}>
                                            Finalizadas
                                        </Text>
                                    </View>

                                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                                        <View style={{
                                            width: 20,
                                            height: 4,
                                            backgroundColor: '#ffa502',
                                            marginRight: 8,
                                            borderRadius: 2
                                        }} />
                                        <Text style={{ fontSize: 13, color: '#a29bfe', fontWeight: '600' }}>
                                            Escaladas
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        )}

                        {/* Información adicional */}
                        <View style={{
                            marginTop: 20,
                            padding: 18,
                            backgroundColor: 'rgba(102, 126, 234, 0.08)',
                            borderRadius: 16,
                            borderWidth: 1,
                            borderColor: 'rgba(102, 126, 234, 0.2)'
                        }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                                <Ionicons name="information-circle" size={20} color="#667eea" />
                                <Text style={{
                                    fontSize: 14,
                                    fontWeight: '700',
                                    color: '#fff',
                                    marginLeft: 8
                                }}>
                                    Sobre estos datos
                                </Text>
                            </View>
                            <Text style={{
                                fontSize: 13,
                                color: '#a29bfe',
                                lineHeight: 20,
                                fontWeight: '500'
                            }}>
                                Estas métricas provienen de MongoDB y representan conversaciones gestionadas 
                                en tiempo real por el sistema. La gráfica muestra la tendencia de los últimos {diasSeleccionados} días 
                                con actualizaciones instantáneas.
                            </Text>

                            {/* Métricas de rendimiento */}
                            <View style={{ marginTop: 15, flexDirection: 'row', flexWrap: 'wrap' }}>
                                <View style={{ 
                                    flexDirection: 'row', 
                                    alignItems: 'center',
                                    marginRight: 20,
                                    marginBottom: 8
                                }}>
                                    <Ionicons name="trending-up" size={16} color="#20c997" />
                                    <Text style={{ 
                                        fontSize: 12, 
                                        color: '#a29bfe', 
                                        marginLeft: 6,
                                        fontWeight: '600'
                                    }}>
                                        {mongoMetrics.conversacionesFinalizadas > 0 ? 
                                            ((mongoMetrics.conversacionesFinalizadas / 
                                            mongoMetrics.totalConversaciones) * 100).toFixed(1) : 
                                            '0'
                                        }% finalizadas
                                    </Text>
                                </View>

                                <View style={{ 
                                    flexDirection: 'row', 
                                    alignItems: 'center',
                                    marginRight: 20,
                                    marginBottom: 8
                                }}>
                                    <Ionicons name="warning" size={16} color="#ffa502" />
                                    <Text style={{ 
                                        fontSize: 12, 
                                        color: '#a29bfe', 
                                        marginLeft: 6,
                                        fontWeight: '600'
                                    }}>
                                        {mongoMetrics.totalConversaciones > 0 ? 
                                            ((mongoMetrics.conversacionesEscaladas / 
                                            mongoMetrics.totalConversaciones) * 100).toFixed(1) : 
                                            '0'
                                        }% escaladas
                                    </Text>
                                </View>

                                {mongoMetrics.calificacionPromedio && (
                                    <View style={{ 
                                        flexDirection: 'row', 
                                        alignItems: 'center',
                                        marginBottom: 8
                                    }}>
                                        <Ionicons name="happy" size={16} color="#f093fb" />
                                        <Text style={{ 
                                            fontSize: 12, 
                                            color: '#a29bfe', 
                                            marginLeft: 6,
                                            fontWeight: '600'
                                        }}>
                                            {mongoMetrics.calificacionPromedio >= 4 ? 'Alta' : 
                                            mongoMetrics.calificacionPromedio >= 3 ? 'Media' : 'Baja'
                                            } satisfacción
                                        </Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    </View>
                )}
            </View>
        );
    };


    // ==================== RENDER PRINCIPAL ====================
    return (
        <View style={metricasStyles.cardContainer}>
            {renderResumen()}
            {renderMetricasMongo()}  {/* 🔥 AGREGAR AQUÍ */}
            {renderAgentes()}
            {renderTendencias()}
            {renderHorasPico()}
            {renderContenidoMasUsado()}
            {renderGraficoPastel()}  {/* 🔥 NUEVO - Distribución por estado */}
            {renderGraficoBarrasHorizontales()}  {/* 🔥 NUEVO - Top 5 Agentes comparativa */}
            {renderVisitantes()}
        </View>
    );
}
// ==================================================================================
// src/components/Metricas/GestionMetricasCard.js
// Cards Premium para visualización de métricas institucionales
// ==================================================================================

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
    Dimensions,
    ScrollView,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { metricasStyles } from '../../styles/GestionMetricasStyles';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

export default function GestionMetricasCard({
    metricas,
    filtroActivo,
    agenteSeleccionado,
    onSeleccionarAgente
}) {

    const [seccionExpandida, setSeccionExpandida] = useState({
        resumen: true,
        agentes: true,
        tendencias: true,
        contenido: true,
        horas: true
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
        const { resumen } = metricas;

        const estadisticas = [
            {
                valor: formatearNumero(resumen.totalConversaciones),
                label: 'Total Conversaciones',
                icono: 'chatbubbles',
                color: ['#667eea', '#764ba2'],
                descripcion: 'Iniciadas en el periodo'
            },
            {
                valor: formatearNumero(resumen.totalMensajes),
                label: 'Total Mensajes',
                icono: 'mail',
                color: ['#f093fb', '#f5576c'],
                descripcion: 'Intercambiados'
            },
            {
                valor: formatearNumero(resumen.visitantesUnicos),
                label: 'Visitantes Únicos',
                icono: 'people',
                color: ['#3bc9db', '#1c7ed6'],
                descripcion: 'Usuarios diferentes'
            },
            {
                valor: formatearNumero(resumen.conversacionesActivas),
                label: 'Activas Ahora',
                icono: 'pulse',
                color: ['#20c997', '#17a2b8'],
                descripcion: 'En tiempo real'
            },
            {
                valor: formatearNumero(resumen.conversacionesFinalizadas),
                label: 'Finalizadas',
                icono: 'checkmark-done',
                color: ['#51cf66', '#37b24d'],
                descripcion: 'Completadas con éxito'
            },
            {
                valor: formatearNumero(resumen.conversacionesEscaladas),
                label: 'Escaladas',
                icono: 'arrow-up-circle',
                color: ['#ffa502', '#ff6348'],
                descripcion: 'Requirieron humano'
            },
            {
                valor: resumen.satisfaccionPromedio ? resumen.satisfaccionPromedio.toFixed(1) : 'N/A',
                label: 'Satisfacción',
                icono: 'star',
                color: obtenerColorSatisfaccion(resumen.satisfaccionPromedio),
                descripcion: 'Calificación promedio'
            },
            {
                valor: formatearTiempo(resumen.tiempoRespuestaPromedioMs),
                label: 'Tiempo Respuesta',
                icono: 'timer',
                color: ['#667eea', '#764ba2'],
                descripcion: 'Promedio de respuesta'
            },
            {
                valor: formatearDuracion(resumen.duracionConversacionPromedioSeg),
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
                                Métricas generales del sistema
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
                        <Text style={metricasStyles.seccionTitulo}>Top Agentes Virtuales</Text>
                        <Ionicons
                            name={seccionExpandida.agentes ? "chevron-up" : "chevron-down"}
                            size={26}
                            color="#a29bfe"
                            style={{ marginLeft: 'auto' }}
                        />
                    </View>
                </TouchableOpacity>

                {seccionExpandida.agentes && metricas.agentesMasActivos.map((agente, index) => (
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

    // ==================== RENDER PRINCIPAL ====================
    return (
        <View style={metricasStyles.cardContainer}>
            {renderResumen()}
            {renderAgentes()}
            {renderTendencias()}
            {renderHorasPico()}
            {renderContenidoMasUsado()}
        </View>
    );
}
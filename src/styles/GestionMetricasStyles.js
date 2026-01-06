// ==================================================================================
// src/styles/GestionMetricasStyles.js
// Estilos Premium para Dashboard de Métricas - TEC-AI
// ==================================================================================

import { Dimensions, StyleSheet } from 'react-native';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

export const metricasStyles = StyleSheet.create({
    // ==================== CONTAINER PRINCIPAL ====================
    container: {
        flex: 1,
        backgroundColor: '#0f0f23',
    },

    scrollView: {
        flex: 1,
    },

    scrollContent: {
        paddingBottom: 30,
    },

    // ==================== LOADING INLINE ====================
    loadingInline: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
    },

    // ==================== HEADER MEJORADO ====================
    header: {
        paddingTop: 25,
        paddingHorizontal: 20,
        paddingBottom: 20,
        borderBottomLeftRadius: 35,
        borderBottomRightRadius: 35,
        shadowColor: '#667eea',
        shadowOpacity: 0.3,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: 8 },
        elevation: 12,
    },

    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 25,
    },

    headerIconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
        shadowColor: '#667eea',
        shadowOpacity: 0.6,
        shadowRadius: 15,
        shadowOffset: { width: 0, height: 5 },
        elevation: 8,
    },

    headerTitle: {
        fontSize: isTablet ? 36 : 28,
        fontWeight: '900',
        color: '#fff',
        letterSpacing: -0.5,
        textShadowColor: 'rgba(102, 126, 234, 0.3)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 10,
    },

    headerSubtitle: {
        fontSize: 15,
        color: '#a29bfe',
        marginTop: 5,
        fontWeight: '500',
        letterSpacing: 0.3,
    },

    exportButton: {
        marginLeft: 15,
    },

    exportButtonGradient: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'rgba(102, 126, 234, 0.4)',
    },

    // ==================== FILTROS PREMIUM ====================
    filtrosContainer: {
        marginTop: 5,
    },

    filtrosScroll: {
        paddingRight: 20,
    },

    filtroBoton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 22,
        paddingVertical: 14,
        borderRadius: 25,
        marginRight: 12,
        shadowColor: '#667eea',
        shadowOpacity: 0.5,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 5 },
        elevation: 8,
    },

    filtroBotonInactivo: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 22,
        paddingVertical: 14,
        borderRadius: 25,
        marginRight: 12,
        backgroundColor: 'rgba(162, 155, 254, 0.12)',
        borderWidth: 2,
        borderColor: 'rgba(162, 155, 254, 0.25)',
    },

    filtroTextoActivo: {
        marginLeft: 10,
        fontSize: 15,
        fontWeight: '800',
        color: '#fff',
        letterSpacing: 0.5,
    },

    filtroTextoInactivo: {
        marginLeft: 10,
        fontSize: 15,
        fontWeight: '700',
        color: '#a29bfe',
        letterSpacing: 0.5,
    },

    // ==================== CARDS PRINCIPALES ====================
    cardContainer: {
        margin: 20,
    },

    // ==================== RESUMEN MEJORADO ====================
    resumenContainer: {
        backgroundColor: '#1a1a2e',
        borderRadius: 30,
        padding: 25,
        marginBottom: 20,
        shadowColor: '#667eea',
        shadowOpacity: 0.2,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: 8 },
        elevation: 10,
        borderWidth: 1,
        borderColor: 'rgba(102, 126, 234, 0.1)',
    },

    resumenHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 25,
    },

    resumenIcono: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 18,
        shadowColor: '#667eea',
        shadowOpacity: 0.6,
        shadowRadius: 15,
        shadowOffset: { width: 0, height: 5 },
        elevation: 8,
    },

    resumenTitulo: {
        fontSize: 24,
        fontWeight: '900',
        color: '#fff',
        letterSpacing: 0.3,
        marginBottom: 3,
    },

    resumenSubtitulo: {
        fontSize: 14,
        color: '#a29bfe',
        fontWeight: '500',
    },

    estadisticasGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginHorizontal: -8,
    },

    estadisticaItem: {
        width: isTablet ? '33.33%' : '50%',
        padding: 8,
    },

    estadisticaCard: {
        borderRadius: 20,
        padding: 18,
        minHeight: 110,
        position: 'relative',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 6,
    },

    estadisticaValor: {
        fontSize: 30,
        fontWeight: '900',
        color: '#fff',
        marginBottom: 6,
        textShadowColor: 'rgba(0, 0, 0, 0.2)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
    },

    estadisticaLabel: {
        fontSize: 13,
        color: 'rgba(255, 255, 255, 0.85)',
        fontWeight: '700',
        letterSpacing: 0.3,
    },

    estadisticaIcono: {
        position: 'absolute',
        top: 16,
        right: 16,
        opacity: 0.25,
    },

    // ==================== SECCIÓN PREMIUM ====================
    seccionContainer: {
        marginBottom: 25,
    },

    seccionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 18,
        paddingHorizontal: 5,
    },

    seccionIcono: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(102, 126, 234, 0.18)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
        borderWidth: 2,
        borderColor: 'rgba(102, 126, 234, 0.3)',
    },

    seccionTitulo: {
        fontSize: 22,
        fontWeight: '900',
        color: '#fff',
        letterSpacing: 0.3,
    },

    // ==================== AGENTES PREMIUM ====================
    agenteItem: {
        backgroundColor: '#1a1a2e',
        borderRadius: 20,
        padding: 20,
        marginBottom: 15,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
        elevation: 6,
        borderWidth: 1,
        borderColor: 'rgba(102, 126, 234, 0.1)',
    },

    agenteColor: {
        width: 8,
        height: '100%',
        borderRadius: 4,
        position: 'absolute',
        left: 0,
        shadowColor: '#667eea',
        shadowOpacity: 0.5,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 0 },
        elevation: 4,
    },

    agenteInfo: {
        flex: 1,
        marginLeft: 18,
    },

    agenteNombre: {
        fontSize: 17,
        fontWeight: '800',
        color: '#fff',
        marginBottom: 10,
        letterSpacing: 0.2,
    },

    agenteMetricas: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },

    agenteMetrica: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 18,
        marginBottom: 6,
    },

    agenteMetricaTexto: {
        fontSize: 14,
        color: '#a29bfe',
        marginLeft: 6,
        fontWeight: '600',
    },

    // ==================== GRÁFICOS PREMIUM ====================
    graficoContainer: {
        backgroundColor: '#1a1a2e',
        borderRadius: 25,
        padding: 25,
        marginBottom: 20,
        shadowColor: '#667eea',
        shadowOpacity: 0.2,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: 8 },
        elevation: 10,
        borderWidth: 1,
        borderColor: 'rgba(102, 126, 234, 0.1)',
    },

    graficoHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 25,
    },

    graficoTitulo: {
        fontSize: 20,
        fontWeight: '800',
        color: '#fff',
        letterSpacing: 0.3,
    },

    graficoLeyenda: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    leyendaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 18,
    },

    leyendaColor: {
        width: 14,
        height: 14,
        borderRadius: 7,
        marginRight: 8,
        shadowColor: '#667eea',
        shadowOpacity: 0.5,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        elevation: 3,
    },

    leyendaTexto: {
        fontSize: 13,
        color: '#a29bfe',
        fontWeight: '700',
    },

    // ==================== CONTENIDO MÁS USADO ====================
    contenidoItem: {
        backgroundColor: '#1a1a2e',
        borderRadius: 18,
        padding: 18,
        marginBottom: 15,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        shadowColor: '#000',
        shadowOpacity: 0.12,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 6,
        borderWidth: 1,
        borderColor: 'rgba(102, 126, 234, 0.08)',
    },

    contenidoInfo: {
        flex: 1,
        marginLeft: 15,
    },

    contenidoTitulo: {
        fontSize: 16,
        fontWeight: '800',
        color: '#fff',
        marginBottom: 10,
        letterSpacing: 0.2,
    },

    contenidoStats: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    contenidoStat: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 18,
    },

    contenidoStatTexto: {
        fontSize: 14,
        color: '#a29bfe',
        marginLeft: 6,
        fontWeight: '700',
    },

    contenidoRanking: {
        width: 45,
        height: 45,
        borderRadius: 22.5,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 3 },
        elevation: 6,
    },

    contenidoRankingTexto: {
        fontSize: 20,
        fontWeight: '900',
        color: '#fff',
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
    },

    // ==================== BARRAS DE PROGRESO ====================
    progressBar: {
        height: 10,
        backgroundColor: 'rgba(102, 126, 234, 0.15)',
        borderRadius: 5,
        marginTop: 10,
        overflow: 'hidden',
    },

    progressFill: {
        height: '100%',
        borderRadius: 5,
        shadowColor: '#667eea',
        shadowOpacity: 0.5,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 0 },
    },

    // ==================== HORAS PICO ====================
    horasPicoContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginHorizontal: -8,
    },

    horaPicoItem: {
        width: isTablet ? '20%' : '33.33%',
        padding: 8,
    },

    horaPicoCard: {
        backgroundColor: 'rgba(102, 126, 234, 0.12)',
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'rgba(102, 126, 234, 0.25)',
        shadowColor: '#667eea',
        shadowOpacity: 0.15,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 3 },
        elevation: 4,
    },

    horaPicoHora: {
        fontSize: 15,
        fontWeight: '800',
        color: '#fff',
        marginBottom: 8,
    },

    horaPicoCantidad: {
        fontSize: 22,
        fontWeight: '900',
        color: '#a29bfe',
    },

    // ==================== BADGES ====================
    badge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 14,
        alignSelf: 'flex-start',
    },

    badgeTexto: {
        fontSize: 12,
        fontWeight: '800',
        color: '#fff',
        letterSpacing: 0.5,
    },

    // ==================== EMPTY STATE ====================
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 50,
    },

    emptyIcon: {
        marginBottom: 20,
    },

    emptyTexto: {
        fontSize: 17,
        color: '#a29bfe',
        fontWeight: '700',
        textAlign: 'center',
    },
});
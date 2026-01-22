// ==================================================================================
// src/styles/GestionPerfilStyles.js
// Estilos para Gestión de Perfil de Usuario
// ==================================================================================

import { Dimensions, Platform, StyleSheet } from 'react-native';

const { width } = Dimensions.get('window');
const isTabletOrDesktop = width >= 768;

export const styles = StyleSheet.create({
    // ==================== CONTENEDOR PRINCIPAL ====================
    container: {
        flex: 1,
        backgroundColor: '#0f0f23',
    },

    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
    },

    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#6B7280',
        fontWeight: '600',
    },

    // ==================== HEADER CON GRADIENTE ====================
    header: {
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        paddingBottom: 24,
        paddingHorizontal: 20,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 12,
            },
            android: {
                elevation: 8,
            },
            web: {
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
            }
        }),
    },

    headerContent: {
        gap: 16,
    },

    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },

    headerTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },

    headerTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#FFFFFF',
        letterSpacing: 0.3,
    },

    headerSubtitle: {
        fontSize: 16,
        fontWeight: '600',
        color: 'rgba(255, 255, 255, 0.9)',
        marginTop: 2,
    },

    btnEdit: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
            },
            android: {
                elevation: 6,
            },
            web: {
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
                cursor: 'pointer',
            }
        }),
    },

    // ==================== PERFIL CARD ====================
    perfilContainer: {
        padding: 20,
        backgroundColor: '#0f0f23',
    },

    perfilCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 24,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 16,
            },
            android: {
                elevation: 5,
            },
            web: {
                boxShadow: '0 4px 24px rgba(0, 0, 0, 0.1)',
            }
        }),
    },

    avatarSection: {
        alignItems: 'center',
        marginBottom: 24,
        paddingBottom: 24,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },

    avatarContainer: {
        position: 'relative',
        marginBottom: 16,
    },

    avatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
        borderColor: '#667eea',
        ...Platform.select({
            ios: {
                shadowColor: '#667eea',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 12,
            },
            android: {
                elevation: 8,
            },
            web: {
                boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)',
            }
        }),
    },

    avatarText: {
        fontSize: 48,
        fontWeight: '900',
        color: '#667eea',
    },

    userName: {
        fontSize: 26,
        fontWeight: '900',
        color: '#1F2937',
        marginBottom: 4,
        textAlign: 'center',
    },

    userEmail: {
        fontSize: 16,
        color: '#6B7280',
        marginBottom: 8,
        textAlign: 'center',
    },

    userUsername: {
        fontSize: 14,
        color: '#667eea',
        fontWeight: '700',
        textAlign: 'center',
    },

    // ==================== SECCIONES DE INFORMACIÓN ====================
    infoSection: {
        marginBottom: 24,
    },

    sectionTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#1F2937',
        marginBottom: 16,
        letterSpacing: 0.3,
        textTransform: 'uppercase',
    },

    infoRow: {
        flexDirection: 'row',
        marginBottom: 16,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },

    infoRowLast: {
        borderBottomWidth: 0,
        marginBottom: 0,
        paddingBottom: 0,
    },

    infoIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#EFF6FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },

    infoContent: {
        flex: 1,
        justifyContent: 'center',
    },

    infoLabel: {
        fontSize: 12,
        fontWeight: '700',
        color: '#9CA3AF',
        marginBottom: 4,
        letterSpacing: 0.8,
        textTransform: 'uppercase',
    },

    infoValue: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
    },

    infoValueEmpty: {
        fontSize: 15,
        fontStyle: 'italic',
        color: '#9CA3AF',
    },

    // ==================== ROLES Y ESTADO ====================
    rolesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 8,
    },

    rolBadge: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 14,
    },

    roleBadgeText: {
        fontSize: 13,
        fontWeight: '800',
        color: '#FFFFFF',
        letterSpacing: 0.8,
        textTransform: 'uppercase',
    },

    estadoBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 14,
        marginTop: 8,
    },

    estadoBadgeText: {
        fontSize: 13,
        fontWeight: '800',
        color: '#FFFFFF',
        textTransform: 'uppercase',
        letterSpacing: 0.8,
    },

    // ==================== FORMULARIO EDICIÓN ====================
    formContainer: {
        flex: 1,
        backgroundColor: '#0f0f23',
    },

    formHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 24,
        paddingTop: Platform.OS === 'ios' ? 60 : 24,
        backgroundColor: 'rgba(26, 26, 46, 0.98)',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(102, 126, 234, 0.3)',
    },

    formHeaderTitle: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },

    formTitle: {
        fontSize: 26,
        fontWeight: '900',
        color: '#FFFFFF',
        letterSpacing: 0.8,
    },

    btnCerrar: {
        padding: 14,
        borderRadius: 14,
        backgroundColor: 'rgba(102, 126, 234, 0.15)',
        borderWidth: 1,
        borderColor: 'rgba(102, 126, 234, 0.4)',
    },

    formContent: {
        padding: 24,
    },

    formSectionTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#FFFFFF',
        marginBottom: 20,
        marginTop: 12,
        letterSpacing: 0.6,
        textTransform: 'uppercase',
    },

    // ==================== CAMPOS DE FORMULARIO ====================
    formRow: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 20,
    },

    formColumn: {
        flex: 1,
    },

    label: {
        fontSize: 13,
        fontWeight: '800',
        color: '#c7d2fe',
        marginBottom: 12,
        letterSpacing: 1,
        textTransform: 'uppercase',
    },

    labelRequired: {
        color: '#ff6348',
    },

    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.98)',
        borderWidth: 2,
        borderColor: 'rgba(102, 126, 234, 0.3)',
        borderRadius: 16,
        paddingHorizontal: 18,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.08,
                shadowRadius: 10,
            },
            android: {
                elevation: 4,
            },
            web: {
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
            }
        }),
    },

    inputIcon: {
        marginRight: 14,
    },

    input: {
        flex: 1,
        padding: 18,
        fontSize: 16,
        color: '#2d3436',
        fontWeight: '600',
    },

    inputError: {
        borderColor: '#ff4757',
        borderWidth: 2,
    },

    inputDisabled: {
        backgroundColor: 'rgba(243, 244, 246, 0.5)',
        opacity: 0.6,
    },

    errorText: {
        fontSize: 13,
        color: '#ff4757',
        marginTop: 8,
        fontWeight: '700',
    },

    // ==================== BOTONES ====================
    pickerContainer: {
        flex: 1,
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },

    genderBtn: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        backgroundColor: '#F3F4F6',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },

    genderBtnActive: {
        backgroundColor: '#667eea',
        borderColor: '#667eea',
    },

    genderBtnText: {
        fontSize: 12,
        color: '#6B7280',
    },

    genderBtnTextActive: {
        color: '#FFFFFF',
        fontWeight: '700',
    },

    actionsContainer: {
        flexDirection: 'row',
        gap: 16,
        padding: 24,
        backgroundColor: 'rgba(26, 26, 46, 0.98)',
        borderTopWidth: 1,
        borderTopColor: 'rgba(102, 126, 234, 0.3)',
    },

    btnGuardar: {
        flex: 1,
        padding: 20,
        borderRadius: 18,
        alignItems: 'center',
        ...Platform.select({
            ios: {
                shadowColor: '#10B981',
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.5,
                shadowRadius: 20,
            },
            android: {
                elevation: 10,
            },
            web: {
                boxShadow: '0 10px 40px rgba(16, 185, 129, 0.5)',
                cursor: 'pointer',
            }
        }),
    },

    btnGuardarText: {
        color: '#FFFFFF',
        fontSize: 17,
        fontWeight: '900',
        letterSpacing: 1.2,
    },

    btnCancelar: {
        flex: 1,
        backgroundColor: 'rgba(102, 126, 234, 0.15)',
        padding: 20,
        borderRadius: 18,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(102, 126, 234, 0.4)',
    },

    btnCancelarText: {
        color: '#c7d2fe',
        fontSize: 17,
        fontWeight: '800',
        letterSpacing: 1.2,
    },

    btnGuardarDisabled: {
        backgroundColor: '#6B7280',
        shadowOpacity: 0,
        elevation: 0,
    },

    // ==================== CARDS INFORMATIVOS ====================
    infoCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: 'rgba(59, 130, 246, 0.12)',
        borderLeftWidth: 4,
        borderLeftColor: '#3B82F6',
        padding: 18,
        borderRadius: 14,
        marginBottom: 20,
    },

    infoCardWarning: {
        backgroundColor: 'rgba(255, 165, 2, 0.12)',
        borderLeftColor: '#ffa502',
    },

    infoCardSuccess: {
        backgroundColor: 'rgba(16, 185, 129, 0.12)',
        borderLeftColor: '#10B981',
    },

    infoCardText: {
        flex: 1,
        fontSize: 14,
        color: '#c7d2fe',
        lineHeight: 22,
        fontWeight: '600',
    },

    // ==================== STEPPER ====================
    stepperContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 40,
        paddingVertical: 24,
        backgroundColor: 'rgba(102, 126, 234, 0.05)',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(102, 126, 234, 0.1)',
    },

    stepWrapper: {
        alignItems: 'center',
    },

    stepCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#374151',
        borderWidth: 2,
        borderColor: '#4B5563',
        alignItems: 'center',
        justifyContent: 'center',
    },

    stepCircleActive: {
        backgroundColor: '#667eea',
        borderColor: '#667eea',
        ...Platform.select({
            ios: {
                shadowColor: '#667eea',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
            },
            android: {
                elevation: 8,
            },
            web: {
                boxShadow: '0 4px 16px rgba(102, 126, 234, 0.3)',
            }
        }),
    },

    stepCircleCompleted: {
        backgroundColor: '#10B981',
        borderColor: '#10B981',
    },

    stepNumber: {
        fontSize: 16,
        fontWeight: '700',
        color: '#9CA3AF',
    },

    stepNumberActive: {
        color: '#FFFFFF',
    },

    stepLine: {
        flex: 1,
        height: 2,
        backgroundColor: '#374151',
        marginHorizontal: 8,
    },

    pasoIndicador: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.8)',
        fontWeight: '600',
        marginTop: 2,
    },

    // ==================== MODALES ====================
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },

    modalContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 24,
        width: '100%',
        maxWidth: 400,
        alignItems: 'center',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.3,
                shadowRadius: 20,
            },
            android: {
                elevation: 10,
            },
        }),
    },

    modalIconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },

    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 8,
        textAlign: 'center',
    },

    modalMessage: {
        fontSize: 15,
        color: '#6b7280',
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 22,
    },

    modalButtonContainer: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
    },

    modalBtnCancel: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 12,
        backgroundColor: '#f3f4f6',
        alignItems: 'center',
    },

    modalBtnCancelText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#6b7280',
    },

    modalBtnConfirm: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 12,
        alignItems: 'center',
    },

    modalBtnConfirmText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#ffffff',
    },

    // Notification Modal
    notificationOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        alignItems: 'center',
        paddingTop: 60,
        zIndex: 9999,
        pointerEvents: 'box-none',
    },

    notificationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        borderWidth: 2,
        maxWidth: 400,
        minWidth: 300,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
            },
            android: {
                elevation: 8,
            },
        }),
        gap: 12,
    },

    notificationMessage: {
        flex: 1,
        fontSize: 15,
        fontWeight: '600',
        color: '#1f2937',
    },

    notificationCloseBtn: {
        padding: 4,
    },

    // ==================================================================================
    // AGREGAR O REEMPLAZAR estos estilos en tu GestionPerfilStyles.js existente
    // ==================================================================================

    // ✨ NUEVOS ESTILOS PARA AGREGAR (copiar al final del archivo, antes del cierre)

    // ==================== HEADER MEJORADO ====================
    headerIconGradient: {
        borderRadius: 16,
        padding: 12,
        shadowColor: '#667eea',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },

    // ==================== SECCIÓN HEADER MEJORADO ====================
    sectionHeaderContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 24,
        paddingBottom: 16,
        borderBottomWidth: 2,
        borderBottomColor: '#374151',
    },

    sectionIconGradient: {
        borderRadius: 12,
        padding: 10,
        shadowColor: '#667eea',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3,
    },

    // ==================== STEPPER LABELS ====================
    stepLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#6B7280',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginTop: 8,
    },

    stepLabelActive: {
        color: '#F9FAFB',
    },

    stepLineActive: {
        backgroundColor: '#10B981',
    },

    // ==================== GÉNERO MEJORADO ====================
    genderContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginTop: 4,
    },

    genderIcon: {
        fontSize: 20,
        color: '#F9FAFB',
        marginBottom: 4,
    },

    // ==================== BOTONES MEJORADOS ====================
    btnPrimario: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingVertical: 14,
        paddingHorizontal: 28,
        borderRadius: 12,
        shadowColor: '#667eea',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },

    btnPrimarioText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#FFFFFF',
        letterSpacing: 1,
    },

    btnSecundario: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 12,
        backgroundColor: '#374151',
        borderWidth: 2,
        borderColor: '#667eea',
    },

    btnSecundarioText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#667eea',
        letterSpacing: 1,
    },

    eyeButton: {
        padding: 8,
        marginLeft: 4,
    },

    // ==================== INFO CARDS MEJORADOS ====================
    infoCardsContainer: {
        gap: 12,
        marginTop: 20,
    },

    infoCardIconContainer: {
        marginTop: 2,
    },

    // ==================== NOTIFICACIÓN MEJORADA ====================
    notificationWrapper: {
        width: '90%',
        maxWidth: 500,
    },

    notificationIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },

    helperText: {
        fontSize: 11,
        color: '#9CA3AF',
        marginTop: 6,
        fontStyle: 'italic',
    },


    // ==================================================================================
    // 🔧 ESTILOS A MODIFICAR (Reemplazar los existentes)
    // ==================================================================================

    // ✏️ REEMPLAZAR estos estilos que ya tienes:

    // Género (REEMPLAZAR el que ya tienes)
    genderBtn: {
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        backgroundColor: '#374151',
        borderWidth: 2,
        borderColor: '#4B5563',
        minWidth: 100,
        gap: 4,
    },

    genderBtnActive: {
        backgroundColor: '#667eea',
        borderColor: '#667eea',
        shadowColor: '#667eea',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 4,
    },

    genderBtnText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#9CA3AF',
        textAlign: 'center',
        letterSpacing: 0.5,
    },

    genderBtnTextActive: {
        color: '#FFFFFF',
    },

    // Info Cards (REEMPLAZAR el que ya tienes)
    infoCard: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
        padding: 16,
        borderRadius: 12,
        backgroundColor: '#374151',
        borderLeftWidth: 4,
    },

    infoCardWarning: {
        backgroundColor: '#78350F',
        borderLeftColor: '#F59E0B',
    },

    infoCardSuccess: {
        backgroundColor: '#064E3B',
        borderLeftColor: '#10B981',
    },

    infoCardText: {
        flex: 1,
        fontSize: 13,
        color: '#E5E7EB',
        lineHeight: 20,
        fontWeight: '500',
    },

    // Botón cancelar (MEJORAR el que ya tienes)
    btnCancelar: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 12,
        backgroundColor: '#7F1D1D',
        borderWidth: 2,
        borderColor: '#EF4444',
    },

    btnCancelarText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#FCA5A5',
        letterSpacing: 1,
    },

    // Header form (MEJORAR)
    formHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 32,
        paddingBottom: 24,
        borderBottomWidth: 2,
        borderBottomColor: '#374151',
        padding: 24,
        paddingTop: Platform.OS === 'ios' ? 60 : 24,
        backgroundColor: 'rgba(26, 26, 46, 0.98)',
    },

    formTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: '#F9FAFB',
        letterSpacing: -0.5,
    },

    btnCerrar: {
        padding: 8,
        borderRadius: 12,
        backgroundColor: '#374151',
    },

    // Stepper (MEJORAR)
    stepperContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 32,
        paddingHorizontal: 20,
        paddingVertical: 24,
        backgroundColor: 'rgba(102, 126, 234, 0.05)',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(102, 126, 234, 0.1)',
    },

    stepCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#374151',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#4B5563',
    },

    stepCircleActive: {
        backgroundColor: '#667eea',
        borderColor: '#667eea',
        shadowColor: '#667eea',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 5,
    },

    stepNumber: {
        fontSize: 20,
        fontWeight: '700',
        color: '#9CA3AF',
    },

    stepNumberActive: {
        color: '#FFFFFF',
    },

    stepLine: {
        width: 80,
        height: 3,
        backgroundColor: '#374151',
        marginHorizontal: 12,
        borderRadius: 2,
    },

    // Notificaciones (MEJORAR)
    notificationOverlay: {
        position: 'absolute',
        top: 20,
        left: 0,
        right: 0,
        alignItems: 'center',
        zIndex: 9999,
    },

    notificationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        padding: 20,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },

    notificationMessage: {
        flex: 1,
        fontSize: 15,
        fontWeight: '600',
        color: '#FFFFFF',
        lineHeight: 22,
    },

    notificationCloseBtn: {
        padding: 8,
        borderRadius: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    // ==================================================================================
    // AGREGAR estos estilos al final de GestionPerfilStyles.js
    // (antes del cierre `});`)
    // ==================================================================================

    // ==================== HEADER MODERNO ====================
    headerModerno: {
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        paddingBottom: 32,
        paddingHorizontal: 24,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.2,
                shadowRadius: 16,
            },
            android: {
                elevation: 10,
            },
            web: {
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
            }
        }),
    },

    headerIconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },

    headerBottom: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        marginTop: 20,
        flexWrap: 'wrap',
    },

    headerInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },

    headerInfoText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#FFFFFF',
    },

    estadoBadgeHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },

    btnEditModerno: {
        borderRadius: 12,
        overflow: 'hidden',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 8,
            },
            android: {
                elevation: 6,
            },
            web: {
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
            }
        }),
    },

    btnEditGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 12,
    },

    btnEditText: {
        fontSize: 13,
        fontWeight: '800',
        color: '#667eea',
        letterSpacing: 1,
    },

    // ==================== CONTENEDOR GENERAL ====================
    container: {
        flex: 1,
        backgroundColor: '#0f0f23', // ✅ Fondo oscuro igual que editar
    },

    perfilContainer: {
        padding: 20,
        backgroundColor: '#0f0f23', // ✅ Fondo oscuro
    },

    // ==================== PERFIL CARD MODERNO ====================
    perfilCardModerno: {
        backgroundColor: 'rgba(26, 26, 46, 0.98)', // ✅ Fondo oscuro igual que el formulario
        borderRadius: 20,
        padding: 24,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(102, 126, 234, 0.3)',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.15,
                shadowRadius: 20,
            },
            android: {
                elevation: 8,
            },
            web: {
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
            }
        }),
    },

    // ==================== SECCIONES MODERNAS ====================
    infoSectionModerno: {
        marginBottom: 32,
    },

    sectionHeaderModerno: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 20,
        paddingBottom: 16,
        borderBottomWidth: 2,
        borderBottomColor: 'rgba(102, 126, 234, 0.3)', // ✅ Borde morado
    },

    sectionTitleModerno: {
        fontSize: 18,
        fontWeight: '700',
        color: '#F9FAFB',
        letterSpacing: -0.3,
    },

    // ==================== INFO GRID ====================
    infoGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
    },

    infoCardModerno: {
        flex: 1,
        minWidth: 250,
        backgroundColor: 'rgba(55, 65, 81, 0.5)', // ✅ Fondo semi-transparente oscuro
        borderRadius: 16,
        padding: 16,
        borderWidth: 2,
        borderColor: 'rgba(102, 126, 234, 0.3)', // ✅ Borde morado
        ...Platform.select({
            ios: {
                shadowColor: '#667eea',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
            },
            android: {
                elevation: 3,
            },
            web: {
                boxShadow: '0 2px 12px rgba(102, 126, 234, 0.1)',
            }
        }),
    },

    infoCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 12,
    },

    infoIconModerno: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(102, 126, 234, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(102, 126, 234, 0.2)',
    },

    infoLabelModerno: {
        fontSize: 11,
        fontWeight: '700',
        color: '#9CA3AF',
        letterSpacing: 0.8,
        textTransform: 'uppercase',
    },

    infoValueModerno: {
        fontSize: 15,
        fontWeight: '600',
        color: '#F9FAFB',
        lineHeight: 22,
    },

    // ==================== ROLES MODERNOS ====================
    rolesContainerModerno: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },

    rolBadgeModerno: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 14,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
            },
            android: {
                elevation: 5,
            },
            web: {
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
            }
        }),
    },

    roleBadgeTextModerno: {
        fontSize: 13,
        fontWeight: '800',
        color: '#FFFFFF',
        letterSpacing: 0.8,
        textTransform: 'uppercase',
    },

    // ==================== NOTIFICACIÓN MODERNA ====================
    notificationContainerModerno: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        padding: 20,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 10,
    },

    notificationMessageModerno: {
        flex: 1,
        fontSize: 15,
        fontWeight: '600',
        color: '#FFFFFF',
        lineHeight: 22,
    },
});
// ==================================================================================
// src/styles/GestionUsuariosStyles.js
// Estilos Limpios y Modernos - Diseño Simplificado
// ==================================================================================

import { Dimensions, Platform, StyleSheet } from 'react-native';

const { width } = Dimensions.get('window');
const isTabletOrDesktop = width >= 768;

export const styles = StyleSheet.create({
  // ==================== CONTENEDOR PRINCIPAL ====================
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
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

  btnAdd: {
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

  btnRefresh: {
    padding: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(102, 126, 234, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(102, 126, 234, 0.4)',
  },

  // ==================== BARRA DE BÚSQUEDA ====================
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.1)',
      }
    }),
  },

  searchIcon: {
    marginRight: 12,
  },

  searchInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: '#1F2937',
    letterSpacing: 0.5,
  },

  // ==================== FILTROS ====================
  filtersContainer: {
    flexDirection: 'row',
    gap: 10,
  },

  filterChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },

  filterChipActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.15)',
      }
    }),
  },

  filterChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.95)',
    letterSpacing: 0.3,
  },

  filterChipTextActive: {
    color: '#667eea',
  },

  // ==================== ESTADÍSTICAS (OCULTAS POR AHORA) ====================
  statsContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 14,
    flexWrap: 'wrap',
    display: 'none', // Oculto en el nuevo diseño
  },

  statCard: {
    flex: 1,
    minWidth: isTabletOrDesktop ? 160 : 85,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(102, 126, 234, 0.25)',
  },

  statIconContainer: {
    marginBottom: 12,
  },

  statValue: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 8,
  },

  statLabel: {
    fontSize: 11,
    color: '#c7d2fe',
    fontWeight: '700',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  // ==================== BOTÓN NUEVO USUARIO (MOVIDO AL HEADER) ====================
  btnNuevo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 20,
    padding: 20,
    borderRadius: 18,
    display: 'none', // Ahora está en el header
  },

  btnNuevoText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
    marginLeft: 10,
    letterSpacing: 1.2,
  },

  // ==================== LISTA DE USUARIOS ====================
  listaContainer: {
    flex: 1,
    padding: 20,
  },

  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },

  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 16,
    fontWeight: '600',
  },

  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
    textAlign: 'center',
  },

  // ==================== TARJETA DE USUARIO COMPACTA ====================
  usuarioItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0 2px 16px rgba(0, 0, 0, 0.08)',
      }
    }),
  },

  usuarioCardContent: {
    flexDirection: 'row',
    marginBottom: 16,
  },

  avatarContainer: {
    marginRight: 16,
  },

  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },

  usuarioInfo: {
    flex: 1,
    justifyContent: 'center',
  },

  usuarioNombre: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },

  usuarioUsername: {
    fontSize: 14,
    color: '#667eea',
    marginBottom: 6,
    fontWeight: '700',
  },

  usuarioEmail: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
    fontWeight: '500',
  },

  usuarioPhone: {
    fontSize: 13,
    color: '#9CA3AF',
    marginBottom: 8,
    fontWeight: '500',
  },

  rolesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 12,
  },

  rolesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
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

  roleBadgeCompact: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },

  roleBadgeCompactText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.3,
  },

  estadoBadgeContainer: {
    marginTop: 14,
  },

  estadoBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 14,
  },

  estadoBadgeText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },

  // ==================== ACCIONES DE USUARIO ====================
  usuarioAcciones: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },

  btnEditar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },

  btnEditarText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#3B82F6',
    marginLeft: 6,
  },

  btnEliminar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },

  btnEliminarText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#EF4444',
    marginLeft: 6,
  },

  // ==================== FORMULARIO CARD ====================
  cardContainer: {
    flex: 1,
    backgroundColor: '#0f0f23',
  },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 24,
    backgroundColor: 'rgba(26, 26, 46, 0.98)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(102, 126, 234, 0.3)',
  },

  cardHeaderTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  cardTitle: {
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

  cardContent: {
    padding: 24,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 20,
    marginTop: 12,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },

  // ==================== CAMPOS DE FORMULARIO ====================
  formGroup: {
    marginBottom: 24,
  },

  formRow: {
    flexDirection: 'row',
    gap: 16,
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

  inputFocus: {
    borderColor: '#667eea',
    borderWidth: 3,
  },

  textArea: {
    minHeight: 120,
    textAlignVertical: 'top',
    paddingTop: 18,
  },

  errorText: {
    fontSize: 13,
    color: '#ff4757',
    marginTop: 8,
    fontWeight: '700',
  },

  helperText: {
    fontSize: 13,
    color: '#a29bfe',
    marginTop: 8,
    fontWeight: '500',
  },

  // ==================== SECCIÓN DE ROLES ====================
  rolesSection: {
    marginBottom: 28,
  },

  rolesGrid: {
    gap: 16,
  },

  roleCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderWidth: 2,
    borderColor: 'rgba(102, 126, 234, 0.2)',
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 5,
      },
      web: {
        boxShadow: '0 6px 24px rgba(0, 0, 0, 0.1)',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      }
    }),
  },

  roleCardSelected: {
    borderColor: '#667eea',
    backgroundColor: '#EFF6FF',
    borderWidth: 3,
    ...Platform.select({
      ios: {
        shadowColor: '#667eea',
        shadowOpacity: 0.4,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: '0 8px 32px rgba(102, 126, 234, 0.4)',
      }
    }),
  },

  roleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  roleIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
      web: {
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.25)',
      }
    }),
  },

  roleName: {
    fontSize: 19,
    fontWeight: '900',
    color: '#2d3436',
    flex: 1,
    letterSpacing: 0.4,
  },

  roleDescription: {
    fontSize: 14,
    color: '#636e72',
    marginTop: 8,
    lineHeight: 22,
    fontWeight: '500',
  },

  roleNivel: {
    fontSize: 12,
    color: '#a29bfe',
    marginTop: 8,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  // ==================== BOTONES DE ACCIÓN ====================
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
        transition: 'all 0.2s ease',
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

  infoCardError: {
    backgroundColor: 'rgba(255, 71, 87, 0.12)',
    borderLeftColor: '#ff4757',
  },

  infoCardText: {
    flex: 1,
    fontSize: 14,
    color: '#c7d2fe',
    lineHeight: 22,
    fontWeight: '600',
  },

  // ==================== STEPPER WIZARD ====================
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

  pasoIndicator: {
    fontSize: 12,
    color: '#667eea',
    fontWeight: '600',
    marginTop: 2,
  },
  pickerContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '#FFFFFF',
  borderRadius: 12,
  borderWidth: 1,
  borderColor: '#E5E7EB',
  paddingHorizontal: 16,
  paddingVertical: 4,
  height: 52,
},
pickerWrapper: {
  flex: 1,
},
pickerButton: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingVertical: 8,
},
pickerButtonText: {
  fontSize: 15,
  color: '#374151',
  flex: 1,
},

pickerContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '#FFFFFF',
  borderRadius: 12,
  borderWidth: 1,
  borderColor: '#E5E7EB',
  paddingHorizontal: 16,
  paddingVertical: 4,
  height: 52,
},
pickerWrapper: {
  flex: 1,
},
pickerButton: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingVertical: 8,
},
pickerButtonText: {
  fontSize: 15,
  color: '#374151',
  flex: 1,
},


  // ==================== BOTÓN ANTERIOR ====================
  btnAnterior: {
    flex: 1,
    paddingVertical: 20,
    paddingHorizontal: 28,
    borderRadius: 18,
    backgroundColor: 'rgba(102, 126, 234, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(102, 126, 234, 0.4)',
    alignItems: 'center',
  },

  btnAnteriorText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#c7d2fe',
    letterSpacing: 1.2,
  },




  



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
tipoBtn: {
  paddingHorizontal: 16,
  paddingVertical: 8,
  borderRadius: 8,
  backgroundColor: '#F3F4F6',
  borderWidth: 1,
  borderColor: '#E5E7EB',
},
tipoBtnActive: {
  backgroundColor: '#667eea',
  borderColor: '#667eea',
},
tipoBtnText: {
  fontSize: 13,
  fontWeight: '600',
  color: '#6B7280',
},




// ✅ REEMPLAZA limitContainer con estos estilos más compactos

limitSeparator: {
  width: 1,
  height: 30,
  backgroundColor: 'rgba(255, 255, 255, 0.3)',
  marginHorizontal: 12,
},
limitContainerCompact: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 4,
},
limitBtnCompact: {
  paddingHorizontal: 8,
  paddingVertical: 4,
  borderRadius: 6,
  backgroundColor: 'rgba(255, 255, 255, 0.15)',
  minWidth: 32,
  alignItems: 'center',
},
limitBtnCompactActive: {
  backgroundColor: '#FFFFFF',
},
limitBtnTextCompact: {
  color: 'rgba(255, 255, 255, 0.8)',
  fontSize: 12,
  fontWeight: '600',
},
limitBtnTextCompactActive: {
  color: '#667eea',
},

// Mantén los estilos de paginación
paginationContainer: {
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  gap: 20,
  paddingVertical: 20,
  marginTop: 20,
},
paginationBtn: {
  padding: 10,
  borderRadius: 8,
  backgroundColor: '#F3F4F6',
},
paginationBtnDisabled: {
  opacity: 0.5,
},
paginationText: {
  fontSize: 14,
  fontWeight: '600',
  color: '#374151',
},



});



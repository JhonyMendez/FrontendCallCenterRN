export const styles = {
  // ============================================
  // LAYOUT PRINCIPAL
  // ============================================
  wrapper: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#f8fafc'
  },
  toggleButton: {
    position: 'absolute',
    top: 16,
    zIndex: 1001,
    backgroundColor: '#1e1b4b',
    padding: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5
  },
  mainContent: {
    flex: 1
  },
  container: {
    flex: 1,
    padding: 24
  },

  // ============================================
  // HEADER
  // ============================================
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16
  },
  iconContainer: {
    backgroundColor: '#dbeafe',
    padding: 16,
    borderRadius: 16
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1e293b'
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: '#fecaca'
  },
  resetButtonText: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: '600'
  },

  // ============================================
  // BREADCRUMB
  // ============================================
  breadcrumb: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 12
  },
  breadcrumbItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  breadcrumbText: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '500'
  },
  breadcrumbTextActive: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '600'
  },

  // ============================================
  // SECCIONES
  // ============================================
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20
  },
  stepBadge: {
    backgroundColor: '#3b82f6',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center'
  },
  stepNumber: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700'
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b'
  },
  sectionTitleContainer: {
    flex: 1
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2
  },

  // ============================================
  // BÚSQUEDA
  // ============================================
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 20,
    gap: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1e293b'
  },

  // ============================================
  // ESTADOS DE CARGA Y VACÍO
  // ============================================
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: '#64748b'
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginTop: 16
  },
  emptyText: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 8,
    textAlign: 'center'
  },

  // ============================================
  // DEPARTAMENTO CARDS
  // ============================================
  departamentosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16
  },
  deptCard: {
    width: '31%',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 20,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    minHeight: 160
  },
  deptCardSelected: {
    backgroundColor: '#dbeafe',
    borderColor: '#3b82f6'
  },
  deptCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  deptIconContainer: {
    backgroundColor: '#dbeafe',
    padding: 10,
    borderRadius: 10
  },
  deptCardCode: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
    backgroundColor: '#ffffff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6
  },
  deptCardName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8
  },
  deptFacultadBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8
  },
  deptFacultadText: {
    fontSize: 12,
    color: '#8b5cf6',
    fontWeight: '500'
  },
  deptCardFooter: {
    marginTop: 12,
    alignItems: 'flex-end'
  },

  // ============================================
  // BOTONES DE ACCIÓN
  // ============================================
  actionButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20
  },
  actionToggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
    borderWidth: 2,
    borderColor: '#e2e8f0'
  },
  actionToggleButtonActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6'
  },
  actionToggleText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#3b82f6'
  },
  actionToggleTextActive: {
    color: '#ffffff'
  },

  // ============================================
  // INFO CARD
  // ============================================
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#ecfdf5',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#86efac'
  },
  infoCardText: {
    flex: 1,
    fontSize: 13,
    color: '#047857',
    lineHeight: 18
  },

  // ============================================
  // SELECCIONAR TODOS
  // ============================================
  selectAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  selectAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3b82f6'
  },

  // ============================================
  // USUARIO CARDS
  // ============================================
  usuariosList: {
    gap: 12
  },
  usuarioCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0'
  },
  usuarioCardSelected: {
    backgroundColor: '#dbeafe',
    borderColor: '#3b82f6'
  },
  usuarioCardSelectedGreen: {
    backgroundColor: '#d1fae5',
    borderColor: '#10b981'
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#8b5cf6',
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff'
  },
  usuarioInfo: {
    flex: 1,
    gap: 4
  },
  usuarioNombre: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b'
  },
  usuarioMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap'
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  metaText: {
    fontSize: 12,
    color: '#64748b'
  },
  metaDot: {
    fontSize: 12,
    color: '#94a3b8'
  },
  usuarioCargo: {
    fontSize: 12,
    color: '#8b5cf6',
    fontWeight: '500',
    marginTop: 2
  },
  noDeptBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fcd34d'
  },
  noDeptBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#d97706',
    textTransform: 'uppercase'
  },

  // ============================================
  // RESUMEN CARD
  // ============================================
  resumenCard: {
    backgroundColor: '#eff6ff',
    borderRadius: 16,
    padding: 24,
    borderWidth: 2,
    borderColor: '#bfdbfe',
    marginBottom: 20
  },
  resumenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20
  },
  resumenTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e40af'
  },
  resumenContent: {
    gap: 16,
    marginBottom: 20
  },
  resumenRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  resumenLabel: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '600'
  },
  resumenValue: {
    fontSize: 18,
    color: '#1e293b',
    fontWeight: '700'
  },
  resumenDivider: {
    height: 1,
    backgroundColor: '#bfdbfe'
  },
  resumenDept: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    flex: 1
  },
  resumenDeptLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 4
  },
  resumenDeptValue: {
    fontSize: 15,
    color: '#1e293b',
    fontWeight: '700',
    marginBottom: 2
  },
  resumenDeptCode: {
    fontSize: 12,
    color: '#3b82f6',
    fontWeight: '600'
  },
  resumenArrow: {
    alignItems: 'center',
    paddingVertical: 8
  },
  confirmarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3b82f6',
    padding: 16,
    borderRadius: 12,
    gap: 8
  },
  confirmarButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700'
  },

  // ============================================
  // MODAL
  // ============================================
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    width: '100%',
    maxWidth: 900,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10
  },
  modalScroll: {
    padding: 24
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#e2e8f0'
  },
  modalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1
  },
  avatarLarge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#8b5cf6',
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatarLargeText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff'
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b'
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4
  },
  closeButton: {
    padding: 8,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },

  // ============================================
  // MODAL - SECCIONES
  // ============================================
  modalSection: {
    marginBottom: 24
  },
  modalSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16
  },
  modalSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b'
  },

  // ============================================
  // INFO GRID (Modal)
  // ============================================
  infoGrid: {
    gap: 16
  },
  infoItem: {
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
    marginBottom: 6
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b'
  },

  // ============================================
  // ESTADOS Y ROLES
  // ============================================
  estadoBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start'
  },
  estadoActivo: {
    backgroundColor: '#d1fae5',
    borderWidth: 1,
    borderColor: '#86efac'
  },
  estadoInactivo: {
    backgroundColor: '#fee2e2',
    borderWidth: 1,
    borderColor: '#fecaca'
  },
  estadoBadgeText: {
    fontSize: 12,
    fontWeight: '700'
  },
  rolesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4
  },
  rolBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#d1fae5',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#86efac'
  },
  rolBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#047857'
  },

  // ============================================
  // PERMISOS
  // ============================================
  permisosGrid: {
    gap: 12
  },
  permisoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  permisoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1
  },
  permisoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b'
  },
  permisoToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 2
  },
  permisoTrue: {
    backgroundColor: '#d1fae5',
    borderColor: '#86efac'
  },
  permisoFalse: {
    backgroundColor: '#fee2e2',
    borderColor: '#fecaca'
  },
  permisoValueTrue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#047857'
  },
  permisoValueFalse: {
    fontSize: 12,
    fontWeight: '700',
    color: '#dc2626'
  },

  // ============================================
  // NOTAS
  // ============================================
  notasContainer: {
    marginTop: 20,
    backgroundColor: '#fffbeb',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fef3c7'
  },
  notasHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8
  },
  notasLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#92400e'
  },
  notasBox: {
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 8
  },
  notasText: {
    fontSize: 13,
    color: '#78716c',
    lineHeight: 20
  }
};
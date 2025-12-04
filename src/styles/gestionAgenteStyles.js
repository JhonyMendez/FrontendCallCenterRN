// UBICACIÓN: src/styles/gestionAgenteStyles.js
// REEMPLAZA COMPLETAMENTE el archivo gestionAgenteStyles.js con este código

import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  // Container principal
  container: {
    flex: 1,
    backgroundColor: '#0f0a1f',
    padding: 16,
  },

  // Header (MEJORADO: más espaciado y mejor tipografía)
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 28, // era 24
    paddingHorizontal: 8,
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    fontSize: 32, // era 28
    fontWeight: '800', // era 'bold'
    color: '#ffffff',
    marginBottom: 6, // era 4
    letterSpacing: -0.5, // NUEVO
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.65)', // era 0.6
    fontWeight: '500', // NUEVO
  },

  // Stats Grid (MEJORADO: más elevación y espaciado)
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24, // era 20
    gap: 14, // era 12
  },
  statCard: {
    flex: 1,
    minWidth: 160,
    backgroundColor: 'rgba(102, 126, 234, 0.15)',
    borderRadius: 18, // era 16
    padding: 18, // era 16
    borderWidth: 1.5, // era 1
    borderColor: 'rgba(102, 126, 234, 0.35)', // era 0.3
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14, // era 12
    shadowColor: '#667eea', // NUEVO
    shadowOffset: { width: 0, height: 6 }, // NUEVO
    shadowOpacity: 0.2, // NUEVO
    shadowRadius: 12, // NUEVO
    elevation: 4, // NUEVO
  },
  statIconWrapper: {
    width: 52, // era 48
    height: 52, // era 48
    borderRadius: 14, // era 12
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000', // NUEVO
    shadowOffset: { width: 0, height: 2 }, // NUEVO
    shadowOpacity: 0.3, // NUEVO
    shadowRadius: 4, // NUEVO
    elevation: 3, // NUEVO
  },
  statContent: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 6, // era 4
    fontWeight: '600', // NUEVO
    textTransform: 'uppercase', // NUEVO
    letterSpacing: 0.5, // NUEVO
  },
  statValue: {
    fontSize: 26, // era 24
    fontWeight: '800', // era 'bold'
    color: '#ffffff',
  },

  // Search Container (MEJORADO: más redondeado y padding)
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(102, 126, 234, 0.15)',
    borderRadius: 14, // era 12
    paddingHorizontal: 18, // era 16
    paddingVertical: 14, // era 12
    marginBottom: 18, // era 16
    borderWidth: 1.5, // era 1
    borderColor: 'rgba(102, 126, 234, 0.35)', // era 0.3
    shadowColor: '#667eea', // NUEVO
    shadowOffset: { width: 0, height: 3 }, // NUEVO
    shadowOpacity: 0.15, // NUEVO
    shadowRadius: 8, // NUEVO
    elevation: 2, // NUEVO
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    color: '#ffffff',
    fontSize: 15,
    padding: 0,
    fontWeight: '500', // NUEVO
  },

  // Filter Container (MEJORADO: más espaciado)
  filterContainer: {
    flexDirection: 'row',
    gap: 10, // era 8
    marginBottom: 22, // era 20
    flexWrap: 'wrap',
  },
  filterButton: {
    paddingHorizontal: 18, // era 16
    paddingVertical: 11, // era 10
    borderRadius: 12, // era 10
    backgroundColor: 'rgba(102, 126, 234, 0.15)',
    borderWidth: 1.5, // era 1
    borderColor: 'rgba(102, 126, 234, 0.35)', // era 0.3
    shadowColor: '#667eea', // NUEVO
    shadowOffset: { width: 0, height: 2 }, // NUEVO
    shadowOpacity: 0.1, // NUEVO
    shadowRadius: 6, // NUEVO
    elevation: 1, // NUEVO
  },
  filterButtonActive: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
    shadowColor: '#667eea', // NUEVO
    shadowOffset: { width: 0, height: 4 }, // NUEVO
    shadowOpacity: 0.4, // NUEVO
    shadowRadius: 10, // NUEVO
    elevation: 5, // NUEVO
  },
  filterText: {
    color: 'rgba(255, 255, 255, 0.65)', // era 0.6
    fontSize: 13,
    fontWeight: '700', // era '600'
    letterSpacing: 0.3, // NUEVO
  },
  filterTextActive: {
    color: '#ffffff',
  },

  // Buttons (MEJORADO: más elevación)
  primaryButton: {
    backgroundColor: '#667eea',
    paddingVertical: 14, // era 12
    paddingHorizontal: 22, // era 20
    borderRadius: 14, // era 12
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10, // era 8
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 6 }, // era 4
    shadowOpacity: 0.5, // era 0.4
    shadowRadius: 12, // era 8
    elevation: 8, // era 6
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800', // era '700'
    letterSpacing: 0.3, // NUEVO
  },

  // List
  listContent: {
    paddingBottom: 24, // era 20
  },

  // Card (MEJORADO: mejor contraste)
  card: {
    backgroundColor: 'rgba(102, 126, 234, 0.15)',
    borderRadius: 18, // era 16
    padding: 18, // era 16
    marginBottom: 14, // era 12
    borderWidth: 1.5, // era 2
    borderColor: 'rgba(102, 126, 234, 0.35)', // era 0.3
    shadowColor: '#667eea', // NUEVO
    shadowOffset: { width: 0, height: 4 }, // NUEVO
    shadowOpacity: 0.15, // NUEVO
    shadowRadius: 10, // NUEVO
    elevation: 3, // NUEVO
  },
  cardActive: {
    borderColor: 'rgba(102, 126, 234, 0.55)', // era 0.5
  },
  cardInactive: {
    borderColor: 'rgba(148, 163, 184, 0.3)',
    opacity: 0.65, // era 0.7
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14, // era 12
    gap: 14, // era 12
  },
  avatar: {
    width: 60, // era 56
    height: 60, // era 56
    borderRadius: 16, // era 14
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000', // NUEVO
    shadowOffset: { width: 0, height: 3 }, // NUEVO
    shadowOpacity: 0.3, // NUEVO
    shadowRadius: 6, // NUEVO
    elevation: 4, // NUEVO
  },
  avatarText: {
    fontSize: 22, // era 20
    fontWeight: '800', // era 'bold'
    color: '#ffffff',
  },
  cardHeaderContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18, // era 17
    fontWeight: '800', // era '700'
    color: '#ffffff',
    marginBottom: 8, // era 6
    letterSpacing: -0.3, // NUEVO
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },

  // Badge (MEJORADO: más padding y mejor contraste)
  badge: {
    paddingHorizontal: 12, // era 10
    paddingVertical: 5, // era 4
    borderRadius: 10, // era 8
    borderWidth: 1, // NUEVO
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800', // era '700'
    textTransform: 'uppercase',
    letterSpacing: 0.5, // NUEVO
  },
  badgeRouter: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    borderColor: 'rgba(139, 92, 246, 0.4)', // NUEVO
  },
  badgeRouterText: {
    color: '#a78bfa',
  },
  badgeEspecializado: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderColor: 'rgba(59, 130, 246, 0.4)', // NUEVO
  },
  badgeEspecializadoText: {
    color: '#60a5fa',
  },
  badgeHibrido: {
    backgroundColor: 'rgba(6, 182, 212, 0.2)',
    borderColor: 'rgba(6, 182, 212, 0.4)', // NUEVO
  },
  badgeHibridoText: {
    color: '#22d3ee',
  },

  // Status
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '600', // NUEVO
  },

  // Card Description
  cardDescription: {
    color: 'rgba(255, 255, 255, 0.65)', // era 0.6
    fontSize: 14, // era 13
    lineHeight: 21, // era 20
    marginBottom: 14, // era 12
    fontWeight: '500', // NUEVO
  },

  // Info Grid (MEJORADO: más padding)
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingTop: 14, // era 12
    borderTopWidth: 1,
    borderTopColor: 'rgba(102, 126, 234, 0.25)', // era 0.2
    marginBottom: 14, // era 12
  },
  infoItem: {
    flex: 1,
    minWidth: '45%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10, // era 8
  },
  infoItemContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.55)', // era 0.5
    marginBottom: 3, // era 2
    fontWeight: '600', // NUEVO
    textTransform: 'uppercase', // NUEVO
    letterSpacing: 0.5, // NUEVO
  },
  infoValue: {
    fontSize: 14, // era 13
    fontWeight: '800', // era '700'
    color: '#ffffff',
  },

  // Card Footer (MEJORADO: más padding y elevación en botones)
  cardFooter: {
    flexDirection: 'row',
    gap: 10, // era 8
    paddingTop: 14, // era 12
    borderTopWidth: 1,
    borderTopColor: 'rgba(102, 126, 234, 0.25)', // era 0.2
  },
  iconButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7, // era 6
    paddingVertical: 11, // era 10
    paddingHorizontal: 14, // era 12
    borderRadius: 11, // era 10
    backgroundColor: 'rgba(102, 126, 234, 0.2)',
    borderWidth: 1.5, // era 1
    borderColor: 'rgba(102, 126, 234, 0.35)', // era 0.3
    shadowColor: '#667eea', // NUEVO
    shadowOffset: { width: 0, height: 2 }, // NUEVO
    shadowOpacity: 0.15, // NUEVO
    shadowRadius: 6, // NUEVO
    elevation: 2, // NUEVO
  },
  iconButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700', // era '600'
    letterSpacing: 0.3, // NUEVO
  },
  iconButtonDanger: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderColor: 'rgba(239, 68, 68, 0.4)', // era 0.3
  },
  iconButtonSuccess: {
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    borderColor: 'rgba(34, 197, 94, 0.4)', // era 0.3
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    color: 'rgba(255, 255, 255, 0.65)', // era 0.6
    fontSize: 15, // era 14
    marginTop: 14, // era 12
    fontWeight: '600', // NUEVO
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    color: 'rgba(255, 255, 255, 0.45)', // era 0.4
    fontSize: 17, // era 16
    fontWeight: '700', // era '600'
    marginTop: 18, // era 16
  },
  emptySubtext: {
    color: 'rgba(255, 255, 255, 0.35)', // era 0.3
    fontSize: 14, // era 13
    marginTop: 10, // era 8
    fontWeight: '500', // NUEVO
  },
});

// ============ ESTILOS DE MODALES (MEJORADO) ============
export const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.88)', // era 0.85
    justifyContent: 'center',
    alignItems: 'center',
    padding: 22, // era 20
  },
  container: {
    backgroundColor: '#1a1535', // era #1e1b4b
    borderRadius: 26, // era 24
    width: '100%',
    maxWidth: 620, // era 600
    maxHeight: '90%',
    borderWidth: 1, // NUEVO
    borderColor: 'rgba(102, 126, 234, 0.3)', // NUEVO
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 12 }, // era 8
    shadowOpacity: 0.4, // era 0.3
    shadowRadius: 24, // era 16
    elevation: 16, // era 12
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 26, // era 24
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(102, 126, 234, 0.2)', // era rgba(255, 255, 255, 0.1)
    backgroundColor: 'rgba(102, 126, 234, 0.08)', // NUEVO
    borderTopLeftRadius: 26, // NUEVO
    borderTopRightRadius: 26, // NUEVO
  },
  title: {
    fontSize: 25, // era 24
    fontWeight: '800', // era '700'
    color: '#ffffff',
    letterSpacing: -0.5, // NUEVO
  },
  content: {
    padding: 26, // era 24
    maxHeight: 500,
  },
  section: {
    marginBottom: 26, // era 24
  },
  sectionTitle: {
    fontSize: 19, // era 18
    fontWeight: '800', // era '700'
    color: '#ffffff',
    marginBottom: 18, // era 16
    letterSpacing: -0.3, // NUEVO
  },
  formGroup: {
    marginBottom: 22, // era 20
  },
  label: {
    fontSize: 14,
    fontWeight: '700', // era '600'
    color: 'rgba(255, 255, 255, 0.92)', // era 0.9
    marginBottom: 10, // era 8
    letterSpacing: 0.3, // NUEVO
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)', // era 0.05
    borderWidth: 1.5, // era 1
    borderColor: 'rgba(102, 126, 234, 0.25)', // era rgba(255, 255, 255, 0.1)
    borderRadius: 14, // era 12
    padding: 16, // era 14
    fontSize: 15,
    color: '#ffffff',
    fontWeight: '500', // NUEVO
  },
  inputError: {
    borderColor: '#ef4444',
    borderWidth: 2,
  },
  textArea: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)', // era 0.05
    borderWidth: 1.5, // era 1
    borderColor: 'rgba(102, 126, 234, 0.25)', // era rgba(255, 255, 255, 0.1)
    borderRadius: 14, // era 12
    padding: 16, // era 14
    fontSize: 15,
    color: '#ffffff',
    minHeight: 110, // era 100
    textAlignVertical: 'top',
    fontWeight: '500', // NUEVO
  },
  pickerContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)', // era 0.05
    borderWidth: 1.5, // era 1
    borderColor: 'rgba(102, 126, 234, 0.25)', // era rgba(255, 255, 255, 0.1)
    borderRadius: 14, // era 12
    overflow: 'hidden',
    position: 'relative',
  },
  picker: {
    color: '#ffffff',
    height: 52, // era 50
    paddingHorizontal: 16, // NUEVO
    fontWeight: '600', // NUEVO
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 6, // era 4
    fontWeight: '600', // NUEVO
  },
  helperText: {
    color: 'rgba(255, 255, 255, 0.55)', // era 0.5
    fontSize: 12,
    marginTop: 6, // era 4
    fontWeight: '500', // NUEVO
  },
  iconOption: {
    width: 54, // era 50
    height: 54, // era 50
    borderRadius: 14, // era 12
    backgroundColor: 'rgba(255, 255, 255, 0.06)', // era 0.05
    borderWidth: 2,
    borderColor: 'rgba(102, 126, 234, 0.2)', // era rgba(255, 255, 255, 0.1)
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: '#667eea', // NUEVO
    shadowOffset: { width: 0, height: 2 }, // NUEVO
    shadowOpacity: 0.1, // NUEVO
    shadowRadius: 6, // NUEVO
    elevation: 2, // NUEVO
  },
  iconOptionSelected: {
    borderColor: '#667eea',
    backgroundColor: 'rgba(102, 126, 234, 0.25)', // era 0.2
    shadowColor: '#667eea', // NUEVO
    shadowOffset: { width: 0, height: 4 }, // NUEVO
    shadowOpacity: 0.4, // NUEVO
    shadowRadius: 10, // NUEVO
    elevation: 5, // NUEVO
  },
  iconText: {
    fontSize: 26, // era 24
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(102, 126, 234, 0.12)', // NUEVO
    padding: 16, // NUEVO
    borderRadius: 14, // NUEVO
    borderWidth: 1.5, // NUEVO
    borderColor: 'rgba(102, 126, 234, 0.25)', // NUEVO
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 14, // era 12
    padding: 26, // era 24
    borderTopWidth: 1,
    borderTopColor: 'rgba(102, 126, 234, 0.2)', // era rgba(255, 255, 255, 0.1)
    backgroundColor: 'rgba(102, 126, 234, 0.05)', // NUEVO
    borderBottomLeftRadius: 26, // NUEVO
    borderBottomRightRadius: 26, // NUEVO
  },
  cancelButton: {
    paddingHorizontal: 26, // era 24
    paddingVertical: 15, // era 14
    borderRadius: 14, // era 12
    backgroundColor: 'rgba(255, 255, 255, 0.08)', // era 0.1
    borderWidth: 1.5, // NUEVO
    borderColor: 'rgba(255, 255, 255, 0.15)', // NUEVO
  },
  cancelButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700', // era '600'
    letterSpacing: 0.3, // NUEVO
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10, // era 8
    paddingHorizontal: 26, // era 24
    paddingVertical: 15, // era 14
    borderRadius: 14, // era 12
    backgroundColor: '#667eea',
    shadowColor: '#667eea', // NUEVO
    shadowOffset: { width: 0, height: 6 }, // NUEVO
    shadowOpacity: 0.5, // NUEVO
    shadowRadius: 12, // NUEVO
    elevation: 8, // NUEVO
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800', // era '600'
    letterSpacing: 0.3, // NUEVO
  },
  badge: {
    paddingHorizontal: 14, // era 12
    paddingVertical: 6, // era 4
    borderRadius: 10, // era 8
    borderWidth: 1.5, // era 1
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000', // NUEVO
    shadowOffset: { width: 0, height: 2 }, // NUEVO
    shadowOpacity: 0.15, // NUEVO
    shadowRadius: 4, // NUEVO
    elevation: 2, // NUEVO
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '800', // era '600'
    letterSpacing: 0.5, // NUEVO
  },
  detailSection: {
    marginBottom: 26, // era 24
  },
  detailSectionTitle: {
    fontSize: 17, // era 16
    fontWeight: '800', // era '700'
    color: '#ffffff',
    marginBottom: 14, // era 12
    letterSpacing: -0.3, // NUEVO
  },
  detailText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.85)', // era 0.8
    lineHeight: 22, // era 20
    fontWeight: '500', // NUEVO
  },
  detailGrid: {
    gap: 14, // era 12
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14, // era 12
    backgroundColor: 'rgba(102, 126, 234, 0.08)', // era rgba(255, 255, 255, 0.05)
    padding: 14, // era 12
    borderRadius: 14, // era 12
    borderWidth: 1, // NUEVO
    borderColor: 'rgba(102, 126, 234, 0.2)', // NUEVO
  },
  detailLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 4, // era 2
    fontWeight: '600', // NUEVO
    textTransform: 'uppercase', // NUEVO
    letterSpacing: 0.5, // NUEVO
  },
  detailValue: {
    fontSize: 15, // era 14
    color: '#ffffff',
    fontWeight: '700', // era '600'
  },
  promptBox: {
    backgroundColor: 'rgba(102, 126, 234, 0.08)', // era rgba(255, 255, 255, 0.05)
    borderWidth: 1.5, // era 1
    borderColor: 'rgba(102, 126, 234, 0.25)', // era rgba(255, 255, 255, 0.1)
    borderRadius: 14, // era 12
    padding: 18, // era 16
  },
  promptText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.85)', // era 0.8
    lineHeight: 22, // era 20
    fontWeight: '500', // NUEVO
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10, // era 8
    paddingHorizontal: 24, // era 20
    paddingVertical: 14, // era 12
    borderRadius: 14, // era 12
    backgroundColor: '#667eea',
    shadowColor: '#667eea', // NUEVO
    shadowOffset: { width: 0, height: 6 }, // NUEVO
    shadowOpacity: 0.4, // NUEVO
    shadowRadius: 10, // NUEVO
    elevation: 6, // NUEVO
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800', // era '600'
    letterSpacing: 0.3, // NUEVO
  },
});

// ============ UTILIDADES ============
export const getTipoColor = (tipo) => {
  const colors = {
    router: '#8b5cf6',
    especializado: '#3b82f6',
    hibrido: '#06b6d4',
  };
  return colors[tipo] || '#64748b';
};

export const getTipoBadgeStyles = (tipo) => {
  const styles = {
    router: { 
      bg: 'rgba(139, 92, 246, 0.2)', 
      text: '#a78bfa',
      border: 'rgba(139, 92, 246, 0.4)' // NUEVO
    },
    especializado: { 
      bg: 'rgba(59, 130, 246, 0.2)', 
      text: '#60a5fa',
      border: 'rgba(59, 130, 246, 0.4)' // NUEVO
    },
    hibrido: { 
      bg: 'rgba(6, 182, 212, 0.2)', 
      text: '#22d3ee',
      border: 'rgba(6, 182, 212, 0.4)' // NUEVO
    },
  };
  return styles[tipo] || { 
    bg: 'rgba(100, 116, 139, 0.2)', 
    text: '#94a3b8',
    border: 'rgba(100, 116, 139, 0.4)' // NUEVO
  };
};

export const getInitials = (nombre) => {
  return nombre
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const getStatIconColor = (type) => {
  const colors = {
    total: { bg: 'rgba(59, 130, 246, 0.25)', color: '#3b82f6' },
    activos: { bg: 'rgba(34, 197, 94, 0.25)', color: '#22c55e' },
    router: { bg: 'rgba(139, 92, 246, 0.25)', color: '#8b5cf6' },
    especializados: { bg: 'rgba(6, 182, 212, 0.25)', color: '#06b6d4' },
  };
  return colors[type] || { bg: 'rgba(148, 163, 184, 0.2)', color: '#94a3b8' };
};
// UBICACIÓN: src/styles/gestionContenidoStyles.js

import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  // ============ CONTENEDOR PRINCIPAL ============
  container: {
    flex: 1,
    backgroundColor: '#0f0f23',
  },

  content: {
    flex: 1,
    backgroundColor: '#0f0f23',
  },

  scrollContent: {
    padding: 20,
  },

  // ============ LOADING ============
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f0f23',
  },

  loadingText: {
    marginTop: 16,
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 16,
    fontWeight: '500',
  },

  // ============ HEADER MODERNO CON GRADIENTE ============
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#1a1a2e',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(102, 126, 234, 0.2)',
    shadowColor: '#667eea',
    shadowOpacity: 0.3,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 5 },
    elevation: 8,
  },

  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 1,
  },

  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 4,
    fontWeight: '500',
  },

  // ============ FILTROS GLASSMORPHISM ============
  filtrosContainer: {
    backgroundColor: 'rgba(26, 26, 46, 0.8)',
    padding: 20,
    borderRadius: 16,
    marginBottom: 28,
    marginHorizontal: 20,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(102, 126, 234, 0.2)',
  },

  filtrosRow: {
    flexDirection: 'row',
    gap: 18,
    flexWrap: 'wrap',
  },

  filtroItem: {
    flex: 1,
    minWidth: 220,
  },

  filtroLabel: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  pickerContainer: {
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },

  picker: {
    height: 48,
    paddingHorizontal: 12,
    color: '#fff',
    fontWeight: '600',
  },

  // ============ BOTÓN NUEVO CON GRADIENTE ============
  btnNuevo: {
    backgroundColor: '#667eea',
    padding: 16,
    borderRadius: 16,
    marginTop: 20,
    marginHorizontal: 20,
    alignItems: 'center',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(102, 126, 234, 0.3)',
  },

  btnNuevoText: {
    color: 'white',
    fontWeight: '800',
    fontSize: 16,
    letterSpacing: 0.5,
  },

  // ============ LISTA ============
  listaHeader: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 20,
    marginHorizontal: 20,
    color: '#fff',
    letterSpacing: -0.3,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
    marginHorizontal: 20,
  },

  emptyText: {
    marginTop: 16,
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.5)',
    fontWeight: '600',
  },

  // ============ MODAL MEJORADO ============
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  modalContent: {
    backgroundColor: '#1a1a2e',
    borderRadius: 24,
    padding: 28,
    width: '100%',
    maxWidth: 600,
    maxHeight: '90%',
    shadowColor: '#667eea',
    shadowOpacity: 0.4,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 10 },
    elevation: 20,
    borderWidth: 1,
    borderColor: 'rgba(102, 126, 234, 0.3)',
  },

  modalTitle: {
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 28,
    color: '#fff',
    letterSpacing: -0.5,
  },

  // ============ FORMULARIO ============
  formLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 10,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },

  formInput: {
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: 14,
    marginBottom: 20,
    fontSize: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    color: '#fff',
    fontWeight: '500',
  },

  formInputMultiline: {
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: 14,
    marginBottom: 20,
    fontSize: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    color: '#fff',
    fontWeight: '500',
    textAlignVertical: 'top',
    height: 120,
  },

  formPickerContainer: {
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    marginBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },

  formPicker: {
    height: 48,
    paddingHorizontal: 12,
    color: '#fff',
    fontWeight: '600',
  },

  // ============ BOTONES MODAL ============
  modalButtonsContainer: {
    flexDirection: 'row',
    gap: 14,
    marginTop: 8,
  },

  btnCancelar: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 16,
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },

  btnGuardar: {
    backgroundColor: '#667eea',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 16,
    flex: 1,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 10,
  },

  modalButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 16,
  },

  // ============ BADGES ============
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },

  badge: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },

  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
  },

  badgePrioridad: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },

  badgePrioridadText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.3,
  },

  // ============ CARD FOOTER ============
  cardFooter: {
    flexDirection: 'row',
    gap: 10,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
    marginTop: 14,
  },

  iconButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
  },

  iconButtonText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});

// ============ COLORES PARA ESTADOS ============
export const estadoColors = {
  borrador: { bg: 'rgba(156, 163, 175, 0.15)', border: 'rgba(156, 163, 175, 0.3)', icon: '#9ca3af', text: 'Borrador' },
  revision: { bg: 'rgba(251, 191, 36, 0.15)', border: 'rgba(251, 191, 36, 0.3)', icon: '#fbbf24', text: 'En Revisión' },
  activo: { bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.3)', icon: '#10b981', text: 'Activo' },
  inactivo: { bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.3)', icon: '#ef4444', text: 'Inactivo' },
  archivado: { bg: 'rgba(107, 114, 128, 0.15)', border: 'rgba(107, 114, 128, 0.3)', icon: '#6b7280', text: 'Archivado' },
};

export const getEstadoColor = (estado) => {
  return estadoColors[estado]?.icon || '#9ca3af';
};

export const getEstadoBadgeStyles = (estado) => {
  return estadoColors[estado] || estadoColors.borrador;
};

export const getEstadoLabel = (estado) => {
  return estadoColors[estado]?.text || estado.toUpperCase();
};

// ============ COLORES DE PRIORIDAD ============
export const prioridadColors = {
  10: { bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.3)', icon: '#ef4444', text: 'Crítica' },
  9: { bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.3)', icon: '#ef4444', text: 'Muy Alta' },
  8: { bg: 'rgba(249, 115, 22, 0.15)', border: 'rgba(249, 115, 22, 0.3)', icon: '#f97316', text: 'Alta' },
  7: { bg: 'rgba(251, 191, 36, 0.15)', border: 'rgba(251, 191, 36, 0.3)', icon: '#fbbf24', text: 'Media-Alta' },
  6: { bg: 'rgba(251, 191, 36, 0.15)', border: 'rgba(251, 191, 36, 0.3)', icon: '#fbbf24', text: 'Media' },
  5: { bg: 'rgba(251, 191, 36, 0.15)', border: 'rgba(251, 191, 36, 0.3)', icon: '#fbbf24', text: 'Media' },
  4: { bg: 'rgba(34, 197, 94, 0.15)', border: 'rgba(34, 197, 94, 0.3)', icon: '#22c55e', text: 'Media-Baja' },
  3: { bg: 'rgba(34, 197, 94, 0.15)', border: 'rgba(34, 197, 94, 0.3)', icon: '#22c55e', text: 'Baja' },
  2: { bg: 'rgba(34, 197, 94, 0.15)', border: 'rgba(34, 197, 94, 0.3)', icon: '#22c55e', text: 'Muy Baja' },
  1: { bg: 'rgba(156, 163, 175, 0.15)', border: 'rgba(156, 163, 175, 0.3)', icon: '#9ca3af', text: 'Mínima' },
};

export const getPrioridadColor = (prioridad) => {
  return prioridadColors[prioridad]?.icon || '#fbbf24';
};

export const getPrioridadLabel = (prioridad) => {
  return prioridadColors[prioridad]?.text || 'Media';
};

export const getPrioridadStyles = (prioridad) => {
  return prioridadColors[prioridad] || prioridadColors[5];
};
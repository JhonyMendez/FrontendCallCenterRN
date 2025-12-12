import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function GestionCategoriaCard({ categoria, onEdit, onDelete, onPress, agenteNombre }) {
  // Formatear fecha de manera segura
  const formatDate = (dateString) => {
    if (!dateString) return 'Sin fecha';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return 'Fecha inválida';
    }
  };

  // Colores para las categorías
  const categoryColors = {
    high: { bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.3)', icon: '#ef4444' },
    medium: { bg: 'rgba(251, 191, 36, 0.15)', border: 'rgba(251, 191, 36, 0.3)', icon: '#fbbf24' },
    low: { bg: 'rgba(34, 197, 94, 0.15)', border: 'rgba(34, 197, 94, 0.3)', icon: '#22c55e' },
  };

  const getColorScheme = () => {
    const priority = categoria?.prioridad?.toLowerCase();
    return categoryColors[priority] || categoryColors.medium;
  };

  const colors = getColorScheme();

  return (

  <TouchableOpacity 
    onPress={() => onPress(categoria)}
    activeOpacity={0.8}
  >
    <View style={styles.card}>
      {/* Borde superior con gradiente */}
      <View style={[styles.gradientBorder, { backgroundColor: colors.icon }]} />

      {/* Header con badge */}
      <View style={styles.header}>
        <View style={styles.titleSection}>
          <Text style={styles.nombre} numberOfLines={1}>
            {categoria?.nombre || 'Sin nombre'}
          </Text>
         
        </View>
        
        <View
          style={[
            styles.badge,
            categoria?.activo ? styles.badgeActive : styles.badgeInactive,
          ]}
        >
          <View style={styles.badgeDot} />
          <Text
            style={[
              styles.badgeText,
              categoria?.activo ? styles.badgeTextActive : styles.badgeTextInactive,
            ]}
          >
            {categoria?.activo ? 'Activo' : 'Inactivo'}
          </Text>
        </View>
      </View>

      {/* Prioridad */}
      {categoria?.prioridad && (
        <View style={[styles.prioridadTag, { backgroundColor: colors.bg, borderColor: colors.border }]}>
          <View style={[styles.prioridadIcon, { backgroundColor: colors.bg }]}>
            <Ionicons name="flag" size={16} color={colors.icon} />
          </View>
          <Text style={[styles.prioridadText, { color: colors.icon }]}>
            Prioridad: {categoria.prioridad.charAt(0).toUpperCase() + categoria.prioridad.slice(1)}
          </Text>
        </View>
      )}

      {/* Descripción (solo si existe) */}
      {categoria?.descripcion && (
        <Text style={styles.descripcion} numberOfLines={3}>
          {categoria.descripcion}
        </Text>
      )}

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.dateContainer}>
          <Ionicons name="calendar" size={14} color="rgba(255, 255, 255, 0.4)" />
          <Text style={styles.dateText}>{formatDate(categoria?.fecha_creacion)}</Text>
        </View>
        
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={(e) => {
              e?.stopPropagation?.();
              onEdit(categoria);
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="create" size={18} color="#667eea" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={(e) => {
              e?.stopPropagation?.();
              onDelete(categoria?.id_categoria);
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="trash" size={18} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1a1a2e',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    position: 'relative',
    overflow: 'hidden',
  },
  gradientBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    gap: 12,
  },
  titleSection: {
    flex: 1,
  },
  nombre: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  codigoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(102, 126, 234, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  codigo: {
    fontSize: 13,
    color: '#667eea',
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'currentColor',
  },
  badgeActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  badgeInactive: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  badgeTextActive: {
    color: '#10b981',
  },
  badgeTextInactive: {
    color: '#ef4444',
  },
  prioridadTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 14,
    alignSelf: 'flex-start',
    borderWidth: 1,
  },
  prioridadIcon: {
    width: 24,
    height: 24,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  prioridadText: {
    fontSize: 14,
    fontWeight: '700',
  },
  descripcion: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 20,
    marginBottom: 16,
    fontWeight: '400',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  dateText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  editButton: {
    backgroundColor: 'rgba(102, 126, 234, 0.15)',
    borderColor: 'rgba(102, 126, 234, 0.3)',
  },
  deleteButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
});
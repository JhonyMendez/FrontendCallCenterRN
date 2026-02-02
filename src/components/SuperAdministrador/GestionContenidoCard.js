import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function GestionContenidoCard({ contenido, onEdit, onPublish, onDelete, onView }) {
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

  // Colores según estado
  const estadoColors = {
    borrador: { bg: 'rgba(156, 163, 175, 0.15)', border: 'rgba(156, 163, 175, 0.3)', icon: '#9ca3af', text: 'Borrador' },
    revision: { bg: 'rgba(251, 191, 36, 0.15)', border: 'rgba(251, 191, 36, 0.3)', icon: '#fbbf24', text: 'En Revisión' },
    activo: { bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.3)', icon: '#10b981', text: 'Activo' },
    inactivo: { bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.3)', icon: '#ef4444', text: 'Inactivo' },
    archivado: { bg: 'rgba(107, 114, 128, 0.15)', border: 'rgba(107, 114, 128, 0.3)', icon: '#6b7280', text: 'Archivado' },
  };

  const getEstadoColors = () => {
    return estadoColors[contenido?.estado?.toLowerCase()] || estadoColors.borrador;
  };

  const colors = getEstadoColors();

  // Colores de prioridad
  const prioridadColors = {
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

  const getPrioridadColors = () => {
    return prioridadColors[contenido?.prioridad] || prioridadColors[5];
  };

  const prioridadColor = getPrioridadColors();

  return (
    <View style={styles.card}>
      {/* Borde superior con gradiente */}
      <View style={[styles.gradientBorder, { backgroundColor: colors.icon }]} />

      {/* Header con badges */}
      <View style={styles.header}>
        <View style={styles.titleSection}>
          <Text style={styles.titulo}>
            {contenido?.titulo || 'Sin título'}
          </Text>
          
          {/* Categoría */}
          {contenido?.categoria_nombre && (
            <View style={styles.categoriaContainer}>
              <Ionicons name="folder" size={12} color="#667eea" />
              <Text style={styles.categoriaText}>{contenido.categoria_nombre}</Text>
            </View>
          )}
        </View>
        
        {/* Badge de estado */}
        <View style={[styles.badge, { backgroundColor: colors.bg, borderColor: colors.border }]}>
          <View style={[styles.badgeDot, { backgroundColor: colors.icon }]} />
          <Text style={[styles.badgeText, { color: colors.icon }]}>
            {colors.text}
          </Text>
        </View>
      </View>

      {/* Tags de prioridad y metadata */}
      <View style={styles.metadataRow}>
        {/* Prioridad */}
        <View style={[styles.prioridadTag, { backgroundColor: prioridadColor.bg, borderColor: prioridadColor.border }]}>
          <View style={[styles.prioridadIcon, { backgroundColor: prioridadColor.bg }]}>
            <Ionicons name="flag" size={14} color={prioridadColor.icon} />
          </View>
          <Text style={[styles.prioridadText, { color: prioridadColor.icon }]}>
            {prioridadColor.text}
          </Text>
        </View>
        {/* Agente */}
        {contenido?.agente_nombre && (
          <View style={styles.agenteTag}>
            <Ionicons name="person" size={14} color="#667eea" />
            <Text style={styles.agenteText}>
              {contenido.agente_nombre}
            </Text>
          </View>
        )}
      </View>

      {/* Resumen */}
      {contenido?.resumen && (
        <Text style={styles.resumen}>
          {contenido.resumen}
        </Text>
      )}

      {/* Keywords y etiquetas */}
      {(contenido?.palabras_clave || contenido?.etiquetas) && (
        <View style={styles.tagsContainer}>
          {contenido?.palabras_clave?.split(',').slice(0, 3).map((palabra, index) => (
            <View key={index} style={styles.tag}>
              <Ionicons name="pricetag" size={10} color="rgba(255, 255, 255, 0.5)" />
              <Text style={styles.tagText}>{palabra.trim()}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.dateContainer}>
          <Ionicons name="calendar" size={14} color="rgba(255, 255, 255, 0.4)" />
          <Text style={styles.dateText}>{formatDate(contenido?.fecha_creacion)}</Text>
        </View>
        
        <View style={styles.actions}>
          {contenido?.estado === 'borrador' && (
            <TouchableOpacity
              style={[styles.actionButton, styles.publishButton]}
              onPress={() => onPublish(contenido?.id_contenido)}
              activeOpacity={0.7}
            >
              <Ionicons name="cloud-upload" size={18} color="#10b981" />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.actionButton, styles.viewButton]}
            onPress={() => onView(contenido)}
            activeOpacity={0.7}
          >
            <Ionicons name="eye" size={18} color="#667eea" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={() => onEdit(contenido)}
            activeOpacity={0.7}
          >
            <Ionicons name="create" size={18} color="#fbbf24" />
          </TouchableOpacity>

          {/* 🔥 NUEVO: Botón Eliminar */}
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => onDelete(contenido?.id_contenido)}
            activeOpacity={0.7}
          >
            <Ionicons name="trash" size={18} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
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
    marginBottom: 12,
    gap: 12,
  },
  titleSection: {
    flex: 1,
  },
  titulo: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 6,
    letterSpacing: 0.3,
    lineHeight: 24,
  },
  categoriaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(102, 126, 234, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  categoriaText: {
    fontSize: 12,
    color: '#667eea',
    fontWeight: '700',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  metadataRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
    flexWrap: 'wrap',
  },
  prioridadTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
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
    fontSize: 13,
    fontWeight: '700',
  },
  agenteTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(102, 126, 234, 0.2)',
  },
  agenteText: {
    fontSize: 12,
    color: '#667eea',
    fontWeight: '600',
  },
  resumen: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 20,
    marginBottom: 12,
    fontWeight: '400',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  tagText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '600',
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
  publishButton: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  viewButton: {
    backgroundColor: 'rgba(102, 126, 234, 0.15)',
    borderColor: 'rgba(102, 126, 234, 0.3)',
  },
  editButton: {
    backgroundColor: 'rgba(251, 191, 36, 0.15)',
    borderColor: 'rgba(251, 191, 36, 0.3)',
  },
  deleteButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
});
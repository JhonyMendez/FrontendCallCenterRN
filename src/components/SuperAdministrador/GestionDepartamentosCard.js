import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';


const { width } = Dimensions.get('window');
const isMobile = width < 768;
export default function GestionDepartamentosCard({ departamento, onEdit, onDelete }) {
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

  // Verificar si hay información de contacto
  const hasContactInfo = departamento?.ubicacion || departamento?.email || departamento?.telefono;

  return (
    <View style={styles.card}>
      {/* Borde superior con gradiente */}
      <View style={styles.gradientBorder} />

      {/* Header con badge */}
      <View style={styles.header}>
        <View style={styles.titleSection}>
          <Text
            style={styles.nombre}
            numberOfLines={isMobile ? undefined : 1}
          >
            {departamento?.nombre || 'Sin nombre'}
          </Text>
          <View style={styles.codigoContainer}>
            <Ionicons name="pricetag" size={14} color="#667eea" />
            <Text style={styles.codigo}>#{departamento?.codigo || 'N/A'}</Text>
          </View>
        </View>

        <View
          style={[
            styles.badge,
            departamento?.activo ? styles.badgeActive : styles.badgeInactive,
          ]}
        >
          <View style={styles.badgeDot} />
          <Text
            style={[
              styles.badgeText,
              departamento?.activo ? styles.badgeTextActive : styles.badgeTextInactive,
            ]}
          >
            {departamento?.activo ? 'Activo' : 'Inactivo'}
          </Text>
        </View>
      </View>

      {/* Facultad (solo si existe) */}
      {departamento?.facultad && (
        <View style={styles.facultadTag}>
          <View style={styles.facultadIcon}>
            <Ionicons name="business" size={16} color="#667eea" />
          </View>
          <Text style={styles.facultadText}>{departamento.facultad}</Text>
        </View>
      )}

      {/* Descripción (solo si existe) */}
      {departamento?.descripcion && (
        <Text style={styles.descripcion} numberOfLines={2}>
          {departamento.descripcion}
        </Text>
      )}

      {/* Información de contacto */}
      <View style={styles.infoContainer}>
        {departamento?.ubicacion && (
          <View style={styles.infoItem}>
            <View style={styles.infoIconContainer}>
              <Ionicons name="location" size={14} color="#667eea" />
            </View>
            <Text style={styles.infoText} numberOfLines={1}>
              {departamento.ubicacion}
            </Text>
          </View>
        )}

        {departamento?.email && (
          <View style={styles.infoItem}>
            <View style={styles.infoIconContainer}>
              <Ionicons name="mail" size={14} color="#667eea" />
            </View>
            <Text style={styles.infoText} numberOfLines={1}>
              {departamento.email}
            </Text>
          </View>
        )}

        {departamento?.telefono && (
          <View style={styles.infoItem}>
            <View style={styles.infoIconContainer}>
              <Ionicons name="call" size={14} color="#667eea" />
            </View>
            <Text style={styles.infoText}>{departamento.telefono}</Text>
          </View>
        )}

        {!hasContactInfo && (
          <View style={styles.emptyState}>
            <Ionicons name="information-circle-outline" size={16} color="rgba(255, 255, 255, 0.3)" />
            <Text style={styles.emptyText}>Sin información de contacto</Text>
          </View>
        )}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.dateContainer}>
          <Ionicons name="calendar" size={14} color="rgba(255, 255, 255, 0.4)" />
          <Text style={styles.dateText}>{formatDate(departamento?.fecha_creacion)}</Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={() => onEdit(departamento)}
            activeOpacity={0.7}
          >
            <Ionicons name="create" size={18} color="#667eea" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => onDelete(departamento?.id_departamento)}
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
    backgroundColor: '#667eea',
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
  facultadTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 14,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(102, 126, 234, 0.2)',
  },
  facultadIcon: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: 'rgba(102, 126, 234, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  facultadText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  descripcion: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 20,
    marginBottom: 16,
    fontWeight: '400',
  },
  infoContainer: {
    gap: 10,
    marginBottom: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  infoIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: 'rgba(102, 126, 234, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    flex: 1,
    fontWeight: '500',
  },
  emptyState: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  emptyText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.3)',
    fontStyle: 'italic',
    fontWeight: '500',
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
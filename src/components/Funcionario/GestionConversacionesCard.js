// ============================================
// 1. GestionConversacionesCard.js
// ============================================
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const GestionConversacionesCard = ({ conversacion, onPress, onEscalar }) => {
  const {
    visitante,
    codigo,
    ultimoMensaje,
    fecha,
    dispositivo,
    agente,
    noLeidos,
    estado
  } = conversacion;

  const getEstadoColor = () => {
    switch (estado) {
      case 'activa':
        return '#10B981';
      case 'cerrada':
        return '#6B7280';
      case 'escalada':
        return '#F59E0B';
      default:
        return '#6B7280';
    }
  };

  const getEstadoTexto = () => {
    switch (estado) {
      case 'activa':
        return 'Activa';
      case 'cerrada':
        return 'Cerrada';
      case 'escalada':
        return 'Escalada';
      default:
        return 'Desconocido';
    }
  };

  return (
    <TouchableOpacity 
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={styles.userInfo}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person" size={24} color="#4A90E2" />
          </View>
          
          <View style={styles.userDetails}>
            <View style={styles.nameRow}>
              <Text style={styles.userName}>{visitante}</Text>
              {noLeidos > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{noLeidos}</Text>
                </View>
              )}
            </View>
            <Text style={styles.userCode}>ID: {codigo}</Text>
          </View>
        </View>

        <View style={styles.statusContainer}>
          <View style={[styles.statusBadge, { backgroundColor: getEstadoColor() }]}>
            <Text style={styles.statusText}>{getEstadoTexto()}</Text>
          </View>
        </View>
      </View>

      <View style={styles.messageContainer}>
        <Text style={styles.messageText} numberOfLines={2}>
          {ultimoMensaje}
        </Text>
      </View>

      <View style={styles.metaContainer}>
        <View style={styles.metaItem}>
          <Ionicons name="time-outline" size={14} color="#6B7280" />
          <Text style={styles.metaText}>{fecha}</Text>
        </View>

        <View style={styles.metaItem}>
          <Ionicons name="desktop-outline" size={14} color="#6B7280" />
          <Text style={styles.metaText}>{dispositivo}</Text>
        </View>

        <View style={styles.metaItem}>
          <Ionicons name="person-outline" size={14} color="#6B7280" />
          <Text style={styles.metaText}>{agente}</Text>
        </View>
      </View>

      {estado === 'activa' && (
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={onPress}
          >
            <Ionicons name="eye-outline" size={18} color="#4A90E2" />
            <Text style={styles.actionButtonText}>Ver</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, styles.actionButtonSecondary]}
            onPress={onEscalar}
          >
            <Ionicons name="arrow-up-circle-outline" size={18} color="#F59E0B" />
            <Text style={[styles.actionButtonText, styles.actionButtonTextSecondary]}>
              Escalar
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EBF5FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userDetails: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginRight: 8,
  },
  userCode: {
    fontSize: 12,
    color: '#6B7280',
  },
  badge: {
    backgroundColor: '#EF4444',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  statusContainer: {
    marginLeft: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  messageContainer: {
    marginBottom: 12,
    paddingLeft: 60,
  },
  messageText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  metaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingLeft: 60,
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  actionsContainer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 12,
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#EBF5FF',
  },
  actionButtonSecondary: {
    backgroundColor: '#FEF3C7',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A90E2',
    marginLeft: 6,
  },
  actionButtonTextSecondary: {
    color: '#F59E0B',
  },
});

// CAMBIO IMPORTANTE: Exportación nombrada en lugar de default
export { GestionConversacionesCard };
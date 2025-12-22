// components/Funcionario/GestionConversacionesCard.js
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { escalamientoService } from '../../api/services/escalamientoService';

const GestionConversacionesCard = ({ 
  conversacion, 
  onPress, 
  onTomar,
  puedeTomarConversacion = false,
  esPropia = false
}) => {
  const {
    visitante,
    codigo,
    ultimoMensaje,
    fecha,
    dispositivo,
    agente,
    noLeidos,
    estado,
    escaladoA,
    tiempoEspera,
    prioridad,
    requiereAtencion
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

  // 🔥 NUEVO: Color de prioridad
  const prioridadColor = escalamientoService.getColorPrioridad(prioridad);

  return (
    <TouchableOpacity 
      style={[
        styles.card,
        requiereAtencion && styles.cardUrgente,
        esPropia && styles.cardPropia
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* 🔥 NUEVO: Indicador de prioridad */}
      {prioridad !== 'normal' && (
        <View style={[styles.prioridadIndicator, { backgroundColor: prioridadColor }]} />
      )}

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
              {esPropia && (
                <View style={styles.badgePropia}>
                  <Text style={styles.badgePropiaText}>Tuya</Text>
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

        {/* 🔥 NUEVO: Tiempo de espera */}
        {tiempoEspera && (
          <View style={styles.metaItem}>
            <Ionicons name="hourglass-outline" size={14} color={prioridadColor} />
            <Text style={[styles.metaText, { color: prioridadColor }]}>
              {escalamientoService.formatearTiempoEspera(tiempoEspera)}
            </Text>
          </View>
        )}
      </View>

      {/* 🔥 NUEVO: Info de asignación */}
      {escaladoA && (
        <View style={styles.asignadoContainer}>
          <Ionicons name="person-circle-outline" size={16} color="#8B5CF6" />
          <Text style={styles.asignadoText}>Atendido por: {escaladoA}</Text>
        </View>
      )}

      {/* Acciones */}
      {(estado === 'activa' || estado === 'escalada') && (
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={onPress}
          >
            <Ionicons name="eye-outline" size={18} color="#4A90E2" />
            <Text style={styles.actionButtonText}>Ver</Text>
          </TouchableOpacity>

          {/* 🔥 NUEVO: Botón Tomar */}
          {puedeTomarConversacion && (
            <TouchableOpacity 
              style={[styles.actionButton, styles.actionButtonPrimary]}
              onPress={onTomar}
            >
              <Ionicons name="hand-right-outline" size={18} color="#FFF" />
              <Text style={[styles.actionButtonText, styles.actionButtonTextPrimary]}>
                Tomar
              </Text>
            </TouchableOpacity>
          )}
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
    position: 'relative',
  },
  // 🔥 NUEVOS: Estilos especiales
  cardUrgente: {
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  cardPropia: {
    borderWidth: 2,
    borderColor: '#8B5CF6',
  },
  prioridadIndicator: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    margin: 12,
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
    flexWrap: 'wrap',
    gap: 6,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
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
  // 🔥 NUEVO: Badge "Tuya"
  badgePropia: {
    backgroundColor: '#8B5CF6',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgePropiaText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
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
  // 🔥 NUEVO: Info de asignación
  asignadoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 60,
    marginBottom: 12,
    gap: 6,
  },
  asignadoText: {
    fontSize: 12,
    color: '#8B5CF6',
    fontWeight: '500',
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
  // 🔥 NUEVO: Botón primario
  actionButtonPrimary: {
    backgroundColor: '#4A90E2',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A90E2',
    marginLeft: 6,
  },
  actionButtonTextPrimary: {
    color: '#FFFFFF',
  },
});

export { GestionConversacionesCard };

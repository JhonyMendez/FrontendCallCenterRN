// components/Funcionario/NotificacionesBadge.js
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

import { escalamientoService } from '../../api/services/escalamientoService';

const NotificacionesBadge = ({ userId, onNotificacionPress }) => {
  const [notificaciones, setNotificaciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [contador, setContador] = useState(0);

  useEffect(() => {
    if (userId) {
      cargarNotificaciones();
      const interval = setInterval(cargarNotificaciones, 30000);
      return () => clearInterval(interval);
    }
  }, [userId]);

  const cargarNotificaciones = async () => {
    if (!userId) return;

    try {
      const response = await escalamientoService.getMisNotificaciones(userId, {
        solo_no_leidas: true,
        limite: 20
      });

      if (response.success) {
        setNotificaciones(response.notificaciones);
        setContador(response.no_leidas || response.notificaciones.length);
      }
    } catch (error) {
      console.error('Error cargando notificaciones:', error);
    }
  };

  const marcarLeida = async (idNotificacion) => {
    try {
      await escalamientoService.marcarLeida(idNotificacion);
      await cargarNotificaciones();
      
      const notif = notificaciones.find(n => n.id === idNotificacion);
      if (notif?.url_accion && onNotificacionPress) {
        // 🔥 Cerrar el modal y llamar la función con la URL
        setModalVisible(false);
        setTimeout(() => {
          onNotificacionPress(notif.url_accion);
        }, 300);
      }
    } catch (error) {
      console.error('Error marcando notificación:', error);
    }
  };

  const marcarTodasLeidas = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      await escalamientoService.marcarTodasLeidas(userId);
      await cargarNotificaciones();
    } catch (error) {
      console.error('Error marcando todas leídas:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderNotificacion = ({ item }) => (
    <TouchableOpacity
      style={styles.notificacionItem}
      onPress={() => {
        console.log('🖱️ Notificación presionada - Objeto completo:', JSON.stringify(item, null, 2));
        console.log('📌 url_accion:', item.url_accion);
        marcarLeida(item.id);
        setModalVisible(false);
      }}
    >
      <View style={styles.notificacionIconContainer}>
        <Ionicons
          name={getTipoIcon(item.tipo)}
          size={24}
          color={getTipoColor(item.tipo)}
        />
      </View>
      <View style={styles.notificacionContent}>
        <Text style={styles.notificacionTitulo}>{item.titulo}</Text>
        <Text style={styles.notificacionMensaje} numberOfLines={2}>
          {item.mensaje}
        </Text>
        <Text style={styles.notificacionFecha}>
          {formatearFecha(item.fecha_creacion)}
        </Text>
      </View>
      {!item.leida && <View style={styles.notificacionDot} />}
    </TouchableOpacity>
  );

  const getTipoIcon = (tipo) => {
    const iconos = {
      'urgente': 'alert-circle',
      'info': 'information-circle',
      'nuevo': 'notifications',
      'sistema': 'settings'
    };
    return iconos[tipo] || 'notifications';
  };

  const getTipoColor = (tipo) => {
    const colores = {
      'urgente': '#EF4444',
      'info': '#4A90E2',
      'nuevo': '#10B981',
      'sistema': '#6B7280'
    };
    return colores[tipo] || '#6B7280';
  };

  const formatearFecha = (fechaStr) => {
    if (!fechaStr) return '';
    const fecha = new Date(fechaStr);
    const ahora = new Date();
    const diffMs = ahora - fecha;
    const diffMin = Math.floor(diffMs / (1000 * 60));
    const diffHoras = Math.floor(diffMin / 60);

    if (diffMin < 1) return 'Ahora';
    if (diffMin < 60) return `Hace ${diffMin}min`;
    if (diffHoras < 24) return `Hace ${diffHoras}h`;
    return fecha.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
  };

  return (
    <>
      <TouchableOpacity
        style={styles.badgeButton}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="notifications" size={24} color="#1F2937" />
        {contador > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {contador > 99 ? '99+' : contador}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Notificaciones</Text>
              <View style={styles.modalHeaderActions}>
                {notificaciones.length > 0 && (
                  <TouchableOpacity 
                    onPress={marcarTodasLeidas}
                    style={styles.marcarTodasButton}
                  >
                    <Text style={styles.marcarTodasText}>Marcar todas</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Ionicons name="close" size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>
            </View>

            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4A90E2" />
              </View>
            ) : notificaciones.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="notifications-off" size={48} color="#D1D5DB" />
                <Text style={styles.emptyText}>No tienes notificaciones</Text>
              </View>
            ) : (
              <FlatList
                data={notificaciones}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderNotificacion}
                contentContainerStyle={styles.notificacionesList}
              />
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  badgeButton: {
    position: 'relative',
    padding: 8
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4
  },
  badgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 80,
    paddingRight: 12,
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    maxHeight: '70%',
    maxWidth: 360,
    width: '90%',
    paddingBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB'
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937'
  },
  modalHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  marcarTodasButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#EBF5FF',
  },
  marcarTodasText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4A90E2',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center'
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center'
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280'
  },
  notificacionesList: {
    padding: 8
  },
  notificacionItem: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 10,
    marginHorizontal: 8,
    marginVertical: 4,
    alignItems: 'center'
  },
  notificacionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  notificacionContent: {
    flex: 1
  },
  notificacionTitulo: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2
  },
  notificacionMensaje: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4
  },
  notificacionFecha: {
    fontSize: 10,
    color: '#9CA3AF'
  },
  notificacionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    marginLeft: 8
  }
});

export default NotificacionesBadge;
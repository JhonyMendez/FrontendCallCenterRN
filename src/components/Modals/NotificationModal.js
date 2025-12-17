import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';
import {
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const NotificationModal = ({ 
  visible, 
  message, 
  type = 'success', // 'success' o 'error'
  onClose,
  autoClose = true,
  duration = 2000
}) => {
  useEffect(() => {
    if (visible && autoClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [visible, autoClose, duration, onClose]);

  const getConfig = () => {
    if (type === 'error') {
      return {
        icon: 'close-circle',
        iconColor: '#ef4444',
        bgColor: '#fef2f2',
        borderColor: '#ef4444',
      };
    }
    return {
      icon: 'checkmark-circle',
      iconColor: '#10b981',
      bgColor: '#f0fdf4',
      borderColor: '#10b981',
    };
  };

  const config = getConfig();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[
          styles.notificationContainer,
          { 
            backgroundColor: config.bgColor,
            borderColor: config.borderColor
          }
        ]}>
          <Ionicons name={config.icon} size={32} color={config.iconColor} />
          <Text style={styles.message}>{message}</Text>
          
          {!autoClose && (
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color="#6b7280" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 60,
  },
  notificationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    maxWidth: 400,
    minWidth: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
    gap: 12,
  },
  message: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
  },
  closeBtn: {
    padding: 4,
  },
});

export default NotificationModal;
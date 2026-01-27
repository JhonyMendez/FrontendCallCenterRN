// services/notificacionService.js
import { Audio } from 'expo-av';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

/**
 * 🔔 Servicio de Notificaciones con Sonido
 * 
 * Maneja notificaciones push locales y reproduce sonidos
 * cuando llega una nueva conversación escalada
 */

// Configurar comportamiento de notificaciones
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

class NotificacionService {
  constructor() {
    this.soundObject = null;
    this.setupNotifications();
  }

  /**
   * Configurar permisos de notificaciones
   */
  async setupNotifications() {
    try {
      if (Platform.OS !== 'web') {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }

        if (finalStatus !== 'granted') {
          console.warn('⚠️ Permiso de notificaciones denegado');
          return false;
        }

        console.log('✅ Permisos de notificaciones concedidos');
        return true;
      }
    } catch (error) {
      console.error('❌ Error configurando notificaciones:', error);
      return false;
    }
  }

  /**
   * 🔊 Reproducir sonido de notificación
   * @param {string} tipo - Tipo de notificación ('nueva_conversacion', 'mensaje', 'urgente')
   */
  async reproducirSonido(tipo = 'nueva_conversacion') {
    try {
      // Liberar sonido anterior si existe
      if (this.soundObject) {
        await this.soundObject.unloadAsync();
      }

      // Configurar audio
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
      });

      // Cargar y reproducir sonido
      const { sound } = await Audio.Sound.createAsync(
        this.getSonidoPorTipo(tipo),
        { shouldPlay: true, volume: 1.0 }
      );

      this.soundObject = sound;

      // Liberar cuando termine
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          sound.unloadAsync();
        }
      });

      console.log('🔊 Sonido reproducido:', tipo);
    } catch (error) {
      console.error('❌ Error reproduciendo sonido:', error);
    }
  }

  /**
   * Obtener archivo de sonido según tipo
   */
  getSonidoPorTipo(tipo) {
    const sonidos = {
      nueva_conversacion: require('../../assets/sounds/notification.mp3'),
      mensaje: require('../../assets/sounds/message.mp3'),
      urgente: require('../../assets/sounds/urgent.mp3'),
    };

    return sonidos[tipo] || sonidos.nueva_conversacion;
  }

  /**
   * 🔔 Mostrar notificación local con sonido
   * @param {Object} data - Datos de la notificación
   */
  async mostrarNotificacion(data) {
    try {
      const {
        titulo = 'Nueva Notificación',
        mensaje = '',
        tipo = 'nueva_conversacion',
        sessionId = null,
        prioridad = 'normal',
      } = data;

      // Reproducir sonido primero
      await this.reproducirSonido(tipo);

      // Mostrar notificación (solo en móvil)
      if (Platform.OS !== 'web') {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: titulo,
            body: mensaje,
            sound: true,
            priority: prioridad === 'alta' 
              ? Notifications.AndroidNotificationPriority.HIGH 
              : Notifications.AndroidNotificationPriority.DEFAULT,
            data: {
              sessionId,
              tipo,
            },
          },
          trigger: null, // Mostrar inmediatamente
        });
      }

      // En web, mostrar notificación del navegador
      if (Platform.OS === 'web' && 'Notification' in window) {
        if (Notification.permission === 'granted') {
          new Notification(titulo, {
            body: mensaje,
            icon: '/icon.png',
            badge: '/badge.png',
            tag: sessionId || 'notification',
            requireInteraction: prioridad === 'alta',
          });
        } else if (Notification.permission !== 'denied') {
          await Notification.requestPermission();
        }
      }

      console.log('✅ Notificación mostrada:', titulo);
    } catch (error) {
      console.error('❌ Error mostrando notificación:', error);
    }
  }

  /**
   * 🔔 Notificación de Nueva Conversación Escalada
   */
  async notificarNuevaConversacion(sessionId, agentName, tiempoEspera = 0) {
    const prioridad = tiempoEspera > 30 ? 'alta' : 'normal';
    
    await this.mostrarNotificacion({
      titulo: '🔔 Nueva Conversación Escalada',
      mensaje: `Conversación del agente ${agentName}. ${
        tiempoEspera > 0 ? `Esperando ${Math.floor(tiempoEspera)} min` : ''
      }`,
      tipo: prioridad === 'alta' ? 'urgente' : 'nueva_conversacion',
      sessionId,
      prioridad,
    });
  }

  /**
   * 💬 Notificación de Nuevo Mensaje
   */
  async notificarNuevoMensaje(sessionId, nombreUsuario, preview) {
    await this.mostrarNotificacion({
      titulo: `💬 Mensaje de ${nombreUsuario}`,
      mensaje: preview.substring(0, 100),
      tipo: 'mensaje',
      sessionId,
      prioridad: 'normal',
    });
  }

  /**
   * ⚠️ Notificación Urgente
   */
  async notificarUrgente(titulo, mensaje, sessionId = null) {
    await this.mostrarNotificacion({
      titulo: `⚠️ ${titulo}`,
      mensaje,
      tipo: 'urgente',
      sessionId,
      prioridad: 'alta',
    });
  }

  /**
   * 🎵 Solo reproducir sonido (sin notificación)
   */
  async soloSonido(tipo = 'nueva_conversacion') {
    await this.reproducirSonido(tipo);
  }

  /**
   * 🔕 Limpiar recursos
   */
  async cleanup() {
    if (this.soundObject) {
      await this.soundObject.unloadAsync();
      this.soundObject = null;
    }
  }
}

// Exportar instancia única
export const notificacionService = new NotificacionService();

export default notificacionService;
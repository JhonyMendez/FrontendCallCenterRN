// hooks/useNotificaciones.js
import { useEffect, useRef, useState } from 'react';
import { escalamientoService } from '../api/services/escalamientoService';
import notificacionService from '../api/services/notificacionService'; // 🔥 NUEVO

/**
 * 🔔 Hook personalizado para manejar notificaciones
 * 
 * Verifica nuevas conversaciones cada cierto tiempo
 * y muestra notificaciones con sonido
 * 
 * @param {number} userId - ID del funcionario
 * @param {boolean} activo - Si está activo el polling
 * @param {number} intervalo - Intervalo de verificación en ms (default: 15000)
 * 
 * @example
 * const { notificacionesPendientes, marcarVistas } = useNotificaciones(userId, true);
 */
export const useNotificaciones = (userId, activo = true, intervalo = 15000) => {
  const [notificacionesPendientes, setNotificacionesPendientes] = useState(0);
  const [conversacionesVistas, setConversacionesVistas] = useState(new Set());
  const intervalRef = useRef(null);
  const ultimaVerificacion = useRef(null);

  useEffect(() => {
    if (!userId || !activo) return;

    // Verificar inmediatamente
    verificarNuevasConversaciones();

    // Configurar intervalo
    intervalRef.current = setInterval(() => {
      verificarNuevasConversaciones();
    }, intervalo);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [userId, activo, intervalo]);

  /**
   * Verificar si hay nuevas conversaciones escaladas
   */
  const verificarNuevasConversaciones = async () => {
    try {
      const response = await escalamientoService.getMisConversaciones(userId, {
        solo_activas: true,
        limite: 50,
      });

      if (response.success && response.conversaciones) {
        const conversaciones = response.conversaciones;
        
        // Filtrar conversaciones nuevas (no vistas)
        const nuevas = conversaciones.filter(
          (conv) => !conversacionesVistas.has(conv.session_id)
        );

        if (nuevas.length > 0) {
          console.log(`🔔 ${nuevas.length} conversación(es) nueva(s) detectada(s)`);

          // Notificar cada conversación nueva
          for (const conv of nuevas) {
            await notificarConversacion(conv);
            
            // Marcar como vista
            setConversacionesVistas((prev) => new Set([...prev, conv.session_id]));
          }

          // Actualizar contador
          setNotificacionesPendientes((prev) => prev + nuevas.length);
        }

        ultimaVerificacion.current = new Date();
      }
    } catch (error) {
      console.error('❌ Error verificando notificaciones:', error);
    }
  };

  /**
   * Notificar una conversación específica
   */
  const notificarConversacion = async (conversacion) => {
    const {
      agent_name,
      tiempo_espera_minutos,
      session_id,
      prioridad,
    } = conversacion;

    // Determinar tipo de notificación
    const esUrgente = prioridad === 'alta' || tiempo_espera_minutos > 30;

    if (esUrgente) {
      await notificacionService.notificarUrgente(
        'Conversación Urgente',
        `${agent_name} - Esperando ${Math.floor(tiempo_espera_minutos)} minutos`,
        session_id
      );
    } else {
      await notificacionService.notificarNuevaConversacion(
        session_id,
        agent_name,
        tiempo_espera_minutos
      );
    }
  };

  /**
   * Marcar conversaciones como vistas (resetear contador)
   */
  const marcarVistas = () => {
    setNotificacionesPendientes(0);
  };

  /**
   * Marcar una conversación específica como vista
   */
  const marcarConversacionVista = (sessionId) => {
    setConversacionesVistas((prev) => new Set([...prev, sessionId]));
  };

  /**
   * Forzar verificación manual
   */
  const verificarAhora = () => {
    verificarNuevasConversaciones();
  };

  /**
   * Limpiar historial de conversaciones vistas
   */
  const limpiarHistorial = () => {
    setConversacionesVistas(new Set());
    setNotificacionesPendientes(0);
  };

  return {
    notificacionesPendientes,
    marcarVistas,
    marcarConversacionVista,
    verificarAhora,
    limpiarHistorial,
    ultimaVerificacion: ultimaVerificacion.current,
  };
};

export default useNotificaciones;
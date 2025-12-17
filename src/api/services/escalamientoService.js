import { apiClient } from '../client';
import { ENDPOINTS } from '../config';

export const escalamientoService = {
  // Listar conversaciones escaladas (dashboard humano)
  getAllEscaladas: async (params = {}) => {
    const query = new URLSearchParams();

    if (params.solo_pendientes !== undefined) query.append('solo_pendientes', params.solo_pendientes);
    if (params.id_departamento !== undefined && params.id_departamento !== null) query.append('id_departamento', params.id_departamento);

    const qs = query.toString();
    const endpoint = qs
      ? `${ENDPOINTS.ESCALAMIENTO.CONVERSACIONES_ESCALADAS}?${qs}`
      : ENDPOINTS.ESCALAMIENTO.CONVERSACIONES_ESCALADAS;

    return await apiClient.get(endpoint);
  },

  // Detalle conversación por session_id
  getDetalle: async (sessionId) => {
    return await apiClient.get(ENDPOINTS.ESCALAMIENTO.CONVERSACION_DETALLE(sessionId));
  },

  // Responder como humano
  responder: async (sessionId, data) => {
    // data: { mensaje, id_usuario, nombre_usuario }
    return await apiClient.post(ENDPOINTS.ESCALAMIENTO.RESPONDER(sessionId), data);
  },

  // Marcar como resuelta
  resolver: async (sessionId, data = {}) => {
    // data: { calificacion?: 1-5, comentario?: string }
    return await apiClient.post(ENDPOINTS.ESCALAMIENTO.RESOLVER(sessionId), data);
  },

  // Notificaciones del usuario actual
  getMisNotificaciones: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.solo_no_leidas !== undefined) query.append('solo_no_leidas', params.solo_no_leidas);
    if (params.limit !== undefined) query.append('limit', params.limit);

    const qs = query.toString();
    const endpoint = qs
      ? `${ENDPOINTS.ESCALAMIENTO.MIS_NOTIFICACIONES}?${qs}`
      : ENDPOINTS.ESCALAMIENTO.MIS_NOTIFICACIONES;

    return await apiClient.get(endpoint);
  },

  // Marcar notificación leída
  marcarLeida: async (idNotificacion) => {
    return await apiClient.post(ENDPOINTS.ESCALAMIENTO.MARCAR_LEIDA(idNotificacion));
  },
};

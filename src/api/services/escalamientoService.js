// services/escalamientoService.js
import { apiClient } from '../client';
import { ENDPOINTS } from '../config';

export const escalamientoService = {
  // ============================================
  // LISTAR CONVERSACIONES
  // ============================================
  
  /**
   * Listar TODAS las conversaciones escaladas del departamento
   * @param {Object} params - Parámetros de filtrado
   * @param {boolean} params.solo_pendientes - Solo conversaciones pendientes
   * @param {number} params.id_departamento - Filtrar por departamento
   * @param {string} params.estado - Filtrar por estado específico
   * @param {number} params.limite - Número máximo de resultados
   */
  getAllEscaladas: async (params = {}) => {
    const query = new URLSearchParams();

    if (params.solo_pendientes !== undefined) {
      query.append('solo_pendientes', params.solo_pendientes);
    }
    if (params.id_departamento !== undefined && params.id_departamento !== null) {
      query.append('id_departamento', params.id_departamento);
    }
    if (params.estado !== undefined && params.estado !== null) {
      query.append('estado', params.estado);
    }
    if (params.limite !== undefined) {
      query.append('limite', params.limite);
    }

    const qs = query.toString();
    const endpoint = qs
      ? `${ENDPOINTS.ESCALAMIENTO.CONVERSACIONES_ESCALADAS}?${qs}`
      : ENDPOINTS.ESCALAMIENTO.CONVERSACIONES_ESCALADAS;

    return await apiClient.get(endpoint);
  },

  /**
   * 🔥 NUEVO: Listar conversaciones asignadas a UN funcionario específico
   * @param {number} idUsuario - ID del funcionario
   * @param {Object} params - Parámetros adicionales
   * @param {boolean} params.solo_activas - Solo conversaciones activas/escaladas
   * @param {number} params.limite - Número máximo de resultados
   */
  getMisConversaciones: async (idUsuario, params = {}) => {
    const query = new URLSearchParams();
    query.append('id_usuario', idUsuario);

    if (params.solo_activas !== undefined) {
      query.append('solo_activas', params.solo_activas);
    }
    if (params.limite !== undefined) {
      query.append('limite', params.limite);
    }

    const endpoint = `${ENDPOINTS.ESCALAMIENTO.MIS_CONVERSACIONES}?${query.toString()}`;
    return await apiClient.get(endpoint);
  },

  // ============================================
  // DETALLES Y ACCIONES DE CONVERSACIÓN
  // ============================================

  /**
   * Obtener detalle completo de una conversación
   * @param {string} sessionId - ID de la sesión
   */
  getDetalle: async (sessionId) => {
    return await apiClient.get(ENDPOINTS.ESCALAMIENTO.CONVERSACION_DETALLE(sessionId));
  },

  /**
   * 🔥 NUEVO: Funcionario "toma" una conversación sin asignar
   * @param {string} sessionId - ID de la sesión
   * @param {Object} data - Datos del funcionario
   * @param {number} data.id_usuario - ID del funcionario
   * @param {string} data.nombre_usuario - Nombre del funcionario
   */
  tomarConversacion: async (sessionId, data) => {
    return await apiClient.post(
      ENDPOINTS.ESCALAMIENTO.TOMAR_CONVERSACION(sessionId),
      data
    );
  },

  /**
   * Responder como humano a una conversación
   * @param {string} sessionId - ID de la sesión
   * @param {Object} data - Datos de la respuesta
   * @param {string} data.mensaje - Contenido del mensaje
   * @param {number} data.id_usuario - ID del funcionario
   * @param {string} data.nombre_usuario - Nombre del funcionario
   */
  responder: async (sessionId, data) => {
    return await apiClient.post(ENDPOINTS.ESCALAMIENTO.RESPONDER(sessionId), data);
  },

  /**
   * 🔥 NUEVO: Transferir conversación a otro funcionario
   * @param {string} sessionId - ID de la sesión
   * @param {Object} data - Datos de la transferencia
   * @param {number} data.id_usuario_destino - ID del funcionario destino
   * @param {string} data.motivo - Motivo de la transferencia
   */
  transferirConversacion: async (sessionId, data) => {
    return await apiClient.post(
      ENDPOINTS.ESCALAMIENTO.TRANSFERIR_CONVERSACION(sessionId),
      data
    );
  },

  /**
   * Marcar conversación como resuelta
   * @param {string} sessionId - ID de la sesión
   * @param {Object} data - Datos de resolución
   * @param {number} data.calificacion - Calificación 1-5 (opcional)
   * @param {string} data.comentario - Comentario adicional (opcional)
   * @param {number} data.tiempo_resolucion_minutos - Tiempo de resolución (opcional)
   */
  resolver: async (sessionId, data = {}) => {
    return await apiClient.post(ENDPOINTS.ESCALAMIENTO.RESOLVER(sessionId), data);
  },

  // ============================================
  // ESTADÍSTICAS
  // ============================================

  /**
   * 🔥 NUEVO: Obtener estadísticas generales de escalamiento
   * @param {Object} params - Parámetros
   * @param {number} params.id_departamento - Filtrar por departamento (opcional)
   * @param {number} params.dias - Últimos N días (default: 7)
   */
  getEstadisticas: async (params = {}) => {
    const query = new URLSearchParams();

    if (params.id_departamento !== undefined && params.id_departamento !== null) {
      query.append('id_departamento', params.id_departamento);
    }
    if (params.dias !== undefined) {
      query.append('dias', params.dias);
    }

    const endpoint = `${ENDPOINTS.ESCALAMIENTO.ESTADISTICAS}?${query.toString()}`;
    return await apiClient.get(endpoint);
  },

  /**
   * 🔥 NUEVO: Obtener estadísticas personales de un funcionario
   * @param {number} idUsuario - ID del funcionario
   * @param {Object} params - Parámetros adicionales
   * @param {number} params.dias - Últimos N días (default: 7)
   */
  getMisEstadisticas: async (idUsuario, params = {}) => {
    const query = new URLSearchParams();
    query.append('id_usuario', idUsuario);

    if (params.dias !== undefined) {
      query.append('dias', params.dias);
    }

    const endpoint = `${ENDPOINTS.ESCALAMIENTO.MIS_ESTADISTICAS}?${query.toString()}`;
    return await apiClient.get(endpoint);
  },

  // ============================================
  // NOTIFICACIONES
  // ============================================

  /**
   * Obtener notificaciones del funcionario
   * @param {number} idUsuario - ID del funcionario
   * @param {Object} params - Parámetros
   * @param {boolean} params.solo_no_leidas - Solo no leídas (default: true)
   * @param {number} params.limite - Número máximo (default: 20)
   */
  getMisNotificaciones: async (idUsuario, params = {}) => {
    const query = new URLSearchParams();
    query.append('id_usuario', idUsuario);

    if (params.solo_no_leidas !== undefined) {
      query.append('solo_no_leidas', params.solo_no_leidas);
    }
    if (params.limite !== undefined) {
      query.append('limite', params.limite);
    }

    const endpoint = `${ENDPOINTS.ESCALAMIENTO.MIS_NOTIFICACIONES}?${query.toString()}`;
    return await apiClient.get(endpoint);
  },

  /**
   * Marcar una notificación como leída
   * @param {number} idNotificacion - ID de la notificación
   */
  marcarLeida: async (idNotificacion) => {
    return await apiClient.post(ENDPOINTS.ESCALAMIENTO.MARCAR_LEIDA(idNotificacion));
  },

  /**
   * 🔥 NUEVO: Marcar todas las notificaciones como leídas
   * @param {number} idUsuario - ID del funcionario
   */
  marcarTodasLeidas: async (idUsuario) => {
    const query = new URLSearchParams();
    query.append('id_usuario', idUsuario);

    const endpoint = `${ENDPOINTS.ESCALAMIENTO.MARCAR_TODAS_LEIDAS}?${query.toString()}`;
    return await apiClient.post(endpoint);
  },

  // ============================================
  // UTILIDADES
  // ============================================

  /**
   * 🔥 NUEVO: Obtener lista de funcionarios disponibles para transferencia
   * @param {Object} params - Parámetros
   * @param {number} params.id_departamento - Filtrar por departamento (opcional)
   */
  getFuncionariosDisponibles: async (params = {}) => {
    const query = new URLSearchParams();

    if (params.id_departamento !== undefined && params.id_departamento !== null) {
      query.append('id_departamento', params.id_departamento);
    }

    const endpoint = `${ENDPOINTS.ESCALAMIENTO.FUNCIONARIOS_DISPONIBLES}?${query.toString()}`;
    return await apiClient.get(endpoint);
  },

  // ============================================
  // MÉTODOS DE AYUDA (HELPERS)
  // ============================================

  /**
   * Calcular prioridad de conversación basada en tiempo de espera
   * @param {number} tiempoEsperaMinutos - Tiempo en minutos
   * @returns {string} 'alta', 'media', 'normal'
   */
  calcularPrioridad: (tiempoEsperaMinutos) => {
    if (!tiempoEsperaMinutos) return 'normal';
    if (tiempoEsperaMinutos > 60) return 'alta';
    if (tiempoEsperaMinutos > 30) return 'media';
    return 'normal';
  },

  /**
   * Formatear tiempo de espera
   * @param {number} minutos - Tiempo en minutos
   * @returns {string} Tiempo formateado
   */
  formatearTiempoEspera: (minutos) => {
    if (!minutos) return 'Reciente';
    if (minutos < 1) return 'Menos de 1 min';
    if (minutos < 60) return `${Math.floor(minutos)} min`;
    const horas = Math.floor(minutos / 60);
    const mins = Math.floor(minutos % 60);
    return mins > 0 ? `${horas}h ${mins}min` : `${horas}h`;
  },

  /**
   * Obtener color de prioridad para UI
   * @param {string} prioridad - 'alta', 'media', 'normal'
   * @returns {string} Color hex
   */
  getColorPrioridad: (prioridad) => {
    const colores = {
      alta: '#ef4444',    // Rojo
      media: '#f59e0b',   // Naranja
      normal: '#10b981',  // Verde
    };
    return colores[prioridad] || colores.normal;
  },

  /**
   * Validar si un funcionario puede tomar una conversación
   * @param {Object} conversacion - Objeto de conversación
   * @param {number} idUsuario - ID del funcionario
   * @returns {boolean} true si puede tomar
   */
  puedeTomar: (conversacion, idUsuario) => {
    // No puede tomar si ya está asignada
    if (conversacion.escalado_a_usuario_id) {
      return false;
    }
    // No puede tomar si está finalizada
    if (conversacion.estado === 'finalizada') {
      return false;
    }
    return true;
  },

  /**
   * Validar si un funcionario puede transferir una conversación
   * @param {Object} conversacion - Objeto de conversación
   * @param {number} idUsuario - ID del funcionario
   * @returns {boolean} true si puede transferir
   */
  puedeTransferir: (conversacion, idUsuario) => {
    // Solo puede transferir si está asignada a él
    if (conversacion.escalado_a_usuario_id !== idUsuario) {
      return false;
    }
    // No puede transferir si está finalizada
    if (conversacion.estado === 'finalizada') {
      return false;
    }
    return true;
  },

  /**
   * Filtrar conversaciones por búsqueda
   * @param {Array} conversaciones - Lista de conversaciones
   * @param {string} searchTerm - Término de búsqueda
   * @returns {Array} Conversaciones filtradas
   */
  filtrarConversaciones: (conversaciones, searchTerm) => {
    if (!searchTerm || searchTerm.trim() === '') {
      return conversaciones;
    }

    const term = searchTerm.toLowerCase();
    
    return conversaciones.filter(conv => {
      return (
        conv.agent_name?.toLowerCase().includes(term) ||
        conv.session_id?.toLowerCase().includes(term) ||
        conv.ultimo_mensaje?.toLowerCase().includes(term) ||
        conv.escalado_a_usuario_nombre?.toLowerCase().includes(term)
      );
    });
  },

  /**
   * Ordenar conversaciones por prioridad
   * @param {Array} conversaciones - Lista de conversaciones
   * @returns {Array} Conversaciones ordenadas
   */
  ordenarPorPrioridad: (conversaciones) => {
    const prioridadOrden = { alta: 0, media: 1, normal: 2 };
    
    return [...conversaciones].sort((a, b) => {
      const prioA = prioridadOrden[a.prioridad] ?? 3;
      const prioB = prioridadOrden[b.prioridad] ?? 3;
      
      if (prioA !== prioB) {
        return prioA - prioB;
      }
      
      // Si tienen misma prioridad, ordenar por tiempo de espera (descendente)
      return (b.tiempo_espera_minutos || 0) - (a.tiempo_espera_minutos || 0);
    });
  },
};

export default escalamientoService;
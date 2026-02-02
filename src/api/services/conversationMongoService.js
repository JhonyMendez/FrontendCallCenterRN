// src/api/services/conversationMongoService.js
import { apiClient } from '../client';
import { ENDPOINTS } from '../config';

export const conversationMongoService = {
  // ==================== CRUD BÁSICO ====================

  /**
   * Crear nueva conversación
   * @param {Object} conversationData - Datos de la conversación
   * @returns {Promise<Object>} Conversación creada
   */
  create: async (conversationData) => {
    try {
      console.log('📤 [conversationMongoService] Creando conversación:', conversationData);
      const response = await apiClient.post(
        ENDPOINTS.CONVERSACIONES_MONGO.BASE,
        conversationData
      );
      console.log('✅ [conversationMongoService] Conversación creada:', response);
      return response;
    } catch (error) {
      console.error('❌ [conversationMongoService] Error creando conversación:', error);
      throw new Error(
        error.data?.detail || 
        error.message || 
        'Error al crear conversación'
      );
    }
  },

  /**
   * Obtener conversación por session_id
   * @param {string} sessionId - ID de la sesión
   * @returns {Promise<Object>} Conversación encontrada
   */
  getBySessionId: async (sessionId) => {
    try {
      console.log('📤 [conversationMongoService] Obteniendo conversación:', sessionId);
      const response = await apiClient.get(
        ENDPOINTS.CONVERSACIONES_MONGO.BY_SESSION_ID(sessionId)
      );
      console.log('✅ [conversationMongoService] Conversación obtenida:', response);
      return response;
    } catch (error) {
      console.error('❌ [conversationMongoService] Error obteniendo conversación:', error);
      throw new Error(
        error.data?.detail || 
        error.message || 
        'Error al obtener conversación'
      );
    }
  },

  /**
   * Actualizar conversación
   * @param {string} sessionId - ID de la sesión
   * @param {Object} updateData - Datos a actualizar
   * @returns {Promise<Object>} Conversación actualizada
   */
  update: async (sessionId, updateData) => {
    try {
      console.log('📤 [conversationMongoService] Actualizando conversación:', sessionId, updateData);
      const response = await apiClient.patch(
        ENDPOINTS.CONVERSACIONES_MONGO.BY_SESSION_ID(sessionId),
        updateData
      );
      console.log('✅ [conversationMongoService] Conversación actualizada:', response);
      return response;
    } catch (error) {
      console.error('❌ [conversationMongoService] Error actualizando conversación:', error);
      throw new Error(
        error.data?.detail || 
        error.message || 
        'Error al actualizar conversación'
      );
    }
  },

  /**
   * Eliminar conversación
   * @param {string} sessionId - ID de la sesión
   * @returns {Promise<boolean>} True si se eliminó correctamente
   */
  delete: async (sessionId) => {
    try {
      console.log('📤 [conversationMongoService] Eliminando conversación:', sessionId);
      await apiClient.delete(ENDPOINTS.CONVERSACIONES_MONGO.BY_SESSION_ID(sessionId));
      console.log('✅ [conversationMongoService] Conversación eliminada');
      return true;
    } catch (error) {
      console.error('❌ [conversationMongoService] Error eliminando conversación:', error);
      throw new Error(
        error.data?.detail || 
        error.message || 
        'Error al eliminar conversación'
      );
    }
  },

  // ==================== MENSAJES ====================

  /**
   * Agregar mensaje a conversación
   * @param {string} sessionId - ID de la sesión
   * @param {Object} messageData - Datos del mensaje
   * @returns {Promise<Object>} Conversación actualizada
   */
  addMessage: async (sessionId, messageData) => {
    try {
      console.log('📤 [conversationMongoService] Agregando mensaje:', sessionId, messageData);
      const response = await apiClient.post(
        ENDPOINTS.CONVERSACIONES_MONGO.ADD_MESSAGE(sessionId),
        messageData
      );
      console.log('✅ [conversationMongoService] Mensaje agregado:', response);
      return response;
    } catch (error) {
      console.error('❌ [conversationMongoService] Error agregando mensaje:', error);
      throw new Error(
        error.data?.detail || 
        error.message || 
        'Error al agregar mensaje'
      );
    }
  },

  /**
   * Obtener solo mensajes de una conversación
   * @param {string} sessionId - ID de la sesión
   * @param {Object} params - Parámetros de filtro
   * @returns {Promise<Object>} Lista de mensajes
   */
  getMessages: async (sessionId, params = {}) => {
    try {
      console.log('📤 [conversationMongoService] Obteniendo mensajes:', sessionId, params);
      
      const query = new URLSearchParams();
      if (params.role) query.append('role', params.role);
      if (params.limit) query.append('limit', params.limit);
      
      const queryString = query.toString();
      const endpoint = queryString
        ? `${ENDPOINTS.CONVERSACIONES_MONGO.GET_MESSAGES(sessionId)}?${queryString}`
        : ENDPOINTS.CONVERSACIONES_MONGO.GET_MESSAGES(sessionId);
      
      const response = await apiClient.get(endpoint);
      console.log('✅ [conversationMongoService] Mensajes obtenidos:', response);
      return response;
    } catch (error) {
      console.error('❌ [conversationMongoService] Error obteniendo mensajes:', error);
      throw new Error(
        error.data?.detail || 
        error.message || 
        'Error al obtener mensajes'
      );
    }
  },

  // ==================== LISTADO Y FILTROS ====================

  /**
   * Listar conversaciones con filtros
   * @param {Object} params - Parámetros de filtro y paginación
   * @returns {Promise<Object>} Lista paginada de conversaciones
   */
  getAll: async (params = {}) => {
    try {
      console.log('📤 [conversationMongoService] Listando conversaciones con params:', params);
      
      const query = new URLSearchParams();
      
      // Filtros básicos
      if (params.id_agente !== undefined) query.append('id_agente', params.id_agente);
      if (params.estado) query.append('estado', params.estado);
      if (params.origin) query.append('origin', params.origin);
      if (params.escaladas !== undefined) query.append('escaladas', params.escaladas);
      
      // 🔥 NUEVOS FILTROS
      if (params.id_visitante !== undefined) query.append('id_visitante', params.id_visitante);
      if (params.user_id !== undefined) query.append('user_id', params.user_id);
      if (params.fecha_inicio) query.append('fecha_inicio', params.fecha_inicio);
      if (params.fecha_fin) query.append('fecha_fin', params.fecha_fin);
      if (params.calificacion_min !== undefined) query.append('calificacion_min', params.calificacion_min);
      if (params.calificacion_max !== undefined) query.append('calificacion_max', params.calificacion_max);
      
      // Paginación y ordenamiento
      if (params.page !== undefined) query.append('page', params.page);
      if (params.page_size !== undefined) query.append('page_size', params.page_size);
      if (params.sort_by) query.append('sort_by', params.sort_by);
      if (params.sort_order) query.append('sort_order', params.sort_order);
      
      const queryString = query.toString();
      const endpoint = queryString
        ? `${ENDPOINTS.CONVERSACIONES_MONGO.BASE}?${queryString}`
        : ENDPOINTS.CONVERSACIONES_MONGO.BASE;
      
      console.log('🌐 [conversationMongoService] Endpoint:', endpoint);
      
      const response = await apiClient.get(endpoint);
      console.log('✅ [conversationMongoService] Conversaciones obtenidas:', response);
      return response;
    } catch (error) {
      console.error('❌ [conversationMongoService] Error listando conversaciones:', error);
      throw new Error(
        error.data?.detail || 
        error.message || 
        'Error al listar conversaciones'
      );
    }
  },

  /**
   * Alias de getAll para compatibilidad
   */
  listarConversaciones: async (params = {}) => {
    return await conversationMongoService.getAll(params);
  },

  // ==================== ESTADÍSTICAS ====================

  /**
   * Obtener estadísticas generales
   * @param {number} idAgente - ID del agente (opcional)
   * @param {Object} params - Parámetros adicionales de filtro (opcional)
   * @returns {Promise<Object>} Estadísticas de conversaciones
   */
  getStats: async (idAgente = null, params = {}) => {
    try {
      console.log('📤 [conversationMongoService] Obteniendo estadísticas, agente:', idAgente, 'params:', params);
      
      const query = new URLSearchParams();
      
      if (idAgente) query.append('id_agente', idAgente);
      
      // 🔥 NUEVOS FILTROS PARA ESTADÍSTICAS
      if (params.fecha_inicio) query.append('fecha_inicio', params.fecha_inicio);
      if (params.fecha_fin) query.append('fecha_fin', params.fecha_fin);
      if (params.origin) query.append('origin', params.origin);
      
      const queryString = query.toString();
      const endpoint = queryString
        ? `${ENDPOINTS.CONVERSACIONES_MONGO.STATS_OVERVIEW}?${queryString}`
        : ENDPOINTS.CONVERSACIONES_MONGO.STATS_OVERVIEW;
      
      const response = await apiClient.get(endpoint);
      console.log('✅ [conversationMongoService] Estadísticas obtenidas:', response);
      return response;
    } catch (error) {
      console.error('❌ [conversationMongoService] Error obteniendo estadísticas:', error);
      throw new Error(
        error.data?.detail || 
        error.message || 
        'Error al obtener estadísticas'
      );
    }
  },

  /**
   * Obtener estadísticas de un agente específico
   * @param {number} idAgente - ID del agente
   * @returns {Promise<Object>} Estadísticas del agente
   */
  getAgentStats: async (idAgente) => {
    try {
      console.log('📤 [conversationMongoService] Obteniendo estadísticas del agente:', idAgente);
      const response = await apiClient.get(
        ENDPOINTS.CONVERSACIONES_MONGO.STATS_AGENT(idAgente)
      );
      console.log('✅ [conversationMongoService] Estadísticas del agente obtenidas:', response);
      return response;
    } catch (error) {
      console.error('❌ [conversationMongoService] Error obteniendo estadísticas del agente:', error);
      throw new Error(
        error.data?.detail || 
        error.message || 
        'Error al obtener estadísticas del agente'
      );
    }
  },

  // ==================== GESTIÓN DE ESTADOS ====================

  /**
   * Finalizar conversación
   * @param {string} sessionId - ID de la sesión
   * @param {Object} data - Datos de finalización (calificación, comentario)
   * @returns {Promise<Object>} Conversación finalizada
   */
  finalize: async (sessionId, data = {}) => {
    try {
      console.log('📤 [conversationMongoService] Finalizando conversación:', sessionId, data);
      const response = await apiClient.post(
        ENDPOINTS.CONVERSACIONES_MONGO.FINALIZE(sessionId),
        data
      );
      console.log('✅ [conversationMongoService] Conversación finalizada:', response);
      return response;
    } catch (error) {
      console.error('❌ [conversationMongoService] Error finalizando conversación:', error);
      throw new Error(
        error.data?.detail || 
        error.message || 
        'Error al finalizar conversación'
      );
    }
  },

  /**
   * Escalar conversación a atención humana
   * @param {string} sessionId - ID de la sesión
   * @param {Object} data - Datos del agente humano
   * @returns {Promise<Object>} Conversación escalada
   */
  escalate: async (sessionId, data) => {
    try {
      console.log('📤 [conversationMongoService] Escalando conversación:', sessionId, data);
      const response = await apiClient.post(
        ENDPOINTS.CONVERSACIONES_MONGO.ESCALATE(sessionId),
        data
      );
      console.log('✅ [conversationMongoService] Conversación escalada:', response);
      return response;
    } catch (error) {
      console.error('❌ [conversationMongoService] Error escalando conversación:', error);
      throw new Error(
        error.data?.detail || 
        error.message || 
        'Error al escalar conversación'
      );
    }
  },

  /**
   * Calificar conversación
   * @param {string} sessionId - ID de la sesión
   * @param {Object} data - Calificación y comentario
   * @returns {Promise<Object>} Conversación calificada
   */
  rate: async (sessionId, data) => {
    try {
      console.log('📤 [conversationMongoService] Calificando conversación:', sessionId, data);
      const response = await apiClient.post(
        ENDPOINTS.CONVERSACIONES_MONGO.RATING(sessionId),
        data
      );
      console.log('✅ [conversationMongoService] Conversación calificada:', response);
      return response;
    } catch (error) {
      console.error('❌ [conversationMongoService] Error calificando conversación:', error);
      throw new Error(
        error.data?.detail || 
        error.message || 
        'Error al calificar conversación'
      );
    }
  },

  // ==================== UTILIDADES ====================

  /**
   * Obtener conversaciones inactivas
   * @param {Object} params - Parámetros de inactividad
   * @returns {Promise<Object>} Lista de conversaciones inactivas
   */
  getInactive: async (params = {}) => {
    try {
      console.log('📤 [conversationMongoService] Obteniendo conversaciones inactivas:', params);
      
      const query = new URLSearchParams();
      if (params.minutos_inactividad !== undefined) {
        query.append('minutos_inactividad', params.minutos_inactividad);
      }
      if (params.estados) {
        query.append('estados', params.estados);
      }
      
      const queryString = query.toString();
      const endpoint = queryString
        ? `${ENDPOINTS.CONVERSACIONES_MONGO.INACTIVE}?${queryString}`
        : ENDPOINTS.CONVERSACIONES_MONGO.INACTIVE;
      
      const response = await apiClient.get(endpoint);
      console.log('✅ [conversationMongoService] Conversaciones inactivas obtenidas:', response);
      return response;
    } catch (error) {
      console.error('❌ [conversationMongoService] Error obteniendo conversaciones inactivas:', error);
      throw new Error(
        error.data?.detail || 
        error.message || 
        'Error al obtener conversaciones inactivas'
      );
    }
  },

  /**
   * 🔥 Obtener conversación activa o crear nueva
   * Endpoint inteligente que gestiona sesiones automáticamente
   * @param {Object} params - Parámetros de la conversación
   * @returns {Promise<Object>} Conversación activa o nueva
   */
  obtainOrCreate: async (params) => {
    try {
      console.log('📤 [conversationMongoService] Obteniendo o creando conversación:', params);
      
      const query = new URLSearchParams();
      query.append('session_id', params.session_id);
      query.append('id_agente', params.id_agente);
      query.append('agent_name', params.agent_name);
      
      if (params.agent_type) query.append('agent_type', params.agent_type);
      if (params.id_visitante !== undefined) query.append('id_visitante', params.id_visitante);
      if (params.origin) query.append('origin', params.origin);
      if (params.ip_origen) query.append('ip_origen', params.ip_origen);
      if (params.user_agent) query.append('user_agent', params.user_agent);
      
      const endpoint = `${ENDPOINTS.CONVERSACIONES_MONGO.OBTAIN_OR_CREATE}?${query.toString()}`;
      
      const response = await apiClient.post(endpoint);
      console.log('✅ [conversationMongoService] Conversación obtenida/creada:', response);
      return response;
    } catch (error) {
      console.error('❌ [conversationMongoService] Error en obtainOrCreate:', error);
      throw new Error(
        error.data?.detail || 
        error.message || 
        'Error al obtener o crear conversación'
      );
    }
  },

  // ==================== MÉTODOS DE CONVENIENCIA ====================

  /**
   * Crear conversación con mensaje inicial
   * @param {Object} conversationData - Datos de la conversación
   * @param {Object} initialMessage - Mensaje inicial
   * @returns {Promise<Object>} Conversación con mensaje
   */
  createWithMessage: async (conversationData, initialMessage) => {
    try {
      console.log('📤 [conversationMongoService] Creando conversación con mensaje inicial');
      
      // Crear conversación
      const conversation = await conversationMongoService.create(conversationData);
      
      // Agregar mensaje inicial
      const updatedConversation = await conversationMongoService.addMessage(
        conversation.session_id,
        initialMessage
      );
      
      console.log('✅ [conversationMongoService] Conversación creada con mensaje');
      return updatedConversation;
    } catch (error) {
      console.error('❌ [conversationMongoService] Error creando conversación con mensaje:', error);
      throw error;
    }
  },

  /**
   * Verificar si una conversación está activa
   * @param {string} sessionId - ID de la sesión
   * @returns {Promise<boolean>} True si está activa
   */
  isActive: async (sessionId) => {
    try {
      const conversation = await conversationMongoService.getBySessionId(sessionId);
      return conversation?.metadata?.estado === 'activa';
    } catch (error) {
      console.error('❌ [conversationMongoService] Error verificando estado:', error);
      return false;
    }
  },

  /**
   * Obtener historial completo de mensajes formateado
   * @param {string} sessionId - ID de la sesión
   * @returns {Promise<Array>} Array de mensajes formateados
   */
  getFormattedHistory: async (sessionId) => {
    try {
      const response = await conversationMongoService.getMessages(sessionId);
      return response.messages || [];
    } catch (error) {
      console.error('❌ [conversationMongoService] Error obteniendo historial:', error);
      return [];
    }
  },

  /**
   * 🔥 NUEVO: Exportar conversaciones a Excel
   * @param {Object} params - Parámetros de filtro para exportación
   * @returns {Promise<Blob>} Archivo Excel
   */
  exportToExcel: async (params = {}) => {
    try {
      console.log('📤 [conversationMongoService] Exportando a Excel con params:', params);
      
      const query = new URLSearchParams();
      
      // 🔥 FIJO: Asegurar que id_agente se pase como número
      if (params.id_agente !== undefined && params.id_agente !== null) {
        const idAgente = Number(params.id_agente);
        if (!isNaN(idAgente)) {
          query.append('id_agente', idAgente);
          console.log('✅ ID Agente agregado:', idAgente);
        }
      }
      if (params.estado !== undefined && params.estado !== null && params.estado !== 'ALL') {
        query.append('estado', params.estado);
        console.log('✅ Estado agregado:', params.estado);
      }
      if (params.origin !== undefined && params.origin !== null && params.origin !== 'ALL') {
        query.append('origin', params.origin);
        console.log('✅ Origen agregado:', params.origin);
      }
      if (params.escaladas !== undefined && params.escaladas !== null) {
        query.append('escaladas', params.escaladas);
        console.log('✅ Escaladas agregado:', params.escaladas);
      }

      // Filtros adicionales
      if (params.id_visitante !== undefined && params.id_visitante !== null) {
        query.append('id_visitante', params.id_visitante);
      }
      if (params.user_id !== undefined && params.user_id !== null) {
        query.append('user_id', params.user_id);
      }
      if (params.fecha_inicio !== undefined && params.fecha_inicio !== null) {
        query.append('fecha_inicio', params.fecha_inicio);
      }
      if (params.fecha_fin !== undefined && params.fecha_fin !== null) {
        query.append('fecha_fin', params.fecha_fin);
      }
      if (params.calificacion_min !== undefined && params.calificacion_min !== null) {
        query.append('calificacion_min', params.calificacion_min);
      }
      if (params.calificacion_max !== undefined && params.calificacion_max !== null) {
        query.append('calificacion_max', params.calificacion_max);
      }

      // Opción de incluir visitante (siempre incluir porque tiene default true)
      if (params.incluir_visitante !== undefined && params.incluir_visitante !== null) {
        query.append('incluir_visitante', params.incluir_visitante);
      }
      
      // 🔥 NUEVO: Solo datos del visitante
      if (params.solo_visitante !== undefined && params.solo_visitante !== null && params.solo_visitante === true) {
        query.append('solo_visitante', true);
        console.log('👤 Solo visitante agregado: true');
      }
            
      const queryString = query.toString();
      const endpoint = queryString
        ? `${ENDPOINTS.CONVERSACIONES_MONGO.EXPORT_EXCEL}?${queryString}`
        : ENDPOINTS.CONVERSACIONES_MONGO.EXPORT_EXCEL;
      
      console.log('🌐 [conversationMongoService] QueryString:', queryString);
      console.log('🌐 [conversationMongoService] Endpoint:', endpoint);
      
      // Para descarga de archivos, no usar apiClient.get
      // Usar fetch directamente para manejar el blob
      const token = await apiClient.getToken();

      const fullUrl = `${apiClient.baseURL}${endpoint}`;
      console.log('🌐 [conversationMongoService] URL completa:', fullUrl);

      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const blob = await response.blob();
      console.log('✅ [conversationMongoService] Excel descargado:', blob.size, 'bytes');
      return blob;
    } catch (error) {
      console.error('❌ [conversationMongoService] Error exportando a Excel:', error);
      throw new Error(
        error.data?.detail || 
        error.message || 
        'Error al exportar a Excel'
      );
    }
  },

  // 🔥 NUEVA FUNCIÓN: Exportar a Word
  exportToWord: async (params = {}) => {
    try {
      console.log('📤 [conversationMongoService] Exportando a Word con params:', params);
      
      const query = new URLSearchParams();
      
      // 🔥 Mismo procesamiento que Excel
      if (params.id_agente !== undefined && params.id_agente !== null) {
        const idAgente = Number(params.id_agente);
        if (!isNaN(idAgente)) {
          query.append('id_agente', idAgente);
          console.log('✅ ID Agente agregado:', idAgente);
        }
      }
      if (params.estado !== undefined && params.estado !== null && params.estado !== 'ALL') {
        query.append('estado', params.estado);
      }
      if (params.origin !== undefined && params.origin !== null && params.origin !== 'ALL') {
        query.append('origin', params.origin);
      }
      if (params.escaladas !== undefined && params.escaladas !== null) {
        query.append('escaladas', params.escaladas);
      }
      if (params.fecha_inicio !== undefined && params.fecha_inicio !== null) {
        query.append('fecha_inicio', params.fecha_inicio);
      }
      if (params.fecha_fin !== undefined && params.fecha_fin !== null) {
        query.append('fecha_fin', params.fecha_fin);
      }
      if (params.incluir_visitante !== undefined && params.incluir_visitante !== null) {
        query.append('incluir_visitante', params.incluir_visitante);
      }
      
      // 🔥 NUEVO: Solo datos del visitante
      if (params.solo_visitante !== undefined && params.solo_visitante !== null && params.solo_visitante === true) {
        query.append('solo_visitante', true);
        console.log('👤 Solo visitante agregado: true');
      }
      
      const queryString = query.toString();
      const endpoint = queryString
        ? `${ENDPOINTS.CONVERSACIONES_MONGO.EXPORT_WORD}?${queryString}`
        : ENDPOINTS.CONVERSACIONES_MONGO.EXPORT_WORD;
      
      console.log('🌐 [conversationMongoService] Endpoint Word:', endpoint);
      
      const token = await apiClient.getToken();
      const fullUrl = `${apiClient.baseURL}${endpoint}`;
      console.log('🌐 [conversationMongoService] URL completa:', fullUrl);

      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const blob = await response.blob();
      console.log('✅ [conversationMongoService] Word descargado:', blob.size, 'bytes');
      return blob;
    } catch (error) {
      console.error('❌ [conversationMongoService] Error exportando a Word:', error);
      throw new Error(
        error.data?.detail || 
        error.message || 
        'Error al exportar a Word'
      );
    }
  },

  async getDailyStats(idAgente = null, dias = 7) {
      try {
          console.log('📊 [conversationMongoService] Obteniendo estadísticas diarias', { idAgente, dias });
          
          // ✅ Usar ENDPOINTS en lugar de API_ROUTES
          let endpoint = `${ENDPOINTS.CONVERSACIONES_MONGO.STATS_DAILY}?dias=${dias}`;
          
          if (idAgente) {
              endpoint += `&id_agente=${idAgente}`;
          }
          
          const response = await apiClient.get(endpoint);
          
          console.log('✅ [conversationMongoService] Estadísticas diarias obtenidas:', response);
          
          return response;
      } catch (error) {
          console.error('❌ [conversationMongoService] Error obteniendo estadísticas diarias:', error);
          return null; // Retornar null para no romper la app
      }
  }
};

export default conversationMongoService;
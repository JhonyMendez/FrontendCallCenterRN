import { apiClient } from '../client';
import { ENDPOINTS } from '../config';

export const visitanteAnonimoService = {
  // Crear visitante
  create: async (visitanteData) => {
    return await apiClient.post(ENDPOINTS.VISITANTES.BASE, visitanteData);
  },

  // Listar visitantes
  getAll: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.skip !== undefined) query.append('skip', params.skip);
    if (params.limit !== undefined) query.append('limit', params.limit);
    if (params.dispositivo) query.append('dispositivo', params.dispositivo);
    if (params.pais) query.append('pais', params.pais);
    if (params.fecha_desde) query.append('fecha_desde', params.fecha_desde);
    
    const queryString = query.toString();
    const endpoint = queryString
      ? `${ENDPOINTS.VISITANTES.BASE}?${queryString}`
      : ENDPOINTS.VISITANTES.BASE;
    
    return await apiClient.get(endpoint);
  },

  // Obtener estadísticas generales
  getEstadisticas: async () => {
    return await apiClient.get(ENDPOINTS.VISITANTES.ESTADISTICAS);
  },

  // Obtener visitantes activos
  getActivos: async (minutos = 30) => {
    return await apiClient.get(`${ENDPOINTS.VISITANTES.ACTIVOS}?minutos=${minutos}`);
  },

  // Obtener por sesión
  getBySesion: async (identificadorSesion) => {
    return await apiClient.get(ENDPOINTS.VISITANTES.BY_SESION(identificadorSesion));
  },

  // Obtener por ID
  getById: async (id) => {
    return await apiClient.get(ENDPOINTS.VISITANTES.BY_ID(id));
  },

  // Obtener estadísticas del visitante
  getEstadisticasVisitante: async (id) => {
    return await apiClient.get(ENDPOINTS.VISITANTES.ESTADISTICAS_BY_ID(id));
  },

  // Actualizar visitante
  update: async (id, visitanteData) => {
    return await apiClient.put(ENDPOINTS.VISITANTES.BY_ID(id), visitanteData);
  },

  // Registrar actividad
  registrarActividad: async (id) => {
    return await apiClient.post(ENDPOINTS.VISITANTES.ACTIVIDAD(id));
  },

  // Incrementar conversación
  incrementarConversacion: async (id) => {
    return await apiClient.post(ENDPOINTS.VISITANTES.NUEVA_CONVERSACION(id));
  },

  // Incrementar mensajes
  incrementarMensajes: async (id, cantidad = 1) => {
    return await apiClient.post(`${ENDPOINTS.VISITANTES.MENSAJES(id)}?cantidad=${cantidad}`);
  }
};
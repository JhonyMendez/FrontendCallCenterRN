// src/api/services/departamentoService.js
import { apiClient } from '../client';
import { ENDPOINTS } from '../config';

export const departamentoService = {
  // Crear departamento
  create: async (departamentoData) => {
    console.log('🔍 [Service] create iniciado');
    return await apiClient.post(ENDPOINTS.DEPARTAMENTOS.BASE, departamentoData);
  },

  // Listar departamentos
  getAll: async (params = {}) => {
    console.log('🔍 [Service] getAll iniciado');
    console.log('🔍 [Service] Params:', params);
    
    const query = new URLSearchParams();
    if (params.skip !== undefined) query.append('skip', params.skip);
    if (params.limit !== undefined) query.append('limit', params.limit);
    if (params.activo !== undefined) query.append('activo', params.activo);
    if (params.facultad) query.append('facultad', params.facultad);
    
    const queryString = query.toString();
    const endpoint = queryString
      ? `${ENDPOINTS.DEPARTAMENTOS.BASE}?${queryString}`
      : ENDPOINTS.DEPARTAMENTOS.BASE;
    
    console.log('📡 [Service] Endpoint:', endpoint);
    console.log('🌐 [Service] URL completa:', apiClient.baseURL + endpoint);
    
    try {
      const result = await apiClient.get(endpoint);
      console.log('✅ [Service] Respuesta recibida');
      console.log('✅ [Service] Tipo:', typeof result);
      console.log('✅ [Service] Es array?:', Array.isArray(result));
      console.log('✅ [Service] Longitud:', result?.length);
      if (result && result.length > 0) {
        console.log('✅ [Service] Primera entrada:', result[0].nombre);
      }
      return result;
    } catch (error) {
      console.error('❌ [Service] Error en getAll:', error);
      throw error;
    }
  },

  // Obtener estadísticas generales
  getEstadisticasGenerales: async () => {
    console.log('🔍 [Service] getEstadisticasGenerales iniciado');
    return await apiClient.get(ENDPOINTS.DEPARTAMENTOS.ESTADISTICAS);
  },

  // Buscar departamentos
  search: async (searchTerm) => {
    console.log('🔍 [Service] search iniciado:', searchTerm);
    return await apiClient.get(`${ENDPOINTS.DEPARTAMENTOS.BUSCAR}?q=${encodeURIComponent(searchTerm)}`);
  },

  // Obtener por código
  getByCodigo: async (codigo) => {
    console.log('🔍 [Service] getByCodigo:', codigo);
    return await apiClient.get(ENDPOINTS.DEPARTAMENTOS.BY_CODIGO(codigo));
  },

  // Obtener por ID
  getById: async (id) => {
    console.log('🔍 [Service] getById:', id);
    return await apiClient.get(ENDPOINTS.DEPARTAMENTOS.BY_ID(id));
  },

  // Obtener estadísticas de departamento
  getEstadisticas: async (id) => {
    console.log('🔍 [Service] getEstadisticas:', id);
    return await apiClient.get(ENDPOINTS.DEPARTAMENTOS.ESTADISTICAS_BY_ID(id));
  },

  // Actualizar departamento
  update: async (id, departamentoData) => {
    console.log('🔍 [Service] update:', id);
    return await apiClient.put(ENDPOINTS.DEPARTAMENTOS.BY_ID(id), departamentoData);
  },

  // Asignar jefe
  asignarJefe: async (id, idJefe) => {
    console.log('🔍 [Service] asignarJefe:', id, idJefe);
    return await apiClient.put(ENDPOINTS.DEPARTAMENTOS.ASIGNAR_JEFE(id, idJefe));
  },

  // Eliminar departamento
  delete: async (id) => {
    console.log('🔍 [Service] delete:', id);
    return await apiClient.delete(ENDPOINTS.DEPARTAMENTOS.BY_ID(id));
  },

  // Regenerar modelo Ollama
  regenerarOllama: async (id) => {
    console.log('🔍 [Service] regenerarOllama:', id);
    return await apiClient.post(ENDPOINTS.DEPARTAMENTOS.REGENERAR_OLLAMA(id));
  },

  // Consultar modelo Ollama
  consultarOllama: async (codigoDepartamento, pregunta) => {
    console.log('🔍 [Service] consultarOllama:', codigoDepartamento, pregunta);
    const query = new URLSearchParams({
      codigo_departamento: codigoDepartamento,
      pregunta: pregunta
    });
    
    return await apiClient.post(
      `${ENDPOINTS.DEPARTAMENTOS.CONSULTAR_OLLAMA}?${query.toString()}`,
      {}
    );
  }
};
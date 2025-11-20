import { apiClient } from '../client';
import { ENDPOINTS } from '../config';

export const departamentoAgenteService = {
  // Asignar departamento-agente
  asignar: async (data) => {
    return await apiClient.post(ENDPOINTS.DEPARTAMENTO_AGENTE.BASE, data);
  },

  // Listar agentes de un departamento
  getByDepartamento: async (idDepartamento, activo = null) => {
    const endpoint = activo !== null
      ? `${ENDPOINTS.DEPARTAMENTO_AGENTE.BY_DEPARTAMENTO(idDepartamento)}?activo=${activo}`
      : ENDPOINTS.DEPARTAMENTO_AGENTE.BY_DEPARTAMENTO(idDepartamento);
    
    return await apiClient.get(endpoint);
  },

  // Listar departamentos de un agente
  getByAgente: async (idAgente, activo = null) => {
    const endpoint = activo !== null
      ? `${ENDPOINTS.DEPARTAMENTO_AGENTE.BY_AGENTE(idAgente)}?activo=${activo}`
      : ENDPOINTS.DEPARTAMENTO_AGENTE.BY_AGENTE(idAgente);
    
    return await apiClient.get(endpoint);
  },

  // Obtener asignación específica
  getById: async (id) => {
    return await apiClient.get(ENDPOINTS.DEPARTAMENTO_AGENTE.BY_ID(id));
  },

  // Actualizar permisos
  updatePermisos: async (id, data) => {
    return await apiClient.put(ENDPOINTS.DEPARTAMENTO_AGENTE.BY_ID(id), data);
  },

  // Revocar acceso
  revocar: async (id) => {
    return await apiClient.delete(ENDPOINTS.DEPARTAMENTO_AGENTE.BY_ID(id));
  }
};
// ==================================================================================
// src/api/services/personaService.js
// Servicio para gestionar personas - Compatible con FastAPI Backend
// ==================================================================================

import { apiClient } from '../client';

export const personaService = {
  /**
   * 1) CREAR una nueva persona
   * POST /personas/
   * @param {Object} data - Datos de la persona (PersonaCreate schema)
   * @returns {Promise<Object>} - Persona creada
   */
  async create(data) {
    try {
      console.log('📤 [personaService] Creando persona con datos:', JSON.stringify(data, null, 2));
      const response = await apiClient.post('/personas/', data);
      console.log('✅ [personaService] Persona creada:', response);
      return response;
    } catch (error) {
      console.error('❌ [personaService] Error completo:', error);
      console.error('❌ [personaService] Error data:', error.data);
      console.error('❌ [personaService] Status:', error.status);
      
      // Extraer detalles de validación
      let errorMsg = 'Error al crear persona';
      if (error.data?.detail) {
        if (Array.isArray(error.data.detail)) {
          // FastAPI devuelve errores de validación como array
          const errores = error.data.detail.map(e => `${e.loc.join('.')}: ${e.msg}`).join('\n');
          errorMsg = `Error de validación:\n${errores}`;
        } else {
          errorMsg = error.data.detail;
        }
      } else if (error.message) {
        errorMsg = error.message;
      }
      
      throw new Error(errorMsg);
    }
  },

  /**
   * 2) LISTAR personas con filtros
   * GET /personas/
   * @param {Object} params - Filtros de búsqueda
   * @returns {Promise<Array>} - Lista de personas
   */
  async listar(params = {}) {
    try {
      const response = await apiClient.get('/personas/', { params });
      console.log('✅ Personas listadas:', response.data?.length || 0);
      return response.data;
    } catch (error) {
      console.error('❌ Error listando personas:', error.response?.data || error.message);
      throw new Error(
        error.response?.data?.detail || 
        'Error al listar personas'
      );
    }
  },

  /**
   * 3) OBTENER estadísticas
   * GET /personas/estadisticas
   * @returns {Promise<Object>} - Estadísticas de personas
   */
  async obtenerEstadisticas() {
    try {
      const response = await apiClient.get('/personas/estadisticas');
      return response.data;
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas:', error.response?.data || error.message);
      throw new Error(
        error.response?.data?.detail || 
        'Error al obtener estadísticas'
      );
    }
  },

  /**
   * 4) BUSCAR por cédula
   * GET /personas/cedula/{cedula}
   * @param {string} cedula - Cédula de la persona
   * @returns {Promise<Object>} - Persona encontrada
   */
  async buscarPorCedula(cedula) {
    try {
      const response = await apiClient.get(`/personas/cedula/${cedula}`);
      return response.data;
    } catch (error) {
      console.error('❌ Error buscando por cédula:', error.response?.data || error.message);
      throw new Error(
        error.response?.data?.detail || 
        'Persona no encontrada'
      );
    }
  },

  /**
   * 5) VALIDAR disponibilidad de cédula
   * GET /personas/validar-cedula/{cedula}
   * @param {string} cedula - Cédula a validar
   * @param {number} exclude_id - ID a excluir (para edición)
   * @returns {Promise<Object>} - {disponible: boolean, mensaje: string}
   */
  async validarCedula(cedula, exclude_id = null) {
    try {
      const params = exclude_id ? { exclude_id } : {};
      const response = await apiClient.get(`/personas/validar-cedula/${cedula}`, { params });
      return response.data;
    } catch (error) {
      console.error('❌ Error validando cédula:', error.response?.data || error.message);
      throw new Error(
        error.response?.data?.detail || 
        'Error al validar cédula'
      );
    }
  },

  /**
   * 6) BUSCAR por nombre
   * GET /personas/buscar/nombre
   * @param {string} query - Término de búsqueda
   * @param {number} limit - Límite de resultados
   * @returns {Promise<Array>} - Lista de personas
   */
  async buscarPorNombre(query, limit = 20) {
    try {
      const response = await apiClient.get('/personas/buscar/nombre', {
        params: { q: query, limit }
      });
      return response.data;
    } catch (error) {
      console.error('❌ Error buscando por nombre:', error.response?.data || error.message);
      throw new Error(
        error.response?.data?.detail || 
        'Error al buscar por nombre'
      );
    }
  },

  /**
   * 7) OBTENER persona por ID
   * GET /personas/{id_persona}
   * @param {number} id_persona - ID de la persona
   * @returns {Promise<Object>} - Persona encontrada
   */
  async getById(id_persona) {
    try {
      const response = await apiClient.get(`/personas/${id_persona}`);
      return response.data;
    } catch (error) {
      console.error('❌ Error obteniendo persona:', error.response?.data || error.message);
      throw new Error(
        error.response?.data?.detail || 
        'Persona no encontrada'
      );
    }
  },

  /**
   * 8) ACTUALIZAR persona completa
   * PUT /personas/{id_persona}
   * @param {number} id_persona - ID de la persona
   * @param {Object} data - Datos actualizados (PersonaUpdate schema)
   * @returns {Promise<Object>} - Persona actualizada
   */
  async update(id_persona, data) {
    try {
      console.log('📤 Actualizando persona:', id_persona, data);
      const response = await apiClient.put(`/personas/${id_persona}`, data);
      console.log('✅ Persona actualizada:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error actualizando persona:', error.response?.data || error.message);
      const errorMsg = error.response?.data?.detail || 
                      error.response?.data?.message || 
                      'Error al actualizar persona';
      throw new Error(errorMsg);
    }
  },

  /**
   * 9) CAMBIAR ESTADO de persona
   * PATCH /personas/{id_persona}/estado
   * @param {number} id_persona - ID de la persona
   * @param {string} estado - Nuevo estado (activo/inactivo/suspendido)
   * @returns {Promise<Object>} - Persona actualizada
   */
  async cambiarEstado(id_persona, estado) {
    try {
      const response = await apiClient.patch(
        `/personas/${id_persona}/estado`,
        null,
        { params: { estado } }
      );
      console.log('✅ Estado actualizado:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error cambiando estado:', error.response?.data || error.message);
      throw new Error(
        error.response?.data?.detail || 
        'Error al cambiar estado'
      );
    }
  },

  /**
   * 10) ELIMINAR persona
   * DELETE /personas/{id_persona}
   * @param {number} id_persona - ID de la persona
   * @returns {Promise<Object>} - Resultado de la eliminación
   */
  async delete(id_persona) {
    try {
      const response = await apiClient.delete(`/personas/${id_persona}`);
      console.log('✅ Persona eliminada:', id_persona);
      return response.data;
    } catch (error) {
      console.error('❌ Error eliminando persona:', error.response?.data || error.message);
      throw new Error(
        error.response?.data?.detail || 
        'Error al eliminar persona'
      );
    }
  },

  // ==================== MÉTODOS ALIAS (compatibilidad) ====================
  
  /**
   * Alias de listar() para compatibilidad
   */
  async getAll(params = {}) {
    return this.listar(params);
  },

  /**
   * Alias de buscarPorCedula() para compatibilidad
   */
  async getByCedula(cedula) {
    return this.buscarPorCedula(cedula);
  }
};

export default personaService;
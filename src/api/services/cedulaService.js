// src/api/services/cedulaService.js
import { apiClient } from '../client';
import { ENDPOINTS } from '../config';

export const cedulaService = {
  /**
   * Consultar información de cédula en Fenix (vía proxy backend)
   * @param {string} cedula - Cédula a consultar (10 dígitos)
   * @returns {Promise<any>} Datos de la persona
   */
  consultarCedula: async (cedula) => {
    try {
      console.log('🔍 [cedulaService] Consultando cédula:', cedula);

      // ApiClient ya devuelve el JSON, no un objeto { data }
      const data = await apiClient.get(ENDPOINTS.CEDULAS.BY_CEDULA(cedula));
      
      console.log('✅ [cedulaService] Respuesta:', data);
      return data;
    } catch (error) {
      console.error('❌ [cedulaService] Error consultando cédula:', error);

      // Tu ApiClient lanza: { status, message, data }
      const mensajeError =
        error.message ||
        error.data?.detail ||
        error.data?.message ||
        'No se pudo consultar la cédula';

      throw new Error(mensajeError);
    }
  }
};

// src/api/client.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Platform } from 'react-native';
import { API_CONFIG } from './config';

// Storage universal para web y mobile
const Storage = {
  async setItem(key, value) {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
    } else {
      await AsyncStorage.setItem(key, value);
    }
  },

  async getItem(key) {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    } else {
      return await AsyncStorage.getItem(key);
    }
  },

  async removeItem(key) {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
    } else {
      await AsyncStorage.removeItem(key);
    }
  }
};

class ApiClient {
  constructor(config) {
    this.baseURL = config.BASE_URL;
    this.timeout = config.TIMEOUT;
    this.token = null;

    // Configurar instancia de axios
    this.axiosInstance = axios.create({
      baseURL: this.baseURL,
      timeout: this.timeout,
      headers: config.HEADERS,
    });

    // Interceptor para agregar token automáticamente
    this.axiosInstance.interceptors.request.use(
      async (config) => {
        const token = await this.getToken();
        if (token) {
          config.headers['Authorization'] = `Bearer ${token}`;
        }

        console.log('─────────────────────────────────────────────────');
        console.log(`🌐 ${config.method.toUpperCase()} ${config.url}`);
        console.log(`⏰ Hora: ${new Date().toLocaleTimeString()}`);

        return config;
      },
      (error) => {
        console.error('❌ Error en request interceptor:', error);
        return Promise.reject(error);
      }
    );

    // Interceptor para manejar respuestas y errores
    this.axiosInstance.interceptors.response.use(
      async (response) => {  // ✅ AHORA ES ASYNC
        console.log(`✅ Response status: ${response.status}`);

        const newToken = response.headers['x-new-token'];
        if (newToken) {
          console.log('🔄 Token renovado automáticamente');
          await this.setToken(newToken);
        }

        console.log('─────────────────────────────────────────────────');
        return response;
      },
      (error) => {
        console.log('─────────────────────────────────────────────────');

        if (error.code === 'ECONNABORTED') {
          console.error('❌ TIMEOUT: El servidor tardó más de', this.timeout / 1000, 'segundos');
          const timeoutError = new Error(`Tiempo de espera agotado (${this.timeout / 1000}s)`);
          timeoutError.status = 408;
          timeoutError.isTimeout = true;
          return Promise.reject(timeoutError);
        }

        if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
          console.error('❌ NETWORK ERROR');
          console.error('💡 POSIBLES CAUSAS:');
          console.error('   1. Backend NO está corriendo en:', this.baseURL);
          console.error('   2. Dispositivo NO está en la misma WiFi');
          console.error('   3. Firewall bloqueando el puerto 8000');
          console.error('   4. IP incorrecta (verifica con ipconfig)');
          console.log('─────────────────────────────────────────────────');

          const networkError = new Error(
            'No se puede conectar al servidor.\n\n' +
            'Verifica que:\n' +
            '1. El backend esté corriendo\n' +
            '2. El móvil esté en la misma WiFi\n' +
            '3. La IP sea correcta'
          );
          networkError.status = 0;
          networkError.isNetworkError = true;
          return Promise.reject(networkError);
        }

        if (error.response) {
          // El servidor respondió con un código de error
          console.error('❌ Error response:', error.response.status);
          console.error('❌ Error data:', error.response.data);
          console.log('─────────────────────────────────────────────────');

          const apiError = new Error(
            error.response.data?.detail ||
            error.response.data?.message ||
            `Error ${error.response.status}`
          );
          apiError.status = error.response.status;
          apiError.data = error.response.data;
          return Promise.reject(apiError);
        }

        console.error('❌ Error desconocido:', error.message);
        console.log('─────────────────────────────────────────────────');
        return Promise.reject(error);
      }
    );

    console.log('═══════════════════════════════════════════════════');
    console.log('🔧 API CLIENT INITIALIZED (AXIOS)');
    console.log('═══════════════════════════════════════════════════');
    console.log('📍 Base URL:', this.baseURL);
    console.log('⏱️  Timeout:', this.timeout, 'ms');
    console.log('📱 Platform:', Platform.OS);
    console.log('═══════════════════════════════════════════════════');
  }

  async setToken(token) {
    this.token = token;
    try {
      if (token) {
        await Storage.setItem('auth_token', token);
        console.log('✅ Token guardado correctamente');
      } else {
        await Storage.removeItem('auth_token');
        console.log('🗑️ Token eliminado');
      }
    } catch (error) {
      console.error('❌ Error guardando token:', error);
    }
  }

  async getToken() {
    if (!this.token) {
      try {
        this.token = await Storage.getItem('auth_token');
      } catch (error) {
        console.error('❌ Error obteniendo token:', error);
      }
    }
    return this.token;
  }

  async removeToken() {
    console.log('🧹 Removiendo token...');
    await this.setToken(null);
    this.token = null;
  }

  // Métodos HTTP usando axios
  async get(endpoint, options = {}) {
    try {
      const response = await this.axiosInstance.get(endpoint, options);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async post(endpoint, data, options = {}) {
    try {
      const response = await this.axiosInstance.post(endpoint, data, options);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async put(endpoint, data, options = {}) {
    try {
      const response = await this.axiosInstance.put(endpoint, data, options);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async patch(endpoint, data, options = {}) {
    try {
      const response = await this.axiosInstance.patch(endpoint, data, options);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async delete(endpoint, options = {}) {
    try {
      const response = await this.axiosInstance.delete(endpoint, options);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async clearSession() {
    console.log('🧹 Limpiando sesión...');
    try {
      await this.removeToken();
    } catch (error) {
      console.error('Error limpiando sesión:', error);
    }
  }
}

export const apiClient = new ApiClient(API_CONFIG);
// src/api/client.js
import AsyncStorage from '@react-native-async-storage/async-storage';
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
    this.headers = config.HEADERS;
    this.token = null;
    
    console.log('🔧 [Client] ApiClient inicializado');
    console.log('🔧 [Client] baseURL:', this.baseURL);
    console.log('🔧 [Client] timeout:', this.timeout);
  }

  async setToken(token) {
    this.token = token;
    try {
      if (token) {
        await Storage.setItem('auth_token', token);
      } else {
        await Storage.removeItem('auth_token');
      }
    } catch (error) {
      console.error('Error guardando token:', error);
    }
  }

  async getToken() {
    if (!this.token) {
      try {
        this.token = await Storage.getItem('auth_token');
      } catch (error) {
        console.error('Error obteniendo token:', error);
      }
    }
    return this.token;
  }

  async removeToken() {
    console.log('🧹 [Client] Removiendo token...');
    await this.setToken(null);
    this.token = null;
  }

  async buildHeaders(customHeaders = {}) {
    const headers = { ...this.headers, ...customHeaders };
    const token = await this.getToken();
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    console.log(`🌐 [Client] ${options.method || 'GET'} ${url}`);
    
    const useTimeout = Platform.OS === 'web' && this.timeout && this.timeout > 0;

    let controller = null;
    let timeoutId = null;

    try {
      const headers = await this.buildHeaders(options.headers);
      const fetchOptions = {
        ...options,
        headers,
      };

      if (useTimeout) {
        controller = new AbortController();
        timeoutId = setTimeout(() => controller.abort(), this.timeout);
        fetchOptions.signal = controller.signal;
      }

      const response = await fetch(url, fetchOptions);

      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      console.log(`✅ [Client] Response status: ${response.status}`);

      if (!response.ok) {
        let errorData = {};
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = {};
        }

        console.error('❌ [Client] Error response:', errorData);
        
        // ✅ LANZAR ERROR EN FORMATO ESTRUCTURADO
        const error = new Error(errorData.detail || errorData.message || `Error ${response.status}`);
        error.status = response.status;
        error.data = errorData; // ✅ Aquí está el errorData del backend
        throw error;
      }

      if (response.status === 204) {
        return null;
      }

      let data = null;
      try {
        data = await response.json();
      } catch (e) {
        data = null;
      }

      console.log('✅ [Client] Data received, length:', Array.isArray(data) ? data.length : 'N/A');
      return data;
    } catch (error) {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      if (useTimeout && error.name === 'AbortError') {
        console.error('❌ [Client] Timeout');
        const timeoutError = new Error('Tiempo de espera agotado');
        timeoutError.status = 408;
        timeoutError.isTimeout = true;
        throw timeoutError;
      }
      
      console.error('❌ [Client] Request failed:', error);
      throw error; // ✅ Ya es un Error con .data
    }
  }

  get(endpoint, options) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  post(endpoint, data, options) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  put(endpoint, data, options) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  delete(endpoint, options) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }

  async clearSession() {
    console.log('🧹 [Client] Limpiando sesión...');
    try {
      await this.removeToken();
    } catch (error) {
      console.error('Error limpiando sesión:', error);
    }
  }
}

export const apiClient = new ApiClient(API_CONFIG);
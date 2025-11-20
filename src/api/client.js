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
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const headers = await this.buildHeaders(options.headers);
      
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      console.log(`✅ [Client] Response status: ${response.status}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ [Client] Error response:', errorData);
        throw {
          status: response.status,
          message: errorData.detail || errorData.message || `Error ${response.status}`,
          data: errorData
        };
      }

      if (response.status === 204) {
        return null;
      }

      const data = await response.json();
      console.log('✅ [Client] Data received, length:', data?.length || 'N/A');
      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        console.error('❌ [Client] Timeout');
        throw { 
          status: 408, 
          message: 'Tiempo de espera agotado',
          isTimeout: true 
        };
      }
      
      console.error('❌ [Client] Request failed:', error);
      throw error;
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
    try {
      await this.setToken(null);
      this.token = null;
    } catch (error) {
      console.error('Error limpiando sesión:', error);
    }
  }
}

export const apiClient = new ApiClient(API_CONFIG);
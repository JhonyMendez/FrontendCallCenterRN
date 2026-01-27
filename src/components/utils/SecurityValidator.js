// ============================================================
// 🛡️ CLASE DE VALIDACIÓN Y SEGURIDAD
// ============================================================

class SecurityValidator {

  // ==================== CONFIGURACIÓN ====================

  static CONFIG = {
    MAX_LENGTHS: {
      nombre: 100,
      descripcion: 500,
      prompt: 2000,
      prompt_mision: 300,
      prompt_regla: 200,
      prompt_especializado: 500,
      mensaje: 500,
      url: 1000,
      palabras_clave: 500,
      acciones: 1000,
    },

    RATE_LIMITS: {
      searchPerMinute: 30,
      actionsPerMinute: 10,
    },

    DANGEROUS_DOMAINS: [
      'bit.ly', 'tinyurl.com', 'goo.gl', 't.co', // Acortadores
      'iplogger.org', 'grabify.link', // IP loggers
      'malware.com', 'phishing.net', // Ejemplo
    ],

    TRUSTED_IMAGE_DOMAINS: [
      'googleusercontent.com',
      'pinimg.com',
      'cdninstagram.com',
      'twimg.com',
      'imgur.com',
      'cloudinary.com',
      'amazonaws.com',
      'unsplash.com',
      'pexels.com',
      'githubusercontent.com',
    ],
  };

  // ==================== SANITIZACIÓN ====================
  /**
     * Sanitizar texto eliminando código malicioso PERO PRESERVANDO ESPACIOS
     * @param {string} text - Texto a sanitizar
     * @returns {string} Texto limpio con espacios
     */
  static sanitizeText(text) {
    if (!text || typeof text !== 'string') return '';

    return text
      // Eliminar scripts
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      // Eliminar iframes
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      // Eliminar objects
      .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
      // Eliminar embeds
      .replace(/<embed\b[^<]*>/gi, '')
      // Eliminar javascript:
      .replace(/javascript:/gi, '')
      // Eliminar eventos (onclick, onerror, etc)
      .replace(/on\w+\s*=/gi, '')
      // Eliminar data URIs peligrosas
      .replace(/data:text\/html/gi, '')
      // Eliminar todas las etiquetas HTML
      .replace(/<[^>]*>/g, '')
      // Eliminar caracteres de control EXCEPTO espacios, tabs y saltos de línea
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
      // ✅ NORMALIZAR espacios múltiples a un solo espacio (opcional)
      .replace(/\s{2,}/g, ' ')
      // ✅ Hacer trim solo al inicio y final (preserva espacios internos)
      .trim();
  }

  /**
   * Sanitizar entrada SQL
   * @param {string} input - Input a sanitizar
   * @returns {string} Input seguro
   */
  static sanitizeSqlInput(input) {
    if (!input || typeof input !== 'string') return '';

    return input
      .replace(/'/g, "''") // Escapar comillas simples
      .replace(/--/g, '') // Eliminar comentarios SQL
      .replace(/;/g, '') // Eliminar punto y coma
      .replace(/\/\*/g, '') // Eliminar inicio comentario
      .replace(/\*\//g, '') // Eliminar fin comentario
      .replace(/union/gi, '') // Prevenir UNION attacks
      .replace(/select/gi, '') // Prevenir SELECT
      .replace(/drop/gi, '') // Prevenir DROP
      .replace(/insert/gi, '') // Prevenir INSERT
      .replace(/update/gi, '') // Prevenir UPDATE
      .replace(/delete/gi, ''); // Prevenir DELETE
  }

  /**
   * Truncar texto a longitud máxima
   * @param {string} text - Texto a truncar
   * @param {number} maxLength - Longitud máxima
   * @returns {string} Texto truncado
   */
  static truncateText(text, maxLength) {
    if (!text || typeof text !== 'string') return '';
    return text.length > maxLength ? text.substring(0, maxLength) : text;
  }

  // ==================== VALIDACIÓN DE URLS ====================

  /**
   * Validar si una URL es segura
   * @param {string} url - URL a validar
   * @returns {boolean} true si es segura
   */
  static isSecureUrl(url) {
    if (!url || typeof url !== 'string') return false;

    try {
      const urlObj = new URL(url);

      // Solo permitir http y https
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        console.warn('🚫 Protocolo no permitido:', urlObj.protocol);
        return false;
      }

      // Verificar blacklist de dominios
      const hostname = urlObj.hostname.toLowerCase();
      const isDangerous = this.CONFIG.DANGEROUS_DOMAINS.some(
        domain => hostname.includes(domain)
      );

      if (isDangerous) {
        console.warn('🚫 Dominio peligroso detectado:', hostname);
        return false;
      }

      // Prevenir localhost y IPs privadas
      if (this.isPrivateIP(hostname)) {
        console.warn('🚫 IP privada o localhost no permitida');
        return false;
      }

      return true;

    } catch (error) {
      console.error('❌ URL inválida:', error.message);
      return false;
    }
  }

  /**
   * Validar si una URL es de imagen confiable
   * @param {string} url - URL de imagen
   * @returns {boolean} true si es válida
   */
  static isValidImageUrl(url) {
    if (!this.isSecureUrl(url)) return false;

    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname.toLowerCase();
      const pathname = urlObj.pathname.toLowerCase();

      // Verificar extensión de imagen
      const imageExtensions = /\.(jpg|jpeg|png|gif|webp|svg|bmp|ico)$/i;
      if (imageExtensions.test(pathname)) {
        return true;
      }

      // Verificar dominio confiable
      const isTrusted = this.CONFIG.TRUSTED_IMAGE_DOMAINS.some(
        domain => hostname.includes(domain)
      );

      if (!isTrusted) {
        console.warn('⚠️ Dominio de imagen no confiable:', hostname);
      }

      return isTrusted;

    } catch (error) {
      return false;
    }
  }

  /**
   * Verificar si es IP privada o localhost
   * @param {string} hostname - Host a verificar
   * @returns {boolean} true si es privado
   */
  static isPrivateIP(hostname) {
    return (
      hostname === 'localhost' ||
      hostname.startsWith('127.') ||
      hostname.startsWith('192.168.') ||
      hostname.startsWith('10.') ||
      hostname.startsWith('172.16.') ||
      hostname.startsWith('172.17.') ||
      hostname.startsWith('172.18.') ||
      hostname.startsWith('172.19.') ||
      hostname.startsWith('172.20.') ||
      hostname.startsWith('172.21.') ||
      hostname.startsWith('172.22.') ||
      hostname.startsWith('172.23.') ||
      hostname.startsWith('172.24.') ||
      hostname.startsWith('172.25.') ||
      hostname.startsWith('172.26.') ||
      hostname.startsWith('172.27.') ||
      hostname.startsWith('172.28.') ||
      hostname.startsWith('172.29.') ||
      hostname.startsWith('172.30.') ||
      hostname.startsWith('172.31.')
    );
  }

  // ==================== VALIDACIÓN DE FORMATOS ====================

  /**
   * Validar color hexadecimal
   * @param {string} color - Color a validar
   * @returns {boolean} true si es válido
   */
  static isValidHexColor(color) {
    if (!color || typeof color !== 'string') return false;
    const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    return hexRegex.test(color);
  }

  /**
   * Validar email
   * @param {string} email - Email a validar
   * @returns {boolean} true si es válido
   */
  static isValidEmail(email) {
    if (!email || typeof email !== 'string') return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validar número en rango
   * @param {number} value - Valor a validar
   * @param {number} min - Mínimo
   * @param {number} max - Máximo
   * @returns {boolean} true si está en rango
   */
  static isInRange(value, min, max) {
    const num = parseFloat(value);
    return !isNaN(num) && num >= min && num <= max;
  }

  // ==================== VALIDACIÓN DE FORMULARIOS ====================

  /**
   * Validar datos del formulario de agente
   * @param {object} formData - Datos del formulario
   * @param {string} mode - 'create' o 'edit'
   * @returns {object} { isValid: boolean, errors: object }
   */
  static validateAgenteForm(formData, mode = 'create') {
    const errors = {};
    const sanitized = {};

    // 1. NOMBRE
    sanitized.nombre_agente = this.sanitizeText(formData.nombre_agente);
    if (!sanitized.nombre_agente) {
      errors.nombre_agente = '⚠️ El nombre del agente es obligatorio';
    } else if (sanitized.nombre_agente.length < 3) {
      errors.nombre_agente = '⚠️ Mínimo 3 caracteres';
    } else if (sanitized.nombre_agente.length > this.CONFIG.MAX_LENGTHS.nombre) {
      errors.nombre_agente = `⚠️ Máximo ${this.CONFIG.MAX_LENGTHS.nombre} caracteres`;
    }

    // 2. ÁREA DE ESPECIALIDAD
    sanitized.area_especialidad = this.sanitizeText(formData.area_especialidad);
    if (!sanitized.area_especialidad) {
      errors.area_especialidad = '⚠️ La especialidad es obligatoria';
    } else if (sanitized.area_especialidad.length < 3) {
      errors.area_especialidad = '⚠️ Mínimo 3 caracteres';
    }

    // 3. DESCRIPCIÓN
    sanitized.descripcion = this.sanitizeText(formData.descripcion);
    if (!sanitized.descripcion) {
      errors.descripcion = '⚠️ La descripción es obligatoria';
    } else if (sanitized.descripcion.length < 10) {
      errors.descripcion = '⚠️ Mínimo 10 caracteres';
    } else if (sanitized.descripcion.length > this.CONFIG.MAX_LENGTHS.descripcion) {
      errors.descripcion = `⚠️ Máximo ${this.CONFIG.MAX_LENGTHS.descripcion} caracteres`;
    }

    // 4. DEPARTAMENTO
    if (!formData.id_departamento) {
      errors.id_departamento = '⚠️ Debes seleccionar un departamento';
    }

    // 5. AVATAR URL
    if (!formData.avatar_url?.trim()) {
      errors.avatar_url = '⚠️ La URL del avatar es obligatoria';
    } else if (!this.isValidImageUrl(formData.avatar_url)) {
      errors.avatar_url = '⚠️ URL no segura o inválida';
    } else if (formData.avatar_url.length > this.CONFIG.MAX_LENGTHS.url) {
      errors.avatar_url = `⚠️ Máximo ${this.CONFIG.MAX_LENGTHS.url} caracteres`;
    }

    // 6. COLOR TEMA
    if (!formData.color_tema?.trim()) {
      errors.color_tema = '⚠️ Debes seleccionar un color';
    } else if (!this.isValidHexColor(formData.color_tema)) {
      errors.color_tema = '⚠️ Color inválido (formato: #667eea)';
    }

    // 7-10. MENSAJES
    const mensajes = [
      'mensaje_bienvenida',
      'mensaje_despedida',
      'mensaje_derivacion',
      'mensaje_fuera_horario',
    ];

    mensajes.forEach(campo => {
      sanitized[campo] = this.sanitizeText(formData[campo]);
      if (!sanitized[campo]) {
        errors[campo] = `⚠️ El ${campo.replace('mensaje_', 'mensaje de ')} es obligatorio`;
      } else if (sanitized[campo].length < 10) {
        errors[campo] = '⚠️ Mínimo 10 caracteres';
      } else if (sanitized[campo].length > this.CONFIG.MAX_LENGTHS.mensaje) {
        errors[campo] = `⚠️ Máximo ${this.CONFIG.MAX_LENGTHS.mensaje} caracteres`;
      }
    });

    // 11. TEMPERATURA
    if (!this.isInRange(formData.temperatura, 0, 2)) {
      errors.temperatura = '⚠️ Temperatura debe estar entre 0 y 2';
    }

    // 12. MAX TOKENS
    if (!this.isInRange(formData.max_tokens, 100, 100000)) {
      errors.max_tokens = '⚠️ Tokens debe estar entre 100 y 100,000';
    }

    // 13. PROMPT: MISIÓN (obligatorio)
    sanitized.prompt_mision = this.sanitizeText(formData.prompt_mision);
    if (!sanitized.prompt_mision) {
      errors.prompt_mision = '⚠️ La misión del agente es obligatoria';
    } else if (sanitized.prompt_mision.length < 10) {
      errors.prompt_mision = '⚠️ Mínimo 10 caracteres';
    } else if (sanitized.prompt_mision.length > 300) {
      errors.prompt_mision = '⚠️ Máximo 300 caracteres';
    }

    // 14. PROMPT: REGLAS (mínimo 2 obligatorias)
    if (!Array.isArray(formData.prompt_reglas)) {
      errors.prompt_reglas = '⚠️ Las reglas deben ser un array';
    } else {
      const reglasConContenido = formData.prompt_reglas.filter(r => r?.trim() !== '');

      if (reglasConContenido.length < 2) {
        errors.prompt_reglas = '⚠️ Debes definir al menos 2 reglas de comportamiento';
      }

      // Validar cada regla individualmente (solo las primeras 2 son obligatorias)
      formData.prompt_reglas.forEach((regla, index) => {
        if (index < 2 && !regla?.trim()) {
          errors[`prompt_regla_${index}`] = `⚠️ La regla ${index + 1} es obligatoria`;
        } else if (regla?.trim() && regla.trim().length > 200) {
          errors[`prompt_regla_${index}`] = `⚠️ Máximo 200 caracteres`;
        }
      });
    }

    // 15. PROMPT: TONO (obligatorio)
    if (!formData.prompt_tono) {
      errors.prompt_tono = '⚠️ Debes seleccionar un tono de comunicación';
    } else if (!['formal', 'amigable', 'tecnico'].includes(formData.prompt_tono)) {
      errors.prompt_tono = '⚠️ Tono inválido (debe ser: formal, amigable o tecnico)';
    }

    //15.5 PROMPT ESPECIALIZADO 
    sanitized.prompt_especializado = this.sanitizeText(formData.prompt_especializado || '');
    if (sanitized.prompt_especializado) {
      if (sanitized.prompt_especializado.length < 20) {
        errors.prompt_especializado = '⚠️ Mínimo 20 caracteres si lo incluyes';
      } else if (sanitized.prompt_especializado.length > this.CONFIG.MAX_LENGTHS.prompt_especializado) {
        errors.prompt_especializado = `⚠️ Máximo ${this.CONFIG.MAX_LENGTHS.prompt_especializado} caracteres`;
      }
    }

    // 16. PROMPT SISTEMA (validación condicional)
    // ⭐ IMPORTANTE: Este campo se construye dinámicamente en handleSaveForm()
    // combinando: prompt_mision + prompt_reglas + prompt_tono
    // Por eso NO se valida en el formulario inicial (estará vacío o undefined)
    // Solo validamos si ya viene construido (ej: al editar un agente existente)
    if (formData.prompt_sistema &&
      typeof formData.prompt_sistema === 'string' &&
      formData.prompt_sistema.trim() !== '') {
      // Si existe y tiene contenido real, validar longitud mínima
      if (formData.prompt_sistema.trim().length < 20) {
        errors.prompt_sistema = '⚠️ El prompt del sistema debe tener al menos 20 caracteres';
      }
    }

    // 17. VALIDAR HORARIOS
    if (formData.horarios) {
      try {
        let horarios = formData.horarios;

        // Si viene como string, parsearlo
        if (typeof horarios === 'string') {
          try {
            horarios = JSON.parse(horarios);
          } catch (e) {
            errors.horarios = '⚠️ Formato de horarios inválido (JSON corrupto)';
          }
        }

        // Validar estructura de cada día
        if (typeof horarios === 'object' && horarios !== null) {
          const diasValidos = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];

          Object.keys(horarios).forEach(dia => {
            // Verificar que sea un día válido
            if (!diasValidos.includes(dia)) {
              errors.horarios = `⚠️ Día inválido: ${dia}`;
              return;
            }

            const config = horarios[dia];

            // Verificar estructura del día
            if (typeof config !== 'object' || config === null) {
              errors[`horarios_${dia}`] = `⚠️ Configuración inválida para ${dia}`;
              return;
            }

            // Si está activo, validar bloques
            if (config.activo && Array.isArray(config.bloques)) {
              config.bloques.forEach((bloque, index) => {
                // Validar formato HH:MM (24 horas)
                const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

                // Validar hora de inicio
                if (!bloque.inicio || !timeRegex.test(bloque.inicio)) {
                  errors[`horarios_${dia}_bloque${index}`] =
                    `⚠️ Hora de inicio inválida en ${dia} (formato: HH:MM)`;
                }

                // Validar hora de fin
                if (!bloque.fin || !timeRegex.test(bloque.fin)) {
                  errors[`horarios_${dia}_bloque${index}`] =
                    `⚠️ Hora de fin inválida en ${dia} (formato: HH:MM)`;
                }

                // Validar que hora fin sea mayor que hora inicio
                if (bloque.inicio && bloque.fin && timeRegex.test(bloque.inicio) && timeRegex.test(bloque.fin)) {
                  const [horaIni, minIni] = bloque.inicio.split(':').map(Number);
                  const [horaFin, minFin] = bloque.fin.split(':').map(Number);
                  const minutosIni = horaIni * 60 + minIni;
                  const minutosFin = horaFin * 60 + minFin;

                  if (minutosFin <= minutosIni) {
                    errors[`horarios_${dia}_bloque${index}`] =
                      `⚠️ La hora de fin debe ser mayor que la de inicio en ${dia}`;
                  }
                }
              });

              // Validar que haya al menos un bloque si está activo
              if (config.bloques.length === 0) {
                errors[`horarios_${dia}`] =
                  `⚠️ ${dia} está activo pero no tiene horarios definidos`;
              }
            }
          });
        } else {
          errors.horarios = '⚠️ El campo horarios debe ser un objeto';
        }
      } catch (error) {
        console.error('Error validando horarios:', error);
        errors.horarios = '⚠️ Error al procesar horarios';
      }
    }

    // Resultado
    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }

  // ==================== SANITIZACIÓN COMPLETA ====================

  /**
   * Sanitizar todos los datos del formulario para guardar
   * @param {object} formData - Datos a sanitizar
   * @returns {object} Datos sanitizados y validados
   */
  static sanitizeAgenteData(formData) {
    return {
      // Strings sanitizados
      nombre_agente: this.truncateText(
        this.sanitizeText(formData.nombre_agente),
        this.CONFIG.MAX_LENGTHS.nombre
      ),
      area_especialidad: this.truncateText(
        this.sanitizeText(formData.area_especialidad),
        this.CONFIG.MAX_LENGTHS.nombre
      ),
      descripcion: this.truncateText(
        this.sanitizeText(formData.descripcion),
        this.CONFIG.MAX_LENGTHS.descripcion
      ),
      prompt_sistema: formData.prompt_sistema || '',
      mensaje_bienvenida: this.truncateText(
        this.sanitizeText(formData.mensaje_bienvenida),
        this.CONFIG.MAX_LENGTHS.mensaje
      ),
      prompt_especializado: formData.prompt_especializado ?
        this.truncateText(
          this.sanitizeText(formData.prompt_especializado),
          this.CONFIG.MAX_LENGTHS.prompt_especializado
        ) : '',
      mensaje_despedida: this.truncateText(
        this.sanitizeText(formData.mensaje_despedida),
        this.CONFIG.MAX_LENGTHS.mensaje
      ),
      mensaje_derivacion: this.truncateText(
        this.sanitizeText(formData.mensaje_derivacion),
        this.CONFIG.MAX_LENGTHS.mensaje
      ),
      mensaje_fuera_horario: this.truncateText(
        this.sanitizeText(formData.mensaje_fuera_horario),
        this.CONFIG.MAX_LENGTHS.mensaje
      ),

      // Números validados con límites
      temperatura: Math.max(0, Math.min(2, parseFloat(formData.temperatura) || 0.7)),
      max_tokens: Math.max(100, Math.min(100000, parseInt(formData.max_tokens) || 4000)),
      prioridad_routing: Math.max(0, Math.min(100, parseInt(formData.prioridad_routing) || 0)),

      // IDs seguros
      id_departamento: formData.id_departamento ?
        parseInt(formData.id_departamento) : null,

      // Booleanos seguros
      activo: Boolean(formData.activo),
      puede_ejecutar_acciones: Boolean(formData.puede_ejecutar_acciones),
      requiere_autenticacion: Boolean(formData.requiere_autenticacion),

      // URLs validadas
      avatar_url: this.isValidImageUrl(formData.avatar_url) ?
        this.truncateText(formData.avatar_url, this.CONFIG.MAX_LENGTHS.url) : null,

      // Color validado
      color_tema: this.isValidHexColor(formData.color_tema) ?
        formData.color_tema : '#667eea',

      // Opcionales sanitizados
      palabras_clave_trigger: formData.palabras_clave_trigger ?
        this.truncateText(
          this.sanitizeText(formData.palabras_clave_trigger),
          this.CONFIG.MAX_LENGTHS.palabras_clave
        ) : null,
      acciones_disponibles: formData.acciones_disponibles ?
        this.truncateText(
          this.sanitizeText(formData.acciones_disponibles),
          this.CONFIG.MAX_LENGTHS.acciones
        ) : null,

      // Valores fijos (no permitir cambios)
      tipo_agente: formData.tipo_agente || 'especializado',
      modelo_ia: 'llama3:8b',
      idioma_principal: 'es',
      zona_horaria: 'America/Guayaquil',
      icono: formData.icono || '🤖',
      herramientas_disponibles: formData.herramientas_disponibles || '',

      horarios: formData.horarios || null,
      creado_por: formData.creado_por ? parseInt(formData.creado_por) : null,
      actualizado_por: formData.actualizado_por ? parseInt(formData.actualizado_por) : null,
    };
  }

  // ==================== RATE LIMITING ====================

  /**
   * Crear un rate limiter
   * @returns {object} Funciones de rate limiting
   */
  static createRateLimiter() {
    let requestCount = 0;
    let lastResetTime = Date.now();

    return {
      check: (maxRequests = this.CONFIG.RATE_LIMITS.searchPerMinute) => {
        const now = Date.now();

        // Resetear cada minuto
        if (now - lastResetTime > 60000) {
          requestCount = 0;
          lastResetTime = now;
        }

        // Verificar límite
        if (requestCount >= maxRequests) {
          return {
            allowed: false,
            message: '⚠️ Has excedido el límite de operaciones. Espera un momento.',
          };
        }

        requestCount++;
        return {
          allowed: true,
          remaining: maxRequests - requestCount,
        };
      },

      reset: () => {
        requestCount = 0;
        lastResetTime = Date.now();
      },
    };
  }
}

export default SecurityValidator;
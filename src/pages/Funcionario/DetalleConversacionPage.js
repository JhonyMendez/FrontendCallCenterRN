// src/pages/Funcionario/DetalleConversacionPage.js
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { DetalleConversacionCard } from '../../components/Funcionario/DetalleConversacionCard';
import FuncionarioSidebar from '../../components/Sidebar/sidebarFuncionario';
import { contentStyles } from '../../components/Sidebar/SidebarSuperAdminStyles';
import { styles } from '../../styles/DetalleConversacionStyles';

// 🔐 ============ UTILIDADES DE SEGURIDAD ============
const SecurityUtils = {
    createRateLimiter(maxAttempts, windowMs) {
        const attempts = {};
        return {
            isAllowed(key) {
                const now = Date.now();
                if (!attempts[key]) {
                    attempts[key] = [];
                }
                attempts[key] = attempts[key].filter(time => now - time < windowMs);
                if (attempts[key].length >= maxAttempts) {
                    this.logSecurityEvent('RATE_LIMIT_EXCEEDED', { key, attempts: attempts[key].length });
                    return false;
                }
                attempts[key].push(now);
                return true;
            }
        };
    },

    validateId(id) {
        if (!id) return false;
        const numId = parseInt(id, 10);
        return !isNaN(numId) && numId > 0;
    },

    validateString(str, maxLength = 500) {
        if (!str || typeof str !== 'string') return false;
        if (str.trim().length === 0) return false;
        if (str.length > maxLength) return false;
        return true;
    },

    detectXssAttempt(text) {
        if (!text) return false;
        const xssPatterns = [
            /<script[^>]*>.*?<\/script>/gi,
            /on\w+\s*=/gi,
            /<iframe/gi,
            /javascript:/gi,
            /eval\(/gi,
            /onerror\s*=/gi,
            /onload\s*=/gi,
        ];
        return xssPatterns.some(pattern => pattern.test(text));
    },

    sanitizeText(text) {
        if (!text) return '';
        return text
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;')
            .replace(/\//g, '&#x2F;')
            .trim();
    },

    logSecurityEvent(eventType, details) {
        const timestamp = new Date().toISOString();
        console.warn('🔒 SECURITY EVENT:', {
            timestamp,
            eventType,
            details,
            userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A',
        });
    }
};

const DetalleConversacionPage = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const flatListRef = useRef(null);
  
  // 🔐 Rate limiters para operaciones críticas
  const rateLimiterEnvio = useRef(SecurityUtils.createRateLimiter(10, 60000)).current; // 10 mensajes/minuto
  const rateLimiterVerificacion = useRef(SecurityUtils.createRateLimiter(20, 60000)).current; // 20 verificaciones/minuto
  
  const [mensaje, setMensaje] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mensajes, setMensajes] = useState([
    {
      id: '1',
      texto: 'Hola soy Juan Alfredo del área de secretaría. He revisado tu consulta y sí, parece que las inscripciones podrían aplazarse.',
      tipo: 'recibido',
      hora: '10:23 AM',
      autor: 'Juan Alfredo',
    },
    {
      id: '2',
      texto: 'Nooooooo porque y cuando son las fechas de inscripción',
      tipo: 'enviado',
      hora: '10:25 AM',
      autor: 'Visitante',
    },
  ]);

  // 🔐 Validar y sanitizar parámetros al inicializar
  const visitante = params.visitante ? SecurityUtils.sanitizeText(String(params.visitante)) : 'Visitante Anónimo';
  const codigo = params.codigo ? SecurityUtils.sanitizeText(String(params.codigo)) : 'XXXX-0000';

  // 🔐 Función para cargar y validar mensajes
  const cargarMensajes = () => {
    try {
      // 🔐 Validar que no sea acceso demasiado frecuente
      if (!rateLimiterVerificacion.isAllowed('cargarMensajes')) {
        SecurityUtils.logSecurityEvent('RATE_LIMIT_CARGAR_MENSAJES', {
          razon: 'demasiadas_cargas'
        });
        return;
      }

      // Los mensajes vienen desde el estado local (simulado)
      // En producción, aquí se traerían de la API
      SecurityUtils.logSecurityEvent('MENSAJES_CARGADOS', {
        cantidad: mensajes.length,
        visitante: visitante
      });
    } catch (error) {
      console.error('❌ Error cargando mensajes:', error);
      SecurityUtils.logSecurityEvent('ERROR_LOAD_MESSAGES', {
        error: error.message
      });
    }
  };

  // 🔐 Validar que los parámetros son válidos
  useEffect(() => {
    // Detectar XSS en visitante y código
    if (params.visitante && SecurityUtils.detectXssAttempt(params.visitante)) {
      SecurityUtils.logSecurityEvent('XSS_ATTEMPT_VISITANTE', { visitante: params.visitante });
      Alert.alert('Error de Seguridad', 'Se detectó un intento de inyección maliciosa.');
      router.back();
      return;
    }

    if (params.codigo && SecurityUtils.detectXssAttempt(params.codigo)) {
      SecurityUtils.logSecurityEvent('XSS_ATTEMPT_CODIGO', { codigo: params.codigo });
      Alert.alert('Error de Seguridad', 'Se detectó un intento de inyección maliciosa.');
      router.back();
      return;
    }

    // 🔐 Cargar mensajes de forma segura
    cargarMensajes();

    // 🔐 Scroll al final
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: false });
    }, 100);
  }, []);

  const enviarMensaje = () => {
    try {
      // 🔐 Rate limiting: máx 10 mensajes por minuto
      if (!rateLimiterEnvio.isAllowed('enviarMensaje')) {
        SecurityUtils.logSecurityEvent('RATE_LIMIT_ENVIAR_MENSAJE', {
          razon: 'demasiados_mensajes'
        });
        Alert.alert('Límite excedido', 'Estás escribiendo demasiado rápido. Espera un momento.');
        return;
      }

      // 🔐 Validar que el mensaje no esté vacío
      if (!SecurityUtils.validateString(mensaje, 500)) {
        SecurityUtils.logSecurityEvent('INVALID_MESSAGE_FORMAT', {
          razon: 'mensaje_invalido',
          length: mensaje.length
        });
        Alert.alert('Mensaje inválido', 'El mensaje debe tener entre 1 y 500 caracteres.');
        return;
      }

      // 🔐 Detectar intentos XSS en el mensaje
      if (SecurityUtils.detectXssAttempt(mensaje)) {
        SecurityUtils.logSecurityEvent('XSS_ATTEMPT_MESSAGE', {
          razon: 'xss_pattern_detected',
          mensaje: mensaje.substring(0, 100)
        });
        Alert.alert('Seguridad', 'Se detectó un intento de inyección maliciosa. Por favor, revisa tu mensaje.');
        return;
      }

      // 🔐 Sanitizar el mensaje
      const mensajeSanitizado = SecurityUtils.sanitizeText(mensaje);

      const nuevoMensaje = {
        id: Date.now().toString(),
        texto: mensajeSanitizado,
        tipo: 'enviado',
        hora: new Date().toLocaleTimeString('es-ES', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        autor: 'Funcionario',
      };

      // 🔐 Log de evento: Mensaje enviado exitosamente
      SecurityUtils.logSecurityEvent('MESSAGE_SENT', {
        id: nuevoMensaje.id,
        length: mensajeSanitizado.length
      });

      setMensajes([...mensajes, nuevoMensaje]);
      setMensaje('');

      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error('❌ Error enviando mensaje:', error);
      SecurityUtils.logSecurityEvent('ERROR_SEND_MESSAGE', {
        error: error.message,
        stack: error.stack
      });
      Alert.alert('Error', 'Ocurrió un error al enviar el mensaje. Intenta de nuevo.');
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Ionicons name="arrow-back" size={24} color="#1F2937" />
      </TouchableOpacity>

      <View style={styles.headerInfo}>
        <View style={styles.headerAvatar}>
          <Ionicons name="person" size={20} color="#4A90E2" />
        </View>
        <View style={styles.headerTexto}>
          <Text style={styles.headerNombre}>{visitante}</Text>
          <Text style={styles.headerCodigo}>ID: {codigo}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.headerButton}>
        <Ionicons name="ellipsis-vertical" size={24} color="#1F2937" />
      </TouchableOpacity>
    </View>
  );

  const renderContexto = () => (
    <View style={styles.contextoContainer}>
      <Text style={styles.contextoTitle}>Contexto de la conversación</Text>
      <Text style={styles.contextoText}>
        En esta conversación se habían consultado las fechas de inscripción de las becas en el año 2025, y la duda es si existe o no algún aplazamiento.
      </Text>
      <View style={styles.contextoMeta}>
        <View style={styles.contextoMetaItem}>
          <Ionicons name="calendar-outline" size={14} color="#6B7280" />
          <Text style={styles.contextoMetaText}>Inicio de conversación: 10:23 AM - Hoy</Text>
        </View>
        <View style={styles.contextoMetaItem}>
          <Ionicons name="desktop-outline" size={14} color="#6B7280" />
          <Text style={styles.contextoMetaText}>Desktop - Chrome</Text>
        </View>
        <View style={styles.contextoMetaItem}>
          <Ionicons name="person-outline" size={14} color="#6B7280" />
          <Text style={styles.contextoMetaText}>Agente Académico</Text>
        </View>
      </View>
    </View>
  );

  const renderTransferencia = () => (
    <View style={styles.transferenciaContainer}>
      <Ionicons name="information-circle-outline" size={20} color="#4A90E2" />
      <View style={styles.transferenciaTexto}>
        <Text style={styles.transferenciaTitle}>Conversación transferida</Text>
        <Text style={styles.transferenciaSubtext}>
          El bot ha derivado esta conversación por su complejidad
        </Text>
      </View>
    </View>
  );

  return (
    <View style={contentStyles.wrapper}>
      
      {/* ============ SIDEBAR ============ */}
      <FuncionarioSidebar 
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* ============ BOTÓN TOGGLE SIDEBAR ============ */}
      <TouchableOpacity
        style={{
          position: 'absolute',
          top: 16,
          left: sidebarOpen ? 296 : 16,
          zIndex: 1001,
          backgroundColor: '#1e1b4b',
          padding: 12,
          borderRadius: 12,
          shadowColor: '#667eea',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.4,
          shadowRadius: 8,
          elevation: 8,
        }}
        onPress={() => setSidebarOpen(!sidebarOpen)}
      >
        <Ionicons name={sidebarOpen ? "close" : "menu"} size={24} color="#ffffff" />
      </TouchableOpacity>

      {/* ============ CONTENIDO PRINCIPAL ============ */}
      <View style={[
        contentStyles.mainContent, 
        sidebarOpen && contentStyles.mainContentWithSidebar
      ]}>
        <KeyboardAvoidingView 
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
          {renderHeader()}
          
          <FlatList
            ref={flatListRef}
            data={mensajes}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <DetalleConversacionCard mensaje={item} />
            )}
            ListHeaderComponent={() => (
              <>
                {renderContexto()}
                {renderTransferencia()}
              </>
            )}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          />

          <View style={styles.inputContainer}>
            <TouchableOpacity style={styles.attachButton}>
              <Ionicons name="attach-outline" size={24} color="#6B7280" />
            </TouchableOpacity>

            <TextInput
              style={styles.input}
              placeholder="Escribe tu mensaje..."
              value={mensaje}
              onChangeText={setMensaje}
              multiline
              maxLength={500}
            />

            <TouchableOpacity 
              style={[styles.sendButton, !mensaje.trim() && styles.sendButtonDisabled]}
              onPress={enviarMensaje}
              disabled={!mensaje.trim()}
            >
              <Ionicons 
                name="send" 
                size={20} 
                color={mensaje.trim() ? "#FFFFFF" : "#9CA3AF"} 
              />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </View>
  );
};

export default DetalleConversacionPage;
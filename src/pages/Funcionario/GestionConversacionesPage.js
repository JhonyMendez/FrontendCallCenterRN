// src/pages/Funcionario/GestionConversacionesPage.js
// 🔥 VERSIÓN CON NOTIFICACIONES Y SONIDO

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { escalamientoService } from '../../api/services/escalamientoService';
import { DetalleConversacionCard } from '../../components/Funcionario/DetalleConversacionCard';
import DisponibilidadToggle from '../../components/Funcionario/DisponibilidadToggle';
import { GestionConversacionesCard } from '../../components/Funcionario/GestionConversacionesCard';
import NotificacionesBadge from '../../components/Funcionario/NotificacionesBadge';
import FuncionarioSidebar from '../../components/Sidebar/sidebarFuncionario';
import { contentStyles } from '../../components/Sidebar/SidebarSuperAdminStyles';
import { getUserIdFromToken } from '../../components/utils/authHelper';
import { useNotificaciones } from '../../hooks/useNotificaciones'; // 🔥 NUEVO

// 🔒 SECURITY: Anti-hacking utilities
const SecurityUtils = {
  sanitizeInput: (text) => {
    if (typeof text !== 'string') return '';
    return text
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .replace(/<[^>]*>/g, '')
      .trim();
  },

  encodeOutput: (text) => {
    if (typeof text !== 'string') return '';
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  },

  isValidEmail: (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  },

  isValidUrl: (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },

  validateNumberRange: (num, min = 0, max = Infinity) => {
    const n = parseInt(num);
    return !isNaN(n) && n >= min && n <= max;
  },

  validateStringLength: (str, min = 0, max = Infinity) => {
    return typeof str === 'string' && str.length >= min && str.length <= max;
  },

  sanitizeSqlInput: (input) => {
    if (typeof input !== 'string') return '';
    return input
      .replace(/'/g, "''")
      .replace(/"/g, '\\"')
      .replace(/;/g, '')
      .replace(/--/g, '')
      .replace(/\/\*/g, '')
      .replace(/\*\//g, '');
  },

  createRateLimiter: (maxAttempts = 30, timeWindowMs = 60000) => {
    const attempts = new Map();
    return {
      attempts,
      isAllowed: (key) => {
        const now = Date.now();
        const userAttempts = attempts.get(key) || [];
        const recentAttempts = userAttempts.filter(time => now - time < timeWindowMs);

        if (recentAttempts.length >= maxAttempts) {
          return false;
        }

        recentAttempts.push(now);
        attempts.set(key, recentAttempts);
        return true;
      }
    };
  },

  logSecurityEvent: (eventType, details = {}) => {
    const logEntry = {
      timestamp: new Date().toISOString(),
      eventType,
      details,
      userAgent: Platform.OS
    };
    console.log('🔒 SECURITY EVENT:', JSON.stringify(logEntry, null, 2));
  },

  validateDateFormat: (dateStr) => {
    const date = new Date(dateStr);
    return date instanceof Date && !isNaN(date);
  },

  generateCSRFToken: () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  },

  validateCSRFToken: (token) => {
    return typeof token === 'string' && token.length > 0;
  }
};

const GestionConversacionesPage = () => {
  const router = useRouter();
  const [conversaciones, setConversaciones] = useState([]);
  const [conversacionSeleccionada, setConversacionSeleccionada] = useState(null);
  const [mensajesDetalle, setMensajesDetalle] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingDetalle, setLoadingDetalle] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [vistaActual, setVistaActual] = useState('mis');
  const [filtroEstado, setFiltroEstado] = useState('todas');
  const [mensajeTexto, setMensajeTexto] = useState('');
  const [enviando, setEnviando] = useState(false);

  // Estado de usuario autenticado
  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState('Usuario');
  const [userDepartment, setUserDepartment] = useState(null);
  const [disponible, setDisponible] = useState(false); // 🔥 NUEVO: Estado de disponibilidad

  // 🔥 NUEVO: Hook de notificaciones
  const {
    notificacionesPendientes,
    marcarVistas,
    verificarAhora,
  } = useNotificaciones(userId, disponible, 15000); // Solo si está disponible

  const isWeb = Platform.OS === 'web';
  const flatListRef = useRef(null);
  const rateLimiterRef = useRef(null);

  // 🔒 SECURITY: Initialize rate limiter on mount
  useEffect(() => {
    if (!rateLimiterRef.current) {
      rateLimiterRef.current = SecurityUtils.createRateLimiter(100, 60000); // 100 intentos por minuto
    }
  }, []);

  // ============================================
  // OBTENER DATOS DEL USUARIO AUTENTICADO
  // ============================================
  useEffect(() => {
    const obtenerUsuario = async () => {
      try {
        const id = await getUserIdFromToken();
        if (id) {
          setUserId(id);
          console.log('✅ Usuario autenticado:', id);

          // TODO: Obtener nombre y departamento del backend
          // const userData = await usuarioService.getMiPerfil();
          // setUserName(userData.nombre);
          // setUserDepartment(userData.id_departamento);
        } else {
          Alert.alert('Error', 'No se pudo obtener información del usuario');
          router.push('/login');
        }
      } catch (error) {
        console.error('❌ Error obteniendo usuario:', error);
        router.push('/login');
      }
    };

    obtenerUsuario();
  }, []);

  // ============================================
  // CARGAR CONVERSACIONES
  // ============================================
  useEffect(() => {
    if (userId) {
      cargarConversaciones();
      const interval = setInterval(cargarConversaciones, 30000);
      return () => clearInterval(interval);
    }
  }, [vistaActual, filtroEstado, userId]);

  // Auto-refresh del detalle
  useEffect(() => {
    if (conversacionSeleccionada) {
      const interval = setInterval(() => {
        cargarDetalleConversacion(conversacionSeleccionada.sessionId, true);
      }, 15000);
      return () => clearInterval(interval);
    }
  }, [conversacionSeleccionada]);

  const cargarConversaciones = async () => {
    if (!userId) return;

    // 🔒 SECURITY: Rate limiting
    if (!rateLimiterRef.current.isAllowed('cargarConversaciones')) {
      SecurityUtils.logSecurityEvent('RATE_LIMIT_EXCEEDED', { 
        function: 'cargarConversaciones',
        userId,
        timestamp: new Date().toISOString()
      });
      Alert.alert('⚠️ Seguridad', 'Demasiadas solicitudes. Por favor, espera un momento.');
      return;
    }

    SecurityUtils.logSecurityEvent('LOAD_CONVERSATIONS_START', {
      function: 'cargarConversaciones',
      vista: vistaActual,
      filtro: filtroEstado,
      userId,
      timestamp: new Date().toISOString()
    });

    try {
      setLoading(true);

      let response;

      if (vistaActual === 'mis') {
        response = await escalamientoService.getMisConversaciones(userId, {
          solo_activas: filtroEstado !== 'resueltas',
          limite: 50
        });
      } else {
        response = await escalamientoService.getAllEscaladas({
          solo_pendientes: filtroEstado === 'pendientes',
          id_departamento: userDepartment
        });
      }

      if (response.success) {
        const conversacionesFormateadas = response.conversaciones.map(conv => ({
          id: conv.session_id,
          visitante: 'Visitante Anónimo',
          codigo: conv.session_id.substring(0, 8).toUpperCase(),
          ultimoMensaje: conv.ultimo_mensaje || 'Sin mensajes',
          fecha: formatearFecha(conv.fecha_ultimo_mensaje || conv.fecha_escalamiento),
          dispositivo: 'Web',
          agente: conv.agent_name || 'Agente Virtual',
          noLeidos: 0,
          estado: mapearEstado(conv.estado),
          sessionId: conv.session_id,
          totalMensajes: conv.total_mensajes || 0,
          escaladoAId: conv.escalado_a_usuario_id || conv.escaladoAUsuarioId || conv.id_usuario_asignado,
          escaladoA: conv.escalado_a_usuario_nombre,
          tiempoEspera: conv.tiempo_espera_minutos,
          prioridad: conv.prioridad || 'normal',
          requiereAtencion: conv.requiere_atencion || false
        }));

        let conversacionesFiltradas = conversacionesFormateadas;

        if (filtroEstado === 'resueltas') {
          conversacionesFiltradas = conversacionesFormateadas.filter(c => c.estado === 'cerrada');
        } else if (filtroEstado === 'pendientes') {
          conversacionesFiltradas = conversacionesFormateadas.filter(c => c.estado !== 'cerrada');
        }

        const conversacionesOrdenadas = escalamientoService.ordenarPorPrioridad(conversacionesFiltradas);

        setConversaciones(conversacionesOrdenadas);

        SecurityUtils.logSecurityEvent('LOAD_CONVERSATIONS_SUCCESS', {
          function: 'cargarConversaciones',
          count: conversacionesOrdenadas.length,
          userId,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      SecurityUtils.logSecurityEvent('LOAD_CONVERSATIONS_ERROR', {
        function: 'cargarConversaciones',
        error: error.message,
        userId,
        timestamp: new Date().toISOString()
      });
      console.error('Error al cargar conversaciones:', error);
      Alert.alert('Error', 'No se pudieron cargar las conversaciones');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ✅ Función para formatear hora en zona horaria Ecuador (UTC-5) - Método Directo
  const formatearHoraEcuador = (timestamp) => {
    try {
      if (!timestamp) {
        const ahora = new Date();
        return formatearHoraDirecta(ahora);
      }
      
      let fecha;
      
      // Manejar diferentes formatos de timestamp
      if (typeof timestamp === 'number') {
        fecha = new Date(timestamp);
        if (timestamp < 10000000000) {
          fecha = new Date(timestamp * 1000);
        }
      } else if (typeof timestamp === 'string') {
        // Limpiar formato con microsegundos
        let timestampLimpio = timestamp.trim();
        
        if (timestampLimpio.includes('.')) {
          const [parteBase, parteDecimal] = timestampLimpio.split('.');
          const milisegundos = parteDecimal.substring(0, 3);
          timestampLimpio = `${parteBase}.${milisegundos}`;
          
          if (!timestampLimpio.includes('Z') && !timestampLimpio.includes('+') && !timestampLimpio.includes('-', 10)) {
            timestampLimpio += 'Z';
          }
        }
        
        fecha = new Date(timestampLimpio);
        
        if (isNaN(fecha.getTime())) {
          fecha = new Date(timestamp.replace(/\.\d+/, '') + 'Z');
        }
        
        if (isNaN(fecha.getTime())) {
          console.warn('No se pudo parsear timestamp:', timestamp);
          fecha = new Date();
        }
      } else {
        fecha = new Date(timestamp);
      }
      
      // Validar
      if (isNaN(fecha.getTime())) {
        fecha = new Date();
      }
      
      // Crear fecha de Ecuador restando 5 horas (UTC-5)
      const fechaEcuador = new Date(fecha.getTime() - (5 * 60 * 60 * 1000));
      
      console.log('✅ Hora Ecuador CORRECTA:', {
        utc: fecha.toISOString(),
        ecuadorDirect: fechaEcuador.toISOString(),
        formatted: formatearHoraDirecta(fechaEcuador)
      });
      
      return formatearHoraDirecta(fechaEcuador);
      
    } catch (error) {
      console.error('❌ Error formateando hora:', error);
      return formatearHoraDirecta(new Date());
    }
  };

  // Helper para formatear directamente sin toLocaleString
  const formatearHoraDirecta = (fecha) => {
    const horas = String(fecha.getUTCHours()).padStart(2, '0');
    const minutos = String(fecha.getUTCMinutes()).padStart(2, '0');
    const segundos = String(fecha.getUTCSeconds()).padStart(2, '0');
    return `${horas}:${minutos}:${segundos}`;
  };

  const cargarDetalleConversacion = async (sessionId, silencioso = false) => {
    try {
      if (!silencioso) setLoadingDetalle(true);

      const response = await escalamientoService.getDetalle(sessionId);

      if (response.success) {
        const mensajesFormateados = response.conversation.messages.map((msg) => {
          console.log('📨 Mensaje recibido:', {
            timestamp: msg.timestamp,
            tipo: typeof msg.timestamp,
            content: msg.content?.substring(0, 50),
          });
          return {
            texto: msg.content,
            tipo: msg.role === 'user' ? 'recibido' : 'enviado',
            hora: formatearHoraEcuador(msg.timestamp),
            autor: msg.role === 'assistant'
              ? '🤖 Bot'
              : msg.role === 'human_agent'
                ? `🧑‍💼 ${msg.user_name || 'Humano'}`
                : '👤 Visitante',
            role: msg.role
          };
        });

        setMensajesDetalle(mensajesFormateados);

        if (!silencioso) {
          setTimeout(() => scrollToEnd(), 100);
        }
      }
    } catch (error) {
      console.error('Error cargando detalle:', error);
      if (!silencioso) {
        Alert.alert('Error', 'No se pudo cargar el detalle de la conversación');
      }
    } finally {
      setLoadingDetalle(false);
    }
  };

  // ============================================
  // ACCIONES DE CONVERSACIÓN
  // ============================================

  const handleEnviarMensaje = async () => {
    if (!mensajeTexto.trim() || !conversacionSeleccionada || !userId) return;

    // 🔒 SECURITY: Rate limiting
    if (!rateLimiterRef.current.isAllowed('handleEnviarMensaje')) {
      SecurityUtils.logSecurityEvent('RATE_LIMIT_EXCEEDED', { 
        function: 'handleEnviarMensaje',
        sessionId: conversacionSeleccionada.sessionId,
        userId,
        timestamp: new Date().toISOString()
      });
      Alert.alert('⚠️ Seguridad', 'Envías mensajes demasiado rápido. Por favor, espera un momento.');
      return;
    }

    // 🔒 SECURITY: Sanitize message
    const mensajeSanitizado = SecurityUtils.sanitizeInput(mensajeTexto.trim());
    
    if (!mensajeSanitizado || mensajeSanitizado.length === 0) {
      SecurityUtils.logSecurityEvent('MESSAGE_SANITIZATION_FAILED', {
        function: 'handleEnviarMensaje',
        sessionId: conversacionSeleccionada.sessionId,
        userId,
        timestamp: new Date().toISOString()
      });
      Alert.alert('⚠️ Mensaje inválido', 'El mensaje contiene caracteres no permitidos.');
      return;
    }

    SecurityUtils.logSecurityEvent('MESSAGE_SEND_ATTEMPT', {
      function: 'handleEnviarMensaje',
      sessionId: conversacionSeleccionada.sessionId,
      messageLength: mensajeSanitizado.length,
      userId,
      timestamp: new Date().toISOString()
    });

    try {
      setEnviando(true);

      await escalamientoService.responder(conversacionSeleccionada.sessionId, {
        mensaje: mensajeSanitizado,
        id_usuario: userId,
        nombre_usuario: userName
      });

      SecurityUtils.logSecurityEvent('MESSAGE_SEND_SUCCESS', {
        function: 'handleEnviarMensaje',
        sessionId: conversacionSeleccionada.sessionId,
        userId,
        timestamp: new Date().toISOString()
      });

      setMensajeTexto('');
      await cargarDetalleConversacion(conversacionSeleccionada.sessionId, true);

      setTimeout(() => scrollToEnd(), 200);
    } catch (error) {
      SecurityUtils.logSecurityEvent('MESSAGE_SEND_ERROR', {
        function: 'handleEnviarMensaje',
        sessionId: conversacionSeleccionada.sessionId,
        error: error.message,
        userId,
        timestamp: new Date().toISOString()
      });
      console.error('Error enviando mensaje:', error);
      Alert.alert('Error', 'No se pudo enviar el mensaje');
    } finally {
      setEnviando(false);
    }
  };

  // 🔥 NUEVO: Callback cuando cambia disponibilidad
  const handleDisponibilidadCambiada = (nuevoEstado, response) => {
    console.log('✅ Disponibilidad cambiada:', nuevoEstado);
    setDisponible(nuevoEstado);
    
    if (nuevoEstado) {
      // Verificar notificaciones al activarse
      verificarAhora();
    }
  };

  // ============================================
  // HELPERS
  // ============================================

  const formatearFecha = (fechaStr) => {
    if (!fechaStr) return 'Sin fecha';

    const fecha = new Date(fechaStr);
    const ahora = new Date();
    const diffMs = ahora - fecha;
    const diffHoras = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDias = Math.floor(diffHoras / 24);

    if (diffHoras < 1) return 'Hace unos minutos';
    if (diffHoras < 24) {
      const hora = fecha.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
      });
      return `${hora} - Hoy`;
    }
    if (diffDias === 1) return 'Ayer';
    if (diffDias < 7) return `${diffDias} días`;

    return fecha.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit'
    });
  };

  const mapearEstado = (estadoBackend) => {
    const mapeo = {
      'activa': 'activa',
      'escalada_humano': 'escalada',
      'finalizada': 'cerrada'
    };
    return mapeo[estadoBackend] || 'activa';
  };

  const scrollToEnd = () => {
    flatListRef.current?.scrollToEnd({ animated: true });
  };

  const handleRefresh = () => {
    setRefreshing(true);
    cargarConversaciones();
    verificarAhora(); // 🔥 Verificar notificaciones también
  };

  const handleVerConversacion = (conversacion) => {
    setConversacionSeleccionada(conversacion);
    setMensajeTexto('');
    cargarDetalleConversacion(conversacion.sessionId);
    marcarVistas(); // 🔥 Marcar notificaciones como vistas
  };

  const handleVolverLista = () => {
    setConversacionSeleccionada(null);
    setMensajesDetalle([]);
    setMensajeTexto('');
  };

  const handleNotificacionPress = (url) => {
    if (url) {
      const match = url.match(/\/conversacion\/(.+)/);
      if (match) {
        const sessionId = decodeURIComponent(match[1]);
        const conv = conversaciones.find(c => c.sessionId === sessionId);
        if (conv) {
          handleVerConversacion(conv);
        } else {
          cargarDetalleConversacion(sessionId);
        }
      }
    }
  };

  // ============================================
  // RENDER LISTA
  // ============================================
  const renderLista = () => {
    const renderHeader = () => (
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Conversaciones Escaladas</Text>
            <Text style={styles.headerSubtitle}>
              {conversaciones.length} conversación{conversaciones.length !== 1 ? 'es' : ''}
              {/* 🔥 NUEVO: Mostrar notificaciones pendientes */}
              {notificacionesPendientes > 0 && (
                <Text style={styles.headerSubtitleAlert}>
                  {' '}• {notificacionesPendientes} nueva{notificacionesPendientes !== 1 ? 's' : ''}
                </Text>
              )}
            </Text>
          </View>
          
          <View style={styles.headerActions}>
            {/* 🔥 Toggle de Disponibilidad con texto */}
            <DisponibilidadToggle
              userId={userId}
              onEstadoCambiado={handleDisponibilidadCambiada}
              compacto={true}
            />
            
            <NotificacionesBadge
              userId={userId}
              onNotificacionPress={handleNotificacionPress}
            />
          </View>
        </View>

        {/* Selector de vista */}
        <View style={styles.vistaContainer}>
          <TouchableOpacity
            style={[styles.vistaButton, vistaActual === 'mis' && styles.vistaButtonActive]}
            onPress={() => setVistaActual('mis')}
          >
            <Ionicons
              name="person"
              size={18}
              color={vistaActual === 'mis' ? '#FFF' : '#6B7280'}
            />
            <Text style={[
              styles.vistaButtonText,
              vistaActual === 'mis' && styles.vistaButtonTextActive
            ]}>
              Mis Conversaciones
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.vistaButton, vistaActual === 'todas' && styles.vistaButtonActive]}
            onPress={() => setVistaActual('todas')}
          >
            <Ionicons
              name="people"
              size={18}
              color={vistaActual === 'todas' ? '#FFF' : '#6B7280'}
            />
            <Text style={[
              styles.vistaButtonText,
              vistaActual === 'todas' && styles.vistaButtonTextActive
            ]}>
              Todas
            </Text>
          </TouchableOpacity>
        </View>

        {/* Filtros de estado */}
        <View style={styles.filtrosContainer}>
          <TouchableOpacity
            style={[styles.filtroButton, filtroEstado === 'todas' && styles.filtroButtonActive]}
            onPress={() => setFiltroEstado('todas')}
          >
            <Text style={[
              styles.filtroButtonText,
              filtroEstado === 'todas' && styles.filtroButtonTextActive
            ]}>
              Todas
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filtroButton, filtroEstado === 'pendientes' && styles.filtroButtonActive]}
            onPress={() => setFiltroEstado('pendientes')}
          >
            <Text style={[
              styles.filtroButtonText,
              filtroEstado === 'pendientes' && styles.filtroButtonTextActive
            ]}>
              Pendientes
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filtroButton, filtroEstado === 'resueltas' && styles.filtroButtonActive]}
            onPress={() => setFiltroEstado('resueltas')}
          >
            <Text style={[
              styles.filtroButtonText,
              filtroEstado === 'resueltas' && styles.filtroButtonTextActive
            ]}>
              Resueltas
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );

    const renderEmpty = () => (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>📭</Text>
        <Text style={styles.emptyText}>
          {vistaActual === 'mis'
            ? 'No tienes conversaciones asignadas'
            : 'No hay conversaciones escaladas'}
        </Text>
        <Text style={styles.emptySubtext}>
          {vistaActual === 'mis'
            ? 'Las conversaciones que tomes aparecerán aquí'
            : 'Las conversaciones escaladas aparecerán aquí'}
        </Text>
      </View>
    );

    return (
      <View style={styles.container}>
        {renderHeader()}

        <FlatList
          data={conversaciones}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <GestionConversacionesCard
              conversacion={item}
              onPress={() => handleVerConversacion(item)}
              esPropia={item.escaladoAId === userId}
            />
          )}
          ListEmptyComponent={renderEmpty}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          contentContainerStyle={conversaciones.length === 0 ? styles.emptyList : styles.list}
          showsVerticalScrollIndicator={false}
        />
      </View>
    );
  };

  // ============================================
  // RENDER DETALLE (igual que antes, sin cambios)
  // ============================================
  const renderDetalle = () => {
    const esPropia = conversacionSeleccionada?.escaladoAId === userId;
    const puedeTransferir = esPropia && conversacionSeleccionada?.estado !== 'cerrada';

    return (
      <KeyboardAvoidingView
        style={styles.detalleContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.detalleHeader}>
          <TouchableOpacity onPress={handleVolverLista} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </TouchableOpacity>

          <View style={styles.detalleHeaderInfo}>
            <Text style={styles.detalleHeaderTitle}>
              {conversacionSeleccionada.visitante}
            </Text>
            <Text style={styles.detalleHeaderSubtitle}>
              ID: {conversacionSeleccionada.codigo}
              {conversacionSeleccionada.escaladoA &&
                ` • Atendido por: ${conversacionSeleccionada.escaladoA}`
              }
            </Text>
          </View>

          <View style={styles.detalleHeaderActions}>
          </View>
        </View>

        {conversacionSeleccionada.tiempoEspera && (
          <View style={[
            styles.prioridadBanner,
            { backgroundColor: escalamientoService.getColorPrioridad(conversacionSeleccionada.prioridad) + '20' }
          ]}>
            <Ionicons
              name="time"
              size={16}
              color={escalamientoService.getColorPrioridad(conversacionSeleccionada.prioridad)}
            />
            <Text style={[
              styles.prioridadText,
              { color: escalamientoService.getColorPrioridad(conversacionSeleccionada.prioridad) }
            ]}>
              Tiempo de espera: {escalamientoService.formatearTiempoEspera(conversacionSeleccionada.tiempoEspera)}
            </Text>
          </View>
        )}

        {loadingDetalle ? (
          <View style={styles.loadingDetalle}>
            <ActivityIndicator size="large" color="#4A90E2" />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={mensajesDetalle}
            keyExtractor={(item, index) => `mensaje-${index}`}
            renderItem={({ item }) => <DetalleConversacionCard mensaje={item} />}
            contentContainerStyle={styles.mensajesList}
            onContentSizeChange={scrollToEnd}
          />
        )}

        {esPropia && conversacionSeleccionada.estado !== 'cerrada' && (
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Escribe tu respuesta..."
              placeholderTextColor="#94A3B8"
              value={mensajeTexto}
              onChangeText={setMensajeTexto}
              onKeyPress={(e) => {
                if (e.nativeEvent.key === 'Enter' && !e.nativeEvent.shiftKey) {
                  e.preventDefault();
                  if (mensajeTexto.trim() && !enviando) {
                    handleEnviarMensaje();
                  }
                }
              }}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                (!mensajeTexto.trim() || enviando) && styles.sendButtonDisabled
              ]}
              onPress={handleEnviarMensaje}
              disabled={!mensajeTexto.trim() || enviando}
            >
              {enviando ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Ionicons name="send" size={20} color="#FFF" />
              )}
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    );
  };

  // ============================================
  // RENDER PRINCIPAL
  // ============================================
  if (loading || !userId) {
    return (
      <View style={contentStyles.wrapper}>
        <FuncionarioSidebar isOpen={sidebarOpen} />
        <View style={[contentStyles.mainContent, sidebarOpen && contentStyles.mainContentWithSidebar]}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4A90E2" />
            <Text style={styles.loadingText}>Cargando conversaciones...</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={contentStyles.wrapper}>
      {isWeb && (
        <FuncionarioSidebar
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
          onNavigate={() => setSidebarOpen(false)}
        />
      )}

      {!isWeb && sidebarOpen && (
        <>
          <TouchableOpacity
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 998,
            }}
            onPress={() => setSidebarOpen(false)}
            activeOpacity={1}
          />

          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              bottom: 0,
              width: '80%',
              maxWidth: 320,
              zIndex: 999,
            }}
          >
            <FuncionarioSidebar
              isOpen={sidebarOpen}
              onNavigate={() => setSidebarOpen(false)}
            />
          </View>
        </>
      )}

      {!conversacionSeleccionada && (
        <TouchableOpacity
          style={{
            position: 'absolute',
            top: 16,
            left: isWeb ? (sidebarOpen ? 296 : 16) : 16,
            zIndex: 1001,
            backgroundColor: '#1e1b4b',
            padding: 12,
            borderRadius: 12,
            shadowColor: '#667eea',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.4,
            shadowRadius: 8,
            elevation: 8,
            transform: [
              { translateX: sidebarOpen && !isWeb ? 280 : 0 }
            ],
          }}
          onPress={() => setSidebarOpen(!sidebarOpen)}
        >
          <Ionicons name={sidebarOpen ? "close" : "menu"} size={24} color="#ffffff" />
        </TouchableOpacity>
      )}

      <View style={[
        contentStyles.mainContent,
        sidebarOpen && contentStyles.mainContentWithSidebar
      ]}>
        {conversacionSeleccionada ? renderDetalle() : renderLista()}
      </View>
    </View>
  );
};

// ============================================
// ESTILOS
// ============================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6'
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280'
  },
  header: {
    backgroundColor: '#FFF',
    padding: 16,
    paddingTop: Platform.OS === 'web' ? 16 : 80,
    paddingLeft: Platform.OS === 'web' ? 80 : 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB'
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937'
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4
  },
  // 🔥 NUEVO: Alerta en subtítulo
  headerSubtitleAlert: {
    color: '#EF4444',
    fontWeight: '600',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  vistaContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  vistaButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 6,
  },
  vistaButtonActive: {
    backgroundColor: '#4A90E2',
    borderColor: '#4A90E2',
  },
  vistaButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  vistaButtonTextActive: {
    color: '#FFFFFF',
  },
  filtrosContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  filtroButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filtroButtonActive: {
    backgroundColor: '#4A90E2',
    borderColor: '#4A90E2',
  },
  filtroButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  filtroButtonTextActive: {
    color: '#FFFFFF',
  },
  list: {
    paddingVertical: 8
  },
  emptyList: {
    flex: 1
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B7280'
  },

  // Detalle - WhatsApp Style Premium ULTRA
  detalleContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF'
  },
  detalleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0EA5E9',
    paddingHorizontal: 16,
    paddingVertical: 18,
    borderBottomWidth: 0,
    shadowColor: '#0EA5E9',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  backButton: {
    marginRight: 14,
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  detalleHeaderInfo: {
    flex: 1
  },
  detalleHeaderTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  detalleHeaderSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.95)',
    marginTop: 5,
    fontWeight: '700',
    letterSpacing: 0.1,
  },
  detalleHeaderActions: {
    flexDirection: 'row',
    gap: 14,
  },
  actionButtonSmall: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  resolverButtonVisible: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 14,
    gap: 10,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 5,
  },
  resolverButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
    letterSpacing: 0.4,
  },
  prioridadBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 16,
    gap: 14,
    backgroundColor: '#FEF3C7',
    borderBottomWidth: 2,
    borderBottomColor: '#FCD34D',
  },
  prioridadText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#92400E',
    letterSpacing: 0.3,
  },
  loadingDetalle: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  mensajesList: {
    paddingVertical: 18,
    paddingHorizontal: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderTopWidth: 1.5,
    borderTopColor: '#E2E8F0',
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
  },
  input: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 28,
    paddingHorizontal: 20,
    paddingVertical: 14,
    maxHeight: 120,
    fontSize: 16,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    fontWeight: '600',
    color: '#0F172A',
  },
  sendButton: {
    backgroundColor: '#0EA5E9',
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0EA5E9',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#CBD5E1',
    shadowOpacity: 0,
    elevation: 0,
  },

  // Modal Premium
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    width: '90%',
    maxWidth: 450,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.2,
    shadowRadius: 25,
    elevation: 12,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 24,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  modalLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 12,
    marginTop: 18,
    letterSpacing: 0.2,
  },
  estrellasContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
    gap: 12,
  },
  estrellaButton: {
    padding: 8,
  },
  modalTextArea: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 16,
    fontSize: 15,
    textAlignVertical: 'top',
    minHeight: 100,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    fontWeight: '500',
    color: '#0F172A',
  },
  modalButtons: {
    flexDirection: 'row',
    marginTop: 26,
    gap: 12
  },
  modalButtonCancel: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  modalButtonCancelText: {
    color: '#64748B',
    fontWeight: '700',
    fontSize: 15,
    letterSpacing: 0.2,
  },
  modalButtonConfirm: {
    flex: 1,
    backgroundColor: '#10B981',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  modalButtonConfirmText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
    letterSpacing: 0.3,
  },
  modalButtonDisabled: {
    backgroundColor: '#CBD5E1',
    shadowOpacity: 0,
    elevation: 0,
  },
});

export default GestionConversacionesPage;
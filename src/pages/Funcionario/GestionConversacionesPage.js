
// src/pages/Funcionario/GestionConversacionesPage.js
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
import { GestionConversacionesCard } from '../../components/Funcionario/GestionConversacionesCard';
import NotificacionesBadge from '../../components/Funcionario/NotificacionesBadge';
import FuncionarioSidebar from '../../components/Sidebar/sidebarFuncionario';
import { contentStyles } from '../../components/Sidebar/SidebarSuperAdminStyles';

const GestionConversacionesPage = () => {
  const router = useRouter();
  const [conversaciones, setConversaciones] = useState([]);
  const [conversacionSeleccionada, setConversacionSeleccionada] = useState(null);
  const [mensajesDetalle, setMensajesDetalle] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingDetalle, setLoadingDetalle] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState('todas');
  const [mensajeTexto, setMensajeTexto] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [mostrarModalResolver, setMostrarModalResolver] = useState(false);

  const flatListRef = useRef(null);

  // TODO: Obtener de tu context/store de autenticación
  const ID_USUARIO = 1;
  const NOMBRE_USUARIO = 'Usuario Temporal';
  const ID_DEPARTAMENTO = null;

  useEffect(() => {
    cargarConversaciones();
    const interval = setInterval(cargarConversaciones, 30000);
    return () => clearInterval(interval);
  }, [filtroEstado]);

  // Auto-refresh del detalle si hay conversación seleccionada
  useEffect(() => {
    if (conversacionSeleccionada) {
      const interval = setInterval(() => {
        cargarDetalleConversacion(conversacionSeleccionada.sessionId, true);
      }, 15000);
      return () => clearInterval(interval);
    }
  }, [conversacionSeleccionada]);

  const cargarConversaciones = async () => {
    try {
      setLoading(true);
      
      const response = await escalamientoService.getAllEscaladas({
        solo_pendientes: filtroEstado === 'pendientes',
        id_departamento: ID_DEPARTAMENTO
      });

      if (response.success) {
        const conversacionesFormateadas = response.conversaciones.map(conv => ({
          id: conv.session_id,
          visitante: conv.identificador_visitante || 'Visitante Anónimo',
          codigo: conv.session_id.substring(0, 8).toUpperCase(),
          ultimoMensaje: conv.ultimo_mensaje || 'Sin mensajes',
          fecha: formatearFecha(conv.fecha_ultimo_mensaje || conv.fecha_escalamiento),
          dispositivo: 'Web',
          agente: conv.agent_name || 'Agente Virtual',
          noLeidos: 0,
          estado: mapearEstado(conv.estado),
          sessionId: conv.session_id,
          totalMensajes: conv.total_mensajes || 0,
          escaladoA: conv.escalado_a
        }));

        let conversacionesFiltradas = conversacionesFormateadas;
        if (filtroEstado === 'resueltas') {
          conversacionesFiltradas = conversacionesFormateadas.filter(c => c.estado === 'cerrada');
        } else if (filtroEstado === 'pendientes') {
          conversacionesFiltradas = conversacionesFormateadas.filter(c => c.estado !== 'cerrada');
        }

        setConversaciones(conversacionesFiltradas);
      }
    } catch (error) {
      console.error('Error al cargar conversaciones:', error);
      Alert.alert('Error', 'No se pudieron cargar las conversaciones');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const cargarDetalleConversacion = async (sessionId, silencioso = false) => {
    try {
      if (!silencioso) setLoadingDetalle(true);

      const response = await escalamientoService.getDetalle(sessionId);

      if (response.success) {
        const mensajesFormateados = response.conversation.messages.map((msg) => ({
          texto: msg.content,
          tipo: msg.role === 'user' ? 'recibido' : 'enviado',
          hora: new Date(msg.timestamp).toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit'
          }),
          autor: msg.role === 'assistant' 
            ? '🤖 Bot' 
            : msg.role === 'human_agent' 
              ? `🧑‍💼 ${msg.agent_name || 'Humano'}` 
              : '👤 Visitante'
        }));

        setMensajesDetalle(mensajesFormateados);
        
        // Scroll al final después de cargar
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
      'escalada': 'escalada',
      'finalizada': 'cerrada',
      'pausada': 'escalada'
    };
    return mapeo[estadoBackend] || 'activa';
  };

  const scrollToEnd = () => {
    flatListRef.current?.scrollToEnd({ animated: true });
  };

  const handleRefresh = () => {
    setRefreshing(true);
    cargarConversaciones();
  };

  const handleVerConversacion = (conversacion) => {
    setConversacionSeleccionada(conversacion);
    setMensajeTexto('');
    cargarDetalleConversacion(conversacion.sessionId);
  };

  const handleVolverLista = () => {
    setConversacionSeleccionada(null);
    setMensajesDetalle([]);
    setMensajeTexto('');
  };

  const handleEnviarMensaje = async () => {
    if (!mensajeTexto.trim() || !conversacionSeleccionada) return;

    try {
      setEnviando(true);

      await escalamientoService.responder(conversacionSeleccionada.sessionId, {
        mensaje: mensajeTexto.trim(),
        id_usuario: ID_USUARIO,
        nombre_usuario: NOMBRE_USUARIO
      });

      setMensajeTexto('');
      await cargarDetalleConversacion(conversacionSeleccionada.sessionId, true);
    } catch (error) {
      console.error('Error enviando mensaje:', error);
      Alert.alert('Error', 'No se pudo enviar el mensaje');
    } finally {
      setEnviando(false);
    }
  };

  const handleResolverConversacion = () => {
    setMostrarModalResolver(true);
  };

  const confirmarResolver = async (calificacion = null, comentario = null) => {
    try {
      await escalamientoService.resolver(conversacionSeleccionada.sessionId, {
        calificacion,
        comentario
      });

      Alert.alert('Éxito', 'Conversación marcada como resuelta');
      setMostrarModalResolver(false);
      handleVolverLista();
      cargarConversaciones();
    } catch (error) {
      console.error('Error resolviendo conversación:', error);
      Alert.alert('Error', 'No se pudo resolver la conversación');
    }
  };

  const handleEscalarConversacion = async (conversacion) => {
    Alert.alert(
      'Escalar Conversación',
      `¿Deseas escalar la conversación de ${conversacion.visitante}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Escalar', 
          onPress: async () => {
            try {
              Alert.alert('Éxito', 'Conversación escalada correctamente');
              cargarConversaciones();
            } catch (error) {
              Alert.alert('Error', 'No se pudo escalar la conversación');
            }
          }
        }
      ]
    );
  };

  const handleNotificacionPress = (url) => {
    if (url) {
      const match = url.match(/\/conversacion\/(.+)/);
      if (match) {
        const sessionId = match[1];
        const conv = conversaciones.find(c => c.sessionId === sessionId);
        if (conv) {
          handleVerConversacion(conv);
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
          <View>
            <Text style={styles.headerTitle}>Conversaciones Escaladas</Text>
            <Text style={styles.headerSubtitle}>
              {conversaciones.length} conversación{conversaciones.length !== 1 ? 'es' : ''}
            </Text>
          </View>
          <NotificacionesBadge onNotificacionPress={handleNotificacionPress} />
        </View>

        <View style={styles.filtrosContainer}>
          <TouchableOpacity
            style={[styles.filtroButton, filtroEstado === 'todas' && styles.filtroButtonActive]}
            onPress={() => setFiltroEstado('todas')}
          >
            <Text style={[styles.filtroButtonText, filtroEstado === 'todas' && styles.filtroButtonTextActive]}>
              Todas
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filtroButton, filtroEstado === 'pendientes' && styles.filtroButtonActive]}
            onPress={() => setFiltroEstado('pendientes')}
          >
            <Text style={[styles.filtroButtonText, filtroEstado === 'pendientes' && styles.filtroButtonTextActive]}>
              Pendientes
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filtroButton, filtroEstado === 'resueltas' && styles.filtroButtonActive]}
            onPress={() => setFiltroEstado('resueltas')}
          >
            <Text style={[styles.filtroButtonText, filtroEstado === 'resueltas' && styles.filtroButtonTextActive]}>
              Resueltas
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );

    const renderEmpty = () => (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>📭</Text>
        <Text style={styles.emptyText}>No hay conversaciones escaladas</Text>
        <Text style={styles.emptySubtext}>
          Las conversaciones escaladas aparecerán aquí
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
              onEscalar={() => handleEscalarConversacion(item)}
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
  // RENDER DETALLE
  // ============================================
  const renderDetalle = () => (
    <KeyboardAvoidingView
      style={styles.detalleContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Header Detalle */}
      <View style={styles.detalleHeader}>
        <TouchableOpacity onPress={handleVolverLista} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <View style={styles.detalleHeaderInfo}>
          <Text style={styles.detalleHeaderTitle}>{conversacionSeleccionada.visitante}</Text>
          <Text style={styles.detalleHeaderSubtitle}>ID: {conversacionSeleccionada.codigo}</Text>
        </View>
        <TouchableOpacity
          style={styles.resolverButtonVisible}
          onPress={handleResolverConversacion}
        >
          <Ionicons name="checkmark-circle" size={20} color="#FFF" />
          <Text style={styles.resolverButtonText}>Resolver</Text>
        </TouchableOpacity>
      </View>

      {/* Mensajes */}
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

      {/* Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Escribe tu respuesta..."
          value={mensajeTexto}
          onChangeText={setMensajeTexto}
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
    </KeyboardAvoidingView>
  );

  // ============================================
  // RENDER PRINCIPAL
  // ============================================
  if (loading) {
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
      
      <FuncionarioSidebar 
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

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

      <View style={[
        contentStyles.mainContent, 
        sidebarOpen && contentStyles.mainContentWithSidebar
      ]}>
        {conversacionSeleccionada ? renderDetalle() : renderLista()}
      </View>

      {/* Modal Resolver */}
      {mostrarModalResolver && (
        <ModalResolverConversacion
          visible={mostrarModalResolver}
          onClose={() => setMostrarModalResolver(false)}
          onConfirmar={confirmarResolver}
        />
      )}
    </View>
  );
};

// ============================================
// MODAL RESOLVER
// ============================================
const ModalResolverConversacion = ({ visible, onClose, onConfirmar }) => {
  const [calificacion, setCalificacion] = useState(null);
  const [comentario, setComentario] = useState('');

  const estrellas = [1, 2, 3, 4, 5];

  return (
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>Resolver Conversación</Text>

        <Text style={styles.modalLabel}>Calificación (opcional)</Text>
        <View style={styles.estrellasContainer}>
          {estrellas.map((num) => (
            <TouchableOpacity
              key={num}
              onPress={() => setCalificacion(num)}
              style={styles.estrellaButton}
            >
              <Ionicons
                name={calificacion >= num ? 'star' : 'star-outline'}
                size={32}
                color="#F59E0B"
              />
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.modalLabel}>Comentario (opcional)</Text>
        <TextInput
          style={styles.modalTextArea}
          placeholder="Agregar comentario..."
          value={comentario}
          onChangeText={setComentario}
          multiline
          numberOfLines={4}
        />

        <View style={styles.modalButtons}>
          <TouchableOpacity style={styles.modalButtonCancel} onPress={onClose}>
            <Text style={styles.modalButtonCancelText}>Cancelar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.modalButtonConfirm}
            onPress={() => onConfirmar(calificacion, comentario)}
          >
            <Text style={styles.modalButtonConfirmText}>Resolver</Text>
          </TouchableOpacity>
        </View>
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
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB'
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
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
  filtrosContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
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
  
  // Estilos Detalle
  detalleContainer: {
    flex: 1,
    backgroundColor: '#F3F4F6'
  },
  detalleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB'
  },
  backButton: {
    marginRight: 12
  },
  detalleHeaderInfo: {
    flex: 1
  },
  detalleHeaderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937'
  },
  detalleHeaderSubtitle: {
    fontSize: 12,
    color: '#6B7280'
  },
  resolverButton: {
    padding: 8
  },
  loadingDetalle: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  mensajesList: {
    paddingVertical: 16
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB'
  },
  input: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 100,
    marginRight: 8,
    fontSize: 14
  },
  sendButton: {
    backgroundColor: '#4A90E2',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center'
  },
  sendButtonDisabled: {
    backgroundColor: '#D1D5DB'
  },

  // Modal
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 400
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 20,
    textAlign: 'center'
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
    marginBottom: 8,
    marginTop: 12
  },
  estrellasContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 12
  },
  estrellaButton: {
    padding: 4
  },
  modalTextArea: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    textAlignVertical: 'top',
    minHeight: 80
  },
  modalButtons: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 8
  },
  modalButtonCancel: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center'
  },
  modalButtonCancelText: {
    color: '#6B7280',
    fontWeight: '600',
    fontSize: 14
  },
  modalButtonConfirm: {
    flex: 1,
    backgroundColor: '#10B981',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center'
  },
  modalButtonConfirmText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 14
  },
  resolverButtonVisible: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '#10B981',
  paddingHorizontal: 16,
  paddingVertical: 8,
  borderRadius: 8,
  gap: 6
},
resolverButtonText: {
  color: '#FFF',
  fontWeight: '600',
  fontSize: 14
},
});

export default GestionConversacionesPage;
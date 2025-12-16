// src/pages/Funcionario/DetalleConversacionPage.js
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    FlatList,
    KeyboardAvoidingView,
    Platform,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { DetalleConversacionCard } from '../../components/Funcionario/DetalleConversacionCard';
import FuncionarioSidebar from '../../components/Sidebar/sidebarFuncionario';
import { contentStyles } from '../../components/Sidebar/SidebarSuperAdminStyles';
import { styles } from '../../styles/DetalleConversacionStyles';

const DetalleConversacionPage = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const flatListRef = useRef(null);
  
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

  const visitante = params.visitante || 'Visitante Anónimo';
  const codigo = params.codigo || 'XXXX-0000';

  useEffect(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: false });
    }, 100);
  }, []);

  const enviarMensaje = () => {
    if (mensaje.trim()) {
      const nuevoMensaje = {
        id: Date.now().toString(),
        texto: mensaje.trim(),
        tipo: 'enviado',
        hora: new Date().toLocaleTimeString('es-ES', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        autor: 'Funcionario',
      };

      setMensajes([...mensajes, nuevoMensaje]);
      setMensaje('');

      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
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
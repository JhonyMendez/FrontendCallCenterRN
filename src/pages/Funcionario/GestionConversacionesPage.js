// src/pages/Funcionario/GestionConversacionesPage.js
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from 'react-native';
import { GestionConversacionesCard } from '../../components/Funcionario/GestionConversacionesCard';
import FuncionarioSidebar from '../../components/Sidebar/sidebarFuncionario';
import { contentStyles } from '../../components/Sidebar/SidebarSuperAdminStyles';
import { styles } from '../../styles/GestionConversacionesStyles';

const GestionConversacionesPage = () => {
  const router = useRouter();
  const [conversaciones, setConversaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    cargarConversaciones();
  }, []);

  const cargarConversaciones = async () => {
    try {
      setLoading(true);
      
      const data = [
        {
          id: '1',
          visitante: 'Juan Alfredo',
          codigo: 'PYAX-4892',
          ultimoMensaje: 'Hola soy Juan Alfredo del área de secretaría. He revisado tu consulta y sí, parece que las inscripciones podría aplazarse.',
          fecha: '10:23 AM - Hoy',
          dispositivo: 'Desktop - Chrome',
          agente: 'Agente Académico',
          noLeidos: 2,
          estado: 'activa'
        },
        {
          id: '2',
          visitante: 'María González',
          codigo: 'MGRZ-1234',
          ultimoMensaje: 'Necesito información sobre la matrícula para el próximo semestre',
          fecha: '09:15 AM - Hoy',
          dispositivo: 'Mobile - Safari',
          agente: 'Agente Académico',
          noLeidos: 0,
          estado: 'cerrada'
        },
        {
          id: '3',
          visitante: 'Carlos Pérez',
          codigo: 'CPRZ-5678',
          ultimoMensaje: '¿Cuándo son las inscripciones para el curso de verano?',
          fecha: 'Ayer',
          dispositivo: 'Desktop - Firefox',
          agente: 'Agente Administrativo',
          noLeidos: 5,
          estado: 'activa'
        },
        {
          id: '4',
          visitante: 'Ana Martínez',
          codigo: 'AMTZ-9012',
          ultimoMensaje: 'Buenos días, quisiera saber sobre las becas disponibles',
          fecha: '2 días',
          dispositivo: 'Mobile - Chrome',
          agente: 'Agente Financiero',
          noLeidos: 1,
          estado: 'activa'
        },
        {
          id: '5',
          visitante: 'Luis Rodríguez',
          codigo: 'LRDG-3456',
          ultimoMensaje: '¿Tienen información sobre cursos de extensión?',
          fecha: '3 días',
          dispositivo: 'Tablet - Safari',
          agente: 'Agente Académico',
          noLeidos: 0,
          estado: 'escalada'
        }
      ];
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setConversaciones(data);
    } catch (error) {
      console.error('Error al cargar conversaciones:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    cargarConversaciones();
  };

  const handleVerConversacion = (conversacion) => {
    console.log('Ver conversación:', conversacion.id, conversacion.visitante);
    
    // Navegación al detalle de la conversación
    router.push({
      pathname: '/funcionario/detalle-conversacion',
      params: { 
        conversacionId: conversacion.id,
        visitante: conversacion.visitante,
        codigo: conversacion.codigo
      }
    });
  };

  const handleEscalarConversacion = (conversacion) => {
    console.log('Escalar conversación de:', conversacion.visitante);
    // Implementar lógica de escalamiento
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Conversaciones Activas</Text>
      <Text style={styles.headerSubtitle}>
        {conversaciones.length} conversación{conversaciones.length !== 1 ? 'es' : ''}
      </Text>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📭</Text>
      <Text style={styles.emptyText}>No hay conversaciones</Text>
      <Text style={styles.emptySubtext}>
        Las conversaciones activas aparecerán aquí
      </Text>
    </View>
  );

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
      </View>
    </View>
  );
};

export default GestionConversacionesPage;
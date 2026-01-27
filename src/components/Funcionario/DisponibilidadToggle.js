// components/Funcionario/DisponibilidadToggle.js
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { escalamientoService } from '../../api/services/escalamientoService';

/**
 * 🔥 Componente Toggle de Disponibilidad MEJORADO
 * 
 * Muestra estado con texto "Disponible" o "No Disponible"
 * 
 * @param {number} userId - ID del funcionario
 * @param {function} onEstadoCambiado - Callback cuando cambia el estado (opcional)
 * @param {boolean} compacto - Modo compacto (solo icono + texto corto)
 */
const DisponibilidadToggle = ({ 
  userId, 
  onEstadoCambiado = null,
  compacto = false 
}) => {
  const [disponible, setDisponible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [cambiando, setCambiando] = useState(false);

  // Cargar estado inicial
  useEffect(() => {
    if (userId) {
      cargarEstado();
    }
  }, [userId]);

  const cargarEstado = async () => {
    try {
      setLoading(true);
      const response = await escalamientoService.getEstadoDisponibilidad(userId);
      
      if (response.success) {
        setDisponible(response.disponible);
      }
    } catch (error) {
      console.error('❌ Error cargando disponibilidad:', error);
    } finally {
      setLoading(false);
    }
  };

  const cambiarDisponibilidad = async () => {
    try {
      setCambiando(true);

      const nuevoEstado = !disponible;
      
      const response = await escalamientoService.cambiarDisponibilidad(
        userId,
        nuevoEstado
      );

      if (response.success) {
        setDisponible(nuevoEstado);
        
        // Mostrar mensaje de confirmación
        const mensaje = nuevoEstado
          ? '✅ Ahora estás disponible para recibir conversaciones'
          : '⏸️ Marcado como no disponible. No recibirás nuevas conversaciones';
        
        Alert.alert('Estado Actualizado', mensaje);

        // Callback opcional
        if (onEstadoCambiado) {
          onEstadoCambiado(nuevoEstado, response);
        }
      }
    } catch (error) {
      console.error('❌ Error cambiando disponibilidad:', error);
      Alert.alert(
        'Error',
        error.response?.data?.detail || 'No se pudo cambiar el estado de disponibilidad'
      );
    } finally {
      setCambiando(false);
    }
  };

  if (loading) {
    return (
      <View style={[
        styles.container,
        compacto ? styles.containerCompacto : null
      ]}>
        <ActivityIndicator size="small" color="#4A90E2" />
      </View>
    );
  }

  if (compacto) {
    // 🎨 MODO COMPACTO MEJORADO: Icono + Texto
    return (
      <TouchableOpacity
        style={[
          styles.compacto,
          disponible ? styles.compactoDisponible : styles.compactoNoDisponible
        ]}
        onPress={cambiarDisponibilidad}
        disabled={cambiando}
        activeOpacity={0.7}
      >
        {cambiando ? (
          <ActivityIndicator size="small" color="#FFF" />
        ) : (
          <View style={styles.compactoContent}>
            <Ionicons
              name={disponible ? 'checkmark-circle' : 'close-circle'}
              size={20}
              color="#FFF"
            />
            <Text style={styles.compactoText}>
              {disponible ? 'Disponible' : 'No Disponible'}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  }

  // 🎨 MODO COMPLETO: Con texto e info
  return (
    <TouchableOpacity
      style={[
        styles.container,
        disponible ? styles.containerDisponible : styles.containerNoDisponible
      ]}
      onPress={cambiarDisponibilidad}
      disabled={cambiando}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        {cambiando ? (
          <ActivityIndicator size="small" color="#FFF" />
        ) : (
          <Ionicons
            name={disponible ? 'checkmark-circle' : 'close-circle'}
            size={24}
            color="#FFF"
          />
        )}
      </View>

      <View style={styles.textContainer}>
        <Text style={styles.estadoText}>
          {disponible ? 'Disponible' : 'No Disponible'}
        </Text>
        <Text style={styles.descripcionText}>
          {disponible 
            ? 'Recibiendo conversaciones' 
            : 'No recibirás conversaciones'
          }
        </Text>
      </View>

      <Ionicons
        name="chevron-forward"
        size={20}
        color="rgba(255, 255, 255, 0.7)"
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Contenedor general
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  containerDisponible: {
    backgroundColor: '#10B981', // Verde
  },
  containerNoDisponible: {
    backgroundColor: '#EF4444', // Rojo
  },

  // Modo compacto MEJORADO
  containerCompacto: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  compacto: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    minWidth: 140,
  },
  compactoDisponible: {
    backgroundColor: '#10B981', // Verde
  },
  compactoNoDisponible: {
    backgroundColor: '#EF4444', // Rojo
  },
  compactoContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  compactoText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },

  // Contenido
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  estadoText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  descripcionText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.85)',
  },
});

export default DisponibilidadToggle;
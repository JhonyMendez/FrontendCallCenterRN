// GestionAgenteCard.js
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { getInitials, getTipoBadgeStyles, getTipoColor, styles } from '../../styles/gestionAgenteStyles';

const GestionAgenteCard = ({ agente, onEdit, onDelete, onView, onToggleStatus }) => {
  
  const tipoBadgeStyles = getTipoBadgeStyles(agente.tipo_agente);
  const tipoColor = getTipoColor(agente.tipo_agente);

  // Función para formatear el nombre del modelo
  const formatModelName = (modelo) => {
    if (!modelo) return 'N/A';
    
    // Extraer el nombre legible del modelo
    if (modelo.includes('claude')) {
      // Ejemplo: "claude-sonnet-4-20250514" -> "Sonnet 4"
      const parts = modelo.split('-');
      if (parts.length >= 3) {
        const name = parts[1].charAt(0).toUpperCase() + parts[1].slice(1); // "Sonnet"
        const version = parts[2]; // "4"
        return `${name} ${version}`;
      }
      return 'Claude';
    } else if (modelo.includes('gpt')) {
      // Ejemplo: "gpt-4-turbo" -> "GPT-4 Turbo"
      return modelo.toUpperCase().replace(/-/g, ' ');
    } else if (modelo.includes('gemini')) {
      // Ejemplo: "gemini-pro" -> "Gemini Pro"
      const parts = modelo.split('-');
      return parts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
    }
    
    // Si no coincide con ningún patrón conocido, devolver el nombre original capitalizado
    return modelo.split('-').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
  };

  return (
    <TouchableOpacity
      style={[
        styles.card,
        agente.activo ? styles.cardActive : styles.cardInactive
      ]}
      onPress={() => onView(agente)}
      activeOpacity={0.8}
    >
      {/* Header */}
      <View style={styles.cardHeader}>
        <View style={[styles.avatar, { backgroundColor: tipoColor }]}>
          <Text style={styles.avatarText}>
            {agente.icono || getInitials(agente.nombre_agente)}
          </Text>
        </View>
        
        <View style={styles.cardHeaderContent}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {agente.nombre_agente}
          </Text>
          
          <View style={styles.badgeContainer}>
            {/* Badge de tipo */}
            <View style={[styles.badge, { backgroundColor: tipoBadgeStyles.bg }]}>
              <Text style={[styles.badgeText, { color: tipoBadgeStyles.text }]}>
                {agente.tipo_agente}
              </Text>
            </View>
            
            {/* Status indicator */}
            <View style={styles.statusContainer}>
              <View style={[
                styles.statusIndicator,
                { backgroundColor: agente.activo ? '#22c55e' : '#94a3b8' }
              ]} />
              <Text style={styles.statusText}>
                {agente.activo ? 'Activo' : 'Inactivo'}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Descripción */}
      <Text style={styles.cardDescription} numberOfLines={2}>
        {agente.descripcion || 'Sin descripción disponible'}
      </Text>

      {/* Info Grid */}
      <View style={styles.infoGrid}>
        <View style={styles.infoItem}>
          <Ionicons name="flash" size={14} color="rgba(255, 255, 255, 0.6)" />
          <View style={styles.infoItemContent}>
            <Text style={styles.infoLabel}>Modelo</Text>
            <Text style={styles.infoValue} numberOfLines={1}>
              {formatModelName(agente.modelo_ia)}
            </Text>
          </View>
        </View>
        
        <View style={styles.infoItem}>
          <Ionicons name="people" size={14} color="rgba(255, 255, 255, 0.6)" />
          <View style={styles.infoItemContent}>
            <Text style={styles.infoLabel}>Especialidad</Text>
            <Text style={styles.infoValue} numberOfLines={1}>
              {agente.area_especialidad || 'General'}
            </Text>
          </View>
        </View>
        
        <View style={styles.infoItem}>
          <Ionicons name="trending-up" size={14} color="rgba(255, 255, 255, 0.6)" />
          <View style={styles.infoItemContent}>
            <Text style={styles.infoLabel}>Conversaciones</Text>
            <Text style={styles.infoValue}>
              {agente.total_conversaciones || 0}
            </Text>
          </View>
        </View>
        
        <View style={styles.infoItem}>
          <Ionicons name="time" size={14} color="rgba(255, 255, 255, 0.6)" />
          <View style={styles.infoItemContent}>
            <Text style={styles.infoLabel}>Zona horaria</Text>
            <Text style={styles.infoValue} numberOfLines={1}>
              {agente.zona_horaria?.split('/')[1]?.replace('_', ' ') || 'N/A'}
            </Text>
          </View>
        </View>
      </View>

      {/* Footer con acciones */}
      <View style={styles.cardFooter}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={(e) => {
            e?.stopPropagation?.();
            onView(agente);
          }}
          activeOpacity={0.7}
        >
          <Ionicons name="eye-outline" size={16} color="#ffffff" />
          <Text style={styles.iconButtonText}>Ver</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.iconButton}
          onPress={(e) => {
            e?.stopPropagation?.();
            onEdit(agente);
          }}
          activeOpacity={0.7}
        >
          <Ionicons name="create-outline" size={16} color="#ffffff" />
          <Text style={styles.iconButtonText}>Editar</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.iconButton,
            agente.activo ? styles.iconButtonDanger : styles.iconButtonSuccess
          ]}
          onPress={(e) => {
            e?.stopPropagation?.();
            onToggleStatus(agente);
          }}
          activeOpacity={0.7}
        >
          <Ionicons 
            name="power" 
            size={16} 
            color={agente.activo ? '#ef4444' : '#22c55e'} 
          />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

export default GestionAgenteCard;
// src/components/Dashboard/DashboardCard.js
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Text, TouchableOpacity, View } from 'react-native';
import { dashboardStyles } from '../../styles/dashboardStyles';

export function DashboardCard({ 
  title, 
  icon, 
  gradient, 
  description, 
  onPress 
}) {
  return (
    <TouchableOpacity
      style={dashboardStyles.menuCard}
      activeOpacity={0.7}
      onPress={onPress}
    >
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={dashboardStyles.menuCardGradient}
      >
        <View style={dashboardStyles.iconContainer}>
          <Ionicons name={icon} size={32} color="#fff" />
        </View>
      </LinearGradient>
      
      <View style={dashboardStyles.menuCardContent}>
        <Text style={dashboardStyles.menuCardTitle}>{title}</Text>
        <Text style={dashboardStyles.menuCardDescription}>{description}</Text>
      </View>
      
      <View style={dashboardStyles.menuCardArrow}>
        <Ionicons name="chevron-forward" size={20} color="#a29bfe" />
      </View>
    </TouchableOpacity>
  );
}

export function ActivityCard({ 
  title, 
  subtitle, 
  statLabel, 
  statNumber,
  gradient = ['#667eea', '#764ba2']
}) {
  return (
    <View style={dashboardStyles.activityCard}>
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={dashboardStyles.activityGradient}
      >
        <View style={dashboardStyles.activityContent}>
          <View>
            <Text style={dashboardStyles.activityTitle}>{title}</Text>
            <Text style={dashboardStyles.activitySubtitle}>{subtitle}</Text>
          </View>
          
          <View style={dashboardStyles.activityStats}>
            <Text style={dashboardStyles.activityLabel}>{statLabel}</Text>
            <Text style={dashboardStyles.activityNumber}>{statNumber}</Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}
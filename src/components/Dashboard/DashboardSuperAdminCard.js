// src/components/Dashboard/DashboardSuperAdminCard.js
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import { Animated, Text, TouchableOpacity, View } from 'react-native';
import { dashboardStyles } from '../../styles/dashboardSuperAdminStyles';

// ============================================
// HEADER CARD
// ============================================
export function HeaderCard({ nombre, username, role, onPress }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-20)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={[
      dashboardStyles.headerCard,
      {
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }, { scale: scaleAnim }]
      }
    ]}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.95}
        style={{ flex: 1 }}
      >
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={dashboardStyles.headerGradient}
        >
          <View style={dashboardStyles.headerLeft}>
            <View style={dashboardStyles.logoCircle}>
              <Ionicons name="shield-checkmark" size={28} color="#fff" />
            </View>
            <View style={dashboardStyles.headerTextContainer}>
              <Text style={dashboardStyles.headerTitle}>TEC-AI</Text>
              <Text style={dashboardStyles.headerSubtitle}>Sistema de Gestión</Text>
            </View>
          </View>

          <View style={dashboardStyles.headerRight}>
            <View style={dashboardStyles.userBadge}>
              <View style={dashboardStyles.userAvatar}>
                <Text style={dashboardStyles.userInitials}>
                  {nombre.split(' ').map(n => n[0]).join('').substring(0, 2)}
                </Text>
              </View>
              <View style={dashboardStyles.userInfo}>
                <Text style={dashboardStyles.userName}>{nombre}</Text>
                <Text style={dashboardStyles.userRole}>{role}</Text>
              </View>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ============================================
// STAT CARD - Rediseñada
// ============================================
export function StatCard({
  title,
  value,
  subtitle,
  icon,
  color,
  trend,
  onClick
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const getTrendIcon = () => {
    if (trend > 0) return 'trending-up';
    if (trend < 0) return 'trending-down';
    return 'remove';
  };

  const getTrendColor = () => {
    if (trend > 0) return '#10b981';
    if (trend < 0) return '#ef4444';
    return '#64748b';
  };

  return (
    <Animated.View style={[
      dashboardStyles.statCard,
      { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }
    ]}>
      <TouchableOpacity
        onPress={onClick}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
        style={dashboardStyles.statCardContent}
      >
        {/* Header con icono y trend */}
        <View style={dashboardStyles.statHeader}>
          <View style={[dashboardStyles.statIconBox, { backgroundColor: color + '20' }]}>
            <Ionicons name={icon} size={24} color={color} />
          </View>
          {trend !== 0 && (
            <View style={[dashboardStyles.trendBadge, { backgroundColor: getTrendColor() + '20' }]}>
              <Ionicons name={getTrendIcon()} size={14} color={getTrendColor()} />
              <Text style={[dashboardStyles.trendText, { color: getTrendColor() }]}>
                {Math.abs(trend)}%
              </Text>
            </View>
          )}
        </View>

        {/* Valor principal */}
        <Text style={dashboardStyles.statValue}>{value}</Text>

        {/* Textos */}
        <Text style={dashboardStyles.statTitle}>{title}</Text>
        <Text style={dashboardStyles.statSubtitle}>{subtitle}</Text>

        {/* Barra de progreso */}
        <View style={dashboardStyles.progressContainer}>
          <View style={[dashboardStyles.progressBar, { backgroundColor: color + '30' }]}>
            <View style={[
              dashboardStyles.progressFill,
              { backgroundColor: color, width: '75%' }
            ]} />
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ============================================
// QUICK ACTION CARD - Para acciones rápidas
// ============================================
export function QuickActionCard({
  title,
  icon,
  description,
  color,
  onClick
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={[
      dashboardStyles.quickActionCard,
      { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }
    ]}>
      <TouchableOpacity
        onPress={onClick}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
        style={dashboardStyles.quickActionContent}
      >
        <View style={[dashboardStyles.quickActionIcon, { backgroundColor: color + '20' }]}>
          <Ionicons name={icon} size={28} color={color} />
        </View>

        <View style={dashboardStyles.quickActionTexts}>
          <Text style={dashboardStyles.quickActionTitle}>{title}</Text>
          <Text style={dashboardStyles.quickActionDescription}>{description}</Text>
        </View>

        <View style={dashboardStyles.quickActionArrow}>
          <Ionicons name="chevron-forward" size={20} color="#a29bfe" />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ============================================
// INFO CARD - Para información general
// ============================================
export function InfoCard({
  title,
  value,
  icon,
  color,
  subtitle
}) {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <View style={dashboardStyles.infoCard}>
      <View style={dashboardStyles.infoCardHeader}>
        <Animated.View style={[
          dashboardStyles.infoIconCircle,
          { backgroundColor: color + '20', transform: [{ scale: pulseAnim }] }
        ]}>
          <Ionicons name={icon} size={22} color={color} />
        </Animated.View>
        <Text style={dashboardStyles.infoCardTitle}>{title}</Text>
      </View>

      <Text style={dashboardStyles.infoCardValue}>{value}</Text>
      {subtitle && <Text style={dashboardStyles.infoCardSubtitle}>{subtitle}</Text>}
    </View>
  );
}

// ============================================
// SECTION HEADER - Para títulos de sección
// ============================================
export function SectionHeader({ title, subtitle, icon, onActionPress, actionText }) {
  return (
    <View style={dashboardStyles.sectionHeader}>
      <View style={dashboardStyles.sectionHeaderLeft}>
        {icon && (
          <View style={dashboardStyles.sectionIconBox}>
            <Ionicons name={icon} size={20} color="#a29bfe" />
          </View>
        )}
        <View>
          <Text style={dashboardStyles.sectionTitle}>{title}</Text>
          {subtitle && <Text style={dashboardStyles.sectionSubtitle}>{subtitle}</Text>}
        </View>
      </View>

      {onActionPress && (
        <TouchableOpacity
          style={dashboardStyles.sectionAction}
          onPress={onActionPress}
        >
          <Text style={dashboardStyles.sectionActionText}>{actionText || 'Ver todo'}</Text>
          <Ionicons name="arrow-forward" size={16} color="#a29bfe" />
        </TouchableOpacity>
      )}
    </View>
  );
}
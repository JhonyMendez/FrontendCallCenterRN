// ==================================================================================
// sidebarFuncionario.js
// Sidebar para Funcionario: Exportar datos, Métricas, Añadir info al agente
// Usa los mismos estilos que SuperAdmin
// ==================================================================================

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

import { apiClient } from '../../api/client';
import authService from '../../api/services/authService';
import { sidebarStyles } from './SidebarSuperAdminStyles';

export default function SidebarFuncionario({ isOpen }) {
  const [expandedMenus, setExpandedMenus] = useState({});
  const router = useRouter();

  // Sidebar colapsado
  if (!isOpen) {
    return <View style={sidebarStyles.containerCollapsed} />;
  }

  // ✅ Menú exclusivo para Funcionario
  const menuItems = [


    {
      id: 'Dashboard',
      label: 'dashboard',
      icon: 'sparkles-outline',
      route: '/funcionario/dashboard',
    },

    {
      id: 'agente',
      label: 'Agente',
      icon: 'sparkles-outline',
      submenu: [
        {
          label: 'Añadir información',
          route: '/funcionario/gestionContenidoFuncionario',
        },
      ],
    },

    {
      id: 'conversacion',
      label: 'Conversaciones',
      icon: 'sparkles-outline',
      submenu: [
        {
          label: 'Interactuar con conversaciones',
          route: '/funcionario/gestionconversacion',
        },
      ],
    },

  ];

  const toggleMenu = (menuId) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [menuId]: !prev[menuId],
    }));
  };

  const handleNavigation = (route) => {
    try {
      router.push(route);
    } catch (error) {
      console.error('Error al navegar:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await apiClient.removeToken();
      await authService.limpiarSesion();
      router.replace('/auth/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <View style={sidebarStyles.container}>
      {/* Header */}
      <View style={sidebarStyles.header}>
        <View style={sidebarStyles.iconWrapperGradient}>
          <Ionicons name="briefcase-outline" size={24} color="#ffffff" />
        </View>
        <View style={sidebarStyles.headerTitle}>
          <Text style={sidebarStyles.title}>Funcionario</Text>
          <Text style={sidebarStyles.subtitle}>Panel de trabajo</Text>
        </View>
      </View>

      {/* Contenido */}
      <ScrollView
        style={sidebarStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={sidebarStyles.menuContainer}>
          {menuItems.map((item) => {
            const hasSubmenu = item.submenu?.length > 0;
            const isExpanded = expandedMenus[item.id];

            return (
              <View key={item.id} style={sidebarStyles.menuItem}>
                <TouchableOpacity
                  style={sidebarStyles.menuButton}
                  onPress={() =>
                    hasSubmenu
                      ? toggleMenu(item.id)
                      : handleNavigation(item.route)
                  }
                  activeOpacity={0.7}
                >
                  <View style={sidebarStyles.menuButtonContent}>
                    <View style={sidebarStyles.menuIcon}>
                      <Ionicons name={item.icon} size={20} color="#ffffff" />
                    </View>
                    <Text style={sidebarStyles.menuLabel}>{item.label}</Text>
                  </View>

                  {hasSubmenu && (
                    <Ionicons
                      name={isExpanded ? 'chevron-up' : 'chevron-down'}
                      size={20}
                      color="#c7d2fe"
                    />
                  )}
                </TouchableOpacity>

                {hasSubmenu && isExpanded && (
                  <View style={sidebarStyles.submenu}>
                    {item.submenu.map((subitem, index) => (
                      <TouchableOpacity
                        key={index}
                        style={sidebarStyles.submenuItem}
                        onPress={() => handleNavigation(subitem.route)}
                        activeOpacity={0.7}
                      >
                        <View style={sidebarStyles.submenuIcon}>
                          <Ionicons
                            name="chevron-forward"
                            size={12}
                            color="#c7d2fe"
                          />
                        </View>
                        <Text style={sidebarStyles.submenuLabel}>
                          {subitem.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={sidebarStyles.footer}>
        <TouchableOpacity
          style={sidebarStyles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <View style={sidebarStyles.logoutIcon}>
            <Ionicons name="log-out-outline" size={20} color="#ffffff" />
          </View>
          <Text style={sidebarStyles.logoutButtonText}>
            Cerrar Sesión
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

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
      id: 'dashboard',
      label: 'Dashboard',
      icon: 'grid-outline',
      route: '/funcionario/dashboard',
    },
    {
      id: 'agente',
      label: 'Gestión de Agente',
      icon: 'planet-outline',
      submenu: [
        {
          label: 'Gestionar Agente',
          icon: 'document-attach-outline',
          route: '/funcionario/gestionAgenteFuncionario',
        },
        {
          label: 'Gestionar Categoria',
          icon: 'document-attach-outline',
          route: '/funcionario/gestionCategoriaFuncionario',
        },
        {
          label: 'Gestionar contenidos',
          icon: 'add-circle-outline',
          route: '/funcionario/gestionContenidoFuncionario',
        },
      ],
    },
    {
      id: 'conversacion',
      label: 'Conversaciones',
      icon: 'chatbubbles-outline',
      submenu: [
        {
          label: 'Ver conversaciones',
          icon: 'list-outline',
          route: '/funcionario/gestionconversacion',
        },
      ],
    },
    {
      id: 'metricas',
      label: 'Métricas',
      icon: 'analytics-outline',
      submenu: [
        {
          label: 'Estadísticas',
          icon: 'bar-chart-outline',
          route: '/funcionario/estadisticas',
        },
        {
          label: 'Reportes',
          icon: 'document-attach-outline',
          route: '/funcionario/reportes',
        },
      ],
    },
    {
      id: 'exportar',
      label: 'Exportar Datos',
      icon: 'download-outline',
      submenu: [
        {
          label: 'Exportar conversaciones',
          icon: 'cloud-download-outline',
          route: '/funcionario/exportar/conversaciones',
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
      console.log('🔄 [Sidebar Funcionario] Navegando a:', route);
      router.push(route);
    } catch (error) {
      console.error('❌ [Sidebar Funcionario] Error al navegar:', error);
    }
  };

  const handleLogout = async () => {
    try {
      console.log('🔄 [Sidebar Funcionario] Cerrando sesión...');
      await apiClient.removeToken();
      await authService.limpiarSesion();
      router.replace('/auth/login');
      console.log('✅ [Sidebar Funcionario] Sesión cerrada correctamente');
    } catch (error) {
      console.error('❌ [Sidebar Funcionario] Error al cerrar sesión:', error);
    }
  };

  return (
    <View style={sidebarStyles.container}>
      {/* Header */}
      <View style={sidebarStyles.header}>
        <View style={sidebarStyles.iconWrapperGradient}>
          <Ionicons name="briefcase" size={24} color="#ffffff" />
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
                {/* Botón principal del menú */}
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

                {/* Submenú expandido */}
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
                            name={subitem.icon || 'chevron-forward'}
                            size={16}
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
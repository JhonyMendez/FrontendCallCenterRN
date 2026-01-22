// styles/dashboardSuperAdminStyles.js
import { Dimensions, StyleSheet } from 'react-native';

const { width } = Dimensions.get('window');
const isSmallScreen = width < 768;

export const dashboardStyles = StyleSheet.create({
  // ==================== CONTAINER ====================
  container: {
    flex: 1,
    backgroundColor: '#0f0e17',
  },
  scrollContent: {
    paddingHorizontal: isSmallScreen ? 16 : 24,
    paddingTop: 80, // Espacio para el botón toggle
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f0e17',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#a29bfe',
    fontWeight: '500',
  },

  // ==================== HEADER CARD ====================
  headerCard: {
    marginBottom: 24,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  headerGradient: {
    padding: isSmallScreen ? 20 : 28,
    flexDirection: isSmallScreen ? 'column' : 'row',
    alignItems: isSmallScreen ? 'flex-start' : 'center',
    justifyContent: 'space-between',
    minHeight: isSmallScreen ? 180 : 140,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: isSmallScreen ? 16 : 0,
  },
  logoCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerTextContainer: {
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 4,
    fontWeight: '500',
  },
  headerRight: {
    alignItems: isSmallScreen ? 'flex-start' : 'flex-end',
    width: isSmallScreen ? '100%' : 'auto',
  },
  userBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  userAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userInitials: {
    fontSize: 16,
    fontWeight: '700',
    color: '#667eea',
  },
  userInfo: {
    justifyContent: 'center',
  },
  userName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 2,
  },
  userRole: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '500',
  },

  // ==================== SECTION HEADER ====================
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    marginTop: 8,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sectionIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#1a1625',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#8b7fb8',
    fontWeight: '500',
  },
  sectionAction: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#1a1625',
    borderRadius: 10,
  },
  sectionActionText: {
    fontSize: 13,
    color: '#a29bfe',
    fontWeight: '600',
    marginRight: 6,
  },

  // ==================== STATS GRID ====================
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
    marginBottom: 16,
  },
  statCardWrapper: {
    width: isSmallScreen ? '50%' : '25%',
    padding: 8,
  },
  statCard: {
    backgroundColor: '#1a1625',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#2d2640',
  },
  statCardContent: {
    padding: 16,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    gap: 4,
  },
  trendText: {
    fontSize: 12,
    fontWeight: '700',
  },
  statValue: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 8,
  },
  statTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  statSubtitle: {
    fontSize: 12,
    color: '#8b7fb8',
    marginBottom: 12,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },

  // ==================== INFO GRID ====================
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
    marginBottom: 16,
  },
  infoCardWrapper: {
    width: isSmallScreen ? '100%' : '33.333%',
    padding: 8,
  },
  infoCard: {
    backgroundColor: '#1a1625',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2d2640',
  },
  infoCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  infoCardValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 6,
  },
  infoCardSubtitle: {
    fontSize: 12,
    color: '#8b7fb8',
    fontWeight: '500',
  },

  // ==================== QUICK ACTIONS ====================
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
    marginBottom: 16,
  },
  quickActionCard: {
    width: isSmallScreen ? '100%' : '50%',
    padding: 8,
  },
  quickActionContent: {
    backgroundColor: '#1a1625',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2d2640',
    flexDirection: 'row',
    alignItems: 'center',
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  quickActionTexts: {
    flex: 1,
  },
  quickActionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  quickActionDescription: {
    fontSize: 13,
    color: '#8b7fb8',
    fontWeight: '500',
  },
  quickActionArrow: {
    marginLeft: 12,
  },

  // ==================== FOOTER ====================
  footer: {
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#2d2640',
  },
  footerActions: {
    flexDirection: isSmallScreen ? 'column' : 'row',
    gap: 12,
    justifyContent: 'center',
  },
  footerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
    minWidth: isSmallScreen ? '100%' : 160,
  },
  logoutButton: {
    backgroundColor: '#fee2e2',
    borderWidth: 1,
    borderColor: '#fca5a5',
  },
  logoutButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ef4444',
  },
  secondaryButton: {
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },

  // ==================== HEADER CARD CLICKEABLE ====================
  headerCardClickeable: {
    cursor: 'pointer', // Solo para web
  },
});
// src/styles/dashboardSuperAdminStyles.js
import { Dimensions, StyleSheet } from "react-native";

const { width } = Dimensions.get('window');
const isTablet = width >= 768;
const isDesktop = width >= 1024;

export const dashboardStyles = StyleSheet.create({
  // ============================================
  // CONTAINER
  // ============================================
  container: {
    flex: 1,
    backgroundColor: "#0f0f23",
  },
  
  scrollContent: {
    padding: isTablet ? 24 : 16,
    paddingBottom: 30,
  },

  // ============================================
  // HEADER CARD
  // ============================================
  headerCard: {
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 24,
    shadowColor: "#667eea",
    shadowOpacity: 0.4,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 15,
  },

  headerGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 24,
    paddingVertical: 28,
  },

  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  logoCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    shadowColor: "#667eea",
    shadowOpacity: 0.5,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 8,
  },

  headerTextContainer: {
    flex: 1,
  },

  headerTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: "#fff",
    letterSpacing: 2,
    marginBottom: 4,
  },

  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: "600",
  },

  headerRight: {
    alignItems: "flex-end",
  },

  userBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    paddingVertical: 10,
    paddingHorizontal: 14,
    paddingRight: 18,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },

  userAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },

  userInitials: {
    fontSize: 16,
    fontWeight: "900",
    color: "#667eea",
  },

  userInfo: {
    alignItems: "flex-start",
  },

  userName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 3,
  },

  userRole: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.85)",
    fontWeight: "600",
  },

  // ============================================
  // STAT CARD
  // ============================================
  statCard: {
    backgroundColor: "#1a1a2e",
    borderRadius: 18,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },

  statCardContent: {
    padding: 20,
  },

  statHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },

  statIconBox: {
    width: 52,
    height: 52,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },

  trendBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 4,
  },

  trendText: {
    fontSize: 12,
    fontWeight: "800",
  },

  statValue: {
    fontSize: 36,
    fontWeight: "900",
    color: "#fff",
    marginBottom: 8,
    letterSpacing: -0.5,
  },

  statTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#e2e8f0",
    marginBottom: 5,
  },

  statSubtitle: {
    fontSize: 13,
    color: "#94a3b8",
    fontWeight: "500",
    marginBottom: 14,
  },

  progressContainer: {
    marginTop: 4,
  },

  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    borderRadius: 3,
  },

  // ============================================
  // QUICK ACTION CARD
  // ============================================
  quickActionCard: {
    backgroundColor: "#1a1a2e",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    marginBottom: 14,
  },

  quickActionContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 18,
  },

  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },

  quickActionTexts: {
    flex: 1,
  },

  quickActionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 5,
  },

  quickActionDescription: {
    fontSize: 13,
    color: "#94a3b8",
    fontWeight: "500",
  },

  quickActionArrow: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(162, 155, 254, 0.15)",
    justifyContent: "center",
    alignItems: "center",
  },

  // ============================================
  // INFO CARD
  // ============================================
  infoCard: {
    backgroundColor: "#1a1a2e",
    borderRadius: 16,
    padding: 18,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    marginBottom: 14,
  },

  infoCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },

  infoIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  infoCardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },

  infoCardValue: {
    fontSize: 32,
    fontWeight: "900",
    color: "#fff",
    marginBottom: 6,
  },

  infoCardSubtitle: {
    fontSize: 13,
    color: "#94a3b8",
    fontWeight: "500",
  },

  // ============================================
  // SECTION HEADER
  // ============================================
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
    marginTop: 10,
  },

  sectionHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  sectionIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(162, 155, 254, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: 0.3,
    marginBottom: 3,
  },

  sectionSubtitle: {
    fontSize: 13,
    color: "#94a3b8",
    fontWeight: "500",
  },

  sectionAction: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(162, 155, 254, 0.15)",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    gap: 6,
  },

  sectionActionText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#a29bfe",
  },

  // ============================================
  // GRIDS
  // ============================================
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    marginBottom: 28,
  },

  statCardWrapper: {
    width: isDesktop ? `${100 / 4 - 1.2}%` : isTablet ? `${100 / 2 - 1}%` : "100%",
  },

  quickActionsGrid: {
    marginBottom: 28,
  },

  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    marginBottom: 28,
  },

  infoCardWrapper: {
    width: isTablet ? `${100 / 3 - 1.1}%` : "100%",
  },

  // ============================================
  // FOOTER
  // ============================================
  footer: {
    backgroundColor: "#1a1a2e",
    borderRadius: 18,
    padding: 22,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
    marginTop: 10,
  },

  footerActions: {
    flexDirection: isTablet ? "row" : "column",
    gap: 14,
  },

  footerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 14,
    gap: 10,
    flex: isTablet ? 1 : undefined,
  },

  logoutButton: {
    backgroundColor: "rgba(239, 68, 68, 0.15)",
    borderWidth: 2,
    borderColor: "#ef4444",
  },

  logoutButtonText: {
    color: "#ef4444",
    fontSize: 15,
    fontWeight: "700",
  },

  secondaryButton: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },

  secondaryButtonText: {
    color: "#e2e8f0",
    fontSize: 15,
    fontWeight: "700",
  },

  // ============================================
  // LOADING
  // ============================================
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0f0f23",
  },

  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: "#94a3b8",
    fontWeight: "600",
  },
});
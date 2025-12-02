// src/styles/dashboardStyles.js
import { StyleSheet } from 'react-native';

export const dashboardStyles = StyleSheet.create({
  // ==================== CONTAINER ====================
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  
  scrollView: {
    flex: 1,
  },
  
  // ==================== HEADER ====================
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 5,
  },
  
  greeting: {
    fontSize: 16,
    color: '#636e72',
    fontWeight: '500',
  },
  
  userName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#2d3436',
    marginTop: 4,
  },
  
  headerButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#ff4757',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  
  // ==================== ACTIVITY CARD ====================
  activityCard: {
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#667eea',
    shadowOpacity: 0.3,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  
  activityGradient: {
    padding: 20,
  },
  
  activityContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  activityTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 4,
  },
  
  activitySubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  
  activityStats: {
    alignItems: 'flex-end',
  },
  
  activityLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
    marginBottom: 4,
  },
  
  activityNumber: {
    fontSize: 36,
    fontWeight: '900',
    color: '#fff',
  },
  
  // ==================== MENU CARDS ====================
  menuGrid: {
    padding: 20,
  },
  
  menuCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  
  menuCardGradient: {
    padding: 20,
    alignItems: 'center',
  },
  
  iconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  
  menuCardContent: {
    padding: 20,
    paddingBottom: 16,
  },
  
  menuCardTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#2d3436',
    marginBottom: 6,
  },
  
  menuCardDescription: {
    fontSize: 14,
    color: '#636e72',
    fontWeight: '500',
    lineHeight: 20,
  },
  
  menuCardArrow: {
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
  
  // ==================== FOOTER ====================
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginTop: 20,
    marginBottom: 40,
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 5,
  },
  
  footerButton: {
    alignItems: 'center',
    gap: 6,
  },
  
  footerButtonText: {
    fontSize: 12,
    color: '#636e72',
    fontWeight: '600',
  },
});
// src/components/departamentos/DepartamentoCard.js
import { Platform, StyleSheet, Text, View } from 'react-native';

function DepartamentoCard({ departamento }) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>{departamento.nombre}</Text>
        <View style={[styles.badge, departamento.activo ? styles.badgeActive : styles.badgeInactive]}>
          <Text style={styles.badgeText}>
            {departamento.activo ? '● Activo' : '● Inactivo'}
          </Text>
        </View>
      </View>
      
      <View style={styles.divider} />
      
      <View style={styles.infoContainer}>
        <View style={styles.infoRow}>
          <Text style={styles.icon}>📋</Text>
          <View style={styles.infoTextContainer}>
            <Text style={styles.label}>Código</Text>
            <Text style={styles.value}>{departamento.codigo}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.icon}>✉️</Text>
          <View style={styles.infoTextContainer}>
            <Text style={styles.label}>Email</Text>
            <Text style={styles.value}>{departamento.email}</Text>
          </View>
        </View>

        {departamento.telefono && (
          <View style={styles.infoRow}>
            <Text style={styles.icon}>📞</Text>
            <View style={styles.infoTextContainer}>
              <Text style={styles.label}>Teléfono</Text>
              <Text style={styles.value}>{departamento.telefono}</Text>
            </View>
          </View>
        )}

        {departamento.ubicacion && (
          <View style={styles.infoRow}>
            <Text style={styles.icon}>📍</Text>
            <View style={styles.infoTextContainer}>
              <Text style={styles.label}>Ubicación</Text>
              <Text style={styles.value}>{departamento.ubicacion}</Text>
            </View>
          </View>
        )}

        {departamento.facultad && (
          <View style={styles.infoRow}>
            <Text style={styles.icon}>🏛️</Text>
            <View style={styles.infoTextContainer}>
              <Text style={styles.label}>Facultad</Text>
              <Text style={styles.value}>{departamento.facultad}</Text>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: Platform.OS === 'web' ? 16 : 12,
    marginVertical: 8,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        transition: 'transform 0.2s, box-shadow 0.2s',
        cursor: 'pointer',
      },
    }),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    flex: 1,
    marginRight: 12,
    lineHeight: 26,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeActive: {
    backgroundColor: '#e8f5e9',
  },
  badgeInactive: {
    backgroundColor: '#ffebee',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2e7d32',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 12,
  },
  infoContainer: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  icon: {
    fontSize: 20,
    marginRight: 12,
    marginTop: 2,
  },
  infoTextContainer: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#757575',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  value: {
    fontSize: 15,
    color: '#424242',
    lineHeight: 20,
  },
});

export default DepartamentoCard;
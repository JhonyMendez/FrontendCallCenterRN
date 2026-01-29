import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

const DetalleConversacionCard = ({ mensaje }) => {
  const { texto, tipo, hora, autor } = mensaje;
  const esEnviado = tipo === 'enviado';

  // 🔐 Sanitizar el texto del mensaje para evitar XSS
  const textoSanitizado = useMemo(() => {
    if (!texto) return '';
    // Reemplazar caracteres HTML especiales
    return String(texto)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');
  }, [texto]);

  // 🔐 Sanitizar el autor del mensaje
  const autorSanitizado = useMemo(() => {
    if (!autor) return '';
    return String(autor)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }, [autor]);

  return (
    <View
      style={[
        styles.mensajeContainer,
        esEnviado ? styles.mensajeEnviado : styles.mensajeRecibido,
      ]}
    >
      {!esEnviado && (
        <View style={styles.avatarMensaje}>
          <Ionicons name="person" size={16} color="#4A90E2" />
        </View>
      )}

      <View style={styles.mensajeContenido}>
        {!esEnviado && (
          <Text style={styles.mensajeAutor}>{autorSanitizado}</Text>
        )}
        <View
          style={[
            styles.burbujaMensaje,
            esEnviado ? styles.burbujaEnviado : styles.burbujaRecibido,
          ]}
        >
          <Text
            style={[
              styles.mensajeTexto,
              esEnviado ? styles.textoEnviado : styles.textoRecibido,
            ]}
          >
            {textoSanitizado}
          </Text>
        </View>
        <Text style={[styles.mensajeHora, esEnviado && styles.mensajeHoraEnviado]}>
          {hora}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mensajeContainer: {
    flexDirection: 'row',
    marginVertical: 8,
    paddingHorizontal: 8,
  },
  mensajeRecibido: {
    justifyContent: 'flex-start',
  },
  mensajeEnviado: {
    justifyContent: 'flex-end',
  },
  avatarMensaje: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#E0F2FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 4,
    borderWidth: 2,
    borderColor: '#BAE6FD',
    shadowColor: '#0EA5E9',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  mensajeContenido: {
    maxWidth: '78%',
  },
  mensajeAutor: {
    fontSize: 13,
    color: '#0EA5E9',
    marginBottom: 8,
    marginLeft: 10,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  burbujaMensaje: {
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  burbujaRecibido: {
    backgroundColor: '#F1F5F9',
    borderBottomLeftRadius: 4,
    borderWidth: 0.5,
    borderColor: '#E2E8F0',
  },
  burbujaEnviado: {
    backgroundColor: '#0EA5E9',
    borderBottomRightRadius: 4,
  },
  mensajeTexto: {
    fontSize: 17,
    lineHeight: 25,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  textoRecibido: {
    color: '#0F172A',
  },
  textoEnviado: {
    color: '#FFFFFF',
  },
  mensajeHora: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 8,
    marginLeft: 10,
    fontWeight: '600',
  },
  mensajeHoraEnviado: {
    textAlign: 'right',
    marginLeft: 0,
    marginRight: 10,
  },
});

export { DetalleConversacionCard };

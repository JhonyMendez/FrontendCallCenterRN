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
    paddingHorizontal: 16,
  },
  mensajeRecibido: {
    justifyContent: 'flex-start',
  },
  mensajeEnviado: {
    justifyContent: 'flex-end',
  },
  avatarMensaje: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EBF5FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginTop: 4,
  },
  mensajeContenido: {
    maxWidth: '70%',
  },
  mensajeAutor: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
    marginLeft: 12,
  },
  burbujaMensaje: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 16,
  },
  burbujaRecibido: {
    backgroundColor: '#F3F4F6',
    borderBottomLeftRadius: 4,
  },
  burbujaEnviado: {
    backgroundColor: '#4A90E2',
    borderBottomRightRadius: 4,
  },
  mensajeTexto: {
    fontSize: 15,
    lineHeight: 20,
  },
  textoRecibido: {
    color: '#1F2937',
  },
  textoEnviado: {
    color: '#FFFFFF',
  },
  mensajeHora: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 4,
    marginLeft: 12,
  },
  mensajeHoraEnviado: {
    textAlign: 'right',
    marginLeft: 0,
    marginRight: 12,
  },
});

export { DetalleConversacionCard };

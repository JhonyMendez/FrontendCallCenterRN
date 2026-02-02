import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useRef, useState } from 'react';
import {
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const DateInput = ({ value, onChangeText, placeholder, style, containerStyle }) => {
  const [showPicker, setShowPicker] = useState(false);
  const inputRef = useRef(null);

  // Convertir string a Date
  const getDateValue = () => {
    if (!value) return new Date();
    try {
      // Asegurar formato YYYY-MM-DD
      const dateParts = value.split('-');
      if (dateParts.length === 3) {
        return new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
      }
      return new Date(value);
    } catch {
      return new Date();
    }
  };

  const handleDateChange = (event, selectedDate) => {
    // En Android, siempre cerramos el picker
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }

    if (event.type === 'set' && selectedDate) {
      // Formatear fecha como YYYY-MM-DD
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`;
      
      onChangeText(formattedDate);
    }
    
    // En iOS, solo cerramos cuando presionan "Listo"
    if (Platform.OS === 'android' || event.type === 'dismissed') {
      setShowPicker(false);
    }
  };

  const formatDisplayDate = (dateString) => {
    if (!dateString) return '';
    try {
      const parts = dateString.split('-');
      if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`; // DD/MM/YYYY
      }
      return dateString;
    } catch {
      return dateString;
    }
  };

  // ========== VERSIÓN WEB ==========
  if (Platform.OS === 'web') {
    return (
      <input
        ref={inputRef}
        type="date"
        value={value || ''}
        onChange={(e) => onChangeText(e.target.value)}
        placeholder={placeholder}
        style={{
          flex: 1,
          height: 48,
          fontSize: 16,
          color: '#1F2937',
          backgroundColor: 'transparent',
          border: 'none',
          outline: 'none',
          fontFamily: 'System',
        }}
      />
    );
  }

  // ========== VERSIÓN MÓVIL (iOS y Android) ==========
  return (
    <>
      <TouchableOpacity
        style={styles.dateButton}
        onPress={() => setShowPicker(true)}
        activeOpacity={0.7}
      >
        <Text style={[
          styles.dateText,
          !value && styles.placeholderText
        ]}>
          {value ? formatDisplayDate(value) : (placeholder || 'Seleccionar fecha')}
        </Text>
        <Ionicons name="calendar-outline" size={20} color="#667eea" />
      </TouchableOpacity>

      {/* iOS: Modal con DatePicker */}
      {Platform.OS === 'ios' && showPicker && (
        <Modal
          transparent
          animationType="slide"
          visible={showPicker}
          onRequestClose={() => setShowPicker(false)}
        >
          <View style={styles.modalOverlay}>
            <TouchableOpacity 
              style={styles.modalOverlayTouch}
              activeOpacity={1}
              onPress={() => setShowPicker(false)}
            />
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setShowPicker(false)}>
                  <Text style={styles.modalCancelText}>Cancelar</Text>
                </TouchableOpacity>
                <Text style={styles.modalTitle}>Fecha de Nacimiento</Text>
                <TouchableOpacity onPress={() => setShowPicker(false)}>
                  <Text style={styles.modalDoneText}>Listo</Text>
                </TouchableOpacity>
              </View>
              
              <DateTimePicker
                value={getDateValue()}
                mode="date"
                display="spinner"
                onChange={handleDateChange}
                maximumDate={new Date()}
                locale="es-ES"
                textColor="#1F2937"
              />
            </View>
          </View>
        </Modal>
      )}

      {/* Android: DatePicker nativo */}
      {Platform.OS === 'android' && showPicker && (
        <DateTimePicker
          value={getDateValue()}
          mode="date"
          display="default"
          onChange={handleDateChange}
          maximumDate={new Date()}
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 0,
    paddingVertical: 0,
    flex: 1,
  },
  dateText: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '600',
    flex: 1,
  },
  placeholderText: {
    color: '#9CA3AF',
    fontWeight: '400',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalOverlayTouch: {
    flex: 1,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1F2937',
  },
  modalCancelText: {
    fontSize: 16,
    color: '#6B7280',
  },
  modalDoneText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#667eea',
  },
});

export default DateInput;
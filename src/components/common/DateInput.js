import { useRef } from 'react';
import { Platform, TextInput } from 'react-native';

const DateInput = ({ value, onChangeText, style, containerStyle, placeholder }) => {
  const inputRef = useRef(null);

  // Si estamos en web, usar input HTML nativo
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

  // Para móvil, usar TextInput normal
  return (
    <TextInput
      style={style}
      placeholder={placeholder}
      placeholderTextColor="#9CA3AF"
      value={value}
      onChangeText={onChangeText}
    />
  );
};

export default DateInput;
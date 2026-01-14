import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Animated, Modal, Platform, Text, TouchableOpacity, View } from 'react-native';

export default function SessionExpiredModal({ visible, onClose }) {
    const pulseAnim = React.useRef(new Animated.Value(1)).current;

    React.useEffect(() => {
        if (visible) {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, {
                        toValue: 1.1,
                        duration: 1500,
                        useNativeDriver: true,
                    }),
                    Animated.timing(pulseAnim, {
                        toValue: 1,
                        duration: 1500,
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        }
    }, [visible]);

    return (
        <Modal
            visible={visible}
            animationType="fade"
            transparent
            onRequestClose={onClose}
        >
            <View style={{
                flex: 1,
                backgroundColor: 'rgba(0, 0, 0, 0.85)',
                justifyContent: 'center',
                alignItems: 'center',
                padding: 20,
            }}>
                <View style={{
                    backgroundColor: '#0f0f23',
                    borderRadius: 28,
                    padding: 0,
                    width: '100%',
                    maxWidth: 420,
                    shadowColor: '#667eea',
                    shadowOffset: { width: 0, height: 20 },
                    shadowOpacity: 0.6,
                    shadowRadius: 25,
                    elevation: 15,
                    borderWidth: 1,
                    borderColor: 'rgba(102, 126, 234, 0.3)',
                    overflow: 'hidden',
                }}>
                    {/* Gradiente decorativo superior - Solo Web */}
                    {Platform.OS === 'web' && (
                        <View style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: 200,
                            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(239, 68, 68, 0.15) 100%)',
                            opacity: 0.5,
                        }} />
                    )}

                    {/* Header */}
                    <View style={{
                        padding: 32,
                        paddingBottom: 24,
                        alignItems: 'center',
                    }}>
                        <Animated.View style={{
                            transform: [{ scale: pulseAnim }],
                            marginBottom: 20,
                        }}>
                            <View style={{
                                width: 100,
                                height: 100,
                                borderRadius: 50,
                                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                                justifyContent: 'center',
                                alignItems: 'center',
                                borderWidth: 3,
                                borderColor: 'rgba(239, 68, 68, 0.4)',
                                shadowColor: '#ef4444',
                                shadowOpacity: 0.5,
                                shadowRadius: 20,
                                shadowOffset: { width: 0, height: 10 },
                            }}>
                                <View style={{
                                    width: 80,
                                    height: 80,
                                    borderRadius: 40,
                                    backgroundColor: 'rgba(239, 68, 68, 0.2)',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                }}>
                                    <Ionicons name="time-outline" size={48} color="#ef4444" />
                                </View>
                            </View>
                        </Animated.View>

                        <Text style={{
                            fontSize: 28,
                            fontWeight: '800',
                            color: '#ffffff',
                            marginBottom: 8,
                            textAlign: 'center',
                            letterSpacing: 0.5,
                        }}>
                            Sesión Expirada
                        </Text>
                        <Text style={{
                            fontSize: 15,
                            color: 'rgba(255, 255, 255, 0.5)',
                            textAlign: 'center',
                            letterSpacing: 0.3,
                        }}>
                            Tu tiempo de sesión ha finalizado
                        </Text>
                    </View>

                    {/* Contenido */}
                    <View style={{ paddingHorizontal: 32, paddingBottom: 24 }}>
                        <View style={{
                            backgroundColor: 'rgba(251, 146, 60, 0.08)',
                            borderWidth: 1,
                            borderColor: 'rgba(251, 146, 60, 0.3)',
                            padding: 20,
                            borderRadius: 16,
                            marginBottom: 24,
                        }}>
                            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 14 }}>
                                <View style={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: 18,
                                    backgroundColor: 'rgba(251, 146, 60, 0.2)',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    marginTop: 2,
                                }}>
                                    <Ionicons name="shield-checkmark" size={20} color="#fb923c" />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={{
                                        fontSize: 15,
                                        fontWeight: '600',
                                        color: '#fb923c',
                                        marginBottom: 8,
                                        letterSpacing: 0.2,
                                    }}>
                                        Seguridad activa
                                    </Text>
                                    <Text style={{
                                        fontSize: 14,
                                        color: 'rgba(255, 255, 255, 0.75)',
                                        lineHeight: 21,
                                        marginBottom: 6,
                                    }}>
                                        Tu sesión expiró después de un período de inactividad para proteger tu cuenta.
                                    </Text>
                                    <Text style={{
                                        fontSize: 13,
                                        color: 'rgba(255, 255, 255, 0.6)',
                                        lineHeight: 19,
                                    }}>
                                        Inicia sesión nuevamente para continuar de forma segura.
                                    </Text>
                                </View>
                            </View>
                        </View>

                        {/* Elementos decorativos */}
                        <View style={{
                            flexDirection: 'row',
                            justifyContent: 'center',
                            gap: 12,
                            marginBottom: 24,
                        }}>
                            {[0, 1, 2].map((i) => (
                                <View
                                    key={i}
                                    style={{
                                        width: 8,
                                        height: 8,
                                        borderRadius: 4,
                                        backgroundColor: i === 1 ? '#667eea' : 'rgba(102, 126, 234, 0.3)',
                                    }}
                                />
                            ))}
                        </View>
                    </View>

                    {/* Footer - Botón */}
                    <View style={{ padding: 32, paddingTop: 0 }}>
                        <TouchableOpacity
                            style={[
                                {
                                    backgroundColor: '#667eea',
                                    paddingVertical: 18,
                                    borderRadius: 14,
                                    alignItems: 'center',
                                    flexDirection: 'row',
                                    justifyContent: 'center',
                                    gap: 12,
                                    shadowColor: '#667eea',
                                    shadowOpacity: 0.6,
                                    shadowRadius: 15,
                                    shadowOffset: { width: 0, height: 8 },
                                    elevation: 8,
                                    borderWidth: 1,
                                    borderColor: 'rgba(255, 255, 255, 0.1)',
                                },
                                // ✅ Gradiente solo en Web
                                Platform.OS === 'web' && {
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                }
                            ]}
                            onPress={onClose}
                            activeOpacity={0.85}
                        >
                            <Ionicons name="log-in" size={24} color="white" />
                            <Text style={{
                                color: 'white',
                                fontSize: 17,
                                fontWeight: '700',
                                letterSpacing: 0.5,
                            }}>
                                Iniciar Sesión
                            </Text>
                        </TouchableOpacity>

                        <Text style={{
                            textAlign: 'center',
                            fontSize: 12,
                            color: 'rgba(255, 255, 255, 0.4)',
                            marginTop: 16,
                            letterSpacing: 0.3,
                        }}>
                            Serás redirigido al inicio de sesión
                        </Text>
                    </View>
                </View>
            </View>
        </Modal>
    );
}
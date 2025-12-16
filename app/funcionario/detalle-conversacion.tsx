// app/funcionario/detalle-conversacion.tsx
import { Stack } from 'expo-router';
import React from 'react';
import DetalleConversacionPage from '../../src/pages/Funcionario/DetalleConversacionPage';

export default function DetalleConversacionScreen() {
  return (
    <>
      <Stack.Screen 
        options={{
          headerShown: false,
          title: 'Detalle de Conversación',
        }}
      />
      <DetalleConversacionPage />
    </>
  );
}
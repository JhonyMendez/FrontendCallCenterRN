// app/_layout.tsx
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack 
        screenOptions={{ 
          headerShown: false,
          contentStyle: { backgroundColor: '#f5f5f5' },
          animation: 'slide_from_right'
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="cambiar-password" />
        <Stack.Screen name="(superadmin)" />
        <Stack.Screen name="(admin)" />
        <Stack.Screen name="(funcionario)" />
      </Stack>
    </>
  );
}
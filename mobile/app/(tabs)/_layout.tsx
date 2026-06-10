import { Tabs } from 'expo-router'

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0f0f0f',
          borderTopColor: '#222',
        },
        tabBarActiveTintColor: '#6C63FF',
        tabBarInactiveTintColor: '#555',
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: () => null }} />
      <Tabs.Screen name="bookings" options={{ title: 'Bookings', tabBarIcon: () => null }} />
      <Tabs.Screen name="buddies" options={{ title: 'Buddies', tabBarIcon: () => null }} />
      <Tabs.Screen name="ai" options={{ title: 'AI Coach', tabBarIcon: () => null }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: () => null }} />
    </Tabs>
  )
}
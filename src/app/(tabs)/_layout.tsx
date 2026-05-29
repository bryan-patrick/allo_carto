import MaterialIcons from '@/node_modules/@expo/vector-icons/MaterialIcons';
import { Tabs } from "@/node_modules/expo-router";
import colors from '../styles';

/**
 * Icon dir here
 * https://mui.com/material-ui/material-icons/
 */
export default function TabsLayout({ size = 28 }) {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.light.secondary,
        tabBarInactiveTintColor: colors.light.background,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          headerTitle: 'Allo',
          tabBarIcon: ({ color }) => <MaterialIcons color={color} size={size} name="home" />,
        }}
      />
      <Tabs.Screen
        name="Stats"
        options={{
          title: 'Stats',
          tabBarIcon: ({ color }) => <MaterialIcons color={color} size={size} name="star" />,
        }}
      />
      <Tabs.Screen
        name="Settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <MaterialIcons color={color} size={size} name="settings" />,
        }}
      />
      <Tabs.Screen name="(routes)/TestLoader" options={{
        headerShown: true,
        headerTitle: 'Test Loader'
      }} />
    </Tabs>
  )
}
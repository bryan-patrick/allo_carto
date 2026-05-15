import MaterialIcons from '@/node_modules/@expo/vector-icons/MaterialIcons';
import { Tabs } from "@/node_modules/expo-router";

/**
 * Icon dir here
 * https://mui.com/material-ui/material-icons/
 */
export default function TabsLayout({ size = 28 }) {
  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          headerTitle: 'Home',
          tabBarIcon: ({ color }) => <MaterialIcons color={color} size={size} name="home" />,
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: 'Stats',
          tabBarIcon: ({ color }) => <MaterialIcons color={color} size={size} name="star" />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <MaterialIcons color={color} size={size} name="settings" />,
        }}
      />
    </Tabs>
  )
}
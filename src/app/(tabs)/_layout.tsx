import MaterialSymbol from '@/src/components/MaterialSymbol';
import { Tabs } from 'expo-router';
import colors from '../colors';

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
					tabBarIcon: ({ color }) => (
						<MaterialSymbol
							color={color}
							size={size}
							name="home"
						/>
					),
				}}
			/>
			<Tabs.Screen
				name="settings"
				options={{
					title: 'Settings',
					tabBarIcon: ({ color }) => (
						<MaterialSymbol
							color={color}
							size={size}
							name="settings"
						/>
					),
				}}
			/>
			<Tabs.Screen
				name="TestLoader"
				options={{
					headerShown: true,
					headerTitle: 'Test Loader',
				}}
			/>
		</Tabs>
	);
}

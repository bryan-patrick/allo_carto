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
				tabBarInactiveTintColor: colors.light.border,
				tabBarIconStyle: {
					marginBottom: 4,
				},
			}}
		>
			<Tabs.Screen
				name="index"
				options={{
					title: 'Stories',
					headerTitle: '',
					headerTransparent: true,
					tabBarIcon: ({ color }) => (
						<MaterialSymbol
							color={color}
							size={size}
							name="auto_stories"
						/>
					),
				}}
			/>
			<Tabs.Screen
				name="collection"
				options={{
					title: 'Collections',
					tabBarIcon: ({ color }) => (
						<MaterialSymbol
							color={color}
							size={size}
							name="collections_bookmark"
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
		</Tabs>
	);
}

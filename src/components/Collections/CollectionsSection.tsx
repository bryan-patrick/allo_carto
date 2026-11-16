import colors from '@/src/app/colors';
import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

/**
 * Typing
 */
interface CollectionsSectionProps {
	title: string;
	count: number;
	children: ReactNode;
}

/**
 * Shows a collection list with its heading and item count.
 */
export default function CollectionsSection({ title, count, children }: CollectionsSectionProps) {
	return (
		<View style={styles.section}>
			<View style={styles.header}>
				<Text
					accessibilityRole="header"
					style={styles.title}
				>
					{title}
				</Text>
				<Text style={styles.count}>{count}</Text>
			</View>
			{children}
		</View>
	);
}

/**
 * Styles
 */
const styles = StyleSheet.create({
	section: {
		gap: 6,
	},
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		gap: 6,
	},
	title: {
		fontFamily: 'lexend-600',
		fontSize: 18,
		color: colors.dark.text,
	},
	count: {
		fontFamily: 'lexend-600',
		fontSize: 13,
		color: colors.dark.text,
		backgroundColor: colors.light.background,
		paddingHorizontal: 10,
		paddingVertical: 3,
		borderRadius: 6,
	},
});

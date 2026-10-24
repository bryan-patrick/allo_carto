import colors from '@/src/app/colors';
import type { UserProgressRow } from '@/src/util/progression';
import type { ReactNode } from 'react';
import { StyleSheet, Text, View, type StyleProp, type TextStyle } from 'react-native';
import CollectionGems from './CollectionGems';

/**
 * Typing
 */
interface DeckHeaderProps {
	title: string;
	progress?: UserProgressRow;
	children?: ReactNode;
	titleStyle?: StyleProp<TextStyle>;
}

/**
 * Separate component that includes our collection gems for the deck header
 */
export default function DeckHeader({ title, progress, children, titleStyle }: DeckHeaderProps) {
	return (
		<View style={styles.container}>
			{!progress?.hasStartedFlashcards && (
				<View style={styles.newBadge}>
					<Text style={styles.newBadgeText}>New!</Text>
				</View>
			)}
			<View style={styles.headerRow}>
				<Text style={[styles.title, titleStyle]}>{title}</Text>
				<CollectionGems
					title={title}
					progress={progress}
				/>
			</View>
			{children}
		</View>
	);
}

/**
 * Styles
 */
const styles = StyleSheet.create({
	container: {
		gap: 6,
	},
	headerRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		gap: 8,
	},
	title: {
		flex: 1,
		color: colors.dark.text,
		fontFamily: 'lexend-600',
		fontSize: 14,
	},
	newBadge: {
		alignSelf: 'flex-start',
		backgroundColor: colors.dark.primary,
		borderRadius: 4,
		paddingHorizontal: 7,
		paddingVertical: 2,
	},
	newBadgeText: {
		color: colors.light.text,
		fontFamily: 'lexend-600',
		fontSize: 10,
	},
});

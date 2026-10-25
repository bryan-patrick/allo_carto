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
	subtitle?: string;
	progress?: UserProgressRow;
	children?: ReactNode;
	titleStyle?: StyleProp<TextStyle>;
}

/**
 * We use this to show a paragraph's title, gems, and New badge.
 */
export default function DeckHeader({
	title,
	subtitle,
	progress,
	children,
	titleStyle,
}: DeckHeaderProps) {
	const showNewBadge = !progress?.hasStartedFlashcards;

	return (
		<View style={styles.container}>
			{(subtitle || showNewBadge) && (
				<View style={styles.labelRow}>
					{subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
					{showNewBadge && (
						<View style={styles.newBadge}>
							<Text style={styles.newBadgeText}>New!</Text>
						</View>
					)}
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
	labelRow: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		alignItems: 'center',
		gap: 8,
	},
	subtitle: {
		color: colors.dark.text,
		fontFamily: 'lexend-600',
		fontSize: 12,
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

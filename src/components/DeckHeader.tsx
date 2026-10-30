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
	subtitleAction?: ReactNode;
	progress?: UserProgressRow;
	wordCount?: number;
	children?: ReactNode;
	titleStyle?: StyleProp<TextStyle>;
	fontSizeOffset?: number;
}

/**
 * Show a paragraph's title, word progress, gems, and New badge together.
 */
export default function DeckHeader({
	title,
	subtitle,
	subtitleAction,
	progress,
	wordCount,
	children,
	titleStyle,
	fontSizeOffset = 0,
}: DeckHeaderProps) {
	const showNewBadge = !progress?.hasStartedFlashcards;
	const subtitleTextSize = { fontSize: styles.subtitle.fontSize + fontSizeOffset };
	const titleTextSize = { fontSize: styles.title.fontSize + fontSizeOffset };
	const badgeTextSize = { fontSize: styles.newBadgeText.fontSize + fontSizeOffset };

	return (
		<View style={styles.container}>
			{(subtitle || showNewBadge) && (
				<View style={styles.labelRow}>
					<View style={styles.labelDetails}>
						{subtitle && <Text style={[styles.subtitle, subtitleTextSize]}>{subtitle}</Text>}
						{subtitleAction}
						{showNewBadge && (
							<View style={styles.newBadge}>
								<Text style={[styles.newBadgeText, badgeTextSize]}>New!</Text>
							</View>
						)}
					</View>
					<View>
						<CollectionGems
							title={title}
							progress={progress}
						/>
					</View>
				</View>
			)}
			{children}
		</View>
	);
}

/**
 * Styles
 */
const styles = StyleSheet.create({
	container: {
		gap: 2,
	},
	labelRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		gap: 8,
	},
	labelDetails: {
		flex: 1,
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

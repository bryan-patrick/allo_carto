import colors from '@/src/app/colors';
import type { UserProgressRow } from '@/src/util/progression';
import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import CollectionGems from './CollectionGems';

/**
 * Typing
 */
interface ParagraphHeaderProps {
	label: string;
	progress?: UserProgressRow;
	children?: ReactNode;
	fontSize?: number;
	showGems?: boolean;
}

/**
 * Shows a paragraph's number, New badge, optional gems, and extra details.
 */
export default function ParagraphHeader({
	label,
	progress,
	children,
	fontSize = 12,
	showGems = true,
}: ParagraphHeaderProps) {
	/**
	 * Badge visibility and text size
	 */
	const showNewBadge = !progress?.hasStartedFlashcards;
	const labelTextSize = {
		fontSize,
	};

	return (
		<View style={styles.container}>
			<View style={styles.labelRow}>
				<View style={styles.labelDetails}>
					<Text style={[styles.label, labelTextSize]}>{label}</Text>
					{showNewBadge && (
						<View style={styles.newBadge}>
							<Text
								numberOfLines={1}
								style={[styles.newBadgeText, labelTextSize]}
							>
								New!
							</Text>
						</View>
					)}
				</View>
				{showGems && (
					<CollectionGems
						title={label}
						progress={progress}
					/>
				)}
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
	label: {
		color: colors.dark.text,
		fontFamily: 'lexend-600',
	},
	newBadge: {
		flexShrink: 0,
		alignSelf: 'flex-start',
		backgroundColor: colors.dark.primary,
		borderRadius: 4,
		paddingHorizontal: 7,
		paddingVertical: 2,
	},
	newBadgeText: {
		color: colors.light.text,
		fontFamily: 'lexend-600',
	},
});

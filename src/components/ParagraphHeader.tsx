import colors from '@/src/app/colors';
import { solidSurfaceShadow } from '@/src/components/surfaceStyles';
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
	fontFamily?: string;
	showGems?: boolean;
	showNewBadge?: boolean;
}

/**
 * Shows a paragraph's number, New badge, optional gems, and extra details.
 */
export default function ParagraphHeader({
	label,
	progress,
	children,
	fontSize = 12,
	fontFamily = 'lexend-600',
	showGems = true,
	showNewBadge = true,
}: ParagraphHeaderProps) {
	/**
	 * Badge visibility and text size
	 */
	const isNewBadgeVisible = showNewBadge && !progress?.hasStartedFlashcards;
	const labelTextSize = {
		fontSize,
	};
	const labelFontStyle = {
		fontFamily,
	};

	return (
		<View style={styles.container}>
			<View style={styles.labelRow}>
				<View style={styles.labelDetails}>
					<Text style={[styles.label, labelTextSize, labelFontStyle]}>{label}</Text>
					{isNewBadgeVisible && (
						<View style={styles.newBadge}>
							<Text
								numberOfLines={1}
								style={styles.newBadgeText}
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
	},
	newBadge: {
		...solidSurfaceShadow,
		flexShrink: 0,
		alignSelf: 'flex-start',
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: colors.dark.primary,
		borderRadius: 4,
		paddingHorizontal: 7,
		paddingVertical: 2,
	},
	newBadgeText: {
		color: colors.light.text,
		fontFamily: 'lexend-600',
		fontSize: 12,
	},
});

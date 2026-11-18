import colors from '@/src/app/colors';
import { buttonContentStyles } from '@/src/components/buttonContentStyles';
import { getWordProgressDefinitionByKey, type WordProgressKey } from '@/src/util/wordProgress';
import { StyleSheet, Text, View } from 'react-native';
import { WordProgressIcon } from './WordProgress';

interface WordProgressBadgeProps {
	progress: WordProgressKey;
	placement?: 'corner' | 'inline';
	showIcon?: boolean;
}

/**
 * Shows a word'a learning level as a badge
 */
export default function WordProgressBadge({
	progress,
	placement = 'corner',
	showIcon = false,
}: WordProgressBadgeProps) {
	const definition = getWordProgressDefinitionByKey(progress);
	const badgeStyle = {
		backgroundColor: colors.wordProgress[progress],
	};
	const textStyle = {
		color: colors.wordProgressLight[progress],
	};

	return (
		<View
			pointerEvents="none"
			style={[
				styles.badge,
				placement === 'corner' && styles.cornerBadge,
				showIcon && styles.badgeWithIcon,
				badgeStyle,
			]}
		>
			{showIcon && (
				<WordProgressIcon
					progress={progress}
					size={12}
					color={colors.wordProgressLight[progress]}
					style={styles.icon}
				/>
			)}
			<Text style={[styles.label, textStyle]}>{definition.name}</Text>
		</View>
	);
}

/**
 * Styles
 */
const styles = StyleSheet.create({
	badge: {
		borderRadius: buttonContentStyles.miniButton.borderRadius,
		borderWidth: 1,
		borderColor: colors.light.border,
		paddingHorizontal: 4,
		paddingVertical: 1,
	},
	badgeWithIcon: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 3,
	},
	cornerBadge: {
		position: 'absolute',
		top: 0,
		right: -5,
		zIndex: 1,
		transform: [
			{
				rotate: '8deg',
			},
		],
	},
	label: {
		fontFamily: 'lexend-600',
		textAlign: 'center',
		fontSize: 10,
		lineHeight: 12,
		includeFontPadding: false,
	},
	icon: {
		lineHeight: 12,
		includeFontPadding: false,
	},
});

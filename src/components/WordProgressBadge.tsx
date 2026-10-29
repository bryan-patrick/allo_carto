import colors from '@/src/app/colors';
import { getWordProgressDefinitionByKey, type WordProgressKey } from '@/src/util/wordProgress';
import { StyleSheet, Text, View } from 'react-native';

interface WordProgressBadgeProps {
	progress: WordProgressKey;
}

/**
 * Shows the learning stage as a small, tilted sticker on the collection's upper-right corner.
 */
export default function WordProgressBadge({ progress }: WordProgressBadgeProps) {
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
			style={[styles.badge, badgeStyle]}
		>
			<Text style={[styles.label, textStyle]}>{definition.name}</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	badge: {
		position: 'absolute',
		top: 0,
		right: -5,
		zIndex: 1,
		transform: [
			{
				rotate: '8deg',
			},
		],
		borderRadius: 3,
		borderWidth: 1,
		borderColor: colors.light.border,
		paddingHorizontal: 6,
		paddingVertical: 2,
		minWidth: 60,
	},
	label: {
		fontFamily: 'lexend-600',
		textAlign: 'center',
		fontSize: 12,
	},
});

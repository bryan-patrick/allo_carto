import type { UnlockCriteria } from '@/src/util/atlasCompletion';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { StyleSheet, Text, View } from 'react-native';

/**
 * Typing
 */
interface ChapterLockedButtonProps {
	color: string;
	unlockCriteria: UnlockCriteria[];
}

/**
 * ChapterLockedButton component
 */
export default function ChapterLockedButton({ color, unlockCriteria }: ChapterLockedButtonProps) {
	const { buttonContainer, criteriaContainer, criteriaMet, criteriaText, criteriaTitle } = styles;

	return (
		<View style={[buttonContainer, { borderColor: color }]}>
			<MaterialIcons
				color={color}
				size={24}
				name="lock"
			/>
			<View style={criteriaContainer}>
				{unlockCriteria.map(({ title, isUnlocked, requiredPercentage }, index) => (
					<Text
						key={`${title}-${index}`}
						style={[criteriaText, isUnlocked && criteriaMet]}
					>
						Reach {requiredPercentage}% in{' '}
						<Text style={[criteriaTitle, isUnlocked && criteriaMet]}>{title}</Text> to unlock.
					</Text>
				))}
			</View>
		</View>
	);
}

/**
 * Styles
 */
const styles = StyleSheet.create({
	buttonContainer: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		borderWidth: 1,
		padding: 8,
		marginHorizontal: 8,
		borderRadius: 8,
		gap: 8,
	},
	criteriaContainer: {
		gap: 4,
	},
	criteriaText: {
		fontFamily: 'lexend-400',
		fontSize: 14,
	},
	criteriaMet: {
		textDecorationLine: 'line-through',
	},
	criteriaTitle: {
		fontFamily: 'lexend-600',
	},
});

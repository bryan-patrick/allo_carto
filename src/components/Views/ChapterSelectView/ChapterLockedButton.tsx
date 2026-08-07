import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { StyleSheet, Text, View } from 'react-native';

/**
 * Typing
 */
interface ChapterLockedButtonProps {
	color: string;
	unlockCriteria: string[];
}

/**
 * ChapterLockedButton component
 */
export default function ChapterLockedButton({ color, unlockCriteria }: ChapterLockedButtonProps) {
	const { buttonContainer, criteriaContainer, criteriaText } = styles;

	return (
		<View style={[buttonContainer, { borderColor: color }]}>
			<MaterialIcons
				color={color}
				size={24}
				name="lock"
			/>
			<View style={criteriaContainer}>
				{unlockCriteria.map((criterion, index) => (
					<Text
						key={`${criterion}-${index}`}
						style={criteriaText}
					>
						{criterion}
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
		borderWidth: 5,
	},
	criteriaContainer: {},
	criteriaText: {
		fontSize: 14,
	},
});

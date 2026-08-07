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
	const { buttonContainerStyle, criteriaContainerStyle } = styles;

	return (
		<View style={[buttonContainerStyle, { borderColor: color }]}>
			<MaterialIcons
				color={color}
				size={24}
				name="lock"
			/>
			<View style={criteriaContainerStyle}>
				{unlockCriteria.map((criterion, index) => (
					<Text key={`${criterion}-${index}`}>{criterion}</Text>
				))}
			</View>
		</View>
	);
}

/**
 * Styles
 */
const styles = StyleSheet.create({
	buttonContainerStyle: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
	},
	criteriaContainerStyle: {},
});

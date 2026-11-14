import type { DeckStory } from '@/data/french/storyAtlas';
import colors from '@/src/app/colors';
import LinkButton from '@/src/components/LinkButton';
import { StyleSheet, Text, View } from 'react-native';

/**
 * Typing
 */
interface StorySelectButtonProps {
	story: DeckStory;
	isSelected: boolean;
	disabled?: boolean;
	hasStarted?: boolean;
	onSelect: (story: DeckStory) => void;
}

/**
 * Story select button
 */
export default function StorySelectButton({
	story,
	isSelected,
	disabled = false,
	hasStarted = false,
	onSelect,
}: StorySelectButtonProps) {
	const { category } = story;
	const color = colors.category[category];
	const selectText = hasStarted ? 'Continue Story' : 'Start Story';

	if (isSelected) {
		return (
			<View
				accessible
				accessibilityRole="text"
				style={[styles.selectedStory, { borderColor: color }]}
			>
				<Text style={[styles.storySelectButtonText, styles.selectedStoryText, { color }]}>
					Currently selected
				</Text>
			</View>
		);
	}

	/**
	 * Render the component
	 */
	return (
		<LinkButton
			arrowSize={16}
			hitSlop={10}
			handler={() => onSelect(story)}
			accessibilityLabel={`Select story: ${story.name}`}
			color={color}
			disabled={disabled}
			fullwidth
		>
			<Text style={styles.storySelectButtonText}>{selectText}</Text>
		</LinkButton>
	);
}

/**
 * Styles
 */
const styles = StyleSheet.create({
	selectedStory: {
		width: '100%',
		alignItems: 'center',
		justifyContent: 'center',
		borderWidth: 1,
		borderRadius: 8,
		paddingHorizontal: 16,
		paddingVertical: 10,
	},
	selectedStoryText: {
		fontFamily: 'lexend-600',
	},
	storySelectButtonText: {
		fontSize: 14,
	},
});

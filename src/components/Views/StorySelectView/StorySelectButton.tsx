import type { DeckStory } from '@/data/french/storyAtlas';
import LinkButton from '@/src/components/LinkButton';
import { StyleSheet, Text } from 'react-native';

/**
 * Typing
 */
interface StorySelectButtonProps {
	story: DeckStory;
	disabled?: boolean;
	progressPercent?: number;
}

/**
 * Story select button
 */
export default function StorySelectButton({
	story,
	disabled = false,
	progressPercent = 0,
}: StorySelectButtonProps) {
	const { id: storyId, color } = story;
	const selectText = progressPercent > 0 ? 'Continue Story' : 'Start Story';

	/**
	 * Render the component
	 */
	return (
		<LinkButton
			arrowSize={16}
			hitSlop={10}
			params={{ storyId }}
			screen="(routes)/ChapterSelect"
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
	storySelectButtonText: {
		fontSize: 14,
	},
});

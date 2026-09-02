import { DeckChapter } from '@/data/french/deckAtlas';
import LinkButton from '@/src/components/LinkButton';
import { StyleSheet, Text } from 'react-native';

/**
 * Typing
 */
interface ChapterSelectButtonProps {
	chapter: DeckChapter;
	disabled?: boolean;
	progressPercent?: number;
}

/**
 * Chapter select button
 */
export default function ChapterSelectButton({
	chapter,
	disabled = false,
	progressPercent = 0,
}: ChapterSelectButtonProps) {
	const { id, color } = chapter;
	const selectText = progressPercent > 0 ? 'Continue Chapter' : 'Start Chapter';

	/**
	 * Render the component
	 */
	return (
		<LinkButton
			arrowSize={16}
			hitSlop={10}
			params={{ id }}
			screen="(routes)/PlaceSelect"
			color={color}
			disabled={disabled}
			fullwidth
		>
			<Text style={styles.chapterSelectButtonText}>{selectText}</Text>
		</LinkButton>
	);
}

/**
 * Styles
 */
const styles = StyleSheet.create({
	chapterSelectButtonText: {
		fontSize: 14,
	},
});

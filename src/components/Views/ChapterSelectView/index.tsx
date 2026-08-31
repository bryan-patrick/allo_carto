import type { DeckChapter } from '@/data/french/deckAtlas';
import { deckAtlas } from '@/data/french/deckAtlas';
import Loader from '@/src/components/Loader';
import { useUserProgress } from '@/src/db/useUserProgress';
import { isItemUnlocked } from '@/src/util/atlasCompletion';
import { ScrollView, StyleSheet, Text } from 'react-native';
import Chapter from './Chapter';

/**
 * Component chapter select view
 */
export default function ChapterSelectView() {
	const { chapters } = deckAtlas;
	const { progressById, status } = useUserProgress();

	/**
	 * Wait for the user's stored percentages
	 */
	if (status === 'loading') return <Loader />;
	if (status === 'error') return <Text>Could not load chapter progress.</Text>;

	/**
	 * Render the component
	 */
	return (
		<ScrollView
			style={styles.scrollView}
			contentContainerStyle={styles.scrollViewContainer}
		>
			{chapters.map((chapter: DeckChapter, index) => {
				const { id } = chapter;
				const isLocked = !isItemUnlocked({ id, progressById });
				const progressPercent = progressById[id]?.completionPercentage ?? 0;

				return (
					<Chapter
						chapter={chapter}
						index={index}
						isLocked={isLocked}
						key={id}
						progressById={progressById}
						progressPercent={progressPercent}
					/>
				);
			})}
		</ScrollView>
	);
}

/**
 * Styles
 */
const styles = StyleSheet.create({
	scrollView: {},
	scrollViewContainer: {
		display: 'flex',
		flexDirection: 'column',
		gap: 24,
		paddingVertical: 24,
	},
});

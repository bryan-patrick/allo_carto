import type { DeckChapter, DeckStory } from '@/data/french/storyAtlas';
import colors from '@/src/app/colors';
import BackgroundImage from '@/src/components/BackgroundImage';
import { getUnlockCriteria, isItemUnlocked } from '@/src/util/atlasCompletion';
import type { ProgressById } from '@/src/util/progression';
import { StyleSheet, Text, View } from 'react-native';
import ChapterDeckList from './ChapterDeckList';
import ChapterHeader from './ChapterHeader';
import LockedSection from './LockedSection';

const postcardBackground = require('@/src/app/assets/images/postcard-parts/background.jpg');
const borderedPostcardBackground = require('@/src/app/assets/images/postcard-parts/background-bordered.jpg');

/*
 * Typing
 */
interface ChapterPostcardProps {
	chapter: DeckChapter;
	story: DeckStory;
	progressById: ProgressById;
}

// Show the chapter's progress and paragraphs on a postcard, or explain how to unlock it.
export default function ChapterPostcard({ chapter, story, progressById }: ChapterPostcardProps) {
	const color = colors.category[story.category];
	const isLocked = !isItemUnlocked({
		id: chapter.id,
		progressById,
	});
	const unlockCriteria = getUnlockCriteria(chapter, progressById);
	const hasDecks = chapter.decks.length > 0;

	return (
		<View style={styles.stack}>
			<BackgroundImage
				source={borderedPostcardBackground}
				resizeMode="stretch"
				style={[styles.postcard, styles.backPostcard]}
			/>
			<BackgroundImage
				source={postcardBackground}
				style={styles.postcard}
			>
				<View style={styles.border}>
					<ChapterHeader
						chapter={chapter}
						progressById={progressById}
					/>
					{isLocked && (
						<View style={styles.lockedInner}>
							<LockedSection
								color={color}
								unlockCriteria={unlockCriteria}
								fontSize={15}
							/>
						</View>
					)}
					{!isLocked && hasDecks && (
						<ChapterDeckList
							chapter={chapter}
							progressById={progressById}
							story={story}
						/>
					)}
					{!isLocked && !hasDecks && <Text style={styles.comingSoonText}>Coming soon</Text>}
				</View>
			</BackgroundImage>
		</View>
	);
}

/*
 * Styles
 */
const styles = StyleSheet.create({
	stack: {
		margin: 8,
		position: 'relative',
	},
	postcard: {
		padding: 6,
		backgroundColor: colors.dark.background,
		borderWidth: 2,
		borderColor: colors.light.border,
		borderRadius: 12,
		overflow: 'hidden',
	},
	backPostcard: {
		transform: [{ rotate: '-4deg' }],
		padding: 0,
		position: 'absolute',
		top: 0,
		left: 0,
		height: '100%',
		width: '100%',
	},
	border: {
		borderWidth: 0,
		borderRadius: 8,
		borderColor: colors.light.goldenBorder,
	},
	lockedInner: {
		paddingVertical: 16,
		marginBottom: 24,
	},
	comingSoonText: {
		color: colors.dark.text,
		fontFamily: 'lexend-400',
		fontSize: 15,
		paddingVertical: 16,
	},
});

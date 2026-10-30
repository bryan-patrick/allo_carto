import type { DeckStory } from '@/data/french/storyAtlas';
import colors from '@/src/app/colors';
import CollectionGems from '@/src/components/CollectionGems';
import LockedSection from '@/src/components/LockedSection';
import ReadingDescription from '@/src/components/ReadingDescription';
import { getUnlockCriteria } from '@/src/util/atlasCompletion';
import type { ProgressById } from '@/src/util/progression';
import { StyleSheet, Text, View } from 'react-native';
import Book from './Book';
import Cover from './Cover';
import Crease from './Crease';
import Spine from './Spine';
import StoryMeta from './StoryMeta';
import StorySelectButton from './StorySelectButton';

/*
 * Typing
 */
interface StoryProps {
	story: DeckStory;
	isLocked: boolean;
	isSelected: boolean;
	progressById: ProgressById;
	onSelect: (story: DeckStory) => void;
	isSelecting: boolean;
}

/*
 * Story component
 */
export default function Story({
	story,
	progressById,
	isLocked,
	isSelected,
	onSelect,
	isSelecting,
}: StoryProps) {
	const { category, name, materialSymbolName } = story;
	const color = colors.category[category];
	const storyProgress = progressById[story.id];
	const seenWordCount = storyProgress?.seenWordCount ?? 0;
	const wordCount = storyProgress?.wordCount ?? 0;
	const completedParagraphCount = storyProgress?.completedParagraphCount ?? 0;
	const paragraphCount = storyProgress?.paragraphCount ?? 0;
	const hasStarted = seenWordCount > 0 || completedParagraphCount > 0;

	if (isLocked) {
		return (
			<Book>
				<Spine
					color={color}
					category={category}
					materialSymbolName={materialSymbolName}
				/>
				<Crease />
				<Cover>
					<View style={styles.lockedStory}>
						<LockedSection
							color={color}
							style={styles.lockedSection}
							unlockCriteria={getUnlockCriteria(story, progressById)}
						/>
					</View>
				</Cover>
			</Book>
		);
	}

	/*
	 * Render the component
	 */
	return (
		<Book>
			<Spine
				color={color}
				materialSymbolName={materialSymbolName}
				category={category}
			/>
			<Crease />
			<Cover>
				<View style={styles.storyContainerInner}>
					<View style={styles.storyTitleContainer}>
						<View style={styles.storyLabelRow}>
							<View style={styles.categoryRow}>
								<Text style={[styles.category, { color }]}>{category}</Text>
								<CollectionGems
									title={name}
									progress={progressById[story.id]}
									size={16}
								/>
							</View>
						</View>
						<Text style={styles.storyTitle}>{name}</Text>
						<View style={styles.separatorContainer}>
							<View style={[styles.separatorBox, { backgroundColor: color }]} />
							<View style={styles.separatorLine} />
						</View>
						<ReadingDescription
							item={story}
							color={color}
							style={styles.storyDescription}
						/>
					</View>
					<View style={styles.storyImageContainer} />
					<StoryMeta
						completedParagraphCount={completedParagraphCount}
						paragraphCount={paragraphCount}
						progressColor={color}
						seenWordCount={seenWordCount}
						wordCount={wordCount}
					/>
					<StorySelectButton
						story={story}
						isSelected={isSelected}
						disabled={isSelecting}
						hasStarted={hasStarted}
						onSelect={onSelect}
					/>
				</View>
			</Cover>
		</Book>
	);
}

/*
 * Styles
 */
const styles = StyleSheet.create({
	lockedStory: {
		flexGrow: 1,
		padding: 6,
	},
	lockedSection: {
		flexGrow: 1,
	},
	storyContainerInner: {
		padding: 12,
		gap: 12,
	},
	storyTitleContainer: {
		flexShrink: 1,
		wordWrap: 'wrap',
		gap: 4,
	},
	category: {
		color: colors.dark.text,
		fontFamily: 'lexend-600',
		textTransform: 'uppercase',
		fontSize: 12,
	},
	storyLabelRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		gap: 12,
	},
	categoryRow: {
		flexDirection: 'row',
		alignItems: 'center',
		flexShrink: 1,
		flexWrap: 'wrap',
		gap: 8,
	},
	storyTitle: {
		color: colors.dark.text,
		fontFamily: 'lexend-600',
		fontSize: 18,
	},
	separatorContainer: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
		marginVertical: 4,
		marginRight: 4,
	},
	separatorBox: {
		height: 6,
		width: 6,
		transform: 'rotate(45deg)',
	},
	separatorLine: {
		flex: 1,
		borderBottomWidth: 1,
		borderColor: colors.utility.cardBorder,
	},
	storyDescription: {
		color: colors.dark.text,
		fontFamily: 'lexend-400',
		fontSize: 14,
	},
	storyImageContainer: {
		display: 'flex',
		flexDirection: 'row',
	},
});

import type { DeckStory } from '@/data/french/storyAtlas';
import colors from '@/src/app/colors';
import { getUnlockCriteria } from '@/src/util/atlasCompletion';
import type { ProgressById } from '@/src/util/progression';
import { StyleSheet, Text, View } from 'react-native';
import Book from './Book';
import StoryLockedSection from './StoryLockedSection';
import StoryMeta from './StoryMeta';
import StorySelectButton from './StorySelectButton';
import Cover from './Cover';
import Crease from './Crease';
import Spine from './Spine';

/**
 * Typing
 */
interface StoryProps {
	story: DeckStory;
	isLocked: boolean;
	progressById: ProgressById;
	progressPercent: number;
}

/**
 * Story component
 */
export default function Story({ story, progressById, progressPercent, isLocked }: StoryProps) {
	/**
	 * Destructure story
	 */
	const { category, name, description, color, materialSymbolName } = story;

	/**
	 * Get the unlock criteria
	 */
	const unlockCriteria = getUnlockCriteria(story, progressById);

	/**
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
				<View style={[styles.storyContainerInner, { padding: isLocked ? 6 : 12 }]}>
					{!isLocked && (
						<>
							<View style={styles.storyTitleContainer}>
								<Text style={[styles.category, { color }]}>{category}</Text>
								<Text style={styles.storyTitle}>{name}</Text>
								<View style={styles.separatorContainer}>
									<View style={[styles.separatorBox, { backgroundColor: color }]} />
									<View style={styles.separatorLine} />
								</View>
								<Text style={styles.storyDescription}>{description}</Text>
							</View>
							<View style={styles.storyImageContainer} />
							<StoryMeta
								progressPercent={progressPercent}
								progressColor={color ?? '#000000'}
							/>
							<StorySelectButton
								story={story}
								disabled={isLocked}
								progressPercent={progressPercent}
							/>
						</>
					)}
					{isLocked && (
						<StoryLockedSection
							color={color ?? '#000000'}
							unlockCriteria={unlockCriteria}
						/>
					)}
				</View>
			</Cover>
		</Book>
	);
}

/**
 * Styles
 */
const styles = StyleSheet.create({
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

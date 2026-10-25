import { storyAtlas, type DeckStory } from '@/data/french/storyAtlas';
import colors from '@/src/app/colors';
import MaterialSymbol from '@/src/components/MaterialSymbol';
import { useUserContext } from '@/src/db/useUserContext';
import { useUserProgress } from '@/src/db/useUserProgress';
import { isItemUnlocked } from '@/src/util/atlasCompletion';
import { hasStoryContent } from '@/src/util/atlasContent';
import { getSelectedStory } from '@/src/util/getSelectedStory';
import { formatAreaLevelRange, getStoriesForArea } from '@/src/util/storyAreas';
import { StyleSheet, Text, View } from 'react-native';
import Story from './Story';

/**
 * Typing
 */
interface StorySelectViewProps {
	onSelect: (story: DeckStory) => void;
	isSelecting: boolean;
}

/**
 * Show all of the awesome stories we have!
 */
export default function StorySelectView({ onSelect, isSelecting }: StorySelectViewProps) {
	const { experience, progressById } = useUserProgress();
	const user = useUserContext();

	const selectedStory = getSelectedStory({
		selectedStoryId: user?.selectedStoryId,
		progressById,
		userLevel: experience.level,
	});

	const groups = storyAtlas.areas.map(area => ({
		area,
		stories: getStoriesForArea(storyAtlas.stories, area),
	}));

	return (
		<View style={styles.groups}>
			{groups.map(({ area, stories }) => (
				<View
					key={area.id}
					style={styles.group}
				>
					<View style={styles.areaHeading}>
						<MaterialSymbol
							name={area.materialSymbolName}
							color={area.color}
							size={28}
						/>
						<View style={styles.areaDetails}>
							<Text
								accessibilityRole="header"
								style={styles.areaName}
							>
								{area.name}
							</Text>
							<Text style={styles.areaLevels}>{formatAreaLevelRange(area)}</Text>
							<Text style={styles.areaDescription}>{area.description}</Text>
						</View>
					</View>
					{stories.map(story => (
						<Story
							key={story.id}
							story={story}
							isSelected={story.id === selectedStory?.id}
							isLocked={
								!hasStoryContent(story) ||
								!isItemUnlocked({ id: story.id, progressById, userLevel: experience.level })
							}
							progressById={progressById}
							progressPercent={progressById[story.id]?.completionPercentage ?? 0}
							userLevel={experience.level}
							onSelect={onSelect}
							isSelecting={isSelecting}
						/>
					))}
				</View>
			))}
		</View>
	);
}

/**
 * Styles
 */
const styles = StyleSheet.create({
	groups: {
		gap: 28,
		paddingVertical: 12,
	},
	group: {
		gap: 16,
	},
	areaHeading: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 12,
		marginHorizontal: 20,
		paddingBottom: 8,
		borderBottomWidth: 1,
		borderBottomColor: colors.light.border,
	},
	areaDetails: {
		flex: 1,
		gap: 4,
	},
	areaName: {
		fontFamily: 'lexend-600',
		fontSize: 20,
		color: colors.dark.text,
	},
	areaLevels: {
		fontFamily: 'lexend-400',
		fontSize: 12,
		color: colors.dark.text,
	},
	areaDescription: {
		fontFamily: 'lexend-400',
		fontSize: 12,
		color: colors.dark.text,
	},
});

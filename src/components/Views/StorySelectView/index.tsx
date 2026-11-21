import { storyAtlas, type Story } from '@/data/french/storyAtlas';
import colors from '@/src/app/colors';
import MaterialSymbol from '@/src/components/MaterialSymbol';
import { useUserContext } from '@/src/db/useUserContext';
import { useUserProgress } from '@/src/db/useUserProgress';
import { isItemUnlocked } from '@/src/util/atlasCompletion';
import { hasStoryContent } from '@/src/util/atlasContent';
import { getSelectedStory } from '@/src/util/getSelectedStory';
import { getStoriesForArea } from '@/src/util/storyAreas';
import { StyleSheet, Text, View } from 'react-native';
import StoryCard from './Story';

/**
 * Typing
 */
interface StorySelectViewProps {
	onSelect: (story: Story) => void;
	isSelecting: boolean;
}

/**
 * Show all of the awesome stories we have!
 */
export default function StorySelectView({ onSelect, isSelecting }: StorySelectViewProps) {
	const { progressById } = useUserProgress();
	const user = useUserContext();

	const selectedStory = getSelectedStory({
		selectedStoryId: user?.selectedStoryId,
		progressById,
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
							color={colors.dark.text}
							size={28}
						/>
						<View style={styles.areaDetails}>
							<Text
								accessibilityRole="header"
								style={styles.areaName}
							>
								{area.name}
							</Text>
							<Text style={styles.areaDescription}>{area.description}</Text>
						</View>
					</View>
					{stories.map(story => (
						<StoryCard
							key={story.id}
							story={story}
							isSelected={story.id === selectedStory?.id}
							isLocked={
								!hasStoryContent(story) ||
								!isItemUnlocked({
									id: story.id,
									progressById,
								})
							}
							progressById={progressById}
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
	},
	areaName: {
		fontFamily: 'shadows-400',
		fontSize: 24,
		color: colors.dark.text,
	},
	areaLevels: {
		fontFamily: 'lexend-400',
		fontSize: 12,
		color: colors.dark.text,
	},
	areaDescription: {
		fontFamily: 'lexend-600',
		fontSize: 16,
		color: colors.dark.text,
	},
});

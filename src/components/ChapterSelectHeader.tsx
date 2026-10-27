import type { DeckStory } from '@/data/french/storyAtlas';
import colors from '@/src/app/colors';
import { useUserContext } from '@/src/db/useUserContext';
import { useUserProgress } from '@/src/db/useUserProgress';
import { isItemUnlocked } from '@/src/util/atlasCompletion';
import { getSelectedStory } from '@/src/util/getSelectedStory';
import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LevelBadge from './LevelBadge';
import ReadingDescription from './ReadingDescription';
import StorySelectModal from './StorySelectModal';
import StorySelector from './StorySelector';

/**
 * Component header that shows the story select, user level, and story meta
 */
export default function ChapterSelectHeader() {
	const insets = useSafeAreaInsets();
	const user = useUserContext();
	const { experience, progressById, status } = useUserProgress();
	const [isStoryModalVisible, setIsStoryModalVisible] = useState(false);
	const [isSelectingStory, setIsSelectingStory] = useState(false);
	const selectedStory = getSelectedStory({
		selectedStoryId: user?.selectedStoryId,
		progressById,
		userLevel: experience.level,
	});
	const insetStyle = {
		paddingTop: insets.top + 8,
		paddingLeft: Math.max(insets.left, 12),
		paddingRight: Math.max(insets.right, 12),
	};
	const isReady = status === 'ready' && selectedStory;

	async function handleSelectStory(story: DeckStory) {
		if (
			!user ||
			isSelectingStory ||
			!isItemUnlocked({ id: story.id, progressById, userLevel: experience.level })
		) {
			return;
		}

		setIsSelectingStory(true);
		const didSave = await user.selectStory(story.id);
		setIsSelectingStory(false);

		if (!didSave) {
			Alert.alert('Story not selected', 'Could not save your story choice. Please try again.');
			return;
		}

		setIsStoryModalVisible(false);
	}

	return (
		<View style={[styles.header, insetStyle]}>
			<View style={styles.topRow}>
				<View style={styles.storySelector}>
					{isReady && (
						<StorySelector
							story={selectedStory}
							isExpanded={isStoryModalVisible}
							onPress={() => setIsStoryModalVisible(true)}
						/>
					)}
				</View>
				<LevelBadge />
			</View>
			{isReady && (
				<View style={styles.detailsRow}>
					<ReadingDescription
						item={selectedStory}
						color={colors.light.goldenBorder}
						style={styles.readStoryLink}
						showDescription={false}
					/>
					<View style={styles.progressRow}>
						<Text style={styles.category}>
							{selectedStory.category} - Lvl. {selectedStory.requiredLevel}
						</Text>
					</View>
				</View>
			)}
			<StorySelectModal
				visible={isStoryModalVisible}
				onRequestClose={() => setIsStoryModalVisible(false)}
				onSelect={handleSelectStory}
				isSelecting={isSelectingStory}
			/>
		</View>
	);
}

/**
 * Styles
 */
const styles = StyleSheet.create({
	header: {
		backgroundColor: colors.dark.background,
		borderBottomWidth: 1,
		borderBottomColor: `${colors.light.goldenBorder}30`,
		paddingBottom: 12,
		gap: 4,
	},
	topRow: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	storySelector: {
		flex: 1,
		minWidth: 0,
	},
	detailsRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'flex-start',
		gap: 12,
	},
	progressRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
	},
	category: {
		fontFamily: 'lexend-600',
		fontSize: 12,
		textTransform: 'uppercase',
		color: colors.light.goldenBorder,
	},
	readStoryLink: {
		fontFamily: 'lexend-400',
		fontSize: 12,
		color: colors.light.goldenBorder,
	},
});

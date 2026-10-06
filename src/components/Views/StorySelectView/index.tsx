import type { StoryArea } from '@/data/french/storyAreas';
import { storyAtlas } from '@/data/french/storyAtlas';
import colors from '@/src/app/colors';
import Loader from '@/src/components/Loader';
import StoryAreaModal from '@/src/components/StoryAreaModal';
import StoryAreaSelector from '@/src/components/StoryAreaSelector';
import { useUserProgress } from '@/src/db/useUserProgress';
import { isItemUnlocked } from '@/src/util/atlasCompletion';
import { getCurrentStoryArea, getStoriesForArea } from '@/src/util/storyAreas';
import { useHeaderHeight } from 'expo-router/react-navigation';
import { useState } from 'react';
import { ImageBackground, ScrollView, StyleSheet, Text, View } from 'react-native';
import MaterialSymbol from '../../MaterialSymbol';
import Story from './Story';

const rueStVallierO = require('@/src/app/assets/images/stories/rue-st-vallier-o.jpg');

/**
 * Component story select view
 */
export default function StorySelectView() {
	const { areas, stories } = storyAtlas;
	const { experience, progressById, status } = useUserProgress();
	const headerHeight = useHeaderHeight();
	const [selectedAreaId, setSelectedAreaId] = useState<string>();
	const [isAreaModalVisible, setIsAreaModalVisible] = useState(false);
	const userLevel = experience.level;
	const currentArea = getCurrentStoryArea(areas, userLevel);
	const selectedArea =
		areas.find(area => area.id === selectedAreaId && userLevel >= area.minLevel) ?? currentArea;
	const headerContainerStyle = { paddingTop: headerHeight + 16 };
	const storyCards = getStoriesForArea(stories, selectedArea).map(story => ({
		story,
		isLocked: !isItemUnlocked({ id: story.id, progressById, userLevel }),
		progressPercent: progressById[story.id]?.completionPercentage ?? 0,
	}));
	const isAreaEmpty = userLevel >= selectedArea.minLevel && storyCards.length === 0;

	function handleSelectArea(area: StoryArea) {
		if (userLevel < area.minLevel) return;

		setSelectedAreaId(area.id);
		setIsAreaModalVisible(false);
	}

	/**
	 * Wait for the user's stored percentages
	 */
	if (status === 'loading') return <Loader />;
	if (status === 'error') return <Text>Could not load story progress.</Text>;

	/**
	 * Render the component
	 */
	return (
		<ImageBackground
			style={styles.background}
			source={rueStVallierO}
		>
			<View style={styles.shade}>
				<ScrollView
					contentContainerStyle={styles.scrollContentContainer}
					key={selectedArea.id}
					style={styles.scrollView}
				>
					<View style={[styles.header, headerContainerStyle]}>
						<MaterialSymbol
							name="auto_stories"
							size={32}
							style={styles.storyIcon}
							color={colors.light.goldenBorder}
						/>
						<StoryAreaSelector
							area={selectedArea}
							isExpanded={isAreaModalVisible}
							onPress={() => setIsAreaModalVisible(true)}
						/>
					</View>
					{storyCards.map(({ story, isLocked, progressPercent }) => (
						<Story
							story={story}
							isLocked={isLocked}
							key={story.id}
							progressById={progressById}
							progressPercent={progressPercent}
							userLevel={userLevel}
						/>
					))}
					{isAreaEmpty && (
						<View style={styles.emptyArea}>
							<Text style={styles.title}>No stories in this area yet.</Text>
							<Text style={styles.description}>Choose another area to keep exploring.</Text>
						</View>
					)}
				</ScrollView>
			</View>
			<StoryAreaModal
				areas={areas}
				onRequestClose={() => setIsAreaModalVisible(false)}
				onSelect={handleSelectArea}
				selectedAreaId={selectedArea.id}
				stories={stories}
				userLevel={userLevel}
				visible={isAreaModalVisible}
			/>
		</ImageBackground>
	);
}

/**
 * Styles
 */
const styles = StyleSheet.create({
	background: {
		flex: 1,
	},
	shade: {
		backgroundColor: 'rgba(0, 0, 0, 0.45)',
		flex: 1,
	},
	emptyArea: {
		gap: 8,
		padding: 24,
	},
	scrollContentContainer: {
		display: 'flex',
		flexGrow: 1,
		paddingBottom: 12,
		gap: 12,
	},
	header: {
		paddingVertical: 16,
		paddingHorizontal: 4,
		gap: 4,
	},
	scrollView: {
		flex: 1,
	},
	storyIcon: {
		textShadowColor: '#000000',
		textShadowRadius: 1,
		textShadowOffset: {
			width: 0,
			height: 0,
		},
	},
	title: {
		fontFamily: 'lexend-600',
		fontSize: 20,
		textAlign: 'center',
		color: colors.light.background,
		textShadowColor: '#000000',
		textShadowRadius: 50,
		textShadowOffset: {
			width: 0,
			height: 0,
		},
	},
	description: {
		textAlign: 'center',
		fontFamily: 'lexend-400',
		color: colors.light.goldenBorder,
		textShadowColor: '#000000',
		textShadowRadius: 20,
		textShadowOffset: {
			width: 0,
			height: 0,
		},
	},
});

import { chapterSelectBackground } from '@/data/french/storyAtlas';
import ChapterSelectRow from '@/src/components/ChapterSelectRow';
import CollectionGems from '@/src/components/CollectionGems';
import Loader from '@/src/components/Loader';
import LockedSection from '@/src/components/LockedSection';
import ReadingDescription from '@/src/components/ReadingDescription';
import { useUserProgress } from '@/src/db/useUserProgress';
import { findStoryById, getUnlockCriteria, isItemUnlocked } from '@/src/util/atlasCompletion';
import { useLocalSearchParams } from 'expo-router';
import { useHeaderHeight } from 'expo-router/react-navigation';
import { ImageBackground, ScrollView, StyleSheet, Text, View } from 'react-native';
import colors from '../../app/colors';
import MaterialSymbol from '../MaterialSymbol';

/**
 * ChapterSelectView component
 */
export default function ChapterSelectView() {
	/**
	 * Context, route params, and state
	 */
	const { experience, progressById, status } = useUserProgress();
	const userLevel = experience.level;
	const headerHeight = useHeaderHeight();
	const scrollContentStyle = { paddingTop: headerHeight + 16 };
	const scrollIndicatorInsets = { top: headerHeight };
	const { storyId } = useLocalSearchParams<{ storyId?: string }>();
	const selectedStory = findStoryById(storyId);

	/**
	 * Wait for the user's stored percentages
	 */
	if (status === 'loading') {
		return <Loader />;
	}
	if (status === 'error') {
		return <Text>Could not load chapter progress.</Text>;
	}

	/**
	 * In case we are routed here without state
	 */
	if (!selectedStory) {
		return (
			<View style={styles.background}>
				<View style={styles.header}>
					<Text style={styles.storyCategoryText}>Unknown story</Text>
					<Text style={styles.storyTitleText}>Please go back and select a story.</Text>
				</View>
			</View>
		);
	}

	/**
	 * Block locked stories
	 */
	const storyUnlockCriteria = getUnlockCriteria(selectedStory, progressById, userLevel);

	if (!isItemUnlocked({ id: selectedStory.id, progressById, userLevel })) {
		return (
			<View style={styles.background}>
				<View style={styles.header}>
					<Text style={styles.storyCategoryText}>Story locked</Text>
					<Text style={styles.storyTitleText}>Complete its requirements before continuing.</Text>
					<LockedSection
						itemId={selectedStory.id}
						color={colors.light.secondary}
						textColor={colors.light.secondary}
						unlockCriteria={storyUnlockCriteria}
					/>
				</View>
			</View>
		);
	}

	const { name, chapters, category, image, requiredLevel } = selectedStory;

	/**
	 * Show the chapters here and open their paragraphs on the chapter detail view
	 */
	return (
		<ImageBackground
			style={styles.background}
			source={image ?? chapterSelectBackground}
		>
			<ScrollView
				contentContainerStyle={[styles.scrollContentContainer, scrollContentStyle]}
				scrollIndicatorInsets={scrollIndicatorInsets}
				style={styles.scrollView}
			>
				<View style={styles.header}>
					<MaterialSymbol
						name="raven"
						size={32}
						color={colors.light.goldenBorder}
					/>
					<View style={styles.storyCategoryRow}>
						<Text style={styles.storyCategoryText}>
							{category} · Lvl. {requiredLevel}
						</Text>
						<CollectionGems
							title={name}
							progress={progressById[selectedStory.id]}
							size={16}
						/>
					</View>
					<Text style={styles.storyTitleText}>{name}</Text>
					<ReadingDescription
						item={selectedStory}
						color={colors.light.goldenBorder}
						style={styles.storyDescriptionText}
					/>
				</View>
				{chapters.map((chapter, index) => (
					<ChapterSelectRow
						key={chapter.id}
						chapter={chapter}
						story={selectedStory}
						index={index}
						progressById={progressById}
						userLevel={userLevel}
					/>
				))}
			</ScrollView>
		</ImageBackground>
	);
}

/**
 * Styles
 */
const styles = StyleSheet.create({
	storyCategoryRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 8,
	},
	background: {
		height: '100%',
		backgroundColor: colors.dark.background,
	},
	scrollContentContainer: {
		display: 'flex',
		flexGrow: 1,
		paddingHorizontal: 8,
		paddingVertical: 16,
		gap: 24,
	},
	header: {
		paddingBottom: 16,
		paddingHorizontal: 4,
		gap: 4,
	},
	scrollView: {
		backgroundColor: 'rgba(35, 35, 30, 0.25)',
	},
	storyCategoryText: {
		textAlign: 'center',
		textTransform: 'uppercase',
		fontFamily: 'lexend-600',
		fontSize: 12,
		color: colors.light.goldenBorder,
	},
	storyTitleText: {
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
	storyDescriptionText: {
		textAlign: 'center',
		fontFamily: 'lexend-400',
		color: colors.light.goldenBorder,
		textShadowColor: '#000000',
		textShadowRadius: 1,
		textShadowOffset: {
			width: 0,
			height: 0,
		},
	},
});

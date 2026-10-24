import { chapterSelectBackground, type DeckChapter } from '@/data/french/storyAtlas';
import ChapterDeckList from '@/src/components/ChapterDeckList';
import ChapterHeader from '@/src/components/ChapterHeader';
import Loader from '@/src/components/Loader';
import LockedSection from '@/src/components/LockedSection';
import CollectionGems from '@/src/components/CollectionGems';
import ReadingDescription from '@/src/components/ReadingDescription';
import { useUserProgress } from '@/src/db/useUserProgress';
import { findStoryById, getUnlockCriteria, isItemUnlocked } from '@/src/util/atlasCompletion';
import { useLocalSearchParams, type UnknownOutputParams } from 'expo-router';
import { useHeaderHeight } from 'expo-router/react-navigation';
import { useEffect, useRef } from 'react';
import {
	ImageBackground,
	ScrollView,
	type ScrollViewInstance,
	StyleSheet,
	Text,
	View,
} from 'react-native';
import colors from '../../app/colors';
import MaterialSymbol from '../MaterialSymbol';

const postmarkBackgroundImage = require('@/src/app/assets/images/postcard-parts/background.jpg');
const postmarkBackgroundBorderedImage = require('@/src/app/assets/images/postcard-parts/background-bordered.jpg');

interface ChapterSelectParams extends UnknownOutputParams {
	storyId?: string;
	chapterId?: string;
	deckPickerRequest?: string;
}

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
	const {
		storyId,
		chapterId: requestedChapterId,
		deckPickerRequest: chapterReturnRequest,
	} = useLocalSearchParams<ChapterSelectParams>();
	const scrollViewRef = useRef<ScrollViewInstance>(null);
	const chapterPositions = useRef<Record<string, number>>({});
	const selectedStory = findStoryById(storyId);

	/**
	 * Return to the completed deck's chapter when leaving results
	 */
	useEffect(() => {
		const chapterY = chapterPositions.current[requestedChapterId ?? ''];

		if (chapterY !== undefined) {
			scrollViewRef.current?.scrollTo({ y: Math.max(0, chapterY - headerHeight), animated: false });
		}
	}, [requestedChapterId, chapterReturnRequest, headerHeight]);

	function handleChapterLayout(chapterId: string, chapterY: number) {
		chapterPositions.current[chapterId] = chapterY;

		if (chapterId === requestedChapterId) {
			scrollViewRef.current?.scrollTo({ y: Math.max(0, chapterY - headerHeight), animated: false });
		}
	}

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
	const categoryColor = colors.category[category];

	/**
	 * Render the story and its chapter deck lists
	 */
	return (
		<ImageBackground
			style={styles.background}
			source={image ?? chapterSelectBackground}
		>
			<ScrollView
				ref={scrollViewRef}
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
				{
					/**
					 * Map the story's chapters
					 */
					chapters.map((chapter: DeckChapter, index: number) => {
						const isEven = index % 2 === 0;
						let rotate = '3deg';

						if (isEven) {
							rotate = '-4deg';
						}

						const chapterId = chapter.id;
						const isLocked = !isItemUnlocked({
							id: chapterId,
							progressById,
							userLevel,
						});
						const unlockCriteria = getUnlockCriteria(chapter, progressById, userLevel);
						const hasDecks = chapter.decks.length > 0;

						/**
						 * Render the chapter view/card
						 */
						return (
							<View
								key={chapterId}
								onLayout={({ nativeEvent }) => handleChapterLayout(chapterId, nativeEvent.layout.y)}
								style={styles.chapterPostcardStack}
							>
								<ImageBackground
									source={postmarkBackgroundBorderedImage}
									resizeMode="stretch"
									style={[
										styles.chapterPostcard,
										{
											transform: [{ rotate }],
											padding: 0,
											position: 'absolute',
											top: 0,
											left: 0,
											height: '100%',
											width: '100%',
										},
									]}
								/>
								<ImageBackground
									source={postmarkBackgroundImage}
									style={styles.chapterPostcard}
								>
									<View style={styles.chapterPostcardBorder}>
										{(isLocked || !hasDecks) && (
											<ChapterHeader
												chapter={chapter}
												color={categoryColor}
											/>
										)}
										{isLocked && (
											<View style={styles.lockedInner}>
												<LockedSection
													itemId={chapter.id}
													color={categoryColor}
													unlockCriteria={unlockCriteria}
												/>
											</View>
										)}
										{!isLocked && hasDecks && (
											<ChapterDeckList
												chapter={chapter}
												progressById={progressById}
												story={selectedStory}
											/>
										)}
										{!isLocked && !hasDecks && (
											<Text style={styles.comingSoonText}>Coming soon</Text>
										)}
									</View>
								</ImageBackground>
							</View>
						);
					})
				}
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
	lockedInner: {
		paddingVertical: 16,
		marginBottom: 24,
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
	chapterPostcardStack: {
		display: 'flex',
		margin: 8,
		position: 'relative',
	},
	chapterPostcard: {
		padding: 6,
		backgroundColor: colors.dark.background,
		borderWidth: 2,
		borderColor: colors.light.border,
		borderRadius: 12,
		overflow: 'hidden',
	},
	chapterPostcardBorder: {
		borderWidth: 1,
		borderRadius: 8,
		borderColor: colors.light.goldenBorder,
		gap: 2,
	},
	comingSoonText: {
		color: colors.dark.text,
		fontFamily: 'lexend-400',
		fontSize: 14,
		paddingVertical: 16,
	},
});

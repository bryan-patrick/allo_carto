import { chapterSelectBackground, type DeckChapter } from '@/data/french/storyAtlas';
import DeckPickerModal from '@/src/components/DeckPickerModal';
import Loader from '@/src/components/Loader';
import LockedSection from '@/src/components/LockedSection';
import ViewIndicator from '@/src/components/ViewIndicator';
import { useUserProgress } from '@/src/db/useUserProgress';
import { findStoryById, getUnlockCriteria, isItemUnlocked } from '@/src/util/atlasCompletion';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Image, ImageBackground, ScrollView, StyleSheet, Text, View } from 'react-native';
import colors from '../../app/colors';
import LinkButton from '../LinkButton';
import MaterialSymbol from '../MaterialSymbol';

const postmarkImage = require('@/src/app/assets/images/postcard-parts/quebec-postmark.png');
const postmarkBackgroundImage = require('@/src/app/assets/images/postcard-parts/background.jpg');

/**
 * ChapterSelectView component
 */
export default function ChapterSelectView() {
	/**
	 * Context, route params, and state
	 */
	const { progressById, status } = useUserProgress();
	const {
		storyId,
		chapterId: requestedChapterId,
		deckPickerRequest,
	} = useLocalSearchParams<{
		storyId?: string;
		chapterId?: string;
		deckPickerRequest?: string;
	}>();
	const [selectedChapterId, setSelectedChapterId] = useState<string>();
	const [dismissedDeckPickerRequest, setDismissedDeckPickerRequest] = useState<string>();

	/**
	 * Selected story and deck picker state
	 */
	const selectedStory = findStoryById(storyId);
	const returnedChapterId =
		deckPickerRequest && deckPickerRequest !== dismissedDeckPickerRequest ?
			requestedChapterId
		:	undefined;
	const openChapterId = selectedChapterId ?? returnedChapterId;
	const selectedChapter = selectedStory?.chapters.find(chapter => chapter.id === openChapterId);

	/**
	 * Close the deck picker and consume a results return request
	 */
	function handleCloseDeckPicker() {
		setSelectedChapterId(undefined);
		setDismissedDeckPickerRequest(deckPickerRequest);
	}

	/**
	 * Wait for the user's stored percentages
	 */
	if (status === 'loading') return <Loader />;
	if (status === 'error') return <Text>Could not load chapter progress.</Text>;

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
	if (!isItemUnlocked({ id: selectedStory.id, progressById })) {
		return (
			<View style={styles.background}>
				<View style={styles.header}>
					<Text style={styles.storyCategoryText}>Story locked</Text>
					<Text style={styles.storyTitleText}>Complete its requirements before continuing.</Text>
				</View>
			</View>
		);
	}

	const { name, chapters, category, image } = selectedStory;
	const categoryColor = colors.category[category];

	/**
	 * Render the card grid
	 */
	return (
		<ImageBackground
			style={styles.background}
			source={image ?? chapterSelectBackground}
		>
			{/* Keep the category tint subtle beneath the neutral readability overlay. */}
			<View
				pointerEvents="none"
				style={[styles.categoryTint, { backgroundColor: categoryColor }]}
			/>
			<ScrollView
				contentContainerStyle={styles.scrollContentContainer}
				style={styles.scrollView}
			>
				<ViewIndicator
					views={['Story', 'Chapter', 'Deck']}
					currentViewIndex={1}
				/>
				<View style={styles.header}>
					<MaterialSymbol
						name="raven"
						size={32}
						color={colors.light.goldenBorder}
					/>
					<Text style={styles.storyTitleText}>Select a Chapter</Text>
					<Text style={styles.storyDescriptionText}>
						Continue {name}, a {category} story.
					</Text>
				</View>
				{
					/**
					 * Map the story's chapters
					 */
					chapters.map((chapter: DeckChapter, index: number) => {
						const isEven = index % 2 === 0;
						const rotate = isEven ? '-3deg' : '3deg';
						const { id: chapterId, image, label, name } = chapter;
						const progressPercent = Math.floor(progressById[chapterId]?.completionPercentage ?? 0);
						const isLocked = !isItemUnlocked({
							id: chapterId,
							progressById,
						});
						const unlockCriteria = getUnlockCriteria(chapter, progressById);
						const selectText = progressPercent > 0 ? 'Continue chapter' : 'Start chapter';

						/**
						 * Render the chapter view/card
						 */
						return (
							<View
								key={chapterId}
								style={styles.chapterPostcardStack}
							>
								<ImageBackground
									source={postmarkBackgroundImage}
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
										<View style={styles.chapterPostcardHeader}>
											<View style={styles.chapterHeadingContainer}>
												<Text style={[styles.chapterLabelText, { color: categoryColor }]}>
													{label}
												</Text>
												<Text style={styles.chapterTitleText}>{name}</Text>
											</View>
											<ImageBackground
												source={postmarkImage}
												style={styles.chapterPostmarkImage}
											/>
										</View>
										{isLocked && (
											<View style={styles.lockedInner}>
												<LockedSection
													color={categoryColor}
													unlockCriteria={unlockCriteria}
												/>
											</View>
										)}
										{!isLocked && (
											<>
												<Image
													source={image}
													style={styles.chapterImage}
												/>
												<View style={styles.chapterProgressContainer}>
													<Text style={styles.chapterProgressText}>
														Words known: {progressPercent}%
													</Text>
													<View style={styles.chapterProgressBarTrack}>
														<View
															style={[
																styles.chapterProgressBar,
																{
																	width: `${progressPercent}%`,
																	backgroundColor: categoryColor,
																	zIndex: 1,
																},
															]}
														/>
														<View
															style={[
																styles.chapterProgressBar,
																{
																	position: 'absolute',
																	width: '100%',
																},
															]}
														/>
													</View>
												</View>
												<LinkButton
													color={categoryColor}
													hitSlop={5}
													handler={() => setSelectedChapterId(chapterId)}
													style={styles.chapterSelectButton}
												>
													<Text style={styles.chapterSelectButtonText}>{selectText}</Text>
												</LinkButton>
											</>
										)}
									</View>
								</ImageBackground>
							</View>
						);
					})
				}
			</ScrollView>
			{/**
			 * Show the selected chapter's decks without leaving the chapter view
			 */}
			{selectedChapter && (
				<DeckPickerModal
					chapter={selectedChapter}
					onRequestClose={handleCloseDeckPicker}
					progressById={progressById}
					story={selectedStory}
					visible={Boolean(selectedChapter)}
				/>
			)}
		</ImageBackground>
	);
}

/**
 * Styles
 */
const styles = StyleSheet.create({
	background: {
		height: '100%',
		backgroundColor: colors.dark.background,
	},
	categoryTint: {
		...StyleSheet.absoluteFill,
		opacity: 0.1,
	},
	scrollContentContainer: {
		display: 'flex',
		flexGrow: 1,
		paddingHorizontal: 8,
		paddingVertical: 16,
		gap: 16,
	},
	header: {
		paddingVertical: 16,
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
		color: colors.light.text,
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
		borderWidth: 1,
		borderColor: colors.light.border,
		borderRadius: 12,
		overflow: 'hidden',
	},
	chapterPostcardBorder: {
		borderWidth: 1,
		borderRadius: 8,
		borderColor: colors.light.goldenBorder,
		paddingVertical: 2,
		paddingHorizontal: 8,
		gap: 2,
	},
	chapterPostcardHeader: {
		display: 'flex',
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		flexWrap: 'wrap',
		gap: 4,
	},
	chapterHeadingContainer: {
		flex: 1.2,
		gap: 2,
	},
	chapterLabelText: {
		fontFamily: 'lexend-700',
		fontSize: 12,
		textTransform: 'uppercase',
	},
	chapterTitleText: {
		color: colors.dark.text,
		fontFamily: 'lexend-600',
		fontSize: 16,
	},
	chapterPostmarkImage: {
		flex: 1,
		aspectRatio: '12 / 5',
		opacity: 0.6,
	},
	chapterImage: {
		aspectRatio: '5 / 2',
		width: '100%',
		height: 'auto',
	},
	chapterProgressContainer: {
		gap: 4,
	},
	chapterProgressText: {
		fontSize: 12,
		fontFamily: 'lexend-400',
	},
	chapterProgressBarTrack: {
		overflow: 'hidden',
		borderWidth: 1,
		borderColor: colors.light.border,
		borderRadius: 8,
		marginBottom: 8,
	},
	chapterProgressBar: {
		width: '10%',
		height: 8,
		borderColor: colors.light.border,
	},
	chapterSelectButton: {
		marginBottom: 4,
	},
	chapterSelectButtonText: {
		fontSize: 14,
	},
});

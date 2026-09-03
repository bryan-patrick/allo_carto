import type { DeckChapter } from '@/data/french/storyAtlas';
import Loader from '@/src/components/Loader';
import { useUserProgress } from '@/src/db/useUserProgress';
import { findStoryById, isItemUnlocked } from '@/src/util/atlasCompletion';
import { useLocalSearchParams } from 'expo-router';
import { Image, ImageBackground, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '../../app/colors';
import LinkButton from '../LinkButton';
import MaterialSymbol from '../MaterialSymbol';

const postmarkImage = require('@/src/app/assets/images/postcard-parts/quebec-postmark.png');
const postmarkBackgroundImage = require('@/src/app/assets/images/postcard-parts/background.jpg');
const chaptersBackgroundImage = require('@/src/app/assets/images/chapters/chapters-bg.jpg');

/**
 * ChapterSelectView component
 */
export default function ChapterSelectView() {
	const { progressById, status } = useUserProgress();
	const { storyId } = useLocalSearchParams<{ storyId?: string }>();
	const paddingTop = useSafeAreaInsets().top;
	const selectedStory = findStoryById(storyId);

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
			<View style={styles.screenBackground}>
				<View style={styles.storyHeader}>
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
			<View style={styles.screenBackground}>
				<View style={styles.storyHeader}>
					<Text style={styles.storyCategoryText}>Story locked</Text>
					<Text style={styles.storyTitleText}>Complete its requirements before continuing.</Text>
				</View>
			</View>
		);
	}

	const { name, description, chapters, category } = selectedStory;

	/**
	 * Render the card grid
	 */
	return (
		<ImageBackground
			style={styles.screenBackground}
			source={chaptersBackgroundImage}
		>
			<ScrollView
				contentContainerStyle={styles.scrollContentContainer}
				style={styles.scrollView}
			>
				<View style={[styles.storyHeader, { paddingTop }]}>
					<MaterialSymbol
						name="raven"
						size={32}
						color={colors.light.goldenBorder}
					/>
					<Text style={styles.storyTitleText}>Select a Chapter</Text>
					<Text style={styles.storyDescriptionText}>{description}</Text>
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
												<Text style={styles.chapterLabelText}>{label}</Text>
												<Text style={styles.chapterTitleText}>{name}</Text>
											</View>
											<ImageBackground
												source={postmarkImage}
												style={styles.chapterPostmarkImage}
											/>
										</View>
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
															backgroundColor: colors.dark.primary,
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
											hitSlop={5}
											arrowSize={18}
											contentPaddingVertical={8}
											disabled={isLocked}
											style={styles.chapterSelectButton}
											screen={'(routes)/CardDeckSelect'}
											params={{ chapterId }}
										>
											<Text style={styles.chapterSelectButtonText}>View decks</Text>
										</LinkButton>
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
	screenBackground: {
		height: '100%',
	},
	storyHeader: {
		marginTop: 32,
		gap: 4,
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
		textShadowRadius: 20,
		textShadowOffset: {
			width: 0,
			height: 0,
		},
	},
	scrollContentContainer: {
		display: 'flex',
		padding: 8,
		gap: 16,
	},
	scrollView: {
		backgroundColor: 'rgba(25, 25, 23, 0.4)',
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
		color: colors.dark.primary,
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

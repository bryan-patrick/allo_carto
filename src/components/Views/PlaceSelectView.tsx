import { DeckPlace } from '@/data/french/deckAtlas';
import sharedStyles from '@/src/app/sharedStyles';
import Loader from '@/src/components/Loader';
import { useUserProgress } from '@/src/db/useUserProgress';
import { findChapterById, isItemUnlocked } from '@/src/util/atlasCompletion';
import { useLocalSearchParams } from 'expo-router';
import { Image, ImageBackground, ScrollView, StyleSheet, Text, View } from 'react-native';
import colors from '../../app/colors';
import LinkButton from '../LinkButton';

const postmarkImage = require('@/src/app/assets/images/postcard-parts/quebec-postmark.png');
const postmarkBackgroundImage = require('@/src/app/assets/images/postcard-parts/background.jpg');

/**
 * PlaceSelectView component
 */
export default function PlaceSelectView() {
	const { progressById, status } = useUserProgress();

	const { id } = useLocalSearchParams<{ id?: string }>();
	const selectedChapter = findChapterById(id);

	/**
	 * Wait for the user's stored percentages
	 */
	if (status === 'loading') return <Loader />;
	if (status === 'error') return <Text>Could not load place progress.</Text>;

	/**
	 * In case we are routed here without state
	 */
	if (!selectedChapter) {
		return (
			<View style={styles.view}>
				<View style={styles.chapterTitleContainer}>
					<Text style={styles.chapterIndex}>Unknown chapter</Text>
					<Text style={styles.chapterTitle}>Please go back and select a chapter.</Text>
				</View>
			</View>
		);
	}

	/**
	 * Block locked chapters
	 */
	if (!isItemUnlocked({ id: selectedChapter.id, progressById })) {
		return (
			<View style={styles.view}>
				<View style={styles.chapterTitleContainer}>
					<Text style={styles.chapterIndex}>Chapter locked</Text>
					<Text style={styles.chapterTitle}>Complete its requirements before continuing.</Text>
				</View>
			</View>
		);
	}

	const { name, places, label } = selectedChapter;

	/**
	 * Render the card grid
	 */
	return (
		<View style={styles.view}>
			<View style={styles.chapterTitleContainer}>
				<Text style={styles.chapterIndex}>{label}</Text>
				<Text style={styles.chapterTitle}>{name}</Text>
			</View>
			<ScrollView contentContainerStyle={styles.chapterContainer}>
				{
					/**
					 * Map the chapter's places
					 */
					places.map((place: DeckPlace, index: number) => {
						const isEven = index % 2 === 0;
						const rotate = isEven ? '-3deg' : '3deg';
						const { id: placeId, name, description, image } = place;
						const progressPercent = Math.floor(progressById[placeId]?.completionPercentage ?? 0);
						const isLocked = !isItemUnlocked({
							id: placeId,
							progressById,
						});

						/**
						 * Render the place view/card
						 */
						return (
							<View
								key={placeId}
								style={styles.postcardStack}
							>
								<ImageBackground
									source={postmarkBackgroundImage}
									style={[
										styles.placeContainer,
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
									style={styles.placeContainer}
								>
									<View style={styles.postcardBorder}>
										<View style={styles.titleContainer}>
											<Text style={styles.placeTitleText}>{name}</Text>
											<ImageBackground
												source={postmarkImage}
												style={styles.postmarkImage}
											/>
										</View>
										<Image
											source={image}
											style={styles.placeImage}
										/>
										<Text style={styles.placeDescriptionText}>{description}</Text>
										<View style={styles.progressContainer}>
											<Text style={styles.progressText}>Words known: {progressPercent}%</Text>
											<View style={styles.progressBarsContainer}>
												<View
													style={[
														styles.progressBar,
														{
															width: `${progressPercent}%`,
															backgroundColor: colors.dark.primary,
														},
													]}
												/>
												<View
													style={[
														styles.progressBar,
														{
															position: 'absolute',
															width: '100%',
															opacity: 0.15,
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
											style={styles.placeSelectButton}
											screen={'(routes)/CardDeckSelect'}
											params={{ placeId }}
										>
											<Text style={styles.placeSelectButtonText}>View decks</Text>
										</LinkButton>
									</View>
								</ImageBackground>
							</View>
						);
					})
				}
			</ScrollView>
		</View>
	);
}

/**
 * Styles
 */
const styles = StyleSheet.create({
	view: {
		flex: 1,
	},
	chapterTitleContainer: {
		paddingHorizontal: sharedStyles.containerMargin,
		paddingVertical: 16,
	},
	chapterIndex: {
		textAlign: 'center',
		textTransform: 'uppercase',
		color: colors.light.text,
	},
	chapterTitle: {
		textAlign: 'center',
		width: '100%',
		fontFamily: 'lexend-600',
		fontSize: 20,
		color: colors.light.text,
	},
	chapterContainer: {
		display: 'flex',
		margin: 8,
		gap: 8,
	},
	postcardStack: {
		display: 'flex',
		margin: 8,
		position: 'relative',
	},
	placeContainer: {
		padding: 8,
		backgroundColor: colors.dark.background,
		borderWidth: 1,
		borderRadius: 16,
		borderColor: colors.dark.border,
		overflow: 'hidden',
	},
	postcardBorder: {
		borderWidth: 1,
		borderRadius: 12,
		borderColor: colors.light.goldenBorder,
		paddingVertical: 2,
		paddingHorizontal: 16,
		gap: 2,
	},
	titleContainer: {
		width: '100%',
		display: 'flex',
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignContent: 'center',
		alignItems: 'center',
		gap: 16,
		flexWrap: 'wrap',
	},
	placeTitleText: {
		color: colors.dark.text,
		fontFamily: 'lexend-600',
		fontSize: 18,
		flex: 1.2,
	},
	postmarkImage: {
		flex: 1,
		aspectRatio: '12 / 5',
		opacity: 0.6,
	},
	placeImage: {
		aspectRatio: '5 / 2',
		width: '100%',
		height: 'auto',
	},
	placeDescriptionText: {
		fontSize: 14,
	},
	progressContainer: {
		marginTop: 4,
	},
	progressText: {
		fontSize: 12,
	},
	progressBarsContainer: {
		overflow: 'hidden',
		borderWidth: 1,
		borderColor: colors.light.border,
		borderRadius: 8,
		marginBottom: 16,
	},
	progressBar: {
		width: '10%',
		height: 8,
		borderColor: colors.light.border,
	},
	placeSelectButton: {
		marginBottom: 4,
	},
	placeSelectButtonText: {
		fontSize: 14,
	},
});

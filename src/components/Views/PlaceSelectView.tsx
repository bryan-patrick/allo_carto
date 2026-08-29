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

	/**
	 * DestructureStyles
	 */
	const {
		viewStyle,
		chapterTitleContainerStyle,
		chapterIndexStyle,
		chapterTitleStyle,
		chapterContainerStyle,
		placeContainerStyle,
		placeTitleTextStyle,
		titleContainer,
		postMarkImageStyle,
		placeImageStyle,
		placeDescriptionTextStyle,
		progressTextStyle,
		progressBarsContainer,
		progressBarStyle,
		placeSelectButtonStyle,
		placeSelectButtonTextStyle,
		postcardStack,
		postCardBorder,
		progressContainer,
	} = styles;

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
			<View style={viewStyle}>
				<View style={chapterTitleContainerStyle}>
					<Text style={chapterIndexStyle}>Unknown chapter</Text>
					<Text style={chapterTitleStyle}>Please go back and select a chapter.</Text>
				</View>
			</View>
		);
	}

	/**
	 * Block locked chapters
	 */
	if (!isItemUnlocked({ id: selectedChapter.id, progressById })) {
		return (
			<View style={viewStyle}>
				<View style={chapterTitleContainerStyle}>
					<Text style={chapterIndexStyle}>Chapter locked</Text>
					<Text style={chapterTitleStyle}>Complete its requirements before continuing.</Text>
				</View>
			</View>
		);
	}

	const { name, places, label } = selectedChapter;

	/**
	 * Render the card grid
	 */
	return (
		<View style={viewStyle}>
			<View style={chapterTitleContainerStyle}>
				<Text style={chapterIndexStyle}>{label}</Text>
				<Text style={chapterTitleStyle}>{name}</Text>
			</View>
			<ScrollView contentContainerStyle={chapterContainerStyle}>
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
								style={postcardStack}
							>
								<ImageBackground
									source={postmarkBackgroundImage}
									style={[
										placeContainerStyle,
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
									style={placeContainerStyle}
								>
									<View style={postCardBorder}>
										<View style={titleContainer}>
											<Text style={placeTitleTextStyle}>{name}</Text>
											<ImageBackground
												source={postmarkImage}
												style={postMarkImageStyle}
											/>
										</View>
										<Image
											source={image}
											style={placeImageStyle}
										/>
										<Text style={placeDescriptionTextStyle}>{description}</Text>
										<View style={progressContainer}>
											<Text style={progressTextStyle}>Words known: {progressPercent}%</Text>
											<View style={progressBarsContainer}>
												<View
													style={[
														progressBarStyle,
														{
															width: `${progressPercent}%`,
															backgroundColor: colors.dark.primary,
														},
													]}
												/>
												<View
													style={[
														progressBarStyle,
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
											style={placeSelectButtonStyle}
											screen={'(routes)/CardDeckSelect'}
											params={{ placeId }}
										>
											<Text style={placeSelectButtonTextStyle}>View decks</Text>
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
 * Shared styles
 */
const { containerMargin } = sharedStyles;

/**
 * Styles
 * TODO: styles
 */
const styles = StyleSheet.create({
	viewStyle: {
		flex: 1,
	},
	chapterTitleContainerStyle: {
		paddingHorizontal: containerMargin,
		paddingVertical: 16,
	},
	chapterIndexStyle: {
		textAlign: 'center',
		textTransform: 'uppercase',
		color: colors.light.text,
	},
	chapterTitleStyle: {
		textAlign: 'center',
		width: '100%',
		fontFamily: 'lexend-600',
		fontSize: 20,
		color: colors.light.text,
	},
	chapterContainerStyle: {
		display: 'flex',
		margin: 8,
		gap: 8,
	},
	placeContainerStyle: {
		padding: 8,
		backgroundColor: colors.dark.background,
		borderWidth: 1,
		borderRadius: 16,
		borderColor: colors.dark.border,
		overflow: 'hidden',
	},
	postCardBorder: {
		borderWidth: 1,
		borderRadius: 12,
		borderColor: colors.light.goldenBorder,
		paddingVertical: 2,
		paddingHorizontal: 16,
		gap: 2,
	},
	progressContainer: {
		marginTop: 4,
	},
	placeTitleTextStyle: {
		color: colors.dark.text,
		fontFamily: 'lexend-600',
		fontSize: 18,
		flex: 1.2,
	},
	postMarkImageStyle: {
		flex: 1,
		aspectRatio: '12 / 5',
		opacity: 0.6,
	},
	postcardStack: {
		display: 'flex',
		margin: 8,
		position: 'relative',
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
	placeImageStyle: {
		aspectRatio: '5 / 2',
		width: '100%',
		height: 'auto',
	},
	placeDescriptionTextStyle: {
		fontSize: 14,
	},
	progressTextStyle: {
		fontSize: 12,
	},
	progressBarsContainer: {
		overflow: 'hidden',
		borderWidth: 1,
		borderColor: colors.light.border,
		borderRadius: 8,
		marginBottom: 16,
	},
	progressBarStyle: {
		width: '10%',
		height: 8,
		borderColor: colors.light.border,
	},
	placeSelectButtonStyle: {
		marginBottom: 4,
	},
	placeSelectButtonTextStyle: {
		fontSize: 14,
	},
});

import colors from '@/src/app/colors';
import CollectionClaim from '@/src/components/Collections/CollectionClaim';
import VocabularyStamp from '@/src/components/Collections/VocabularyStamp';
import LinkButton from '@/src/components/LinkButton';
import Loader from '@/src/components/Loader';
import MaterialSymbol from '@/src/components/MaterialSymbol';
import WordProgressBar from '@/src/components/WordProgressBar';
import { useUserProgress } from '@/src/db/useUserProgress';
import { wordProgressDefinitions } from '@/src/util/wordProgress';
import { ImageBackground } from 'expo-image';
import { useLocalSearchParams } from 'expo-router';
import { useHeaderHeight } from 'expo-router/react-navigation';
import { useState } from 'react';
import {
	Alert,
	Animated,
	Pressable,
	StyleSheet,
	Text,
	View,
	useWindowDimensions,
	type ViewStyle,
} from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';

interface CollectionDetailParams extends Record<string, string | string[] | undefined> {
	collectionId?: string;
}

const albumPaper = require('@/src/app/assets/images/postcard-parts/background.jpg');
const collectionsPageBackground = require('@/src/app/assets/images/collections/page-background.jpg');

/**
 * Shows a discovered collection's stamp album so the player can track words and claim rewards.
 */
export default function CollectionDetailView() {
	/**
	 * Saved collection, screen size, and motion preference
	 */
	const { collectionId } = useLocalSearchParams<CollectionDetailParams>();
	const { collections, status, reloadProgress } = useUserProgress();
	const headerHeight = useHeaderHeight();
	const { width, fontScale } = useWindowDimensions();
	const isReducedMotionEnabled = useReducedMotion();

	/**
	 * Scroll position and page sizes
	 */
	const [scrollOffset] = useState(() => new Animated.Value(0));
	const [viewportHeight, setViewportHeight] = useState(0);
	const [scrollContentHeight, setScrollContentHeight] = useState(0);
	const maximumScrollDistance = Math.max(scrollContentHeight - viewportHeight, 1);
	const backgroundScrollDistance = Math.min(maximumScrollDistance, viewportHeight);
	const handleScroll = Animated.event(
		[
			{
				nativeEvent: {
					contentOffset: {
						y: scrollOffset,
					},
				},
			},
		],
		{
			useNativeDriver: true,
		},
	);

	/**
	 * Album display values
	 */
	const progress = collections.find(entry => entry.collection.id === collectionId);
	const useTwoColumns = width < 360 || fontScale > 1.2;
	const stampSlotStyle: ViewStyle = {
		width: useTwoColumns ? '48%' : '31%',
	};
	const scrollContentStyle = {
		paddingTop: headerHeight + 16,
	};
	const scrollIndicatorInsets = {
		top: headerHeight,
	};
	const learningLevel =
		wordProgressDefinitions.find(definition => definition.level === progress?.level) ??
		wordProgressDefinitions[0];
	let notice = 'This collection could not be found. Please go back and choose an album.';
	let backgroundTravel = 0;

	if (!isReducedMotionEnabled && scrollContentHeight > viewportHeight) {
		backgroundTravel = backgroundScrollDistance * 0.2;
	}

	/**
	 * The extra image height keeps the background covered while it moves.
	 */
	const backgroundImageStyle = {
		height: viewportHeight + backgroundTravel,
		transform: [
			{
				translateY: scrollOffset.interpolate({
					inputRange: [0, maximumScrollDistance],
					outputRange: [0, -backgroundTravel],
					extrapolate: 'clamp',
				}),
			},
		],
	};

	/**
	 * Explains how learning every word raises the collection level.
	 */
	function explainCollectionLevels() {
		Alert.alert(
			'Collection learning levels',
			'Your collection level is the lowest learning level of all its words. Reach each level on every word to claim its XP reward.',
		);
	}

	if (status === 'loading') {
		return <Loader />;
	}

	if (status === 'error') {
		return (
			<View style={styles.notice}>
				<Text style={styles.noticeText}>Could not load your album. Please try again.</Text>
				<LinkButton handler={reloadProgress}>Try again</LinkButton>
			</View>
		);
	}

	if (!progress || !progress.isDiscovered) {
		if (progress) {
			notice = 'Answer one of this collection’s words correctly in flashcards to reveal its album.';
		}

		return (
			<View style={styles.notice}>
				<MaterialSymbol
					name="lock"
					size={32}
					color={colors.light.goldenBorder}
				/>
				<Text style={styles.noticeText}>{notice}</Text>
			</View>
		);
	}

	return (
		<View
			onLayout={event => setViewportHeight(event.nativeEvent.layout.height)}
			style={styles.background}
		>
			<Animated.Image
				accessible={false}
				pointerEvents="none"
				source={collectionsPageBackground}
				resizeMode="cover"
				style={[styles.backgroundImage, backgroundImageStyle]}
			/>
			<Animated.ScrollView
				bounces={false}
				overScrollMode="never"
				onScroll={handleScroll}
				scrollEventThrottle={16}
				onContentSizeChange={(_contentWidth, contentHeight) =>
					setScrollContentHeight(contentHeight)
				}
				contentContainerStyle={[styles.scrollContent, scrollContentStyle]}
				scrollIndicatorInsets={scrollIndicatorInsets}
			>
				<ImageBackground
					source={albumPaper}
					contentFit="cover"
					contentPosition={{
						left: '66%',
					}}
					style={styles.album}
				>
					<View style={styles.heading}>
						<View style={styles.titleRow}>
							<Text
								accessibilityRole="header"
								style={styles.title}
							>
								{progress.collection.name}
							</Text>
							<Pressable
								accessibilityRole="button"
								accessibilityLabel={`Explain collection learning levels. Current stage: ${learningLevel.name}.`}
								onPress={explainCollectionLevels}
								style={styles.infoButton}
							>
								<MaterialSymbol
									name="info"
									size={18}
									color={colors.wordProgress.unseen}
								/>
							</Pressable>
						</View>
						<Text style={styles.description}>{progress.collection.description}</Text>
					</View>
					<WordProgressBar
						progress={learningLevel.key}
						labelFormat="words"
						accessibilityLabel="Collection learning level"
					/>
					<CollectionClaim
						key={progress.collection.id}
						progress={progress}
					/>
					<View style={styles.stampGrid}>
						{progress.stamps.map(stamp => (
							<View
								key={stamp.wordId}
								style={stampSlotStyle}
							>
								<VocabularyStamp stamp={stamp} />
							</View>
						))}
					</View>
				</ImageBackground>
			</Animated.ScrollView>
		</View>
	);
}

const styles = StyleSheet.create({
	background: {
		flex: 1,
		backgroundColor: colors.light.secondary,
		overflow: 'hidden',
	},
	backgroundImage: {
		position: 'absolute',
		top: 0,
		left: 0,
		width: '100%',
	},
	scrollContent: {
		flexGrow: 1,
		paddingHorizontal: 12,
		paddingBottom: 24,
	},
	album: {
		padding: 16,
		gap: 12,
		borderWidth: 1,
		borderColor: colors.light.goldenBorder,
		borderRadius: 12,
		backgroundColor: colors.light.background,
		overflow: 'hidden',
	},
	heading: {},
	title: {
		flexShrink: 1,
		fontFamily: 'lexend-600',
		fontSize: 22,
		color: colors.dark.text,
	},
	description: {
		fontFamily: 'lexend-400',
		fontSize: 12,
		lineHeight: 16,
		color: colors.wordProgress.unseen,
	},
	titleRow: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		alignItems: 'center',
	},
	infoButton: {
		alignItems: 'center',
		justifyContent: 'center',
		minWidth: 44,
		minHeight: 44,
	},
	stampGrid: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		justifyContent: 'space-between',
		rowGap: 8,
		marginVertical: 4,
	},
	notice: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		padding: 24,
		gap: 16,
		backgroundColor: colors.dark.background,
	},
	noticeText: {
		fontFamily: 'lexend-400',
		fontSize: 14,
		lineHeight: 22,
		color: colors.light.background,
		textAlign: 'center',
	},
});

import { chapterSelectBackground } from '@/data/french/storyAtlas';
import colors from '@/src/app/colors';
import CollectionMeter from '@/src/components/Collections/CollectionMeter';
import CollectionRewards from '@/src/components/Collections/CollectionRewards';
import VocabularyStamp from '@/src/components/Collections/VocabularyStamp';
import LinkButton from '@/src/components/LinkButton';
import Loader from '@/src/components/Loader';
import MaterialSymbol from '@/src/components/MaterialSymbol';
import { useUserProgress } from '@/src/db/useUserProgress';
import { useLocalSearchParams } from 'expo-router';
import { useHeaderHeight } from 'expo-router/react-navigation';
import {
	Alert,
	ImageBackground,
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	View,
	useWindowDimensions,
	type ViewStyle,
} from 'react-native';

interface CollectionDetailParams extends Record<string, string | string[] | undefined> {
	collectionId?: string;
}

const albumPaper = require('@/src/app/assets/images/postcard-parts/background.jpg');

/**
 * Shows a discovered collection's stamp album so the player can track words and claim rewards.
 */
export default function CollectionDetailView() {
	const { collectionId } = useLocalSearchParams<CollectionDetailParams>();
	const { collections, status, reloadProgress } = useUserProgress();
	const headerHeight = useHeaderHeight();
	const { width, fontScale } = useWindowDimensions();
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
	const levelLabel =
		progress?.level ? `Collection Lvl. ${progress.level}` : 'Collection level: Unseen';
	let notice = 'This collection could not be found. Please go back and choose an album.';

	function explainCollectionLevels() {
		Alert.alert(
			'Collection learning levels',
			'Your first flashcard reveals this album. The collection’s level is the lowest level of all its words, so it stays Unseen until every stamp is found. Reach each learning level on every word to earn that level’s XP reward.',
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
			notice = 'Find one of this collection’s words in flashcards to reveal its album.';
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
		<ImageBackground
			source={chapterSelectBackground}
			style={styles.background}
		>
			<ScrollView
				contentContainerStyle={[styles.scrollContent, scrollContentStyle]}
				scrollIndicatorInsets={scrollIndicatorInsets}
			>
				<ImageBackground
					source={albumPaper}
					imageStyle={styles.paperImage}
					style={styles.album}
				>
					<View style={styles.header}>
						<View style={styles.heading}>
							<Text
								accessibilityRole="header"
								style={styles.title}
							>
								{progress.collection.name}
							</Text>
							<Text style={styles.description}>{progress.stamps.length} words total</Text>
							<Text style={styles.description}>{progress.collection.description}</Text>
						</View>
						<ImageBackground
							accessible={false}
							source={progress.collection.image}
							resizeMode="contain"
							style={styles.headerIllustration}
						/>
					</View>
					<Pressable
						accessibilityRole="button"
						accessibilityLabel={`${levelLabel}. Explain collection learning levels.`}
						onPress={explainCollectionLevels}
						style={styles.levelRow}
					>
						<Text style={styles.level}>{levelLabel}</Text>
						<MaterialSymbol
							name="info"
							size={18}
							color={colors.wordProgress.unseen}
						/>
					</Pressable>
					{progress.nextReward && (
						<CollectionMeter
							qualifyingWordCount={progress.nextReward.qualifyingWordCount}
							wordCount={progress.stamps.length}
							targetLevel={progress.nextReward.level}
						/>
					)}
					<Text style={styles.description}>
						{progress.discoveredWordCount} / {progress.stamps.length} stamps discovered
					</Text>
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
					<CollectionRewards
						key={progress.collection.id}
						progress={progress}
					/>
				</ImageBackground>
			</ScrollView>
		</ImageBackground>
	);
}

const styles = StyleSheet.create({
	background: {
		flex: 1,
		backgroundColor: colors.dark.background,
	},
	scrollContent: {
		flexGrow: 1,
		paddingHorizontal: 12,
		paddingBottom: 32,
	},
	album: {
		padding: 16,
		gap: 14,
		borderWidth: 1,
		borderColor: colors.light.goldenBorder,
		borderRadius: 12,
		backgroundColor: colors.light.background,
	},
	paperImage: {
		borderRadius: 12,
	},
	header: {
		flexDirection: 'row',
		alignItems: 'flex-start',
		gap: 12,
	},
	heading: {
		flex: 1,
		gap: 8,
	},
	title: {
		fontFamily: 'lexend-600',
		fontSize: 25,
		color: colors.dark.text,
	},
	description: {
		fontFamily: 'lexend-400',
		fontSize: 12,
		lineHeight: 18,
		color: colors.wordProgress.unseen,
	},
	headerIllustration: {
		width: 84,
		height: 104,
	},
	levelRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
		minHeight: 44,
	},
	level: {
		fontFamily: 'lexend-600',
		fontSize: 13,
		color: colors.wordProgress.unseen,
		flexShrink: 1,
	},
	stampGrid: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		justifyContent: 'space-between',
		rowGap: 12,
		marginVertical: 8,
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

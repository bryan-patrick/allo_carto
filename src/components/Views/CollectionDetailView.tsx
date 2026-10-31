import colors from '@/src/app/colors';
import BackgroundImage from '@/src/components/BackgroundImage';
import CollectionClaim from '@/src/components/Collections/CollectionClaim';
import VocabularyStamp from '@/src/components/Collections/VocabularyStamp';
import LinkButton from '@/src/components/LinkButton';
import Loader from '@/src/components/Loader';
import MaterialSymbol from '@/src/components/MaterialSymbol';
import WordProgressBar from '@/src/components/WordProgressBar';
import { useUserProgress } from '@/src/db/useUserProgress';
import { wordProgressDefinitions } from '@/src/util/wordProgress';
import { useLocalSearchParams } from 'expo-router';
import { useHeaderHeight } from 'expo-router/react-navigation';
import {
	Alert,
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
const collectionsPageBackground = require('@/src/app/assets/images/collections/page-background.jpg');

/*
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
	const learningLevel =
		wordProgressDefinitions.find(definition => definition.level === progress?.level) ??
		wordProgressDefinitions[0];
	let notice = 'This collection could not be found. Please go back and choose an album.';

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
		<BackgroundImage
			source={collectionsPageBackground}
			resizeMode="cover"
			style={styles.background}
		>
			<ScrollView
				contentContainerStyle={[styles.scrollContent, scrollContentStyle]}
				scrollIndicatorInsets={scrollIndicatorInsets}
			>
				<BackgroundImage
					source={albumPaper}
					imageStyle={styles.paperImage}
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
				</BackgroundImage>
			</ScrollView>
		</BackgroundImage>
	);
}

const styles = StyleSheet.create({
	background: {
		flex: 1,
		backgroundColor: colors.light.secondary,
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
	heading: {
		gap: 8,
	},
	title: {
		flexShrink: 1,
		fontFamily: 'lexend-600',
		fontSize: 22,
		color: colors.dark.text,
	},
	description: {
		fontFamily: 'lexend-400',
		fontSize: 12,
		lineHeight: 18,
		color: colors.wordProgress.unseen,
	},
	titleRow: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		alignItems: 'center',
		gap: 8,
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

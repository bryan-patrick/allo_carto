import colors from '@/src/app/colors';
import BackgroundImage from '@/src/components/BackgroundImage';
import { solidSurfaceShadow } from '@/src/components/surfaceStyles';
import type { VocabularyCollectionProgress } from '@/src/util/vocabularyCollections';
import { wordProgressDefinitions } from '@/src/util/wordProgress';
import { useRouter } from 'expo-router';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import MaterialSymbol from '../MaterialSymbol';
import WordProgressBar from '../WordProgressBar';
import StampIllustration from './StampIllustration';

// This is the non-striped one
const postcardBackground = require('@/src/app/assets/images/postcard-parts/background.jpg');

/**
 * Typing
 */
interface CollectionCardProps {
	progress: VocabularyCollectionProgress;
}

/**
 * Shows a collection's first stamp and learning progress, or a lock until it is discovered.
 */
export default function CollectionCard({ progress }: CollectionCardProps) {
	/**
	 * Navigation hook
	 */
	const router = useRouter();

	/**
	 * Destructured collection progress
	 */
	const { collection, isDiscovered, nextReward, section, level } = progress;

	/**
	 * Stamp, learning level, and reward state
	 */
	const firstDiscoveredStamp = progress.stamps.find(stamp => stamp.progress !== 'unseen');
	const isNextXPRewardReadyToClaim = section === 'ready';

	const matchingLearningLevel = wordProgressDefinitions.find(
		definition => definition.level === level,
	);

	const rewardLearningLevel = wordProgressDefinitions.find(
		definition => definition.level === nextReward?.level,
	);

	/**
	 * Initial card text, learning level, and action icon
	 */
	let title = '???';
	let learningLevel = wordProgressDefinitions[0];
	let progressDescription: string | undefined = undefined;
	let actionSymbol = 'chevron_right';
	let rewardDescription = 'All rewards claimed.';

	/**
	 * Initial screen reader descriptions
	 */
	let readyDescription = '';
	let accessibilityLabel = 'Undiscovered collection.';
	let accessibilityHint = 'Learn how to reveal this collection.';

	/**
	 * Initial illustration for an undiscovered collection
	 */
	let illustration = (
		<View style={styles.lockedIllustration}>
			<MaterialSymbol
				accessible={false}
				name="lock"
				size={32}
				color={colors.wordProgress.unseen}
			/>
		</View>
	);

	/**
	 * Make sure we can display the learning level
	 */
	if (matchingLearningLevel) {
		learningLevel = matchingLearningLevel;
	}

	/**
	 * Check if there's a "next reward" for the collection
	 */
	if (nextReward) {
		rewardDescription = `${nextReward.qualifyingWordCount} of ${progress.stamps.length} words at learning level ${nextReward.level} or higher. Next reward: ${nextReward.xp} XP.`;

		if (rewardLearningLevel) {
			progressDescription = `${nextReward.qualifyingWordCount}/${progress.stamps.length} words at ${rewardLearningLevel.name} | Next reward: ${nextReward.xp} XP`;
		}
	}

	if (isNextXPRewardReadyToClaim) {
		actionSymbol = 'redeem';
		readyDescription = 'Reward ready to claim.';
	}

	if (isDiscovered) {
		title = collection.name;
		accessibilityLabel = `${title}. ${learningLevel.name}. ${rewardDescription} ${readyDescription}`;
		accessibilityHint = 'Open the stamp album.';
		illustration = <StampIllustration image={firstDiscoveredStamp?.image} />;
	}

	/**
	 * The user selects the collection
	 */
	function openCollection() {
		if (!isDiscovered) {
			Alert.alert('???', 'Answer a word correctly in flashcards to reveal its album.');
			return;
		}

		router.push({
			pathname: '/(routes)/CollectionDetail',
			params: {
				collectionId: collection.id,
			},
		});
	}

	/**
	 * Render the collection card
	 */
	return (
		<Pressable
			accessibilityRole="button"
			accessibilityLabel={accessibilityLabel}
			accessibilityHint={accessibilityHint}
			onPress={openCollection}
		>
			<BackgroundImage
				source={postcardBackground}
				imageStyle={styles.paperImage}
				style={[styles.card, isNextXPRewardReadyToClaim && styles.readyCard]}
			>
				<View style={styles.cardContent}>
					<View style={styles.illustration}>{illustration}</View>
					<View style={styles.details}>
						<Text style={styles.title}>{title}</Text>
						{isDiscovered && (
							<>
								<WordProgressBar
									progress={learningLevel.key}
									accessibilityLabel="Collection learning level"
								/>
								{progressDescription && (
									<Text style={styles.progressDescription}>{progressDescription}</Text>
								)}
							</>
						)}
						{isDiscovered && section === 'completed' && (
							<Text style={styles.reward}>All rewards claimed</Text>
						)}
					</View>
					{isDiscovered && (
						<MaterialSymbol
							name={actionSymbol}
							size={28}
							color={colors.wordProgress.unseen}
						/>
					)}
				</View>
			</BackgroundImage>
		</Pressable>
	);
}

/**
 * Styles
 */
const styles = StyleSheet.create({
	card: {
		...solidSurfaceShadow,
		padding: 4,
		borderRadius: 8,
		borderWidth: 1,
		borderColor: colors.light.goldenBorder,
		backgroundColor: colors.light.background,
		gap: 12,
	},
	cardContent: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
	},
	paperImage: {
		borderRadius: 9,
	},
	readyCard: {
		borderWidth: 1,
	},
	illustration: {
		backgroundColor: '#ffffff',
		width: 72,
	},
	lockedIllustration: {
		width: '100%',
		height: 80,
		alignItems: 'center',
		justifyContent: 'center',
		borderWidth: 1,
		borderStyle: 'dashed',
		borderColor: colors.light.border,
		borderRadius: 3,
	},
	details: {
		flex: 1,
		gap: 4,
	},
	title: {
		flexShrink: 1,
		fontFamily: 'lexend-600',
		fontSize: 16,
		color: colors.dark.text,
	},
	progressDescription: {
		fontFamily: 'lexend-400',
		fontSize: 11,
		color: colors.wordProgress.unseen,
	},
	reward: {
		fontFamily: 'lexend-600',
		fontSize: 12,
		color: colors.dark.success,
	},
});

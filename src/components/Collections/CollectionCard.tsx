import { placeholderStampImage } from '@/data/french/collectionAtlas';
import colors from '@/src/app/colors';
import type { VocabularyCollectionProgress } from '@/src/util/vocabularyCollections';
import { wordProgressDefinitions } from '@/src/util/wordProgress';
import { useRouter } from 'expo-router';
import { Alert, ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';
import MaterialSymbol from '../MaterialSymbol';
import WordProgressBar from '../WordProgressBar';
import StampIllustration from './StampIllustration';

const postcardBackground = require('@/src/app/assets/images/postcard-parts/background.jpg');

/*
 * Typing
 */
interface CollectionCardProps {
	progress: VocabularyCollectionProgress;
}

/*
 * Shows a collection's first stamp and learning progress in the overview.
 */
export default function CollectionCard({ progress }: CollectionCardProps) {
	const router = useRouter();
	const { collection, isDiscovered, nextReward, section, level } = progress;
	const firstStamp = progress.stamps[0];
	const title = isDiscovered ? collection.name : '???';
	const learningLevel =
		wordProgressDefinitions.find(definition => definition.level === level) ??
		wordProgressDefinitions[0];
	const rewardLearningLevel = wordProgressDefinitions.find(
		definition => definition.level === nextReward?.level,
	);
	const progressDescription =
		nextReward && rewardLearningLevel ?
			`${nextReward.qualifyingWordCount}/${progress.stamps.length} words at ${rewardLearningLevel.name} | Next reward: ${nextReward.xp} XP`
		:	undefined;
	const isReady = section === 'ready';
	const actionSymbol =
		!isDiscovered ? 'lock'
		: isReady ? 'redeem'
		: 'chevron_right';
	const rewardDescription =
		nextReward ?
			`${nextReward.qualifyingWordCount} of ${progress.stamps.length} words at learning level ${nextReward.level} or higher. Next reward: ${nextReward.xp} XP.`
		:	'All rewards claimed.';
	const accessibilityLabel =
		isDiscovered ?
			`${title}. ${learningLevel.name}. ${rewardDescription} ${isReady ? 'Reward ready to claim.' : ''}`
		:	'Undiscovered collection.';

	function openCollection() {
		if (!isDiscovered) {
			Alert.alert(
				'Undiscovered collection',
				'Find one of this collection’s words in flashcards to reveal its album.',
			);
			return;
		}

		router.push({
			pathname: '/(routes)/CollectionDetail',
			params: {
				collectionId: collection.id,
			},
		});
	}

	return (
		<Pressable
			accessibilityRole="button"
			accessibilityLabel={accessibilityLabel}
			accessibilityHint={
				isDiscovered ? 'Open the stamp album.' : 'Learn how to reveal this collection.'
			}
			onPress={openCollection}
		>
			<ImageBackground
				source={postcardBackground}
				imageStyle={styles.paperImage}
				style={[styles.card, isReady && styles.readyCard]}
			>
				<View style={styles.cardContent}>
					<View style={styles.illustration}>
						{isDiscovered ?
							<StampIllustration image={firstStamp?.image} />
						:	<ImageBackground
								accessible={false}
								source={firstStamp?.image ?? placeholderStampImage}
								resizeMode="contain"
								style={styles.lockedIllustration}
							/>
						}
					</View>
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
					<MaterialSymbol
						name={actionSymbol}
						size={28}
						color={colors.wordProgress.unseen}
					/>
				</View>
			</ImageBackground>
		</Pressable>
	);
}

/*
 * Styles
 */
const styles = StyleSheet.create({
	card: {
		padding: 4,
		borderRadius: 2,
		borderWidth: 1,
		borderColor: colors.light.goldenBorder,
		backgroundColor: colors.light.background,
		gap: 12,
	},
	cardContent: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 12,
	},
	paperImage: {
		borderRadius: 9,
	},
	readyCard: {
		borderWidth: 2,
	},
	illustration: {
		width: 72,
	},
	lockedIllustration: {
		width: '100%',
		height: 80,
		borderWidth: 1,
		borderStyle: 'dashed',
		borderColor: colors.light.border,
		borderRadius: 3,
	},
	details: {
		flex: 1,
		gap: 6,
	},
	title: {
		flexShrink: 1,
		fontFamily: 'lexend-600',
		fontSize: 17,
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

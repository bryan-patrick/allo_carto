import colors from '@/src/app/colors';
import type { VocabularyCollectionProgress } from '@/src/util/vocabularyCollections';
import { Alert, ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import MaterialSymbol from '../MaterialSymbol';
import CollectionMeter from './CollectionMeter';

const postcardBackground = require('@/src/app/assets/images/postcard-parts/background.jpg');

interface CollectionCardProps {
	progress: VocabularyCollectionProgress;
}

/**
 * Shows a collection card with its discovery state, learning progress, and next reward.
 */
export default function CollectionCard({ progress }: CollectionCardProps) {
	const router = useRouter();
	const { collection, isDiscovered, nextReward, section, level } = progress;
	const title = isDiscovered ? collection.name : '???';
	const levelLabel = level > 0 ? `Collection Lvl. ${level}` : 'Collection level: Unseen';
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
			`${title}. ${levelLabel}. ${rewardDescription} ${isReady ? 'Reward ready to claim.' : ''}`
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
				<ImageBackground
					accessible={false}
					source={collection.image}
					resizeMode="contain"
					style={styles.illustration}
				/>
				<View style={styles.details}>
					<Text style={styles.title}>{title}</Text>
					{isDiscovered && (
						<>
							<Text style={styles.level}>{levelLabel}</Text>
							{nextReward && (
								<CollectionMeter
									qualifyingWordCount={nextReward.qualifyingWordCount}
									wordCount={progress.stamps.length}
									targetLevel={nextReward.level}
								/>
							)}
							{isReady && <Text style={styles.reward}>+{nextReward?.xp} XP ready to claim</Text>}
							{section === 'completed' && <Text style={styles.reward}>All rewards claimed</Text>}
						</>
					)}
				</View>
				<MaterialSymbol
					name={actionSymbol}
					size={28}
					color={colors.wordProgress.unseen}
				/>
			</ImageBackground>
		</Pressable>
	);
}

const styles = StyleSheet.create({
	card: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 12,
		padding: 12,
		borderRadius: 10,
		borderWidth: 1,
		borderColor: colors.light.goldenBorder,
		backgroundColor: colors.light.background,
	},
	paperImage: {
		borderRadius: 9,
	},
	readyCard: {
		borderWidth: 2,
	},
	illustration: {
		width: 72,
		height: 86,
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
		fontFamily: 'lexend-600',
		fontSize: 17,
		color: colors.dark.text,
	},
	level: {
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

import {
	collectionAtlas,
	type CollectionRewardDefinition,
	type CollectionRewardLevel,
	type VocabularyCollection,
} from '@/data/french/collectionAtlas';
import { seedWords } from '@/data/french/words';
import type { Word } from '@/src/components/CardDeck/cardDeckTypes';
import {
	emptyDeckWordProgressCounts,
	type DeckWordProgressCounts,
} from '@/src/db/queries/getDeckWordProgressCounts';
import type { UserWordProgressById } from '@/src/db/queries/getUserWordProgress';
import type { ImageSourcePropType } from 'react-native';
import { getCollectionLevel, getWordsAtLevel, hasCollectionLevel } from './collectionProgress';
import { getWordProgressDefinitionByKey, type WordProgressKey } from './wordProgress';

/**
 * Typing
 */
export type CollectionSection = 'ready' | 'inProgress' | 'undiscovered' | 'completed';

export interface CollectionRewardClaim {
	collectionId: string;
	requiredWordProgress: CollectionRewardLevel;
	xp: number;
	claimedAt: number;
}

export interface CollectionStamp {
	wordId: string;
	frenchWord: string;
	image?: ImageSourcePropType;
	progress: WordProgressKey;
	level: number;
}

export interface CollectionRewardProgress extends CollectionRewardDefinition {
	level: number;
	qualifyingWordCount: number;
	isEligible: boolean;
	isClaimed: boolean;
}

export interface VocabularyCollectionProgress {
	collection: VocabularyCollection;
	stamps: CollectionStamp[];
	discoveredWordCount: number;
	isDiscovered: boolean;
	level: number;
	rewards: CollectionRewardProgress[];
	nextReward?: CollectionRewardProgress;
	section: CollectionSection;
}

interface GetVocabularyCollectionProgressOptions {
	collection: VocabularyCollection;
	wordProgressById: UserWordProgressById;
	claims: CollectionRewardClaim[];
}

interface CollectionWordCounts {
	wordCount: number;
	wordProgressCounts: DeckWordProgressCounts;
}

const vocabularyById = new Map<string, Word>();

for (const word of seedWords) {
	vocabularyById.set(word.id, word);
}

/**
 * Checks collection words and rewards so invalid albums are caught when the app loads.
 */
export function validateCollectionAtlas(): void {
	const collectionIds = new Set<string>();
	const collectedWordIds = new Set<string>();

	for (const collection of collectionAtlas.collections) {
		const rewardLevels = new Set<CollectionRewardLevel>();
		let previousLevel = 0;

		if (collectionIds.has(collection.id) || collection.words.length === 0) {
			throw new Error(`Collection ${collection.id} needs a unique ID and at least one word.`);
		}

		collectionIds.add(collection.id);

		for (const entry of collection.words) {
			if (!vocabularyById.has(entry.wordId)) {
				throw new Error(`Collection word ${entry.wordId} is missing from the vocabulary.`);
			}

			if (collectedWordIds.has(entry.wordId)) {
				throw new Error(`Collection word ${entry.wordId} is listed more than once.`);
			}

			collectedWordIds.add(entry.wordId);
		}

		if (collection.rewards.length === 0) {
			throw new Error(`Collection ${collection.id} needs XP rewards.`);
		}

		for (const reward of collection.rewards) {
			const definition = getWordProgressDefinitionByKey(reward.requiredWordProgress);
			const hasValidXP = Number.isSafeInteger(reward.xp) && reward.xp > 0;

			if (
				definition.level <= previousLevel ||
				rewardLevels.has(reward.requiredWordProgress) ||
				!hasValidXP
			) {
				throw new Error(
					`Collection ${collection.id} needs unique rewards in learning-level order with positive XP.`,
				);
			}

			rewardLevels.add(reward.requiredWordProgress);
			previousLevel = definition.level;
		}
	}
}

/**
 * Builds album stamps from existing vocabulary, artwork, and the player's word levels.
 */
function getCollectionStamps(
	collection: VocabularyCollection,
	wordProgressById: UserWordProgressById,
): CollectionStamp[] {
	const stamps: CollectionStamp[] = [];

	for (const entry of collection.words) {
		const word = vocabularyById.get(entry.wordId);
		const progress = wordProgressById[entry.wordId] ?? 'unseen';
		const definition = getWordProgressDefinitionByKey(progress);

		if (!word) {
			throw new Error(`Collection word ${entry.wordId} is missing from the vocabulary.`);
		}

		stamps.push({
			wordId: word.id,
			frenchWord: word.frenchWord,
			image: entry.image,
			progress,
			level: definition.level,
		});
	}

	return stamps;
}

/**
 * Counts stamps at each learning level to calculate collection progress.
 */
function getCollectionWordCounts(stamps: CollectionStamp[]): CollectionWordCounts {
	const wordProgressCounts = {
		...emptyDeckWordProgressCounts,
	};

	for (const stamp of stamps) {
		wordProgressCounts[stamp.progress] += 1;
	}

	return {
		wordCount: stamps.length,
		wordProgressCounts,
	};
}

/**
 * Gets each level's reward eligibility and claim status for the collection.
 */
function getCollectionRewards(
	collection: VocabularyCollection,
	progressCounts: CollectionWordCounts,
	claims: CollectionRewardClaim[],
): CollectionRewardProgress[] {
	return collection.rewards.map(reward => {
		const definition = getWordProgressDefinitionByKey(reward.requiredWordProgress);
		const savedClaim = claims.find(claim => {
			const matchesCollection = claim.collectionId === collection.id;
			const matchesLevel = claim.requiredWordProgress === reward.requiredWordProgress;

			return matchesCollection && matchesLevel;
		});

		return {
			...reward,
			xp: savedClaim?.xp ?? reward.xp,
			level: definition.level,
			qualifyingWordCount: getWordsAtLevel(progressCounts, reward.requiredWordProgress),
			isEligible: hasCollectionLevel(progressCounts, reward.requiredWordProgress),
			isClaimed: Boolean(savedClaim),
		};
	});
}

/**
 * Calculates revealed stamps, collection level, and rewards for the album screens.
 */
export function getVocabularyCollectionProgress({
	collection,
	wordProgressById,
	claims,
}: GetVocabularyCollectionProgressOptions): VocabularyCollectionProgress {
	const stamps = getCollectionStamps(collection, wordProgressById);
	const progressCounts = getCollectionWordCounts(stamps);
	const discoveredWordCount = stamps.length - progressCounts.wordProgressCounts.unseen;
	const lowestProgress = getCollectionLevel(progressCounts);
	const level = getWordProgressDefinitionByKey(lowestProgress).level;
	const isDiscovered = discoveredWordCount > 0;
	const rewards = getCollectionRewards(collection, progressCounts, claims);
	const nextReward = rewards.find(reward => !reward.isClaimed);
	let section: CollectionSection = 'undiscovered';

	if (isDiscovered) {
		section = 'inProgress';
	}

	if (isDiscovered && !nextReward) {
		section = 'completed';
	} else if (nextReward?.isEligible) {
		section = 'ready';
	}

	return {
		collection,
		stamps,
		discoveredWordCount,
		isDiscovered,
		level,
		rewards,
		nextReward,
		section,
	};
}

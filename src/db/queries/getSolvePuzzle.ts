import type { CardRarity } from '@/src/components/CardDeck/cardDeckTypes';
import type {
	SolvePosition,
	SolvePuzzle,
	SolveStageSolvedPosition,
} from '@/src/components/Solve/solveTypes';
import { findParagraphById, isItemUnlocked } from '@/src/util/atlasCompletion';
import {
	getEnglishPuzzleAnswers,
	parseEnglishPrefixes,
	type EnglishWordDefinition,
} from '@/src/util/englishWordParts';
import { getPassageWordIds } from '@/src/util/getPassageWordIds';
import { getSolvePassage } from '@/src/util/getSolvePassage';
import {
	getCompletedSolveStages,
	getSolveCardInkCost,
	getSolveStageEligibility,
	type SolveWordStage,
} from '@/src/util/solveProgression';
import type { SQLiteDatabase } from 'expo-sqlite';
import getSolveStageProgress from './getSolveStageProgress';
import loadUserXP from './getUserExperience';
import getUserProgress from './getUserProgress';
import { getSolveRewards } from './solveRewards';

/**
 * Typing
 */
interface GetSolvePuzzleOptions {
	database: SQLiteDatabase;
	userId: string;
	deckId: string;
	stage?: SolveWordStage;
	fastSolveUnlocks?: boolean;
}

interface SolveWordRow {
	id: string;
	frenchWord: string;
	frenchArticle: string | null;
	englishArticle: string | null;
	englishPrefixes: string | null;
	englishWords: string;
	canonicalEnglish: string | null;
	rarity: CardRarity;
}

/**
 * Opens a paragraph's Solve or Solve+ puzzle with its saved cards.
 */
export default async function getSolvePuzzle({
	database,
	userId,
	deckId,
	stage = 1,
	fastSolveUnlocks = true,
}: GetSolvePuzzleOptions): Promise<SolvePuzzle> {
	const deck = findParagraphById(deckId);
	const positions: SolvePosition[] = [];
	let words: SolveWordRow[] = [];
	let solvedPositions: SolveStageSolvedPosition[] = [];

	if (!deck) {
		throw new Error('This paragraph could not be found.');
	}

	const solvePassage = getSolvePassage(deck.passage);
	const solveWordIds = getPassageWordIds(solvePassage);
	const placeholders = solveWordIds.map(() => '?').join(',');
	const progressById = await getUserProgress({
		database,
		userId,
	});
	const progress = progressById[deckId];
	const completedSolveStages = getCompletedSolveStages(progress);
	const isUnlocked = isItemUnlocked({
		id: deckId,
		progressById,
	});
	const allWordsSeen = deck.wordIds.length > 0 && progress?.seenWordCount === deck.wordIds.length;
	const experience =
		stage === 2 ?
			await loadUserXP({
				database,
				userId,
			})
		:	null;
	const eligibility = getSolveStageEligibility({
		stage,
		completedStages: completedSolveStages,
		playerLevel: experience?.level ?? 1,
		fastSolveUnlocks,
		isParagraphUnlocked: isUnlocked,
		wordCount: deck.wordIds.length,
		seenWordCount: progress?.seenWordCount ?? 0,
	});

	if (stage === 2) {
		const savedStage = await getSolveStageProgress({
			database,
			userId,
			deckId,
			stage,
		});

		solvedPositions = savedStage.solvedPositions;
	} else {
		solvedPositions = await database.getAllAsync<SolveStageSolvedPosition>(
			'SELECT position, wordId, acceptedAnswer FROM solvePositions WHERE userId = ? AND deckId = ?;',
			userId,
			deckId,
		);
	}

	if (solveWordIds.length > 0) {
		words = await database.getAllAsync<SolveWordRow>(
			`SELECT id, frenchWord, frenchArticle, englishArticle, englishPrefixes, englishWords,
			 canonicalEnglish, rarity
			 FROM words WHERE id IN (${placeholders});`,
			...solveWordIds,
		);
	}

	for (const segment of solvePassage) {
		const position = segment.position;
		/**
		 * Leave punctuation out of the word cards.
		 */
		const textWithoutPunctuation = segment.text.replace(/[^\p{L}\p{M}\p{N}\s'’ʼ-]/gu, '');
		const text = textWithoutPunctuation.trim();
		let wordId = segment.wordId;

		if (segment.unlockExempt) {
			wordId = undefined;
		}

		const word = words.find(word => word.id === wordId);
		const solved = solvedPositions.find(
			saved => saved.position === position && saved.wordId === wordId,
		);
		const rarity = word?.rarity ?? 'Common';
		const frenchWords = new Set([text]);
		let inkCost = 0;
		let englishWords: string[] = [];
		let englishPrompt = '';

		if (wordId) {
			inkCost = getSolveCardInkCost(stage, rarity);
		}

		if (word) {
			const englishDefinition: EnglishWordDefinition = {
				englishWords: JSON.parse(word.englishWords),
				canonicalEnglish: segment.canonicalEnglish ?? word.canonicalEnglish,
				englishArticle: word.englishArticle,
				englishPrefixes: parseEnglishPrefixes(word.englishPrefixes),
			};

			englishWords = getEnglishPuzzleAnswers(englishDefinition);
			englishPrompt = englishWords.join(' / ');
			frenchWords.add(word.frenchWord);

			if (word.frenchArticle) {
				let articleSeparator = ' ';

				if (/['’ʼ]$/u.test(word.frenchArticle)) {
					articleSeparator = '';
				}

				const wordWithArticle = `${word.frenchArticle}${articleSeparator}${word.frenchWord}`;

				frenchWords.add(wordWithArticle);
			}
		}

		if (!text) {
			continue;
		}

		if (wordId && englishWords.length === 0) {
			throw new Error(`The dictionary answer for ${segment.text} is missing.`);
		}

		positions.push({
			position,
			text,
			wordId,
			rarity,
			inkCost,
			englishWords,
			englishPrompt,
			frenchWords: Array.from(frenchWords),
			acceptedAnswer: solved?.acceptedAnswer ?? null,
		});
	}

	const rewards = await getSolveRewards({
		database,
		userId,
		deckId,
		stage,
	});

	return {
		...eligibility,
		rewards,
		deck,
		stage,
		completedSolveStages,
		positions,
		isUnlocked,
		allWordsSeen,
		hasFirstGem: Boolean(progress?.hasFirstGem),
	};
}

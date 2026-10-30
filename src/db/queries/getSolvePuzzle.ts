import type { CardRarity } from '@/src/components/CardDeck/cardDeckTypes';
import type {
	SolvePosition,
	SolvePuzzle,
	SolveStageSolvedPosition,
} from '@/src/components/Solve/solveTypes';
import { findParagraphById, isItemUnlocked } from '@/src/util/atlasCompletion';
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

/*
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
	englishWords: string;
	rarity: CardRarity;
}

/*
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
			`SELECT id, frenchWord, frenchArticle, englishArticle, englishWords, rarity
			 FROM words WHERE id IN (${placeholders});`,
			...solveWordIds,
		);
	}

	for (const segment of solvePassage) {
		const position = segment.position;
		/*
		 * Leave punctuation out of the word cards.
		 */
		const textWithoutPunctuation = segment.text.replace(/[^\p{L}\p{M}\p{N}\s'’ʼ-]/gu, '');
		const text = textWithoutPunctuation.trim();
		const wordId = segment.unlockExempt ? undefined : segment.wordId;
		const word = words.find(word => word.id === wordId);
		const solved = solvedPositions.find(
			saved => saved.position === position && saved.wordId === wordId,
		);
		const rarity = word?.rarity ?? 'Common';
		const inkCost = wordId ? getSolveCardInkCost(stage, rarity) : 0;
		const englishWords: string[] = word ? JSON.parse(word.englishWords) : [];
		const englishMeanings = englishWords.join(' / ');
		const englishPrompt =
			word?.englishArticle ? `${word.englishArticle} ${englishMeanings}` : englishMeanings;
		const frenchWords = new Set([text]);

		if (word) {
			frenchWords.add(word.frenchWord);

			if (word.frenchArticle) {
				const articleSeparator = /['’ʼ]$/u.test(word.frenchArticle) ? '' : ' ';
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

	return {
		...eligibility,
		deck,
		stage,
		completedSolveStages,
		positions,
		isUnlocked,
		allWordsSeen,
		hasFirstGem: Boolean(progress?.hasFirstGem),
	};
}

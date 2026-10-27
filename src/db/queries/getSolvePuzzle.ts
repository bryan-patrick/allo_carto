import type { SolvePosition, SolvePuzzle } from '@/src/components/Solve/solveTypes';
import type { CardRarity } from '@/src/components/CardDeck/cardDeckTypes';
import { findParagraphById, isItemUnlocked } from '@/src/util/atlasCompletion';
import { getPassageWordIds } from '@/src/util/getPassageWordIds';
import { getSolvePassage } from '@/src/util/getSolvePassage';
import type { SQLiteDatabase } from 'expo-sqlite';
import getUserProgress from './getUserProgress';

/**
 * Typing
 */
interface GetSolvePuzzleOptions {
	database: SQLiteDatabase;
	userId: string;
	deckId: string;
}

interface SolveWordRow {
	id: string;
	englishWords: string;
	rarity: CardRarity;
}

interface UnlockedPositionRow {
	position: number;
	wordId: string;
}

interface SolvedPositionRow extends UnlockedPositionRow {
	acceptedAnswer: string;
}

/**
 * The solve puzzle gets every word from the paragraph
 */
export default async function getSolvePuzzle({
	database,
	userId,
	deckId,
}: GetSolvePuzzleOptions): Promise<SolvePuzzle> {
	const deck = findParagraphById(deckId);
	const positions: SolvePosition[] = [];
	let words: SolveWordRow[] = [];

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
	const isUnlocked = isItemUnlocked({
		id: deckId,
		progressById,
	});
	const allWordsSeen = deck.wordIds.length > 0 && progress?.seenWordCount === deck.wordIds.length;
	const unlockedPositions = await database.getAllAsync<UnlockedPositionRow>(
		'SELECT position, wordId FROM solveUnlocks WHERE userId = ? AND deckId = ?;',
		userId,
		deckId,
	);
	const solvedPositions = await database.getAllAsync<SolvedPositionRow>(
		'SELECT position, wordId, acceptedAnswer FROM solvePositions WHERE userId = ? AND deckId = ?;',
		userId,
		deckId,
	);

	if (solveWordIds.length > 0) {
		words = await database.getAllAsync<SolveWordRow>(
			`SELECT id, englishWords, rarity FROM words WHERE id IN (${placeholders});`,
			...solveWordIds,
		);
	}

	for (const segment of solvePassage) {
		const position = segment.position;
		/**
		 * We don't want to include punctuation in the puzzle solver
		 */
		const textWithoutPunctuation = segment.text.replace(/[^\p{L}\p{M}\p{N}\s'’ʼ-]/gu, '');
		const text = textWithoutPunctuation.trim();
		const wordId = segment.unlockExempt ? undefined : segment.wordId;
		const word = words.find(word => word.id === wordId);
		const solved = solvedPositions.find(
			saved => saved.position === position && saved.wordId === wordId,
		);
		const unlocked = unlockedPositions.some(
			saved => saved.position === position && saved.wordId === wordId,
		);
		const englishWords: string[] = word ? JSON.parse(word.englishWords) : [];

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
			rarity: word?.rarity ?? 'Common',
			isUnlocked: !wordId || unlocked || Boolean(solved),
			englishWords,
			acceptedAnswer: solved?.acceptedAnswer ?? null,
		});
	}

	return {
		deck,
		positions,
		isUnlocked,
		allWordsSeen,
		hasFirstGem: Boolean(progress?.hasFirstGem),
	};
}

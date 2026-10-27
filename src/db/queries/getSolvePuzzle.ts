import type { SolvePosition, SolvePuzzle } from '@/src/components/Solve/solveTypes';
import { findParagraphById, isItemUnlocked } from '@/src/util/atlasCompletion';
import { getPassageWordIds } from '@/src/util/getPassageWordIds';
import { getSolvePassage } from '@/src/util/getSolvePassage';
import type { SQLiteDatabase } from 'expo-sqlite';
import loadUserXP from './getUserExperience';
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
}

interface SolvedPositionRow {
	position: number;
	wordId: string;
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
	const progressById = await getUserProgress({ database, userId });
	const experience = await loadUserXP({ database, userId });
	const progress = progressById[deckId];
	const isUnlocked = isItemUnlocked({ id: deckId, progressById, userLevel: experience.level });
	const allWordsSeen = deck.wordIds.length > 0 && progress?.seenWordCount === deck.wordIds.length;
	const solvedPositions = await database.getAllAsync<SolvedPositionRow>(
		'SELECT position, wordId, acceptedAnswer FROM solvePositions WHERE userId = ? AND deckId = ?;',
		userId,
		deckId,
	);

	if (solveWordIds.length > 0) {
		words = await database.getAllAsync<SolveWordRow>(
			`SELECT id, englishWords FROM words WHERE id IN (${placeholders});`,
			...solveWordIds,
		);
	}

	for (const segment of solvePassage) {
		const position = segment.position;
		const wordId = segment.unlockExempt ? undefined : segment.wordId;
		const word = words.find(word => word.id === wordId);
		const solved = solvedPositions.find(
			saved => saved.position === position && saved.wordId === wordId,
		);
		const englishWords: string[] = word ? JSON.parse(word.englishWords) : [];

		if (wordId && englishWords.length === 0) {
			throw new Error(`The dictionary answer for ${segment.text} is missing.`);
		}

		positions.push({
			position,
			text: segment.text,
			after: segment.after,
			wordId,
			englishWords,
			acceptedAnswer: solved?.acceptedAnswer ?? null,
		});
	}

	return { deck, positions, isUnlocked, allWordsSeen };
}

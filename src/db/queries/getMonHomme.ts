import { WordProgressKey } from '@/src/util/wordRanks';
import { getDB } from '../connection';
import { DeckRankCounts } from './getDeckRankCounts';

/**
 * Typing
 */
export interface StoryProgress {
	completionPercent: number;
	wordProgressById: Record<string, WordProgressKey>;
	totalWordCount: number;
	seenWordCount: number;
}

export interface DeckProgress {
	deckId: string;
	completionPercent: number;
	rankCounts: DeckRankCounts;
	story?: StoryProgress;
	state: 'available' | 'complete' | 'locked';
}

export interface UserRow {
	id: string;
	name: string | null;
	isMonHomme: number;
}

export interface UserProgress {
	user: UserRow;
	deckProgressById: Record<string, DeckProgress>;
}

/**
 * Gets the local user
 */
export default async function getMonHomme() {
	const database = await getDB();

	return await database.getFirstAsync<UserRow | null>(
		`
		SELECT
			id,
			name,
			isMonHomme
		FROM users
		WHERE isMonHomme = 1
		LIMIT 1;
		`,
	);
}

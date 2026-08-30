import { WordProgressKey } from '@/src/util/wordProgress';
import { getDB } from '../connection';
import { DeckWordProgressCounts } from './getDeckWordProgressCounts';

/**
 * Typing
 */
export interface PassageProgress {
	completionPercent: number;
	wordProgressById: Record<string, WordProgressKey>;
	totalWordCount: number;
	seenWordCount: number;
}

export interface DeckProgress {
	deckId: string;
	completionPercent: number;
	wordProgressCounts: DeckWordProgressCounts;
	passage?: PassageProgress;
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

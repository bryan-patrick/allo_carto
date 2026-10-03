import type { PassageSegment } from '@/src/components/CardDeck/cardDeckTypes';

/**
 * Get the learnable word IDs from a passage and remove duplicates.
 */
export function getPassageWordIds(passage: PassageSegment[]): string[] {
	let result: string[] = [];

	const wordIds = passage.flatMap(({ wordId, unlockExempt }) => {
		if (!wordId || unlockExempt) return [];
		else return [wordId];
	});

	result = [...new Set(wordIds)];

	return result;
}

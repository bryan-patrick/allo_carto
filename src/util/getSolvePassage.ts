import type { PassageSegment } from '@/src/components/CardDeck/cardDeckTypes';

/**
 * Typing
 */
export interface SolvePassageSegment extends PassageSegment {
	position: number;
}

/**
 * Give each passage word a puzzle position.
 * Keep elided words (such as d’) separate from the word that follows them.
 */
export function getSolvePassage(passage: PassageSegment[]): SolvePassageSegment[] {
	return passage.map((segment, position) => {
		return {
			...segment,
			position,
		};
	});
}

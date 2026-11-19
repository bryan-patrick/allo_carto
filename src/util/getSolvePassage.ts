import type { PassageSegment } from '@/src/components/CardDeck/cardDeckTypes';

/**
 * Typing
 */
export interface SolvePassageSegment extends PassageSegment {
	position: number;
}

/**
 * Gives each passage segment its own puzzle position.
 */
export function getSolvePassage(passage: PassageSegment[]): SolvePassageSegment[] {
	return passage.map((segment, position) => {
		return {
			...segment,
			position,
		};
	});
}

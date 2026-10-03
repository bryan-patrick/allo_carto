import type { CEFR } from '@/src/components/CardDeck/cardDeckTypes';

export function formatCEFRRange(levels: readonly CEFR[], separator = ' - '): string {
	if (levels.length === 0) return '';

	const first = levels[0];
	const last = levels[levels.length - 1];

	return first === last ? first : `${first}${separator}${last}`;
}

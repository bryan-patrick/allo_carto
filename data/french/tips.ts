import type { FrenchTip } from '@/src/components/Tips/tipTypes';

/**
 * Shared tips
 *
 * We only have one right now, the elision one.
 * We might have more in the future.
 */
export const elisionTip: FrenchTip = {
	id: 'french_elision',
	title: 'What is an elision?',
	description:
		'An elision is when a short French word drops its last vowel before a word that begins with a vowel or a silent h. An apostrophe replaces the missing letter.',
};

const frenchTips: FrenchTip[] = [elisionTip];

/**
 * Lists the tips available in the app.
 */
export function getAllTips(): FrenchTip[] {
	return [...frenchTips];
}

/**
 * Finds a tip by its ID.
 */
export function getTipById(tipId: string): FrenchTip | undefined {
	return frenchTips.find(tip => tip.id === tipId);
}

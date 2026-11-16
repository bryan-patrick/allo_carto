import type { FrenchTip } from '@/src/components/Tips/tipTypes';

/**
 * Shared French tips and their story draft references
 */
export const elisionTip: FrenchTip = {
	id: 'french_elision',
	title: 'What is an elision?',
	description:
		'An elision is when a short French word drops its last vowel before a word that begins with a vowel or a silent h. An apostrophe replaces the missing letter.',
};

export const introducingYourNameTip: FrenchTip = {
	id: 'french_introducing_your_name',
	draftTipId: 1,
	title: 'Introducing your name',
	description:
		"Je m'appelle is used when introducing your name. The expression literally means I me call (or I call myself).",
};

export const cityNamesTip: FrenchTip = {
	id: 'french_a_with_city_names',
	draftTipId: 2,
	title: 'À with city names',
	description: 'French uses à with city names when saying where someone lives.',
};

export const depanneurTip: FrenchTip = {
	id: 'french_depanneur_in_quebec',
	draftTipId: 3,
	title: 'Dépanneur in Québec',
	description: 'In Québec, dépanneur means convenience store.',
};

const frenchTips: FrenchTip[] = [elisionTip, introducingYourNameTip, cityNamesTip, depanneurTip];

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

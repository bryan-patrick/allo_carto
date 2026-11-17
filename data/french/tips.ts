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
	id: 'french_saying_your_name',
	draftTipId: 1,
	title: 'Saying your name',
	description:
		"Je m'appelle is used when saying your name. The expression literally means I me call (or I call myself).",
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

export const someWaterTip: FrenchTip = {
	id: 'french_de_leau',
	draftTipId: 4,
	title: "De l'eau",
	description:
		"De l'eau is a common French expression meaning some water. You'll see it often when people talk about drinking or having water.",
};

export const questionMarkerTip: FrenchTip = {
	id: 'french_questions_with_est_ce_que',
	draftTipId: 5,
	title: 'Questions with est-ce que',
	description:
		'Est-ce que is a phrase that is placed at the beginning of a statement to turn it into a question.',
};

export const cityExpressionsTip: FrenchTip = {
	id: 'french_dans_la_ville_and_en_ville',
	draftTipId: 6,
	title: 'Dans la ville and en ville',
	description:
		'Dans la ville means in the city, but en ville is another common expression that can also mean in the city or urban life.',
};

export const negationTip: FrenchTip = {
	id: 'french_ne_pas',
	draftTipId: 7,
	title: 'Negation with ne and pas',
	description: 'Ne and pas both surround a verb to make a statement negative.',
};

export const weatherTip: FrenchTip = {
	id: 'french_faire_for_weather',
	draftTipId: 8,
	title: 'Faire for weather and temperature',
	description:
		'French uses faire (fait) to describe weather conditions, such as temperature, and how warm or cold a place feels.',
};

export const morningTip: FrenchTip = {
	id: 'french_le_matin',
	draftTipId: 9,
	title: 'Le matin',
	description: 'Le matin is translated more closely to in the morning instead of just the morning.',
};

export const eveningTip: FrenchTip = {
	id: 'french_le_soir',
	draftTipId: 10,
	title: 'Le soir',
	description: 'Le soir is translated more closely to in the evening instead of just the evening.',
};

export const upToTip: FrenchTip = {
	id: 'french_jusquau',
	draftTipId: 11,
	title: "Jusqu'au",
	description:
		"Jusqu'au is an expression that means up to or all the way to. It's formed from jusque + à + le.",
};

export const napTip: FrenchTip = {
	id: 'french_faire_une_sieste',
	draftTipId: 12,
	title: 'Faire une sieste',
	description:
		'Faire une sieste means to take a nap. French uses faire (do) rather than prendre (take) in this expression.',
};

export const nearbyTip: FrenchTip = {
	id: 'french_du_coin',
	draftTipId: 13,
	title: 'Du coin',
	description:
		'Du coin means local or nearby. It does not necessarily refer to a literal street corner.',
};

export const comeAndGoTip: FrenchTip = {
	id: 'french_entrer_et_sortir',
	draftTipId: 14,
	title: 'Entrer et sortir',
	description: 'Entrer et sortir means to come and go, literally to enter and exit.',
};

export const indirectObjectTip: FrenchTip = {
	id: 'french_lui_before_the_verb',
	draftTipId: 15,
	title: 'Lui before the verb',
	description:
		'Lui is an indirect object pronoun meaning to him or to her. It normally appears before the verb.',
};

export const whileTip: FrenchTip = {
	id: 'french_pendant_que',
	draftTipId: 16,
	title: 'Pendant que',
	description:
		'Pendant que means while, but literally translates to during that. For example, je regarde pendant que je mange means I watch while I eat, but translates to I watch during that I eat.',
};

const frenchTips: FrenchTip[] = [
	elisionTip,
	introducingYourNameTip,
	cityNamesTip,
	depanneurTip,
	someWaterTip,
	questionMarkerTip,
	cityExpressionsTip,
	negationTip,
	weatherTip,
	morningTip,
	eveningTip,
	upToTip,
	napTip,
	nearbyTip,
	comeAndGoTip,
	indirectObjectTip,
	whileTip,
];

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

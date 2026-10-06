import { createCardDeck } from '@/src/util/createCardDeck';

export const DeckWelcomeToAlloCarto = createCardDeck({
	id: 'deck__welcome_to_allo_carto',
	title: 'Welcome to Allô Carto',
	description: 'Meet Allô Carto and learn French through stories.',
	chapter: 'What is this?',
	CEFR: ['A1', 'A2'],
	words: [],
	wordChoices: [],
	englishPassage: 'Welcome to Allô Carto!\n\nThis is an app for learning French through stories.',
	passage: [
		{ text: 'Bienvenue', wordId: 'word_interjection_bienvenue' },
		{ text: 'à', wordId: 'word_preposition_a' },
		{ text: 'Allô Carto', unlockExempt: true, after: '!\n\n' },
		{ text: 'C’', wordId: 'word_pronoun_ce', after: '' },
		{ text: 'est', wordId: 'word_auxiliary_est' },
		{ text: 'une', wordId: 'word_article_une' },
		{ text: 'application', wordId: 'word_noun_application' },
		{ text: 'pour', wordId: 'word_preposition_pour' },
		{ text: 'apprendre', wordId: 'word_verb_apprendre' },
		{ text: 'le', wordId: 'word_article_le' },
		{ text: 'français', wordId: 'word_noun_francais' },
		{ text: 'avec', wordId: 'word_preposition_avec' },
		{ text: 'des', wordId: 'word_article_des' },
		{ text: 'histoires', wordId: 'word_noun_histoires', after: '.' },
	],
});

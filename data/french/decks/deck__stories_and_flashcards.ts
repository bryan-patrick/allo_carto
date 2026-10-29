import { createCardDeck } from '@/src/util/createCardDeck';

export const DeckStoriesAndFlashcards = createCardDeck({
	id: 'deck__stories_and_flashcards',
	requiredLevel: 3,
	title: 'Stories and Flashcards',
	description: 'Discover how stories and flashcards help you learn French.',
	chapter: 'What is this?',
	CEFR: ['A1', 'A2', 'B1'],
	unlockRequirements: [{ id: 'deck__welcome_to_allo_carto', requiredWordProgress: 'new' }],
	words: [],
	wordChoices: [],
	englishPassage:
		'The application uses stories and flash cards to make learning French easy. For example: “One winter Monday, Léo is wearing a knit hat.”',
	passage: [
		{ text: 'L’', wordId: 'word_article_la', after: '' },
		{ text: 'application', wordId: 'word_noun_application' },
		{ text: 'utilise', wordId: 'word_verb_utilise' },
		{ text: 'des', wordId: 'word_article_des' },
		{ text: 'histoires', wordId: 'word_noun_histoires' },
		{ text: 'et', wordId: 'word_conjunction_et' },
		{ text: 'des', wordId: 'word_article_des' },
		{ text: 'cartes-éclair', wordId: 'word_noun_cartes_eclair' },
		{ text: 'pour', wordId: 'word_preposition_pour' },
		{ text: 'rendre', wordId: 'word_verb_rendre' },
		{ text: 'l’', wordId: 'word_article_le', after: '' },
		{ text: 'apprentissage', wordId: 'word_noun_apprentissage' },
		{ text: 'du', wordId: 'word_preposition_du' },
		{ text: 'français', wordId: 'word_noun_francais' },
		{ text: 'plus', wordId: 'word_adverb_plus' },
		{
			text: 'facile',
			wordId: 'word_adjective_facile',
			after: '. ',
		},
		{
			text: 'Par exemple',
			wordId: 'word_expression_par_exemple',
			after: '\u00a0: «\u00a0',
		},
		{
			text: 'Un',
			wordId: 'word_article_un',
		},
		{
			text: 'lundi',
			wordId: 'word_noun_lundi',
		},
		{
			text: 'd’',
			wordId: 'word_preposition_de',
			after: '',
		},
		{
			text: 'hiver',
			wordId: 'word_noun_hiver',
			after: ', ',
		},
		{
			text: 'Léo',
			unlockExempt: true,
		},
		{
			text: 'porte',
			wordId: 'word_verb_porte',
		},
		{
			text: 'une',
			wordId: 'word_article_une',
		},
		{
			text: 'tuque',
			wordId: 'word_noun_tuque',
			after: '.\u00a0»',
		},
	],
});

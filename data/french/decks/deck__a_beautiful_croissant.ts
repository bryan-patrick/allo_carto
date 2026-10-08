import { createCardDeck } from '@/src/util/createCardDeck';

export const DeckABeautifulCroissant = createCardDeck({
	id: 'deck__a_beautiful_croissant',
	title: 'A Beautiful Croissant',
	description: 'A beautiful croissant appears on the card.',
	chapter: 'Un bon croissant',
	CEFR: ['A1', 'A2'],
	unlockRequirements: [{ id: 'deck__leo_is_hungry', requiredCompletionPercentage: 20 }],
	words: [],
	wordChoices: [],
	englishPassage: 'On the card, there is a beautiful croissant.',
	passage: [
		{ text: 'Sur', wordId: 'word_preposition_sur' },
		{ text: 'la', wordId: 'word_article_la' },
		{ text: 'carte', wordId: 'word_noun_carte', after: ', ' },
		{ text: 'il y a', wordId: 'word_expression_il_y_a' },
		{ text: 'un', wordId: 'word_article_un' },
		{ text: 'beau', wordId: 'word_adjective_beau' },
		{ text: 'croissant', wordId: 'word_noun_croissant', after: '.' },
	],
});

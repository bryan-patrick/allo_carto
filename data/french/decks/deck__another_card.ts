import { createCardDeck } from '@/src/util/createCardDeck';

export const DeckAnotherCard = createCardDeck({
	id: 'deck__another_card',
	title: 'Another Card',
	description: 'Léo finds a cheese card. Wallace says no.',
	chapter: 'Oh non !',
	CEFR: ['A1', 'A2'],
	unlockRequirements: [{ id: 'deck__its_paper', requiredCompletionPercentage: 20 }],
	words: [],
	wordChoices: [],
	englishPassage: 'Léo finds another card: cheese.\n\nWallace says, « No. »',
	passage: [
		{ text: 'Léo', unlockExempt: true },
		{ text: 'trouve', wordId: 'word_verb_trouve_present' },
		{ text: 'une', wordId: 'word_article_une' },
		{ text: 'autre', wordId: 'word_adjective_autre' },
		{ text: 'carte', wordId: 'word_noun_carte' },
		{ text: 'du', wordId: 'word_preposition_du' },
		{ text: 'fromage', wordId: 'word_noun_fromage', after: '.\n\n' },
		{ text: 'Wallace', unlockExempt: true },
		{ text: 'dit', wordId: 'word_verb_dit', after: ' : « ' },
		{ text: 'Non', wordId: 'word_adverb_non', after: '. »' },
	],
});

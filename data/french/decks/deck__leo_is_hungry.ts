import { createCardDeck } from '@/src/util/createCardDeck';

export const DeckLeoIsHungry = createCardDeck({
	id: 'deck__leo_is_hungry',
	title: 'Léo Is Hungry',
	description: 'Léo spots a card on the table.',
	chapter: 'Un bon croissant',
	CEFR: ['A1', 'A2'],
	words: [],
	wordChoices: [],
	englishPassage: 'Léo is hungry. He sees a card on the table.',
	passage: [
		{ text: 'Léo', unlockExempt: true },
		{ text: 'a', wordId: 'word_auxiliary_a' },
		{ text: 'faim', wordId: 'word_noun_faim', after: '. ' },
		{ text: 'Il', wordId: 'word_pronoun_il' },
		{ text: 'voit', wordId: 'word_verb_voit' },
		{ text: 'une', wordId: 'word_article_une' },
		{ text: 'carte', wordId: 'word_noun_carte' },
		{ text: 'sur', wordId: 'word_preposition_sur' },
		{ text: 'la', wordId: 'word_article_la' },
		{ text: 'table', wordId: 'word_noun_table', after: '.' },
	],
});

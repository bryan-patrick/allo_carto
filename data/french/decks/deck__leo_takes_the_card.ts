import { createCardDeck } from '@/src/util/createCardDeck';

export const DeckLeoTakesTheCard = createCardDeck({
	id: 'deck__leo_takes_the_card',
	title: 'Léo Takes the Card',
	description: 'While Wallace reads, Léo takes the card.',
	chapter: 'La cuisine',
	CEFR: ['A1', 'A2'],
	unlockRequirements: [{ id: 'deck__the_card_and_the_toaster', requiredCompletionPercentage: 20 }],
	words: [],
	wordChoices: [],
	englishPassage: 'Wallace is reading a book. Léo takes the card.',
	passage: [
		{ text: 'Wallace', unlockExempt: true },
		{ text: 'lit', wordId: 'word_verb_lit' },
		{ text: 'un', wordId: 'word_article_un' },
		{ text: 'livre', wordId: 'word_noun_livre', after: '. ' },
		{ text: 'Léo', unlockExempt: true },
		{ text: 'prend', wordId: 'word_verb_prend' },
		{ text: 'la', wordId: 'word_article_la' },
		{ text: 'carte', wordId: 'word_noun_carte', after: '.' },
	],
});

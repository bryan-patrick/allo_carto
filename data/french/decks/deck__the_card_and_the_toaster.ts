import { createCardDeck } from '@/src/util/createCardDeck';

export const DeckTheCardAndTheToaster = createCardDeck({
	id: 'deck__the_card_and_the_toaster',
	title: 'The Card and the Toaster',
	description: 'Léo looks from the card to the toaster.',
	chapter: 'Un bon croissant',
	CEFR: ['A1', 'A2'],
	unlockRequirements: [{ id: 'deck__a_beautiful_croissant', requiredCompletionPercentage: 20 }],
	words: [],
	wordChoices: [],
	englishPassage: 'Léo looks at the card. He also looks at the toaster.',
	passage: [
		{ text: 'Léo', unlockExempt: true },
		{ text: 'regarde', wordId: 'word_verb_regarde_present' },
		{ text: 'la', wordId: 'word_article_la' },
		{ text: 'carte', wordId: 'word_noun_carte', after: '. ' },
		{ text: 'Il', wordId: 'word_pronoun_il' },
		{ text: 'regarde', wordId: 'word_verb_regarde_present' },
		{ text: 'aussi', wordId: 'word_adverb_aussi' },
		{ text: 'le', wordId: 'word_article_le' },
		{ text: 'grille-pain', wordId: 'word_noun_grille_pain', after: '.' },
	],
});

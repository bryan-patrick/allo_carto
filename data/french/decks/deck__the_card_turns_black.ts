import { createCardDeck } from '@/src/util/createCardDeck';

export const DeckTheCardTurnsBlack = createCardDeck({
	id: 'deck__the_card_turns_black',
	title: 'The Card Turns Black',
	description: 'The toaster heats up and the card starts smoking.',
	chapter: 'La cuisine',
	CEFR: ['A1', 'A2'],
	unlockRequirements: [{ id: 'deck__a_card_in_the_toaster', requiredCompletionPercentage: 20 }],
	words: [],
	wordChoices: [],
	englishPassage: "The toaster heats up. The card turns black. It's smoking!",
	passage: [
		{ text: 'Le', wordId: 'word_article_le' },
		{ text: 'grille-pain', wordId: 'word_noun_grille_pain' },
		{ text: 'chauffe', wordId: 'word_verb_chauffe', after: '. ' },
		{ text: 'La', wordId: 'word_article_la' },
		{ text: 'carte', wordId: 'word_noun_carte' },
		{ text: 'devient', wordId: 'word_verb_devient' },
		{ text: 'noire', wordId: 'word_adjective_noire', after: '. ' },
		{ text: 'Ça', wordId: 'word_pronoun_ca' },
		{ text: 'fume', wordId: 'word_verb_fume', after: ' !' },
	],
});

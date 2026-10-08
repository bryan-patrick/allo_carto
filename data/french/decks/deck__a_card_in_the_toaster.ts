import { createCardDeck } from '@/src/util/createCardDeck';

export const DeckACardInTheToaster = createCardDeck({
	id: 'deck__a_card_in_the_toaster',
	title: 'A Card in the Toaster',
	description: 'Léo puts the card in the toaster.',
	chapter: 'La cuisine',
	CEFR: ['A1', 'A2'],
	unlockRequirements: [{ id: 'deck__leo_takes_the_card', requiredCompletionPercentage: 20 }],
	words: [],
	wordChoices: [],
	englishPassage: 'He puts the card in the toaster. Click!',
	passage: [
		{ text: 'Il', wordId: 'word_pronoun_il' },
		{ text: 'met', wordId: 'word_verb_met' },
		{ text: 'la', wordId: 'word_article_la' },
		{ text: 'carte', wordId: 'word_noun_carte' },
		{ text: 'dans', wordId: 'word_preposition_dans' },
		{ text: 'le', wordId: 'word_article_le' },
		{ text: 'grille-pain', wordId: 'word_noun_grille_pain', after: '. ' },
		{ text: 'Clic', wordId: 'word_interjection_clic', after: ' !' },
	],
});

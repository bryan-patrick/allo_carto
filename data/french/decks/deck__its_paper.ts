import { createCardDeck } from '@/src/util/createCardDeck';

export const DeckItsPaper = createCardDeck({
	id: 'deck__its_paper',
	title: 'It’s Paper',
	description: 'Wallace explains why the card is no good.',
	chapter: 'Oh non !',
	CEFR: ['A1', 'A2'],
	unlockRequirements: [
		{ id: 'deck__wallace_unplugs_the_toaster', requiredCompletionPercentage: 20 },
	],
	words: [],
	wordChoices: [],
	englishPassage: "« Léo, it's paper. It's not good! »",
	passage: [
		{ text: '« Léo', unlockExempt: true, after: ', ' },
		{ text: 'c’est', wordId: 'word_expression_cest' },
		{ text: 'du', wordId: 'word_article_du' },
		{ text: 'papier', wordId: 'word_noun_papier', after: '. ' },
		{ text: 'Ce', wordId: 'word_pronoun_ce' },
		{ text: 'n’est', wordId: 'word_expression_nest' },
		{ text: 'pas', wordId: 'word_adverb_pas' },
		{ text: 'bon', wordId: 'word_adjective_bon', after: ' ! »' },
	],
});

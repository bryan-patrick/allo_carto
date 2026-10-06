import { createCardDeck } from '@/src/util/createCardDeck';

export const DeckHaveFun = createCardDeck({
	id: 'deck__have_fun',
	title: 'Have Fun',
	description: 'Read stories, learn words, and have fun with Allô Carto.',
	chapter: 'Additional information',
	CEFR: ['A1', 'A2'],
	unlockRequirements: [{ id: 'deck__word_collections', requiredCompletionPercentage: 20 }],
	words: [],
	wordChoices: [],
	englishPassage:
		'That’s it!\n\nRead stories. Learn words. Build your collections.\n\nHave fun with Allô Carto!',
	passage: [
		{ text: 'C’', wordId: 'word_pronoun_ce', after: '' },
		{ text: 'est', wordId: 'word_auxiliary_est' },
		{ text: 'tout', wordId: 'word_pronoun_tout', after: '!\n\n' },
		{ text: 'Lis', wordId: 'word_verb_lis' },
		{ text: 'des', wordId: 'word_article_des' },
		{ text: 'histoires', wordId: 'word_noun_histoires', after: '. ' },
		{ text: 'Apprends', wordId: 'word_verb_apprends' },
		{ text: 'des', wordId: 'word_article_des' },
		{ text: 'mots', wordId: 'word_noun_mots', after: '. ' },
		{ text: 'Complète', wordId: 'word_verb_complete' },
		{ text: 'tes', wordId: 'word_determiner_tes' },
		{ text: 'collections', wordId: 'word_noun_collections', after: '.\n\n' },
		{ text: 'Amuse', wordId: 'word_verb_amuse' },
		{ text: 'toi', wordId: 'word_pronoun_toi' },
		{ text: 'avec', wordId: 'word_preposition_avec' },
		{ text: 'Allô Carto', unlockExempt: true, after: '!' },
	],
});

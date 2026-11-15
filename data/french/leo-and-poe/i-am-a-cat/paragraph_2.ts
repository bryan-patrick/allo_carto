import { createParagraph } from '@/src/util/createParagraph';

export const paragraph2 = createParagraph({
	id: 'deck__where_i_live',
	description: 'Leo describes his home in Québec City and the nearby bakery.',
	CEFR: ['A1', 'A2'],
	englishPassage:
		'I live in Quebec City close to a convenience store and a bakery. A nice man works there.',
	passage: [
		{
			text: 'J’',
			wordId: 'word_pronoun_je',
			after: '',
		},
		{
			text: 'habite',
			wordId: 'word_verb_habite',
		},
		{
			text: 'à',
			wordId: 'word_preposition_a',
			canonicalEnglish: 'in',
		},
		{
			text: 'Québec',
			unlockExempt: true,
			after: ', ',
		},
		{
			text: 'près',
			wordId: 'word_adverb_pres',
		},
		{
			text: 'd’',
			wordId: 'word_preposition_de',
			after: '',
		},
		{
			text: 'un',
			wordId: 'word_article_un',
		},
		{
			text: 'dépanneur',
			wordId: 'word_noun_depanneur',
		},
		{
			text: 'et',
			wordId: 'word_conjunction_et',
		},
		{
			text: 'd’',
			wordId: 'word_preposition_de',
			after: '',
		},
		{
			text: 'une',
			wordId: 'word_article_une',
		},
		{
			text: 'boulangerie',
			wordId: 'word_noun_boulangerie',
			after: '. ',
		},
		{
			text: 'Un',
			wordId: 'word_article_un',
		},
		{
			text: 'gentil',
			wordId: 'word_adjective_gentil',
		},
		{
			text: 'homme',
			wordId: 'word_noun_homme',
		},
		{
			text: 'travaille',
			wordId: 'word_verb_travaille',
		},
		{
			text: 'à',
			wordId: 'word_preposition_a',
			canonicalEnglish: 'at',
		},
		{
			text: 'la',
			wordId: 'word_article_la',
		},
		{
			text: 'boulangerie',
			wordId: 'word_noun_boulangerie',
			after: '.',
		},
	],
});

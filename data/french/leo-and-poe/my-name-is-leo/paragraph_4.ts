import { createParagraph } from '@/src/util/createParagraph';

export const paragraph4 = createParagraph({
	id: 'deck__life_in_the_city',
	description: 'Léo walks to the park and sleeps in his favorite tree.',
	CEFR: ['A1'],
	englishPassage: 'I like warm days. I walk to the park. I sleep in my favorite tree.',
	passage: [
		{
			text: 'J’aime',
			wordId: 'word_expression_j_aime',
		},
		{
			text: 'les',
			wordId: 'word_article_les',
		},
		{
			text: 'jours',
			wordId: 'word_noun_jours',
		},
		{
			text: 'chauds',
			wordId: 'word_adjective_chauds',
			after: '. ',
		},
		{
			text: 'Je',
			wordId: 'word_pronoun_je',
		},
		{
			text: 'vais',
			wordId: 'word_verb_vais',
		},
		{
			text: 'au',
			wordId: 'word_preposition_au',
		},
		{
			text: 'parc',
			wordId: 'word_noun_parc',
		},
		{
			text: 'à',
			wordId: 'word_preposition_a',
			canonicalEnglish: ['on'],
		},
		{
			text: 'pied',
			wordId: 'word_noun_pied',
			after: '. ',
		},
		{
			text: 'Je',
			wordId: 'word_pronoun_je',
		},
		{
			text: 'dors',
			wordId: 'word_verb_dors',
		},
		{
			text: 'dans',
			wordId: 'word_preposition_dans',
		},
		{
			text: 'mon',
			wordId: 'word_determiner_mon',
		},
		{
			text: 'arbre',
			wordId: 'word_noun_arbre',
		},
		{
			text: 'préféré',
			wordId: 'word_adjective_prefere',
			after: '.',
		},
	],
});

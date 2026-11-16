import { createParagraph } from '@/src/util/createParagraph';

export const paragraph3 = createParagraph({
	id: 'deck__a_cats_life',
	description: 'Leo describes his meals and considers whether city life is easy for a cat.',
	CEFR: ['A1', 'A2'],
	englishPassage:
		'Every day he gives me bread to eat and water to drink. Is it easy to be a cat and live in the city? For me, yes and no.',
	passage: [
		{
			text: 'Tous',
			wordId: 'word_determiner_tous',
		},
		{
			text: 'les',
			wordId: 'word_article_les',
		},
		{
			text: 'jours',
			wordId: 'word_noun_jours',
			after: ', ',
		},
		{
			text: 'il',
			wordId: 'word_pronoun_il',
		},
		{
			text: 'me',
			wordId: 'word_pronoun_me',
		},
		{
			text: 'donne',
			wordId: 'word_verb_donne',
		},
		{
			text: 'du',
			wordId: 'word_article_du',
		},
		{
			text: 'pain',
			wordId: 'word_noun_pain',
		},
		{
			text: 'à',
			wordId: 'word_preposition_a',
		},
		{
			text: 'manger',
			wordId: 'word_verb_manger',
		},
		{
			text: 'et',
			wordId: 'word_conjunction_et',
		},
		/**
		 * Together, de l’ means “some” here, but l’eau stays on one beginner flashcard.
		 */
		{
			text: 'de',
			wordId: 'word_preposition_de',
			canonicalEnglish: 'some',
		},
		{
			text: 'l’eau',
			wordId: 'word_noun_eau',
		},
		{
			text: 'à',
			wordId: 'word_preposition_a',
		},
		{
			text: 'boire',
			wordId: 'word_verb_boire',
			after: '. ',
		},
		{
			text: 'Est',
			wordId: 'word_auxiliary_est',
			after: '-',
		},
		{
			text: 'ce',
			wordId: 'word_pronoun_ce',
		},
		{
			text: 'que',
			wordId: 'word_conjunction_que',
		},
		{
			text: 'c’est',
			wordId: 'word_expression_cest',
		},
		{
			text: 'facile',
			wordId: 'word_adjective_facile',
		},
		{
			text: 'd’',
			wordId: 'word_preposition_de',
			canonicalEnglish: 'to',
			after: '',
		},
		{
			text: 'être',
			wordId: 'word_verb_etre',
		},
		{
			text: 'un',
			wordId: 'word_article_un',
		},
		{
			text: 'chat',
			wordId: 'word_noun_chat',
		},
		{
			text: 'et',
			wordId: 'word_conjunction_et',
		},
		{
			text: 'de',
			wordId: 'word_preposition_de',
			canonicalEnglish: 'to',
		},
		{
			text: 'vivre',
			wordId: 'word_verb_vivre',
		},
		{
			text: 'en',
			wordId: 'word_preposition_en',
		},
		{
			text: 'ville',
			wordId: 'word_noun_ville',
			after: '? ',
		},
		{
			text: 'Pour',
			wordId: 'word_preposition_pour',
		},
		{
			text: 'moi',
			wordId: 'word_pronoun_moi',
			after: ', ',
		},
		{
			text: 'oui',
			wordId: 'word_adverb_oui',
		},
		{
			text: 'et',
			wordId: 'word_conjunction_et',
		},
		{
			text: 'non',
			wordId: 'word_adverb_non',
			after: '.',
		},
	],
});

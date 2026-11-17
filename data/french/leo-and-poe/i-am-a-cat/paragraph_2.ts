import { cityNamesTip, depanneurTip } from '@/data/french/tips';
import { createParagraph } from '@/src/util/createParagraph';

export const paragraph2 = createParagraph({
	id: 'deck__where_i_live',
	description: 'Leo describes where he lives and how much he likes the city.',
	CEFR: ['A1', 'A2'],
	englishPassage:
		'I live in Quebec City, near a convenience store and a bakery. It is very beautiful here. I like the city a lot.',
	passage: [
		{
			text: 'J’',
			wordId: 'word_pronoun_je_elision',
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
			tipId: cityNamesTip.id,
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
			wordId: 'word_preposition_de_elision',
			after: '',
		},
		{
			text: 'un',
			wordId: 'word_article_un',
		},
		{
			text: 'dépanneur',
			wordId: 'word_noun_depanneur',
			tipId: depanneurTip.id,
		},
		{
			text: 'et',
			wordId: 'word_conjunction_et',
		},
		{
			text: 'd’',
			wordId: 'word_preposition_de_elision',
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
			text: 'C’',
			wordId: 'word_pronoun_ce_elision',
			after: '',
		},
		{
			text: 'est',
			wordId: 'word_auxiliary_est',
		},
		{
			text: 'très',
			wordId: 'word_adverb_tres',
		},
		{
			text: 'beau',
			wordId: 'word_adjective_beau',
		},
		{
			text: 'ici',
			wordId: 'word_adverb_ici',
			after: '. ',
		},
		{
			text: 'J’',
			wordId: 'word_pronoun_je_elision',
			after: '',
		},
		{
			text: 'aime',
			wordId: 'word_verb_aime',
		},
		{
			text: 'beaucoup',
			wordId: 'word_adverb_beaucoup',
		},
		{
			text: 'la',
			wordId: 'word_article_la',
		},
		{
			text: 'ville',
			wordId: 'word_noun_ville',
			after: '.',
		},
	],
});

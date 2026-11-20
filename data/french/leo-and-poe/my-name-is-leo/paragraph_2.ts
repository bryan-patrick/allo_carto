import { cityNamesTip, nearAPlaceTip } from '@/data/french/tips';
import { createParagraph } from '@/src/util/createParagraph';

export const paragraph2 = createParagraph({
	id: 'deck__where_i_live',
	description: 'Léo describes his city and the nearby park.',
	CEFR: ['A1'],
	englishPassage: 'I live in Québec City. The city is beautiful. I live near a park.',
	passage: [
		{
			text: 'J’habite',
			wordId: 'word_expression_j_habite',
		},
		{
			text: 'à',
			wordId: 'word_preposition_a',
			canonicalEnglish: ['in'],
			tipId: cityNamesTip.id,
		},
		{
			text: 'Québec',
			unlockExempt: true,
			after: '. ',
		},
		{
			text: 'La',
			wordId: 'word_article_la',
		},
		{
			text: 'ville',
			wordId: 'word_noun_ville',
		},
		{
			text: 'est',
			wordId: 'word_auxiliary_est',
		},
		{
			text: 'belle',
			wordId: 'word_adjective_belle',
			after: '. ',
		},
		{
			text: 'J’habite',
			wordId: 'word_expression_j_habite',
		},
		{
			text: 'près',
			wordId: 'word_adverb_pres',
			tipId: nearAPlaceTip.id,
		},
		{
			text: 'd’un',
			wordId: 'word_preposition_d_un',
			tipId: nearAPlaceTip.id,
		},
		{
			text: 'parc',
			wordId: 'word_noun_parc',
			after: '.',
		},
	],
});

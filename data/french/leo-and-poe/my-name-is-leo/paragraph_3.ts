import { weatherTip } from '@/data/french/tips';
import { createParagraph } from '@/src/util/createParagraph';

export const paragraph3 = createParagraph({
	id: 'deck__a_cats_life',
	description: 'Léo enjoys warm weather before tomorrow’s snow.',
	CEFR: ['A1'],
	englishPassage: 'Today is Monday. It is warm outside. Snow is coming tomorrow.',
	passage: [
		{
			text: 'Aujourd’hui',
			wordId: 'word_adverb_aujourdhui',
			after: ', ',
		},
		{
			text: 'c’est',
			wordId: 'word_expression_cest',
		},
		{
			text: 'lundi',
			wordId: 'word_noun_lundi',
			after: '. ',
		},
		{
			text: 'Il',
			wordId: 'word_pronoun_il',
		},
		{
			text: 'fait',
			wordId: 'word_verb_fait',
			tipId: weatherTip.id,
		},
		{
			text: 'chaud',
			wordId: 'word_adjective_chaud',
			tipId: weatherTip.id,
		},
		{
			text: 'dehors',
			wordId: 'word_adverb_dehors',
			after: '. ',
		},
		{
			text: 'La',
			wordId: 'word_article_la',
		},
		{
			text: 'neige',
			wordId: 'word_noun_neige',
		},
		{
			text: 'arrive',
			wordId: 'word_verb_arrive',
		},
		{
			text: 'demain',
			wordId: 'word_adverb_demain',
			after: '.',
		},
	],
});

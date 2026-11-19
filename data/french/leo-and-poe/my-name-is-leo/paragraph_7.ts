import { napTip } from '@/data/french/tips';
import { createParagraph } from '@/src/util/createParagraph';

export const paragraph7 = createParagraph({
	id: 'leo-and-poe-chapter-1-paragraph-7',
	description: 'Léo climbs his tree and takes a long nap.',
	CEFR: ['A1', 'A2'],
	englishPassage: 'I find my tree. I climb slowly. I listen to my bird friends. I take a long nap.',
	passage: [
		{
			text: 'Je',
			wordId: 'word_pronoun_je',
		},
		{
			text: 'trouve',
			wordId: 'word_verb_trouve_present',
		},
		{
			text: 'mon',
			wordId: 'word_determiner_mon',
		},
		{
			text: 'arbre',
			wordId: 'word_noun_arbre',
			after: '. ',
		},
		{
			text: 'Je',
			wordId: 'word_pronoun_je',
		},
		{
			text: 'grimpe',
			wordId: 'word_verb_grimpe',
		},
		{
			text: 'lentement',
			wordId: 'word_adverb_lentement',
			after: '. ',
		},
		{
			text: 'J’écoute',
			wordId: 'word_expression_j_ecoute',
		},
		{
			text: 'mes',
			wordId: 'word_determiner_mes',
		},
		{
			text: 'amis',
			wordId: 'word_noun_amis',
			after: ', ',
		},
		{
			text: 'les',
			wordId: 'word_article_les',
		},
		{
			text: 'oiseaux',
			wordId: 'word_noun_oiseaux',
			after: '. ',
		},
		{
			text: 'Je',
			wordId: 'word_pronoun_je',
		},
		{
			text: 'fais',
			wordId: 'word_verb_fais',
			tipId: napTip.id,
		},
		{
			text: 'une',
			wordId: 'word_article_une',
			tipId: napTip.id,
		},
		{
			text: 'longue',
			wordId: 'word_adjective_longue',
		},
		{
			text: 'sieste',
			wordId: 'word_noun_sieste',
			tipId: napTip.id,
			after: '.',
		},
	],
});

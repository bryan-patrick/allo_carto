import { napTip } from '@/data/french/tips';
import { createParagraph } from '@/src/util/createParagraph';

export const paragraph6 = createParagraph({
	id: 'leo-and-poe-chapter-1-paragraph-6',
	description: 'Leo plays at the park and naps in his favorite tree.',
	CEFR: ['A1', 'A2'],
	englishPassage:
		'At the park, I play in the grass or sometimes the snow. Then, I nap in my favorite tree. The sun is warm and good for naps. Cats like to sleep a lot.',
	passage: [
		{
			text: 'Au',
			wordId: 'word_preposition_au',
			canonicalEnglish: 'at the',
		},
		{
			text: 'parc',
			wordId: 'word_noun_parc',
			after: ', ',
		},
		{
			text: 'je',
			wordId: 'word_pronoun_je',
		},
		{
			text: 'joue',
			wordId: 'word_verb_joue',
		},
		{
			text: 'dans',
			wordId: 'word_preposition_dans',
		},
		{
			text: 'l’',
			wordId: 'word_article_la_elision',
			after: '',
		},
		{
			text: 'herbe',
			wordId: 'word_noun_herbe',
		},
		{
			text: 'ou',
			wordId: 'word_conjunction_ou',
		},
		{
			text: 'parfois',
			wordId: 'word_adverb_parfois',
		},
		{
			text: 'dans',
			wordId: 'word_preposition_dans',
		},
		{
			text: 'la',
			wordId: 'word_article_la',
		},
		{
			text: 'neige',
			wordId: 'word_noun_neige',
			after: '. ',
		},
		{
			text: 'Ensuite',
			wordId: 'word_adverb_ensuite',
			after: ', ',
		},
		{
			text: 'je',
			wordId: 'word_pronoun_je',
		},
		{
			text: 'fais',
			wordId: 'word_verb_fais',
			canonicalEnglish: 'take',
			tipId: napTip.id,
		},
		{
			text: 'une',
			wordId: 'word_article_une',
			tipId: napTip.id,
		},
		{
			text: 'sieste',
			wordId: 'word_noun_sieste',
			tipId: napTip.id,
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
			after: '. ',
		},
		{
			text: 'Le',
			wordId: 'word_article_le',
		},
		{
			text: 'soleil',
			wordId: 'word_noun_soleil',
		},
		{
			text: 'est',
			wordId: 'word_auxiliary_est',
		},
		{
			text: 'bien',
			wordId: 'word_adverb_bien',
			canonicalEnglish: 'quite',
		},
		{
			text: 'chaud',
			wordId: 'word_adjective_chaud',
		},
		{
			text: 'et',
			wordId: 'word_conjunction_et',
		},
		{
			text: 'c’',
			wordId: 'word_pronoun_ce_elision',
			after: '',
		},
		{
			text: 'est',
			wordId: 'word_auxiliary_est',
		},
		{
			text: 'parfait',
			wordId: 'word_adjective_parfait',
		},
		{
			text: 'pour',
			wordId: 'word_preposition_pour',
		},
		{
			text: 'faire',
			wordId: 'word_verb_faire',
			canonicalEnglish: ['take', 'taking'],
			tipId: napTip.id,
		},
		{
			text: 'une',
			wordId: 'word_article_une',
			tipId: napTip.id,
		},
		{
			text: 'sieste',
			wordId: 'word_noun_sieste',
			tipId: napTip.id,
			after: '. ',
		},
		{
			text: 'Les',
			wordId: 'word_article_les',
		},
		{
			text: 'chats',
			wordId: 'word_noun_chats',
		},
		{
			text: 'aiment',
			wordId: 'word_verb_aiment',
		},
		{
			text: 'beaucoup',
			wordId: 'word_adverb_beaucoup',
			canonicalEnglish: 'a lot',
		},
		{
			text: 'dormir',
			wordId: 'word_verb_dormir',
			after: '.',
		},
	],
});

import { morningTip, upToTip } from '@/data/french/tips';
import { createParagraph } from '@/src/util/createParagraph';

export const paragraph5 = createParagraph({
	id: 'leo-and-poe-chapter-1-paragraph-5',
	description: 'Leo walks to the park and chases birds on the way.',
	CEFR: ['A1', 'A2'],
	englishPassage:
		'In the morning, I walk to the park. I see a lot of birds on my way. One, two, three, four birds today. I chase them but they fly away. Birds are fast!',
	passage: [
		{
			text: 'Le',
			wordId: 'word_article_le',
			tipId: morningTip.id,
		},
		{
			text: 'matin',
			wordId: 'word_noun_matin',
			tipId: morningTip.id,
			after: ', ',
		},
		{
			text: 'je',
			wordId: 'word_pronoun_je',
		},
		{
			text: 'marche',
			wordId: 'word_verb_marche',
		},
		{
			text: 'jusqu’',
			wordId: 'word_preposition_jusque_elision',
			tipId: upToTip.id,
			after: '',
		},
		{
			text: 'au',
			wordId: 'word_preposition_au',
			canonicalEnglish: 'to the',
			tipId: upToTip.id,
		},
		{
			text: 'parc',
			wordId: 'word_noun_parc',
			after: '. ',
		},
		{
			text: 'Je',
			wordId: 'word_pronoun_je',
		},
		{
			text: 'vois',
			wordId: 'word_verb_vois',
		},
		{
			text: 'beaucoup',
			wordId: 'word_adverb_beaucoup',
			canonicalEnglish: 'a lot',
		},
		{
			text: 'd’',
			wordId: 'word_preposition_de_elision',
			after: '',
		},
		{
			text: 'oiseaux',
			wordId: 'word_noun_oiseaux',
		},
		{
			text: 'en',
			wordId: 'word_preposition_en',
			canonicalEnglish: 'on',
		},
		{
			text: 'chemin',
			wordId: 'word_noun_chemin',
			after: '. ',
		},
		{
			text: 'Un',
			wordId: 'word_numeral_un',
			after: ', ',
		},
		{
			text: 'deux',
			wordId: 'word_numeral_deux',
			after: ', ',
		},
		{
			text: 'trois',
			wordId: 'word_numeral_trois',
			after: ', ',
		},
		{
			text: 'quatre',
			wordId: 'word_numeral_quatre',
		},
		{
			text: 'oiseaux',
			wordId: 'word_noun_oiseaux',
		},
		{
			text: 'aujourd’hui',
			wordId: 'word_adverb_aujourdhui',
			after: '. ',
		},
		{
			text: 'Je',
			wordId: 'word_pronoun_je',
		},
		{
			text: 'cours',
			wordId: 'word_verb_cours',
		},
		{
			text: 'après',
			wordId: 'word_preposition_apres',
		},
		{
			text: 'eux',
			wordId: 'word_pronoun_eux',
			after: ', ',
		},
		{
			text: 'mais',
			wordId: 'word_conjunction_mais',
		},
		{
			text: 'ils',
			wordId: 'word_pronoun_ils',
		},
		{
			text: 's’',
			wordId: 'word_pronoun_se_elision',
			after: '',
		},
		{
			text: 'envolent',
			wordId: 'word_verb_envolent',
			after: '. ',
		},
		{
			text: 'Les',
			wordId: 'word_article_les',
		},
		{
			text: 'oiseaux',
			wordId: 'word_noun_oiseaux',
		},
		{
			text: 'sont',
			wordId: 'word_auxiliary_sont',
		},
		{
			text: 'rapides',
			wordId: 'word_adjective_rapides',
			after: '!',
		},
	],
});

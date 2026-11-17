import {
	comeAndGoTip,
	depanneurTip,
	eveningTip,
	indirectObjectTip,
	napTip,
	nearbyTip,
	negationTip,
	weatherTip,
	whileTip,
} from '@/data/french/tips';
import { createParagraph } from '@/src/util/createParagraph';

export const paragraph7 = createParagraph({
	id: 'leo-and-poe-chapter-1-paragraph-7',
	description: 'Leo spends the evening at the nearby convenience store.',
	CEFR: ['A1', 'A2'],
	englishPassage:
		'In the evening, I go to the nearby convenience store. It is warm inside and is open all night. I watch people come and go while I nap. The man who works there doesn\'t mind. I tell him, "Thank you!" But I am a cat so he hears, "meow."',
	passage: [
		{
			text: 'Le',
			wordId: 'word_article_le',
			tipId: eveningTip.id,
		},
		{
			text: 'soir',
			wordId: 'word_noun_soir',
			tipId: eveningTip.id,
			after: ', ',
		},
		{
			text: 'je',
			wordId: 'word_pronoun_je',
		},
		{
			text: 'vais',
			wordId: 'word_verb_vais',
		},
		{
			text: 'au',
			wordId: 'word_preposition_au',
			canonicalEnglish: 'to the',
		},
		{
			text: 'dépanneur',
			wordId: 'word_noun_depanneur',
			tipId: depanneurTip.id,
		},
		{
			text: 'du',
			wordId: 'word_preposition_du',
			tipId: nearbyTip.id,
		},
		{
			text: 'coin',
			wordId: 'word_noun_coin',
			tipId: nearbyTip.id,
			after: '. ',
		},
		{
			text: 'Il',
			wordId: 'word_pronoun_il',
			canonicalEnglish: 'it',
		},
		{
			text: 'fait',
			wordId: 'word_verb_fait',
			canonicalEnglish: 'is',
			tipId: weatherTip.id,
		},
		{
			text: 'chaud',
			wordId: 'word_adjective_chaud',
		},
		{
			text: 'à',
			wordId: 'word_preposition_a',
			canonicalEnglish: 'in',
		},
		{
			text: 'l’',
			wordId: 'word_article_le_elision',
			after: '',
		},
		{
			text: 'intérieur',
			wordId: 'word_noun_interieur',
		},
		{
			text: 'et',
			wordId: 'word_conjunction_et',
		},
		{
			text: 'il',
			wordId: 'word_pronoun_il',
			canonicalEnglish: 'it',
		},
		{
			text: 'est',
			wordId: 'word_auxiliary_est',
		},
		{
			text: 'ouvert',
			wordId: 'word_adjective_ouvert',
		},
		{
			text: 'toute',
			wordId: 'word_determiner_toute',
		},
		{
			text: 'la',
			wordId: 'word_article_la',
		},
		{
			text: 'nuit',
			wordId: 'word_noun_nuit',
			after: '. ',
		},
		{
			text: 'Je',
			wordId: 'word_pronoun_je',
		},
		{
			text: 'regarde',
			wordId: 'word_verb_regarde',
		},
		{
			text: 'les',
			wordId: 'word_article_les',
		},
		{
			text: 'gens',
			wordId: 'word_noun_gens',
		},
		{
			text: 'entrer',
			wordId: 'word_verb_entrer',
			tipId: comeAndGoTip.id,
		},
		{
			text: 'et',
			wordId: 'word_conjunction_et',
			tipId: comeAndGoTip.id,
		},
		{
			text: 'sortir',
			wordId: 'word_verb_sortir',
			tipId: comeAndGoTip.id,
		},
		{
			text: 'pendant',
			wordId: 'word_preposition_pendant',
			tipId: whileTip.id,
		},
		{
			text: 'que',
			wordId: 'word_conjunction_que',
			tipId: whileTip.id,
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
			after: '. ',
		},
		{
			text: 'Ça',
			wordId: 'word_pronoun_ca',
			canonicalEnglish: 'that',
		},
		{
			text: 'ne',
			wordId: 'word_adverb_ne',
			tipId: negationTip.id,
		},
		{
			text: 'dérange',
			wordId: 'word_verb_derange',
		},
		{
			text: 'pas',
			wordId: 'word_adverb_pas',
			tipId: negationTip.id,
		},
		{
			text: 'l’',
			wordId: 'word_article_le_elision',
			after: '',
		},
		{
			text: 'homme',
			wordId: 'word_noun_homme',
		},
		{
			text: 'qui',
			wordId: 'word_pronoun_qui',
		},
		{
			text: 'travaille',
			wordId: 'word_verb_travaille',
		},
		{
			text: 'là',
			wordId: 'word_adverb_la',
			after: '. ',
		},
		{
			text: 'Je',
			wordId: 'word_pronoun_je',
		},
		{
			text: 'lui',
			wordId: 'word_pronoun_lui',
			tipId: indirectObjectTip.id,
		},
		{
			text: 'dis',
			wordId: 'word_verb_dis',
			after: ' : « ',
		},
		{
			text: 'Merci',
			wordId: 'word_interjection_merci',
			after: '! » ',
		},
		{
			text: 'Mais',
			wordId: 'word_conjunction_mais',
		},
		{
			text: 'je',
			wordId: 'word_pronoun_je',
		},
		{
			text: 'suis',
			wordId: 'word_auxiliary_suis',
		},
		{
			text: 'un',
			wordId: 'word_article_un',
		},
		{
			text: 'chat',
			wordId: 'word_noun_chat',
			after: ', ',
		},
		{
			text: 'alors',
			wordId: 'word_conjunction_alors',
		},
		{
			text: 'il',
			wordId: 'word_pronoun_il',
		},
		{
			text: 'entend',
			wordId: 'word_verb_entend',
			after: ' : « ',
		},
		{
			text: 'Miaou',
			wordId: 'word_interjection_miaou',
			after: '. »',
		},
	],
});

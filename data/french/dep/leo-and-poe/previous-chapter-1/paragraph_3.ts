import { meBeforeTheVerbTip, someWaterTip } from '@/data/french/tips';
import { createParagraph } from '@/src/util/createParagraph';

export const paragraph3 = createParagraph({
	id: 'deck__a_cats_life',
	description: 'Leo meets a kind man at the bakery and asks for a croissant.',
	CEFR: ['A1', 'A2'],
	englishPassage:
		'A nice man works at the bakery. He likes to give me food to eat and water to drink. I say, "Can I have a croissant?" But I am a cat so he hears, "meow".',
	passage: [
		{
			text: 'Un',
			wordId: 'word_article_un',
		},
		{
			text: 'homme',
			wordId: 'word_noun_homme',
		},
		{
			text: 'gentil',
			wordId: 'word_adjective_gentil',
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
			after: '. ',
		},
		{
			text: 'Il',
			wordId: 'word_pronoun_il',
		},
		{
			text: 'aime',
			wordId: 'word_verb_aime',
			canonicalEnglish: ['likes', 'loves'],
		},
		{
			text: 'me',
			wordId: 'word_pronoun_me',
			canonicalEnglish: 'me',
			tipId: meBeforeTheVerbTip.id,
		},
		{
			text: 'donner',
			wordId: 'word_verb_donner',
			tipId: meBeforeTheVerbTip.id,
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
		{
			text: 'de',
			wordId: 'word_preposition_de',
			canonicalEnglish: 'some',
			tipId: someWaterTip.id,
		},
		{
			text: 'l’',
			wordId: 'word_article_la_elision',
			tipId: someWaterTip.id,
			after: '',
		},
		{
			text: 'eau',
			wordId: 'word_noun_eau',
			tipId: someWaterTip.id,
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
			text: 'Je',
			wordId: 'word_pronoun_je',
		},
		{
			text: 'dis',
			wordId: 'word_verb_dis',
			after: ' : « ',
		},
		{
			text: 'Je',
			wordId: 'word_pronoun_je',
		},
		{
			text: 'peux',
			wordId: 'word_verb_peux',
		},
		{
			text: 'avoir',
			wordId: 'word_verb_avoir',
		},
		{
			text: 'un',
			wordId: 'word_article_un',
		},
		{
			text: 'croissant',
			wordId: 'word_noun_croissant',
			after: '? » ',
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
			text: 'miaou',
			wordId: 'word_interjection_miaou',
			after: ' ».',
		},
	],
});

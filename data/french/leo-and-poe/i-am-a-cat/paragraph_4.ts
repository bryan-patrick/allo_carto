import { cityExpressionsTip, negationTip, questionMarkerTip, weatherTip } from '@/data/french/tips';
import { createParagraph } from '@/src/util/createParagraph';

export const paragraph4 = createParagraph({
	id: 'deck__life_in_the_city',
	description: 'Leo considers the fun and dangers of being a cat in the city.',
	CEFR: ['A1', 'A2'],
	englishPassage:
		'Is it easy to be a cat in the city? I do not know. For me, yes and no. It is fun, but it is also very dangerous for a cat. It is very cold here.',
	passage: [
		{
			text: 'Est',
			wordId: 'word_auxiliary_est',
			tipId: questionMarkerTip.id,
			after: '-',
		},
		{
			text: 'ce',
			wordId: 'word_pronoun_ce',
			tipId: questionMarkerTip.id,
		},
		{
			text: 'que',
			wordId: 'word_conjunction_que',
			tipId: questionMarkerTip.id,
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
			text: 'facile',
			wordId: 'word_adjective_facile',
		},
		{
			text: 'd’',
			wordId: 'word_preposition_de_elision',
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
			text: 'dans',
			wordId: 'word_preposition_dans',
			tipId: cityExpressionsTip.id,
		},
		{
			text: 'la',
			wordId: 'word_article_la',
			tipId: cityExpressionsTip.id,
		},
		{
			text: 'ville',
			wordId: 'word_noun_ville',
			tipId: cityExpressionsTip.id,
			after: '? ',
		},
		{
			text: 'Je',
			wordId: 'word_pronoun_je',
		},
		{
			text: 'ne',
			wordId: 'word_adverb_ne',
			tipId: negationTip.id,
		},
		{
			text: 'sais',
			wordId: 'word_verb_sais',
		},
		{
			text: 'pas',
			wordId: 'word_adverb_pas',
			tipId: negationTip.id,
			after: '. ',
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
			text: 'amusant',
			wordId: 'word_adjective_amusant',
			after: ', ',
		},
		{
			text: 'mais',
			wordId: 'word_conjunction_mais',
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
			text: 'aussi',
			wordId: 'word_adverb_aussi',
		},
		{
			text: 'très',
			wordId: 'word_adverb_tres',
		},
		{
			text: 'dangereux',
			wordId: 'word_adjective_dangereux',
		},
		{
			text: 'pour',
			wordId: 'word_preposition_pour',
		},
		{
			text: 'un',
			wordId: 'word_article_un',
		},
		{
			text: 'chat',
			wordId: 'word_noun_chat',
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
			text: 'très',
			wordId: 'word_adverb_tres',
		},
		{
			text: 'froid',
			wordId: 'word_adjective_froid',
		},
		{
			text: 'ici',
			wordId: 'word_adverb_ici',
			after: '.',
		},
	],
});

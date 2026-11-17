import type { PassageSegment } from '@/src/components/CardDeck/cardDeckTypes';
import { getSolvePassage } from '@/src/util/getSolvePassage';

/**
 * Keeps elided words on separate puzzle cards so each word keeps its own saved position.
 */
describe('Solve passage words', () => {
	test.each(['C’', "C'", 'cʼ'])('keeps %s and est on separate puzzle cards', prefix => {
		const passage: PassageSegment[] = [
			{
				text: prefix,
				wordId: 'word_pronoun_ce',
				after: '',
			},
			{
				text: 'est',
				wordId: 'word_auxiliary_est',
				after: '. ',
			},
			{
				text: 'Léo',
				unlockExempt: true,
			},
		];

		const segments = getSolvePassage(passage);

		expect(segments).toEqual([
			{
				position: 0,
				text: prefix,
				wordId: 'word_pronoun_ce',
				after: '',
			},
			{
				position: 1,
				text: 'est',
				wordId: 'word_auxiliary_est',
				after: '. ',
			},
			{
				position: 2,
				text: 'Léo',
				unlockExempt: true,
			},
		]);
		expect(passage).toHaveLength(3);
		expect(passage[0].wordId).toBe('word_pronoun_ce');
	});

	test('keeps each repeated elision and verb at its original position', () => {
		const passage: PassageSegment[] = [
			{
				text: 'J’',
				wordId: 'je',
				after: '',
			},
			{
				text: 'ai',
				wordId: 'ai',
			},
			{
				text: 'j’',
				wordId: 'je',
				after: '',
			},
			{
				text: 'ai',
				wordId: 'ai',
				after: '.',
			},
		];
		const segments = getSolvePassage(passage);

		expect(segments.map(segment => segment.position)).toEqual([0, 1, 2, 3]);
		expect(segments.map(segment => segment.wordId)).toEqual(['je', 'ai', 'je', 'ai']);
	});

	test('keeps ordinary words and elided words separate', () => {
		const passage: PassageSegment[] = [
			{
				text: 'a',
				wordId: 'word_auxiliary_a',
			},
			{
				text: 'faim',
				wordId: 'word_noun_faim',
			},
			{
				text: 'd’',
				wordId: 'word_preposition_de',
				after: '',
			},
			{
				text: 'essayer',
				wordId: 'word_verb_essayer',
			},
		];
		const segments = getSolvePassage(passage);

		expect(segments.map(segment => segment.text)).toEqual(passage.map(segment => segment.text));
	});

	test('preserves word gaps and exempt passage segments', () => {
		const passage: PassageSegment[] = [
			{
				text: 'C’',
				wordId: 'word_pronoun_ce',
				after: ' ',
			},
			{
				text: 'est',
				wordId: 'word_auxiliary_est',
			},
			{
				text: 'C’',
				wordId: 'word_pronoun_ce',
				after: '',
			},
			{
				text: 'est',
				wordId: 'word_auxiliary_est',
				unlockExempt: true,
			},
		];

		expect(getSolvePassage(passage)).toHaveLength(4);
	});
});

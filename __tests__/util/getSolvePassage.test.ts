import type { PassageSegment } from '@/src/components/CardDeck/cardDeckTypes';
import { getSolvePassage } from '@/src/util/getSolvePassage';

/**
 * Joining cards changes which passage positions cost Ink.
 * These examples protect the joins and the saved positions that follow them.
 */
describe('Solve contractions', () => {
	test.each(['C’', "C'", 'cʼ'])('joins %s and est using the existing dictionary entry', prefix => {
		const passage: PassageSegment[] = [
			{ text: prefix, wordId: 'word_pronoun_ce', after: '' },
			{ text: 'est', wordId: 'word_auxiliary_est', after: '. ' },
			{ text: 'Léo', unlockExempt: true },
		];
		const segments = getSolvePassage(passage);

		expect(segments).toEqual([
			{ position: 0, text: `${prefix}est`, wordId: 'word_expression_cest', after: '. ' },
			{ position: 2, text: 'Léo', unlockExempt: true },
		]);
		expect(passage).toHaveLength(3);
		expect(passage[0].wordId).toBe('word_pronoun_ce');
	});

	test('keeps repeated contractions separate and recognizes other dictionary contractions', () => {
		const passage: PassageSegment[] = [
			{ text: 'J’', wordId: 'je', after: '' },
			{ text: 'ai', wordId: 'ai' },
			{ text: 'j’', wordId: 'je', after: '' },
			{ text: 'ai', wordId: 'ai', after: '.' },
		];
		const segments = getSolvePassage(passage);

		expect(segments.map(segment => segment.position)).toEqual([0, 2]);
		expect(segments.map(segment => segment.wordId)).toEqual([
			'word_expression_j_ai',
			'word_expression_j_ai',
		]);
	});

	test('leaves ordinary words and joins without a dictionary entry alone', () => {
		const passage: PassageSegment[] = [
			{ text: 'a', wordId: 'word_auxiliary_a' },
			{ text: 'faim', wordId: 'word_noun_faim' },
			{ text: 'd’', wordId: 'word_preposition_de', after: '' },
			{ text: 'essayer', wordId: 'word_verb_essayer' },
		];
		const segments = getSolvePassage(passage);

		expect(segments.map(segment => segment.text)).toEqual(passage.map(segment => segment.text));
	});

	test('does not join across a word gap or an exempt passage segment', () => {
		const passage: PassageSegment[] = [
			{ text: 'C’', wordId: 'word_pronoun_ce', after: ' ' },
			{ text: 'est', wordId: 'word_auxiliary_est' },
			{ text: 'C’', wordId: 'word_pronoun_ce', after: '' },
			{ text: 'est', wordId: 'word_auxiliary_est', unlockExempt: true },
		];

		expect(getSolvePassage(passage)).toHaveLength(4);
	});
});

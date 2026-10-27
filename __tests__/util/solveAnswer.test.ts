import { checkSolveAnswer } from '@/src/util/solveAnswer';

/**
 * Solve attempts cost Ink, so spelling tolerance needs predictable boundaries.
 * These examples check real answers without mocking the app or its database.
 */
describe('Solve answer checking', () => {
	test.each([
		['  TOASTER!!  ', 'toaster'],
		['is   reading', 'is reading'],
		['ice-cream', 'ice cream'],
		['don’t', "don't"],
		['dont', "don't"],
		['cafe\u0301', 'café'],
	])('accepts formatting differences in %s', (answer, acceptedAnswer) => {
		const result = checkSolveAnswer({ answer, englishWords: [acceptedAnswer] });

		expect(result).toEqual({ status: 'exact', acceptedAnswer });
	});

	test.each([
		['ses', 'sees'],
		['seess', 'sees'],
		['seas', 'sees'],
		['aple', 'apple'],
		['bana', 'banana'],
		['taoster', 'toaster'],
		['toster', 'toaster'],
		['taostr', 'toaster'],
		['beutifl', 'beautiful'],
		['applcaton', 'application'],
		['aplcation', 'application'],
		['strbery', 'strawberry'],
		['is reeding', 'is reading'],
	])('accepts the spelling mistake %s and returns %s', (answer, acceptedAnswer) => {
		const result = checkSolveAnswer({ answer, englishWords: [acceptedAnswer] });

		expect(result).toEqual({ status: 'close', acceptedAnswer });
	});

	test.each([
		['was', 'has'],
		['an', 'a'],
		['at', 'it'],
		['s', 'sees'],
		['apl', 'apple'],
		['beutfl', 'beautiful'],
		['tstr', 'toaster'],
		['retsaot', 'toaster'],
		['appl', 'application'],
		['as reading', 'is reading'],
		['reading is', 'is reading'],
		['reading', 'is reading'],
		['the croissant', 'croissant'],
		['ishungry', 'is hungry'],
	])('rejects %s for %s', (answer, acceptedAnswer) => {
		const result = checkSolveAnswer({ answer, englishWords: [acceptedAnswer] });

		expect(result).toEqual({ status: 'incorrect', acceptedAnswer: null });
	});

	test.each(['', '   ', '...!?', '—'])('recognizes empty input: %s', answer => {
		const result = checkSolveAnswer({ answer, englishWords: ['toaster'] });

		expect(result).toEqual({ status: 'empty', acceptedAnswer: null });
	});

	test('prefers an exact alternative over an earlier near match', () => {
		const result = checkSolveAnswer({ answer: 'smokes', englishWords: ['smoke', 'smokes'] });

		expect(result).toEqual({ status: 'exact', acceptedAnswer: 'smokes' });
	});

	test('uses the first qualifying alternative without ranking near matches', () => {
		const result = checkSolveAnswer({
			answer: 'smoks',
			englishWords: ['smoked', 'smoke'],
		});

		expect(result).toEqual({ status: 'close', acceptedAnswer: 'smoked' });
	});

	test('checks later alternatives with several English words', () => {
		const result = checkSolveAnswer({
			answer: 'is smkoing',
			englishWords: ['smokes', 'is smoking'],
		});

		expect(result).toEqual({ status: 'close', acceptedAnswer: 'is smoking' });
	});

	test('accepts a noun definition without a separate article', () => {
		const result = checkSolveAnswer({ answer: 'croissant', englishWords: ['croissant'] });

		expect(result).toEqual({ status: 'exact', acceptedAnswer: 'croissant' });
	});

	test('does not invent answers when the dictionary has no usable definition', () => {
		const result = checkSolveAnswer({ answer: 'toaster', englishWords: ['', '...'] });

		expect(result).toEqual({ status: 'incorrect', acceptedAnswer: null });
	});
});

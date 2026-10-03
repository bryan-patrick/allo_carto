import { words_a1 } from './a1';
import { words_a_cab_and_a_close_call } from './words_a_cab_and_a_close_call';
import { words_an_amber_approach } from './words_an_amber_approach';
import { words_meet_leo } from './words_meet_leo';

export * from './a1';
export * from './words_a_cab_and_a_close_call';
export * from './words_an_amber_approach';
export * from './words_meet_leo';

export const seedWords = [
	...words_a1,
	...words_an_amber_approach,
	...words_a_cab_and_a_close_call,
	...words_meet_leo,
];

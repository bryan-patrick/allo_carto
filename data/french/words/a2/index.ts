import { words_a2_adjectives } from './adjectives/words_a2_adjectives';
import { words_a2_nouns } from './nouns/words_a2_nouns';

export * from './adjectives/words_a2_adjectives';
export * from './nouns/words_a2_nouns';

export const words_a2 = [
	...words_a2_adjectives,
	...words_a2_nouns,
];

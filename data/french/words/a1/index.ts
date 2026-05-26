import { words_a1_adjectives } from './adjectives/words_a1_adjectives';
import { words_a1_expressions } from './expressions/words_a1_expressions';
import { words_a1_interjections } from './interjections/words_a1_interjections';
import { words_a1_nouns } from './nouns/words_a1_nouns';
import { words_a1_verbs } from './verbs/words_a1_verbs';

export * from './adjectives/words_a1_adjectives';
export * from './expressions/words_a1_expressions';
export * from './interjections/words_a1_interjections';
export * from './nouns/words_a1_nouns';
export * from './verbs/words_a1_verbs';

export const words_a1 = [
	...words_a1_adjectives,
	...words_a1_expressions,
	...words_a1_interjections,
	...words_a1_nouns,
	...words_a1_verbs,
];

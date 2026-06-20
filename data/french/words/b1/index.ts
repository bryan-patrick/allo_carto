import { words_b1_terminal_adjectives } from './adjectives/words_b1_terminal_adjectives';
import { words_b1_terminal_adverbs } from './adverbs/words_b1_terminal_adverbs';
import { words_b1_nouns } from './nouns/words_b1_nouns';
import { words_b1_terminal_nouns } from './nouns/words_b1_terminal_nouns';
import { words_b1_terminal_prepositions } from './prepositions/words_b1_terminal_prepositions';
import { words_b1_terminal_verbs } from './verbs/words_b1_terminal_verbs';
import { words_b1_elevator_epics } from './words_b1_elevator_epics';

export * from './adjectives/words_b1_terminal_adjectives';
export * from './adverbs/words_b1_terminal_adverbs';
export * from './nouns/words_b1_nouns';
export * from './nouns/words_b1_terminal_nouns';
export * from './prepositions/words_b1_terminal_prepositions';
export * from './verbs/words_b1_terminal_verbs';
export * from './words_b1_elevator_epics';

export const words_b1 = [
	...words_b1_terminal_adjectives,
	...words_b1_terminal_adverbs,
	...words_b1_nouns,
	...words_b1_terminal_nouns,
	...words_b1_terminal_prepositions,
	...words_b1_terminal_verbs,
	...words_b1_elevator_epics,
];

import { words_a2_adjectives } from './adjectives/words_a2_adjectives';
import { words_a2_gate_adjectives } from './adjectives/words_a2_gate_adjectives';
import { words_a2_adverbs } from './adverbs/words_a2_adverbs';
import { words_a2_gate_adverbs } from './adverbs/words_a2_gate_adverbs';
import { words_a2_expressions } from './expressions/words_a2_expressions';
import { words_a2_gate_nouns } from './nouns/words_a2_gate_nouns';
import { words_a2_nouns } from './nouns/words_a2_nouns';
import { words_a2_gate_prepositions } from './prepositions/words_a2_gate_prepositions';
import { words_a2_prepositions } from './prepositions/words_a2_prepositions';
import { words_a2_gate_verbs } from './verbs/words_a2_gate_verbs';
import { words_a2_elevator_epics } from './words_a2_elevator_epics';

export * from './adjectives/words_a2_adjectives';
export * from './adjectives/words_a2_gate_adjectives';
export * from './adverbs/words_a2_adverbs';
export * from './adverbs/words_a2_gate_adverbs';
export * from './expressions/words_a2_expressions';
export * from './nouns/words_a2_gate_nouns';
export * from './nouns/words_a2_nouns';
export * from './prepositions/words_a2_gate_prepositions';
export * from './prepositions/words_a2_prepositions';
export * from './verbs/words_a2_gate_verbs';
export * from './words_a2_elevator_epics';

export const words_a2 = [
	...words_a2_adjectives,
	...words_a2_gate_adjectives,
	...words_a2_adverbs,
	...words_a2_gate_adverbs,
	...words_a2_expressions,
	...words_a2_gate_nouns,
	...words_a2_nouns,
	...words_a2_gate_prepositions,
	...words_a2_prepositions,
	...words_a2_gate_verbs,
	...words_a2_elevator_epics,
];

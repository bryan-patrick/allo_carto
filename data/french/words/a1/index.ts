import { words_a1_adjectives } from './adjectives/words_a1_adjectives';
import { words_a1_grocery_adjectives } from './adjectives/words_a1_grocery_adjectives';
import { words_a1_adverbs } from './adverbs/words_a1_adverbs';
import { words_a1_expressions } from './expressions/words_a1_expressions';
import { words_a1_interjections } from './interjections/words_a1_interjections';
import { words_a1_grocery_nouns } from './nouns/words_a1_grocery_nouns';
import { words_a1_nouns } from './nouns/words_a1_nouns';
import { words_a1_prepositions } from './prepositions/words_a1_prepositions';
import { words_a1_grocery_verbs } from './verbs/words_a1_grocery_verbs';
import { words_a1_verbs } from './verbs/words_a1_verbs';

export * from './adjectives/words_a1_adjectives';
export * from './adjectives/words_a1_grocery_adjectives';
export * from './adverbs/words_a1_adverbs';
export * from './expressions/words_a1_expressions';
export * from './interjections/words_a1_interjections';
export * from './nouns/words_a1_grocery_nouns';
export * from './nouns/words_a1_nouns';
export * from './prepositions/words_a1_prepositions';
export * from './verbs/words_a1_grocery_verbs';
export * from './verbs/words_a1_verbs';

export const words_a1 = [
	...words_a1_adjectives,
	...words_a1_grocery_adjectives,
	...words_a1_adverbs,
	...words_a1_expressions,
	...words_a1_interjections,
	...words_a1_grocery_nouns,
	...words_a1_nouns,
	...words_a1_prepositions,
	...words_a1_grocery_verbs,
	...words_a1_verbs,
];

import { words_c1_room_keys_adjectives } from './adjectives/words_c1_room_keys_adjectives';
import { words_c1_room_keys_adverbs } from './adverbs/words_c1_room_keys_adverbs';
import { words_c1_interjections } from './interjections/words_c1_interjections';
import { words_c1_room_keys_nouns } from './nouns/words_c1_room_keys_nouns';
import { words_c1_room_keys_prepositions } from './prepositions/words_c1_room_keys_prepositions';
import { words_c1_room_keys_verbs } from './verbs/words_c1_room_keys_verbs';

export * from './adjectives/words_c1_room_keys_adjectives';
export * from './adverbs/words_c1_room_keys_adverbs';
export * from './interjections/words_c1_interjections';
export * from './nouns/words_c1_room_keys_nouns';
export * from './prepositions/words_c1_room_keys_prepositions';
export * from './verbs/words_c1_room_keys_verbs';

export const words_c1 = [
	...words_c1_room_keys_adjectives,
	...words_c1_room_keys_adverbs,
	...words_c1_interjections,
	...words_c1_room_keys_nouns,
	...words_c1_room_keys_prepositions,
	...words_c1_room_keys_verbs,
];

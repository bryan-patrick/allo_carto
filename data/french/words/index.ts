import { words_welcome_to_allo_carto } from './words_welcome_to_allo_carto';
import { words_a1 } from './a1';
import { words_a_matter_of_leaves } from './words_a_matter_of_leaves';
import { words_a_cab_and_a_close_call } from './words_a_cab_and_a_close_call';
import { words_an_amber_approach } from './words_an_amber_approach';
import { words_meet_leo } from './words_meet_leo';
import { words_a_new_restaurant } from './words_a_new_restaurant';
import { words_le_chef_leo } from './words_le_chef_leo';

export * from './words_le_chef_leo';
export * from './words_welcome_to_allo_carto';
export * from './a1';
export * from './words_a_matter_of_leaves';
export * from './words_a_cab_and_a_close_call';
export * from './words_an_amber_approach';
export * from './words_meet_leo';
export * from './words_a_new_restaurant';

export const seedWords = [
	...words_a1,
	...words_an_amber_approach,
	...words_a_cab_and_a_close_call,
	...words_meet_leo,
	...words_a_matter_of_leaves,
	...words_a_new_restaurant,
	...words_welcome_to_allo_carto,
	...words_le_chef_leo,
];

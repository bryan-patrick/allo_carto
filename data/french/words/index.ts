import { words_a1 } from './a1';
import { words_a2 } from './a2';
import { words_b1 } from './b1';
import { words_c1 } from './c1';

export * from './a1';
export * from './a2';
export * from './b1';
export * from './c1';

export const seedWords = [...words_a1, ...words_a2, ...words_b1, ...words_c1];

import { createElisionWords } from '@/src/util/createElisionWords';
import { leoAndPoeWords } from './leo-and-poe/words';

/**
 * Builds the vocabulary used by the active story paragraphs and their related word forms.
 */
export const seedWords = createElisionWords(leoAndPoeWords);

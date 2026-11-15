import { createElisionWords } from '@/src/util/createElisionWords';
import { leosKitchenWords } from './collections/leos-kitchen';
import { leoAndPoeWords } from './leo-and-poe/words';

/**
 * Builds the active story and collection vocabulary
 */
export const seedWords = createElisionWords([...leoAndPoeWords, ...leosKitchenWords]);

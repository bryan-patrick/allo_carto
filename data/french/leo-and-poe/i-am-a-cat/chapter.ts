import type { Chapter } from '../../types';
import { paragraph1 } from './paragraph_1';
import { paragraph2 } from './paragraph_2';
import { paragraph3 } from './paragraph_3';
import { paragraph4 } from './paragraph_4';

/**
 * Keep the chapter’s paragraphs in reading order.
 */
export const iAmACatChapter: Chapter = {
	id: 'leo-and-poe-chapter-1',
	label: 'Chapter 1',
	name: 'I am a cat',
	characterImage: require('@/src/app/assets/images/chapter-images/welcome-to-allo-carto/CH01.png'),
	solveUnlockLevels: {
		4: 5,
		5: 8,
	},
	paragraphs: [paragraph1, paragraph2, paragraph3, paragraph4],
};

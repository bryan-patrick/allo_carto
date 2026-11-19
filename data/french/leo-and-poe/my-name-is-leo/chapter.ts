import type { Chapter } from '../../types';
import { paragraph1 } from './paragraph_1';
import { paragraph2 } from './paragraph_2';
import { paragraph3 } from './paragraph_3';
import { paragraph4 } from './paragraph_4';
import { paragraph5 } from './paragraph_5';
import { paragraph6 } from './paragraph_6';
import { paragraph7 } from './paragraph_7';

/**
 * Lists the chapter's paragraphs in reading order.
 */
export const myNameIsLeoChapter: Chapter = {
	id: 'leo-and-poe-chapter-1',
	label: 'Chapter 1',
	name: 'My name is Léo',
	characterImage: require('@/src/app/assets/images/chapter-images/welcome-to-allo-carto/CH01.png'),
	solveUnlockLevels: {
		4: 5,
		5: 8,
	},
	paragraphs: [paragraph1, paragraph2, paragraph3, paragraph4, paragraph5, paragraph6, paragraph7],
};

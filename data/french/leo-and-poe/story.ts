import type { Story } from '../types';
import { iAmACatChapter } from './i-am-a-cat/chapter';

export const leoAndPoeStory: Story = {
	id: 'leo-and-poe',
	requiredLevel: 1,
	name: 'Leo and Poe',
	description: 'Meet Leo, a cat living in Québec City.',
	category: 'Beginner',
	materialSymbolName: 'pets',
	chapters: [
		iAmACatChapter,
		{
			id: 'leo-and-poe-chapter-2',
			label: 'Chapter 2',
			name: 'I am a bird',
			characterImage: require('@/src/app/assets/images/chapter-images/welcome-to-allo-carto/CH02.png'),
			paragraphs: [],
		},
		{
			id: 'leo-and-poe-chapter-3',
			label: 'Chapter 3',
			name: 'The Tabby',
			characterImage: require('@/src/app/assets/images/chapter-images/welcome-to-allo-carto/CH03.png'),
			paragraphs: [],
		},
		{
			id: 'leo-and-poe-chapter-4',
			label: 'Chapter 4',
			name: 'The Raven',
			paragraphs: [],
		},
	],
};

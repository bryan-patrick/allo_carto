import colors from '@/src/app/colors';

/**
 * Typing
 */
export interface StoryArea {
	id: string;
	name: string;
	description: string;
	minLevel: number;
	maxLevel: number;
	materialSymbolName: string;
	color: string;
}

/**
 * Player level ranges used to explore the story atlas.
 */
export const storyAreas: StoryArea[] = [
	{
		id: 'a-cat-and-a-raven',
		name: 'A Cat and a Raven',
		description: 'Stories of Léo and Poe',
		minLevel: 1,
		maxLevel: 5,
		materialSymbolName: 'auto_stories',
		color: colors.dark.primary,
	},
];

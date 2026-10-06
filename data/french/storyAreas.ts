import colors from '@/src/app/colors';

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
		id: 'first-steps',
		name: 'First Steps',
		description: 'Everyday stories and first encounters.',
		minLevel: 1,
		maxLevel: 5,
		materialSymbolName: 'auto_stories',
		color: colors.dark.primary,
	},
	{
		id: 'familiar-ground',
		name: 'Familiar Ground',
		description: 'Find your footing in the world around you.',
		minLevel: 6,
		maxLevel: 10,
		materialSymbolName: 'eco',
		color: colors.category.Social,
	},
	{
		id: 'further-afield',
		name: 'Further Afield',
		description: 'Follow new paths and meet new faces.',
		minLevel: 11,
		maxLevel: 15,
		materialSymbolName: 'explore',
		color: colors.category.Directions,
	},
	{
		id: 'new-horizons',
		name: 'New Horizons',
		description: 'Discover stories beyond familiar places.',
		minLevel: 16,
		maxLevel: 20,
		materialSymbolName: 'globe',
		color: colors.category.Travel,
	},
	{
		id: 'the-long-road',
		name: 'The Long Road',
		description: 'Keep exploring as your experience grows.',
		minLevel: 21,
		maxLevel: 25,
		materialSymbolName: 'map',
		color: colors.category.History,
	},
	{
		id: 'beyond-the-map',
		name: 'Beyond the Map',
		description: 'Reach the farthest corners of the atlas.',
		minLevel: 26,
		maxLevel: 30,
		materialSymbolName: 'flag',
		color: colors.category.Shopping,
	},
];

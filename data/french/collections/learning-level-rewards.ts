import type { CollectionRewardDefinition } from '../collectionAtlas';

/**
 * XP rewards for each collection learning level
 */
export const collectionLevelRewards: CollectionRewardDefinition[] = [
	{
		requiredWordProgress: 'new',
		xp: 50,
	},
	{
		requiredWordProgress: 'learning',
		xp: 100,
	},
	{
		requiredWordProgress: 'familiar',
		xp: 150,
	},
	{
		requiredWordProgress: 'known',
		xp: 200,
	},
	{
		requiredWordProgress: 'mastered',
		xp: 250,
	},
];

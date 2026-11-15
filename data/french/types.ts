import type colors from '@/src/app/colors';
import type { Paragraph } from '@/src/components/CardDeck/cardDeckTypes';
import type { Progression } from '@/src/util/progression';
import type { SolveStage } from '@/src/util/solveProgression';
import type { ImageSourcePropType } from 'react-native';
import type { StoryArea } from './storyAreas';

export type StoryCategory = keyof typeof colors.category;

export interface StoryAtlas {
	areas: StoryArea[];
	stories: Story[];
}

export interface Story extends Progression {
	id: string;
	requiredLevel: number;
	name: string;
	description: string;
	category: StoryCategory;
	chapters: Chapter[];
	image?: ImageSourcePropType;
	materialSymbolName?: string;
}

export interface Chapter extends Progression {
	id: string;
	label: string;
	name: string;
	description?: string;
	paragraphs: Paragraph[];
	image?: ImageSourcePropType;
	characterImage?: ImageSourcePropType;
	solveUnlockLevels?: Partial<Record<SolveStage, number>>;
}

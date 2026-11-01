import {
	findChapterById,
	findCompletionPath,
	findParagraphById,
	findStoryById,
} from './atlasCompletion';

export type UserActivityType =
	| 'xpClaimed'
	| 'paragraphFlashcardsCompleted'
	| 'paragraphSolveCompleted'
	| 'puzzleCompleted'
	| 'gemEarned'
	| 'gemsUpgraded'
	| 'storyUnlocked'
	| 'chapterUnlocked'
	| 'paragraphUnlocked'
	| 'levelUp'
	| 'inkCapacityIncreased';

export interface UserActivity {
	id: number;
	type: UserActivityType;
	description: string;
	createdAt: number;
}

interface UserActivityDisplay {
	title: string;
	icon: string;
}

export const userActivityLimit = 50;

export const userActivityDisplay: Record<UserActivityType, UserActivityDisplay> = {
	xpClaimed: {
		title: 'XP claimed',
		icon: 'stars',
	},
	paragraphFlashcardsCompleted: {
		title: 'All flashcard decks completed',
		icon: 'library_add_check',
	},
	paragraphSolveCompleted: {
		title: 'All five Solve stages completed',
		icon: 'workspace_premium',
	},
	puzzleCompleted: {
		title: 'Puzzle completed',
		icon: 'extension',
	},
	gemEarned: {
		title: 'Gem earned',
		icon: 'diamond',
	},
	gemsUpgraded: {
		title: 'Gems upgraded',
		icon: 'diamond',
	},
	storyUnlocked: {
		title: 'Story unlocked',
		icon: 'auto_stories',
	},
	chapterUnlocked: {
		title: 'Chapter unlocked',
		icon: 'menu_book',
	},
	paragraphUnlocked: {
		title: 'Paragraph unlocked',
		icon: 'lock_open',
	},
	levelUp: {
		title: 'Level up!',
		icon: 'trending_up',
	},
	inkCapacityIncreased: {
		title: 'Ink capacity increased',
		icon: 'water_drop',
	},
};

// Include the story and chapter so paragraphs with similar names are easy to tell apart.
export function getActivityItemLabel(id: string): string {
	const path = findCompletionPath({
		id,
	});
	const story = findStoryById(path[0]?.id);
	const chapter = findChapterById(path[1]?.id);
	const paragraph = path.length === 3 ? findParagraphById(id) : undefined;
	const labels = [story?.name, chapter?.name, paragraph?.title];
	const availableLabels = labels.filter(Boolean);

	if (availableLabels.length === 0) {
		return id;
	}

	return availableLabels.join(' · ');
}

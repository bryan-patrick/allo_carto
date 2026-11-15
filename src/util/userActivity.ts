import {
	findChapterById,
	findCompletionPath,
	findStoryById,
	getParagraphNumber,
} from './atlasCompletion';

/**
 * Typing
 */
export type UserActivityType =
	| 'xpClaimed'
	| 'paragraphFlashcardsCompleted'
	| 'paragraphSolveCompleted'
	| 'puzzleCompleted'
	| 'gemEarned'
	| 'gemsUpgraded'
	| 'stampUnlocked'
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

export type UserNotificationType =
	| 'levelUp'
	| 'stampUnlocked'
	| 'storyUnlocked'
	| 'chapterUnlocked'
	| 'paragraphUnlocked'
	| 'gemEarned'
	| 'gemsUpgraded';

export interface UserNotification extends UserActivity {
	type: UserNotificationType;
}

interface UserActivityDisplay {
	title: string;
	icon: string;
}

const notificationActivityTypes: ReadonlySet<UserActivityType> = new Set<UserActivityType>([
	'levelUp',
	'stampUnlocked',
	'storyUnlocked',
	'chapterUnlocked',
	'paragraphUnlocked',
	'gemEarned',
	'gemsUpgraded',
]);

// Choose which saved rewards and unlocks also appear in Notifications.
export function isUserNotificationType(type: UserActivityType): type is UserNotificationType {
	return notificationActivityTypes.has(type);
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
	stampUnlocked: {
		title: 'Stamp unlocked',
		icon: 'local_post_office',
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

/**
 * Label an activity with its story, chapter, and paragraph number.
 */
export function getActivityItemLabel(id: string): string {
	const path = findCompletionPath({
		id,
	});
	const story = findStoryById(path[0]?.id);
	const chapter = findChapterById(path[1]?.id);
	const paragraphNumber = getParagraphNumber(id);
	const labels = [story?.name, chapter?.name];
	const availableLabels = labels.filter(Boolean);

	if (paragraphNumber !== undefined) {
		availableLabels.push(`Paragraph ${paragraphNumber}`);
	}

	if (availableLabels.length === 0) {
		return id;
	}

	return availableLabels.join(' > ');
}

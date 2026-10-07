import type { DeckSessionProps } from '@/src/components/CardDeck/deckSessionTypes';
import { getUnlockedAtlasItems } from './atlasCompletion';
import type { ProgressById } from './progression';
import { getUserExperience } from './userExperience';

/**
 * Every time the user starts a new deck it creates a new session before showing the first card.
 */
export function createDeckSession(xpBefore: number, progressById: ProgressById): DeckSessionProps {
	const userLevel = getUserExperience(xpBefore).level;
	const unlockedIdsBefore = getUnlockedAtlasItems({ progressById, userLevel }).map(item => item.id);

	return {
		id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
		xpBefore,
		unlockedIdsBefore,
		results: [],
	};
}

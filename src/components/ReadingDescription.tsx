import type { DeckChapter, DeckStory } from '@/data/french/storyAtlas';
import type {
	CardDeck,
	PassageSegment,
	ReadingPassage,
} from '@/src/components/CardDeck/cardDeckTypes';
import DeckBoxModal from '@/src/components/DeckBox/DeckBoxModal';
import { getDB, getWordProgressById } from '@/src/db/interface';
import getDeckWordProgressCounts, {
	type DeckWordProgressCounts,
} from '@/src/db/queries/getDeckWordProgressCounts';
import { useUserContext } from '@/src/db/useUserContext';
import { useUserProgress } from '@/src/db/useUserProgress';
import { isItemUnlocked } from '@/src/util/atlasCompletion';
import { getPassageWordIds } from '@/src/util/getPassageWordIds';
import type { WordProgressKey } from '@/src/util/wordProgress';
import { useState } from 'react';
import { type StyleProp, StyleSheet, Text, type TextStyle } from 'react-native';

/**
 * Typing
 */
interface ReadingDescriptionProps {
	item: DeckChapter | DeckStory;
	color: string;
	style?: StyleProp<TextStyle>;
}

interface PassageState {
	deck: ReadingPassage;
	wordProgressCounts: DeckWordProgressCounts;
	wordProgressKeyByWordId: Record<string, WordProgressKey>;
}

/**
 * A description with an inline button to read its chapter or story
 */
export default function ReadingDescription({ item, color, style }: ReadingDescriptionProps) {
	const { id: userId } = useUserContext() ?? {};
	const { experience, progressById } = useUserProgress();
	const [loading, setLoading] = useState(false);
	const [passageState, setPassageState] = useState<PassageState>();
	let decks: CardDeck[];
	let readLabel = 'Read chapter';

	if ('chapters' in item) {
		decks = item.chapters.flatMap(chapter => chapter.decks);
		readLabel = 'Read story';
	} else {
		decks = item.decks;
	}

	const canRead =
		decks.length > 0 && isItemUnlocked({ id: item.id, progressById, userLevel: experience.level });

	async function handleRead() {
		if (!userId || !canRead || loading) return;

		setLoading(true);

		try {
			const passage: PassageSegment[] = [];

			for (const deck of decks) {
				if (passage.length > 0) {
					passage.push({ text: '\n\n', unlockExempt: true, after: '' });
				}

				passage.push(...deck.passage);
			}

			const wordIds = getPassageWordIds(passage);
			const database = await getDB();
			const [wordProgressCounts, wordProgressKeyByWordId] = await Promise.all([
				getDeckWordProgressCounts({ database, userId, wordIds }),
				getWordProgressById({ userId, passage }),
			]);

			setPassageState({
				deck: { id: item.id, title: item.name, passage, wordIds },
				wordProgressCounts,
				wordProgressKeyByWordId,
			});
		} catch (error) {
			console.error('Could not retrieve passage progress:', error);
		} finally {
			setLoading(false);
		}
	}

	return (
		<>
			<Text style={style}>
				{item.description}
				{canRead && (
					<>
						{' '}
						<Text
							accessibilityLabel={`${readLabel} ${item.name}`}
							accessibilityRole="button"
							accessibilityState={{ disabled: loading, busy: loading }}
							disabled={loading}
							onPress={handleRead}
							style={[styles.readLink, { color }, loading && styles.loading]}
						>
							{readLabel}
						</Text>
					</>
				)}
			</Text>
			{passageState && (
				<DeckBoxModal
					deck={passageState.deck}
					modalVisible={Boolean(passageState)}
					setModalVisible={() => setPassageState(undefined)}
					wordProgressCounts={passageState.wordProgressCounts}
					wordProgressKeyByWordId={passageState.wordProgressKeyByWordId}
				/>
			)}
		</>
	);
}

/**
 * Styles
 */
const styles = StyleSheet.create({
	readLink: {
		fontFamily: 'lexend-600',
		textDecorationLine: 'underline',
	},
	loading: {
		opacity: 0.5,
	},
});

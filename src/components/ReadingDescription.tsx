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
import { hasChapterContent, hasParagraphContent } from '@/src/util/atlasContent';
import { getPassageWordIds } from '@/src/util/getPassageWordIds';
import type { WordProgressKey } from '@/src/util/wordProgress';
import { useState } from 'react';
import { Pressable, type StyleProp, StyleSheet, Text, type TextStyle } from 'react-native';

/**
 * Typing
 */
interface ReadingDescriptionProps {
	item: DeckChapter | DeckStory;
	color: string;
	style?: StyleProp<TextStyle>;
	showDescription?: boolean;
	linkLabel?: string;
}

interface PassageState {
	deck: ReadingPassage;
	wordProgressCounts: DeckWordProgressCounts;
	wordProgressKeyByWordId: Record<string, WordProgressKey>;
}

/**
 * We keep the read label inline and make the description easier to tap as a whole.
 */
export default function ReadingDescription({
	item,
	color,
	style,
	showDescription = true,
	linkLabel,
}: ReadingDescriptionProps) {
	const { id: userId } = useUserContext() ?? {};
	const { experience, progressById } = useUserProgress();
	const [loading, setLoading] = useState(false);
	const [passageState, setPassageState] = useState<PassageState>();
	let decks: CardDeck[];
	const readLabel = linkLabel ?? ('chapters' in item ? 'Read story' : 'Read chapter');

	if ('chapters' in item) {
		decks = item.chapters
			.filter(hasChapterContent)
			.flatMap(chapter => chapter.decks.filter(hasParagraphContent));
	} else {
		decks = item.decks.filter(hasParagraphContent);
	}

	const canRead =
		decks.length > 0 && isItemUnlocked({ id: item.id, progressById, userLevel: experience.level });

	async function handleRead() {
		if (!userId || !canRead || loading) {
			return;
		}

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
			<Pressable
				accessible={canRead}
				accessibilityLabel={canRead ? `${readLabel} ${item.name}` : undefined}
				accessibilityHint={showDescription ? item.description : undefined}
				accessibilityRole={canRead ? 'button' : undefined}
				accessibilityState={{ disabled: !canRead || loading, busy: loading }}
				disabled={!canRead || loading}
				hitSlop={8}
				onPress={handleRead}
			>
				<Text style={style}>
					{showDescription && item.description}
					{canRead && (
						<>
							{showDescription && ' '}
							<Text style={[styles.readLink, { color }, loading && styles.loading]}>
								{readLabel}
							</Text>
						</>
					)}
				</Text>
			</Pressable>
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
		fontFamily: 'lexend-700',
		textDecorationLine: 'underline',
	},
	loading: {
		opacity: 0.5,
	},
});

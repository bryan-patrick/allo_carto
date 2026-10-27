import type { DeckChapter, DeckStory } from '@/data/french/storyAtlas';
import type {
	CardDeck,
	PassageSegment,
	ReadingPassage,
} from '@/src/components/CardDeck/cardDeckTypes';
import DeckBoxModal from '@/src/components/DeckBox/DeckBoxModal';
import MaterialSymbol from '@/src/components/MaterialSymbol';
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
import { Pressable, type StyleProp, StyleSheet, Text, type TextStyle, View } from 'react-native';

/**
 * Typing
 */
export interface ReadingLinkProps {
	item: CardDeck | DeckChapter | DeckStory;
	color: string;
	label?: string;
	style?: StyleProp<TextStyle>;
	showDescription?: boolean;
}

interface PassageState {
	deck: ReadingPassage;
	wordProgressCounts: DeckWordProgressCounts;
	wordProgressKeyByWordId: Record<string, WordProgressKey>;
}

/**
 * Opens the story modal
 */
export default function ReadingLink({
	item,
	color,
	label: readLabel = 'Read',
	style,
	showDescription = false,
}: ReadingLinkProps) {
	const { id: userId } = useUserContext() ?? {};
	const { progressById } = useUserProgress();
	const [loading, setLoading] = useState(false);
	const [passageState, setPassageState] = useState<PassageState>();
	const title = 'name' in item ? item.name : item.title;
	let decks: CardDeck[];

	if ('chapters' in item) {
		decks = item.chapters
			.filter(hasChapterContent)
			.flatMap(chapter => chapter.decks.filter(hasParagraphContent));
	} else if ('decks' in item) {
		decks = item.decks.filter(hasParagraphContent);
	} else {
		decks = [item];
	}

	/**
	 * Reading a chapter or story only includes paragraphs the player can already open.
	 */
	decks = decks.filter(deck => {
		return isItemUnlocked({
			id: deck.id,
			progressById,
		});
	});

	const canRead =
		decks.length > 0 &&
		isItemUnlocked({
			id: item.id,
			progressById,
		});

	async function handleRead() {
		if (!userId || !canRead || loading) {
			return;
		}

		setLoading(true);

		try {
			const passage: PassageSegment[] = [];

			for (const deck of decks) {
				if (passage.length > 0) {
					passage.push({
						text: '\n\n',
						unlockExempt: true,
						after: '',
					});
				}

				passage.push(...deck.passage);
			}

			const wordIds = getPassageWordIds(passage);
			const database = await getDB();
			const [wordProgressCounts, wordProgressKeyByWordId] = await Promise.all([
				getDeckWordProgressCounts({
					database,
					userId,
					wordIds,
				}),
				getWordProgressById({
					userId,
					passage,
				}),
			]);

			setPassageState({
				deck: {
					id: item.id,
					title,
					passage,
					wordIds,
				},
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
				accessibilityLabel={canRead ? `${readLabel}: ${title}` : undefined}
				accessibilityHint={showDescription ? item.description : undefined}
				accessibilityRole={canRead ? 'button' : undefined}
				accessibilityState={{
					disabled: !canRead || loading,
					busy: loading,
				}}
				disabled={!canRead || loading}
				hitSlop={8}
				onPress={handleRead}
			>
				{showDescription ?
					<Text style={style}>
						{showDescription && item.description}
						{canRead && (
							<>
								{showDescription && ' '}
								<Text
									style={[
										styles.readLink,
										{
											color,
										},
										loading && styles.loading,
									]}
								>
									{readLabel}
								</Text>
							</>
						)}
					</Text>
				: canRead ?
					<View style={styles.linkRow}>
						<Text
							style={[
								styles.readLink,
								style,
								{
									color,
								},
								loading && styles.loading,
							]}
						>
							{readLabel}
						</Text>
						<MaterialSymbol
							name="menu_book"
							size={16}
							color={color}
						/>
					</View>
				:	null}
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
	linkRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 4,
		minHeight: 32,
	},
	readLink: {
		fontFamily: 'lexend-700',
		textDecorationLine: 'underline',
	},
	loading: {
		opacity: 0.5,
	},
});

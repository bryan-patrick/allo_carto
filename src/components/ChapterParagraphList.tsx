import type { Chapter, Story } from '@/data/french/storyAtlas';
import colors from '@/src/app/colors';
import type { Paragraph, ReadingPassage } from '@/src/components/CardDeck/cardDeckTypes';
import { useCardDeck } from '@/src/components/CardDeck/useCardDeck';
import DeckBoxModal from '@/src/components/DeckBox/DeckBoxModal';
import LinkButton from '@/src/components/LinkButton';
import LockedSection from '@/src/components/LockedSection';
import MaterialSymbol from '@/src/components/MaterialSymbol';
import ParagraphHeader from '@/src/components/ParagraphHeader';
import ParagraphPostcard from '@/src/components/ParagraphPostcard';
import SolveEligibilityHint from '@/src/components/Solve/SolveEligibilityHint';
import SolvePuzzleButtons from '@/src/components/Solve/SolvePuzzleButtons';
import { getDB, getDeck, getWordProgressById } from '@/src/db/interface';
import getDeckWordProgressCounts, {
	type DeckWordProgressCounts,
} from '@/src/db/queries/getDeckWordProgressCounts';
import { useUserContext } from '@/src/db/useUserContext';
import { useUserProgress } from '@/src/db/useUserProgress';
import {
	getAtlasItemLabel,
	getUnlockCriteria,
	getVisibleParagraphs,
	isItemUnlocked,
} from '@/src/util/atlasCompletion';
import { getCardsPerDeck } from '@/src/util/cardsPerDeck';
import { getFlashcardActionLabel } from '@/src/util/getFlashcardActionLabel';
import type { ProgressById } from '@/src/util/progression';
import type { WordProgressKey } from '@/src/util/wordProgress';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

/**
 * Typing
 */
interface ChapterParagraphListProps {
	chapter: Chapter;
	progressById: ProgressById;
	story: Story;
}

interface PassageState {
	paragraph: ReadingPassage;
	wordProgressCounts: DeckWordProgressCounts;
	wordProgressKeyByWordId: Record<string, WordProgressKey>;
}

/**
 * Show the chapter's open paragraphs and next locked one with reading and practice buttons.
 */
export default function ChapterParagraphList({
	chapter,
	progressById,
	story,
}: ChapterParagraphListProps) {
	const router = useRouter();

	/**
	 * Context and state
	 */
	const { id: userId } = useUserContext() ?? {};
	const { experience, isUpdatingProgress } = useUserProgress();
	const userLevel = experience.level;
	const cardsPerDeck = getCardsPerDeck(userLevel);
	const { cardDeckDispatch } = useCardDeck();
	const isStartingDeck = useRef(false);
	const [loadingPassageId, setLoadingPassageId] = useState<string>();
	const [passageState, setPassageState] = useState<PassageState>();
	const storyColor = colors.category[story.category];
	const visibleParagraphs = getVisibleParagraphs(chapter, progressById);
	const isChapterLocked = !isItemUnlocked({
		id: chapter.id,
		progressById,
	});
	const chapterUnlockCriteria = getUnlockCriteria(chapter, progressById);

	/**
	 * Load and begin the paragraph’s next flashcard deck.
	 */
	async function handleSelectDeck(paragraph: Paragraph) {
		if (!userId || isUpdatingProgress || isStartingDeck.current) {
			return;
		}
		if (
			!isItemUnlocked({
				id: paragraph.id,
				progressById,
			})
		) {
			return;
		}

		isStartingDeck.current = true;

		try {
			const selectedDeck = await getDeck({
				deck: paragraph,
				amount: cardsPerDeck,
				userId,
			});

			if (!selectedDeck || selectedDeck.cardDeck.words.length === 0) {
				Alert.alert('Could not start session', 'Please try again.');
				return;
			}

			cardDeckDispatch({
				type: 'SET_DECK',
				payload: selectedDeck.cardDeck,
				session: selectedDeck.session,
				currentIndex: selectedDeck.currentIndex,
			});
			router.push('/CardDeck');
		} catch (error) {
			console.error('Could not start session:', error);
			Alert.alert('Could not start session', 'Please try again.');
		} finally {
			isStartingDeck.current = false;
		}
	}

	/**
	 * Load passage progress before opening the passage view
	 */
	async function handleShowPassage(paragraph: ReadingPassage) {
		if (!userId || loadingPassageId) {
			return;
		}
		if (
			!isItemUnlocked({
				id: paragraph.id,
				progressById,
			})
		) {
			return;
		}

		setLoadingPassageId(paragraph.id);

		try {
			const database = await getDB();
			const [wordProgressCounts, wordProgressKeyByWordId] = await Promise.all([
				getDeckWordProgressCounts({
					database,
					userId,
					wordIds: paragraph.wordIds,
				}),
				getWordProgressById({
					userId,
					passage: paragraph.passage,
				}),
			]);

			setPassageState({
				paragraph,
				wordProgressCounts,
				wordProgressKeyByWordId,
			});
		} catch (error) {
			console.error('Could not retrieve passage progress:', error);
		} finally {
			setLoadingPassageId(undefined);
		}
	}

	if (isChapterLocked) {
		return (
			<ParagraphPostcard index={0}>
				<View style={styles.lockedChapter}>
					<LockedSection
						color={storyColor}
						unlockCriteria={chapterUnlockCriteria}
						fontSize={15}
					/>
				</View>
			</ParagraphPostcard>
		);
	}

	return (
		<View style={styles.paragraphList}>
			{visibleParagraphs.map((paragraph, index) => {
				const paragraphLabel = getAtlasItemLabel(paragraph.id);
				const isLocked = !isItemUnlocked({
					id: paragraph.id,
					progressById,
				});
				const unlockCriteria = getUnlockCriteria(paragraph, progressById);
				const isLoadingPassage = loadingPassageId === paragraph.id;
				const actionLabel = getFlashcardActionLabel(progressById[paragraph.id]?.flashcardProgress);

				return (
					<ParagraphPostcard
						key={paragraph.id}
						index={index}
						header={
							!isLocked && (
								<View style={styles.paragraphHeading}>
									<ParagraphHeader
										label={paragraphLabel}
										progress={progressById[paragraph.id]}
										fontSize={15}
										showGems={false}
									/>
									<Pressable
										accessibilityRole="button"
										accessibilityLabel={`Read ${paragraphLabel}`}
										accessibilityState={{
											disabled: Boolean(loadingPassageId),
											busy: isLoadingPassage,
										}}
										disabled={Boolean(loadingPassageId)}
										onPress={() => handleShowPassage(paragraph)}
										hitSlop={8}
										style={[styles.readLink, isLoadingPassage && styles.loadingButton]}
									>
										<Text
											style={[
												styles.readLinkText,
												{
													color: storyColor,
												},
											]}
										>
											Read paragraph
										</Text>
										<MaterialSymbol
											name="menu_book"
											size={16}
											color={storyColor}
										/>
									</Pressable>
								</View>
							)
						}
					>
						<View style={[styles.paragraphRow, !isLocked && styles.paragraphDivider]}>
							{isLocked && (
								<LockedSection
									color={storyColor}
									unlockCriteria={unlockCriteria}
									fontSize={15}
								/>
							)}
							{!isLocked && (
								<View style={styles.actions}>
									<SolvePuzzleButtons
										deckId={paragraph.id}
										color={storyColor}
									/>
									<SolveEligibilityHint
										deck={paragraph}
										textStyle={styles.helpText}
									/>
									<LinkButton
										accessibilityLabel={`${actionLabel} for ${paragraphLabel}`}
										arrowColor={colors.light.text}
										color={storyColor}
										contentPaddingHorizontal={8}
										contentPaddingVertical={8}
										handler={() => handleSelectDeck(paragraph)}
										disabled={isUpdatingProgress}
										style={styles.flashcardActionButton}
										textStyle={styles.actionText}
									>
										{actionLabel}
									</LinkButton>
								</View>
							)}
						</View>
					</ParagraphPostcard>
				);
			})}
			{passageState && (
				<DeckBoxModal
					deck={passageState.paragraph}
					modalVisible={Boolean(passageState)}
					setModalVisible={() => setPassageState(undefined)}
					wordProgressCounts={passageState.wordProgressCounts}
					wordProgressKeyByWordId={passageState.wordProgressKeyByWordId}
				/>
			)}
		</View>
	);
}

/**
 * Styles
 */
const styles = StyleSheet.create({
	paragraphList: {
		gap: 16,
	},
	paragraphRow: {
		margin: 8,
		padding: 12,
		paddingBottom: 6,
		paddingHorizontal: 2,
		gap: 8,
	},
	paragraphDivider: {
		borderTopWidth: 1,
		borderColor: colors.light.border,
	},
	lockedChapter: {
		paddingVertical: 16,
		marginBottom: 24,
	},
	paragraphHeading: {
		marginTop: 6,
		gap: 4,
	},
	actions: {
		justifyContent: 'center',
		alignItems: 'stretch',
		gap: 8,
	},
	flashcardActionButton: {
		shadowOpacity: 0,
	},
	actionText: {
		fontSize: 15,
	},
	helpText: {
		fontSize: 15,
		lineHeight: 15,
		textAlign: 'center',
	},
	readLink: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 4,
	},
	readLinkText: {
		fontFamily: 'lexend-400',
		fontSize: 14,
		lineHeight: 16,
		textDecorationLine: 'underline',
	},
	loadingButton: {
		opacity: 0.75,
	},
});

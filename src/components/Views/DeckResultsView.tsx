import colors from '@/src/app/colors';
import type { CardDeck } from '@/src/components/CardDeck/cardDeckTypes';
import type { DeckSessionProps } from '@/src/components/CardDeck/deckSessionTypes';
import CompletionRewards from '@/src/components/DeckCompletion/CompletionRewards';
import CompletionWordResults from '@/src/components/DeckCompletion/CompletionWordResults';
import MaterialSymbol from '@/src/components/MaterialSymbol';
import { getDeck } from '@/src/db/interface';
import { useUserContext } from '@/src/db/useUserContext';
import { useUserProgress } from '@/src/db/useUserProgress';
import { useAppSettings } from '@/src/settings/useAppSettings';
import { findCompletionPath } from '@/src/util/atlasCompletion';
import { getCardsPerDeck } from '@/src/util/cardsPerDeck';
import { createDeckSession } from '@/src/util/createDeckSession';
import { getDeckStoryColor } from '@/src/util/getDeckStoryColor';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import {
	Alert,
	BackHandler,
	ImageBackground,
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCardDeck } from '../CardDeck/useCardDeck';
import LinkButton from '../LinkButton';

const postcardBackground = require('@/src/app/assets/images/postcard-parts/background.jpg');

/**
 * We use this to show rewards after flashcards.
 */
export default function DeckResultsView() {
	const router = useRouter();
	const { experience, inkBalance, isUpdatingProgress, progressById } = useUserProgress();
	const { cardDeckState, cardDeckDispatch } = useCardDeck();
	const { id: userId } = useUserContext() ?? {};
	const { settings } = useAppSettings();
	const { bottom } = useSafeAreaInsets();
	const { cardDeck, session } = cardDeckState;
	const [showWordResults, setShowWordResults] = useState(false);
	const [isRepeating, setIsRepeating] = useState(false);
	const isStartingDeck = useRef(false);
	const completionPath = findCompletionPath({ id: cardDeck.id });
	const chapter = completionPath[1];
	const storyColor = getDeckStoryColor(cardDeck.id);
	const cardsPerDeck = getCardsPerDeck(experience.level, settings.cardsPerDeck);
	const hasReview = Boolean(session?.completion);
	const repeatDisabled = !userId || isUpdatingProgress || isRepeating;
	const containerStyle = { paddingBottom: Math.max(bottom, 8) };
	const paragraphCardCount = cardDeck.wordIds.length;
	const seenCardCount = progressById[cardDeck.id]?.seenWordCount ?? 0;
	const unseenCardCount = paragraphCardCount - seenCardCount;
	const newlySeenCards = cardDeck.words.filter(word => {
		const previousSeenCount = word.seenCount ?? 0;
		const hasSessionResult = session?.results.some(result => result.wordId === word.id) ?? false;

		return previousSeenCount === 0 && hasSessionResult;
	});
	const newlySeenCardCount = newlySeenCards.length;
	const headingStyle = {
		color: storyColor,
	};
	let newlySeenLabel = `${newlySeenCardCount} new cards seen this session`;
	let title = 'You finished the deck!';
	let description = cardDeck.title;
	let studyLabel = 'Repeat';
	let wordResultsLabel = 'Show word results';
	let wordResultsIcon = 'expand_more';

	if (newlySeenCardCount === 1) {
		newlySeenLabel = '1 new card seen this session';
	}

	if (!hasReview) {
		title = 'No session results to review';
		description = 'Finish a flashcard session to see your results and rewards.';
	}

	if (isRepeating) {
		studyLabel = 'Starting…';
	}

	if (showWordResults) {
		wordResultsLabel = 'Hide word results';
		wordResultsIcon = 'expand_less';
	}

	/**
	 * Return to the chapter we were studying, or Home if that chapter is missing.
	 */
	const handleFinish = useCallback(() => {
		if (isStartingDeck.current) {
			return;
		}

		if (chapter) {
			router.dismissTo({
				pathname: '/ChapterDetail',
				params: { chapterId: chapter.id },
			});
			return;
		}

		router.replace('/(tabs)');
	}, [chapter, router]);

	/**
	 * Do more flashcards using the latest saved word progress.
	 * The ref blocks extra presses before the Starting label appears.
	 */
	async function handleRepeat() {
		let selectedDeck: CardDeck | undefined;
		let nextSession: DeckSessionProps;

		if (repeatDisabled || isStartingDeck.current || !hasReview || !userId) {
			return;
		}

		isStartingDeck.current = true;
		setIsRepeating(true);

		try {
			selectedDeck = await getDeck({ deck: cardDeck, amount: cardsPerDeck, userId });

			if (!selectedDeck || selectedDeck.words.length === 0) {
				Alert.alert('Could not start session', 'Please try again.');
				return;
			}

			nextSession = createDeckSession(experience.totalXP);

			cardDeckDispatch({
				type: 'SET_DECK',
				payload: selectedDeck,
				session: nextSession,
			});
			router.replace('/CardDeck');
		} catch (error) {
			console.error('Could not repeat deck:', error);
			Alert.alert('Could not start session', 'Please try again.');
		} finally {
			isStartingDeck.current = false;
			setIsRepeating(false);
		}
	}

	function handleToggleWordResults() {
		setShowWordResults(!showWordResults);
	}

	/**
	 * Android Back leaves results directly now that there are no review steps.
	 */
	useFocusEffect(
		useCallback(() => {
			const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
				handleFinish();
				return true;
			});

			return () => subscription.remove();
		}, [handleFinish]),
	);

	return (
		<View style={[styles.container, containerStyle]}>
			<ImageBackground
				source={postcardBackground}
				style={styles.postcard}
			>
				<View style={styles.postcardBorder}>
					<View style={styles.header}>
						<MaterialSymbol
							name="task_alt"
							size={28}
							color={storyColor}
						/>
						<View style={styles.headingText}>
							<Text
								accessibilityRole="header"
								style={[styles.title, headingStyle]}
							>
								{title}
							</Text>
							<Text style={styles.description}>{description}</Text>
						</View>
					</View>
					<ScrollView contentContainerStyle={styles.scrollContent}>
						{hasReview && session && (
							<>
								<CompletionRewards
									session={session}
									color={storyColor}
									inkBalance={inkBalance}
								/>
								<View style={styles.cardProgress}>
									<Text
										accessibilityRole="header"
										style={[styles.sectionTitle, headingStyle]}
									>
										Cards seen
									</Text>
									<View style={styles.cardCounts}>
										<Text style={styles.cardProgressText}>
											Seen: {seenCardCount} / {paragraphCardCount}
										</Text>
										<Text style={styles.cardProgressText}>Not seen: {unseenCardCount}</Text>
									</View>
									<Text style={styles.cardProgressText}>{newlySeenLabel}</Text>
								</View>
								<Pressable
									accessibilityRole="button"
									accessibilityLabel={wordResultsLabel}
									accessibilityState={{ expanded: showWordResults }}
									onPress={handleToggleWordResults}
									style={styles.wordResultsToggle}
								>
									<Text style={[styles.sectionTitle, headingStyle]}>{wordResultsLabel}</Text>
									<MaterialSymbol
										name={wordResultsIcon}
										size={24}
										color={storyColor}
									/>
								</Pressable>
								{showWordResults && (
									<CompletionWordResults
										words={cardDeck.words}
										results={session.results}
										color={storyColor}
									/>
								)}
							</>
						)}
					</ScrollView>
					<View style={styles.footer}>
						<LinkButton
							handler={handleFinish}
							disabled={isRepeating || isUpdatingProgress}
							color={storyColor}
							type="outline"
							useArrow={false}
							showShadow={false}
							showInnerBorder={false}
							style={styles.footerButton}
						>
							Finish
						</LinkButton>
						{hasReview && (
							<LinkButton
								handler={handleRepeat}
								disabled={repeatDisabled}
								color={storyColor}
								style={styles.footerButton}
							>
								{studyLabel}
							</LinkButton>
						)}
					</View>
				</View>
			</ImageBackground>
		</View>
	);
}

/**
 * Styles
 */
const styles = StyleSheet.create({
	container: {
		flex: 1,
		paddingTop: 8,
		paddingHorizontal: 8,
		backgroundColor: colors.dark.background,
	},
	postcard: {
		flex: 1,
		width: '100%',
		maxWidth: 600,
		alignSelf: 'center',
		padding: 6,
		borderWidth: 1,
		borderColor: colors.light.border,
		borderRadius: 12,
		overflow: 'hidden',
		backgroundColor: colors.light.background,
	},
	postcardBorder: {
		flex: 1,
		borderWidth: 1,
		borderRadius: 8,
		borderColor: colors.light.goldenBorder,
		overflow: 'hidden',
	},
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		padding: 12,
		gap: 8,
		borderBottomWidth: 1,
		borderBottomColor: colors.light.goldenBorder,
	},
	headingText: { flex: 1, gap: 3 },
	title: {
		fontSize: 20,
		fontFamily: 'lexend-600',
	},
	description: {
		fontSize: 12,
		lineHeight: 18,
		fontFamily: 'lexend-400',
		color: colors.dark.text,
	},
	scrollContent: {
		padding: 12,
		gap: 12,
	},
	cardProgress: {
		gap: 8,
		padding: 12,
		borderWidth: 1,
		borderColor: colors.light.goldenBorder,
		borderRadius: 8,
		backgroundColor: `${colors.light.secondary}55`,
	},
	cardCounts: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		justifyContent: 'space-between',
		gap: 8,
	},
	cardProgressText: {
		fontFamily: 'lexend-400',
		fontSize: 14,
		color: colors.dark.text,
	},
	sectionTitle: {
		fontSize: 14,
		fontFamily: 'lexend-600',
	},
	unlocks: {
		gap: 8,
	},
	wordResultsToggle: {
		minHeight: 44,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		gap: 8,
		borderTopWidth: 1,
		borderTopColor: colors.light.goldenBorder,
	},
	footer: {
		flexDirection: 'row',
		gap: 8,
		padding: 10,
		borderTopWidth: 1,
		borderTopColor: colors.light.goldenBorder,
	},
	footerButton: {
		flex: 1,
	},
});

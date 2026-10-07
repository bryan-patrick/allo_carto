import { storyAtlas } from '@/data/french/storyAtlas';
import colors from '@/src/app/colors';
import type { CardDeck } from '@/src/components/CardDeck/cardDeckTypes';
import CompletionPassage from '@/src/components/DeckCompletion/CompletionPassage';
import CompletionRewards from '@/src/components/DeckCompletion/CompletionRewards';
import CompletionStepIndicator from '@/src/components/DeckCompletion/CompletionStepIndicator';
import CompletionWordResults from '@/src/components/DeckCompletion/CompletionWordResults';
import { getCompletionEntry } from '@/src/components/DeckCompletion/completionAnimations';
import MaterialSymbol from '@/src/components/MaterialSymbol';
import { getDeck } from '@/src/db/interface';
import { useUserContext } from '@/src/db/useUserContext';
import { useUserProgress } from '@/src/db/useUserProgress';
import { useAppSettings } from '@/src/settings/useAppSettings';
import { getCardsPerDeck } from '@/src/util/cardsPerDeck';
import { createDeckSession } from '@/src/util/createDeckSession';
import { getDeckStoryColor } from '@/src/util/getDeckStoryColor';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import {
	Alert,
	BackHandler,
	ImageBackground,
	ScrollView,
	StyleSheet,
	Text,
	View,
	type ViewStyle,
} from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCardDeck } from '../CardDeck/useCardDeck';
import LinkButton from '../LinkButton';

/**
 * Use the postcard background and make the heading appear before the other items.
 */
const postcardBackground = require('@/src/app/assets/images/postcard-parts/background.jpg');
const headerEntry = getCompletionEntry(0);
/**
 * Names, icons, and messages for the three review steps, in order.
 */
const completionSteps = [
	{ title: 'Deck complete!', icon: 'task_alt', description: '' },
	{ title: 'Word results', icon: 'cards_star', description: 'Here’s how you did on each word.' },
	{ title: 'XP & rewards', icon: 'trophy', description: 'Great work! Here’s what you earned.' },
];

/**
 * The story and chapter IDs needed to return to the deck list.
 */
interface DeckAtlasLocation {
	chapterId: string;
	storyId: string;
}

/**
 * Find the story and chapter that contain this deck.
 * The Finish button uses their IDs to return to the right chapter.
 */
function findDeckAtlasLocation(cardDeck: CardDeck): DeckAtlasLocation | undefined {
	for (const story of storyAtlas.stories) {
		for (const chapter of story.chapters) {
			const deck = chapter.decks.find(deck => {
				/**
				 * Look for a matching deck ID first.
				 */
				if (deck.id === cardDeck.id) {
					return true;
				}

				/**
				 * If the ID does not match, check the title and words.
				 * The word count and every word ID must match too.
				 */
				const isSameTitle = deck.title === cardDeck.title;
				const hasSameWordCount = deck.wordIds.length === cardDeck.wordIds.length;
				const hasSameWords = deck.wordIds.every(wordId => {
					return cardDeck.wordIds.includes(wordId);
				});

				return isSameTitle && hasSameWordCount && hasSameWords;
			});

			if (deck) {
				return { chapterId: chapter.id, storyId: story.id };
			}
		}
	}
}

/**
 * Show the passage, word results, and rewards as three review steps
 */
export default function DeckResultsView() {
	/**
	 * Get the deck, saved results, user, XP, and settings from the app.
	 */
	const { experience, isUpdatingProgress } = useUserProgress();
	const { cardDeckState, cardDeckDispatch } = useCardDeck();
	const { id: userId } = useUserContext() ?? {};
	const { settings } = useAppSettings();
	const { cardDeck, session } = cardDeckState;

	/**
	 * step picks the review page: 0 is the passage, 1 is words, and 2 is rewards.
	 * isRepeating shows that we are loading the deck again.
	 */
	const [step, setStep] = useState(0);
	const [isRepeating, setIsRepeating] = useState(false);

	/**
	 * Block another Repeat press right away while the deck is loading.
	 */
	const isStartingDeck = useRef(false);

	/**
	 * Leave room for the phone's controls at the bottom of the screen.
	 */
	const { bottom } = useSafeAreaInsets();

	/**
	 * Find the chapter to return to when the user finishes the review.
	 */
	const atlasLocation = findDeckAtlasLocation(cardDeck);

	/**
	 * Use the story's color and the current step's heading text and icon.
	 */
	const storyColor = getDeckStoryColor(cardDeck.id);
	const metadata = completionSteps[step];

	/**
	 * Results are ready to review once the reward summary has been saved.
	 */
	const hasReview = Boolean(session?.completion);

	/**
	 * Offer Repeat deck only on the last review step.
	 */
	const showRepeat = hasReview && step === completionSteps.length - 1;

	/**
	 * Choose how many cards to repeat using the user's level and settings.
	 */
	const cardsPerDeck = getCardsPerDeck(experience.level, settings.cardsPerDeck);

	/**
	 * Block Repeat while the user is unknown, progress is saving, or a deck is loading.
	 */
	const repeatDisabled = !userId || isUpdatingProgress || isRepeating;

	/**
	 * Start with the normal heading and button labels for this step.
	 * Change them below when the review needs a different message.
	 */
	let description = metadata.description;
	let repeatLabel = 'Repeat deck';
	let nextLabel = 'Next';
	let content;
	let title = metadata.title;
	let icon = metadata.icon;

	/**
	 * Repeat shows Starting while the deck loads.
	 */
	if (isRepeating) {
		repeatLabel = 'Starting…';
	}

	/**
	 * Choose the content for this step: passage first, words next, and rewards last.
	 * If there are no saved results, show a message and let the user leave.
	 */
	if (hasReview && session) {
		switch (step) {
			case 0:
				/**
				 * Show the deck title and passage on the first step.
				 * If no words were correct, call it a review instead of a completed deck.
				 */
				description = cardDeck.title;

				if (!cardDeckState.isComplete) {
					title = 'Deck review';
					icon = 'menu_book';
				}

				content = (
					<CompletionPassage
						deck={cardDeck}
						results={session.results}
					/>
				);

				break;
			case 1:
				/**
				 * Show each word's result on the second step.
				 */
				content = (
					<CompletionWordResults
						words={cardDeck.words}
						results={session.results}
						color={storyColor}
					/>
				);

				break;
			case 2:
				/**
				 * Show rewards and use Finish on the last step.
				 * Encourage another review attempt if the deck did not count as complete.
				 */
				nextLabel = 'Finish';

				if (!cardDeckState.isComplete) {
					description = 'Keep practicing, you can repeat this deck.';
				}

				content = (
					<CompletionRewards
						session={session}
						color={storyColor}
					/>
				);

				break;
		}
	} else {
		title = 'No deck results to review';
		icon = 'menu_book';
		description = 'Finish a review attempt to see your results and rewards.';
		nextLabel = 'Finish';
	}

	/**
	 * Return to the deck's chapter and open its deck list again.
	 * If we cannot find the chapter, return to the home screen.
	 */
	const handleFinish = useCallback(() => {
		if (atlasLocation) {
			/**
			 * Send a new request each time so the chapter opens its deck list again.
			 */
			router.dismissTo({
				pathname: '/ChapterSelect',
				params: {
					...atlasLocation,
					deckPickerRequest: String(Date.now()),
				},
			});
			return;
		}

		router.replace('/(tabs)');
	}, [atlasLocation]);

	/**
	 * Load the deck again using saved word progress and the user's settings.
	 * Start a new review attempt with its own results and rewards.
	 */
	async function handleRepeat() {
		if (repeatDisabled || isStartingDeck.current || !hasReview || !userId) {
			return;
		}

		/**
		 * Block more Repeat presses and show Starting while the deck loads.
		 */
		isStartingDeck.current = true;
		setIsRepeating(true);

		try {
			/**
			 * Load the cards with the user's latest word progress and deck size.
			 */
			const selectedDeck = await getDeck({ deck: cardDeck, amount: cardsPerDeck, userId });

			/**
			 * Stay on this screen if the deck is missing or has no cards.
			 */
			if (!selectedDeck || selectedDeck.words.length === 0) {
				Alert.alert('Could not start deck', 'Please try again.');
				return;
			}

			/**
			 * Use the loaded cards for a new review attempt.
			 * Remember the user's starting XP so we can show how much they earn.
			 */
			cardDeckDispatch({
				type: 'SET_DECK',
				payload: selectedDeck,
				session: createDeckSession(experience.totalXP),
			});

			router.replace('/CardDeck');
		} catch (error) {
			console.error('Could not repeat deck:', error);
			Alert.alert('Could not start deck', 'Please try again.');
		} finally {
			/**
			 * Allow another Repeat press after this loading attempt ends.
			 */
			isStartingDeck.current = false;
			setIsRepeating(false);
		}
	}

	/**
	 * Move to the next review step, or finish if this is the last step.
	 * Also finish if there are no results to review.
	 */
	function handleNext() {
		if (!hasReview || step === completionSteps.length - 1) {
			handleFinish();
			return;
		}

		setStep(step + 1);
	}

	/**
	 * Go to the previous review step, or leave if this is the first step.
	 */
	useFocusEffect(
		useCallback(() => {
			const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
				if (isStartingDeck.current) {
					return true;
				}

				if (step > 0) {
					setStep(step - 1);
				} else {
					handleFinish();
				}

				return true;
			});
			return () => subscription.remove();
		}, [step, handleFinish]),
	);

	/**
	 * Keep the content above the phone's bottom controls and use the story color for headings.
	 */
	const containerStyle = { paddingBottom: Math.max(bottom, 8) };
	const headingColor = { color: storyColor };
	const repeatButtonStyle: ViewStyle[] = [styles.backButton];

	if (repeatDisabled) {
		repeatButtonStyle.push(styles.disabledButton);
	}

	/**
	 * Show Back only after the first review step.
	 */
	let backButton;

	if (step > 0) {
		backButton = (
			<LinkButton
				handler={() => setStep(step - 1)}
				disabled={isRepeating}
				useArrow={false}
				type="outline"
				showShadow={false}
				showInnerBorder={false}
				color={storyColor}
				style={styles.backButton}
			>
				← Back
			</LinkButton>
		);
	}

	/**
	 * Use the same button for Next and Finish, with the label chosen above.
	 */
	const nextButton = (
		<LinkButton
			handler={handleNext}
			disabled={isRepeating}
			color={storyColor}
			fullwidth
			style={styles.nextButton}
		>
			{nextLabel}
		</LinkButton>
	);

	/**
	 * Change the footer content depending on step
	 */
	let footerContent = (
		<View style={styles.footerRow}>
			{backButton}
			<View style={styles.footerActions}>{nextButton}</View>
		</View>
	);

	if (showRepeat) {
		footerContent = (
			<>
				<View style={styles.footerRow}>
					{backButton}
					<LinkButton
						handler={handleRepeat}
						disabled={repeatDisabled}
						color={storyColor}
						useArrow={false}
						type="outline"
						showShadow={false}
						showInnerBorder={false}
						style={repeatButtonStyle}
					>
						{repeatLabel}
					</LinkButton>
				</View>
				{nextButton}
			</>
		);
	}

	/**
	 * Render it
	 */
	return (
		<View style={[styles.container, containerStyle]}>
			<ImageBackground
				source={postcardBackground}
				style={styles.postcard}
			>
				<View style={styles.postcardBorder}>
					<Animated.View
						key={`header-${step}`}
						entering={headerEntry}
						style={styles.header}
					>
						<View style={styles.headingRow}>
							<MaterialSymbol
								name={icon}
								size={28}
								color={storyColor}
							/>
							<View style={styles.headingText}>
								<Text
									accessibilityRole="header"
									style={[styles.title, headingColor]}
								>
									{title}
								</Text>
								<Text style={styles.description}>{description}</Text>
							</View>
						</View>
						{hasReview && (
							<CompletionStepIndicator
								step={step}
								color={storyColor}
							/>
						)}
					</Animated.View>
					<View
						key={step}
						style={styles.content}
					>
						<ScrollView
							contentContainerStyle={styles.scrollContent}
							showsVerticalScrollIndicator
						>
							{content}
						</ScrollView>
					</View>
					<View style={styles.footer}>{footerContent}</View>
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
		padding: 12,
		gap: 10,
		borderBottomWidth: 1,
		borderBottomColor: colors.light.goldenBorder,
	},
	headingRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
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
	content: { flex: 1, minHeight: 0 },
	scrollContent: { padding: 12, paddingTop: 10, paddingBottom: 16 },
	footer: {
		gap: 8,
		padding: 10,
		borderTopWidth: 1,
		borderTopColor: colors.light.goldenBorder,
	},
	backButton: { flex: 1, minHeight: 44 },
	footerRow: { flexDirection: 'row', gap: 8 },
	footerActions: { flex: 1 },
	nextButton: { minHeight: 44 },
	disabledButton: { opacity: 0.5 },
});

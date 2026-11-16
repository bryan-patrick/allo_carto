import colors from '@/src/app/colors';
import sharedStyles from '@/src/app/sharedStyles';
import { useUserProgress } from '@/src/db/useUserProgress';
import {
	defaultEnglishPrefixChoices,
	getEnglishFlashcardAnswers,
	getEnglishPrefixes,
} from '@/src/util/englishWordParts';
import { useEffect, useLayoutEffect, useReducer, useRef, useState, type ReactNode } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { englishArticles } from '../../util/filterFillerWords';
import getFillerWords from '../../util/getFillerWords';
import { type Word } from '../CardDeck/cardDeckTypes';
import type { DeckWordResultProps } from '../CardDeck/deckSessionTypes';
import { useCardDeck } from '../CardDeck/useCardDeck';
import SVGRightArrow from '../SVG/SVGRightArrow';
import WordCard from './WordCard';
import WordCardButton from './WordCardButton';
import {
	getFeedbackKey,
	initialWordCardState,
	WordCardUIContext,
	type WordCardStateProps,
} from './wordCardContext';
import WordCardSelection from './WordCardSelection';
import { wordCardUIReducer } from './wordCardUIReducer';

/**
 * Typing
 */
interface CardContainerProps {
	word: Word;
	isCurrent: boolean;
	wordActions?: ReactNode;
}

interface ResumeWordCardOptions {
	word: Word;
	result?: DeckWordResultProps;
}

/**
 * Starts unanswered flashcards ready to play and marks cards with saved answers as finished.
 */
function getStartingWordCardState({ word, result }: ResumeWordCardOptions): WordCardStateProps {
	const acceptedPrefixes = getEnglishPrefixes(word);
	const acceptedWordAnswers = getEnglishFlashcardAnswers(word);

	if (!result) {
		return initialWordCardState;
	}

	const resumedState: WordCardStateProps = {
		...initialWordCardState,
		stage: 'COMPLETED',
		progress: result.outcome === 'incorrect' ? 'DANGER' : 'SUCCESS',
		selectedArticle: acceptedPrefixes[0] ?? null,
		selectedWord: acceptedWordAnswers[0] ?? null,
		isAnswerRevealed: result.outcome === 'skipped',
	};

	return {
		...resumedState,
		feedbackKey: getFeedbackKey(resumedState),
	};
}

const MIN_SAME_PART_OF_SPEECH_WRONG_ANSWERS = 3;

function countWrongAnswerChoices(words: string[], correctAnswers: string[]) {
	const lowerCaseCorrectAnswers = new Set(
		correctAnswers.map(correctAnswer => correctAnswer.toLowerCase()),
	);
	const wrongAnswerChoices = new Set<string>();

	for (const word of words) {
		const lowerCaseWord = word.toLowerCase();

		if (!lowerCaseCorrectAnswers.has(lowerCaseWord)) {
			wrongAnswerChoices.add(lowerCaseWord);
		}
	}

	return wrongAnswerChoices.size;
}

/**
 * Keeps prefixes and other meanings of the current word out of the wrong choices.
 */
function isAvailableWordChoice(
	choice: string,
	prefixChoices: Set<string>,
	correctWordChoices: Set<string>,
): boolean {
	const normalizedChoice = choice.toLowerCase();

	return !prefixChoices.has(normalizedChoice) && !correctWordChoices.has(normalizedChoice);
}

/**
 * WordCardContainer Component
 */
export default function WordCardContainer({ word, isCurrent, wordActions }: CardContainerProps) {
	/**
	 * State
	 */
	const { cardDeckState } = useCardDeck();
	const { isUpdatingProgress, writeWordSeen: recordWordSeen } = useUserProgress();
	const [fillerWords, setFillerWords] = useState<string[]>([]);
	const [articleWords, setArticleWords] = useState<string[]>([]);
	const loadedWordId = useRef<string | null>(null);
	const seenWordId = useRef<string | null>(null);
	const savedResult = cardDeckState.session?.results.find(result => result.wordId === word.id);
	const [cardState, wordCardUIDispatch] = useReducer(
		wordCardUIReducer,
		{
			word,
			result: savedResult,
		},
		getStartingWordCardState,
	);
	const isNextCardButton = cardState.stage === 'CORRECT' || cardState.stage === 'INCORRECT';
	const nextCardArrowColor =
		cardState.progress === 'SUCCESS' ? colors.dark.text : colors.light.text;

	/**
	 * Increment the seen count when a card becomes current.
	 */
	useEffect(() => {
		async function markWordSeen() {
			if (!isCurrent || isUpdatingProgress || savedResult) {
				return;
			}
			if (seenWordId.current === word.id) {
				return;
			}

			const didWrite = await recordWordSeen(word.id, cardDeckState.cardDeck.id);

			if (didWrite) {
				seenWordId.current = word.id;
			}
		}

		markWordSeen();
	}, [
		isCurrent,
		isUpdatingProgress,
		recordWordSeen,
		word.id,
		cardDeckState.cardDeck.id,
		savedResult,
	]);

	/**
	 * Side effects
	 *
	 * Load the new card and its state.
	 * Note that we use the id to check for a new card.
	 */
	useEffect(() => {
		async function loadWords() {
			/**
			 * Checking an answer updates the deck's words array, which reruns this
			 * effect and reshuffles the choices mid card, which is bad mmmk?
			 *
			 * In other words it moves the MappedWords around.
			 * To future me, put the crowbar down and slowly back away.
			 */
			if (loadedWordId.current === word.id) return;
			loadedWordId.current = word.id;

			/**
			 * Keep the accepted prefixes and second-slot answers in separate groups of buttons.
			 * Older cards keep their usual article choices.
			 */
			const acceptedPrefixes = getEnglishPrefixes(word);
			const acceptedWordAnswers = getEnglishFlashcardAnswers(word);
			const correctWordChoices = new Set(
				[...word.englishWords, ...acceptedWordAnswers].map(meaning => meaning.toLowerCase()),
			);
			const uniquePrefixChoices = new Set<string>();
			let prefixChoicePool = englishArticles;
			let prefixDistractorCount: number | undefined;

			if (word.englishPrefixes) {
				prefixChoicePool = defaultEnglishPrefixChoices;
				/**
				 * Keep the first group as small as the usual article group.
				 * Both correct prefixes count toward its total number of choices.
				 */
				prefixDistractorCount = Math.max(0, englishArticles.length - acceptedPrefixes.length);
			}

			const availablePrefixChoices = prefixChoicePool.filter(prefix => {
				return !correctWordChoices.has(prefix.toLowerCase());
			});

			if (acceptedPrefixes.length > 0) {
				for (const prefix of [...availablePrefixChoices, ...acceptedPrefixes]) {
					uniquePrefixChoices.add(prefix.toLowerCase());
				}
			}

			/**
			 * Put all the deck's English meanings into one list.
			 * Leave out prefixes and other correct meanings so they cannot become wrong choices.
			 */
			const deckWordChoices = cardDeckState.cardDeck.wordChoices
				.flatMap(choice => choice.englishWords)
				.filter(choice => isAvailableWordChoice(choice, uniquePrefixChoices, correctWordChoices));

			/**
			 * Start with all word choices. Below, we try to use words of the same kind,
			 * such as other verbs when the current word is a verb.
			 */
			let matchingWordChoices = deckWordChoices;

			if (word.partOfSpeech) {
				matchingWordChoices = cardDeckState.cardDeck.wordChoices
					.filter(choice => choice.partOfSpeech === word.partOfSpeech)
					.flatMap(choice => choice.englishWords)
					.filter(choice => isAvailableWordChoice(choice, uniquePrefixChoices, correctWordChoices));

				if (
					countWrongAnswerChoices(matchingWordChoices, acceptedWordAnswers) <
					MIN_SAME_PART_OF_SPEECH_WRONG_ANSWERS
				) {
					matchingWordChoices = deckWordChoices;
				}
			}

			setFillerWords(
				await getFillerWords({
					correctWords: acceptedWordAnswers,
					words: matchingWordChoices,
				}),
			);

			if (acceptedPrefixes.length > 0) {
				setArticleWords(
					await getFillerWords({
						amount: prefixDistractorCount,
						words: availablePrefixChoices,
						correctWords: acceptedPrefixes,
					}),
				);
			} else {
				setArticleWords([]);
			}
		}

		loadWords();
	}, [word, cardDeckState.cardDeck.wordChoices]);

	/**
	 * Handle current card styles
	 */
	const currentPosition = useSharedValue(isCurrent ? 0 : 1000);
	const currentOpacity = useSharedValue(isCurrent ? 1 : 0);
	const positionStyle = useAnimatedStyle(() => ({
		left: currentPosition.get(),
		opacity: currentOpacity.get(),
	}));

	/**
	 * Kind of a shuffle animation effect
	 */
	useLayoutEffect(() => {
		if (isCurrent) {
			currentPosition.set(
				withTiming(0, {
					duration: 250,
				}),
			);
			currentOpacity.set(
				withTiming(1.0, {
					duration: 100,
				}),
			);
		} else {
			currentPosition.set(
				withTiming(500, {
					duration: 500,
				}),
			);
			currentOpacity.set(
				withTiming(0, {
					duration: 250,
				}),
			);
		}
	}, [isCurrent, currentPosition, currentOpacity]);

	/**
	 * Render the WordCard container
	 */
	return (
		<WordCardUIContext.Provider value={{ cardState, wordCardUIDispatch }}>
			<Animated.View style={[styles.container, positionStyle]}>
				<WordCard
					isCurrent={isCurrent}
					wordActions={wordActions}
				/>
				<WordCardSelection
					articleWords={articleWords}
					fillerWords={fillerWords}
				/>
				<WordCardButton
					SVGElement={
						isNextCardButton ?
							<SVGRightArrow
								color={nextCardArrowColor}
								height="24"
								width="24"
							/>
						:	<></>
					}
				>
					{isNextCardButton ? 'Next card' : 'Check'}
				</WordCardButton>
			</Animated.View>
		</WordCardUIContext.Provider>
	);
}

/**
 * Styles
 */
const styles = StyleSheet.create({
	container: {
		height: '100%',
		display: 'flex',
		padding: sharedStyles.containerMargin,
		justifyContent: 'space-around',
		left: 500, // animation start position
	},
});

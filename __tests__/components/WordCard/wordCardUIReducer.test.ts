import { Word } from '@/src/components/CardDeck/cardDeckTypes';
import {
	WordCardStateProps,
	initialWordCardState,
} from '@/src/components/WordCard/wordCardContext';
import { wordCardUIReducer } from '@/src/components/WordCard/wordCardUIReducer';

/**
 * Fake card with an article
 */
const cardWithArticle: Word = {
	id: 'word_noun_cafe',
	frenchWord: 'cafe',
	frenchArticle: 'le',
	englishArticle: 'The',
	englishWords: ['coffee'],
	pronunciation: 'ka-fay',
	isVulgar: false,
	CEFR: 'A1',
	correctCount: 14,
};

/**
 * Fake card without an article
 */
const cardWithoutArticle: Word = {
	id: 'word_verb_manger',
	frenchWord: 'manger',
	englishWords: ['eat'],
	pronunciation: 'mahn-zhay',
	isVulgar: false,
	CEFR: 'A1',
	correctCount: 3,
};

/**
 * Make state so we don't type this trash all day
 */
function makeState(
	overrides: Partial<WordCardStateProps> = {},
): WordCardStateProps {
	return {
		...initialWordCardState,
		...overrides,
	};
}

/**
 * Test the WordCard reducer
 */
describe('wordCardUIReducer', () => {
	/**
	 * Test article selection
	 */
	test('selects and toggles the article', () => {
		const selectedState = wordCardUIReducer(initialWordCardState, {
			type: 'SELECT_ARTICLE',
			word: 'The',
		});

		expect(selectedState.selectedArticle).toBe('The');
		expect(selectedState.progress).toBe('PENDING');
		expect(selectedState.mistake).toBe('NONE');
		expect(selectedState.feedbackKey).toBe('READY_PENDING_NONE');

		const toggledState = wordCardUIReducer(selectedState, {
			type: 'SELECT_ARTICLE',
			word: 'The',
		});

		expect(toggledState.selectedArticle).toBeNull();
	});

	/**
	 * Test word selection
	 */
	test('selects and toggles the word', () => {
		const selectedState = wordCardUIReducer(initialWordCardState, {
			type: 'SELECT_WORD',
			word: 'coffee',
		});

		expect(selectedState.selectedWord).toBe('coffee');
		expect(selectedState.progress).toBe('PENDING');
		expect(selectedState.mistake).toBe('NONE');
		expect(selectedState.feedbackKey).toBe('READY_PENDING_NONE');

		const toggledState = wordCardUIReducer(selectedState, {
			type: 'SELECT_WORD',
			word: 'coffee',
		});

		expect(toggledState.selectedWord).toBeNull();
	});

	/**
	 * Test that we don't keep selecting after the card is done
	 */
	test('ignores selections once the card is no longer ready', () => {
		const state = makeState({
			stage: 'CORRECT',
			progress: 'SUCCESS',
			selectedWord: 'coffee',
			feedbackKey: 'CORRECT_SUCCESS_NONE',
		});

		const nextState = wordCardUIReducer(state, {
			type: 'SELECT_WORD',
			word: 'tea',
		});

		expect(nextState).toBe(state);
	});

	/**
	 * Correct answer. oooooo weeeeeeee
	 */
	test('marks a correct answer as correct', () => {
		const state = makeState({
			selectedArticle: 'The',
			selectedWord: 'coffee',
		});

		const nextState = wordCardUIReducer(state, {
			type: 'CHECK_ANSWER',
			currentCard: cardWithArticle,
		});

		expect(nextState.stage).toBe('CORRECT');
		expect(nextState.progress).toBe('SUCCESS');
		expect(nextState.mistake).toBe('NONE');
		expect(nextState.attempts).toBe(1);
		expect(nextState.feedbackKey).toBe('CORRECT_SUCCESS_NONE');
	});

	/**
	 * Wrong
	 */
	test('warns when the answer is wrong but attempts remain', () => {
		const state = makeState({
			selectedArticle: 'A',
			selectedWord: 'tea',
			maxAttempts: 2,
		});

		const nextState = wordCardUIReducer(state, {
			type: 'CHECK_ANSWER',
			currentCard: cardWithArticle,
		});

		expect(nextState.stage).toBe('READY');
		expect(nextState.progress).toBe('WARNING');
		expect(nextState.mistake).toBe('BOTH');
		expect(nextState.attempts).toBe(1);
		expect(nextState.feedbackKey).toBe('READY_WARNING_BOTH');
	});

	/**
	 * Wrong and out of tries. No point 4 u.
	 */
	test('marks an answer incorrect when max attempts are gone', () => {
		const state = makeState({
			selectedArticle: 'A',
			selectedWord: 'tea',
			maxAttempts: 1,
		});

		const nextState = wordCardUIReducer(state, {
			type: 'CHECK_ANSWER',
			currentCard: cardWithArticle,
		});

		expect(nextState.stage).toBe('INCORRECT');
		expect(nextState.progress).toBe('DANGER');
		expect(nextState.mistake).toBe('BOTH');
		expect(nextState.attempts).toBe(1);
		expect(nextState.feedbackKey).toBe('INCORRECT_DANGER_BOTH');
	});

	/**
	 * Verbs don't need the article thing
	 */
	test('checks cards without articles without demanding an article', () => {
		const state = makeState({
			selectedWord: 'eat',
		});

		const nextState = wordCardUIReducer(state, {
			type: 'CHECK_ANSWER',
			currentCard: cardWithoutArticle,
		});

		expect(nextState.stage).toBe('CORRECT');
		expect(nextState.progress).toBe('SUCCESS');
		expect(nextState.mistake).toBe('NONE');
	});

	/**
	 * Next check completes the card
	 */
	test('moves correct and incorrect cards to completed on the next check', () => {
		const correctState = makeState({
			stage: 'CORRECT',
			progress: 'SUCCESS',
			feedbackKey: 'CORRECT_SUCCESS_NONE',
			attempts: 1,
		});

		const completedCorrectState = wordCardUIReducer(correctState, {
			type: 'CHECK_ANSWER',
			currentCard: cardWithArticle,
		});

		expect(completedCorrectState.stage).toBe('COMPLETED');
		expect(completedCorrectState.progress).toBe('SUCCESS');
		expect(completedCorrectState.attempts).toBe(2);
		expect(completedCorrectState.feedbackKey).toBe('COMPLETED_SUCCESS_NONE');

		const incorrectState = makeState({
			stage: 'INCORRECT',
			progress: 'DANGER',
			mistake: 'WORD',
			feedbackKey: 'INCORRECT_DANGER_WORD',
			attempts: 2,
		});

		const completedIncorrectState = wordCardUIReducer(incorrectState, {
			type: 'CHECK_ANSWER',
			currentCard: cardWithArticle,
		});

		expect(completedIncorrectState.stage).toBe('COMPLETED');
		expect(completedIncorrectState.progress).toBe('DANGER');
		expect(completedIncorrectState.attempts).toBe(3);
		expect(completedIncorrectState.feedbackKey).toBe('COMPLETED_DANGER_WORD');
	});

	/**
	 * Do nothing if there's nothing to do
	 */
	test('does nothing when checking without a current card or after completion', () => {
		const readyState = makeState({
			selectedWord: 'coffee',
		});

		const missingCardState = wordCardUIReducer(readyState, {
			type: 'CHECK_ANSWER',
			currentCard: undefined,
		});

		expect(missingCardState).toBe(readyState);

		const completedState = makeState({
			stage: 'COMPLETED',
			progress: 'SUCCESS',
			feedbackKey: 'COMPLETED_SUCCESS_NONE',
		});

		const nextCompletedState = wordCardUIReducer(completedState, {
			type: 'CHECK_ANSWER',
			currentCard: cardWithArticle,
		});

		expect(nextCompletedState).toBe(completedState);
	});
});

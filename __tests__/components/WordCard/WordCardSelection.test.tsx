import { useCardDeck } from '@/src/components/CardDeck/useCardDeck';
import { makeMockCardDeck, makeMockCardDeckState } from '@/src/components/CardDeck/mockCardDeck';
import { type Word } from '@/src/components/CardDeck/cardDeckTypes';
import { useWordCardUI } from '@/src/components/WordCard/useWordCardUI';
import { initialWordCardState } from '@/src/components/WordCard/wordCardContext';
import WordCardSelection from '@/src/components/WordCard/WordCardSelection';
import { fireEvent, render } from '@testing-library/react-native';

jest.mock('@/src/components/CardDeck/useCardDeck');
jest.mock('@/src/components/WordCard/useWordCardUI');

const mockUseCardDeck = jest.mocked(useCardDeck);
const mockUseWordCardUI = jest.mocked(useWordCardUI);

describe('<WordCardSelection />', () => {
	test('selects article and word answers when pressed', async () => {
		const currentCard: Word = {
			id: 'word_noun_cafe',
			frenchWord: 'cafe',
			englishArticle: 'The',
			englishWords: ['coffee'],
			pronunciation: 'ka-fay',
			isVulgar: false,
			CEFR: 'A1',
			correctCount: 14,
		};
		const cardDeck = makeMockCardDeck({ words: [currentCard] });
		const wordCardUIDispatch = jest.fn();

		mockUseCardDeck.mockReturnValue({
			cardDeckState: makeMockCardDeckState({ cardDeck }),
			cardDeckDispatch: jest.fn(),
			currentCard,
		});
		mockUseWordCardUI.mockReturnValue({
			cardState: initialWordCardState,
			wordCardUIDispatch,
		});

		const { getByText } = await render(
			<WordCardSelection
				articleWords={['The', 'A']}
				fillerWords={['coffee', 'tea']}
			/>,
		);

		await fireEvent.press(getByText('A'));
		await fireEvent.press(getByText('tea'));

		expect(wordCardUIDispatch).toHaveBeenCalledWith({
			type: 'SELECT_ARTICLE',
			word: 'A',
		});
		expect(wordCardUIDispatch).toHaveBeenCalledWith({
			type: 'SELECT_WORD',
			word: 'tea',
		});
	});
});

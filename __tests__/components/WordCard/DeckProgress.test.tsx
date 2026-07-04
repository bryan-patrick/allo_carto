import colors from '@/src/app/colors';
import {
  makeMockCardDeck,
  makeMockCardDeckState,
} from '@/src/components/CardDeck/mockCardDeck';
import { useCardDeck } from '@/src/components/CardDeck/useCardDeck';
import DeckProgress from '@/src/components/WordCard/DeckProgress';
import { render } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';

jest.mock('@/src/components/CardDeck/useCardDeck');

const mockUseCardDeck = jest.mocked(useCardDeck);

describe('<DeckProgress />', () => {
  test('marks incorrect words with danger fill and adds progressive rarity glow', () => {
    const words = [
      {
        id: 'word_fnew',
        frenchWord: 'bonjour',
        englishWords: ['hello'],
        pronunciation: 'bohn-zhoor',
        isVulgar: false,
        CEFR: 'A1' as const,
        correctCount: 0,
      },
      {
        id: 'word_silver_wrong',
        frenchWord: 'chat',
        englishWords: ['cat'],
        pronunciation: 'shah',
        isVulgar: false,
        CEFR: 'A1' as const,
        correctCount: 7,
        rarity: 'Rare' as const,
      },
      {
        id: 'word_diamond_current',
        frenchWord: 'chien',
        englishWords: ['dog'],
        pronunciation: 'shee-ehn',
        isVulgar: false,
        CEFR: 'A1' as const,
        correctCount: 15,
        rarity: 'Legendary' as const,
      },
    ];

    mockUseCardDeck.mockReturnValue({
      cardDeckState: makeMockCardDeckState({
        currentIndex: 2,
        cardDeck: makeMockCardDeck({ words }),
        incorrectWords: [words[1]],
      }),
      cardDeckDispatch: jest.fn(),
      currentCard: words[2],
    });

    const { getByTestId } = render(<DeckProgress />);
    const wrongBlipStyle = StyleSheet.flatten(
      getByTestId('progress-blip-word_silver_wrong').props.style,
    );
    const currentBlipStyle = StyleSheet.flatten(
      getByTestId('progress-blip-word_diamond_current').props.style,
    );

    expect(wrongBlipStyle.backgroundColor).toBe(colors.light.danger);
    expect(wrongBlipStyle.borderColor).toBe(colors.light.danger);
    expect(wrongBlipStyle.shadowColor).toBe(colors.light.danger);
    expect(wrongBlipStyle.shadowRadius).toBe(4);
    expect(wrongBlipStyle.shadowOpacity).toBe(1);

    expect(currentBlipStyle.backgroundColor).toBe('transparent');
    expect(currentBlipStyle.shadowRadius).toBe(16);
    expect(currentBlipStyle.shadowOpacity).toBe(0);
  });
});

import colors from '@/src/app/colors';
import {
  makeMockCardDeck,
  makeMockCardDeckState,
} from '@/src/components/CardDeck/mockCardDeck';
import type { Word } from '@/src/components/CardDeck/cardDeckTypes';
import { useCardDeck } from '@/src/components/CardDeck/useCardDeck';
import DeckProgress from '@/src/components/WordCard/DeckProgress';
import { render } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';

jest.mock('@/src/components/CardDeck/useCardDeck');

const mockUseCardDeck = jest.mocked(useCardDeck);

describe('<DeckProgress />', () => {
  test('marks incorrect words with danger fill and adds progressive rarity glow', async () => {
    const words: Word[] = [
      {
        id: 'word_fnew',
        frenchWord: 'bonjour',
        englishWords: ['hello'],
        pronunciation: 'bohn-zhoor',
        isVulgar: false,
        CEFR: 'A1',
        correctCount: 0,
      },
      {
        id: 'word_silver_wrong',
        frenchWord: 'chat',
        englishWords: ['cat'],
        pronunciation: 'shah',
        isVulgar: false,
        CEFR: 'A1',
        correctCount: 7,
        rarity: 'Rare',
      },
      {
        id: 'word_diamond_current',
        frenchWord: 'chien',
        englishWords: ['dog'],
        pronunciation: 'shee-ehn',
        isVulgar: false,
        CEFR: 'A1',
        correctCount: 15,
        rarity: 'Legendary',
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

    const { getByTestId } = await render(<DeckProgress />);
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

  test('fills a correct word before moving to the next card', async () => {
    const words: Word[] = [
      {
        id: 'word_fnew',
        frenchWord: 'bonjour',
        englishWords: ['hello'],
        pronunciation: 'bohn-zhoor',
        isVulgar: false,
        CEFR: 'A1',
        correctCount: 0,
      },
      {
        id: 'word_gold_current',
        frenchWord: 'chat',
        englishWords: ['cat'],
        pronunciation: 'shah',
        isVulgar: false,
        CEFR: 'A1',
        correctCount: 12,
        rarity: 'Epic',
      },
    ];

    mockUseCardDeck.mockReturnValue({
      cardDeckState: makeMockCardDeckState({
        currentIndex: 1,
        cardDeck: makeMockCardDeck({ words }),
        correctWords: [words[1]],
      }),
      cardDeckDispatch: jest.fn(),
      currentCard: words[1],
    });

    const { getByTestId } = await render(<DeckProgress />);
    const currentBlipStyle = StyleSheet.flatten(
      getByTestId('progress-blip-word_gold_current').props.style,
    );

    expect(currentBlipStyle.backgroundColor).toBe(colors.rarity.Epic);
    expect(currentBlipStyle.borderColor).toBe(colors.rarity.Epic);
    expect(currentBlipStyle.opacity).toBe(1);
    expect(currentBlipStyle.shadowOpacity).toBe(1);
  });
});

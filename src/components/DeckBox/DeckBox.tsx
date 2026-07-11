import { useCardDeck } from "@/src/components/CardDeck/useCardDeck";
import { getDeck, getWordProgressById } from "@/src/db/interface";
import getDeckRankCounts, {
  DeckRankCounts,
  emptyDeckRankCounts,
} from "@/src/db/queries/getDeckRankCounts";
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from "react";
import { StyleSheet, View } from "react-native";
import colors from "../../app/colors";
import sharedStyles from "../../app/sharedStyles";
import { useUserContext } from "../../db/useUserContext";
import { getDeckCompletionPercent } from "../../util/deckCompletion";
import type { WordProgressKey } from "../../util/wordRanks";
import type { CardDeck } from "../CardDeck/cardDeckTypes";
import DeckBoxFooter from "./DeckBoxFooter";
import DeckBoxHeader from "./DeckBoxHeader";
import DeckBoxHero from "./DeckBoxHero";
import DeckBoxStoryProgress from "./DeckBoxStoryProgress";

/**
 * Typing
 */
interface SelectCardDeckProps {
  deck: CardDeck;
  placeId?: string;
}

/**
 * DeckBox component
 */
export default function DeckBox({ deck, placeId }: SelectCardDeckProps) {
  const user = useUserContext();
  const { cardDeckDispatch } = useCardDeck();
  const [ rankCounts, setRankCounts ] = useState<DeckRankCounts>(emptyDeckRankCounts);
  const [ wordProgressKeyByWordId, setWordProgressKeyByWordId ] = useState<Record<string, WordProgressKey>>({});
  const [ modalVisible, setModalVisible ] = useState(false);

  /**
   * Destructure styles
   */
  const {
    cardStyle,
    cardInnerStyle,
    cardInnerBorder
  } = styles;

  /**
   * Deck completion
   */
  const deckCompletionPercent = getDeckCompletionPercent({
    deckWordCount: deck.wordIds.length,
    rankCounts,
  });

  /**
   * Data loaders
   */
  const loadRankCounts = useCallback(async () => {
    try {
      if (!user?.id) {
        setRankCounts(emptyDeckRankCounts);
        return;
      }

      const counts = await getDeckRankCounts({
        userId: user.id,
        wordIds: deck.wordIds,
      });

      setRankCounts(counts);

    } catch (error) {
      console.error('Could not retrieve deck rank counts:', error);
    }
  }, [ user?.id, deck.wordIds ]);

  const loadStoryWordProgress = useCallback(async () => {
    try {
      if (user?.id) {
        const storyWordProgressKeyByWordId = await getWordProgressById({
          userId: user.id,
          story: deck.story,
        });

        setWordProgressKeyByWordId(storyWordProgressKeyByWordId);
        return;
      }

      setWordProgressKeyByWordId({});

    } catch (error) {
      console.error('Could not retrieve story word progress:', error);
    }
  }, [ user?.id, deck.story ]);

  /**
   * The story blips weren't updating when returning
   * to the deck selection after completing a deck 
   * so I was all like, "whoa, that's like...a problem".
   */
  useFocusEffect(
    useCallback(() => {
      loadRankCounts();
      loadStoryWordProgress();
    }, [
      loadRankCounts,
      loadStoryWordProgress,
    ])
  );

  /**
   * ReviewDeck handler
   */
  const handleDeckSelect = useCallback(async (selectedDeck: CardDeck) => {
    if (user?.id) {
      const deck = await getDeck({
        deck: selectedDeck,
        userId: user.id
      });

      if (deck) {
        cardDeckDispatch({ type: 'SET_DECK', payload: deck });
        router.push('/CardDeckRankSelect');
      }
    }
  }, [
    user?.id,
    cardDeckDispatch
  ]);

  /**
   * Refresh story data and show modal
   */
  async function handleShowStory() {
    await Promise.all([
      loadRankCounts(),
      loadStoryWordProgress(),
    ]);

    setModalVisible(true);
  }

  /**
   * Open the full card list for this deck.
   */
  function handleViewCards() {
    router.push({
      pathname: '/ViewCards',
      params: {
        deckTitle: deck.title,
        placeId,
      },
    });
  }

  /**
   * Render the card grid
   */
  return (
    <View style={cardStyle}>
      <View style={cardInnerStyle}>
        <View style={cardInnerBorder}>
          <DeckBoxHeader deck={deck} />
          <DeckBoxHero
            deck={deck}
            rankCounts={rankCounts}
          />
          <DeckBoxStoryProgress
            deck={deck}
            deckCompletionPercent={deckCompletionPercent}
            handleShowStory={handleShowStory}
            handleViewCards={handleViewCards}
            modalVisible={modalVisible}
            rankCounts={rankCounts}
            setModalVisible={setModalVisible}
            wordProgressKeyByWordId={wordProgressKeyByWordId}
          />
          <DeckBoxFooter
            deck={deck}
            handleDeckSelect={handleDeckSelect}
          />
        </View>
      </View>
    </View>
  );
}

/**
 * Destructure shared styles
 */
const { containerMargin } = sharedStyles;

/**
 * Styles
 */
const styles = StyleSheet.create({
  cardStyle: {
    margin: containerMargin,
  },
  cardInnerStyle: {
    borderRadius: 22,
    borderWidth: 4,
    borderColor: colors.light.border,
    backgroundColor: colors.light.background,
    boxShadow: `0 20px 0 ${colors.dark.border}`,
  },
  cardInnerBorder: {
    borderWidth: 3,
    borderRadius: 18,
    borderColor: colors.dark.border
  }
});

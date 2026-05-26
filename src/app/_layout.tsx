import { ThemeProvider } from "@react-navigation/native";
import { useFonts } from 'expo-font';
import { Stack } from "expo-router";
import { SQLiteProvider } from "expo-sqlite";
import { useReducer } from "react";
import { CardDeckContext, initialCardDeckState } from "../components/CardDeck/cardDeckContext";
import { cardDeckReducer } from "../components/CardDeck/cardDeckReducer";
import { getDB, getTables } from "../db/interface";
import alloTheme from './alloTheme';

/**
 * AppLayout Component
 * 
 * "Off we go again."
 * - Vladimir, Waiting for Godot
 */
export default function AppLayout() {
  const [cardDeckState, cardDeckDispatch] = useReducer(cardDeckReducer, initialCardDeckState);

  useFonts({
    'lexend-variable': require('./assets/fonts/lexend-variable.ttf')
  });

  /**
   * SLQLite provider init
   */
  async function initDB() {
    await getDB();
    await getTables();
  }

  /**
   * The (tabs) dir are navigable routes on the bottom bar
   * All other routes go in dir (routes)
   * 
   * Note: that deck context needs to be outside the SQLiteProvider.
   * The SQLiteProvider can prevent context updates that are insanely
   * difficult to debug. Don't put context inside of it.
   */
  return (
    <ThemeProvider value={alloTheme}>
      <CardDeckContext.Provider value={{
        cardDeckState,
        cardDeckDispatch
      }}>
        <SQLiteProvider databaseName="allo_carto.db" onInit={initDB}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{
              headerShown: false,
              headerTitle: 'Home'
            }} />
            <Stack.Screen name="(routes)/Deck" options={{
              headerShown: true,
              headerBackTitle: 'Home',
              headerTitle: 'Review a deck'
            }} />
            <Stack.Screen name="(routes)/ChooseDeck" options={{
              headerShown: true,
              headerBackTitle: 'Home',
              headerTitle: 'Choose a Deck'
            }} />
          </Stack>
        </SQLiteProvider>
      </CardDeckContext.Provider>
    </ThemeProvider>
  )
}

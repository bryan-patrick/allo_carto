import { ThemeProvider } from "@react-navigation/native";
import { useFonts } from 'expo-font';
import { Stack } from "expo-router";
import { SQLiteProvider } from "expo-sqlite";
import { Suspense, useEffect, useReducer, useState } from "react";
import { CardDeckContext, initialCardDeckState } from "../components/CardDeck/cardDeckContext";
import { cardDeckReducer } from "../components/CardDeck/cardDeckReducer";
import Loader from "../components/Loader";
import { deleteDB, getDB, getTables } from "../db/interface";
import getMonHomme, { UserRow } from "../db/queries/getMonHomme";
import { UserContext } from "../db/userContext";
import alloTheme from './alloTheme';

/**
 * Set to true to delete/reset the db
 * Remember to put it back
 */
const resetDB = false;

/**
 * AppLayout Component
 * 
 * "Off we go again."
 * - Vladimir, Waiting for Godot
 */
export default function AppLayout() {

  /**
   * State
   */
  const [cardDeckState, cardDeckDispatch] = useReducer(cardDeckReducer, initialCardDeckState);
  const [user, setUser] = useState<UserRow | null>(null);

  /**
   * Load our fonts
   */
  useFonts({
    'lexend-variable': require('./assets/fonts/lexend-variable.ttf'),
    'red-hat-variable': require('./assets/fonts/red-hat-variable.ttf'),
  });

  /**
   * SLQLite provider init
   */
  async function initDB() {
    await getDB();
    await getTables();
    const monHomme = await getMonHomme();
    setUser(monHomme);
  }

  useEffect(() => {
    async function doReset() {
      await deleteDB();
      console.log('Reset DB!');
    }

    if (resetDB) doReset();
  }, [])

  /**
   * The (tabs) dir are navigable routes on the bottom bar
   * All other routes go in dir (routes)
   * 
   * Note: that deck context needs to be outside the SQLiteProvider.
   * The SQLiteProvider can prevent context updates that are insanely
   * difficult to debug. Don't put context inside of it.
   */
  return (
    <UserContext value={user}>
      <ThemeProvider value={alloTheme}>
        <CardDeckContext value={{
          cardDeckState,
          cardDeckDispatch
        }}>
          <Suspense fallback={<Loader />}>
            {!resetDB &&
              <SQLiteProvider
                databaseName="allo_carto.db"
                onInit={initDB}
                useSuspense
              >
                <Stack>
                  <Stack.Screen name="(tabs)" options={{
                    headerShown: false,
                    headerTitle: 'Home',
                  }} />
                  <Stack.Screen name="(routes)/CardDeck" options={{
                    headerShown: true,
                    headerBackTitle: 'Back',
                    headerBackButtonDisplayMode: 'minimal',
                    headerTitle: 'Review a deck'
                  }} />
                  <Stack.Screen name="(routes)/ChooseCardDeck" options={{
                    headerShown: true,
                    headerBackTitle: 'Home',
                    headerTitle: 'Choose a Deck',
                    headerBackButtonDisplayMode: 'minimal',
                  }} />
                  <Stack.Screen name="(routes)/DeckResults" options={{
                    headerShown: true,
                    headerTitle: 'Results',
                    headerBackVisible: false
                  }} />
                </Stack>
              </SQLiteProvider>
            }
          </Suspense>
        </CardDeckContext>
      </ThemeProvider>
    </UserContext>
  )
}

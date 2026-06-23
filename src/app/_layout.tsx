import { ThemeProvider } from "@react-navigation/native";
import { useFonts } from 'expo-font';
import { Stack } from "expo-router";
import { SQLiteProvider, type SQLiteDatabase } from "expo-sqlite";
import { Suspense, useCallback, useReducer, useState } from "react";
import { CardDeckContext, initialCardDeckState } from "../components/CardDeck/cardDeckContext";
import { cardDeckReducer } from "../components/CardDeck/cardDeckReducer";
import Loader from "../components/Loader";
import { getTables, setDB } from "../db/interface";
import getMonHomme, { UserRow } from "../db/queries/getMonHomme";
import { UserContext } from "../db/userContext";
import alloTheme from './alloTheme';

/**
 * Set to true to delete/reset the db
 * Remember to put it back!
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
    'lexend-400': require('./assets/fonts/lexend-400.ttf'),
    'lexend-600': require('./assets/fonts/lexend-600.ttf'),
    'lexend-700': require('./assets/fonts/lexend-700.ttf'),
    'azeret-mono-400': require('./assets/fonts/azeret-mono-400.ttf'),
    'azeret-mono-600': require('./assets/fonts/azeret-mono-600.ttf'),
  });

  /**
   * SLQLite provider init
   */
  const initDB = useCallback(async (database: SQLiteDatabase) => {
    setDB(database);

    if (resetDB) {
      await database.execAsync(`
        DROP TABLE IF EXISTS userWords;
        DROP TABLE IF EXISTS users;
        DROP TABLE IF EXISTS words;
      `);
      console.log('Reset DB!');
    }

    await getTables();
    const monHomme = await getMonHomme();
    setUser(monHomme);
  }, []);

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
                <Stack.Screen name="(routes)/CardDeckSelect" options={{
                  headerShown: true,
                  headerBackTitle: 'Back',
                  headerBackButtonDisplayMode: 'minimal',
                  headerTitle: 'Select a Deck'
                }} />
                <Stack.Screen name="(routes)/PlaceSelect" options={{
                  headerShown: true,
                  headerBackTitle: 'Home',
                  headerTitle: 'Select a Chapter and Place',
                  headerBackButtonDisplayMode: 'minimal',
                }} />
                <Stack.Screen name="(routes)/DeckResults" options={{
                  headerShown: true,
                  headerTitle: 'Results',
                  headerBackVisible: false
                }} />
              </Stack>
            </SQLiteProvider>
          </Suspense>
        </CardDeckContext>
      </ThemeProvider>
    </UserContext>
  )
}

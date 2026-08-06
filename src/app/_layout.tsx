import { setAudioModeAsync } from 'expo-audio';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { ThemeProvider } from 'expo-router/react-navigation';
import { SQLiteProvider, type SQLiteDatabase } from 'expo-sqlite';
import { Suspense, useCallback, useEffect, useReducer, useState } from 'react';
import { CardDeckContext, initialCardDeckState } from '../components/CardDeck/cardDeckContext';
import { cardDeckReducer } from '../components/CardDeck/cardDeckReducer';
import Loader from '../components/Loader';
import { getTables, setDB } from '../db/interface';
import getMonHomme, { UserRow } from '../db/queries/getMonHomme';
import { UserContext } from '../db/userContext';
import { UserProgressProvider } from '../db/userProgressContext';
import { validateProgression } from '../util/atlasProgression';
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
	const [isDatabaseReady, setIsDatabaseReady] = useState(false);

	/**
	 * Load our fonts
	 */
	useFonts({
		'lexend-400': require('./assets/fonts/lexend-400.ttf'),
		'lexend-600': require('./assets/fonts/lexend-600.ttf'),
		'lexend-700': require('./assets/fonts/lexend-700.ttf'),
		'azeret-mono-400': require('./assets/fonts/azeret-mono-400.ttf'),
		'azeret-mono-600': require('./assets/fonts/azeret-mono-600.ttf'),
		'shadows-400': require('./assets/fonts/shadows-400.ttf'),
	});

	/**
	 * Let short UI sounds play without interrupting other device audio.
	 */
	useEffect(() => {
		setAudioModeAsync({
			interruptionMode: 'mixWithOthers',
		}).catch(error => {
			console.error('Could not set audio mode:', error);
		});
	}, []);

	/**
	 * SLQLite provider init
	 */
	const initDB = useCallback(async (database: SQLiteDatabase) => {
		setDB(database);
		validateProgression();

		if (resetDB) {
			await database.execAsync(`
        DROP TABLE IF EXISTS userProgress;
        DROP TABLE IF EXISTS userWords;
        DROP TABLE IF EXISTS users;
        DROP TABLE IF EXISTS words;
      `);
			console.log('Reset DB!');
		}

		await getTables();
		const monHomme = await getMonHomme();
		setUser(monHomme);
		setIsDatabaseReady(true);
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
				<CardDeckContext
					value={{
						cardDeckState,
						cardDeckDispatch,
					}}
				>
					<UserProgressProvider
						isDatabaseReady={isDatabaseReady}
						userId={user?.id}
					>
						<Suspense fallback={<Loader />}>
							<SQLiteProvider
								databaseName="allo_carto.db"
								onInit={initDB}
								useSuspense
							>
								<Stack>
									<Stack.Screen
										name="(tabs)"
										options={{
											headerShown: false,
											headerTitle: 'Home',
										}}
									/>
									<Stack.Screen
										name="(routes)/CardDeck"
										options={{
											headerShown: true,
											headerBackTitle: 'Back',
											headerBackButtonDisplayMode: 'minimal',
											headerTitle: 'Deck',
										}}
									/>
									<Stack.Screen
										name="(routes)/ChapterSelect"
										options={{
											headerShown: true,
											headerBackTitle: 'Back',
											headerBackButtonDisplayMode: 'minimal',
											headerTitle: 'Choose Chapter',
										}}
									/>
									<Stack.Screen
										name="(routes)/PlaceSelect"
										options={{
											headerShown: true,
											headerBackTitle: 'Home',
											headerTitle: 'Choose Place',
											headerBackButtonDisplayMode: 'minimal',
										}}
									/>
									<Stack.Screen
										name="(routes)/CardDeckSelect"
										options={{
											headerShown: true,
											headerBackTitle: 'Back',
											headerBackButtonDisplayMode: 'minimal',
											headerTitle: 'Choose Deck',
										}}
									/>
									<Stack.Screen
										name="(routes)/CardDeckRankSelect"
										options={{
											headerShown: true,
											headerBackTitle: 'Back',
											headerBackButtonDisplayMode: 'minimal',
											headerTitle: 'Select a Rank',
										}}
									/>
									<Stack.Screen
										name="(routes)/ViewCards"
										options={{
											headerShown: true,
											headerBackTitle: 'Back',
											headerBackButtonDisplayMode: 'minimal',
											headerTitle: 'View Cards',
										}}
									/>
									<Stack.Screen
										name="(routes)/DeckResults"
										options={{
											headerShown: true,
											headerTitle: 'Results',
											headerBackVisible: false,
										}}
									/>
								</Stack>
							</SQLiteProvider>
						</Suspense>
					</UserProgressProvider>
				</CardDeckContext>
			</ThemeProvider>
		</UserContext>
	);
}

import { MaterialSymbols_400Regular } from '@expo-google-fonts/material-symbols/400Regular';
import { setAudioModeAsync } from 'expo-audio';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import {
	getFocusedRouteNameFromRoute,
	ThemeProvider,
	type Route,
} from 'expo-router/react-navigation';
import { SQLiteProvider, type SQLiteDatabase } from 'expo-sqlite';
import { Suspense, useCallback, useEffect, useReducer, useState } from 'react';
import { CardDeckContext, initialCardDeckState } from '../components/CardDeck/cardDeckContext';
import { cardDeckReducer } from '../components/CardDeck/cardDeckReducer';
import LevelBadge from '../components/LevelBadge';
import Loader from '../components/Loader';
import SelectionBreadcrumbs from '../components/SelectionBreadcrumbs';
import DeckProgress from '../components/WordCard/DeckProgress';
import { getTables, setDB } from '../db/interface';
import getMonHomme, { UserRow } from '../db/queries/getMonHomme';
import { UserContext } from '../db/userContext';
import { UserProgressProvider } from '../db/userProgressContext';
import { AppSettingsProvider } from '../settings/appSettingsContext';
import alloTheme from './alloTheme';

/**
 * Set to true to delete/reset the db
 * Remember to put it back!
 */
const resetDB = false;

/**
 * The native header follows the current tab
 */
function getTabHeaderOptions(route: Route<string>) {
	const tabName = getFocusedRouteNameFromRoute(route) ?? 'index';

	if (tabName === 'index') {
		return {
			headerShown: true,
			headerTransparent: true,
			headerTitle: () => <SelectionBreadcrumbs currentViewIndex={0} />,
		};
	}

	let headerTitle = 'Collections';

	if (tabName === 'settings') {
		headerTitle = 'Settings';
	}

	return {
		headerShown: true,
		headerTransparent: false,
		headerTitle,
	};
}

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
	const [fontsLoaded, fontError] = useFonts({
		MaterialSymbols_400Regular,
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

		if (resetDB) {
			await database.execAsync(`
        DROP TABLE IF EXISTS deckCompletions;
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
	}, []);

	if (fontError) {
		throw fontError;
	}

	if (!fontsLoaded) {
		return <Loader />;
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
		<UserContext value={user}>
			<ThemeProvider value={alloTheme}>
				<CardDeckContext
					value={{
						cardDeckState,
						cardDeckDispatch,
					}}
				>
					<AppSettingsProvider>
						<Suspense fallback={<Loader />}>
							<SQLiteProvider
								databaseName="allo_carto.db"
								onInit={initDB}
								useSuspense
							>
								<UserProgressProvider userId={user?.id}>
									<Stack
										screenOptions={{
											headerRight: () => <LevelBadge />,
										}}
									>
										<Stack.Screen
											name="(tabs)"
											options={({ route }) => getTabHeaderOptions(route)}
										/>
										<Stack.Screen
											name="(routes)/CardDeck"
											options={{
												headerShown: true,
												headerBackTitle: 'Back',
												headerBackButtonDisplayMode: 'minimal',
												headerTitle: () => <DeckProgress />,
											}}
										/>
										<Stack.Screen
											name="(routes)/StorySelect"
											options={{
												headerShown: true,
												headerTransparent: true,
												headerBackTitle: 'Home',
												headerBackButtonDisplayMode: 'minimal',
												headerTitle: '',
											}}
										/>
										<Stack.Screen
											name="(routes)/ChapterSelect"
											options={{
												headerShown: true,
												headerTransparent: true,
												headerBackTitle: 'Back',
												headerTitle: () => <SelectionBreadcrumbs currentViewIndex={1} />,
												headerBackButtonDisplayMode: 'minimal',
												scrollEdgeEffects: {
													top: 'hidden',
												},
											}}
										/>
										<Stack.Screen
											name="(routes)/CardDeckSelect"
											options={{
												headerShown: true,
												headerTransparent: true,
												headerBackTitle: 'Back',
												headerTitle: () => <SelectionBreadcrumbs currentViewIndex={2} />,
												headerBackButtonDisplayMode: 'minimal',
											}}
										/>
										<Stack.Screen
											name="(routes)/ViewCards"
											options={{
												headerShown: true,
												headerBackTitle: 'Back',
												headerTransparent: true,
												headerBackButtonDisplayMode: 'minimal',
												headerTitle: 'View cards',
											}}
										/>
										<Stack.Screen
											name="(routes)/DeckResults"
											options={{
												headerShown: true,
												headerTitle: () => <SelectionBreadcrumbs currentViewIndex={2} />,
												headerBackVisible: false,
												gestureEnabled: false,
											}}
										/>
									</Stack>
								</UserProgressProvider>
							</SQLiteProvider>
						</Suspense>
					</AppSettingsProvider>
				</CardDeckContext>
			</ThemeProvider>
		</UserContext>
	);
}

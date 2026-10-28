import { MaterialSymbols_400Regular } from '@expo-google-fonts/material-symbols/400Regular';
import { MaterialSymbols_400Regular_Filled } from '@expo-google-fonts/material-symbols/400Regular_Filled';
import { setAudioModeAsync } from 'expo-audio';
import { useFonts } from 'expo-font';
import { Stack, ThemeProvider } from 'expo-router';
import {
	getFocusedRouteNameFromRoute,
	type DescriptorRouteProp,
	type ParamListBase,
} from 'expo-router/react-navigation';
import { SQLiteProvider, type SQLiteDatabase } from 'expo-sqlite';
import { Suspense, useCallback, useEffect, useReducer, useState } from 'react';
import { Platform } from 'react-native';
import { CardDeckContext, initialCardDeckState } from '../components/CardDeck/cardDeckContext';
import { cardDeckReducer } from '../components/CardDeck/cardDeckReducer';
import ChapterSelectHeader from '../components/ChapterSelectHeader';
import LevelBadge from '../components/LevelBadge';
import Loader from '../components/Loader';
import DeckProgress from '../components/WordCard/DeckProgress';
import { getTables, setDB } from '../db/interface';
import getMonHomme, { UserRow } from '../db/queries/getMonHomme';
import saveSelectedStory from '../db/queries/saveSelectedStory';
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
function getTabHeaderOptions(route: DescriptorRouteProp<ParamListBase>) {
	const tabName = getFocusedRouteNameFromRoute(route) ?? 'index';

	if (tabName === 'index') {
		return {
			headerShown: true,
			headerTransparent: false,
			header: () => <ChapterSelectHeader />,
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
	const userId = user?.id;

	const selectStory = useCallback(
		async (storyId: string): Promise<boolean> => {
			if (!userId) {
				return false;
			}

			try {
				await saveSelectedStory({ userId, storyId });
				setUser(currentUser => (currentUser ? { ...currentUser, selectedStoryId: storyId } : null));
				return true;
			} catch (error) {
				console.error('Could not save the selected story:', error);
				return false;
			}
		},
		[userId],
	);

	/**
	 * Load our fonts
	 */
	const [fontsLoaded, fontError] = useFonts({
		MaterialSymbols_400Regular,
		MaterialSymbols_400Regular_Filled,
		'lexend-400': require('./assets/fonts/lexend-400.ttf'),
		'lexend-600': require('./assets/fonts/lexend-600.ttf'),
		'lexend-700': require('./assets/fonts/lexend-700.ttf'),
		'azeret-mono-400': require('./assets/fonts/azeret-mono-400.ttf'),
		'azeret-mono-600': require('./assets/fonts/azeret-mono-600.ttf'),
		'shadows-400': require('./assets/fonts/shadows-400.ttf'),
		'ipa-400': require('./assets/fonts/noto-sans-400.ttf'),
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
        DROP TABLE IF EXISTS solveStageAttempts;
        DROP TABLE IF EXISTS solveStagePositions;
        DROP TABLE IF EXISTS solveStageUnlocks;
        DROP TABLE IF EXISTS solveAttempts;
        DROP TABLE IF EXISTS solveCompletions;
        DROP TABLE IF EXISTS solveUnlocks;
        DROP TABLE IF EXISTS solvePositions;
        DROP TABLE IF EXISTS flashcardAwards;
        DROP TABLE IF EXISTS userInk;
        DROP TABLE IF EXISTS deckPassageFeedback;
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
		<UserContext value={user ? { ...user, selectStory } : null}>
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
											headerTransparent: false,
											headerTitleStyle: Platform.select({
												ios: alloTheme.fonts.bold,
												default: alloTheme.fonts.medium,
											}),
											headerBackTitleStyle: alloTheme.fonts.regular,
											headerRight: () => <LevelBadge />,
											// The badge supplies its own glass background in both header layouts.
											unstable_headerRightItems: () => [
												{ type: 'custom', element: <LevelBadge />, hidesSharedBackground: true },
											],
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
												headerTitle: '',
												headerBackButtonDisplayMode: 'minimal',
												scrollEdgeEffects: {
													top: 'hidden',
												},
											}}
										/>
										<Stack.Screen
											name="(routes)/ChapterDetail"
											options={{
												headerShown: true,
												headerTransparent: true,
												headerBackTitle: 'Back',
												headerTitle: '',
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
												headerTitle: '',
												headerBackButtonDisplayMode: 'minimal',
											}}
										/>
										<Stack.Screen
											name="(routes)/ViewCards"
											options={{
												headerShown: true,
												headerBackTitle: 'Back',
												headerBackButtonDisplayMode: 'minimal',
												headerTitle: 'View cards',
											}}
										/>
										<Stack.Screen
											name="(routes)/DeckResults"
											options={{
												headerShown: true,
												headerTitle: '',
												headerBackVisible: false,
												gestureEnabled: false,
											}}
										/>
										<Stack.Screen
											name="(routes)/Solve"
											options={{
												presentation: 'fullScreenModal',
												headerShown: false,
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

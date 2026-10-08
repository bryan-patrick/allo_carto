import colors from '@/src/app/colors';
import type { CardDeck } from '@/src/components/CardDeck/cardDeckTypes';
import type { DeckWordResultProps } from '@/src/components/CardDeck/deckSessionTypes';
import DeckPassageView from '@/src/components/DeckPassageView';
import MaterialSymbol from '@/src/components/MaterialSymbol';
import { getDB, getWordProgressById } from '@/src/db/interface';
import getDeckWordProgressCounts, {
	type DeckWordProgressCounts,
} from '@/src/db/queries/getDeckWordProgressCounts';
import { useUserContext } from '@/src/db/useUserContext';
import type { WordProgressKey } from '@/src/util/wordProgress';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { getCompletionEntry } from './completionAnimations';

const titleEntry = getCompletionEntry(1);

interface CompletionPassageProps {
	deck: CardDeck;
	results: DeckWordResultProps[];
}

interface PassageProgress {
	deck: CardDeck;
	userId: string;
	counts: DeckWordProgressCounts;
	byWordId: Record<string, WordProgressKey>;
}

/**
 * Use the modal's passage renderer with saved progress for the entire passage,
 * including vocabulary outside the cards selected for this session.
 */
export default function CompletionPassage({ deck, results }: CompletionPassageProps) {
	const { id: userId } = useUserContext() ?? {};
	const [progress, setProgress] = useState<PassageProgress>();
	const [hasLoadError, setHasLoadError] = useState(false);
	const [loadAttempt, setLoadAttempt] = useState(0);
	const hasCurrentProgress = progress?.deck === deck && progress.userId === userId;
	let message = 'Loading passage…';

	if (hasLoadError || !userId) {
		message = 'Could not load passage progress.';
	}

	useEffect(() => {
		if (!userId) return;
		let isActive = true;

		async function loadProgress() {
			try {
				const database = await getDB();
				const [counts, byWordId] = await Promise.all([
					getDeckWordProgressCounts({ database, userId: userId!, wordIds: deck.wordIds }),
					getWordProgressById({ userId: userId!, passage: deck.passage }),
				]);

				if (isActive) {
					setProgress({ deck, userId: userId!, counts, byWordId });
					setHasLoadError(false);
				}
			} catch (error) {
				console.error('Could not load completion passage progress:', error);

				if (isActive) setHasLoadError(true);
			}
		}

		loadProgress();
		return () => {
			isActive = false;
		};
	}, [deck, loadAttempt, userId]);

	function handleRetry() {
		setHasLoadError(false);
		setLoadAttempt(loadAttempt + 1);
	}

	const passageReminder = (
		<Animated.View
			entering={titleEntry}
			style={styles.reminder}
		>
			<MaterialSymbol
				color={colors.dark.primaryActive}
				name="menu_book"
				size={22}
			/>
			<Text
				accessibilityRole="header"
				style={styles.title}
			>
				Is the deck passage above easier to read now?
			</Text>
		</Animated.View>
	);

	if (hasCurrentProgress && progress) {
		return (
			<View style={styles.container}>
				<DeckPassageView
					deck={deck}
					minimumPassageHeight={0}
					results={results}
					sessionLegendHeader={passageReminder}
					showLearningControls={false}
					showProgress={false}
					showTitle={false}
					wordProgressCounts={progress.counts}
					wordProgressKeyByWordId={progress.byWordId}
				/>
			</View>
		);
	}

	return (
		<View style={styles.message}>
			<Text style={styles.text}>{message}</Text>
			{hasLoadError && userId && (
				<Pressable
					accessibilityRole="button"
					onPress={handleRetry}
					style={styles.retry}
				>
					<Text style={styles.text}>Retry</Text>
				</Pressable>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	reminder: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
	},
	title: {
		flexShrink: 1,
		fontFamily: 'lexend-600',
		fontSize: 18,
		color: colors.dark.text,
	},
	message: {
		padding: 16,
		gap: 12,
	},
	text: {
		fontFamily: 'lexend-400',
		fontSize: 14,
		color: colors.dark.text,
	},
	retry: {
		alignSelf: 'flex-start',
		minHeight: 44,
		justifyContent: 'center',
		paddingHorizontal: 16,
		borderWidth: 1,
		borderColor: colors.light.goldenBorder,
		borderRadius: 8,
	},
});

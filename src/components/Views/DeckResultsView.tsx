import colors from '@/src/app/colors';
import CompletionPassage from '@/src/components/DeckCompletion/CompletionPassage';
import CompletionRewards from '@/src/components/DeckCompletion/CompletionRewards';
import CompletionWordResults from '@/src/components/DeckCompletion/CompletionWordResults';
import MaterialSymbol from '@/src/components/MaterialSymbol';
import { useUserProgress } from '@/src/db/useUserProgress';
import { findCompletionPath } from '@/src/util/atlasCompletion';
import { getDeckStoryColor } from '@/src/util/getDeckStoryColor';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
	BackHandler,
	ImageBackground,
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCardDeck } from '../CardDeck/useCardDeck';
import LinkButton from '../LinkButton';

const postcardBackground = require('@/src/app/assets/images/postcard-parts/background.jpg');

/**
 * Show the flashcard results and return to the chapter when the player finishes.
 */
export default function DeckResultsView() {
	const router = useRouter();
	const { inkBalance, isUpdatingProgress, progressById } = useUserProgress();
	const { cardDeckState } = useCardDeck();
	const { cardDeck, session } = cardDeckState;
	const [showWordResults, setShowWordResults] = useState(false);
	const completionPath = findCompletionPath({ id: cardDeck.id });
	const chapter = completionPath[1];
	const storyColor = getDeckStoryColor(cardDeck.id);
	const hasReview = Boolean(session?.completion);
	const paragraphCardCount = cardDeck.wordIds.length;
	const seenCardCount = progressById[cardDeck.id]?.seenWordCount ?? 0;
	const newlySeenCards = cardDeck.words.filter(word => {
		const previousSeenCount = word.seenCount ?? 0;
		const wasUnseen = session?.unseenWordIds?.includes(word.id) ?? previousSeenCount === 0;
		const hasSessionResult = session?.results.some(result => result.wordId === word.id) ?? false;

		return wasUnseen && hasSessionResult;
	});
	const newlySeenCardCount = newlySeenCards.length;
	const headingStyle = {
		color: storyColor,
	};
	let title = 'You finished the flashcards!';
	let description = cardDeck.title;
	let wordResultsLabel = 'Show word results';
	let wordResultsIcon = 'expand_more';

	if (!hasReview) {
		title = 'No session results to review';
		description = 'Finish a flashcard session to see your results and rewards.';
	}

	if (showWordResults) {
		wordResultsLabel = 'Hide word results';
		wordResultsIcon = 'expand_less';
	}

	/**
	 * Return to the chapter we were studying, or Home if that chapter is missing.
	 */
	const handleFinish = useCallback(() => {
		if (chapter) {
			router.dismissTo({
				pathname: '/ChapterDetail',
				params: { chapterId: chapter.id },
			});
			return;
		}

		router.replace('/(tabs)');
	}, [chapter, router]);

	function handleToggleWordResults() {
		setShowWordResults(!showWordResults);
	}

	/**
	 * Android Back leaves results directly now that there are no review steps.
	 */
	useFocusEffect(
		useCallback(() => {
			const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
				handleFinish();
				return true;
			});

			return () => subscription.remove();
		}, [handleFinish]),
	);

	return (
		<SafeAreaView
			style={styles.container}
			edges={{
				bottom: 'maximum',
			}}
		>
			<ImageBackground
				source={postcardBackground}
				style={styles.postcard}
			>
				<View style={styles.postcardBorder}>
					<View style={[styles.section, styles.headingRow]}>
						<MaterialSymbol
							name="task_alt"
							size={24}
							color={storyColor}
						/>
						<View style={styles.headingText}>
							<Text
								accessibilityRole="header"
								style={[styles.title, headingStyle]}
							>
								{title}
							</Text>
							<Text style={styles.description}>{description}</Text>
						</View>
					</View>
					<ScrollView>
						{hasReview && session && (
							<>
								{cardDeck.passage.length > 0 && (
									<View style={styles.section}>
										<Text
											accessibilityRole="header"
											style={[styles.sectionTitle, headingStyle]}
										>
											Paragraph
										</Text>
										<CompletionPassage
											deck={cardDeck}
											results={session.results}
										/>
									</View>
								)}
								<View style={styles.section}>
									<Text
										accessibilityRole="header"
										style={[styles.sectionTitle, headingStyle]}
									>
										Rewards
									</Text>
									<CompletionRewards
										session={session}
										color={storyColor}
										inkBalance={inkBalance}
										newFlashcardsSeen={newlySeenCardCount}
										seenFlashcards={seenCardCount}
										totalFlashcards={paragraphCardCount}
									/>
								</View>
								<View style={styles.section}>
									<Pressable
										accessibilityRole="button"
										accessibilityLabel={wordResultsLabel}
										accessibilityState={{ expanded: showWordResults }}
										onPress={handleToggleWordResults}
										style={[styles.headingRow, styles.wordResultsToggle]}
									>
										<Text
											accessibilityRole="header"
											style={[styles.sectionTitle, headingStyle]}
										>
											Word results
										</Text>
										<MaterialSymbol
											name={wordResultsIcon}
											size={24}
											color={storyColor}
										/>
									</Pressable>
									{showWordResults && (
										<CompletionWordResults
											words={cardDeck.words}
											results={session.results}
											color={storyColor}
										/>
									)}
								</View>
							</>
						)}
					</ScrollView>
					<View style={styles.footer}>
						<LinkButton
							handler={handleFinish}
							disabled={isUpdatingProgress}
							color={storyColor}
							contentPaddingHorizontal={8}
							contentPaddingVertical={8}
							type="outline"
							showShadow={false}
							fullwidth
						>
							Finish
						</LinkButton>
					</View>
				</View>
			</ImageBackground>
		</SafeAreaView>
	);
}

/**
 * Styles
 */
const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 8,
		backgroundColor: colors.dark.background,
	},
	postcard: {
		flex: 1,
		width: '100%',
		maxWidth: 600,
		alignSelf: 'center',
		padding: 6,
		borderWidth: 1,
		borderColor: colors.light.border,
		borderRadius: 12,
		overflow: 'hidden',
		backgroundColor: colors.light.background,
	},
	postcardBorder: {
		flex: 1,
		borderWidth: 1,
		borderRadius: 8,
		borderColor: colors.light.goldenBorder,
		overflow: 'hidden',
	},
	headingRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		gap: 8,
	},
	headingText: {
		flex: 1,
		gap: 2,
	},
	title: {
		fontSize: 18,
		fontFamily: 'lexend-600',
	},
	description: {
		fontSize: 14,
		lineHeight: 18,
		fontFamily: 'lexend-400',
		color: colors.dark.text,
	},
	sectionTitle: {
		fontSize: 14,
		fontFamily: 'lexend-600',
	},
	section: {
		paddingHorizontal: 6,
		paddingVertical: 12,
		borderBottomWidth: 1,
		borderBottomColor: colors.light.goldenBorder,
		gap: 8,
	},
	wordResultsToggle: {},
	footer: {
		padding: 12,
		borderTopWidth: 1,
		borderTopColor: colors.light.goldenBorder,
	},
});

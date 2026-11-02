import colors from '@/src/app/colors';
import BackgroundImage from '@/src/components/BackgroundImage';
import type { CardDeck, Word } from '@/src/components/CardDeck/cardDeckTypes';
import LinkButton from '@/src/components/LinkButton';
import MaterialSymbol from '@/src/components/MaterialSymbol';
import TTSButton from '@/src/components/TTSButton';
import { getParagraphNumber } from '@/src/util/atlasCompletion';
import formatFrenchWordWithArticle from '@/src/util/formatFrenchWordWithArticle';
import { getDeckStoryColor } from '@/src/util/getDeckStoryColor';
import { ImageBackground } from 'expo-image';
import { useHeaderHeight } from 'expo-router/react-navigation';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const cardPageBackground = require('@/src/app/assets/images/card-bgs/card-page-bg.jpg');
const postcardBackground = require('@/src/app/assets/images/postcard-parts/background.jpg');

/*
 * Typing
 */
interface DeckPreviewViewProps {
	deck: CardDeck;
	isReadDisabled: boolean;
	onRead: () => Promise<void> | void;
	onStart: () => void;
}

interface PreviewWordRowProps {
	word: Word;
}

/*
 * Show each word's meaning, language level, and TTS button.
 */
function PreviewWordRow({ word }: PreviewWordRowProps) {
	const frenchWord = formatFrenchWordWithArticle({
		article: word.frenchArticle,
		word: word.frenchWord,
	});
	const englishDefinitions = word.englishWords.map(englishWord => {
		if (word.englishArticle) {
			return `${word.englishArticle} ${englishWord}`;
		}

		return englishWord;
	});
	const translation = englishDefinitions.join(', ');
	const cefrStyle = {
		backgroundColor: colors.light.CEFR[word.CEFR],
	};

	return (
		<View style={styles.wordRow}>
			<View
				accessible
				style={styles.wordDetails}
			>
				<Text style={styles.frenchWord}>{frenchWord}</Text>
				<Text style={styles.translation}>{translation}</Text>
			</View>
			<View style={styles.wordMetadata}>
				<Text
					accessibilityLabel={`CEFR level ${word.CEFR}`}
					style={[styles.cefrBadge, cefrStyle]}
				>
					{word.CEFR}
				</Text>
				<TTSButton wordsToSay={frenchWord} />
			</View>
		</View>
	);
}

/*
 * Lets the player read this deck's cards before starting the flashcards.
 */
export default function DeckPreviewView({
	deck,
	isReadDisabled,
	onRead,
	onStart,
}: DeckPreviewViewProps) {
	const headerHeight = useHeaderHeight();
	const storyColor = getDeckStoryColor(deck.id);
	const currentDeckNumber = (deck.flashcardProgress?.deckIndex ?? 0) + 1;
	const deckCount = deck.flashcardProgress?.deckCount ?? 1;
	const paragraphNumber = getParagraphNumber(deck.id);
	const contentInsetStyle = {
		paddingTop: headerHeight,
	};
	const headingStyle = {
		color: storyColor,
	};
	let deckLabel = `Deck ${currentDeckNumber}/${deckCount}`;

	if (paragraphNumber !== undefined) {
		deckLabel += ` · Paragraph ${paragraphNumber}`;
	}

	return (
		<BackgroundImage
			source={cardPageBackground}
			resizeMode="cover"
			style={[styles.background, contentInsetStyle]}
		>
			<SafeAreaView
				style={styles.container}
				edges={{
					bottom: 'maximum',
				}}
			>
				<ImageBackground
					source={postcardBackground}
					contentFit="cover"
					style={styles.postcard}
				>
					<View style={styles.postcardBorder}>
						<View style={styles.heading}>
							<View style={styles.headingRow}>
								<MaterialSymbol
									name="raven"
									size={32}
									color={storyColor}
								/>
								<View style={styles.headingText}>
									<View style={styles.titleRow}>
										<Text
											accessibilityRole="header"
											style={[styles.title, headingStyle]}
										>
											Paragraph Words
										</Text>
										<Pressable
											accessibilityRole="button"
											accessibilityLabel="Read paragraph"
											accessibilityState={{
												disabled: isReadDisabled,
											}}
											disabled={isReadDisabled}
											hitSlop={8}
											onPress={onRead}
											style={[styles.readLink, isReadDisabled && styles.disabledReadLink]}
										>
											<Text style={[styles.readLinkText, headingStyle]}>Read</Text>
											<MaterialSymbol
												name="menu_book"
												size={18}
												color={storyColor}
											/>
										</Pressable>
									</View>
									<Text style={styles.deckLabel}>{deckLabel}</Text>
								</View>
							</View>
							<Text style={styles.description}>
								Here are all the words you will see in this deck.
							</Text>
							<Text style={styles.description}>
								{' '}
								Don&apos;t worry, you don&apos;t have to memorize these!
							</Text>
						</View>
						<ScrollView contentContainerStyle={styles.wordList}>
							{deck.words.map(word => (
								<PreviewWordRow
									key={word.id}
									word={word}
								/>
							))}
						</ScrollView>
						<View style={styles.footer}>
							<LinkButton
								accessibilityRole="button"
								handler={onStart}
								color={storyColor}
								contentPaddingHorizontal={8}
								contentPaddingVertical={8}
								type="fill"
								fullwidth
							>
								Start flashcards
							</LinkButton>
						</View>
					</View>
				</ImageBackground>
			</SafeAreaView>
		</BackgroundImage>
	);
}

/*
 * Styles
 */
const styles = StyleSheet.create({
	background: {
		flex: 1,
	},
	container: {
		flex: 1,
		padding: 8,
	},
	postcard: {
		flex: 1,
		width: '100%',
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
	heading: {
		paddingHorizontal: 12,
		paddingVertical: 12,
		borderBottomWidth: 1,
		borderBottomColor: colors.light.goldenBorder,
		gap: 4,
	},
	headingRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
	},
	headingText: {
		flex: 1,
		gap: 2,
	},
	titleRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		gap: 8,
	},
	title: {
		flexShrink: 1,
		fontSize: 18,
		fontFamily: 'lexend-600',
	},
	readLink: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 4,
	},
	readLinkText: {
		fontSize: 14,
		fontFamily: 'lexend-600',
		textDecorationLine: 'underline',
	},
	disabledReadLink: {
		opacity: 0.5,
	},
	deckLabel: {
		fontSize: 12,
		lineHeight: 18,
		fontFamily: 'lexend-600',
		color: colors.dark.text,
	},
	description: {
		fontSize: 14,
		lineHeight: 18,
		fontFamily: 'lexend-400',
		color: colors.dark.text,
	},
	wordList: {
		paddingHorizontal: 10,
	},
	wordRow: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingVertical: 6,
		borderBottomWidth: 1,
		borderBottomColor: colors.light.goldenBorder,
		gap: 8,
	},
	wordDetails: {
		flex: 1,
		gap: 2,
	},
	wordMetadata: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
	},
	cefrBadge: {
		fontSize: 11,
		fontFamily: 'azeret-mono-600',
		color: colors.dark.text,
		borderRadius: 4,
		paddingHorizontal: 6,
		paddingVertical: 3,
	},
	frenchWord: {
		fontSize: 15,
		lineHeight: 20,
		fontFamily: 'lexend-600',
		color: colors.dark.text,
	},
	translation: {
		fontSize: 13,
		lineHeight: 18,
		fontFamily: 'lexend-400',
		color: colors.dark.text,
	},
	footer: {
		padding: 12,
		borderTopWidth: 1,
		borderTopColor: colors.light.goldenBorder,
	},
});

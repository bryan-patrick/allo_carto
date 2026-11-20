import colors from '@/src/app/colors';
import BackgroundImage from '@/src/components/BackgroundImage';
import { buttonContentStyles, buttonIconSize } from '@/src/components/buttonContentStyles';
import type { CardDeck, Word } from '@/src/components/CardDeck/cardDeckTypes';
import LinkButton from '@/src/components/LinkButton';
import MaterialSymbol from '@/src/components/MaterialSymbol';
import TTSButton from '@/src/components/TTSButton';
import { getEnglishTranslations } from '@/src/util/englishWordParts';
import formatFrenchWordWithArticle from '@/src/util/formatFrenchWordWithArticle';
import { getDeckStoryColor } from '@/src/util/getDeckStoryColor';
import { useHeaderHeight } from 'expo-router/react-navigation';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const cardPageBackground = require('@/src/app/assets/images/card-bgs/card-page-bg.jpg');
const postcardBackground = require('@/src/app/assets/images/postcard-parts/background.jpg');

/**
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
	isLastWord: boolean;
}

/**
 * Show each word's meaning, language level, and TTS button.
 */
function PreviewWordRow({ word, isLastWord }: PreviewWordRowProps) {
	const frenchWord = formatFrenchWordWithArticle({
		article: word.frenchArticle,
		word: word.frenchWord,
	});
	const englishDefinitions = getEnglishTranslations(word);
	const translation = englishDefinitions.join(', ');
	const cefrStyle = {
		backgroundColor: colors.light.CEFR[word.CEFR],
	};

	return (
		<View style={[styles.wordRow, isLastWord && styles.lastWordRow]}>
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
				<TTSButton
					wordsToSay={frenchWord}
					rate={1}
				/>
			</View>
		</View>
	);
}

/**
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
	const contentInsetStyle = {
		paddingTop: headerHeight,
	};
	const headingStyle = {
		color: storyColor,
	};
	let deckLabel = `Deck ${currentDeckNumber} of ${deckCount}`;

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
				<BackgroundImage
					source={postcardBackground}
					resizeMode="repeat"
					imageStyle={styles.paperImage}
					style={styles.postcard}
				>
					<View style={styles.postcardBorder}>
						<View style={styles.heading}>
							<View style={styles.headingRow}>
								<MaterialSymbol
									name="cards_stack"
									size={32}
									color={storyColor}
								/>
								<View style={styles.headingText}>
									<View style={styles.titleRow}>
										<Text
											accessibilityRole="header"
											style={[styles.title, headingStyle]}
										>
											{`${deckLabel}`}
										</Text>
									</View>
								</View>
							</View>
						</View>
						<ScrollView
							style={styles.scrollView}
							contentContainerStyle={styles.scrollContent}
						>
							<BackgroundImage
								source={postcardBackground}
								resizeMode="repeat"
								imageStyle={styles.paperImage}
								style={styles.scrollContent}
							>
								<View style={styles.wordList}>
									{deck.words.map((word, wordIndex) => (
										<PreviewWordRow
											key={word.id}
											word={word}
											isLastWord={wordIndex === deck.words.length - 1}
										/>
									))}
								</View>
							</BackgroundImage>
						</ScrollView>
						<View style={styles.footer}>
							<LinkButton
								accessibilityRole="button"
								accessibilityLabel="Read paragraph"
								accessibilityState={{
									disabled: isReadDisabled,
								}}
								disabled={isReadDisabled}
								handler={onRead}
								type="outline"
								color={storyColor}
								contentPaddingHorizontal={6}
								contentPaddingVertical={6}
								showInnerBorder={false}
								useArrow={false}
								iconPosition="left"
								SVGElement={
									<MaterialSymbol
										name="menu_book"
										style={buttonContentStyles.icon}
										size={buttonIconSize}
										color={storyColor}
									/>
								}
								textStyle={styles.actionButtonText}
								style={[styles.actionButton, isReadDisabled && styles.disabledReadLink]}
							>
								Read
							</LinkButton>
							<LinkButton
								accessibilityRole="button"
								handler={onStart}
								color={storyColor}
								contentPaddingHorizontal={6}
								contentPaddingVertical={6}
								type="fill"
								style={styles.actionButton}
								textStyle={styles.actionButtonText}
							>
								Start
							</LinkButton>
						</View>
					</View>
				</BackgroundImage>
			</SafeAreaView>
		</BackgroundImage>
	);
}

/**
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
		borderWidth: 1,
		borderColor: colors.light.border,
		borderRadius: 12,
		overflow: 'hidden',
		backgroundColor: colors.light.background,
	},
	postcardBorder: {
		flex: 1,
		margin: 6,
		borderWidth: 1,
		borderRadius: 8,
		borderColor: colors.light.goldenBorder,
		overflow: 'hidden',
	},
	paperImage: {
		width: '100%',
		height: '100%',
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
		gap: 4,
	},
	title: {
		flexShrink: 1,
		fontSize: 26,
		fontFamily: 'shadows-400',
	},
	disabledReadLink: {
		opacity: 0.5,
	},
	deckLabel: {
		fontSize: 14,
		lineHeight: 20,
		fontFamily: 'lexend-400',
		color: colors.dark.text,
	},
	description: {
		fontSize: 16,
		lineHeight: 20,
		fontFamily: 'lexend-400',
		color: colors.dark.text,
	},
	scrollView: {
		flex: 1,
	},
	scrollContent: {
		flexGrow: 1,
		width: '100%',
	},
	wordList: {
		flexGrow: 1,
		width: '100%',
		paddingHorizontal: 12,
	},
	wordRow: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingVertical: 12,
		borderBottomWidth: 1,
		borderBottomColor: colors.light.goldenBorder,
		gap: 8,
	},
	lastWordRow: {
		borderBottomWidth: 0,
	},
	wordDetails: {
		flex: 1,
	},
	wordMetadata: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
	},
	cefrBadge: {
		fontSize: 12,
		fontFamily: 'azeret-mono-600',
		color: colors.dark.text,
		borderRadius: 4,
		paddingHorizontal: 4,
		paddingVertical: 3,
	},
	frenchWord: {
		fontSize: 15,
		lineHeight: 20,
		fontFamily: 'lexend-600',
		color: colors.dark.text,
	},
	translation: {
		fontSize: 15,
		lineHeight: 20,
		fontFamily: 'lexend-400',
		color: colors.dark.text,
	},
	actionButton: {
		flexBasis: 0,
		flexGrow: 1,
		flexShrink: 1,
		minWidth: 0,
		paddingVertical: 0,
	},
	actionButtonText: {
		flexShrink: 1,
	},
	footer: {
		flexDirection: 'row',
		alignItems: 'stretch',
		gap: 8,
		padding: 12,
		borderTopWidth: 1,
		borderTopColor: colors.light.goldenBorder,
	},
});

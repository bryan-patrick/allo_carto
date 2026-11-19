import colors from '@/src/app/colors';
import { buttonContentStyles } from '@/src/components/buttonContentStyles';
import type { CollectionsPageScrollProps } from '@/src/components/Collections/collectionsPageTypes';
import GlossaryWordRow from '@/src/components/Collections/GlossaryWordRow';
import MaterialSymbol from '@/src/components/MaterialSymbol';
import type { FrenchTip } from '@/src/components/Tips/tipTypes';
import WordTipModal from '@/src/components/WordCard/WordTipModal';
import { useUserProgress } from '@/src/db/useUserProgress';
import { getGlossarySections, glossaryLetters } from '@/src/util/glossary';
import { useSoftTapSound } from '@/src/util/softTapSound';
import { ImageBackground } from 'expo-image';
import { useMemo, useRef, useState, type RefObject } from 'react';
import { Animated, Pressable, StyleSheet, Text, View, type ScrollViewInstance } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';

const postcardBackground = require('@/src/app/assets/images/postcard-parts/background.jpg');

/**
 * Typing
 */
interface GlossaryLetterButtonProps {
	letter: string;
	isLetterAvailable: boolean;
	scrollView: RefObject<ScrollViewInstance | null>;
	sectionOffsets: RefObject<Record<string, number>>;
}

/**
 * Jumps to a letter's heading when the glossary contains words for that letter.
 */
function GlossaryLetterButton({
	letter,
	isLetterAvailable,
	scrollView,
	sectionOffsets,
}: GlossaryLetterButtonProps) {
	/**
	 * Tap sound and scrolling preference
	 */
	const playSoftTap = useSoftTapSound();
	const isReducedMotionEnabled = useReducedMotion();

	return (
		<Pressable
			accessibilityRole="button"
			accessibilityLabel={`Jump to ${letter}`}
			accessibilityState={{
				disabled: !isLetterAvailable,
			}}
			disabled={!isLetterAvailable}
			onPress={() => {
				const sectionOffset = sectionOffsets.current[letter];

				if (sectionOffset === undefined) {
					return;
				}

				void playSoftTap();

				scrollView.current?.scrollTo({
					y: sectionOffset,
					animated: !isReducedMotionEnabled,
				});
			}}
			style={({ pressed }) => [
				styles.letterButton,
				!isLetterAvailable && styles.unavailableLetter,
				pressed && buttonContentStyles.pressedMiniButton,
			]}
		>
			<Text style={styles.letterLabel}>{letter}</Text>
		</Pressable>
	);
}

/**
 * Lists seen French words with optional A–Z shortcuts below them.
 */
export default function GlossaryView(scrollProps: CollectionsPageScrollProps) {
	/**
	 * Saved progress and glossary controls
	 */
	const { wordProgressById } = useUserProgress();
	const playSoftTap = useSoftTapSound();
	const [selectedTip, setSelectedTip] = useState<FrenchTip | null>(null);
	const [areAlphabetShortcutsVisible, setAreAlphabetShortcutsVisible] = useState(false);
	const sections = useMemo(() => getGlossarySections(wordProgressById), [wordProgressById]);
	const wordCount = sections.reduce((total, section) => total + section.entries.length, 0);
	const availableLetters = new Set(sections.map(section => section.letter));

	/**
	 * Scroll position of each letter heading
	 */
	const scrollView = useRef<ScrollViewInstance | null>(null);
	const sectionOffsets = useRef<Record<string, number>>({});

	/**
	 * Initial heading, empty glossary message, and shortcut toggle
	 */
	let wordCountLabel = `${wordCount} seen words`;
	let introduction = 'French words you’ve seen, from A to Z.';
	let alphabetToggleLabel = 'Show A–Z shortcuts';
	let alphabetToggleIcon = 'expand_more';

	if (areAlphabetShortcutsVisible) {
		alphabetToggleLabel = 'Hide A–Z shortcuts';
		alphabetToggleIcon = 'expand_less';
	}

	if (wordCount === 1) {
		wordCountLabel = '1 seen word';
	}

	if (wordCount === 0) {
		introduction = 'Words appear here after you see them in flashcards.';
	}

	return (
		<ImageBackground
			source={postcardBackground}
			contentFit="cover"
			style={styles.paper}
		>
			<View style={styles.heading}>
				<View style={styles.headingRow}>
					<Text
						accessibilityRole="header"
						style={styles.title}
					>
						Glossary
					</Text>
					<Text style={styles.wordCount}>{wordCountLabel}</Text>
				</View>
				<Text style={styles.introduction}>{introduction}</Text>
			</View>
			<Animated.ScrollView
				{...scrollProps}
				ref={scrollView}
				bounces={false}
				overScrollMode="never"
				scrollEventThrottle={16}
				style={styles.scrollView}
				contentContainerStyle={styles.content}
			>
				{sections.map(section => (
					<View
						key={section.letter}
						onLayout={event => {
							sectionOffsets.current[section.letter] = event.nativeEvent.layout.y;
						}}
						style={styles.section}
					>
						<Text
							accessibilityRole="header"
							style={styles.letterHeading}
						>
							{section.letter}
						</Text>
						<View style={styles.wordList}>
							{section.entries.map(entry => (
								<GlossaryWordRow
									key={entry.word.id}
									entry={entry}
									onSelectTip={setSelectedTip}
								/>
							))}
						</View>
					</View>
				))}
			</Animated.ScrollView>
			{areAlphabetShortcutsVisible && (
				<View style={styles.alphabet}>
					{glossaryLetters.map(letter => (
						<GlossaryLetterButton
							key={letter}
							letter={letter}
							isLetterAvailable={availableLetters.has(letter)}
							scrollView={scrollView}
							sectionOffsets={sectionOffsets}
						/>
					))}
				</View>
			)}
			<Pressable
				accessibilityRole="button"
				accessibilityState={{
					expanded: areAlphabetShortcutsVisible,
				}}
				onPress={() => {
					void playSoftTap();
					setAreAlphabetShortcutsVisible(previousVisibility => !previousVisibility);
				}}
				style={({ pressed }) => [styles.alphabetToggle, pressed && styles.alphabetTogglePressed]}
			>
				<Text style={styles.alphabetToggleLabel}>{alphabetToggleLabel}</Text>
				<MaterialSymbol
					name={alphabetToggleIcon}
					size={20}
					color={colors.dark.primary}
				/>
			</Pressable>
			{selectedTip && (
				<WordTipModal
					key={selectedTip.id}
					tip={selectedTip}
					visible
					onClose={() => setSelectedTip(null)}
				/>
			)}
		</ImageBackground>
	);
}

/**
 * Styles
 */
const styles = StyleSheet.create({
	paper: {
		flex: 1,
		borderTopWidth: 1,
		borderBottomWidth: 1,
		borderColor: colors.light.border,
		overflow: 'hidden',
		backgroundColor: colors.light.background,
	},
	heading: {
		padding: 12,
		gap: 4,
		borderBottomWidth: 1,
		borderBottomColor: colors.light.border,
	},
	headingRow: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		alignItems: 'center',
		justifyContent: 'space-between',
		gap: 8,
	},
	title: {
		fontFamily: 'lexend-600',
		fontSize: 20,
		color: colors.dark.text,
	},
	wordCount: {
		fontFamily: 'lexend-400',
		fontSize: 12,
		color: colors.dark.text,
	},
	scrollView: {
		flex: 1,
	},
	content: {
		paddingHorizontal: 12,
		paddingBottom: 24,
	},
	introduction: {
		fontFamily: 'lexend-400',
		fontSize: 13,
		lineHeight: 20,
		color: colors.dark.text,
	},
	section: {
		paddingTop: 8,
	},
	letterHeading: {
		fontFamily: 'lexend-600',
		fontSize: 24,
		color: colors.dark.text,
		paddingVertical: 6,
	},
	wordList: {
		marginLeft: 12,
	},
	alphabetToggle: {
		alignSelf: 'stretch',
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		minHeight: 44,
		padding: 12,
		gap: 8,
		borderTopWidth: 1,
		borderTopColor: colors.light.border,
	},
	alphabetTogglePressed: {
		backgroundColor: colors.light.primary,
	},
	alphabetToggleLabel: {
		fontFamily: 'lexend-400',
		fontSize: 15,
		lineHeight: 17,
		color: colors.dark.primary,
	},
	alphabet: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		justifyContent: 'center',
		gap: 6,
		padding: 10,
		borderTopWidth: 1,
		borderTopColor: colors.light.border,
	},
	letterButton: {
		...buttonContentStyles.miniButton,
		minWidth: 30,
		minHeight: 30,
		alignItems: 'center',
		justifyContent: 'center',
		borderColor: colors.light.border,
	},
	unavailableLetter: {
		opacity: 0.3,
	},
	letterLabel: {
		fontFamily: 'lexend-600',
		fontSize: 13,
		color: colors.dark.primary,
	},
});

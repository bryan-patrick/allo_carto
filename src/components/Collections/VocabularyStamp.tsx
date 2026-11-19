import colors from '@/src/app/colors';
import BackgroundImage from '@/src/components/BackgroundImage';
import type { CollectionStamp } from '@/src/util/vocabularyCollections';
import { getWordProgressDefinitionByKey } from '@/src/util/wordProgress';
import { StyleSheet, Text, View, type ImageSourcePropType } from 'react-native';
import MaterialSymbol from '../MaterialSymbol';
import WordProgressBar from '../WordProgressBar';
import StampIllustration from './StampIllustration';

const stampPaper = require('@/src/app/assets/images/postcard-parts/background.jpg');

interface VocabularyStampProps {
	stamp: CollectionStamp;
}

/**
 * Shows a word's collectible stamp or a locked space until its flashcard is discovered.
 */
export default function VocabularyStamp({ stamp }: VocabularyStampProps) {
	/**
	 * Stamp discovery and learning level
	 */
	const isDiscovered = stamp.progress !== 'unseen';
	const learningLevel = getWordProgressDefinitionByKey(stamp.progress);

	/**
	 * Capitalized stamp name
	 */
	const firstCharacter = stamp.frenchWord.charAt(0);
	const capitalizedFirstCharacter = firstCharacter.toUpperCase();
	const remainingText = stamp.frenchWord.slice(1);
	const stampName = `${capitalizedFirstCharacter}${remainingText}`;

	/**
	 * Initial stamp display and screen reader description
	 */
	let backgroundSource: ImageSourcePropType | undefined = stampPaper;
	let accessibilityLabel = 'Undiscovered word.';
	let stampContent = (
		<View style={styles.lockedContent}>
			<MaterialSymbol
				name="lock"
				size={32}
				color={colors.wordProgress.unseen}
			/>
			<Text style={styles.hiddenWord}>???</Text>
		</View>
	);

	if (isDiscovered) {
		backgroundSource = undefined;
		accessibilityLabel = `${stampName}. Learning stage: ${learningLevel.name}.`;
		stampContent = (
			<>
				<StampIllustration image={stamp.image} />
				<Text style={styles.word}>{stampName}</Text>
				<WordProgressBar progress={stamp.progress} />
			</>
		);
	}

	return (
		<BackgroundImage
			accessible
			accessibilityLabel={accessibilityLabel}
			source={backgroundSource}
			imageStyle={styles.paperImage}
			style={[styles.stamp, !isDiscovered && styles.lockedStamp]}
		>
			{stampContent}
		</BackgroundImage>
	);
}

/**
 * Styles
 */
const styles = StyleSheet.create({
	stamp: {
		flexGrow: 1,
		padding: 7,
		gap: 5,
		minHeight: 160,
		alignItems: 'center',
	},
	lockedStamp: {
		borderWidth: 1,
		borderStyle: 'dashed',
		borderColor: colors.light.border,
		borderRadius: 3,
		backgroundColor: colors.light.background,
	},
	paperImage: {
		borderRadius: 3,
	},
	word: {
		fontFamily: 'lexend-600',
		fontSize: 14,
		color: colors.dark.text,
		textAlign: 'center',
	},
	lockedContent: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		gap: 18,
		paddingVertical: 24,
	},
	hiddenWord: {
		fontFamily: 'lexend-400',
		fontSize: 16,
		color: colors.wordProgress.unseen,
	},
});

import colors from '@/src/app/colors';
import BackgroundImage from '@/src/components/BackgroundImage';
import type { CollectionStamp } from '@/src/util/vocabularyCollections';
import { getWordProgressDefinitionByKey } from '@/src/util/wordProgress';
import { StyleSheet, Text, View } from 'react-native';
import MaterialSymbol from '../MaterialSymbol';
import WordProgressBar from '../WordProgressBar';
import StampIllustration from './StampIllustration';

const stampPaper = require('@/src/app/assets/images/postcard-parts/background.jpg');

interface VocabularyStampProps {
	stamp: CollectionStamp;
}

/*
 * Shows a word's collectible stamp or a locked space until its flashcard is discovered.
 */
export default function VocabularyStamp({ stamp }: VocabularyStampProps) {
	const isDiscovered = stamp.progress !== 'unseen';
	const learningLevel = getWordProgressDefinitionByKey(stamp.progress);
	const accessibilityLabel =
		isDiscovered ?
			`${stamp.frenchWord}. Learning stage: ${learningLevel.name}.`
		:	'Undiscovered word.';

	return (
		<BackgroundImage
			accessible
			accessibilityLabel={accessibilityLabel}
			source={isDiscovered ? undefined : stampPaper}
			imageStyle={styles.paperImage}
			style={[styles.stamp, !isDiscovered && styles.lockedStamp]}
		>
			{isDiscovered ?
				<>
					<StampIllustration image={stamp.image} />
					<Text style={styles.word}>{stamp.frenchWord}</Text>
					<WordProgressBar progress={stamp.progress} />
				</>
			:	<View style={styles.lockedContent}>
					<MaterialSymbol
						name="lock"
						size={32}
						color={colors.wordProgress.unseen}
					/>
					<Text style={styles.hiddenWord}>???</Text>
				</View>
			}
		</BackgroundImage>
	);
}

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

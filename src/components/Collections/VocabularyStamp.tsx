import { placeholderStampImage } from '@/data/french/collectionAtlas';
import colors from '@/src/app/colors';
import type { CollectionStamp } from '@/src/util/vocabularyCollections';
import { ImageBackground, StyleSheet, Text, View } from 'react-native';
import MaterialSymbol from '../MaterialSymbol';

const stampPaper = require('@/src/app/assets/images/postcard-parts/background.jpg');

interface VocabularyStampProps {
	stamp: CollectionStamp;
}

/**
 * Shows a word's collectible stamp or a locked space until its flashcard is discovered.
 */
export default function VocabularyStamp({ stamp }: VocabularyStampProps) {
	const isDiscovered = stamp.progress !== 'unseen';
	const accessibilityLabel =
		isDiscovered ? `${stamp.frenchWord}. Learning level ${stamp.level}.` : 'Undiscovered word.';

	return (
		<ImageBackground
			accessible
			accessibilityLabel={accessibilityLabel}
			source={stampPaper}
			imageStyle={styles.paperImage}
			style={styles.stamp}
		>
			{isDiscovered ?
				<>
					<ImageBackground
						accessible={false}
						source={stamp.image ?? placeholderStampImage}
						resizeMode="contain"
						style={styles.illustration}
					/>
					<Text style={styles.word}>{stamp.frenchWord}</Text>
					<Text style={styles.level}>Lvl. {stamp.level}</Text>
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
		</ImageBackground>
	);
}

const styles = StyleSheet.create({
	stamp: {
		flexGrow: 1,
		padding: 7,
		gap: 5,
		minHeight: 160,
		alignItems: 'center',
		borderWidth: 1,
		borderStyle: 'dashed',
		borderColor: colors.light.border,
		borderRadius: 3,
		backgroundColor: colors.light.background,
	},
	paperImage: {
		borderRadius: 3,
	},
	illustration: {
		width: '100%',
		aspectRatio: 1,
	},
	word: {
		fontFamily: 'lexend-600',
		fontSize: 14,
		color: colors.dark.text,
		textAlign: 'center',
	},
	level: {
		fontFamily: 'lexend-400',
		fontSize: 11,
		color: colors.wordProgress.unseen,
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

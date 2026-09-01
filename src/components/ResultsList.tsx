import colors from '@/src/app/colors';
import { Word } from '@/src/components/CardDeck/cardDeckTypes';
import MaterialSymbol from '@/src/components/MaterialSymbol';
import { StyleSheet, Text, TextStyle, View } from 'react-native';

/**
 * Typing
 */
interface ResultsListProps {
	isCorrect: boolean;
	wordArr: Word[];
}

/**
 * ResultsList component
 */
export default function ResultsList({ isCorrect, wordArr }: ResultsListProps) {
	/**
	 * Is correct or nah?
	 */
	const title: string = isCorrect ? 'Correct' : 'Incorrect';
	const iconColor: string = isCorrect ? colors.dark.success : colors.dark.danger;
	const wordResultStyle: TextStyle = isCorrect ? styles.success : styles.danger;
	const symbolName = isCorrect ? 'check' : 'close';
	const emptyText =
		isCorrect ?
			"You didn't get any correct. Try again!"
		:	'No incorrect words! Nice! Parlez-vous français?';

	/**
	 * Render the results list
	 */
	return (
		<View style={styles.wordsList}>
			<Text style={styles.sectionTitle}>{title}</Text>
			{wordArr.length > 0 &&
				wordArr.map((word: Word) => {
					const { frenchWord, correctCount, englishWords, CEFR } = word;

					/**
					 * Map out the words
					 */
					return (
						<View
							key={`${frenchWord}-${correctCount}`}
							style={styles.wordRowContainer}
						>
							<View style={styles.checkMarkContainer}>
								<MaterialSymbol
									name={symbolName}
									size={24}
									color={iconColor}
								/>
								<View style={styles.wordRow}>
									<Text style={styles.frenchWord}>{frenchWord}</Text>
									<Text style={[styles.englishWord, wordResultStyle]}>
										{englishWords.join(', ')}
									</Text>
								</View>
							</View>
							<Text style={[styles.CEFR, { backgroundColor: colors.light.CEFR[CEFR] }]}>
								{CEFR}
							</Text>
						</View>
					);
				})}
			{wordArr.length === 0 && <Text>{emptyText}</Text>}
		</View>
	);
}

/**
 * Styles
 */
const styles = StyleSheet.create({
	wordsList: {
		display: 'flex',
		flexDirection: 'column',
		padding: 4,
	},
	sectionTitle: {
		fontSize: 18,
		fontFamily: 'lexend-600',
		color: colors.dark.text,
		marginBottom: 2,
	},
	wordRowContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		borderBottomWidth: 1,
		borderColor: colors.light.border,
		paddingVertical: 1,
	},
	checkMarkContainer: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		gap: 4,
	},
	wordRow: {
		padding: 2,
	},
	frenchWord: {
		fontSize: 14,
		fontFamily: 'lexend-400',
	},
	englishWord: {
		fontSize: 16,
		fontFamily: 'lexend-600',
	},
	success: {
		color: colors.dark.success,
	},
	danger: {
		color: colors.dark.danger,
	},
	CEFR: {
		fontFamily: 'azeret-mono-600',
		fontSize: 12,
		padding: 2,
		borderRadius: 4,
		borderWidth: 1,
		borderColor: colors.light.border,
		boxShadow: `0 2px 0 0 ${colors.light.border}`,
	},
});

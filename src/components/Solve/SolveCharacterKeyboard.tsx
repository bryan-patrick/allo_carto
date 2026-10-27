import colors from '@/src/app/colors';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface SolveCharacterKeyboardProps {
	color: string;
	disabled: boolean;
	onCharacterPress: (character: string) => void;
}

const frenchCharacterRows = [
	['à', 'â', 'æ', 'ç', 'é', 'è', 'ê', 'ë'],
	['î', 'ï', 'ô', 'œ', 'ù', 'û', 'ü', 'ÿ'],
];

/**
 * This shows French character keys under the puzzle answer field.
 */
export default function SolveCharacterKeyboard({
	color,
	disabled,
	onCharacterPress,
}: SolveCharacterKeyboardProps) {
	const textColor = {
		color,
	};

	return (
		<View style={[styles.keyboard, disabled && styles.disabled]}>
			{frenchCharacterRows.map((characters, rowIndex) => (
				<View
					key={rowIndex}
					style={styles.row}
				>
					{characters.map(character => (
						<Pressable
							key={character}
							accessibilityRole="button"
							accessibilityLabel={`Insert ${character}`}
							accessibilityState={{
								disabled,
							}}
							disabled={disabled}
							onPress={() => onCharacterPress(character)}
							style={({ pressed }) => [styles.key, pressed && styles.pressedKey]}
						>
							<Text style={[styles.character, textColor]}>{character}</Text>
						</Pressable>
					))}
				</View>
			))}
		</View>
	);
}

const styles = StyleSheet.create({
	keyboard: {
		gap: 4,
	},
	row: {
		flexDirection: 'row',
		gap: 4,
	},
	key: {
		flex: 1,
		minHeight: 40,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: colors.light.primary,
		borderColor: colors.light.goldenBorder,
		borderWidth: 1,
		borderRadius: 6,
	},
	pressedKey: {
		backgroundColor: colors.light.secondary,
	},
	character: {
		fontFamily: 'lexend-400',
		fontSize: 18,
	},
	disabled: {
		opacity: 0.6,
	},
});

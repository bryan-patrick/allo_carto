import type { StyleProp, TextStyle, ViewProps, ViewStyle } from 'react-native';
import { StyleSheet, Text, View } from 'react-native';

/**
 * Typing
 */
interface VerticalTextProps extends Omit<ViewProps, 'children' | 'style'> {
	word: string;
	containerStyle?: StyleProp<ViewStyle>;
	textStyle?: StyleProp<TextStyle>;
}

/**
 * Arrange the characters in a word vertically
 */
export default function VerticalText({
	word,
	containerStyle,
	textStyle,
	accessibilityLabel = word,
	...viewProps
}: VerticalTextProps) {
	return (
		<View
			accessible
			accessibilityLabel={accessibilityLabel}
			style={[styles.container, containerStyle]}
			{...viewProps}
		>
			{Array.from(word).map((character, index) => (
				<Text
					accessible={false}
					key={`${character}-${index}`}
					style={textStyle}
				>
					{character}
				</Text>
			))}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		gap: 1,
	},
});

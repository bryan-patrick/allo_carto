import type { ColorValue, TextProps } from 'react-native';
import { StyleSheet, Text } from 'react-native';

/*
 * Typing
 */
export type MaterialSymbolProps = Omit<TextProps, 'children'> & {
	color?: ColorValue;
	name: string;
	size?: number;
	filled?: boolean;
};

/*
 * Material Symbol
 */
export default function MaterialSymbol({
	accessible = false,
	allowFontScaling = false,
	color,
	name,
	filled = false,
	size: fontSize = 24,
	style,
	...props
}: MaterialSymbolProps) {
	return (
		<Text
			{...props}
			accessible={accessible}
			allowFontScaling={allowFontScaling}
			style={[
				styles.symbol,
				{
					fontFamily: filled ? 'MaterialSymbols_400Regular_Filled' : 'MaterialSymbols_400Regular',
					color,
					fontSize,
				},
				style,
			]}
		>
			{name}
		</Text>
	);
}

const styles = StyleSheet.create({
	symbol: {
		fontFamily: 'MaterialSymbols_400Regular',
		textAlign: 'center',
	},
});

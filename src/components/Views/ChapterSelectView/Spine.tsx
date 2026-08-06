import colors from '@/src/app/colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ImageBackground, StyleSheet, Text, View } from 'react-native';

/**
 * Typing
 */
interface SpineProps {
	color?: string;
	index: number;
	materialIconName?: string;
}

/**
 * The spine graphic component (of the book)
 */
export default function Spine({ color, index, materialIconName }: SpineProps) {
	/**
	 * Destructure styles
	 */
	const {
		spineColorStyle,
		spineImageStyle,
		spineStyle,
		spineInner,
		borderContainer,
		iconStyle,
		spineInnerText,
	} = styles;

	/**
	 * Render the component
	 */
	return (
		<View style={[spineStyle, { borderColor: `${color}80` }]}>
			<ImageBackground
				source={require('../../../app/assets/images/book-parts/spine.jpg')}
				style={spineImageStyle}
			/>
			{color && (
				<View
					pointerEvents="none"
					style={[spineColorStyle, { backgroundColor: color }]}
					testID="spine-color-overlay"
				/>
			)}
			<View style={spineInner}>
				<View style={borderContainer}>
					<MaterialIcons
						color={'rgba(255, 255, 255, 0.6)'}
						name={(materialIconName as any) ?? 'flight'}
						size={40}
						style={iconStyle}
					/>
					<Text style={spineInnerText}>{index + 1}</Text>
				</View>
			</View>
		</View>
	);
}

/**
 * Styles
 */
const styles = StyleSheet.create({
	spineColorStyle: {
		position: 'absolute',
		mixBlendMode: 'color',
		bottom: 0,
		left: 0,
		right: 0,
		top: 0,
	},
	spineImageStyle: {
		bottom: 0,
		left: 0,
		position: 'absolute',
		right: 0,
		top: 0,
		borderRightWidth: 1,
		borderColor: colors.dark.border,
	},
	spineStyle: {
		width: 80,
	},
	spineInner: {
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
		flexGrow: 1,
		padding: 8,
		paddingRight: 0,
	},
	borderContainer: {
		display: 'flex',
		flexGrow: 1,
		justifyContent: 'center',
		alignItems: 'center',
		alignContent: 'center',
		borderWidth: 2,
		borderRightWidth: 0,
		borderTopLeftRadius: 8,
		borderBottomLeftRadius: 8,
		borderColor: 'rgba(0, 0, 0, 0.4)',
		width: '100%',
		gap: 8,
	},
	iconStyle: {
		shadowOffset: {
			height: 0,
			width: 0,
		},
		shadowOpacity: 1,
		shadowColor: '#000000',
		shadowRadius: 1,
	},
	spineInnerText: {
		color: 'rgba(255, 255, 255, 0.6)',
		fontFamily: 'azeret-mono-600',
		fontSize: 16,
	},
});

import type { StoryCategory } from '@/data/french/storyAtlas';
import colors from '@/src/app/colors';
import MaterialSymbol from '@/src/components/MaterialSymbol';
import VerticalText from '@/src/components/VerticalText';
import { ImageBackground, StyleSheet, View } from 'react-native';

/**
 * Typing
 */
interface SpineProps {
	category: StoryCategory;
	color?: string;
	materialSymbolName?: string;
}

/**
 * The spine graphic component (of the book)
 */
export default function Spine({ color, category, materialSymbolName }: SpineProps) {
	/**
	 * Render the component
	 */
	return (
		<View style={[styles.spine, { borderColor: `${color}80` }]}>
			<ImageBackground
				source={require('../../../app/assets/images/book-parts/spine.jpg')}
				style={styles.spineImage}
			/>
			{color && (
				<View
					pointerEvents="none"
					style={[styles.spineColor, { backgroundColor: color }]}
					testID="spine-color-overlay"
				/>
			)}
			<View style={styles.spineInner}>
				<View style={styles.borderContainer}>
					<MaterialSymbol
						color={'rgba(255, 255, 255, 0.6)'}
						name={materialSymbolName ?? 'flight'}
						size={16}
						style={styles.icon}
					/>
					<VerticalText
						word={category}
						textStyle={styles.category}
					/>
				</View>
			</View>
		</View>
	);
}

/**
 * Styles
 */
const styles = StyleSheet.create({
	spine: {
		width: 55,
	},
	spineImage: {
		bottom: 0,
		left: 0,
		position: 'absolute',
		right: 0,
		top: 0,
		borderRightWidth: 1,
		borderColor: colors.dark.border,
	},
	spineColor: {
		position: 'absolute',
		mixBlendMode: 'color',
		bottom: 0,
		left: 0,
		right: 0,
		top: 0,
	},
	spineInner: {
		backgroundColor: 'rgba(0, 0, 0, 0.4)',
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
		borderColor: colors.utility.cardBorder,
		width: '100%',
		gap: 4,
	},
	icon: {
		shadowOffset: {
			height: 0,
			width: 0,
		},
		shadowOpacity: 1,
		shadowColor: '#000000',
		shadowRadius: 1,
		borderBottomWidth: 1,
		paddingBottom: 4,
		marginBottom: 4,
		borderColor: 'rgba(255, 255, 255, 0.2)',
	},
	category: {
		color: 'rgba(255, 255, 255, 0.6)',
		fontFamily: 'azeret-mono-600',
		fontSize: 10,
		lineHeight: 11,
		textTransform: 'uppercase',
	},
});

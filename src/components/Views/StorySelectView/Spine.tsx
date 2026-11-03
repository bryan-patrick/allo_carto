import type { StoryCategory } from '@/data/french/storyAtlas';
import BackgroundImage from '@/src/components/BackgroundImage';
import MaterialSymbol from '@/src/components/MaterialSymbol';
import VerticalText from '@/src/components/VerticalText';
import { StyleSheet, Text, View } from 'react-native';
import { bookStyles } from './bookStyles';

/*
 * Typing
 */
interface SpineProps {
	category: StoryCategory;
	requiredLevel: number;
	color?: string;
	materialSymbolName?: string;
}

// Center the story level, icon, and category together on the spine.
export default function Spine({ color, category, materialSymbolName, requiredLevel }: SpineProps) {
	const paddedLevel = String(requiredLevel).padStart(2, '0');

	return (
		<View style={[styles.spine, bookStyles.spineCorners]}>
			<BackgroundImage
				source={require('../../../app/assets/images/book-parts/spine.jpg')}
				style={styles.spineImage}
				imageStyle={bookStyles.spineCorners}
			/>
			{color && (
				<View
					pointerEvents="none"
					style={[
						styles.spineColor,
						bookStyles.spineCorners,
						{
							backgroundColor: color,
						},
					]}
					testID="spine-color-overlay"
				/>
			)}
			<View style={[styles.spineInner, bookStyles.spineCorners]}>
				<View style={styles.categoryContainer}>
					<MaterialSymbol
						color={'rgba(255, 255, 255, 0.6)'}
						name={materialSymbolName ?? 'flight'}
						size={16}
						style={styles.icon}
					/>
					<Text
						accessibilityLabel={`Story level ${requiredLevel}`}
						style={styles.level}
					>
						{paddedLevel}
					</Text>
					<VerticalText
						word={category}
						textStyle={styles.category}
					/>
				</View>
			</View>
		</View>
	);
}

/*
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
		gap: 4,
	},
	level: {
		color: 'rgba(255, 255, 255, 0.6)',
		fontFamily: 'azeret-mono-600',
		fontSize: 11,
		lineHeight: 11,
		paddingBottom: 8,
		marginBottom: 4,
		borderBottomWidth: 1,
		borderColor: 'rgba(255, 255, 255, 0.6)',
		textAlign: 'center',
	},
	categoryContainer: {
		display: 'flex',
		flexGrow: 1,
		justifyContent: 'center',
		alignItems: 'center',
		alignContent: 'center',
		width: '100%',
		gap: 4,
		paddingVertical: 16,
	},
	icon: {
		textShadowOffset: {
			height: 0,
			width: 0,
		},
		textShadowColor: '#000000',
		textShadowRadius: 1,
		marginBottom: 2,
	},
	category: {
		color: 'rgba(255, 255, 255, 0.6)',
		fontFamily: 'azeret-mono-600',
		fontSize: 10,
		lineHeight: 11,
		textTransform: 'uppercase',
	},
});

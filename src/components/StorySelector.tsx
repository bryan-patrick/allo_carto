import type { DeckStory } from '@/data/french/storyAtlas';
import colors from '@/src/app/colors';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import BackgroundImage from './BackgroundImage';
import MaterialSymbol from './MaterialSymbol';

const storyPaperBackground = require('@/src/app/assets/images/postcard-parts/background.jpg');

/*
 * Typing
 */
interface StorySelectorProps {
	story: DeckStory;
	isExpanded: boolean;
	onPress: () => void;
}

// Show the story title, category, and level on a paper tab that opens the story picker.
export default function StorySelector({ story, isExpanded, onPress }: StorySelectorProps) {
	const accessibilityLabel = `Selected story: ${story.name}`;
	const storyColor = colors.category[story.category];
	const categoryTextStyle = {
		color: storyColor,
	};

	return (
		<View style={styles.selector}>
			<BackgroundImage
				source={storyPaperBackground}
				resizeMode="cover"
				style={styles.paperTab}
				imageStyle={styles.paperCorners}
			>
				<Pressable
					accessibilityHint="Choose a different story"
					accessibilityRole="button"
					accessibilityLabel={accessibilityLabel}
					accessibilityState={{
						expanded: isExpanded,
					}}
					onPress={onPress}
					style={({ pressed }) => [styles.tabContent, pressed && styles.pressed]}
				>
					<View style={styles.titleRow}>
						<Text style={[styles.name, categoryTextStyle]}>{story.name}</Text>
						<MaterialSymbol
							name="expand_more"
							color={storyColor}
							size={18}
						/>
					</View>
					<Text style={[styles.changeStoryText, categoryTextStyle]}>
						{story.category}&nbsp;&nbsp;|&nbsp;&nbsp;Level {story.requiredLevel}
					</Text>
				</Pressable>
			</BackgroundImage>
		</View>
	);
}

/*
 * Styles
 */
const styles = StyleSheet.create({
	selector: {
		alignItems: 'center',
		alignSelf: 'center',
		maxWidth: '100%',
	},
	paperTab: {
		backgroundColor: colors.light.background,
		borderBottomLeftRadius: 16,
		borderBottomRightRadius: 16,
		maxWidth: '100%',
		elevation: 2,
		shadowColor: '#000000',
		shadowOffset: {
			width: 0,
			height: 1,
		},
		shadowRadius: 1,
		shadowOpacity: 0.4,
	},
	paperCorners: {
		borderBottomLeftRadius: 16,
		borderBottomRightRadius: 16,
	},
	tabContent: {
		alignItems: 'center',
		justifyContent: 'center',
		gap: 0,
		paddingHorizontal: 24,
		paddingVertical: 4,
	},
	titleRow: {
		alignItems: 'center',
		flexDirection: 'row',
		maxWidth: '100%',
		gap: 4,
	},
	name: {
		flexShrink: 1,
		fontFamily: 'lexend-600',
		fontSize: 16,
		lineHeight: 22,
		textAlign: 'center',
	},
	changeStoryText: {
		fontFamily: 'lexend-400',
		fontSize: 11,
		lineHeight: 12,
	},
	pressed: {
		opacity: 0.65,
	},
});

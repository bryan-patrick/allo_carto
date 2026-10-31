import type { DeckStory } from '@/data/french/storyAtlas';
import colors from '@/src/app/colors';
import { Button, Host, Text as NativeText, RNHostView, Row } from '@expo/ui';
import { foregroundColor } from '@expo/ui/swift-ui/modifiers';
import { Platform, StyleSheet, View } from 'react-native';
import MaterialSymbol from './MaterialSymbol';

const headingColor = colors.light.text;
const titleModifiers: ReturnType<typeof foregroundColor>[] = [];
let storyFontFamily = 'lexend-600';

if (Platform.OS === 'ios') {
	storyFontFamily = 'Lexend-SemiBold';
	/*
	 * Use the color modifier supported by the native Expo Go runtime.
	 */
	titleModifiers.push(foregroundColor(headingColor));
}

/*
 * Typing
 */
interface StorySelectorProps {
	story: DeckStory;
	isExpanded: boolean;
	onPress: () => void;
}

/*
 * Show the current story's name and open the story picker when pressed.
 */
export default function StorySelector({ story, isExpanded, onPress }: StorySelectorProps) {
	const accessibilityLabel = `Selected story: ${story.name}`;
	const storyColor = colors.categoryLight[story.category];

	return (
		<View style={styles.selector}>
			<View
				accessible
				accessibilityActions={[{ name: 'activate' }]}
				accessibilityHint="Choose a different story"
				accessibilityRole="button"
				accessibilityLabel={accessibilityLabel}
				accessibilityState={{ expanded: isExpanded }}
				onAccessibilityAction={onPress}
				onAccessibilityTap={onPress}
			>
				<View
					accessibilityElementsHidden
					importantForAccessibility="no-hide-descendants"
				>
					<Host
						matchContents
						ignoreSafeArea="all"
						colorScheme="dark"
						seedColor={storyColor}
					>
						<Button
							onPress={onPress}
							variant="text"
						>
							<Row
								alignment="center"
								spacing={2}
							>
								<NativeText
									modifiers={titleModifiers}
									textStyle={styles.name}
								>
									{story.name}
								</NativeText>
								<Row style={styles.chevron}>
									<RNHostView matchContents>
										<MaterialSymbol
											accessible={false}
											color={headingColor}
											name="expand_more"
											size={24}
											style={styles.chevron}
										/>
									</RNHostView>
								</Row>
							</Row>
						</Button>
					</Host>
				</View>
			</View>
		</View>
	);
}

/*
 * Styles
 */
const styles = StyleSheet.create({
	selector: {
		alignItems: 'flex-start',
	},
	chevron: {
		width: 24,
		height: 24,
	},
	name: {
		color: headingColor,
		fontFamily: storyFontFamily,
		fontSize: 18,
		textAlign: 'center',
	},
});

import type { StoryArea } from '@/data/french/storyAreas';
import colors from '@/src/app/colors';
import { formatAreaLevelRange } from '@/src/util/storyAreas';
import { Button, Host, Text as NativeText, RNHostView, Row } from '@expo/ui';
import { Platform, StyleSheet, Text, View } from 'react-native';
import MaterialSymbol from './MaterialSymbol';

let areaFontFamily = 'lexend-600';

if (Platform.OS === 'ios') areaFontFamily = 'Lexend-SemiBold';

/**
 * Typing
 */
interface StoryAreaSelectorProps {
	area: StoryArea;
	isExpanded: boolean;
	onPress: () => void;
}

/**
 * The selected area stays visible above the story list.
 */
export default function StoryAreaSelector({ area, isExpanded, onPress }: StoryAreaSelectorProps) {
	const levelRange = formatAreaLevelRange(area);
	const accessibilityLabel = `Story group: ${area.name}`;
	const subtitle = `Stories for ${levelRange}`;

	return (
		<View style={styles.selector}>
			<View
				accessible
				accessibilityActions={[{ name: 'activate' }]}
				accessibilityHint="Choose a different story group"
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
						seedColor={colors.light.goldenBorder}
					>
						<Button
							onPress={onPress}
							variant="outlined"
						>
							<Row
								alignment="center"
								spacing={4}
							>
								<NativeText textStyle={styles.name}>{area.name}</NativeText>
								{/** Trying out the Material icon for this one */}
								<RNHostView matchContents>
									<MaterialSymbol
										accessible={false}
										color={colors.light.background}
										name="expand_more"
										size={24}
										style={styles.chevron}
									/>
								</RNHostView>
							</Row>
						</Button>
					</Host>
				</View>
			</View>
			<Text style={styles.detail}>{subtitle}</Text>
		</View>
	);
}

/**
 * Styles
 */
const styles = StyleSheet.create({
	selector: {
		alignItems: 'center',
		gap: 8,
	},
	chevron: {
		width: 24,
		height: 24,
	},
	name: {
		color: colors.light.background,
		fontFamily: areaFontFamily,
		fontSize: 18,
		textAlign: 'center',
	},
	detail: {
		color: colors.light.goldenBorder,
		fontFamily: 'lexend-400',
		fontSize: 14,
		textAlign: 'center',
		textShadowColor: '#000000',
		textShadowRadius: 1,
		textShadowOffset: { width: 0, height: 0 },
	},
});

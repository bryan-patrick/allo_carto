import { Fragment } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '../app/colors';
import MaterialSymbol from './MaterialSymbol';

/**
 * Typing
 */
interface ViewIndicatorProps {
	views: string[];
	currentViewIndex: number;
	activeColor?: string;
	inactiveColor?: string;
	respectSafeArea?: boolean;
	showTextShadow?: boolean;
}

/**
 * View Indicator component
 */
export default function ViewIndicator({
	views,
	currentViewIndex,
	activeColor = colors.light.goldenBorder,
	inactiveColor = colors.light.border,
	respectSafeArea = true,
	showTextShadow = true,
}: ViewIndicatorProps) {
	const paddingTop = useSafeAreaInsets().top;

	/**
	 * Render the thing
	 */
	return (
		<View style={[styles.indicator, { paddingTop: respectSafeArea ? paddingTop : 0 }]}>
			{views.map((view, i) => {
				const isLast: boolean = i === views.length - 1;
				const isCurrent: boolean = currentViewIndex === i;

				return (
					<Fragment key={`view-indicator-${view}-${i}`}>
						<View>
							<Text
								style={[
									styles.name,
									!showTextShadow && styles.nameWithoutShadow,
									{ color: isCurrent ? activeColor : inactiveColor },
								]}
							>
								{view}
							</Text>
						</View>
						{!isLast && (
							<MaterialSymbol
								size={12}
								color={inactiveColor}
								name="arrow_right"
							/>
						)}
					</Fragment>
				);
			})}
		</View>
	);
}

/**
 * Styles
 */
const styles = StyleSheet.create({
	indicator: {
		display: 'flex',
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		gap: 4,
	},
	name: {
		color: '#ff0000',
		fontFamily: 'lexend-600',
		fontSize: 12,
		lineHeight: 12,
		textShadowColor: '#000000',
		textShadowRadius: 1,
		textShadowOffset: {
			width: 0,
			height: 0,
		},
	},
	nameWithoutShadow: {
		textShadowColor: 'transparent',
		textShadowRadius: 0,
	},
	hasCurrent: {
		fontFamily: 'lexend-700',
	},
});

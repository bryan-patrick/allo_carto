import { Fragment } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import colors from '../app/colors';
import MaterialSymbol from './MaterialSymbol';

/**
 * Typing
 */
interface ViewIndicatorProps {
	views: string[];
	currentViewIndex: number;
}

/**
 * View Indicator component
 */
export default function ViewIndicator({ views, currentViewIndex }: ViewIndicatorProps) {
	/**
	 * Render the thing
	 */
	return (
		<View style={styles.indicator}>
			{views.map((view, i) => {
				const isLast: boolean = i === views.length - 1;
				const isCurrent: boolean = currentViewIndex === i;

				return (
					<Fragment key={`view-indicator-${view}-${i}`}>
						<View>
							<Text
								style={[
									styles.name,
									{ color: isCurrent ? colors.light.goldenBorder : colors.light.border },
								]}
							>
								{view}
							</Text>
						</View>
						{!isLast && (
							<MaterialSymbol
								size={12}
								color={colors.light.border}
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
		gap: 8,
		zIndex: 1000,
	},
	name: {
		color: '#ff0000',
		fontFamily: 'lexend-600',
		fontSize: 12,
		lineHeight: 12,
	},
	hasCurrent: {
		fontFamily: 'lexend-700',
	},
});

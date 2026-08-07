import type { UnlockCriteria } from '@/src/util/atlasCompletion';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ReactNode } from 'react';
import { Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import colors from '../app/colors';
import SVGCheck from './SVG/SVGCheck';

/**
 * Typing
 */
interface LockOverlayProps {
	children: ReactNode;
	completeAccessibilityHint?: string;
	completeAccessibilityLabel?: string;
	isComplete?: boolean;
	isLocked: boolean;
	lockedAccessibilityHint?: string;
	lockedAccessibilityLabel?: string;
	overlayStyle?: StyleProp<ViewStyle>;
	style?: StyleProp<ViewStyle>;
	unlockCriteria?: UnlockCriteria[];
}

/**
 * LockOverlay Component
 */
export default function LockOverlay({
	children,
	completeAccessibilityHint,
	completeAccessibilityLabel = 'Complete content',
	isComplete = false,
	isLocked,
	unlockCriteria,
	lockedAccessibilityHint,
	lockedAccessibilityLabel = 'Locked content',
	overlayStyle: customOverlayStyle,
	style,
}: LockOverlayProps) {
	/**
	 * Destructure styles
	 */
	const {
		completeOverlayStyle,
		containerStyle,
		overlayStyle,
		unlockCriteriaContainerStyle,
		unlockCriteriaMetStyle,
		unlockCriteriaTextStyle,
		unlockCriteriaTitleStyle,
	} = styles;

	/**
	 * Overlay vars
	 */
	const showLockOverlay = isLocked;
	const showCompleteOverlay = !isLocked && isComplete;
	const showOverlay = showLockOverlay || showCompleteOverlay;

	/**
	 * Ternaries
	 */
	const accessibilityHint = showLockOverlay ? lockedAccessibilityHint : completeAccessibilityHint;
	const accessibilityLabel =
		showLockOverlay ? lockedAccessibilityLabel : completeAccessibilityLabel;
	const overlayTestID = showLockOverlay ? 'lock-overlay' : 'complete-overlay';

	/**
	 * Render LockOverlay
	 */
	return (
		<View style={[containerStyle, style]}>
			{children}
			{showOverlay && (
				<Pressable
					accessibilityHint={accessibilityHint}
					accessibilityLabel={accessibilityLabel}
					accessibilityState={{ disabled: true }}
					onPress={() => undefined}
					style={[overlayStyle, showCompleteOverlay && completeOverlayStyle, customOverlayStyle]}
					testID={overlayTestID}
				>
					{showLockOverlay && (
						<MaterialIcons
							color={colors.light.text}
							name="lock"
							size={32}
						/>
					)}
					{showCompleteOverlay && (
						<SVGCheck
							color={colors.dark.success}
							height="32"
							width="32"
						/>
					)}
					{unlockCriteria && unlockCriteria.length > 0 && (
						<View style={unlockCriteriaContainerStyle}>
							{unlockCriteria.map((criterion, index) => (
								<Text
									key={`${criterion.title}-${index}`}
									style={[unlockCriteriaTextStyle, criterion.isUnlocked && unlockCriteriaMetStyle]}
								>
									Reach {criterion.requiredPercentage}% in{' '}
									<Text
										style={[
											unlockCriteriaTitleStyle,
											criterion.isUnlocked && unlockCriteriaMetStyle,
										]}
									>
										{criterion.title}
									</Text>{' '}
									to unlock.
								</Text>
							))}
						</View>
					)}
				</Pressable>
			)}
		</View>
	);
}

/**
 * Styles
 */
const styles = StyleSheet.create({
	completeOverlayStyle: {
		backgroundColor: colors.light.success,
		borderColor: colors.dark.success,
		opacity: 0.75,
	},
	containerStyle: {
		position: 'relative',
	},
	overlayStyle: {
		...StyleSheet.absoluteFill,
		alignItems: 'center',
		backgroundColor: `#333333dd`,
		justifyContent: 'center',
		overflow: 'hidden',
		zIndex: 10,
	},
	unlockCriteriaContainerStyle: {
		width: '100%',
		padding: 16,
		marginVertical: 16,
		backgroundColor: colors.light.primary,
	},
	unlockCriteriaTextStyle: {
		fontFamily: 'lexend-400',
		fontSize: 16,
		textAlign: 'center',
		color: colors.dark.text,
	},
	unlockCriteriaMetStyle: {
		textDecorationLine: 'line-through',
	},
	unlockCriteriaTitleStyle: {
		fontFamily: 'lexend-600',
	},
});

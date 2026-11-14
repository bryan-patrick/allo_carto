import { formatUnlockCriterion, type UnlockCriteria } from '@/src/util/atlasCompletion';
import { ReactNode } from 'react';
import { Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import colors from '../app/colors';
import MaterialSymbol from './MaterialSymbol';
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
	 * Overlay vars
	 */
	const showLockOverlay = isLocked;
	const showCompleteOverlay = !isLocked && isComplete;
	const showOverlay = showLockOverlay || showCompleteOverlay;
	const criteria = (unlockCriteria ?? []).map(criterion => ({
		isUnlocked: criterion.isUnlocked,
		label: formatUnlockCriterion(criterion),
	}));

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
		<View style={[styles.container, style]}>
			{children}
			{showOverlay && (
				<Pressable
					accessibilityHint={accessibilityHint}
					accessibilityLabel={accessibilityLabel}
					accessibilityState={{ disabled: true }}
					onPress={() => undefined}
					style={[
						styles.overlay,
						showCompleteOverlay && styles.completeOverlay,
						customOverlayStyle,
					]}
					testID={overlayTestID}
				>
					{showLockOverlay && (
						<MaterialSymbol
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
					{criteria.length > 0 && (
						<View style={styles.unlockCriteriaContainer}>
							{criteria.map((criterion, index) => (
								<Text
									key={`${criterion.label}-${index}`}
									style={[
										styles.unlockCriteriaText,
										criterion.isUnlocked && styles.unlockCriteriaMet,
									]}
								>
									{criterion.label}
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
	container: {
		position: 'relative',
	},
	overlay: {
		...StyleSheet.absoluteFill,
		alignItems: 'center',
		backgroundColor: `#333333dd`,
		justifyContent: 'center',
		overflow: 'hidden',
		zIndex: 10,
	},
	completeOverlay: {
		backgroundColor: colors.light.success,
		borderColor: colors.dark.success,
		opacity: 0.75,
	},
	unlockCriteriaContainer: {
		width: '100%',
		padding: 16,
		marginVertical: 16,
		backgroundColor: colors.light.primary,
	},
	unlockCriteriaText: {
		fontFamily: 'lexend-400',
		fontSize: 16,
		textAlign: 'center',
		color: colors.dark.text,
	},
	unlockCriteriaMet: {
		textDecorationLine: 'line-through',
	},
});

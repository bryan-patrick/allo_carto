import colors from '@/src/app/colors';
import { useUserProgress } from '@/src/db/useUserProgress';
import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import MaterialSymbol from './MaterialSymbol';
import ProgressBar from './ProgressBar';
import UserProgressModal from './UserProgressModal';

interface LevelBadgeProps {
	colorScheme?: 'light' | 'dark';
	onPress?: () => void;
}

/*
 * Player level and XP bar for headers
 */
export default function LevelBadge({ colorScheme = 'dark', onPress }: LevelBadgeProps) {
	const { experience, inkBalance, maxInkBalance, status } = useUserProgress();
	const [isProgressVisible, setIsProgressVisible] = useState(false);
	const { level, isMaxLevel, xpIntoLevel, xpForNextLevel, progressPercentage } = experience;
	const levelLabel = `Lvl. ${level}`;
	const inkLabel = inkBalance.toLocaleString();
	const isInkFull = inkBalance >= maxInkBalance;
	const isLightBackground = colorScheme === 'light';
	const textColor = isLightBackground ? colors.dark.text : colors.light.text;
	const accentColor = isLightBackground ? colors.dark.text : colors.light.goldenBorder;
	const textStyle = {
		color: textColor,
	};
	let inkColor = textColor;
	let inkIconColor = accentColor;
	let inkDescription = `${inkLabel} of ${maxInkBalance} Ink.`;
	let progressDescription = `${xpIntoLevel} of ${xpForNextLevel} XP toward level ${level + 1}`;

	if (isInkFull) {
		inkColor = colors.ink.full;
		inkIconColor = colors.ink.full;
		inkDescription += ' Ink is full.';
	}

	if (isMaxLevel) {
		progressDescription = 'Maximum level reached';
	}

	const accessibilityLabel = `Level ${level}. ${progressDescription}. ${inkDescription}`;

	function handleOpenProgress() {
		onPress?.();
		setIsProgressVisible(true);
	}

	if (status !== 'ready') {
		return null;
	}

	const hasLiquidGlass = isLiquidGlassAvailable();

	/*
	 * Render the badge.
	 */
	return (
		<View>
			{/* Give the badge its own glass background in each header. */}
			<GlassView
				colorScheme={colorScheme}
				isInteractive
				style={[
					styles.surface,
					!hasLiquidGlass && styles.fallbackSurface,
					!hasLiquidGlass && isLightBackground && styles.lightFallbackSurface,
				]}
			>
				<Pressable
					accessibilityHint="Opens your notifications and activity log"
					accessibilityLabel={accessibilityLabel}
					accessibilityRole="button"
					onPress={handleOpenProgress}
					style={({ pressed }) => [styles.badge, pressed && styles.pressedBadge]}
				>
					<View style={styles.balanceRow}>
						<Text
							numberOfLines={1}
							style={[styles.levelText, textStyle]}
						>
							{levelLabel}
						</Text>
						<View style={styles.inkBalance}>
							<MaterialSymbol
								name="water_drop"
								size={14}
								color={inkIconColor}
							/>
							<Text
								numberOfLines={1}
								style={[
									styles.levelText,
									{
										color: inkColor,
									},
								]}
							>
								{inkLabel}
							</Text>
						</View>
					</View>
					<ProgressBar
						color={accentColor}
						percent={progressPercentage}
						style={styles.progressBarContainer}
					/>
				</Pressable>
			</GlassView>
			<UserProgressModal
				onRequestClose={() => setIsProgressVisible(false)}
				visible={isProgressVisible}
			/>
		</View>
	);
}

/*
 * Styles
 */
const styles = StyleSheet.create({
	surface: {
		borderRadius: 999,
	},
	fallbackSurface: {
		backgroundColor: '#FFFFFF12',
		borderColor: '#FFFFFF1F',
		borderWidth: 1,
	},
	lightFallbackSurface: {
		backgroundColor: '#FFFFFF80',
		borderColor: colors.light.border,
	},
	badge: {
		alignItems: 'center',
		justifyContent: 'center',
		paddingHorizontal: 12,
		paddingVertical: 6,
		gap: 4,
		minWidth: 72,
		minHeight: 44,
	},
	pressedBadge: {
		opacity: 0.65,
	},
	levelText: {
		color: colors.light.text,
		fontFamily: 'lexend-600',
		fontSize: 12,
		lineHeight: 16,
	},
	balanceRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
	inkBalance: { flexDirection: 'row', alignItems: 'center', gap: 2 },
	progressBarContainer: {
		borderColor: colors.light.border,
		borderRadius: 8,
		borderWidth: 1,
		height: 6,
		width: '100%',
		minWidth: 40,
	},
});

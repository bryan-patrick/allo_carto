import colors from '@/src/app/colors';
import { useUserProgress } from '@/src/db/useUserProgress';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import ProgressBar from './ProgressBar';
import UserProgressModal from './UserProgressModal';

/**
 * Player level and XP bar for headers
 */
export default function LevelBadge() {
	const { experience, status } = useUserProgress();
	const [isProgressVisible, setIsProgressVisible] = useState(false);
	const { level, isMaxLevel, xpIntoLevel, xpForNextLevel, progressPercentage } = experience;
	const levelLabel = `Lvl. ${level}`;
	let progressDescription = `${xpIntoLevel} of ${xpForNextLevel} XP toward level ${level + 1}`;

	if (isMaxLevel) {
		progressDescription = 'Maximum level reached';
	}

	const accessibilityLabel = `Level ${level}. ${progressDescription}`;

	if (status !== 'ready') return null;

	/**
	 * Render the badge.
	 */
	return (
		<View>
			<Pressable
				accessibilityHint="Opens user progress"
				accessibilityLabel={accessibilityLabel}
				accessibilityRole="button"
				onPress={() => setIsProgressVisible(true)}
				style={({ pressed }) => [styles.badge, pressed && styles.pressedBadge]}
			>
				<Text
					numberOfLines={1}
					style={styles.levelText}
				>
					{levelLabel}
				</Text>
				<ProgressBar
					color={colors.light.goldenBorder}
					percent={progressPercentage}
					style={styles.progressBarContainer}
				/>
			</Pressable>
			<UserProgressModal
				onRequestClose={() => setIsProgressVisible(false)}
				visible={isProgressVisible}
			/>
		</View>
	);
}

/**
 * Styles
 */
const styles = StyleSheet.create({
	badge: {
		alignItems: 'center',
		justifyContent: 'center',
		paddingHorizontal: 12,
		paddingVertical: 6,
		gap: 4,
		minWidth: 72,
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
	progressBarContainer: {
		borderColor: colors.light.border,
		borderRadius: 8,
		borderWidth: 1,
		height: 6,
		width: '100%',
		minWidth: 40,
	},
});

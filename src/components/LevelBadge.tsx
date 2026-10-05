import colors from '@/src/app/colors';
import { useUserProgress } from '@/src/db/useUserProgress';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import UserProgressModal from './UserProgressModal';

/**
 * Player level and XP bar for headers
 */
export default function LevelBadge() {
	const { experience, status } = useUserProgress();
	const [isProgressVisible, setIsProgressVisible] = useState(false);
	const { level, isMaxLevel, xpIntoLevel, xpForNextLevel, progressPercentage } = experience;
	const levelLabel = `Lvl. ${level}`;
	const progressBarStyle: ViewStyle = { width: `${progressPercentage}%` };
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
				<View style={styles.progressBarContainer}>
					<View style={[styles.progressBar, progressBarStyle]} />
				</View>
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
		borderRadius: 16,
		justifyContent: 'center',
		paddingHorizontal: 14,
		paddingVertical: 10,
		gap: 4,
		borderWidth: 1,
		borderColor: 'rgba(255, 255, 255, 0.08)',
		backgroundColor: 'rgba(255, 255, 255, 0.05)',
	},
	pressedBadge: {
		backgroundColor: 'rgba(255, 255, 255, 0.1)',
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
		overflow: 'hidden',
		width: '100%',
		minWidth: 40,
	},
	progressBar: {
		backgroundColor: colors.light.goldenBorder,
		height: '100%',
	},
});

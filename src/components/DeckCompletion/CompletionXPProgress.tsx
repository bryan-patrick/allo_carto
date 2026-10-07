import colors from '@/src/app/colors';
import ProgressBar, { progressBarAnimationDuration } from '@/src/components/ProgressBar';
import { getUserExperience } from '@/src/util/userExperience';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';

/**
 * Typing
 */
interface CompletionXPProgressProps {
	fromXP: number;
	toXP: number;
	delay: number;
	color: string;
}

/**
 * Fill the bar to show the user's new XP. This hasn't been working well...
 * Might have something to do with the reduced motion
 * The carry over on level up does work though.
 */
export default function CompletionXPProgress({
	fromXP,
	toXP,
	delay,
	color,
}: CompletionXPProgressProps) {
	const reducedMotion = useReducedMotion();

	const [experience, setExperience] = useState(() => {
		if (reducedMotion) {
			return getUserExperience(toXP);
		}
		return getUserExperience(fromXP);
	});

	const previousExperience = getUserExperience(fromXP);

	let nextLevelLabel = `Lvl. ${experience.level + 1}`;
	let progressLabel = `${experience.xpIntoLevel} / ${experience.xpForNextLevel} XP`;
	let levelUpLabel: string | undefined;

	if (experience.isMaxLevel) {
		nextLevelLabel = 'Max';
		progressLabel = 'Maximum level reached';
	}

	if (experience.level > previousExperience.level) {
		levelUpLabel = `Level up! Lvl. ${previousExperience.level} → Lvl. ${experience.level}`;
	}

	/**
	 * Wait until the XP amounts finish counting, then fill the bar
	 * Stop the timers if the user leaves this view.
	 */
	useEffect(() => {
		if (reducedMotion) {
			return;
		}

		const timers: ReturnType<typeof setTimeout>[] = [];
		const finalExperience = getUserExperience(toXP);
		let currentExperience = getUserExperience(fromXP);
		let elapsed = delay;
		let boundaryXP = fromXP;

		while (currentExperience.level < finalExperience.level) {
			/**
			 * Fill the current level's bar all the way before moving to the next level.
			 */
			const fullExperience = {
				...currentExperience,
				xpIntoLevel: currentExperience.xpForNextLevel,
				progressPercentage: 100,
			};

			timers.push(setTimeout(() => setExperience(fullExperience), elapsed));
			elapsed += progressBarAnimationDuration + 144;

			/**
			 * After the bar fills, show the next level with an empty bar.
			 */
			boundaryXP += currentExperience.xpForNextLevel - currentExperience.xpIntoLevel;
			currentExperience = getUserExperience(boundaryXP);

			const nextExperience = currentExperience;

			timers.push(setTimeout(() => setExperience(nextExperience), elapsed));
			elapsed += 144;
		}

		/**
		 * Fill the last bar up to the user's new XP amount.
		 */
		timers.push(setTimeout(() => setExperience(finalExperience), elapsed));

		return () => timers.forEach(clearTimeout);
	}, [fromXP, toXP, delay, reducedMotion]);

	/**
	 * Render the current level, XP amount, and progress bar
	 */
	return (
		<View style={styles.container}>
			{levelUpLabel && <Text style={styles.levelUp}>{levelUpLabel}</Text>}
			<View
				accessible
				accessibilityLabel={`Level ${experience.level}. ${progressLabel}.`}
				accessibilityRole="progressbar"
				accessibilityValue={{ min: 0, max: 100, now: experience.progressPercentage }}
				style={styles.progress}
			>
				<View style={styles.progressRow}>
					<Text style={styles.level}>Lvl. {experience.level}</Text>
					<ProgressBar
						key={experience.level}
						color={color}
						percent={experience.progressPercentage}
						style={styles.bar}
					/>
					<Text style={styles.level}>{nextLevelLabel}</Text>
				</View>
				<Text style={styles.progressLabel}>{progressLabel}</Text>
			</View>
		</View>
	);
}

/**
 * Styles
 */
const styles = StyleSheet.create({
	container: {
		gap: 4,
	},
	levelUp: {
		fontFamily: 'lexend-600',
		fontSize: 12,
		color: colors.dark.success,
		textAlign: 'center',
	},
	progress: {
		gap: 8,
	},
	progressRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
	},
	level: {
		fontFamily: 'lexend-400',
		fontSize: 12,
		color: colors.dark.text,
	},
	bar: {
		flex: 1,
		height: 10,
		borderRadius: 4,
		borderWidth: 1,
		borderColor: colors.light.border,
		backgroundColor: colors.light.background,
	},
	progressLabel: {
		fontFamily: 'azeret-mono-400',
		fontSize: 12,
		textAlign: 'center',
		color: colors.dark.text,
	},
});

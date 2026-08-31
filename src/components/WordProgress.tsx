import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ComponentProps, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withDelay,
	withSpring,
} from 'react-native-reanimated';
import colors from '../app/colors';
import {
	getWordProgressDefinition,
	getWordProgressDefinitionByKey,
	WordProgressKey,
} from '../util/wordProgress';
import { useCardDeck } from './CardDeck/useCardDeck';

/**
 * Typing
 */
type WordProgressIconProps = Omit<ComponentProps<typeof MaterialIcons>, 'name'> & {
	progress: WordProgressKey;
};

/**
 * WordProgressIcon Component
 */
export function WordProgressIcon({ progress, size = 12, color, ...props }: WordProgressIconProps) {
	const progressDefinition = getWordProgressDefinitionByKey(progress);

	return (
		<MaterialIcons
			{...props}
			color={color ?? colors.wordProgress[progressDefinition.key]}
			size={size}
			name={progressDefinition.iconName}
		/>
	);
}

/**
 * WordProgress Component
 */
export default function WordProgress() {
	const { currentCard } = useCardDeck();

	/**
	 * State
	 */
	const [currentScore] = useState(currentCard.correctCount);
	const [nextScore] = useState(currentCard.correctCount + 1);

	const [currentProgress] = useState(() =>
		getWordProgressDefinition({
			correctCount: currentCard.correctCount,
			seenCount: currentCard.seenCount,
		}),
	);

	const [nextProgress] = useState(() =>
		getWordProgressDefinition({
			correctCount: currentCard.correctCount + 1,
			seenCount: currentCard.seenCount,
		}),
	);

	/**
	 * Animations / styles
	 */
	const currentProgressColorStyle = { backgroundColor: colors.wordProgress[currentProgress.key] };
	const nextProgressColorStyle = { backgroundColor: colors.wordProgress[nextProgress.key] };
	const translateY = useSharedValue(0);

	const animatedContainerStyle = useAnimatedStyle(() => ({
		transform: [{ translateY: translateY.get() }],
	}));

	/**
	 * Trigger the animation
	 */
	useEffect(() => {
		if (currentCard.correctCount !== currentScore) {
			translateY.set(
				withDelay(
					400,
					withSpring(-44, {
						stiffness: 1200,
						damping: 30,
						mass: 1,
					}),
				),
			);
		}
	}, [currentScore, currentCard.correctCount, translateY]);

	/**
	 * Render the word progress
	 */
	return (
		<View style={styles.wordProgressContainer}>
			<Animated.View style={[styles.animationContainer, animatedContainerStyle]}>
				<Animated.View style={[styles.currentContainer, currentProgressColorStyle]}>
					<Animated.Text style={styles.scoreText}>{currentScore}</Animated.Text>
					<WordProgressIcon
						progress={currentProgress.key}
						size={18}
						color={colors.light.text}
					/>
					<Animated.Text style={styles.progressText}>{currentProgress.name}</Animated.Text>
				</Animated.View>
				<Animated.View style={[styles.nextContainer, nextProgressColorStyle]}>
					<Animated.Text style={styles.scoreText}>{nextScore}</Animated.Text>
					<WordProgressIcon
						progress={nextProgress.key}
						size={18}
						color={colors.light.text}
					/>
					<Animated.Text style={styles.progressText}>{nextProgress.name}</Animated.Text>
				</Animated.View>
			</Animated.View>
		</View>
	);
}

/**
 * Styles
 */
const styles = StyleSheet.create({
	wordProgressContainer: {
		display: 'flex',
		height: 22,
		backgroundColor: colors.dark.background,
	},
	animationContainer: {
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'space-between',
		gap: 22,
	},
	currentContainer: {
		display: 'flex',
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		paddingHorizontal: 6,
		height: 22,
		gap: 4,
		borderLeftWidth: 1,
	},
	nextContainer: {
		display: 'flex',
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		paddingHorizontal: 6,
		height: 22,
		gap: 4,
		borderLeftWidth: 1,
	},
	scoreText: {
		color: colors.light.text,
		fontSize: 14,
		fontFamily: 'azeret-mono-600',
	},
	progressText: {
		color: colors.light.text,
		fontSize: 10,
		fontFamily: 'azeret-mono-600',
		textTransform: 'uppercase',
	},
});

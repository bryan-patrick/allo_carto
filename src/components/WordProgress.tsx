import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ComponentProps, useEffect, useMemo, useState } from 'react';
import { StyleSheet, TextStyle, View, ViewStyle } from 'react-native';
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withDelay,
	withSpring,
} from 'react-native-reanimated';
import colors from '../app/colors';
import {
	getWordProgressDefinitionByKey,
	getWordProgressDefinitionFromCorrectCount,
	WordProgressKey,
} from '../util/wordProgress';
import { useCardDeck } from './CardDeck/useCardDeck';

/**
 * Typing
 */
type WordProgressIconProps = Omit<ComponentProps<typeof MaterialIcons>, 'name'> & {
	progress?: WordProgressKey;
	score?: number;
};

function getWordProgressColor(score: number = 0) {
	return colors.wordProgress[getWordProgressDefinitionFromCorrectCount(score).key];
}

/**
 * WordProgressIcon Component
 */
export function WordProgressIcon({
	progress,
	score = 0,
	size = 12,
	color,
	...props
}: WordProgressIconProps) {
	let progressDefinition = getWordProgressDefinitionFromCorrectCount(score);

	if (progress) {
		progressDefinition = getWordProgressDefinitionByKey(progress);
	}

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
	const [currentScore] = useState(currentCard.correctCount);
	const [nextScore] = useState(currentCard.correctCount + 1);

	const currentProgress = useMemo(
		() => getWordProgressDefinitionFromCorrectCount(currentScore),
		[currentScore],
	);
	const nextProgress = useMemo(
		() => getWordProgressDefinitionFromCorrectCount(nextScore),
		[nextScore],
	);
	const currentProgressColor = useMemo(
		() => ({ backgroundColor: getWordProgressColor(currentScore) }),
		[currentScore],
	);
	const nextProgressColor = useMemo(
		() => ({ backgroundColor: getWordProgressColor(nextScore) }),
		[nextScore],
	);

	const translateY = useSharedValue(0);
	const containerY = useAnimatedStyle(() => ({
		transform: [{ translateY: translateY.get() }],
	}));

	const {
		wordProgressContainer,
		animationContainer,
		currentContainer,
		nextContainer,
		scoreText,
		progressText,
		icon,
	} = wordProgressStyles;

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

	return (
		<View style={wordProgressContainer}>
			<Animated.View style={[animationContainer, containerY]}>
				<Animated.View style={[currentContainer, currentProgressColor]}>
					<Animated.Text style={scoreText}>{currentScore}</Animated.Text>
					<WordProgressIcon
						style={icon}
						score={currentScore}
						size={18}
						color={colors.light.text}
					/>
					<Animated.Text style={progressText}>{currentProgress.name}</Animated.Text>
				</Animated.View>
				<Animated.View style={[nextContainer, nextProgressColor]}>
					<Animated.Text style={scoreText}>{nextScore}</Animated.Text>
					<WordProgressIcon
						style={icon}
						score={nextScore}
						size={18}
						color={colors.light.text}
					/>
					<Animated.Text style={progressText}>{nextProgress.name}</Animated.Text>
				</Animated.View>
			</Animated.View>
		</View>
	);
}

const wordProgressStyles = StyleSheet.create<Record<string, ViewStyle & TextStyle>>({
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
	icon: {},
});

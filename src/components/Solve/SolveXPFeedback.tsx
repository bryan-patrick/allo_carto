import colors from '@/src/app/colors';
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useRef,
	useState,
	type ReactNode,
} from 'react';
import {
	Animated,
	Easing,
	Platform,
	StyleSheet,
	Text,
	View,
	useWindowDimensions,
} from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FullWindowOverlay } from 'react-native-screens';

export interface SolveXPFeedbackOrigin {
	centerX: number;
	top: number;
}

interface SolveXPFeedbackRequest extends SolveXPFeedbackOrigin {
	xp: number;
}

interface FloatingXPReward extends SolveXPFeedbackRequest {
	id: number;
}

interface SolveXPFeedbackProviderProps {
	children: ReactNode;
}

interface FloatingXPLabelProps {
	reward: FloatingXPReward;
	onFinished: (rewardId: number) => void;
}

type ShowSolveXPFeedback = (request: SolveXPFeedbackRequest) => void;

const SolveXPFeedbackContext = createContext<ShowSolveXPFeedback | null>(null);
const feedbackDuration = 3000;
const feedbackWidth = 180;

/*
 * Show claimed XP above the puzzle, outside its card and scrolling areas.
 * Keep each label visible while it floats, even after its claim button disappears.
 */
export function SolveXPFeedbackProvider({ children }: SolveXPFeedbackProviderProps) {
	const { width: windowWidth } = useWindowDimensions();
	const { top: topInset } = useSafeAreaInsets();
	const nextRewardId = useRef(0);
	const [rewards, setRewards] = useState<FloatingXPReward[]>([]);

	const showFeedback = useCallback(
		(request: SolveXPFeedbackRequest) => {
			const halfLabelWidth = feedbackWidth / 2;
			const rightmostCenterX = Math.max(halfLabelWidth, windowWidth - halfLabelWidth);
			const boundedCenterX = Math.min(request.centerX, rightmostCenterX);
			const labelCenterX = Math.max(halfLabelWidth, boundedCenterX);
			const highestLabelStart = topInset + 88;
			const labelTop = Math.max(highestLabelStart, request.top - 28);
			const rewardId = nextRewardId.current + 1;
			const reward: FloatingXPReward = {
				id: rewardId,
				xp: request.xp,
				centerX: labelCenterX,
				top: labelTop,
			};

			nextRewardId.current = rewardId;
			setRewards(currentRewards => [...currentRewards, reward]);
		},
		[topInset, windowWidth],
	);

	const removeFeedback = useCallback((rewardId: number) => {
		setRewards(currentRewards => {
			return currentRewards.filter(reward => reward.id !== rewardId);
		});
	}, []);

	const feedbackOverlay =
		rewards.length > 0 ?
			<View
				accessibilityElementsHidden
				importantForAccessibility="no-hide-descendants"
				pointerEvents="none"
				style={styles.overlay}
			>
				{rewards.map(reward => (
					<FloatingXPLabel
						key={reward.id}
						reward={reward}
						onFinished={removeFeedback}
					/>
				))}
			</View>
		:	null;

	return (
		<SolveXPFeedbackContext.Provider value={showFeedback}>
			<View style={styles.container}>
				{children}
				{Platform.OS === 'ios' && feedbackOverlay ?
					<FullWindowOverlay>{feedbackOverlay}</FullWindowOverlay>
				:	feedbackOverlay}
			</View>
		</SolveXPFeedbackContext.Provider>
	);
}

// Let puzzle claim buttons show the XP they just awarded.
export function useSolveXPFeedback(): ShowSolveXPFeedback {
	const showFeedback = useContext(SolveXPFeedbackContext);

	if (!showFeedback) {
		throw new Error('Puzzle XP feedback needs SolveXPFeedbackProvider.');
	}

	return showFeedback;
}

// Float claimed XP upward for three seconds, then fade it away and remove the label.
function FloatingXPLabel({ reward, onFinished }: FloatingXPLabelProps) {
	const animationProgress = useRef(new Animated.Value(0)).current;
	const reducedMotion = useReducedMotion();
	const animatedStyle = {
		left: reward.centerX - feedbackWidth / 2,
		top: reward.top,
		opacity: animationProgress.interpolate({
			inputRange: [0, 0.45, 1],
			outputRange: [1, 1, 0],
		}),
		transform: [
			{
				translateY: animationProgress.interpolate({
					inputRange: [0, 1],
					outputRange: [0, reducedMotion ? 0 : -80],
				}),
			},
		],
	};
	const xpLabel = `+${reward.xp.toLocaleString()} XP`;

	useEffect(() => {
		const animation = Animated.timing(animationProgress, {
			toValue: 1,
			duration: feedbackDuration,
			easing: Easing.out(Easing.quad),
			useNativeDriver: true,
		});

		animation.start(({ finished }) => {
			if (finished) {
				onFinished(reward.id);
			}
		});

		return () => animation.stop();
	}, [animationProgress, onFinished, reward.id]);

	return (
		<Animated.View style={[styles.position, animatedStyle]}>
			<Text style={styles.label}>{xpLabel}</Text>
		</Animated.View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	overlay: {
		...StyleSheet.absoluteFill,
		elevation: 10,
		zIndex: 10,
	},
	position: {
		position: 'absolute',
		width: feedbackWidth,
	},
	label: {
		color: colors.dark.success,
		fontFamily: 'lexend-700',
		fontSize: 20,
		textAlign: 'center',
		textShadowColor: colors.light.secondary,
		textShadowOffset: {
			width: 0,
			height: 1,
		},
		textShadowRadius: 4,
	},
});

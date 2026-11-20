import colors from '@/src/app/colors';
import type { Paragraph } from '@/src/components/CardDeck/cardDeckTypes';
import {
	ParagraphPostcardBacking,
	type ParagraphPostcardProps,
} from '@/src/components/ParagraphPostcard';
import { readSelectedParagraph, saveSelectedParagraph } from '@/src/settings/selectedParagraph';
import { getAtlasItemLabel, isItemUnlocked } from '@/src/util/atlasCompletion';
import type { ProgressById } from '@/src/util/progression';
import {
	cloneElement,
	useCallback,
	useEffect,
	useState,
	type ReactElement,
	type ReactNode,
} from 'react';
import {
	AccessibilityInfo,
	StyleSheet,
	View,
	type AccessibilityActionEvent,
	type AccessibilityActionInfo,
	type LayoutChangeEvent,
	type ViewProps,
	type ViewStyle,
} from 'react-native';
import {
	GestureDetector,
	GestureHandlerRootView,
	usePanGesture,
} from 'react-native-gesture-handler';
import Animated, {
	cancelAnimation,
	Easing,
	ReduceMotion,
	useAnimatedProps,
	useAnimatedStyle,
	useReducedMotion,
	useSharedValue,
	withDelay,
	withSequence,
	withSpring,
	withTiming,
	type SharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scheduleOnRN } from 'react-native-worklets';

const carouselBackground = require('@/src/app/assets/images/chapters/background-alt.jpg');

/**
 * Typing
 */
interface ChapterParagraphSelection {
	chapterId: string;
	userId: string;
	paragraphs: Paragraph[];
	progressById: ProgressById;
}

interface ParagraphPostcardCarouselProps extends ChapterParagraphSelection {
	children: ReactElement<ParagraphPostcardProps>[];
	disabled: boolean;
	paragraphToRevealId?: string;
	onUnlockRevealComplete: (paragraphId: string) => void;
}

interface CarouselPostcardProps {
	index: number;
	activeIndex: number;
	cardHeight: number;
	cardSpacing: number;
	postcardCenter: number;
	position: SharedValue<number>;
	isMoving: SharedValue<boolean>;
	isReducedMotionEnabled: boolean;
	disabled: boolean;
	isRevealTarget: boolean;
	revealRotation: SharedValue<number>;
	children: ReactNode;
}

interface PostcardSpringSettings {
	damping: number;
	stiffness: number;
	mass: number;
	energyThreshold: number;
	reduceMotion: ReduceMotion;
}

/**
 * Motion and screen reader controls
 */
const postcardSpring: PostcardSpringSettings = {
	damping: 26,
	stiffness: 260,
	mass: 0.9,
	energyThreshold: 0.0001,
	reduceMotion: ReduceMotion.System,
};

const paragraphActions: AccessibilityActionInfo[] = [
	{
		name: 'increment',
		label: 'Next paragraph',
	},
	{
		name: 'decrement',
		label: 'Previous paragraph',
	},
];

/**
 * Finds either the saved current paragraph or the furthest unlocked
 * paragraph on initially opening the paragraph select view.
 */
function getInitialParagraphId({
	chapterId,
	userId,
	paragraphs,
	progressById,
}: ChapterParagraphSelection): string {
	const savedParagraphId = readSelectedParagraph({
		chapterId,
		userId,
	});
	const savedParagraph = paragraphs.find(paragraph => paragraph.id === savedParagraphId);
	let selectedParagraphId = paragraphs[0]?.id ?? '';

	if (savedParagraph) {
		return savedParagraph.id;
	}

	for (const paragraph of paragraphs) {
		if (
			isItemUnlocked({
				id: paragraph.id,
				progressById,
			})
		) {
			selectedParagraphId = paragraph.id;
		}
	}

	return selectedParagraphId;
}

/**
 * Positions each postcard closer to its neighbor during a swipe.
 */
function getPostcardOffset(distance: number, cardSpacing: number): number {
	'worklet';

	const absoluteDistance = Math.abs(distance);
	let easedDistance = absoluteDistance;

	if (absoluteDistance < 1) {
		easedDistance = Math.pow(absoluteDistance, 1.2);
	}

	return Math.sign(distance) * easedDistance * cardSpacing;
}

/**
 * WIGGLE WIGGLE
 */
function wiggleUnlockedPostcard(
	revealRotation: SharedValue<number>,
	paragraphId: string,
	onComplete: (paragraphId: string) => void,
) {
	'worklet';

	revealRotation.set(
		withSequence(
			withTiming(-2.5, {
				duration: 100,
			}),
			withTiming(2.5, {
				duration: 140,
			}),
			withTiming(-1.5, {
				duration: 120,
			}),
			withTiming(1, {
				duration: 100,
			}),
			withTiming(
				0,
				{
					duration: 100,
				},
				finished => {
					if (finished) {
						scheduleOnRN(onComplete, paragraphId);
					}
				},
			),
		),
	);
}

/**
 * Shows a moving postcard and keeps its actions available only when it is still.
 */
function CarouselPostcard({
	index,
	activeIndex,
	cardHeight,
	cardSpacing,
	postcardCenter,
	position,
	isMoving,
	isReducedMotionEnabled,
	disabled,
	isRevealTarget,
	revealRotation,
	children,
}: CarouselPostcardProps) {
	/**
	 * Movement and button availability
	 */
	const isActive = index === activeIndex;
	const cardSizeStyle = {
		minHeight: cardHeight,
		top: postcardCenter,
	};
	let importantForAccessibility: ViewProps['importantForAccessibility'] = 'no-hide-descendants';

	if (isActive && !disabled) {
		importantForAccessibility = 'auto';
	}

	/**
	 * Animated button availability and card position
	 */
	const animatedProps = useAnimatedProps<ViewProps>(() => {
		let pointerEvents: ViewProps['pointerEvents'] = 'none';

		if (isActive && !disabled && !isMoving.get()) {
			pointerEvents = 'auto';
		}

		return {
			pointerEvents,
		};
	});
	const animatedStyle = useAnimatedStyle<ViewStyle>(() => {
		const distance = index - position.get();
		const absoluteDistance = Math.abs(distance);
		const visibleDistance = Math.min(absoluteDistance, 1);
		const postcardOffset = getPostcardOffset(distance, cardSpacing);
		let scale = 1 - visibleDistance * 0.035;
		let opacity = 1 - visibleDistance * 0.3;
		let rotation = 0;

		if (isRevealTarget && !isReducedMotionEnabled) {
			rotation = revealRotation.get();
		}

		if (isReducedMotionEnabled) {
			scale = 1;
		}

		if (cardHeight === 0) {
			opacity = 0;
		}

		return {
			opacity,
			zIndex: 10 - Math.round(absoluteDistance * 2),
			transform: [
				{
					translateY: postcardOffset - cardHeight / 2,
				},
				{
					scale,
				},
				{
					rotateZ: `${rotation}deg`,
				},
			],
		};
	});

	return (
		<Animated.View
			accessibilityElementsHidden={!isActive || disabled}
			importantForAccessibility={importantForAccessibility}
			animatedProps={animatedProps}
			style={[styles.card, cardSizeStyle, animatedStyle]}
		>
			{children}
		</Animated.View>
	);
}

/**
 * The carousel used for the paragraph postcards on the paragraph select view.
 */
export default function ParagraphPostcardCarousel(props: ParagraphPostcardCarouselProps) {
	/**
	 * Chapter content, motion preference, and screen edges
	 */
	const {
		chapterId,
		userId,
		paragraphs,
		children,
		disabled,
		paragraphToRevealId,
		onUnlockRevealComplete,
	} = props;
	const isReducedMotionEnabled = useReducedMotion();
	const safeAreaInsets = useSafeAreaInsets();
	const bottomContentInset = Math.max(safeAreaInsets.bottom, 12);
	const carouselInsets = {
		paddingBottom: bottomContentInset,
	};

	/**
	 * Selected paragraph and measured sizes
	 */
	const [selectedParagraphId, setSelectedParagraphId] = useState(() =>
		getInitialParagraphId(props),
	);
	const [viewportHeight, setViewportHeight] = useState(0);
	const [cardHeight, setCardHeight] = useState(0);
	const selectedParagraphIndex = paragraphs.findIndex(
		paragraph => paragraph.id === selectedParagraphId,
	);
	const activeIndex = Math.max(0, selectedParagraphIndex);
	const selectedParagraph = paragraphs[activeIndex];
	const selectedVisibleParagraphId = selectedParagraph?.id;
	const revealParagraphIndex = paragraphs.findIndex(
		paragraph => paragraph.id === paragraphToRevealId,
	);
	const minimumCardSpacing = cardHeight + 4;
	const previewCardSpacing = (viewportHeight + cardHeight) / 2 - 96;
	const cardSpacing = Math.max(minimumCardSpacing, previewCardSpacing);
	const requestedDragThreshold = cardSpacing * 0.22;
	const minimumDragThreshold = Math.max(48, requestedDragThreshold);
	const dragThreshold = Math.min(96, minimumDragThreshold);
	const availableVerticalSpace = viewportHeight - cardHeight;
	const maximumPostcardLift = Math.max(0, availableVerticalSpace / 2 - 16);
	const postcardLift = Math.min(56, maximumPostcardLift);
	const postcardCenter = viewportHeight / 2 - postcardLift;

	/**
	 * Gesture and spring positions
	 */
	const position = useSharedValue(activeIndex);
	const isDragging = useSharedValue(false);
	const isSettling = useSharedValue(false);
	const isMoving = useSharedValue(false);
	const revealRotation = useSharedValue(0);
	const backingRevealStyle = useAnimatedStyle<ViewStyle>(() => {
		return {
			transform: [
				{
					rotateZ: `${revealRotation.get()}deg`,
				},
			],
		};
	});

	/**
	 * Moves the background more slowly than the postcards and keeps its edges covered.
	 */
	const maximumParagraphIndex = Math.max(paragraphs.length - 1, 1);
	let backgroundTravel = 0;

	if (!isReducedMotionEnabled) {
		backgroundTravel = Math.min(viewportHeight * 0.25, 160);
	}

	const backgroundImageHeight = viewportHeight + bottomContentInset + backgroundTravel;
	const backgroundImageStyle = useAnimatedStyle(() => {
		const boundedPosition = Math.max(0, Math.min(position.get(), maximumParagraphIndex));
		const chapterPosition = boundedPosition / maximumParagraphIndex;
		const backgroundOffset = -chapterPosition * backgroundTravel;

		return {
			height: backgroundImageHeight,
			transform: [
				{
					translateY: backgroundOffset,
				},
			],
		};
	});

	/**
	 * Holder size and screen reader description
	 */
	const holderStyle = {
		top: postcardCenter,
		height: cardHeight,
		marginTop: -cardHeight / 2,
		opacity: 0,
	};
	const indicatorPositionStyle = {
		transform: [
			{
				translateY: -postcardLift,
			},
		],
	};
	let paragraphDescription = '';

	if (cardHeight > 0) {
		holderStyle.opacity = 1;
	}

	if (selectedParagraph) {
		paragraphDescription = getAtlasItemLabel(selectedParagraph.id);
	}

	/**
	 * Selects the first available paragraph if the previous selection was removed.
	 */
	if (selectedParagraphIndex < 0 && selectedVisibleParagraphId) {
		setSelectedParagraphId(selectedVisibleParagraphId);
	}

	/**
	 * Selects the new paragraph and restores its buttons after the reveal finishes.
	 */
	const handleUnlockRevealComplete = useCallback(
		(paragraphId: string) => {
			setSelectedParagraphId(paragraphId);
			isSettling.set(false);
			isMoving.set(false);
			onUnlockRevealComplete(paragraphId);
			AccessibilityInfo.announceForAccessibility(`${getAtlasItemLabel(paragraphId)} unlocked.`);
		},
		[isMoving, isSettling, onUnlockRevealComplete],
	);

	/**
	 * Moves to a newly unlocked paragraph and wiggles its postcard after the screen returns.
	 */
	useEffect(() => {
		cancelAnimation(position);
		cancelAnimation(revealRotation);
		position.set(activeIndex);
		revealRotation.set(0);
		isDragging.set(false);
		isSettling.set(false);
		isMoving.set(false);

		if (paragraphToRevealId && revealParagraphIndex >= 0 && cardHeight > 0 && viewportHeight > 0) {
			isSettling.set(true);
			isMoving.set(true);
			position.set(
				withDelay(
					400,
					withTiming(
						revealParagraphIndex,
						{
							duration: 1300,
							easing: Easing.inOut(Easing.cubic),
							reduceMotion: ReduceMotion.System,
						},
						finished => {
							if (!finished) {
								return;
							}

							if (isReducedMotionEnabled) {
								scheduleOnRN(handleUnlockRevealComplete, paragraphToRevealId);
								return;
							}

							wiggleUnlockedPostcard(
								revealRotation,
								paragraphToRevealId,
								handleUnlockRevealComplete,
							);
						},
					),
				),
			);
		}

		return () => {
			cancelAnimation(position);
			cancelAnimation(revealRotation);
		};
	}, [
		activeIndex,
		paragraphs.length,
		selectedParagraphIndex,
		selectedVisibleParagraphId,
		position,
		isDragging,
		isSettling,
		isMoving,
		revealRotation,
		paragraphToRevealId,
		revealParagraphIndex,
		cardHeight,
		viewportHeight,
		isReducedMotionEnabled,
		handleUnlockRevealComplete,
	]);

	/**
	 * Saves the visible selection after opening the chapter or settling on a postcard.
	 */
	useEffect(() => {
		if (selectedVisibleParagraphId) {
			saveSelectedParagraph({
				chapterId,
				userId,
				paragraphId: selectedVisibleParagraphId,
			});
		}
	}, [chapterId, userId, selectedVisibleParagraphId]);

	/**
	 * Updates the selected paragraph when its postcard has finished settling.
	 */
	function handleSnapComplete(paragraphIndex: number) {
		const paragraph = paragraphs[paragraphIndex];

		if (paragraph) {
			setSelectedParagraphId(paragraph.id);
		}

		isSettling.set(false);
		isMoving.set(false);
	}

	/**
	 * Sets the space available for the postcard previews.
	 */
	function handleViewportLayout(event: LayoutChangeEvent) {
		setViewportHeight(event.nativeEvent.layout.height);
	}

	/**
	 * Gives every postcard enough room for the chapter's tallest content.
	 */
	function handleCardContentHeightChange(measuredHeight: number) {
		setCardHeight(currentHeight => Math.max(currentHeight, measuredHeight));
	}

	/**
	 * Changes paragraphs through the screen reader's next and previous actions.
	 */
	function handleAccessibilityAction(event: AccessibilityActionEvent) {
		let nextIndex = activeIndex;

		if (disabled || isMoving.get()) {
			return;
		}

		if (event.nativeEvent.actionName === 'increment') {
			nextIndex = Math.min(activeIndex + 1, paragraphs.length - 1);
		} else if (event.nativeEvent.actionName === 'decrement') {
			nextIndex = Math.max(activeIndex - 1, 0);
		}

		if (nextIndex === activeIndex) {
			return;
		}

		isSettling.set(true);
		isMoving.set(true);
		position.set(
			withSpring(nextIndex, postcardSpring, finished => {
				'worklet';

				if (finished) {
					scheduleOnRN(handleSnapComplete, nextIndex);
				}
			}),
		);
	}

	/**
	 * Waits for a vertical pull so the postcard's buttons still respond to taps.
	 */
	const panGesture = usePanGesture({
		enabled: !disabled && cardHeight > 0 && paragraphs.length > 1,
		activeOffsetY: [-12, 12],
		failOffsetX: [-20, 20],
		maxPointers: 1,
		cancelsJSResponder: true,
		onActivate: () => {
			'worklet';

			if (!isSettling.get()) {
				isDragging.set(true);
				isMoving.set(true);
			}
		},
		onUpdate: event => {
			'worklet';

			const requestedMovement = -event.translationY / cardSpacing;
			const movementResistance = 1 + Math.abs(requestedMovement) * 0.65;
			let movement = requestedMovement / movementResistance;

			if (!isDragging.get()) {
				return;
			}

			if (
				(activeIndex === 0 && movement < 0) ||
				(activeIndex === paragraphs.length - 1 && movement > 0)
			) {
				movement *= 0.2;
			}

			movement = Math.max(-0.85, Math.min(0.85, movement));
			position.set(activeIndex + movement);
		},
		onDeactivate: event => {
			'worklet';

			let nextIndex = activeIndex;

			if (!isDragging.get()) {
				return;
			}

			if (!event.canceled && event.translationY < -dragThreshold) {
				nextIndex = Math.min(activeIndex + 1, paragraphs.length - 1);
			} else if (!event.canceled && event.translationY > dragThreshold) {
				nextIndex = Math.max(activeIndex - 1, 0);
			}

			isDragging.set(false);
			isSettling.set(true);
			position.set(
				withSpring(nextIndex, postcardSpring, finished => {
					if (finished) {
						scheduleOnRN(handleSnapComplete, nextIndex);
					}
				}),
			);
		},
	});

	return (
		<GestureHandlerRootView style={styles.root}>
			<Animated.Image
				accessible={false}
				pointerEvents="none"
				source={carouselBackground}
				resizeMode="cover"
				style={[styles.backgroundImage, backgroundImageStyle]}
			/>
			<View style={[styles.carousel, carouselInsets]}>
				<View
					accessible
					accessibilityRole="adjustable"
					accessibilityLabel="Selected paragraph"
					accessibilityHint="Adjust up or down to change paragraphs."
					accessibilityValue={{
						min: 1,
						max: paragraphs.length,
						now: activeIndex + 1,
						text: paragraphDescription,
					}}
					accessibilityActions={paragraphActions}
					onAccessibilityAction={handleAccessibilityAction}
					style={[styles.indicators, indicatorPositionStyle]}
				>
					{paragraphs.map((paragraph, index) => (
						<View
							key={paragraph.id}
							style={[styles.dot, index === activeIndex && styles.selectedDot]}
						/>
					))}
				</View>
				<GestureDetector gesture={panGesture}>
					<View
						onLayout={handleViewportLayout}
						style={styles.viewport}
					>
						<Animated.View
							style={[styles.holder, holderStyle, backingRevealStyle]}
							pointerEvents="none"
						>
							<ParagraphPostcardBacking />
						</Animated.View>
						{children.map((postcard, index) => (
							<CarouselPostcard
								key={paragraphs[index].id}
								index={index}
								activeIndex={activeIndex}
								cardHeight={cardHeight}
								cardSpacing={cardSpacing}
								postcardCenter={postcardCenter}
								position={position}
								isMoving={isMoving}
								isReducedMotionEnabled={isReducedMotionEnabled}
								disabled={disabled}
								isRevealTarget={index === revealParagraphIndex}
								revealRotation={revealRotation}
							>
								{cloneElement(postcard, {
									onContentHeightChange: handleCardContentHeightChange,
								})}
							</CarouselPostcard>
						))}
					</View>
				</GestureDetector>
			</View>
		</GestureHandlerRootView>
	);
}

/**
 * Styles
 */
const styles = StyleSheet.create({
	root: {
		flex: 1,
		overflow: 'hidden',
	},
	carousel: {
		flex: 1,
		flexDirection: 'row',
		paddingHorizontal: 8,
		overflow: 'hidden',
	},
	backgroundImage: {
		position: 'absolute',
		top: 0,
		left: 0,
		width: '100%',
	},
	indicators: {
		width: 14,
		alignItems: 'center',
		justifyContent: 'center',
		gap: 7,
	},
	dot: {
		width: 7,
		height: 7,
		borderRadius: 4,
		borderWidth: 1,
		borderColor: colors.dark.primary,
	},
	selectedDot: {
		backgroundColor: colors.dark.primary,
	},
	viewport: {
		flex: 1,
		overflow: 'hidden',
	},
	holder: {
		position: 'absolute',
		left: 12,
		right: 16,
	},
	card: {
		position: 'absolute',
		left: 12,
		right: 16,
	},
});

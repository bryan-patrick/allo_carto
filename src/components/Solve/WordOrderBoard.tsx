import colors from '@/src/app/colors';
import LinkButton from '@/src/components/LinkButton';
import MaterialSymbol from '@/src/components/MaterialSymbol';
import { moveWordOrderCard } from '@/src/util/solveWordOrder';
import { useRef, useState, type ElementRef } from 'react';
import {
	AccessibilityInfo,
	Animated,
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	View,
	type AccessibilityActionEvent,
	type GestureResponderEvent,
	type LayoutChangeEvent,
} from 'react-native';
import SolveRewardClaimButton from './SolveRewardClaimButton';
import type { SolveReward, SolveWordOrderCard } from './solveTypes';

/**
 * Typing
 */
interface WordOrderBoardProps {
	deckId: string;
	cards: SolveWordOrderCard[];
	positions: number[];
	lockedCardIds: number[];
	rewards: SolveReward[];
	disabled: boolean;
	onRewardClaimed: (reward: SolveReward) => void;
	onReorder: (positions: number[]) => Promise<boolean>;
	onDraggingChange: (isDragging: boolean) => void;
}

interface WordOrderBounds {
	x: number;
	y: number;
	width: number;
	height: number;
}

interface WordOrderDrag {
	cardId: number;
	startX: number;
	startY: number;
	boardBounds: WordOrderBounds | null;
	viewportBounds: WordOrderBounds | null;
}

/**
 * Lets the player put one sentence's French cards in order for Solve++.
 * Correct cards stay locked on an attempt.
 * The remaining cards can still move though.
 */
export default function WordOrderBoard({
	deckId,
	cards,
	positions,
	lockedCardIds,
	rewards,
	disabled,
	onRewardClaimed,
	onReorder,
	onDraggingChange,
}: WordOrderBoardProps) {
	/**
	 * Selection, dragging, and board measurements
	 */
	const [selectedCardId, setSelectedCardId] = useState<number | null>(null);
	const [draggedCardId, setDraggedCardId] = useState<number | null>(null);
	const [dropCardId, setDropCardId] = useState<number | null>(null);
	const [dragOffset] = useState(() => new Animated.ValueXY());
	const board = useRef<ElementRef<typeof View>>(null);
	const viewport = useRef<ElementRef<typeof View>>(null);
	const cardLayouts = useRef(new Map<number, WordOrderBounds>());
	const currentDrag = useRef<WordOrderDrag | null>(null);

	/**
	 * Cards, saved locks, and available moves
	 */
	const cardsById = new Map(cards.map(card => [card.id, card]));
	const lockedCards = new Set(lockedCardIds);
	const previousMovableIndex = getMoveTargetIndex(selectedCardId, -1);
	const nextMovableIndex = getMoveTargetIndex(selectedCardId, 1);
	const isDragging = draggedCardId !== null;
	const controlsDisabled = disabled || isDragging;
	const moveEarlierDisabled = controlsDisabled || previousMovableIndex < 0;
	const moveLaterDisabled = controlsDisabled || nextMovableIndex < 0;

	/**
	 * Drag display
	 */
	const movingStyle = {
		transform: dragOffset.getTranslateTransform(),
	};

	/**
	 * Finds the next unlocked slot for the move buttons.
	 */
	function getMoveTargetIndex(cardId: number | null, direction: number): number {
		let targetIndex = -1;

		if (cardId === null || lockedCards.has(cardId)) {
			return targetIndex;
		}

		targetIndex = positions.indexOf(cardId);

		if (targetIndex < 0) {
			return -1;
		}

		targetIndex += direction;

		while (targetIndex >= 0 && targetIndex < positions.length) {
			if (!lockedCards.has(positions[targetIndex])) {
				return targetIndex;
			}

			targetIndex += direction;
		}

		return -1;
	}

	async function moveCard(cardId: number, toIndex: number) {
		const fromIndex = positions.indexOf(cardId);
		const card = cardsById.get(cardId);
		const nextPositions = moveWordOrderCard(positions, fromIndex, toIndex, lockedCardIds);

		if (
			disabled ||
			fromIndex === toIndex ||
			fromIndex < 0 ||
			toIndex < 0 ||
			toIndex >= positions.length ||
			lockedCards.has(cardId) ||
			lockedCards.has(positions[toIndex])
		) {
			return;
		}

		const wasSaved = await onReorder(nextPositions);

		if (wasSaved && card) {
			AccessibilityInfo.announceForAccessibility(
				`${card.text}, position ${toIndex + 1} of ${positions.length}.`,
			);
		}
	}

	/**
	 * Selects or deselects a word.
	 */
	function handleSelect(cardId: number) {
		if (disabled || currentDrag.current || lockedCards.has(cardId)) {
			return;
		}

		if (selectedCardId === cardId) {
			setSelectedCardId(null);
		} else {
			setSelectedCardId(cardId);
		}
	}

	function handleAccessibilityMove(cardId: number, event: AccessibilityActionEvent) {
		const actionName = event.nativeEvent.actionName;

		if (controlsDisabled || lockedCards.has(cardId)) {
			return;
		}

		setSelectedCardId(cardId);

		if (actionName === 'moveEarlier') {
			moveCard(cardId, getMoveTargetIndex(cardId, -1));
		} else if (actionName === 'moveLater') {
			moveCard(cardId, getMoveTargetIndex(cardId, 1));
		}
	}

	function handleMoveEarlier() {
		if (moveEarlierDisabled || selectedCardId === null) {
			return;
		}

		moveCard(selectedCardId, previousMovableIndex);
	}

	function handleMoveLater() {
		if (moveLaterDisabled || selectedCardId === null) {
			return;
		}

		moveCard(selectedCardId, nextMovableIndex);
	}

	function handleCardLayout(cardId: number, event: LayoutChangeEvent) {
		cardLayouts.current.set(cardId, event.nativeEvent.layout);
	}

	/**
	 * Saves finger/cursor position
	 */
	function handleDragStart(cardId: number, event: GestureResponderEvent) {
		const drag: WordOrderDrag = {
			cardId,
			startX: event.nativeEvent.pageX,
			startY: event.nativeEvent.pageY,
			boardBounds: null,
			viewportBounds: null,
		};

		if (disabled || lockedCards.has(cardId)) {
			return;
		}

		currentDrag.current = drag;
		setSelectedCardId(cardId);
		setDraggedCardId(cardId);
		setDropCardId(null);
		dragOffset.setValue({
			x: 0,
			y: 0,
		});
		onDraggingChange(true);

		board.current?.measureInWindow((x, y, width, height) => {
			if (currentDrag.current === drag) {
				drag.boardBounds = {
					x,
					y,
					width,
					height,
				};
			}
		});

		viewport.current?.measureInWindow((x, y, width, height) => {
			if (currentDrag.current === drag) {
				drag.viewportBounds = {
					x,
					y,
					width,
					height,
				};
			}
		});
	}

	function findDropCard(event: GestureResponderEvent): number | null {
		const drag = currentDrag.current;
		const boardBounds = drag?.boardBounds;
		const viewportBounds = drag?.viewportBounds;
		const pageX = event.nativeEvent.pageX;
		const pageY = event.nativeEvent.pageY;
		let closestCardId: number | null = null;
		let closestDistance = Infinity;

		if (!boardBounds || !viewportBounds) {
			return null;
		}

		if (
			pageX < viewportBounds.x ||
			pageX > viewportBounds.x + viewportBounds.width ||
			pageY < viewportBounds.y ||
			pageY > viewportBounds.y + viewportBounds.height
		) {
			return null;
		}

		const boardX = pageX - boardBounds.x;
		const boardY = pageY - boardBounds.y;

		for (const cardId of positions) {
			const layout = cardLayouts.current.get(cardId);

			if (layout && !lockedCards.has(cardId)) {
				const centerX = layout.x + layout.width / 2;
				const centerY = layout.y + layout.height / 2;
				const distanceX = boardX - centerX;
				const distanceY = boardY - centerY;
				const distance = distanceX ** 2 + distanceY ** 2;

				if (distance < closestDistance) {
					closestDistance = distance;
					closestCardId = cardId;
				}
			}
		}

		return closestCardId;
	}

	/**
	 * Uses the difference in start position and current position
	 * to move the card position AND we also do a nearest
	 * card highlight.
	 */
	function handleDragMove(event: GestureResponderEvent) {
		const drag = currentDrag.current;

		if (!drag) {
			return;
		}

		dragOffset.setValue({
			x: event.nativeEvent.pageX - drag.startX,
			y: event.nativeEvent.pageY - drag.startY,
		});
		setDropCardId(findDropCard(event));
	}

	function clearDrag() {
		currentDrag.current = null;
		setDraggedCardId(null);
		setDropCardId(null);
		dragOffset.setValue({
			x: 0,
			y: 0,
		});
		onDraggingChange(false);
	}

	/**
	 * Positions the dragged card into the target cards slot
	 */
	function handleDragEnd(event: GestureResponderEvent) {
		const drag = currentDrag.current;
		const targetCardId = findDropCard(event);
		const targetIndex = targetCardId === null ? -1 : positions.indexOf(targetCardId);

		clearDrag();

		if (drag && targetIndex >= 0) {
			moveCard(drag.cardId, targetIndex);
		}
	}

	/**
	 * Render it
	 */
	return (
		<View style={styles.container}>
			<Text style={styles.instructions}>Put the cards in the correct order!</Text>
			<View
				ref={viewport}
				collapsable={false}
				style={styles.viewport}
			>
				<ScrollView
					scrollEnabled={!isDragging}
					bounces={false}
					overScrollMode="never"
				>
					<View
						ref={board}
						collapsable={false}
						style={styles.grid}
					>
						{positions.map((cardId, index) => {
							const card = cardsById.get(cardId);
							const isLocked = lockedCards.has(cardId);
							const isSelected = selectedCardId === cardId && !isLocked;
							const isDragged = draggedCardId === cardId;
							const isDropTarget = dropCardId === cardId && !isDragged;
							const isCardDisabled = controlsDisabled || isLocked;
							const reward = rewards.find(
								saved => saved.kind === 'card' && saved.position === cardId,
							);
							const hasPendingReward = reward?.claimedAt === null;
							const isRewardClaimed = Boolean(reward && reward.claimedAt !== null);
							let accessibilityHint =
								'Select this card, then use Move earlier or Move later to change its position, or drag it by its handle.';
							let accessibilityActions = [
								{
									name: 'moveEarlier',
									label: 'Move earlier',
								},
								{
									name: 'moveLater',
									label: 'Move later',
								},
							];

							if (!card) {
								return null;
							}

							if (isLocked) {
								accessibilityHint = 'Correct position. This word is locked.';
								accessibilityActions = [];
							}

							return (
								<Animated.View
									key={cardId}
									onLayout={event => handleCardLayout(cardId, event)}
									style={[
										styles.card,
										isLocked && styles.lockedCard,
										isSelected && styles.selectedCard,
										isDropTarget && styles.dropTarget,
										isDragged && styles.draggedCard,
										isDragged && movingStyle,
									]}
								>
									<Pressable
										accessibilityRole="button"
										accessibilityLabel={`${card.text}. Position ${index + 1} of ${positions.length}.`}
										accessibilityHint={accessibilityHint}
										accessibilityState={{
											selected: isSelected,
											disabled: isCardDisabled,
										}}
										accessibilityActions={accessibilityActions}
										onAccessibilityAction={event => handleAccessibilityMove(cardId, event)}
										disabled={isCardDisabled}
										onPress={() => handleSelect(cardId)}
										style={styles.cardTextArea}
									>
										<Text style={styles.word}>{card.text}</Text>
									</Pressable>
									{(!isLocked || isRewardClaimed) && (
										<View
											accessible={false}
											onStartShouldSetResponder={() => !disabled && !isLocked}
											onResponderGrant={event => handleDragStart(cardId, event)}
											onResponderMove={handleDragMove}
											onResponderRelease={handleDragEnd}
											onResponderTerminate={clearDrag}
											onResponderTerminationRequest={() => false}
											style={styles.dragHandle}
										>
											{!isLocked && (
												<MaterialSymbol
													name="drag_indicator"
													size={22}
													color={colors.dark.primary}
												/>
											)}
											{isLocked && isRewardClaimed && (
												<MaterialSymbol
													name="lock"
													size={22}
													color={colors.dark.success}
												/>
											)}
										</View>
									)}
									{isLocked && hasPendingReward && reward && (
										<View style={styles.claim}>
											<SolveRewardClaimButton
												deckId={deckId}
												reward={reward}
												disabled={controlsDisabled}
												onClaimed={onRewardClaimed}
											/>
										</View>
									)}
								</Animated.View>
							);
						})}
					</View>
				</ScrollView>
			</View>
			<View style={styles.moveControls}>
				<LinkButton
					accessibilityRole="button"
					accessibilityLabel="Move selected card earlier"
					disabled={moveEarlierDisabled}
					handler={handleMoveEarlier}
					contentPaddingHorizontal={6}
					contentPaddingVertical={6}
					style={[styles.moveButton, moveEarlierDisabled && styles.disabled]}
					SVGElement={
						<MaterialSymbol
							name="arrow_back"
							size={16}
							color={colors.light.text}
						/>
					}
				>
					Move earlier
				</LinkButton>
				<LinkButton
					accessibilityRole="button"
					accessibilityLabel="Move selected card later"
					disabled={moveLaterDisabled}
					handler={handleMoveLater}
					contentPaddingHorizontal={6}
					contentPaddingVertical={6}
					style={[styles.moveButton, moveLaterDisabled && styles.disabled]}
					SVGElement={
						<MaterialSymbol
							name="arrow_forward"
							size={16}
							color={colors.light.text}
						/>
					}
				>
					Move later
				</LinkButton>
			</View>
		</View>
	);
}

/**
 * Styles
 */
const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	instructions: {
		paddingHorizontal: 12,
		paddingTop: 12,
		fontFamily: 'lexend-400',
		fontSize: 18,
		textAlign: 'center',
		color: colors.dark.text,
	},
	moveControls: {
		flexDirection: 'row',
		gap: 8,
		padding: 8,
	},
	moveButton: {
		flexDirection: 'row',
		flex: 1,
		minHeight: 44,
	},
	viewport: {
		flex: 1,
	},
	grid: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 8,
		padding: 12,
	},
	card: {
		width: '30%',
		alignItems: 'center',
		flexGrow: 1,
		maxWidth: 140,
		borderWidth: 2,
		borderColor: colors.light.goldenBorder,
		borderRadius: 8,
		backgroundColor: colors.light.secondary,
	},
	lockedCard: {
		borderColor: colors.dark.success,
		backgroundColor: colors.light.success,
	},
	claim: {
		marginTop: 2,
		paddingBottom: 8,
	},
	selectedCard: {
		borderColor: colors.dark.primary,
	},
	dropTarget: {
		backgroundColor: colors.light.primary,
		borderColor: colors.gems.third,
	},
	draggedCard: {
		zIndex: 10,
		elevation: 8,
		opacity: 0.9,
	},
	cardTextArea: {
		flex: 1,
		marginTop: 12,
		alignItems: 'center',
		justifyContent: 'center',
	},
	word: {
		fontFamily: 'lexend-400',
		fontSize: 14,
		color: colors.dark.text,
		textAlign: 'center',
	},
	dragHandle: {
		width: 28,
		minHeight: 44,
		alignItems: 'center',
		justifyContent: 'center',
	},
	disabled: {
		opacity: 0.5,
	},
});

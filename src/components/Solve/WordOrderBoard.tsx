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
import type { SolveWordOrderCard } from './solveTypes';

/*
 * Typing
 */
interface WordOrderBoardProps {
	cards: SolveWordOrderCard[];
	positions: number[];
	disabled: boolean;
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

/*
 * Lets the player put a paragraph's French cards in order for Solve++.
 * Cards can move by dragging, tapping a new position, or using the move buttons.
 */
export default function WordOrderBoard({
	cards,
	positions,
	disabled,
	onReorder,
	onDraggingChange,
}: WordOrderBoardProps) {
	const [selectedCardId, setSelectedCardId] = useState<number | null>(null);
	const [draggedCardId, setDraggedCardId] = useState<number | null>(null);
	const [dropCardId, setDropCardId] = useState<number | null>(null);
	const [dragOffset] = useState(() => new Animated.ValueXY());
	const board = useRef<ElementRef<typeof View>>(null);
	const viewport = useRef<ElementRef<typeof View>>(null);
	const cardLayouts = useRef(new Map<number, WordOrderBounds>());
	const currentDrag = useRef<WordOrderDrag | null>(null);
	const cardsById = new Map(cards.map(card => [card.id, card]));
	const selectedIndex = selectedCardId === null ? -1 : positions.indexOf(selectedCardId);
	const isDragging = draggedCardId !== null;
	const controlsDisabled = disabled || isDragging;
	const moveEarlierDisabled = controlsDisabled || selectedIndex <= 0;
	const moveLaterDisabled =
		controlsDisabled || selectedIndex < 0 || selectedIndex === positions.length - 1;
	const movingStyle = {
		transform: dragOffset.getTranslateTransform(),
	};

	async function moveCard(cardId: number, toIndex: number) {
		const fromIndex = positions.indexOf(cardId);
		const card = cardsById.get(cardId);
		const nextPositions = moveWordOrderCard(positions, fromIndex, toIndex);

		if (
			disabled ||
			fromIndex === toIndex ||
			fromIndex < 0 ||
			toIndex < 0 ||
			toIndex >= positions.length
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

	function handleSelect(cardId: number) {
		const targetIndex = positions.indexOf(cardId);

		if (disabled || currentDrag.current) {
			return;
		}

		if (selectedCardId === null) {
			setSelectedCardId(cardId);
		} else if (selectedCardId === cardId) {
			setSelectedCardId(null);
		} else {
			moveCard(selectedCardId, targetIndex);
		}
	}

	function handleAccessibilityMove(cardId: number, event: AccessibilityActionEvent) {
		const cardIndex = positions.indexOf(cardId);
		const actionName = event.nativeEvent.actionName;

		if (controlsDisabled) {
			return;
		}

		setSelectedCardId(cardId);

		if (actionName === 'moveEarlier') {
			moveCard(cardId, cardIndex - 1);
		} else if (actionName === 'moveLater') {
			moveCard(cardId, cardIndex + 1);
		}
	}

	function handleMoveEarlier() {
		if (moveEarlierDisabled || selectedCardId === null) {
			return;
		}

		moveCard(selectedCardId, selectedIndex - 1);
	}

	function handleMoveLater() {
		if (moveLaterDisabled || selectedCardId === null) {
			return;
		}

		moveCard(selectedCardId, selectedIndex + 1);
	}

	function handleCardLayout(cardId: number, event: LayoutChangeEvent) {
		cardLayouts.current.set(cardId, event.nativeEvent.layout);
	}

	/*
	 * Starts dragging a card and records where the board sits on the screen.
	 * Measuring the visible area keeps drop positions correct after scrolling.
	 */
	function handleDragStart(cardId: number, event: GestureResponderEvent) {
		const drag: WordOrderDrag = {
			cardId,
			startX: event.nativeEvent.pageX,
			startY: event.nativeEvent.pageY,
			boardBounds: null,
			viewportBounds: null,
		};

		if (disabled) {
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

			if (layout) {
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

	function handleDragEnd(event: GestureResponderEvent) {
		const drag = currentDrag.current;
		const targetCardId = findDropCard(event);
		const targetIndex = targetCardId === null ? -1 : positions.indexOf(targetCardId);

		clearDrag();

		if (drag && targetIndex >= 0) {
			moveCard(drag.cardId, targetIndex);
		}
	}

	return (
		<View style={styles.container}>
			<Text style={styles.instructions}>
				Drag a handle, or tap a card and then its new position. Your card order is saved if you
				leave this view.
			</Text>
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
			<View
				ref={viewport}
				collapsable={false}
				style={styles.viewport}
			>
				<ScrollView scrollEnabled={!isDragging}>
					<View
						ref={board}
						collapsable={false}
						style={styles.grid}
					>
						{positions.map((cardId, index) => {
							const card = cardsById.get(cardId);
							const isSelected = selectedCardId === cardId;
							const isDragged = draggedCardId === cardId;
							const isDropTarget = dropCardId === cardId && !isDragged;

							if (!card) {
								return null;
							}

							return (
								<Animated.View
									key={cardId}
									onLayout={event => handleCardLayout(cardId, event)}
									style={[
										styles.card,
										isSelected && styles.selectedCard,
										isDropTarget && styles.dropTarget,
										isDragged && styles.draggedCard,
										isDragged && movingStyle,
									]}
								>
									<Pressable
										accessibilityRole="button"
										accessibilityLabel={`${card.text}. Position ${index + 1} of ${positions.length}.`}
										accessibilityHint="Select this card, then tap its new position. Actions can also move it earlier or later."
										accessibilityState={{
											selected: isSelected,
											disabled: controlsDisabled,
										}}
										accessibilityActions={[
											{
												name: 'moveEarlier',
												label: 'Move earlier',
											},
											{
												name: 'moveLater',
												label: 'Move later',
											},
										]}
										onAccessibilityAction={event => handleAccessibilityMove(cardId, event)}
										disabled={controlsDisabled}
										onPress={() => handleSelect(cardId)}
										style={styles.cardTextArea}
									>
										<Text style={styles.word}>{card.text}</Text>
									</Pressable>
									<View
										accessible={false}
										onStartShouldSetResponder={() => !disabled}
										onResponderGrant={event => handleDragStart(cardId, event)}
										onResponderMove={handleDragMove}
										onResponderRelease={handleDragEnd}
										onResponderTerminate={clearDrag}
										onResponderTerminationRequest={() => false}
										style={styles.dragHandle}
									>
										<MaterialSymbol
											name="drag_indicator"
											size={22}
											color={colors.dark.primary}
										/>
									</View>
								</Animated.View>
							);
						})}
					</View>
				</ScrollView>
			</View>
		</View>
	);
}

/*
 * Styles
 */
const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	instructions: {
		paddingHorizontal: 12,
		fontFamily: 'lexend-400',
		fontSize: 13,
		color: colors.dark.text,
	},
	moveControls: {
		flexDirection: 'row',
		gap: 8,
		padding: 12,
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

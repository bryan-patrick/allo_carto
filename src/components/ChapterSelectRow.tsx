import type { Chapter } from '@/data/french/storyAtlas';
import colors from '@/src/app/colors';
import { solidSurfaceShadow } from '@/src/components/surfaceStyles';
import { getUnlockCriteria, isItemUnlocked } from '@/src/util/atlasCompletion';
import { hasChapterContent } from '@/src/util/atlasContent';
import type { ProgressById } from '@/src/util/progression';
import { useNavigation, type NativeStackNavigationProp } from 'expo-router';
import type { ParamListBase } from 'expo-router/react-navigation';
import { useEffect, useLayoutEffect, useState, type ReactNode } from 'react';
import { Animated, Easing, StyleSheet, Text, View, type LayoutRectangle } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';
import ChapterPolaroid from './ChapterPolaroid';
import CollectionGems from './CollectionGems';
import LinkButton from './LinkButton';
import LockedSection from './LockedSection';

/**
 * Consts
 */
const defaultCharacterImage = require('@/src/app/assets/images/chapters/what-is-allo-carto.png');
const photoGrainOverlay = require('@/src/app/assets/images/chapter-images/photo-grain-overlay.png');
export const chapterMapDotSize = 20;

/**
 * Typing
 */
export interface ChapterMapAnchor {
	id: string;
	x: number;
	y: number;
	side: 'left' | 'right';
}

interface ChapterSelectRowProps {
	chapter: Chapter;
	buttonColor: string;
	index: number;
	progressById: ProgressById;
	onMapAnchorChange: (anchor: ChapterMapAnchor) => void;
}

/**
 * Show each chapter's illustration and details on opposite sides
 * Locked chapters show the usual lock and chapter label.
 */
export default function ChapterSelectRow({
	chapter,
	buttonColor,
	index,
	progressById,
	onMapAnchorChange,
}: ChapterSelectRowProps) {
	/**
	 * Navigation and motion preference
	 */
	const rootNavigation = useNavigation<NativeStackNavigationProp<ParamListBase>>('/');
	const reducedMotion = useReducedMotion();

	/**
	 * Photo animation and measured layout
	 */
	const [polaroidRotation] = useState(function createPolaroidRotation() {
		return new Animated.Value(0);
	});
	const [rowLayout, setRowLayout] = useState<LayoutRectangle | null>(null);
	const [columnLayout, setColumnLayout] = useState<LayoutRectangle | null>(null);
	const [anchorLayout, setAnchorLayout] = useState<LayoutRectangle | null>(null);

	/**
	 * Chapter progress and display values
	 */
	const isReversed = index % 2 === 1;
	const hasParagraphs = hasChapterContent(chapter);
	const isLocked = !isItemUnlocked({
		id: chapter.id,
		progressById,
	});
	const unlockCriteria = getUnlockCriteria(chapter, progressById);
	const hasStartedChapter = chapter.paragraphs.some(deck =>
		Boolean(progressById[deck.id]?.hasStartedFlashcards),
	);
	const chapterProgress = progressById[chapter.id];
	const completedParagraphCount = chapterProgress?.completedParagraphCount ?? 0;
	const paragraphCount = chapterProgress?.paragraphCount ?? 0;
	const isNew = !isLocked && !hasStartedChapter && hasParagraphs;
	const lockedLabelStyle = {
		color: buttonColor,
	};
	const frontPolaroidStyle = {
		transform: [
			{
				perspective: 1000,
			},
			{
				rotateY: polaroidRotation.interpolate({
					inputRange: [-20, 0],
					outputRange: ['-20deg', '0deg'],
				}),
			},
		],
	};
	let actionLabel = hasStartedChapter ? 'Continue' : 'Start Chapter';
	let newBadge: ReactNode = null;

	if (chapterProgress?.hasFirstGem) {
		actionLabel = 'Continue';
	}

	if (isNew) {
		newBadge = (
			<View style={styles.newBadge}>
				<Text style={styles.newLabel}>New</Text>
			</View>
		);
	}

	/**
	 * Turn the photo back as the map slides into view
	 */
	useLayoutEffect(() => {
		const removeTransitionListener = rootNavigation.addListener('transitionStart', event => {
			let animationDuration = 300;

			if (event.data.closing) {
				return;
			}

			if (reducedMotion) {
				animationDuration = 0;
			}

			Animated.timing(polaroidRotation, {
				toValue: 0,
				duration: animationDuration,
				easing: Easing.inOut(Easing.quad),
				useNativeDriver: true,
			}).start();
		});

		return () => {
			removeTransitionListener();
			polaroidRotation.stopAnimation();
		};
	}, [rootNavigation, polaroidRotation, reducedMotion]);

	function handleOpenChapter() {
		if (reducedMotion) {
			return;
		}

		Animated.timing(polaroidRotation, {
			toValue: -20,
			duration: 300,
			easing: Easing.inOut(Easing.quad),
			useNativeDriver: true,
		}).start();
	}

	/**
	 * Anchor the trail beside the illustration,
	 * or the lock when the chapter is locked.
	 */
	useEffect(() => {
		if (!rowLayout || !columnLayout || !anchorLayout) {
			return;
		}

		const anchorX = rowLayout.x + columnLayout.x + anchorLayout.x;
		const dotOffset = chapterMapDotSize / 2 + 8;

		onMapAnchorChange({
			id: chapter.id,
			x: isReversed ? anchorX - dotOffset : anchorX + anchorLayout.width + dotOffset,
			y: rowLayout.y + columnLayout.y + anchorLayout.y + anchorLayout.height / 2,
			side: isReversed ? 'right' : 'left',
		});
	}, [chapter.id, isReversed, rowLayout, columnLayout, anchorLayout, onMapAnchorChange]);

	return (
		<View
			onLayout={event => setRowLayout(event.nativeEvent.layout)}
			style={[styles.row, isReversed && styles.reversedRow]}
		>
			<View
				onLayout={event => setColumnLayout(event.nativeEvent.layout)}
				style={styles.chapterColumn}
			>
				{!isLocked && (
					<View
						onLayout={event => setAnchorLayout(event.nativeEvent.layout)}
						style={[styles.characterFrame]}
					>
						<ChapterPolaroid
							source={chapter.characterImage ?? defaultCharacterImage}
							photoNoiseSource={photoGrainOverlay}
							photoNoiseOpacity={0.2}
							style={styles.polaroid}
							frontStyle={frontPolaroidStyle}
							badge={newBadge}
							footer={
								<View style={styles.polaroidMetadata}>
									<Text style={[styles.label, styles.polaroidLabel]}>{chapter.label}</Text>
									{hasParagraphs && (
										<CollectionGems
											title={chapter.name}
											progress={chapterProgress}
											size={16}
										/>
									)}
								</View>
							}
						/>
					</View>
				)}
				<View
					onLayout={isLocked ? event => setAnchorLayout(event.nativeEvent.layout) : undefined}
					style={styles.chapterInfo}
				>
					{isLocked && <Text style={[styles.label, lockedLabelStyle]}>{chapter.label}</Text>}
					{!isLocked && (
						<>
							<Text
								accessibilityRole="header"
								style={styles.title}
							>
								{chapter.name}
							</Text>
							{hasParagraphs && (
								<Text style={styles.progress}>
									{completedParagraphCount} of {paragraphCount} paragraphs solved
								</Text>
							)}
						</>
					)}
					{isLocked && (
						<LockedSection
							circular
							color={buttonColor}
							circleBackgroundColor="transparent"
							unlockCriteria={unlockCriteria}
							style={styles.locked}
						/>
					)}
					{!isLocked && hasParagraphs && (
						<LinkButton
							accessibilityLabel={`${actionLabel}: ${chapter.name}`}
							screen="/(routes)/ChapterDetail"
							params={{
								chapterId: chapter.id,
							}}
							handler={handleOpenChapter}
							contentPaddingVertical={6}
							contentPaddingHorizontal={6}
							color={buttonColor}
							arrowColor={colors.light.text}
							style={styles.actionButton}
						>
							<Text style={styles.actionText}>{actionLabel}</Text>
						</LinkButton>
					)}
				</View>
			</View>
			<View style={styles.pathColumn} />
		</View>
	);
}

/**
 * Styles
 */
const styles = StyleSheet.create({
	row: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingVertical: 16,
		minHeight: 250,
	},
	reversedRow: {
		flexDirection: 'row-reverse',
	},
	chapterColumn: {
		width: '58%',
		paddingHorizontal: 12,
		marginHorizontal: 12,
	},
	pathColumn: {
		width: '42%',
	},
	locked: {
		marginTop: 8,
	},
	characterFrame: {
		alignItems: 'center',
		width: '100%',
		marginBottom: 12,
	},
	polaroid: {
		maxWidth: 225,
	},
	chapterInfo: {
		alignItems: 'center',
	},
	label: {
		fontFamily: 'lexend-600',
		fontSize: 12,
		textTransform: 'uppercase',
		color: colors.dark.text,
	},
	polaroidLabel: {
		fontFamily: 'shadows-400',
		fontSize: 18,
		textTransform: 'none',
	},
	newBadge: {
		...solidSurfaceShadow,
		backgroundColor: colors.dark.success,
		borderRadius: 4,
		paddingHorizontal: 12,
		paddingVertical: 4,
	},
	newLabel: {
		fontFamily: 'lexend-600',
		fontSize: 11,
		color: colors.light.text,
	},
	title: {
		fontFamily: 'lexend-600',
		fontSize: 18,
		textAlign: 'center',
		marginBottom: 4,
		color: colors.dark.text,
	},
	polaroidMetadata: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		justifyContent: 'space-between',
		alignItems: 'center',
		gap: 8,
	},
	progress: {
		fontFamily: 'lexend-400',
		fontSize: 13,
		lineHeight: 16,
		textAlign: 'center',
		color: colors.dark.text,
		marginBottom: 12,
	},
	actionButton: {
		paddingVertical: 0,
	},
	actionText: {
		color: colors.light.text,
	},
});

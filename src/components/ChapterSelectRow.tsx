import type { DeckChapter } from '@/data/french/storyAtlas';
import colors from '@/src/app/colors';
import { getUnlockCriteria, isItemUnlocked } from '@/src/util/atlasCompletion';
import type { ProgressById } from '@/src/util/progression';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, type LayoutRectangle } from 'react-native';
import ChapterPolaroid from './ChapterPolaroid';
import CollectionGems from './CollectionGems';
import LinkButton from './LinkButton';
import LockedSection from './LockedSection';

const defaultCharacterImage = require('@/src/app/assets/images/chapters/what-is-allo-carto.png');
const photoGrainOverlay = require('@/src/app/assets/images/chapter-images/photo-grain-overlay.png');
export const chapterMapDotSize = 20;

export interface ChapterMapAnchor {
	id: string;
	x: number;
	y: number;
	side: 'left' | 'right';
}

/*
 * Typing
 */
interface ChapterSelectRowProps {
	chapter: DeckChapter;
	buttonColor: string;
	index: number;
	progressById: ProgressById;
	onMapAnchorChange: (anchor: ChapterMapAnchor) => void;
}

/*
 * We alternate the chapter illustration and info between sides,
 * leaving the smaller column open for the map trail.
 */
export default function ChapterSelectRow({
	chapter,
	buttonColor,
	index,
	progressById,
	onMapAnchorChange,
}: ChapterSelectRowProps) {
	const [rowLayout, setRowLayout] = useState<LayoutRectangle | null>(null);
	const [columnLayout, setColumnLayout] = useState<LayoutRectangle | null>(null);
	const [anchorLayout, setAnchorLayout] = useState<LayoutRectangle | null>(null);
	const isReversed = index % 2 === 1;
	const isLocked = !isItemUnlocked({
		id: chapter.id,
		progressById,
	});
	const unlockCriteria = getUnlockCriteria(chapter, progressById);
	const hasStartedChapter = chapter.decks.some(deck =>
		Boolean(progressById[deck.id]?.hasStartedFlashcards),
	);
	const hasParagraphs = chapter.decks.length > 0;
	const chapterProgress = progressById[chapter.id];
	const completedParagraphCount = chapterProgress?.completedParagraphCount ?? 0;
	const paragraphCount = chapterProgress?.paragraphCount ?? 0;
	const isNew = !isLocked && !hasStartedChapter && hasParagraphs;
	let actionLabel = hasStartedChapter ? 'Continue' : 'Start Chapter';

	if (chapterProgress?.hasFirstGem) {
		actionLabel = 'Continue';
	}

	// We anchor the trail beside the illustration, or the lock when the chapter is locked.
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
							badge={isNew ? <Text style={styles.newLabel}>New</Text> : undefined}
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
					{isLocked && <Text style={[styles.label, styles.lockedLabel]}>{chapter.label}</Text>}
					{!isLocked && (
						<>
							<Text
								accessibilityRole="header"
								style={styles.title}
							>
								{chapter.name}
							</Text>
							<Text style={styles.progress}>
								{completedParagraphCount} of {paragraphCount} paragraphs solved
							</Text>
						</>
					)}
					{isLocked && (
						<LockedSection
							circular
							color={colors.light.goldenBorder}
							unlockCriteria={unlockCriteria}
							style={styles.locked}
						/>
					)}
					{!isLocked && hasParagraphs && (
						<LinkButton
							accessibilityLabel={`${actionLabel}: ${chapter.name}`}
							screen="/(routes)/ChapterDetail"
							params={{ chapterId: chapter.id }}
							contentPaddingVertical={6}
							contentPaddingHorizontal={6}
							color={buttonColor}
							arrowColor={colors.light.text}
							style={styles.actionButton}
						>
							<Text style={styles.actionText}>{actionLabel}</Text>
						</LinkButton>
					)}
					{!isLocked && !hasParagraphs && <Text style={styles.level}>Coming soon</Text>}
				</View>
			</View>
			<View style={styles.pathColumn} />
		</View>
	);
}

/*
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
		width: '55%',
		paddingHorizontal: 12,
		marginHorizontal: 12,
	},
	pathColumn: {
		width: '45%',
	},
	locked: {
		marginTop: 8,
	},
	characterFrame: {
		alignItems: 'center',
		width: '100%',
		marginBottom: 16,
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
	lockedLabel: {
		color: colors.light.goldenBorder,
	},
	newLabel: {
		fontFamily: 'lexend-600',
		fontSize: 10,
		color: colors.light.text,
		backgroundColor: colors.dark.success,
		borderWidth: 1,
		borderColor: colors.light.success,
		borderRadius: 4,
		paddingHorizontal: 8,
		paddingVertical: 3,
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
		marginBottom: 16,
	},
	level: {
		fontFamily: 'lexend-400',
		fontSize: 12,
		textAlign: 'center',
		color: colors.light.background,
	},
	actionButton: {
		paddingVertical: 0,
	},
	actionText: {
		color: colors.light.text,
	},
});

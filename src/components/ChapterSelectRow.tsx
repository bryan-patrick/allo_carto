import type { DeckChapter, DeckStory } from '@/data/french/storyAtlas';
import colors from '@/src/app/colors';
import { getUnlockCriteria, isItemUnlocked } from '@/src/util/atlasCompletion';
import type { ProgressById } from '@/src/util/progression';
import { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, View, type LayoutRectangle } from 'react-native';
import CollectionGems from './CollectionGems';
import LinkButton from './LinkButton';
import LockedSection from './LockedSection';

const defaultCharacterImage = require('@/src/app/assets/images/chapters/what-is-allo-carto.png');
export const chapterMapDotSize = 20;

export interface ChapterMapAnchor {
	id: string;
	x: number;
	y: number;
	side: 'left' | 'right';
}

/**
 * Typing
 */
interface ChapterSelectRowProps {
	chapter: DeckChapter;
	story: DeckStory;
	index: number;
	progressById: ProgressById;
	userLevel: number;
	onMapAnchorChange: (anchor: ChapterMapAnchor) => void;
}

/**
 * We alternate the chapter illustration and info between sides,
 * leaving the smaller column open for the map trail.
 */
export default function ChapterSelectRow({
	chapter,
	story,
	index,
	progressById,
	userLevel,
	onMapAnchorChange,
}: ChapterSelectRowProps) {
	const [rowLayout, setRowLayout] = useState<LayoutRectangle | null>(null);
	const [columnLayout, setColumnLayout] = useState<LayoutRectangle | null>(null);
	const [anchorLayout, setAnchorLayout] = useState<LayoutRectangle | null>(null);
	const isReversed = index % 2 === 1;
	const chapterColor = colors.light.goldenBorder;
	const isLocked = !isItemUnlocked({ id: chapter.id, progressById, userLevel });
	const unlockCriteria = getUnlockCriteria(chapter, progressById, userLevel);
	const hasStartedChapter = chapter.decks.some(deck =>
		Boolean(progressById[deck.id]?.hasStartedFlashcards),
	);
	const hasParagraphs = chapter.decks.length > 0;
	const chapterProgress = progressById[chapter.id];
	const chapterWordCount =
		chapterProgress?.wordCount ?? new Set(chapter.decks.flatMap(deck => deck.wordIds)).size;
	const actionLabel = hasStartedChapter ? 'Continue' : 'Start Chapter';
	const isNew = !isLocked && !hasStartedChapter && hasParagraphs;

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
						<Image
							accessible={false}
							source={chapter.characterImage ?? defaultCharacterImage}
							resizeMode="contain"
							style={styles.characterImage}
						/>
					</View>
				)}
				<View
					onLayout={isLocked ? event => setAnchorLayout(event.nativeEvent.layout) : undefined}
					style={styles.chapterInfo}
				>
					<View style={styles.labelRow}>
						<Text style={[styles.label, { color: chapterColor }]}>{chapter.label}</Text>
						{hasParagraphs && !isLocked && (
							<View style={styles.metadataRow}>
								<CollectionGems
									title={chapter.name}
									progress={chapterProgress}
									size={16}
								/>
							</View>
						)}
						{isNew && <Text style={[styles.newLabel, { backgroundColor: chapterColor }]}>New</Text>}
					</View>
					{!isLocked && (
						<>
							<Text
								accessibilityRole="header"
								style={styles.title}
							>
								{chapter.name}
							</Text>
						</>
					)}
					{isLocked && (
						<LockedSection
							circular
							itemId={chapter.id}
							color={chapterColor}
							unlockCriteria={unlockCriteria}
							style={styles.locked}
						/>
					)}
					{!isLocked && hasParagraphs && (
						<LinkButton
							accessibilityLabel={`${actionLabel}: ${chapter.name}`}
							screen="/(routes)/ChapterDetail"
							params={{ chapterId: chapter.id }}
							color={chapterColor}
							arrowColor={colors.dark.text}
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

/**
 * Styles
 */
const styles = StyleSheet.create({
	row: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingVertical: 8,
		minHeight: 250,
	},
	reversedRow: {
		flexDirection: 'row-reverse',
	},
	chapterColumn: {
		width: '60%',
		paddingHorizontal: 4,
		marginHorizontal: 16,
	},
	pathColumn: {
		width: '30%',
	},
	locked: {
		marginTop: 8,
	},
	characterFrame: {
		width: '100%',
		aspectRatio: 1.5,
		marginBottom: 4,
		elevation: 4,
		shadowColor: '#000000',
		shadowOffset: { width: 0, height: 0 },
		shadowRadius: 4,
		shadowOpacity: 1,
	},
	characterImage: {
		width: '100%',
		height: '100%',
	},
	chapterInfo: {
		alignItems: 'center',
	},
	labelRow: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 12,
	},
	label: {
		fontFamily: 'lexend-600',
		fontSize: 14,
		textTransform: 'uppercase',
	},
	newLabel: {
		fontFamily: 'lexend-600',
		fontSize: 10,
		color: colors.dark.text,
		borderRadius: 4,
		paddingHorizontal: 5,
		paddingVertical: 2,
	},
	title: {
		fontFamily: 'lexend-600',
		fontSize: 20,
		textAlign: 'center',
		marginBottom: 8,
		color: colors.light.secondary,
	},
	metadataRow: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		justifyContent: 'center',
		alignItems: 'center',
		gap: 8,
	},
	level: {
		fontFamily: 'lexend-400',
		fontSize: 12,
		textAlign: 'center',
		color: colors.light.background,
	},
	actionButton: {
		width: '100%',
		maxWidth: 200,
		borderColor: colors.dark.border,
		shadowColor: colors.light.goldenBorder,
	},
	actionText: {
		color: colors.dark.text,
	},
});

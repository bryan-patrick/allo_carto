import type { DeckChapter, DeckStory } from '@/data/french/storyAtlas';
import colors from '@/src/app/colors';
import { getUnlockCriteria, isItemUnlocked } from '@/src/util/atlasCompletion';
import type { ProgressById } from '@/src/util/progression';
import { Image, StyleSheet, Text, View } from 'react-native';
import CollectionGems from './CollectionGems';
import LinkButton from './LinkButton';
import LockedSection from './LockedSection';

const defaultCharacterImage = require('@/src/app/assets/images/chapters/what-is-allo-carto.png');
const defaultSupportingImage = require('@/src/app/assets/images/chapters/how-it-works-dep.png');

/**
 * Typing
 */
interface ChapterSelectRowProps {
	chapter: DeckChapter;
	story: DeckStory;
	index: number;
	progressById: ProgressById;
	userLevel: number;
}

/**
 * Component chapter select row. Rows are staggered with
 * the chapter illustration on one side along with its info,
 * and a supporting image on the other.
 */
export default function ChapterSelectRow({
	chapter,
	story,
	index,
	progressById,
	userLevel,
}: ChapterSelectRowProps) {
	const isLocked = !isItemUnlocked({ id: chapter.id, progressById, userLevel });
	const unlockCriteria = getUnlockCriteria(chapter, progressById, userLevel);
	const hasStartedChapter = chapter.decks.some(deck =>
		Boolean(progressById[deck.id]?.hasStartedFlashcards),
	);
	const hasParagraphs = chapter.decks.length > 0;
	const requiredLevel = Math.max(story.requiredLevel, chapter.requiredLevel ?? 1);
	const actionLabel = hasStartedChapter ? 'Continue Chapter' : 'Start Chapter';
	const isNew = !isLocked && !hasStartedChapter && hasParagraphs;

	return (
		<View style={[styles.row, index % 2 === 1 && styles.reversedRow]}>
			<View style={styles.column}>
				<View style={[styles.characterFrame, isLocked && styles.lockedArtwork]}>
					<Image
						accessible={false}
						source={chapter.characterImage ?? defaultCharacterImage}
						resizeMode="cover"
						style={styles.characterImage}
					/>
				</View>
				<View style={styles.chapterInfo}>
					<View style={styles.labelRow}>
						<Text style={styles.label}>{chapter.label}</Text>
						{isNew && <Text style={styles.newLabel}>New</Text>}
					</View>
					<Text
						accessibilityRole="header"
						style={styles.title}
					>
						{chapter.name}
					</Text>
					<View style={styles.metadataRow}>
						<Text style={styles.level}>Lvl. {requiredLevel}</Text>
						{hasParagraphs && (
							<CollectionGems
								title={chapter.name}
								progress={progressById[chapter.id]}
								size={16}
							/>
						)}
					</View>
					{isLocked && (
						<LockedSection
							compact
							itemId={chapter.id}
							color={colors.light.goldenBorder}
							unlockCriteria={unlockCriteria}
						/>
					)}
					{!isLocked && hasParagraphs && (
						<LinkButton
							accessibilityLabel={`${actionLabel}: ${chapter.name}`}
							screen="/(routes)/ChapterDetail"
							params={{ chapterId: chapter.id }}
							color={colors.light.goldenBorder}
							arrowColor={colors.dark.text}
							arrowSize={14}
							contentPaddingHorizontal={4}
							contentPaddingVertical={10}
							showInnerBorder={false}
							showShadow={false}
							style={styles.actionButton}
						>
							<Text style={styles.actionText}>{actionLabel}</Text>
						</LinkButton>
					)}
					{!isLocked && !hasParagraphs && <Text style={styles.level}>Coming soon</Text>}
				</View>
			</View>
			<View style={styles.column}>
				<View style={[styles.supportingFrame, isLocked && styles.lockedArtwork]}>
					<Image
						accessible={false}
						source={chapter.image ?? defaultSupportingImage}
						resizeMode="cover"
						style={styles.supportingImage}
					/>
				</View>
			</View>
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
	},
	reversedRow: {
		flexDirection: 'row-reverse',
	},
	column: {
		width: '50%',
		paddingHorizontal: 8,
	},
	characterFrame: {
		width: '100%',
		aspectRatio: 1.3,
		borderRadius: 12,
		overflow: 'hidden',
		marginBottom: 12,
	},
	characterImage: {
		width: '100%',
		height: '100%',
	},
	chapterInfo: {
		alignItems: 'center',
		gap: 8,
	},
	labelRow: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 6,
	},
	label: {
		fontFamily: 'lexend-600',
		fontSize: 11,
		textTransform: 'uppercase',
		color: colors.light.goldenBorder,
	},
	newLabel: {
		fontFamily: 'lexend-600',
		fontSize: 10,
		color: colors.dark.text,
		backgroundColor: colors.light.goldenBorder,
		borderRadius: 4,
		paddingHorizontal: 5,
		paddingVertical: 2,
	},
	title: {
		fontFamily: 'lexend-600',
		fontSize: 18,
		textAlign: 'center',
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
		borderColor: colors.light.goldenBorder,
	},
	actionText: {
		fontSize: 12,
		color: colors.dark.text,
	},
	supportingFrame: {
		width: '100%',
		aspectRatio: 0.75,
		borderRadius: 12,
		overflow: 'hidden',
	},
	supportingImage: {
		width: '100%',
		height: '100%',
	},
	lockedArtwork: {
		opacity: 0.5,
	},
});

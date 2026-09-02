import type { DeckChapter } from '@/data/french/deckAtlas';
import colors from '@/src/app/colors';
import { getUnlockCriteria } from '@/src/util/atlasCompletion';
import type { ProgressById } from '@/src/util/progression';
import { StyleSheet, Text, View } from 'react-native';
import Book from './Book';
import ChapterLockedSection from './ChapterLockedSection';
import ChapterMeta from './ChapterMeta';
import ChapterSelectButton from './ChapterSelectButton';
import Cover from './Cover';
import Crease from './Crease';
import Spine from './Spine';

/**
 * Typing
 */
interface ChapterProps {
	chapter: DeckChapter;
	index: number;
	isLocked: boolean;
	progressById: ProgressById;
	progressPercent: number;
}

/**
 * Chapter component
 */
export default function Chapter({
	chapter,
	progressById,
	progressPercent,
	index,
	isLocked,
}: ChapterProps) {
	/**
	 * Destructure chapter
	 */
	const { label, name, description, color, materialSymbolName } = chapter;

	/**
	 * Get the unlock criteria
	 */
	const unlockCriteria = getUnlockCriteria(chapter, progressById);

	/**
	 * Render the component
	 */
	return (
		<Book>
			<Spine
				color={color}
				index={index}
				materialSymbolName={materialSymbolName}
			/>
			<Crease />
			<Cover>
				<View style={[styles.chapterContainerInner, { padding: isLocked ? 6 : 12 }]}>
					{!isLocked && (
						<>
							<View style={styles.chapterTitleContainer}>
								<Text style={[styles.label, { color: chapter.color }]}>{label}</Text>
								<Text style={styles.chapterTitle}>{name}</Text>
								<View style={styles.separatorContainer}>
									<View style={[styles.separatorBox, { backgroundColor: chapter.color }]} />
									<View style={styles.separatorLine} />
								</View>
								<Text style={styles.chapterDescription}>{description}</Text>
							</View>
							<View style={styles.chapterImageContainer} />
							<ChapterMeta
								progressPercent={progressPercent}
								progressColor={color ?? '#000000'}
							/>
							<ChapterSelectButton
								chapter={chapter}
								disabled={isLocked}
								progressPercent={progressPercent}
							/>
						</>
					)}
					{isLocked && (
						<ChapterLockedSection
							color={chapter.color ?? '#000000'}
							unlockCriteria={unlockCriteria}
						/>
					)}
				</View>
			</Cover>
		</Book>
	);
}

/**
 * Styles
 */
const styles = StyleSheet.create({
	chapterContainerInner: {
		padding: 12,
		gap: 12,
	},
	chapterTitleContainer: {
		flexShrink: 1,
		wordWrap: 'wrap',
		gap: 4,
	},
	label: {
		color: colors.dark.text,
		fontFamily: 'lexend-600',
		textTransform: 'uppercase',
		fontSize: 12,
	},
	chapterTitle: {
		color: colors.dark.text,
		fontFamily: 'lexend-600',
		fontSize: 18,
	},
	separatorContainer: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
		marginVertical: 4,
		marginRight: 4,
	},
	separatorBox: {
		height: 6,
		width: 6,
		transform: 'rotate(45deg)',
	},
	separatorLine: {
		flex: 1,
		borderBottomWidth: 1,
		borderColor: colors.utility.cardBorder,
	},
	chapterDescription: {
		color: colors.dark.text,
		fontFamily: 'lexend-400',
		fontSize: 14,
	},
	chapterImageContainer: {
		display: 'flex',
		flexDirection: 'row',
	},
});

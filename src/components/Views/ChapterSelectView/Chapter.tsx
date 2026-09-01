import type { DeckChapter } from '@/data/french/deckAtlas';
import colors from '@/src/app/colors';
import { getUnlockCriteria } from '@/src/util/atlasCompletion';
import type { ProgressById } from '@/src/util/progression';
import { StyleSheet, Text, View } from 'react-native';
import Book from './Book';
import ChapterLockedButton from './ChapterLockedButton';
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
	const { label, name, color, materialSymbolName } = chapter;

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
				<View style={styles.chapterContainerInner}>
					{!isLocked && (
						<>
							<View style={styles.chapterTitleContainer}>
								<Text style={styles.label}>{label}</Text>
								<Text style={styles.chapterTitle}>{name}</Text>
							</View>
							<View style={styles.chapterImageContainer} />
							<ChapterMeta
								progressPercent={progressPercent}
								progressColor={color ?? '#000000'}
							/>
							<ChapterSelectButton
								chapter={chapter}
								disabled={isLocked}
							/>
						</>
					)}
					{isLocked && (
						<ChapterLockedButton
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
		display: 'flex',
		alignItems: 'center',
		flexDirection: 'column',
		justifyContent: 'center',
		padding: 12,
		gap: 12,
	},
	chapterTitleContainer: {
		flexShrink: 1,
		wordWrap: 'wrap',
	},
	label: {
		color: colors.dark.text,
		fontFamily: 'lexend-400',
		fontSize: 12,
		textAlign: 'center',
		textTransform: 'uppercase',
	},
	chapterTitle: {
		color: colors.dark.text,
		fontFamily: 'lexend-600',
		fontSize: 18,
		textAlign: 'center',
	},
	chapterImageContainer: {
		display: 'flex',
		flexDirection: 'row',
	},
});

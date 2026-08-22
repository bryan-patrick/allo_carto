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
	const { chapterName, name, color, materialIconName } = chapter;

	/**
	 * Get the unlock criteria
	 */
	const unlockCriteria = getUnlockCriteria(chapter, progressById);

	/**
	 * Destructure styles
	 */
	const {
		chapterContainerInnerStyle,
		chapterTitleContainerStyle,
		chapterNameStyle,
		chapterTitleStyle,
		chapterImageContainerStyle,
	} = styles;

	/**
	 * Render the component
	 */
	return (
		<Book>
			<Spine
				color={color}
				index={index}
				materialIconName={materialIconName}
			/>
			<Crease />
			<Cover>
				<View style={chapterContainerInnerStyle}>
					{!isLocked && (
						<>
							<View style={chapterTitleContainerStyle}>
								<Text style={chapterNameStyle}>{chapterName}</Text>
								<Text style={chapterTitleStyle}>{name}</Text>
							</View>
							<View style={[chapterImageContainerStyle]}></View>
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
	chapterContainerInnerStyle: {
		display: 'flex',
		alignItems: 'center',
		flexDirection: 'column',
		justifyContent: 'center',
		padding: 12,
		gap: 12,
	},
	chapterTitleContainerStyle: {
		flexShrink: 1,
		wordWrap: 'wrap',
	},
	chapterNameStyle: {
		color: colors.dark.text,
		fontFamily: 'lexend-400',
		fontSize: 12,
		textAlign: 'center',
		textTransform: 'uppercase',
	},
	chapterTitleStyle: {
		color: colors.dark.text,
		fontFamily: 'lexend-600',
		fontSize: 18,
		textAlign: 'center',
	},
	chapterImageContainerStyle: {
		display: 'flex',
		flexDirection: 'row',
	},
	chapterImageStyle: {
		height: 200,
		width: 260,
	},
});

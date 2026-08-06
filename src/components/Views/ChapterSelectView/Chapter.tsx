import type { DeckChapter } from '@/data/french/deckAtlas';
import colors from '@/src/app/colors';
import LockOverlay from '@/src/components/LockOverlay';
import { getUnlockCriteria } from '@/src/util/atlasProgression';
import { ImageBackground, StyleSheet, Text, View } from 'react-native';
import Book from './Book';
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
	progressPercent: number;
}

/**
 * Chapter component
 */
export default function Chapter({
	chapter,
	progressPercent,
	index,
	isLocked,
}: ChapterProps) {
	/**
	 * Destructure chapter
	 */
	const { chapterName, image, name, color, materialIconName } = chapter;

	/**
	 * Get the lock message
	 */
	const unlockCriteria = getUnlockCriteria(chapter);

	/**
	 * Destructure styles
	 */
	const {
		chapterContainerStyle,
		chapterContainerInnerStyle,
		chapterTitleContainerStyle,
		chapterNameStyle,
		chapterTitleStyle,
		chapterImageContainerStyle,
		chapterImageStyle,
	} = styles;

	/**
	 * Render the component
	 */
	return (
		<LockOverlay
			isLocked={isLocked}
			lockedAccessibilityHint={unlockCriteria}
			lockedAccessibilityLabel={`${name} chapter locked`}
			unlockCriteria={unlockCriteria}
		>
			<Book>
				<Spine
					color={color}
					index={index}
					materialIconName={materialIconName}
				/>
				<Crease />
				<Cover>
					<View style={chapterContainerStyle}>
						<View style={chapterContainerInnerStyle}>
							<View style={chapterTitleContainerStyle}>
								<Text style={chapterNameStyle}>{chapterName}</Text>
								<Text style={chapterTitleStyle}>{name}</Text>
							</View>
							{!isLocked && (
								<View style={[chapterImageContainerStyle]}>
									<ImageBackground
										source={image}
										style={chapterImageStyle}
									/>
								</View>
							)}
							<ChapterMeta
								progressPercent={progressPercent}
								progressColor={color ?? '#000000'}
							/>
							<ChapterSelectButton
								chapter={chapter}
								disabled={isLocked}
							/>
						</View>
					</View>
				</Cover>
			</Book>
		</LockOverlay>
	);
}

/**
 * Styles
 */
const styles = StyleSheet.create({
	chapterContainerStyle: {
		marginHorizontal: 8,
	},
	chapterContainerInnerStyle: {
		display: 'flex',
		alignItems: 'center',
		flexDirection: 'column',
		justifyContent: 'center',
		paddingHorizontal: 12,
		paddingVertical: 16,
		gap: 16,
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
		fontSize: 20,
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

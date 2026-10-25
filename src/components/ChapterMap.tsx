import type { DeckStory } from '@/data/french/storyAtlas';
import colors from '@/src/app/colors';
import { hasChapterContent } from '@/src/util/atlasContent';
import type { ProgressById } from '@/src/util/progression';
import { useCallback, useState } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import ChapterSelectRow, { chapterMapDotSize, type ChapterMapAnchor } from './ChapterSelectRow';

/**
 * Types
 */
interface ChapterMapProps {
	story: DeckStory;
	progressById: ProgressById;
	userLevel: number;
}

interface ChapterMapCurveProps {
	start: ChapterMapAnchor;
	end: ChapterMapAnchor;
	width: number;
}

/**
 * It looks crazy but we're really just using curves to line up to our chapters via SVG
 */
function getChapterMapCurve({ start, end, width }: ChapterMapCurveProps): string {
	const edgeInset = chapterMapDotSize;
	const bendX = start.side === 'left' ? width - edgeInset : edgeInset;

	return `M ${start.x} ${start.y} C ${bendX} ${start.y}, ${bendX} ${end.y}, ${end.x} ${end.y}`;
}

/**
 * This draws the map trail
 */
export default function ChapterMap({ story, progressById, userLevel }: ChapterMapProps) {
	const [size, setSize] = useState({ width: 0, height: 0 });
	const [anchors, setAnchors] = useState<Record<string, ChapterMapAnchor>>({});
	const chapters = story.chapters.filter(hasChapterContent);

	const handleAnchorChange = useCallback((anchor: ChapterMapAnchor) => {
		setAnchors(current => {
			const previous = current[anchor.id];

			if (previous?.x === anchor.x && previous.y === anchor.y && previous.side === anchor.side) {
				return current;
			}

			return { ...current, [anchor.id]: anchor };
		});
	}, []);

	function handleLayout(event: LayoutChangeEvent) {
		const { width, height } = event.nativeEvent.layout;

		setSize(current => {
			if (current.width === width && current.height === height) {
				return current;
			}

			return { width, height };
		});
	}

	/**
	 * Render it
	 */
	return (
		<View
			onLayout={handleLayout}
			style={styles.map}
		>
			{size.width > 0 && size.height > 0 && (
				<Svg
					accessible={false}
					accessibilityElementsHidden
					importantForAccessibility="no-hide-descendants"
					pointerEvents="none"
					width={size.width}
					height={size.height}
					style={StyleSheet.absoluteFill}
				>
					{chapters.map((chapter, index) => {
						const nextChapter = chapters[index + 1];
						const start = anchors[chapter.id];
						const end = nextChapter ? anchors[nextChapter.id] : undefined;

						if (!start || !end) {
							return null;
						}

						return (
							<Path
								key={chapter.id}
								d={getChapterMapCurve({ start, end, width: size.width })}
								fill="none"
								stroke={colors.light.goldenBorder}
								strokeWidth={2}
								strokeDasharray="1 8"
								strokeLinecap="round"
								opacity={0.5}
							/>
						);
					})}
					{chapters.map(chapter => {
						const anchor = anchors[chapter.id];

						if (!anchor) {
							return null;
						}

						return (
							<Circle
								key={chapter.id}
								cx={anchor.x}
								cy={anchor.y}
								r={chapterMapDotSize / 2}
								fill={colors.light.goldenBorder}
								opacity={0.75}
							/>
						);
					})}
				</Svg>
			)}
			{story.chapters.map((chapter, index) => {
				if (!hasChapterContent(chapter)) {
					return null;
				}

				return (
					<ChapterSelectRow
						key={chapter.id}
						chapter={chapter}
						story={story}
						index={index}
						progressById={progressById}
						userLevel={userLevel}
						onMapAnchorChange={handleAnchorChange}
					/>
				);
			})}
		</View>
	);
}

/**
 * Styles
 */
const styles = StyleSheet.create({
	map: {
		gap: 8,
	},
});

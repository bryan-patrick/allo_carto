import colors from '@/src/app/colors';
import BackgroundImage from '@/src/components/BackgroundImage';
import ChapterParagraphList from '@/src/components/ChapterParagraphList';
import ChapterSelectHeader from '@/src/components/ChapterSelectHeader';
import CollectionGems from '@/src/components/CollectionGems';
import Loader from '@/src/components/Loader';
import ReadingLink from '@/src/components/ReadingLink';
import { useUserContext } from '@/src/db/useUserContext';
import { useUserProgress } from '@/src/db/useUserProgress';
import { findAtlasLocationByChapterId, isItemUnlocked } from '@/src/util/atlasCompletion';
import { hasChapterContent, hasParagraphContent } from '@/src/util/atlasContent';
import { getCompletedSolveStages, solveStages } from '@/src/util/solveProgression';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { useIsFocused, usePreventRemove } from 'expo-router/react-navigation';
import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const headingBackground = require('@/src/app/assets/images/postcard-parts/background-old.jpg');

interface ChapterDetailParams extends Record<string, string | string[] | undefined> {
	chapterId?: string;
}

interface ChapterUnlockProgress {
	chapterId: string;
	userId: string;
	unlockedParagraphIds: string[];
}

/**
 * Shows a fixed chapter heading above its paragraph postcard carousel.
 */
export default function ChapterDetailView() {
	/**
	 * Chapter progress and screen edges
	 */
	const { chapterId } = useLocalSearchParams<ChapterDetailParams>();
	const navigation = useNavigation();
	const isFocused = useIsFocused();
	const { id: userId = '' } = useUserContext() ?? {};
	const { progressById, status } = useUserProgress();
	const safeAreaInsets = useSafeAreaInsets();
	const location = findAtlasLocationByChapterId(chapterId);

	/**
	 * Newly unlocked paragraph
	 */
	const previousUnlockProgress = useRef<ChapterUnlockProgress | undefined>(undefined);
	const [paragraphToRevealId, setParagraphToRevealId] = useState<string>();
	const isUnlockRevealActive = isFocused && Boolean(paragraphToRevealId);
	let visibleRevealParagraphId: string | undefined;
	let chapterPointerEvents: 'auto' | 'none' = 'auto';
	let chapterAccessibility: 'auto' | 'no-hide-descendants' = 'auto';

	/**
	 * Chapter progress totals
	 */
	const chapterProgress = progressById[location?.chapter.id ?? ''];
	const chapterParagraphs = location?.chapter.paragraphs.filter(hasParagraphContent) ?? [];
	const puzzlesPerParagraph = Object.keys(solveStages).length;
	const puzzleCount = chapterParagraphs.length * puzzlesPerParagraph;
	let solvedPuzzleCount = 0;

	/**
	 * Space around the chapter content
	 */
	const chapterContentStyle = {
		paddingBottom: Math.max(safeAreaInsets.bottom, 12),
	};

	if (isUnlockRevealActive) {
		visibleRevealParagraphId = paragraphToRevealId;
		chapterPointerEvents = 'none';
		chapterAccessibility = 'no-hide-descendants';
	}

	for (const paragraph of chapterParagraphs) {
		solvedPuzzleCount += getCompletedSolveStages(progressById[paragraph.id]);
	}

	/**
	 * Queues up a reveal animation when another paragraph unlocks.
	 */
	useLayoutEffect(() => {
		const chapter = location?.chapter;
		const previousProgress = previousUnlockProgress.current;
		const unlockedParagraphIds: string[] = [];
		let nextParagraphToRevealId: string | undefined;

		if (status !== 'ready' || !chapter || !userId) {
			return;
		}

		for (const paragraph of chapter.paragraphs.filter(hasParagraphContent)) {
			if (
				isItemUnlocked({
					id: paragraph.id,
					progressById,
				})
			) {
				unlockedParagraphIds.push(paragraph.id);
			}
		}

		previousUnlockProgress.current = {
			chapterId: chapter.id,
			userId,
			unlockedParagraphIds,
		};

		if (
			!previousProgress ||
			previousProgress.chapterId !== chapter.id ||
			previousProgress.userId !== userId
		) {
			setParagraphToRevealId(undefined);
			return;
		}

		for (const paragraphId of unlockedParagraphIds.slice(1)) {
			if (!previousProgress.unlockedParagraphIds.includes(paragraphId)) {
				nextParagraphToRevealId = paragraphId;
			}
		}

		if (nextParagraphToRevealId) {
			setParagraphToRevealId(nextParagraphToRevealId);
		} else if (paragraphToRevealId && !unlockedParagraphIds.includes(paragraphToRevealId)) {
			setParagraphToRevealId(undefined);
		}
	}, [location?.chapter, paragraphToRevealId, progressById, status, userId]);

	/**
	 * Restores the chapter's buttons after its new postcard finishes moving.
	 */
	const handleUnlockRevealComplete = useCallback(
		(paragraphId: string) => {
			setParagraphToRevealId(currentParagraphId => {
				if (currentParagraphId === paragraphId) {
					return undefined;
				}

				return currentParagraphId;
			});
		},
		[setParagraphToRevealId],
	);

	/**
	 * Keeps the header and back gesture unavailable during the postcard reveal.
	 */
	useLayoutEffect(() => {
		navigation.setOptions({
			gestureEnabled: !isUnlockRevealActive,
			header: () => (
				<ChapterSelectHeader
					showBackButton
					disabled={isUnlockRevealActive}
				/>
			),
		});
	}, [isUnlockRevealActive, navigation]);

	usePreventRemove(isUnlockRevealActive);

	if (status === 'loading') {
		return <Loader />;
	}

	if (status === 'error') {
		return <Text>Could not load chapter progress.</Text>;
	}

	if (!location || !hasChapterContent(location.chapter)) {
		return (
			<View style={[styles.background, chapterContentStyle]}>
				<Text style={styles.chapterTitle}>Unknown chapter</Text>
				<Text style={styles.message}>Please go back and select a chapter.</Text>
			</View>
		);
	}

	const { chapter, story } = location;
	const chapterNameStyle = {
		color: colors.category[story.category],
	};

	return (
		<View
			style={styles.background}
			pointerEvents={chapterPointerEvents}
			accessibilityElementsHidden={isUnlockRevealActive}
			importantForAccessibility={chapterAccessibility}
		>
			<View
				key={chapter.id}
				style={[styles.chapterContent, chapterContentStyle]}
			>
				<BackgroundImage
					source={headingBackground}
					resizeMode="cover"
					style={styles.chapterHeading}
				>
					<View style={styles.chapterSummary}>
						<Text style={styles.chapterTitle}>{chapter.label}</Text>
						<Text
							accessibilityRole="header"
							style={[styles.chapterName, chapterNameStyle]}
						>
							{chapter.name}
						</Text>
						<View style={styles.chapterSummaryRow}>
							<ReadingLink
								item={chapter}
								color={colors.category[story.category]}
								label="Read chapter"
								style={styles.readChapterLink}
							/>
						</View>
						<View style={styles.absgems}>
							<CollectionGems
								title={chapter.name}
								progress={chapterProgress}
								size={20}
							/>
						</View>
					</View>
				</BackgroundImage>
				<View style={styles.chapterDetails}>
					<Text style={styles.chapterProgress}>
						{solvedPuzzleCount} of {puzzleCount} puzzles solved
					</Text>
					{chapter.description && (
						<Text style={styles.chapterDescription}>{chapter.description}</Text>
					)}
				</View>
				<View style={styles.paragraphArea}>
					<ChapterParagraphList
						chapter={chapter}
						story={story}
						progressById={progressById}
						paragraphToRevealId={visibleRevealParagraphId}
						onUnlockRevealComplete={handleUnlockRevealComplete}
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
	background: {
		flex: 1,
		backgroundColor: colors.light.secondary,
		overflow: 'hidden',
	},
	chapterContent: {
		flex: 1,
	},
	paragraphArea: {
		flex: 1,
		paddingHorizontal: 8,
		borderBottomWidth: 1,
		borderColor: colors.light.goldenBorder,
	},
	readChapterLink: {
		fontFamily: 'lexend-400',
		fontSize: 16,
		lineHeight: 20,
	},
	chapterHeading: {
		backgroundColor: colors.light.background,
		gap: 2,
		paddingHorizontal: 20,
		paddingTop: 16,
		paddingBottom: 10,
		borderBottomWidth: 1,
		borderBottomColor: colors.light.border,
		// elevation: 3,
		// shadowColor: colors.dark.background,
		// shadowOffset: {
		// 	width: 0,
		// 	height: 3,
		// },
		// shadowOpacity: 0.12,
		// shadowRadius: 4,
		zIndex: 1,
	},
	absgems: {
		position: 'absolute',
		top: 0,
		right: 0,
	},
	chapterSummary: {
		alignItems: 'center',
		gap: 0,
	},
	chapterSummaryRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		paddingTop: 10,
		paddingBottom: 4,
		gap: 10,
	},
	chapterTitle: {
		flexShrink: 1,
		fontFamily: 'shadows-400',
		fontSize: 24,
		lineHeight: 28,
		color: colors.dark.text,
		textAlign: 'center',
	},
	chapterDetails: {
		alignItems: 'center',
		paddingHorizontal: 20,
		paddingVertical: 4,
		borderBottomWidth: 1,
		borderColor: colors.light.goldenBorder,
		gap: 4,
	},
	chapterName: {
		fontFamily: 'lexend-700',
		fontSize: 24,
		lineHeight: 24,
		textAlign: 'center',
	},
	chapterProgress: {
		fontFamily: 'lexend-400',
		fontSize: 13,
		lineHeight: 13,
		paddingVertical: 3,
		textAlign: 'center',
		color: colors.dark.text,
	},
	chapterDescription: {
		fontFamily: 'lexend-400',
		fontSize: 16,
		lineHeight: 20,
		color: colors.dark.text,
	},
	message: {
		fontFamily: 'lexend-400',
		fontSize: 15,
		textAlign: 'center',
		color: colors.dark.text,
	},
});

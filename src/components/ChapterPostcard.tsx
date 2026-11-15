import type { Chapter, Story } from '@/data/french/storyAtlas';
import colors from '@/src/app/colors';
import BackgroundImage from '@/src/components/BackgroundImage';
import { getUnlockCriteria, isItemUnlocked } from '@/src/util/atlasCompletion';
import type { ProgressById } from '@/src/util/progression';
import { useNavigation, type NativeStackNavigationProp } from 'expo-router';
import type { ParamListBase } from 'expo-router/react-navigation';
import { useLayoutEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';
import ChapterHeader from './ChapterHeader';
import ChapterParagraphList from './ChapterParagraphList';
import LockedSection from './LockedSection';

const postcardBackground = require('@/src/app/assets/images/postcard-parts/background.jpg');
const borderedPostcardBackground = require('@/src/app/assets/images/postcard-parts/background-bordered.jpg');

/**
 * Typing
 */
interface ChapterPostcardProps {
	chapter: Chapter;
	story: Story;
	progressById: ProgressById;
}

/**
 * Show the chapter's progress and paragraphs on a postcard,
 * or explain how to unlock it.
 */
export default function ChapterPostcard({ chapter, story, progressById }: ChapterPostcardProps) {
	/**
	 * Navigation and motion preference
	 */
	const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
	const reducedMotion = useReducedMotion();

	/**
	 * Keep one animation value for this postcard while it is open.
	 */
	const [postcardRotation] = useState(function createPostcardRotation() {
		let initialRotation = 10;

		if (reducedMotion) {
			initialRotation = 0;
		}

		return new Animated.Value(initialRotation);
	});

	/**
	 * Chapter progress and display values
	 */
	const color = colors.category[story.category];
	const isLocked = !isItemUnlocked({
		id: chapter.id,
		progressById,
	});
	const unlockCriteria = getUnlockCriteria(chapter, progressById);
	const hasParagraphs = chapter.paragraphs.length > 0;
	const frontPostcardStyle = {
		transform: [
			{
				perspective: 1000,
			},
			{
				rotateY: postcardRotation.interpolate({
					inputRange: [0, 10],
					outputRange: ['0deg', '10deg'],
				}),
			},
		],
	};

	/**
	 * Start the card's turn when the page moves, so it is visible during the slide.
	 */
	useLayoutEffect(() => {
		const removeTransitionListener = navigation.addListener('transitionStart', event => {
			let targetRotation = 0;
			let animationDuration = 450;

			if (event.data.closing && !reducedMotion) {
				targetRotation = 10;
			}

			if (reducedMotion) {
				animationDuration = 0;
			}

			Animated.timing(postcardRotation, {
				toValue: targetRotation,
				duration: animationDuration,
				easing: Easing.inOut(Easing.quad),
				useNativeDriver: true,
			}).start();
		});
		const removeGestureCancelListener = navigation.addListener('gestureCancel', () => {
			postcardRotation.setValue(0);
		});

		if (reducedMotion) {
			postcardRotation.setValue(0);
		}

		return () => {
			removeTransitionListener();
			removeGestureCancelListener();
			postcardRotation.stopAnimation();
		};
	}, [navigation, postcardRotation, reducedMotion]);

	return (
		<View style={styles.stack}>
			<BackgroundImage
				source={borderedPostcardBackground}
				resizeMode="stretch"
				style={[styles.postcard, styles.backPostcard]}
			/>
			<View style={styles.frontLayer}>
				<Animated.View style={frontPostcardStyle}>
					<BackgroundImage
						source={postcardBackground}
						style={styles.postcard}
					>
						<View style={styles.border}>
							<ChapterHeader
								chapter={chapter}
								progressById={progressById}
							/>
							{isLocked && (
								<View style={styles.lockedInner}>
									<LockedSection
										color={color}
										unlockCriteria={unlockCriteria}
										fontSize={15}
									/>
								</View>
							)}
							{!isLocked && hasParagraphs && (
								<ChapterParagraphList
									chapter={chapter}
									progressById={progressById}
									story={story}
								/>
							)}
						</View>
					</BackgroundImage>
				</Animated.View>
			</View>
		</View>
	);
}

/**
 * Styles
 */
const styles = StyleSheet.create({
	stack: {
		margin: 8,
		position: 'relative',
	},
	// Keep the turning postcard in front of the striped card beneath it.
	frontLayer: {
		zIndex: 1,
		elevation: 1,
	},
	postcard: {
		padding: 6,
		backgroundColor: colors.dark.background,
		borderWidth: 2,
		borderColor: colors.light.border,
		borderRadius: 12,
		overflow: 'hidden',
	},
	backPostcard: {
		zIndex: 0,
		transform: [{ rotate: '-4deg' }],
		padding: 0,
		position: 'absolute',
		top: 0,
		left: 0,
		height: '100%',
		width: '100%',
	},
	border: {
		borderWidth: 0,
		borderRadius: 8,
		borderColor: colors.light.goldenBorder,
	},
	lockedInner: {
		paddingVertical: 16,
		marginBottom: 24,
	},
});

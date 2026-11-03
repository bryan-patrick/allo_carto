import colors from '@/src/app/colors';
import BackgroundImage from '@/src/components/BackgroundImage';
import LinkButton from '@/src/components/LinkButton';
import { useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Animated, { LinearTransition } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import GettingStartedIndex from './GettingStartedIndex';

const gettingStartedBackground = require('@/src/app/assets/images/postcard-parts/background.jpg');
const AnimatedBackgroundImage = Animated.createAnimatedComponent(BackgroundImage);
const sheetTransition = LinearTransition.duration(120);

/*
 * Typing
 */
interface GettingStartedModalProps {
	onFinish: () => void;
	visible: boolean;
}

/*
 * Show one page at a time and smoothly resize the modal to fit it.
 * Keep Back and Next within reach at the bottom.
 */
export default function GettingStartedModal({ onFinish, visible }: GettingStartedModalProps) {
	const [pageIndex, setPageIndex] = useState(0);
	const { bottom, top } = useSafeAreaInsets();
	const { height: windowHeight } = useWindowDimensions();
	const CurrentPage = GettingStartedIndex[pageIndex];
	const isFirstPage = pageIndex === 0;
	const isLastPage = pageIndex === GettingStartedIndex.length - 1;
	const nextButtonLabel = isLastPage ? "Let's go!" : 'Next';
	const sheetStyle = {
		maxHeight: windowHeight - top - 8,
		paddingBottom: Math.max(bottom, 16),
	};

	function handleBack() {
		if (!isFirstPage) {
			setPageIndex(pageIndex - 1);
		}
	}

	function handleNext() {
		if (isLastPage) {
			onFinish();
			return;
		}

		setPageIndex(pageIndex + 1);
	}

	return (
		<Modal
			accessibilityViewIsModal
			animationType="slide"
			onRequestClose={handleBack}
			onShow={() => setPageIndex(0)}
			presentationStyle="overFullScreen"
			statusBarTranslucent
			transparent
			visible={visible}
		>
			<View style={styles.backdrop}>
				<AnimatedBackgroundImage
					layout={sheetTransition}
					source={gettingStartedBackground}
					resizeMode="cover"
					style={[styles.sheet, sheetStyle]}
				>
					<View style={styles.topBar}>
						<Text style={styles.label}>Getting started</Text>
						<Text
							accessibilityLiveRegion="polite"
							style={styles.pageCount}
						>
							Page {pageIndex + 1} of {GettingStartedIndex.length}
						</Text>
					</View>
					<ScrollView
						key={pageIndex}
						contentContainerStyle={styles.pageContent}
						style={styles.scrollView}
					>
						<CurrentPage />
					</ScrollView>
					<View style={styles.footer}>
						<LinkButton
							accessibilityRole="button"
							handler={handleBack}
							disabled={isFirstPage}
							useArrow={false}
							type="outline"
							color={colors.dark.primary}
							showShadow={false}
							showInnerBorder={false}
							contentPaddingHorizontal={0}
							style={[styles.button, isFirstPage && styles.disabledButton]}
							textStyle={styles.buttonText}
						>
							Back
						</LinkButton>
						<LinkButton
							accessibilityRole="button"
							handler={handleNext}
							useArrow={!isLastPage}
							contentPaddingHorizontal={0}
							style={styles.button}
							textStyle={styles.buttonText}
						>
							{nextButtonLabel}
						</LinkButton>
					</View>
				</AnimatedBackgroundImage>
			</View>
		</Modal>
	);
}

/*
 * Styles
 */
const styles = StyleSheet.create({
	backdrop: {
		alignItems: 'center',
		backgroundColor: 'rgba(18, 18, 18, 0.8)',
		flex: 1,
		justifyContent: 'flex-end',
	},
	sheet: {
		backgroundColor: colors.light.background,
		borderColor: colors.light.goldenBorder,
		borderTopLeftRadius: 24,
		borderTopRightRadius: 24,
		borderTopWidth: 1,
		maxWidth: 640,
		overflow: 'hidden',
		width: '100%',
	},
	topBar: {
		alignItems: 'center',
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 8,
		justifyContent: 'space-between',
		padding: 20,
	},
	label: {
		color: colors.dark.primary,
		fontFamily: 'lexend-600',
		fontSize: 14,
	},
	pageCount: {
		color: colors.dark.primary,
		fontFamily: 'lexend-400',
		fontSize: 12,
	},
	scrollView: {
		flexGrow: 0,
		flexShrink: 1,
	},
	pageContent: {
		paddingHorizontal: 24,
		paddingTop: 8,
		paddingBottom: 24,
	},
	footer: {
		borderTopColor: colors.light.goldenBorder,
		borderTopWidth: 1,
		flexDirection: 'row',
		gap: 16,
		paddingHorizontal: 20,
		paddingTop: 16,
	},
	button: {
		flex: 1,
		minHeight: 48,
	},
	buttonText: {
		paddingHorizontal: 8,
	},
	disabledButton: {
		opacity: 0.4,
	},
});

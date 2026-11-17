import colors from '@/src/app/colors';
import CollectionsPageMenu, {
	type CollectionsPage,
} from '@/src/components/Collections/CollectionsPageMenu';
import { collectionsPageStyles } from '@/src/components/Collections/collectionsPageStyles';
import type { CollectionsPageScrollProps } from '@/src/components/Collections/collectionsPageTypes';
import LinkButton from '@/src/components/LinkButton';
import Loader from '@/src/components/Loader';
import { useUserProgress } from '@/src/db/useUserProgress';
import { useEffect, useState, type ReactNode } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';
import StampsView from './StampsView';
import TipsView from './TipsView';

const collectionsPageBackground = require('@/src/app/assets/images/collections/page-background.jpg');

/**
 * Shows the Stamps or Tips page over a slowly scrolling background.
 */
export default function CollectionsView() {
	/**
	 * Saved progress and page selection
	 */
	const { status, reloadProgress } = useUserProgress();
	const [selectedPage, setSelectedPage] = useState<CollectionsPage>('stamps');
	const isReducedMotionEnabled = useReducedMotion();

	/**
	 * Scroll position and page sizes
	 */
	const [scrollOffset] = useState(() => new Animated.Value(0));
	const [backgroundHeight, setBackgroundHeight] = useState(0);
	const [viewportHeight, setViewportHeight] = useState(0);
	const [scrollContentHeight, setScrollContentHeight] = useState(0);
	const maximumScrollDistance = Math.max(scrollContentHeight - viewportHeight, 1);
	const backgroundScrollDistance = Math.min(maximumScrollDistance, viewportHeight);
	const pageScrollProps: CollectionsPageScrollProps = {
		onScroll: Animated.event(
			[
				{
					nativeEvent: {
						contentOffset: {
							y: scrollOffset,
						},
					},
				},
			],
			{
				useNativeDriver: true,
			},
		),
		onLayout: event => setViewportHeight(event.nativeEvent.layout.height),
		onContentSizeChange: (_contentWidth, contentHeight) => setScrollContentHeight(contentHeight),
	};

	/**
	 * Background movement
	 */
	let backgroundTravel = 0;

	if (!isReducedMotionEnabled && scrollContentHeight > viewportHeight) {
		backgroundTravel = backgroundScrollDistance * 0.2;
	}

	/**
	 * The extra image height keeps the background covered while it moves.
	 */
	const backgroundImageStyle = {
		height: backgroundHeight + backgroundTravel,
		transform: [
			{
				translateY: scrollOffset.interpolate({
					inputRange: [0, maximumScrollDistance],
					outputRange: [0, -backgroundTravel],
					extrapolate: 'clamp',
				}),
			},
		],
	};

	/**
	 * Initial page content
	 */
	let pageContent: ReactNode = <StampsView {...pageScrollProps} />;

	/**
	 * Starts the background at the top when switching collection pages.
	 */
	useEffect(() => {
		scrollOffset.setValue(0);
	}, [selectedPage, scrollOffset]);

	if (selectedPage === 'tips') {
		pageContent = <TipsView {...pageScrollProps} />;
	}

	if (status === 'loading') {
		pageContent = <Loader />;
	}

	if (status === 'error') {
		pageContent = (
			<View style={styles.notice}>
				<Text style={collectionsPageStyles.introduction}>
					Could not load your collections. Please try again.
				</Text>
				<LinkButton handler={reloadProgress}>Try again</LinkButton>
			</View>
		);
	}

	/**
	 * Render the page
	 */
	return (
		<View
			onLayout={event => setBackgroundHeight(event.nativeEvent.layout.height)}
			style={styles.background}
		>
			<Animated.Image
				accessible={false}
				pointerEvents="none"
				source={collectionsPageBackground}
				resizeMode="cover"
				style={[styles.backgroundImage, backgroundImageStyle]}
			/>
			<CollectionsPageMenu
				selectedPage={selectedPage}
				onSelectPage={setSelectedPage}
			/>
			{pageContent}
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
	backgroundImage: {
		position: 'absolute',
		top: 0,
		left: 0,
		width: '100%',
	},
	notice: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		padding: 24,
		gap: 16,
	},
});

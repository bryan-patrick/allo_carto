import colors from '@/src/app/colors';
import { userActivityDisplay, type UserNotification } from '@/src/util/userActivity';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
	AccessibilityInfo,
	Animated,
	AppState,
	Easing,
	ImageBackground,
	Platform,
	Pressable,
	StyleSheet,
	Text,
	View,
	type LayoutChangeEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FullWindowOverlay } from 'react-native-screens';
import MaterialSymbol from './MaterialSymbol';

interface ToasterProps {
	notification?: UserNotification;
	onClose: (notificationId: number) => void;
}

interface ToasterCardProps extends ToasterProps {
	notification: UserNotification;
}

const postcardBackground = require('@/src/app/assets/images/postcard-parts/background.jpg');
const toastDuration = 4000;

/*
 * Shows our toaster.
 */
export default function Toaster({ notification, onClose }: ToasterProps) {
	const [appState, setAppState] = useState(AppState.currentState);

	useEffect(() => {
		const subscription = AppState.addEventListener('change', setAppState);

		return () => subscription.remove();
	}, []);

	if (!notification || appState !== 'active') {
		return null;
	}

	const toast = (
		<View
			pointerEvents="box-none"
			style={styles.overlay}
		>
			<ToasterCard
				key={notification.id}
				notification={notification}
				onClose={onClose}
			/>
		</View>
	);

	if (Platform.OS === 'ios') {
		return <FullWindowOverlay>{toast}</FullWindowOverlay>;
	}

	return toast;
}

// Slide a postcard down, leave it visible for four seconds, then close only the toast.
function ToasterCard({ notification, onClose }: ToasterCardProps) {
	const { top, left, right } = useSafeAreaInsets();
	const [toastHeight, setToastHeight] = useState(0);
	const animationProgress = useRef(new Animated.Value(0)).current;
	const isClosing = useRef(false);
	const display = userActivityDisplay[notification.type];
	const containerStyle = {
		paddingTop: top + 8,
		paddingLeft: left + 16,
		paddingRight: right + 16,
	};
	const animatedStyle = {
		opacity: animationProgress,
		transform: [
			{
				translateY: animationProgress.interpolate({
					inputRange: [0, 1],
					outputRange: [-(toastHeight + top + 16), 0],
				}),
			},
		],
	};

	const closeToast = useCallback(() => {
		if (isClosing.current) {
			return;
		}

		isClosing.current = true;

		Animated.timing(animationProgress, {
			toValue: 0,
			duration: 180,
			easing: Easing.in(Easing.cubic),
			useNativeDriver: true,
		}).start(({ finished }) => {
			if (finished) {
				onClose(notification.id);
			}
		});
	}, [animationProgress, notification.id, onClose]);

	useEffect(() => {
		let timeout: ReturnType<typeof setTimeout> | undefined;

		if (toastHeight === 0) {
			return;
		}

		animationProgress.setValue(0);
		isClosing.current = false;

		Animated.timing(animationProgress, {
			toValue: 1,
			duration: 260,
			easing: Easing.out(Easing.cubic),
			useNativeDriver: true,
		}).start(({ finished }) => {
			if (finished) {
				AccessibilityInfo.announceForAccessibility(`${display.title}. ${notification.description}`);
				timeout = setTimeout(closeToast, toastDuration);
			}
		});

		return () => {
			clearTimeout(timeout);
			animationProgress.stopAnimation();
		};
	}, [animationProgress, closeToast, display.title, notification.description, toastHeight]);

	function measureToast(event: LayoutChangeEvent) {
		setToastHeight(event.nativeEvent.layout.height);
	}

	return (
		<View
			pointerEvents="box-none"
			style={[styles.position, containerStyle]}
		>
			<Animated.View
				onLayout={measureToast}
				style={[styles.shadow, animatedStyle]}
			>
				<ImageBackground
					source={postcardBackground}
					style={styles.card}
				>
					<MaterialSymbol
						color={colors.dark.primary}
						name="raven"
						size={36}
						style={styles.raven}
					/>
					<View
						accessible
						accessibilityLabel={`${display.title}. ${notification.description}`}
						style={styles.details}
					>
						<Text style={styles.title}>{display.title}</Text>
						<Text style={styles.description}>{notification.description}</Text>
					</View>
					<Pressable
						accessibilityHint="Keeps this notification in your Notifications tab"
						accessibilityLabel="Close notification toast"
						accessibilityRole="button"
						onPress={closeToast}
						style={styles.closeButton}
					>
						<MaterialSymbol
							color={colors.dark.primary}
							name="close"
							size={20}
						/>
					</Pressable>
				</ImageBackground>
			</Animated.View>
		</View>
	);
}

const styles = StyleSheet.create({
	overlay: {
		...StyleSheet.absoluteFill,
		zIndex: 1000,
		elevation: 1000,
	},
	position: {
		alignItems: 'center',
		left: 0,
		position: 'absolute',
		right: 0,
		top: 0,
	},
	shadow: {
		borderRadius: 14,
		elevation: 8,
		maxWidth: 520,
		shadowColor: colors.dark.background,
		shadowOffset: {
			width: 0,
			height: 4,
		},
		shadowOpacity: 0.24,
		shadowRadius: 10,
		width: '100%',
	},
	card: {
		alignItems: 'flex-start',
		backgroundColor: colors.light.secondary,
		borderColor: colors.light.goldenBorder,
		borderRadius: 14,
		borderWidth: 1,
		flexDirection: 'row',
		gap: 12,
		overflow: 'hidden',
		padding: 14,
	},
	raven: {
		marginTop: 2,
	},
	details: {
		flex: 1,
		gap: 4,
	},
	title: {
		color: colors.dark.text,
		fontFamily: 'lexend-600',
		fontSize: 15,
		lineHeight: 21,
	},
	description: {
		color: colors.dark.primary,
		fontFamily: 'lexend-400',
		fontSize: 13,
		lineHeight: 19,
	},
	closeButton: {
		alignItems: 'center',
		height: 44,
		justifyContent: 'center',
		margin: -8,
		width: 44,
	},
});

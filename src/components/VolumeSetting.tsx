import colors from '@/src/app/colors';
import { clampAudioVolume, maxAudioVolume } from '@/src/settings/appSettings';
import { useState } from 'react';
import {
	type AccessibilityActionEvent,
	type GestureResponderEvent,
	type LayoutChangeEvent,
	StyleSheet,
	Text,
	View,
} from 'react-native';

/**
 * Typing
 */
interface VolumeSettingProps {
	label: string;
	value: number;
	onValueChange: (value: number) => void;
}

/**
 * Consts
 */
const thumbSize = 24;
const volumeStep = 0.05;

export default function VolumeSetting({ label, value, onValueChange }: VolumeSettingProps) {
	const [width, setWidth] = useState(0);
	const trackWidth = Math.max(0, width - thumbSize);
	const volumeFraction = clampAudioVolume(value) / maxAudioVolume;
	const volumePercentage = Math.round(volumeFraction * 100);
	const thumbPosition = volumeFraction * trackWidth;

	function handleLayout(event: LayoutChangeEvent) {
		setWidth(event.nativeEvent.layout.width);
	}

	function handleTouch(event: GestureResponderEvent) {
		if (trackWidth === 0) {
			return;
		}

		const fraction = (event.nativeEvent.locationX - thumbSize / 2) / trackWidth;
		const nextVolume = Math.round((fraction * maxAudioVolume) / volumeStep) * volumeStep;

		onValueChange(clampAudioVolume(nextVolume));
	}

	function handleAccessibilityAction(event: AccessibilityActionEvent) {
		if (event.nativeEvent.actionName === 'increment') {
			onValueChange(clampAudioVolume(value + volumeStep));
		} else if (event.nativeEvent.actionName === 'decrement') {
			onValueChange(clampAudioVolume(value - volumeStep));
		}
	}

	return (
		<View style={styles.container}>
			<View style={styles.labels}>
				<Text style={styles.text}>{label}</Text>
				<Text style={styles.text}>{volumePercentage}%</Text>
			</View>
			<View
				accessible
				accessibilityRole="adjustable"
				accessibilityLabel={label}
				accessibilityValue={{
					min: 0,
					max: 100,
					now: volumePercentage,
					text: `${volumePercentage} percent`,
				}}
				accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
				onAccessibilityAction={handleAccessibilityAction}
				onLayout={handleLayout}
				onStartShouldSetResponder={() => true}
				onResponderTerminationRequest={() => false}
				onResponderGrant={handleTouch}
				onResponderMove={handleTouch}
				style={styles.slider}
			>
				<View
					pointerEvents="none"
					style={styles.track}
				>
					<View style={[styles.fill, { width: thumbPosition }]} />
				</View>
				<View
					pointerEvents="none"
					style={[styles.thumb, { left: thumbPosition }]}
				/>
			</View>
		</View>
	);
}

/**
 * Styles
 */
const styles = StyleSheet.create({
	container: {
		gap: 4,
	},
	labels: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		gap: 16,
	},
	text: {
		color: colors.light.text,
		fontFamily: 'lexend-400',
		fontSize: 14,
	},
	slider: {
		width: '100%',
		height: 44,
		justifyContent: 'center',
	},
	track: {
		height: 4,
		marginHorizontal: thumbSize / 2,
		backgroundColor: colors.dark.border,
		borderRadius: 2,
	},
	fill: {
		height: '100%',
		backgroundColor: colors.light.goldenBorder,
		borderRadius: 2,
	},
	thumb: {
		position: 'absolute',
		top: (44 - thumbSize) / 2,
		width: thumbSize,
		height: thumbSize,
		borderRadius: thumbSize / 2,
		backgroundColor: colors.light.text,
	},
});

import { useState, type ReactNode } from 'react';
import {
	Image,
	StyleSheet,
	View,
	type ImageSourcePropType,
	type LayoutChangeEvent,
	type StyleProp,
	type ViewStyle,
} from 'react-native';

interface RepeatingBackgroundImageProps {
	source: ImageSourcePropType;
	children: ReactNode;
	style?: StyleProp<ViewStyle>;
}

interface BackgroundSize {
	width: number;
	height: number;
}

// Fit the background to the page width and repeat it down the scrolling content.
export default function RepeatingBackgroundImage({
	source,
	children,
	style,
}: RepeatingBackgroundImageProps) {
	const [backgroundSize, setBackgroundSize] = useState<BackgroundSize>({
		width: 0,
		height: 0,
	});
	const imageSize = Image.resolveAssetSource(source);
	const imageScale = backgroundSize.width / imageSize.width;
	const tileHeight = imageSize.height * imageScale;
	const tileCount = tileHeight > 0 ? Math.ceil(backgroundSize.height / tileHeight) : 0;
	const tileIndexes = Array.from(
		{
			length: tileCount,
		},
		(_, index) => index,
	);

	function handleLayout(event: LayoutChangeEvent) {
		const { width, height } = event.nativeEvent.layout;

		setBackgroundSize(currentSize => {
			if (currentSize.width === width && currentSize.height === height) {
				return currentSize;
			}

			return {
				width,
				height,
			};
		});
	}

	return (
		<View
			onLayout={handleLayout}
			style={style}
		>
			<View
				pointerEvents="none"
				style={styles.background}
			>
				{tileIndexes.map(index => {
					const tileStyle = {
						height: tileHeight,
						top: index * tileHeight,
					};

					return (
						<Image
							key={index}
							accessible={false}
							source={source}
							resizeMode="stretch"
							style={[styles.tile, tileStyle]}
						/>
					);
				})}
			</View>
			{children}
		</View>
	);
}

const styles = StyleSheet.create({
	background: {
		...StyleSheet.absoluteFill,
		overflow: 'hidden',
	},
	tile: {
		position: 'absolute',
		left: 0,
		width: '100%',
	},
});

/*
 * Adapted from the replacement example provided by React Native for ImageBackground.

 * https://github.com/react/react-native/commit/2361189716afbcced6ee2cdb0fd860cf23460850
 */
import { forwardRef, type ComponentRef, type ReactNode, type Ref } from 'react';
import {
	Image,
	StyleSheet,
	View,
	type ImageProps,
	type ImageStyle,
	type StyleProp,
	type ViewStyle,
} from 'react-native';

interface BackgroundImageProps extends Omit<ImageProps, 'children' | 'style'> {
	children?: ReactNode;
	style?: StyleProp<ViewStyle>;
	imageStyle?: StyleProp<ImageStyle>;
	imageRef?: Ref<ComponentRef<typeof Image>>;
}

/*
 * Places images behind the children.
 * It's wrapped in a forwardRef so we can do things to the wrapping <View> (e.g. flipping the wordcards over)
 */
const BackgroundImage = forwardRef<ComponentRef<typeof View>, BackgroundImageProps>(
	function BackgroundImage(
		{ children, style, imageStyle, imageRef, importantForAccessibility, ...imageProps },
		ref,
	) {
		const containerStyle = StyleSheet.flatten(style);
		const imageDimensions = {
			width: containerStyle?.width,
			height: containerStyle?.height,
		};

		return (
			<View
				accessibilityIgnoresInvertColors
				importantForAccessibility={importantForAccessibility}
				style={style}
				ref={ref}
			>
				<Image
					{...imageProps}
					importantForAccessibility={importantForAccessibility}
					style={[StyleSheet.absoluteFill, imageDimensions, imageStyle]}
					ref={imageRef}
				/>
				{children}
			</View>
		);
	},
);

export default BackgroundImage;

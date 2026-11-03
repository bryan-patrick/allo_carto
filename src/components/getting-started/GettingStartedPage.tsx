import colors from '@/src/app/colors';
import { Image, StyleSheet, Text, View, type ImageSourcePropType } from 'react-native';

/*
 * Typing
 */
interface GettingStartedPageProps {
	title: string;
	description: string;
	imageSource?: ImageSourcePropType;
	imageLabel?: string;
}

// Show a short tutorial step with an optional image in its original proportions.
export default function GettingStartedPage({
	title,
	description,
	imageSource,
	imageLabel,
}: GettingStartedPageProps) {
	const imageDimensions = imageSource ? Image.resolveAssetSource(imageSource) : undefined;
	const imageWidth = imageDimensions?.width ?? 0;
	const imageHeight = imageDimensions?.height ?? 0;
	const imageAspectRatio = imageWidth > 0 && imageHeight > 0 ? imageWidth / imageHeight : 1;

	return (
		<View style={styles.page}>
			<View style={styles.heading}>
				<Text
					accessibilityRole="header"
					style={styles.title}
				>
					{title}
				</Text>
				<Text style={styles.description}>{description}</Text>
			</View>
			{imageSource && (
				<View
					style={[
						styles.imageFrame,
						{
							aspectRatio: imageAspectRatio,
						},
					]}
				>
					<Image
						accessibilityLabel={imageLabel}
						resizeMode="contain"
						source={imageSource}
						style={styles.image}
					/>
				</View>
			)}
		</View>
	);
}

/*
 * Styles
 */
const styles = StyleSheet.create({
	page: {
		alignItems: 'center',
		gap: 20,
		width: '100%',
	},
	heading: {
		gap: 8,
		width: '100%',
	},
	title: {
		color: colors.dark.primary,
		fontFamily: 'lexend-600',
		fontSize: 24,
		textAlign: 'center',
	},
	imageFrame: {
		flexShrink: 0,
		width: '100%',
		maxWidth: 360,
	},
	image: {
		...StyleSheet.absoluteFill,
		width: '100%',
		height: '100%',
	},
	description: {
		color: colors.dark.text,
		fontFamily: 'lexend-400',
		fontSize: 16,
		lineHeight: 25,
		textAlign: 'center',
	},
});

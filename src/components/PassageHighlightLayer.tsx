import MaskedView from '@react-native-masked-view/masked-view';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

export interface PassageHighlightLayerProps {
	children: ReactNode;
	lineHeight: number;
	lineMetrics: { y: number; height: number }[];
	verticalInset: number;
}

/**
 * Highlights the words in the passage
 */
export default function PassageHighlightLayer({
	children,
	lineMetrics,
	verticalInset,
}: PassageHighlightLayerProps) {
	const bands = lineMetrics.map(({ y, height }) => ({
		top: y + verticalInset,
		height: Math.max(0, height - verticalInset * 2),
	}));

	return (
		<MaskedView
			accessible={false}
			accessibilityElementsHidden
			importantForAccessibility="no-hide-descendants"
			pointerEvents="none"
			style={StyleSheet.absoluteFill}
			maskElement={
				<View style={styles.mask}>
					{bands.map((band, index) => (
						<View
							key={index}
							style={[styles.band, band]}
						/>
					))}
				</View>
			}
		>
			{children}
		</MaskedView>
	);
}

const styles = StyleSheet.create({
	mask: { flex: 1 },
	band: { position: 'absolute', left: 0, right: 0, backgroundColor: '#000' },
});

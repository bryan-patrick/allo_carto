import type { PassageHighlightLayerProps } from './PassageHighlightLayer';

/**
 * Native text line measurements are unavailable on web. CSS clips each
 * line's background using the same fixed line height as the passage.
 */
export default function PassageHighlightLayer({
	children,
	lineHeight,
	verticalInset,
}: PassageHighlightLayerProps) {
	const bottom = lineHeight - verticalInset;
	const maskImage = `repeating-linear-gradient(to bottom, transparent 0px, transparent ${verticalInset}px, black ${verticalInset}px, black ${bottom}px, transparent ${bottom}px, transparent ${lineHeight}px)`;

	return (
		<div
			aria-hidden
			style={{
				position: 'absolute',
				inset: 0,
				pointerEvents: 'none',
				maskImage,
				WebkitMaskImage: maskImage,
			}}
		>
			{children}
		</div>
	);
}

import { G, Path } from 'react-native-svg';
import type { SVGProps } from './SVG';
import SVG from './SVG';

/**
 * SVGArrowDownToLine Component
 */
export default function SVGArrowDownToLine({
	color = '#ffffff',
	height = '24px',
	width = '24px',
}: SVGProps) {
	return (
		<SVG
			viewbox="0 0 24 24"
			height={height}
			width={width}
		>
			<G
				fill="none"
				stroke={color}
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={2.5}
			>
				<Path d="M12 17V3" />
				<Path d="m6 11 6 6 6-6" />
				<Path d="M19 21H5" />
			</G>
		</SVG>
	);
}

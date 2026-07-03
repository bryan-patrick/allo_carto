import { G, Path } from "react-native-svg";
import type { SVGProps } from "./SVG";
import SVG from "./SVG";

/**
 * SVGArrowUpFromLine Component
 */
export default function SVGArrowUpFromLine({
  color = "#ffffff",
  height = '24px',
  width = '24px'
}: SVGProps) {
  return (
    <SVG viewbox="0 0 24 24" height={height} width={width}>
      <G
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2.5}
      >
        <Path d="m18 9-6-6-6 6" />
        <Path d="M12 3v14" />
        <Path d="M5 21h14" />
      </G>
    </SVG>
  )
}

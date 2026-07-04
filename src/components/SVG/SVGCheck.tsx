import { G, Path } from "react-native-svg";
import type { SVGProps } from "./SVG";
import SVG from "./SVG";

/**
 * SVGCheck Component
 */
export default function SVGCheck({
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
        strokeWidth={2}
      >
        <Path d="M20 6 9 17l-5-5" />
      </G>
    </SVG>
  )
}

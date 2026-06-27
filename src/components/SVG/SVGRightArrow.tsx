import { G, Path } from "react-native-svg";
import type { SVGProps } from "./SVG";
import SVG from "./SVG";

/**
 * SVGRightArrow Component
 */
export default function SVGRightArrow({
  color = "#ffffff",
  height = '24px',
  width = '24px'
}: SVGProps) {
  return (
    <SVG viewbox="0 0 24 24" height={height} width={width}>
      <G stroke={color} strokeWidth={2}>
        <Path d="M18 8L22 12L18 16" />
        <Path d="M2 12H22" />
      </G>
    </SVG>
  )
}
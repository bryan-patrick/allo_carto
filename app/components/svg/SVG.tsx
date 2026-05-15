import type { ReactNode } from "react";
import Svg from "react-native-svg";

export interface SVGProps {
  viewbox?: string;
  color?: string;
  height?: string;
  width?: string;
  children?: ReactNode;
}

export default function SVG({ viewbox, height = '32px', width = '32px', children }: SVGProps) {
  return (
    <Svg
      viewBox={viewbox}
      width={width}
      height={height}
    >
      {children}
    </Svg>
  )
}
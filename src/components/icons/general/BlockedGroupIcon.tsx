import * as React from "react";
import Svg, { SvgProps, Circle, Path } from "react-native-svg";

const SvgBlockedGroupIcon = (props: SvgProps) => (
  <Svg width={230} height={90} fill="none" {...props}>
    <Path
      stroke="#E73D5B"
      strokeWidth={4}
      d="M108 44c0 12.703-10.297 23-23 23-6.27 0-11.95-2.506-16.1-6.575A22.925 22.925 0 0 1 62 44c0-12.703 10.297-23 23-23 6.434 0 12.249 2.64 16.425 6.9A22.92 22.92 0 0 1 108 44ZM168 44c0 12.703-10.297 23-23 23a22.92 22.92 0 0 1-16.1-6.575A22.927 22.927 0 0 1 122 44c0-12.703 10.297-23 23-23 6.434 0 12.249 2.64 16.425 6.9A22.92 22.92 0 0 1 168 44Z"
      opacity={0.6}
    />
    <Circle
      cx={115}
      cy={45}
      r={33.5}
      fill="#30314C"
      stroke="#E73D5B"
      strokeWidth={5}
    />
    <Path
      stroke="#E73D5B"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={5}
      d="M137.962 21 92 66.962"
    />
  </Svg>
);

export default SvgBlockedGroupIcon;

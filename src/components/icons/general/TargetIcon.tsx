import * as React from "react";
import Svg, { SvgProps, G, Circle, Path, Defs } from "react-native-svg";
/* SVGR has dropped some elements not supported by react-native-svg: filter */

const SvgTargetIcon = (props: SvgProps) => (
  <Svg
    viewBox="0 0 33 33"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <G
      filter="url(#TargetIcon_svg__a)"
      stroke="currentColor"
      strokeWidth={0.738}
    >
      <Circle cx={16.5} cy={16.5} r={8.131} />
      <Path d="M21.799 16.5a5.298 5.298 0 1 1-10.596 0 5.298 5.298 0 0 1 10.596 0Z" />
      <Circle cx={16.501} cy={16.5} r={2.06} fill="currentColor" />
    </G>
    <Defs></Defs>
  </Svg>
);

export default SvgTargetIcon;

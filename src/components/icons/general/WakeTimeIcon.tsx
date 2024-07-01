import * as React from "react";
import Svg, { SvgProps, Path } from "react-native-svg";

const SvgWakeTimeIcon = (props: SvgProps) => (
  <Svg
    viewBox="0 0 30 30"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Path
      d="M10.875 6.915 9.978 4.75M5.039 12.748l-2.165-.896M24.96 12.748l2.166-.896M19.126 6.915l.897-2.165M28.125 18.75H1.875M24.375 23.438H5.625M8.222 18.753a7.031 7.031 0 1 1 13.557 0"
      stroke="currentColor"
      strokeWidth={1.2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default SvgWakeTimeIcon;

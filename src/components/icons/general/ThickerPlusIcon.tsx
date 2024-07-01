import * as React from "react";
import Svg, { SvgProps, Path, Circle } from "react-native-svg";

const SvgThickerPlusIcon = (props: SvgProps) => (
  <Svg
    viewBox="0 0 26 26"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Path
      d="M2 13h22M13 24V2"
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="round"
    />
  </Svg>
);

export default SvgThickerPlusIcon;

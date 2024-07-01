import * as React from "react";
import Svg, { SvgProps, Path } from "react-native-svg";

const SvgChevronDownIcon = (props: SvgProps) => (
  <Svg
    viewBox="0 0 14 8"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Path
      d="m1 1 6 6 6-6"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default SvgChevronDownIcon;

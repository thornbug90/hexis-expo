import * as React from "react";
import Svg, { SvgProps, Path } from "react-native-svg";

const SvgChevronUpIcon = (props: SvgProps) => (
  <Svg
    viewBox="0 0 14 8"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Path
      d="M13 7 7 1 1 7"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default SvgChevronUpIcon;

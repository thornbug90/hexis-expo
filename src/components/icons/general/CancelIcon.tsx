import * as React from "react";
import Svg, { SvgProps, Path } from "react-native-svg";

const SvgCancelIcon = (props: SvgProps) => (
  <Svg
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Path
      d="M8.222 23.547 23.78 7.99M23.778 23.547 8.222 7.99"
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="round"
    />
  </Svg>
);

export default SvgCancelIcon;

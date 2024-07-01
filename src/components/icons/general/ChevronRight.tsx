import * as React from "react";
import Svg, { SvgProps, Path } from "react-native-svg";

const SvgChevronRight = (props: SvgProps) => (
  <Svg
    viewBox="0 0 10 17"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Path
      d="M1.336 15.429 8.064 8.7 1.336 1.971"
      stroke="currentColor"
      strokeWidth={2.243}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default SvgChevronRight;

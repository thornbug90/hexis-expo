import * as React from "react";
import Svg, { SvgProps, Path } from "react-native-svg";

const SvgChevronLeft = (props: SvgProps) => (
  <Svg
    viewBox="0 0 10 17"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Path
      d="M8.064 15.429 1.336 8.7l6.728-6.729"
      stroke="currentColor"
      strokeWidth={2.243}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default SvgChevronLeft;

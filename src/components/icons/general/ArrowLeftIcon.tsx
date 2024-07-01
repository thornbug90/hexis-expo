import * as React from "react";
import Svg, { SvgProps, Path } from "react-native-svg";

const SvgArrowLeftIcon = (props: SvgProps) => (
  <Svg
    viewBox="0 0 31 23"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Path
      d="M30 11.838H3.488M9.768 18.117l-6.28-6.279 6.28-6.279"
      stroke="currentColor"
      strokeOpacity={0.6}
      strokeWidth={1.395}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default SvgArrowLeftIcon;

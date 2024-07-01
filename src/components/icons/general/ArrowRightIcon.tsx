import * as React from "react";
import Svg, { SvgProps, Path } from "react-native-svg";

const SvgArrowRightIcon = (props: SvgProps) => (
  <Svg
    viewBox="0 0 30 15"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Path
      d="M.972 7.148h27.42M21.896.871l6.495 6.28-6.494 6.278"
      stroke="currentColor"
      strokeOpacity={0.6}
      strokeWidth={1.395}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default SvgArrowRightIcon;

import * as React from "react";
import Svg, { SvgProps, Path } from "react-native-svg";

const SvgWorkoutLineIcon = (props: SvgProps) => (
  <Svg
    width={14}
    height={2}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Path
      d="M1.144 1.353h11.314"
      stroke="#359CEF"
      strokeWidth={1.131}
      strokeLinecap="round"
    />
  </Svg>
);

export default SvgWorkoutLineIcon;

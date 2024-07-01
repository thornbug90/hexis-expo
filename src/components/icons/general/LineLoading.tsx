import * as React from "react";
import Svg, { SvgProps, Path } from "react-native-svg";

const LoadingLine = (props: SvgProps) => (
  <Svg
    width={60}
    height={1}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Path
      opacity={0.6}
      stroke="#F9F9F9"
      strokeDasharray="6.12 6.12"
      d="M0 .5h60"
    />
  </Svg>
);

export default LoadingLine;

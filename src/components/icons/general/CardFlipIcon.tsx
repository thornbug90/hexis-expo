import * as React from "react";
import Svg, { SvgProps, Path } from "react-native-svg";

const SvgCardFlipIcon = (props: SvgProps) => (
  <Svg
    viewBox="0 0 14 14"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Path
      d="M13.203 7.93c.06-.494.06-.982.001-1.456m-1.669-3.47a6.306 6.306 0 0 0-3.813-1.871C4.282.73 1.16 3.122.747 6.474c-.412 3.352 2.041 6.396 5.48 6.798a6.47 6.47 0 0 0 2.523-.205m2.785-10.062-.026-1.84m.026 1.84-1.986.394m1.545 8.413a6.215 6.215 0 0 0 1.313-1.549"
      stroke="currentColor"
      strokeWidth={1.2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default SvgCardFlipIcon;

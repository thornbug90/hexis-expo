import * as React from "react";
import Svg, { SvgProps, Path } from "react-native-svg";

const SvgKeyPerformanceIcon = (props: SvgProps) => (
  <Svg
    viewBox="0 0 20 22"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Path
      stroke="currentColor"
      strokeWidth={1.667}
      strokeLinecap="round"
      d="M.833 8.107v5.606M17.9 8.107v5.606M5.567 16.134V5.68M14.1 16.134V5.68M9.833 20.985V.834"
    />
  </Svg>
);

export default SvgKeyPerformanceIcon;

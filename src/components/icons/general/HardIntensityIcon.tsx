import * as React from "react";
import Svg, { SvgProps, Path } from "react-native-svg";

const SvgHardIntensityIcon = (props: SvgProps) => (
  <Svg
    viewBox="0 0 13 11"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Path fill="#359CEF" d="M0 6h3v5H0zM5 3h3v8H5z" />
    <Path fill="#359CEF" d="M10 0h3v11h-3z" />
  </Svg>
);

export default SvgHardIntensityIcon;

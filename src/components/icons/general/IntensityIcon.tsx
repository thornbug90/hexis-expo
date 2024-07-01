import * as React from "react";
import Svg, { SvgProps, Path } from "react-native-svg";

const SvgIntensityIcon = (props: SvgProps) => (
  <Svg
    viewBox="0 0 13 11"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Path fill="#359CEF" d="M0 6h3v5H0z" />
    <Path opacity={0.3} fill="#359CEF" d="M5 3h3v8H5z" />
    <Path opacity={0.5} fill="#359CEF" d="M10 0h3v11h-3z" />
  </Svg>
);

export default SvgIntensityIcon;

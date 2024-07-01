import * as React from "react";
import Svg, { SvgProps, Path } from "react-native-svg";

const SvgModerateIntensityIcon = (props: SvgProps) => (
  <Svg
    viewBox="0 0 14 11"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Path fill="#359CEF" d="M0 6h3.086v4.902H0zM5.144 3H8.23v7.843H5.144z" />
    <Path opacity={0.3} fill="#359CEF" d="M10.287 0h3.086v10.784h-3.086z" />
  </Svg>
);

export default SvgModerateIntensityIcon;

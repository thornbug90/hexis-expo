import * as React from "react";
import Svg, { SvgProps, Path } from "react-native-svg";

const SvgInputEye = (props: SvgProps) => (
  <Svg
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Path
      d="M9.901 4.332c-6.188 0-8.664 5.57-8.664 5.57s2.476 5.569 8.664 5.569 8.664-5.57 8.664-5.57-2.476-5.57-8.664-5.57Z"
      stroke="#ACADB7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M9.902 12.995a3.094 3.094 0 1 0 0-6.188 3.094 3.094 0 0 0 0 6.188Z"
      stroke="#ACADB7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default SvgInputEye;

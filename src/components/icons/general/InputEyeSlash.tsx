import * as React from "react";
import Svg, { SvgProps, Path } from "react-native-svg";

const SvgInputEyeSlash = (props: SvgProps) => (
  <Svg
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Path
      d="m3.75 3.125 12.5 13.75M12.102 12.313A3.125 3.125 0 0 1 7.9 7.688"
      stroke="#ACADB7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M5.781 5.36C2.594 6.968 1.25 10 1.25 10s2.5 5.625 8.75 5.625a9.211 9.211 0 0 0 4.219-.984M16.297 13.211C18 11.687 18.75 10 18.75 10S16.25 4.375 10 4.375a9.68 9.68 0 0 0-1.617.133"
      stroke="#ACADB7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M10.586 6.93a3.117 3.117 0 0 1 2.523 2.773"
      stroke="#ACADB7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default SvgInputEyeSlash;

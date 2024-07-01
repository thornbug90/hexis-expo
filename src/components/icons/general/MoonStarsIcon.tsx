import * as React from "react";
import Svg, { SvgProps, Path } from "react-native-svg";

const SvgMoonStarsIcon = (props: SvgProps) => (
  <Svg
    viewBox="0 0 30 30"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Path
      d="M25.313 13.125V7.5M28.125 10.313H22.5M19.688 2.813v3.75M21.563 4.688h-3.75M25.39 17.888A10.785 10.785 0 0 1 12.111 4.61h0A10.783 10.783 0 1 0 25.39 17.888h0Z"
      stroke="currentColor"
      strokeWidth={1.2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default SvgMoonStarsIcon;

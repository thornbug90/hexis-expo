import * as React from "react";
import Svg, { SvgProps, Path } from "react-native-svg";

const SvgHeightIcon = (props: SvgProps) => (
  <Svg
    viewBox="0 0 61 22"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Path
      d="M11.261 1v7.495M21.521 1v12.491M31.782 1v7.495M42.044 1v12.491M52.303 1v7.495M1 1h59v17.644c0 .31-.063.616-.184.902a2.35 2.35 0 0 1-.525.764 2.425 2.425 0 0 1-.784.51c-.294.12-.608.18-.926.18H3.419c-.317 0-.632-.06-.926-.18a2.426 2.426 0 0 1-.784-.51 2.353 2.353 0 0 1-.525-.764A2.302 2.302 0 0 1 1 18.643V1Z"
      stroke="currentColor"
      strokeWidth={1.696}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default SvgHeightIcon;

import * as React from "react";
import Svg, { SvgProps, Path } from "react-native-svg";

const OpenLink = (props: SvgProps) => (
  <Svg
    width={32}
    height={32}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Path
      d="m8.875 16.05-1.413 1.412a5.003 5.003 0 0 0 7.075 7.076l1.413-1.413M23.125 15.95l1.413-1.412a5.002 5.002 0 1 0-7.076-7.076L16.05 8.875"
      stroke="#F9F9F9"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default OpenLink;

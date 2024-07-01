import * as React from "react";
import Svg, { SvgProps, Path } from "react-native-svg";

const SvgPastLineIcon = (props: SvgProps) => (
  <Svg
    width={13}
    height={2}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Path
      d="M.887 1.354h11.314"
      stroke="#F9F9F9"
      strokeWidth={1.131}
      strokeLinecap="round"
    />
  </Svg>
);

export default SvgPastLineIcon;

import * as React from "react";
import Svg, { SvgProps, Path } from "react-native-svg";

const SvgInfoIcon = (props: SvgProps) => (
  <Svg
    viewBox="0 0 15 15"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Path
      d="M7.5 14a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13Z"
      stroke="currentColor"
      strokeWidth={1.067}
      strokeMiterlimit={10}
    />
    <Path
      d="M8.144 6.32h-1.2a.174.174 0 0 0-.174.174v4.609c0 .095.077.173.173.173h1.201a.174.174 0 0 0 .174-.173v-4.61a.174.174 0 0 0-.174-.173ZM7.546 5.681a.934.934 0 1 0 0-1.868.934.934 0 0 0 0 1.868Z"
      fill="currentColor"
    />
  </Svg>
);

export default SvgInfoIcon;

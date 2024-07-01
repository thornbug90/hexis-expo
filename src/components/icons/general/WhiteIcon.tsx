import * as React from "react";
import Svg, { SvgProps, Circle, Path } from "react-native-svg";

const WhiteIcon = (props: SvgProps) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width="4"
    height="5"
    viewBox="0 0 4 5"
    fill="none"
    {...props}
  >
    <Circle cx="2" cy="2.5" r="2" fill="white" />
  </Svg>
);

export default WhiteIcon;

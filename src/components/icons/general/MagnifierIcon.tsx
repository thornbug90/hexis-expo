import * as React from "react";
import Svg, { SvgProps, Path } from "react-native-svg";

const SvgMagnifierIcon = (props: SvgProps) => (
  <Svg
    viewBox="0 0 500 500"
    fill="#fff"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Path d="M484.1,454.796l-110.5-110.6c29.8-36.3,47.6-82.8,47.6-133.4c0-116.3-94.3-210.6-210.6-210.6S0,94.496,0,210.796s94.3,210.6,210.6,210.6c50.8,0,97.4-18,133.8-48l110.5,110.5c12.9,11.8,25,4.2,29.2,0C492.5,475.596,492.5,463.096,484.1,454.796zM41.1,210.796c0-93.6,75.9-169.5,169.5-169.5s169.6,75.9,169.6,169.5s-75.9,169.5-169.5,169.5S41.1,304.396,41.1,210.796z" />
  </Svg>
);

export default SvgMagnifierIcon;

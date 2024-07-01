import * as React from "react";
import Svg, { SvgProps, Circle, Path } from "react-native-svg";

const SvgBlockedIcon = (props: SvgProps) => (
  <Svg width={72} height={72} fill="none" {...props}>
    <Circle cx={36} cy={36} r={33.5} stroke="#E73D5B" strokeWidth={5} />
    <Path
      stroke="#E73D5B"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={5}
      d="M58.981 13.519 13.02 59.481"
    />
  </Svg>
);

export default SvgBlockedIcon;

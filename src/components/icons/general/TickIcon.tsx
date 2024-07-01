import * as React from "react";
import Svg, { SvgProps, Path } from "react-native-svg";

const TickIcon = (props: SvgProps) => (
  <Svg
    width={19}
    height={14}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Path
      d="M17.172 1.89 6.453 12.61l-5.36-5.36"
      stroke="#F9F9F9"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default TickIcon;

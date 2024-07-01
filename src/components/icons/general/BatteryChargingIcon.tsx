import * as React from "react";
import Svg, { SvgProps, Path } from "react-native-svg";

const BatterChargingVertical = ({
  width = 24,
  height = 24,
  color = "#359CEF",
  ...props
}: SvgProps) => (
  <Svg
    width={width}
    height={height}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Path
      d="M8.893 1.714h6M17.143 4.152h-10.5c-1.14 0-2.063.923-2.063 2.062v14.25c0 1.14.924 2.063 2.063 2.063h10.5c1.139 0 2.062-.924 2.062-2.063V6.214c0-1.139-.923-2.062-2.062-2.062Z"
      stroke={color}
      strokeWidth={1.125}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="m11.893 17.09 1.5-3.75h-3l1.5-3.75"
      stroke={color}
      strokeWidth={1.125}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default BatterChargingVertical;

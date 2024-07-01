import * as React from "react";
import Svg, { SvgProps, Circle } from "react-native-svg";

const SvgLoggedMealIcon = (props: SvgProps) => (
  <Svg
    width={23}
    height={11}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Circle
      cx={5.936}
      cy={5.563}
      r={4.434}
      fill="#00A499"
      stroke="#00A499"
      strokeWidth={1.579}
    />
    <Circle
      cx={11.669}
      cy={5.563}
      r={4.434}
      fill="#FF9301"
      stroke="#FF9301"
      strokeWidth={1.579}
    />
    <Circle
      cx={17.402}
      cy={5.563}
      r={4.434}
      fill="#E73D5B"
      stroke="#E73D5B"
      strokeWidth={1.579}
    />
  </Svg>
);

export default SvgLoggedMealIcon;

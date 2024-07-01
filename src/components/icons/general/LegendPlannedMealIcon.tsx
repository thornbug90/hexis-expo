import * as React from "react";
import Svg, { SvgProps, Circle } from "react-native-svg";

const SvgPlannedMealIcon = (props: SvgProps) => (
  <Svg
    width={23}
    height={11}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Circle
      cx={17.113}
      cy={5.493}
      r={4.447}
      transform="rotate(180 17.113 5.493)"
      fill="#18152D"
      stroke="#00A499"
      strokeWidth={1.414}
    />
    <Circle
      cx={11.518}
      cy={5.493}
      r={4.447}
      transform="rotate(180 11.518 5.493)"
      fill="#18152D"
      stroke="#FF9301"
      strokeWidth={1.414}
    />
    <Circle
      cx={5.926}
      cy={5.493}
      r={4.447}
      transform="rotate(180 5.926 5.493)"
      fill="#18152D"
      stroke="#E73D5B"
      strokeWidth={1.414}
    />
  </Svg>
);

export default SvgPlannedMealIcon;

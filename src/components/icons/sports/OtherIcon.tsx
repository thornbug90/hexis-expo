import * as React from "react";
import Svg, { SvgProps, Path } from "react-native-svg";

const OtherIcon = ({
  color = "#F9F9F9",
  width = 34,
  height = 30,
  ...props
}: SvgProps) => (
  <Svg width={width} height={height} fill="none" viewBox="0 0 44 40" {...props}>
    <Path
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={4.269}
      d="M41.42 20.076h-8.537l-6.404 17.076L17.941 3l-6.403 17.076H3"
    />
  </Svg>
);

export default OtherIcon;

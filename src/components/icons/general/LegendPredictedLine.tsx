import * as React from "react";
import Svg, { SvgProps, Path } from "react-native-svg";

const SvgPredictedLineIcon = (props: SvgProps) => (
  <Svg
    width={14}
    height={2}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Path
      d="M1.515 1.354H12.83"
      stroke="#F9F9F9"
      strokeWidth={1.131}
      strokeLinecap="round"
      strokeDasharray="1.89 1.89"
    />
  </Svg>
);

export default SvgPredictedLineIcon;

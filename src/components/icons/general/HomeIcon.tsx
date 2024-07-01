import * as React from "react";
import Svg, { SvgProps, Path } from "react-native-svg";

const SvgHomeIcon = (props: SvgProps) => (
  <Svg
    viewBox="0 0 43 46"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Path
      d="M38.217 26.494v18.457H4.722V26.494M1 21.47v-1.861L21.47 1l20.47 18.609v1.86M28.382 36.678V26.494H14.557v10.183"
      stroke="currentColor"
      strokeWidth={1.726}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default SvgHomeIcon;

import * as React from "react";
import Svg, { SvgProps, Path } from "react-native-svg";

const SvgClockIcon = (props: SvgProps) => (
  <Svg
    viewBox="0 0 21 21"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Path
      d="M19.286 11.168c0 4.676-3.953 8.5-8.873 8.5-4.919 0-8.872-3.824-8.872-8.5s3.953-8.5 8.872-8.5c4.92 0 8.873 3.824 8.873 8.5Z"
      stroke="currentColor"
      strokeMiterlimit={10}
    />
    <Path
      d="m10.414 11.168 4.166-4M7.29 1.168h6.248"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default SvgClockIcon;

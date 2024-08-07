import * as React from "react";
import Svg, { SvgProps, Path } from "react-native-svg";

const SvgMoonIcon = (props: SvgProps) => (
  <Svg
    viewBox="0 0 50 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Path
      d="M2 22.068c.305-8.546 3.711-15.37 10.571-20.457.163-.121.335-.23.499-.35a.896.896 0 0 1 1.4 1.1c-.417 1.131-.87 2.254-1.182 3.417a24.212 24.212 0 0 0 .789 14.995 24.646 24.646 0 0 0 9.504 11.743c7.543 4.916 15.593 5.57 23.981 2.254.12-.047.246-.15.358-.137.294-.004.585.062.849.192a.625.625 0 0 1 .229.43.615.615 0 0 1-.153.46c-.21.323-.428.642-.662.948a25.484 25.484 0 0 1-11.922 8.829 25.904 25.904 0 0 1-14.9.758 25.596 25.596 0 0 1-12.783-7.571 24.95 24.95 0 0 1-6.299-13.313c-.152-1.14-.195-2.293-.279-3.298Z"
      stroke="currentColor"
      strokeWidth={2}
      strokeMiterlimit={10}
    />
  </Svg>
);

export default SvgMoonIcon;

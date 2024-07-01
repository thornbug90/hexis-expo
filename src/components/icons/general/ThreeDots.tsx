import * as React from "react";
import Svg, { SvgProps, Path } from "react-native-svg";

const SvgThreeDots = (props: SvgProps) => (
  <Svg
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Path
      d="M16 17.5C16.8284 17.5 17.5 16.8284 17.5 16C17.5 15.1716 16.8284 14.5 16 14.5C15.1716 14.5 14.5 15.1716 14.5 16C14.5 16.8284 15.1716 17.5 16 17.5Z"
      fill="#F9F9F9"
    />
    <Path
      d="M24 17.5C24.8284 17.5 25.5 16.8284 25.5 16C25.5 15.1716 24.8284 14.5 24 14.5C23.1716 14.5 22.5 15.1716 22.5 16C22.5 16.8284 23.1716 17.5 24 17.5Z"
      fill="#F9F9F9"
    />
    <Path
      d="M8 17.5C8.82843 17.5 9.5 16.8284 9.5 16C9.5 15.1716 8.82843 14.5 8 14.5C7.17157 14.5 6.5 15.1716 6.5 16C6.5 16.8284 7.17157 17.5 8 17.5Z"
      fill="#F9F9F9"
    />
  </Svg>
);

export default SvgThreeDots;
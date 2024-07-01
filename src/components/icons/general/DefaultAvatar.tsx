import * as React from "react";
import Svg, { SvgProps, Path } from "react-native-svg";

const SvgDefaultAvatar = (props: SvgProps) => (
  <Svg
    viewBox="0 0 65 65"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Path
      d="M32.5 32.5a16.25 16.25 0 1 1 0-32.5 16.25 16.25 0 0 1 0 32.5ZM0 58.5C0 45.5 6.503 39 19.513 39H45.5c13 0 19.5 6.5 19.5 19.5 0 4.332-2.168 6.5-6.5 6.5h-52C2.168 65 0 62.832 0 58.5Z"
      fill="currentColor"
    />
  </Svg>
);

export default SvgDefaultAvatar;

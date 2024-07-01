import * as React from "react";
import Svg, { SvgProps, Path } from "react-native-svg";

const SvgProfileIcon = (props: SvgProps) => (
  <Svg
    viewBox="0 0 44 44"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Path
      d="M22 21.2A10.2 10.2 0 1 1 22 .8a10.2 10.2 0 0 1 0 20.4ZM.8 39.6c0-4.277 1.07-7.337 3.067-9.334C5.866 28.269 8.93 27.2 13.21 27.2H30.8c4.277 0 7.337 1.069 9.334 3.066 1.997 1.997 3.066 5.057 3.066 9.334 0 1.343-.335 2.203-.866 2.734-.53.53-1.391.866-2.734.866H4.4c-1.343 0-2.203-.335-2.734-.866C1.136 41.804.8 40.943.8 39.6Z"
      stroke="currentColor"
      strokeWidth={1.6}
    />
  </Svg>
);

export default SvgProfileIcon;

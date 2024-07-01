import * as React from "react";
import Svg, { SvgProps, Path, G, Defs, Rect, ClipPath } from "react-native-svg";

const WarningIcon = (props: SvgProps) => (
  <Svg
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <G clip-path="url(#clip0_3421_848)">
      <Path
        d="M8 14.5C11.3137 14.5 14 11.8137 14 8.5C14 5.18629 11.3137 2.5 8 2.5C4.68629 2.5 2 5.18629 2 8.5C2 11.8137 4.68629 14.5 8 14.5Z"
        stroke="#E73D5B"
        stroke-miterlimit="10"
      />
      <Path
        d="M8 9V5.5"
        stroke="#E73D5B"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <Path
        d="M8 12C8.41421 12 8.75 11.6642 8.75 11.25C8.75 10.8358 8.41421 10.5 8 10.5C7.58579 10.5 7.25 10.8358 7.25 11.25C7.25 11.6642 7.58579 12 8 12Z"
        fill="#E73D5B"
      />
    </G>
    <Defs>
      <ClipPath id="clip0_3421_848">
        <Rect
          width="16"
          height="16"
          fill="white"
          transform="translate(0 0.5)"
        />
      </ClipPath>
    </Defs>
  </Svg>
);

export default WarningIcon;
